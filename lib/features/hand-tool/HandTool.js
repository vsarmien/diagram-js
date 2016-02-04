'use strict';

var inherits = require('inherits');

var isPrimaryModifier = require('../../util/Mouse').isPrimaryModifier,
    hasPrimaryModifier = require('../../util/Mouse').hasPrimaryModifier,
    substract = require('../../util/Math').substract;

var Tool = require('../tools/Tool');

var HIGH_PRIORITY = 1500;
var HAND_CURSOR = 'grab';


function HandTool(eventBus, canvas, dragging) {

  Tool.call(this, eventBus, { prefix: 'hand', cursor: HAND_CURSOR });

  this._dragging = dragging;

  eventBus.on('element.mousedown', HIGH_PRIORITY, function(event) {
    if (hasPrimaryModifier(event)) {
      this.activateMove(event.originalEvent);

      return false;
    }
  }, this);


  eventBus.on('hand.move', function(event) {
    event.context.lastMoved = getLength({ x: event.dx, y: event.dy }) ? now() : null;
  });

  eventBus.on('hand.end', function(event) {
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return false;
    }

    var lastMoved = event.context.lastMoved,
        autoActivate = lastMoved && (now() - lastMoved) < 500;

    eventBus.once('hand.ended', function() {
      this.activateMove(event.originalEvent, autoActivate, true);
    }, this);

  }, this);

  eventBus.on('hand.move.start', function(event) {
    var context = event.context;

    context.start = { x: event.x, y: event.y };
  });

  eventBus.on('hand.move.move', function(event) {
    var context = event.context,
        start = context.start,
        delta = context.delta;

    var position = { x: event.x, y: event.y },
        scale = canvas.viewbox().scale;

    var lastPosition = context.last || start;

    delta = substract(position, lastPosition);

    canvas.scroll({
      dx: delta.x * scale,
      dy: delta.y * scale
    });

    context.last = position;
  });

  eventBus.on('hand.move.end', function(event) {
    var context = event.context,
        reactivate = context.reactivate;

    // Don't reactivate if the user is using the keyboard keybinding
    if (!hasPrimaryModifier(event) && reactivate) {

      eventBus.once('hand.move.ended', function(event) {
        this.activateHand(event.originalEvent, true, true);
      }, this);

    }

    return false;
  }, this);

}

inherits(HandTool, Tool);

HandTool.$inject = [
  'eventBus',
  'canvas',
  'dragging'
];

module.exports = HandTool;

HandTool.prototype.activatesOnKey = function(keyEvent) {
  return isPrimaryModifier(keyEvent);
};

HandTool.prototype.activateMove = function(event, autoActivate, reactivate) {
  this._dragging.init(event, 'hand.move', {
    autoActivate: autoActivate,
    cursor: HAND_CURSOR,
    data: {
      context: {
        reactivate: reactivate
      }
    }
  });
};

HandTool.prototype.activateHand = function(event, autoActivate, reactivate) {
  this._dragging.init(event, 'hand', {
    trapClick: false,
    autoActivate: autoActivate,
    cursor: HAND_CURSOR,
    data: {
      context: {
        reactivate: reactivate
      }
    }
  });
};

HandTool.prototype.toggle = function(event) {
  if (this.isActive()) {
    this._dragging.cancel();
  } else {
    this.activateHand(event, true);
  }
};

HandTool.prototype.isActive = function() {
  var context = this._dragging.context();

  return context && /^hand/.test(context.prefix);
};


function now() {
  return new Date().getTime();
}


function getLength(point) {
  return Math.sqrt(Math.pow(point.x, 2) + Math.pow(point.y, 2));
}