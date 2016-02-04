'use strict';

/**
 * A tool base class.
 *
 * Sub classes must provide a configuration with
 * { id, [prefix], [cursor] }.
 *
 * They may provide an additional method
 * {@link Tool#activatesOnKey} that decides whether
 * a certain keyboard input should activate the tool.
 *
 * @param {EventBus} eventBus
 * @param {Object} config
 * @param {String} config.id
 * @param {String} [config.prefix] defaults to config.id
 */
function Tool(eventBus, config) {

  if (!config || !config.prefix) {
    throw new Error('must provide config { prefix }');
  }

  this._config = config;


  // initialization

  var self = this;

  eventBus.on('toolManager.init', function(event) {
    var toolManager = event.toolManager;

    toolManager.registerTool(self, config);
  });
}

module.exports = Tool;

/**
 * Does the tool activate for the given key event?
 *
 * @param {KeyEvent} keyEvent
 *
 * @return {Boolean}
 */
Tool.prototype.activatesOnKey = function(keyEvent) {
  return false;
};


/**
 * Get the tools configuration
 *
 * @return {Object} configuration
 */
Tool.prototype.getConfig = function() {
  return this._config;
};