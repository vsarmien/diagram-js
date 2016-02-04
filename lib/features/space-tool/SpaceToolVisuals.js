'use strict';

var forEach = require('lodash/collection/forEach');


var MARKER_DRAGGING = 'djs-dragging';


/**
 * A plugin that makes shapes draggable / droppable.
 *
 * @param {EventBus} eventBus
 * @param {ElementRegistry} elementRegistry
 * @param {Canvas} canvas
 * @param {Styles} styles
 */

function SpaceToolVisuals(eventBus, elementRegistry, canvas, styles) {

  function getGfx(e) {
    return elementRegistry.getGraphics(e);
  }

  function addDragger(shape, dragGroup) {
    var gfx = getGfx(shape);
    var dragger = gfx.clone();
    var bbox = gfx.getBBox();

    dragger.attr(styles.cls('djs-dragger', [], {
      x: bbox.x,
      y: bbox.y
    }));

    dragGroup.add(dragger);
  }

  function getCrosshairGroup(context) {

    var crosshairGroup = context.crosshairGroup;

    if (!crosshairGroup) {
      var space = canvas.getLayer('space');

      var orientation = {
        x: 'M 0,-10000 L 0,10000',
        y: 'M -10000,0 L 10000,0'
      };

      crosshairGroup = space.group().attr(styles.cls('djs-crosshair-group', [ 'no-events' ]));

      crosshairGroup.path(orientation.x).addClass('djs-crosshair');
      crosshairGroup.path(orientation.y).addClass('djs-crosshair');

      context.crosshairGroup = crosshairGroup;
    }

    return crosshairGroup;
  }

  eventBus.on('space.selection.move', function(event) {
    var crosshairGroup = getCrosshairGroup(event.context);

    crosshairGroup.translate(event.x, event.y);
  });

  eventBus.on('space.selection.cleanup', function(event) {
    var context = event.context,
        crosshairGroup = context.crosshairGroup;

    if (crosshairGroup) {
      crosshairGroup.remove();
    }
  });


  // assign a low priority to this handler
  // to let others modify the move context before
  // we draw things
  eventBus.on('space.move', function(event) {
    /*
      TODO (Ricardo): extend connections while adding space
    */

    var context = event.context,
        line = context.line,
        axis = context.axis,
        dragShapes = context.movingShapes;

    if (!context.initialized) {
      return;
    }

    if (!context.dragGroup) {
      var spaceLayer = canvas.getLayer('space');
      line = spaceLayer.path('M0,0 L0,0').addClass('djs-crosshair');

      context.line  = line;
      var dragGroup = canvas.getDefaultLayer().group().attr(styles.cls('djs-drag-group', [ 'no-events' ]));


      forEach(dragShapes, function(shape) {
        addDragger(shape, dragGroup);
        canvas.addMarker(shape, MARKER_DRAGGING);
      });

      context.dragGroup = dragGroup;
    }

    var orientation = {
      x: 'M' + event.x + ', -10000 L' + event.x + ', 10000',
      y: 'M -10000, ' + event.y + ' L 10000, ' + event.y
    };

    line.attr({
      path: orientation[ axis ],
      display: ''
    });

    var opposite = { x: 'y', y: 'x' };
    var delta = { x: event.dx, y: event.dy };
    delta[ opposite[ context.axis ] ] = 0;

    context.dragGroup.translate(delta.x, delta.y);
  });

  eventBus.on('space.cleanup', function(event) {

    var context = event.context,
        shapes = context.movingShapes,
        line = context.line,
        dragGroup = context.dragGroup;

    // remove dragging marker
    forEach(shapes, function(e) {
      canvas.removeMarker(e, MARKER_DRAGGING);
    });

    if (dragGroup) {
      line.remove();
      dragGroup.remove();
    }
  });
}

SpaceToolVisuals.$inject = [ 'eventBus', 'elementRegistry', 'canvas', 'styles' ];

module.exports = SpaceToolVisuals;
