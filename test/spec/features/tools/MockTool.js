'use strict';

var inherits = require('inherits');

var Tool = require('../../../../lib/features/tools/Tool');

function MockTool(eventBus, config) {
  Tool.call(this, eventBus, config);
}

inherits(MockTool, Tool);

module.exports = MockTool;