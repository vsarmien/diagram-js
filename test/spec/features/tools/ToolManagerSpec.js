'use strict';

require('../../../TestHelper');

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;
var createKeyEvent = require('../../../util/KeyEvents').createKeyEvent;

var TestContainer = require('mocha-test-container-support');

var MockTool = require('./MockTool');

/* global bootstrapDiagram, inject */


var toolsModule = require('../../../../lib/features/tools'),
    handToolModule = require('../../../../lib/features/hand-tool'),
    keyboardModule = require('../../../../lib/features/keyboard'),
    draggingModule = require('../../../../lib/features/dragging');

var Cursor = require('../../../../lib/util/Cursor');


describe('features/tools - tool manager', function() {

  describe('basics', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        toolsModule,
        keyboardModule
      ]
    }));


    it('should register a tool', inject(function(toolManager) {

      // when
      toolManager.registerTool({}, { prefix: 'tool' });

      // then
      expect(getTools(toolManager)).to.have.length(1);
    }));


    it('should throw error when double registering for prefix', inject(function(toolManager) {

      // given
      toolManager.registerTool({}, { prefix: 'tool' });

      // when
      function doubleRegister() {
        toolManager.registerTool({}, { prefix: 'tool' });
      }

      // then
      expect(doubleRegister).to.throw('prefix already bound to existing tool');
    }));


    it('should auto-wire a tool', inject(function(eventBus, toolManager) {

      var tool = new MockTool(eventBus, { prefix: 'mock' });

      // when
      toolManager._init();

      // then
      expect(getTools(toolManager)).to.have.length(1);
    }));

  });


  describe('active tracking', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        toolsModule,
        keyboardModule,
        handToolModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    it('should have hand-tool as active', inject(function(toolManager, handTool) {
      // when
      handTool.activateHand(canvasEvent({ x: 150, y: 150 }));

      expect(toolManager.isActive('hand')).to.be.true;
    }));


    it('should have no active tool', inject(function(toolManager, handTool, dragging) {
      // when
      handTool.activateHand(canvasEvent({ x: 150, y: 150 }));

      dragging.end();

      expect(toolManager.isActive('hand')).to.be.false;
    }));

  });


  describe('cursor handling', function () {

    beforeEach(bootstrapDiagram({
      modules: [
        toolsModule,
        keyboardModule,
        handToolModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var container;

    beforeEach(function() {
      container = TestContainer.get(this);

      Cursor.unset();
    });


    it('should add cursor', inject(function(keyboard, toolManager) {

      // when
      var e = createKeyEvent(container, 17, true);

      keyboard._keydownHandler(e);

      expect(Cursor.has('grab')).to.be.true;
    }));


    it('should remove cursor', inject(function(keyboard, toolManager) {

      // when
      var keydown = createKeyEvent(container, 17, true),
          keyup = createKeyEvent(container, 17, false);

      keyboard._keydownHandler(keydown);

      keyboard._keyupHandler(keyup);

      expect(Cursor.has('grab')).to.be.false;
    }));

  });

});


//////// utilities ///////////////////////////////////////////////

function getTools(toolManager) {
  return Object.keys(toolManager.getTools());
}