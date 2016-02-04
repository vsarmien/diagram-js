'use strict';

var find = require('lodash/collection/find');

var Cursor = require('../../util/Cursor');


/**
 * The tool manager acts as middle-man between the available tool's
 * and interested parties, i.e. the {@link Palette}.
 *
 * It takes care of keyboard activation of tools and maintains
 * the currently active tool.
 *
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {KeyBoard} keyboard
 */
function ToolManager(eventBus, dragging, keyboard) {

  this._eventBus = eventBus;
  this._dragging = dragging;
  this._keyboard = keyboard;

  this._tools = {};

  this._active = null;


  //////// initialization ////////////////////////////

  var self = this;

  eventBus.on('drag.init', function(event) {

    var context = dragging.context();

    var tool = self._findTool({ prefix: context.prefix }),
        cursor = getCursor(tool);

    if (cursor) {
      Cursor.set(cursor);
    }

    if (tool) {
      self.setActive(getPrefix(tool));
    }
  });

  eventBus.on('drag.cleanup', function(event) {

    var context = dragging.context();

    var tool = self._findTool({ prefix: context.prefix }),
        cursor = getCursor(tool);

    if (cursor) {
      Cursor.unset();
    }

    if (tool) {
      self.setActive(null);
    }
  });

  // intercept keyboard events and make sure activate
  // the tool with
  eventBus.on('keyboard.init', function() {

    keyboard.addListener('keyup', function(key, event) {

      var activeTool = self._findTool({ keyEvent: event }),
          cursor = getCursor(activeTool);

      if (cursor) {
        Cursor.unset();
      }
    });

    keyboard.addListener('keydown', function(key, event) {

      var activeTool = self._findTool({ keyEvent: event }),
          cursor = getCursor(activeTool);

      if (cursor) {
        Cursor.set(cursor);
      }
    });
  });


  //////// configuration hook ///////////////////////////

  // emit a toolManager.init event on diagram
  // initialization that allows interested parties
  // to hook into the tool manager, i.e. to register
  // themselves as tools
  eventBus.on('diagram.init', function() {
    self._init();
  });
}

ToolManager.$inject = [ 'eventBus', 'dragging', 'keyboard' ];

module.exports = ToolManager;


/**
 * Initialize initialize and invite interested parties
 * too hook up.
 */
ToolManager.prototype._init = function() {
  this._eventBus.fire('toolManager.init', { toolManager: this });
};


/**
 * Register a tool instance with a given prefix.
 *
 * @param {Object} tool
 * @param {Object} options
 * @param {Object} options.prefix
 * @param {Object} [options.cursor]
 */
ToolManager.prototype.registerTool = function(tool, options) {
  var tools = this._tools;

  var prefix = options.prefix;

  if (!tool || !options || !options.prefix) {
    throw new Error('must provide tool, options.prefix');
  }

  // make sure we do not double bind a tool by prefix
  this._ensureUnbound(prefix);

  // register tool
  tools[prefix] = tool;
};


ToolManager.prototype.isActive = function(tool) {
  return this._active === tool;
};


ToolManager.prototype.getTools = function(tool) {
  return this._tools;
};


ToolManager.prototype.setActive = function(tool) {

  if (this._active !== tool) {
    this._eventBus.fire('toolManager.changed', { activeTool: tool });
  }

  this._active = tool;
};


ToolManager.prototype._ensureUnbound = function(prefix) {

  var bound = this._findTool(function(tool, key) {
    return key.indexOf(prefix) === 0;
  });

  if (bound) {
    throw new Error('prefix already bound to existing tool');
  }
};

ToolManager.prototype._findTool = function(filter) {

  var filterFn,
      keyEvent,
      prefix;

  if (typeof filter === 'function') {
    filterFn = filter;
  } else {

    keyEvent = filter.keyEvent,
    prefix = filter.prefix;

    if (keyEvent) {
      filterFn = function(tool) {
        return tool.activatesOnKey && tool.activatesOnKey(keyEvent);
      };
    } else
    if (prefix) {
      filterFn = function(tool, key) {
        return prefix.indexOf(key) === 0;
      };
    }
  }

  if (filterFn) {
    return find(this._tools, filterFn);
  }
};


////////// utilities /////////////////////////////

function getCursor(tool) {
  var config = tool && tool.getConfig && tool.getConfig();
  return config && config.cursor;
}

function getPrefix(tool) {
  var config = tool && tool.getConfig && tool.getConfig();
  return config && config.prefix;
}