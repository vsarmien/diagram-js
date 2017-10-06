'use strict';

var Model = require('../../../lib/model');

var assign = require('lodash/object/assign');


/**
 * A factory for diagram-js shapes that performs
 * a shallow wiring of element relationships.
 */
function ElementFactory() {
  this._uid = 12;
}

module.exports = ElementFactory;


ElementFactory.prototype.createRoot = function(attrs) {
  return this.create('root', attrs);
};

ElementFactory.prototype.createLabel = function(attrs) {
  return this.create('label', attrs);
};

ElementFactory.prototype.createShape = function(attrs) {
  return this.create('shape', attrs);
};

ElementFactory.prototype.createConnection = function(attrs) {
  return this.create('connection', attrs);
};

/**
 * Create a model element with the given type and
 * a number of pre-set attributes.
 *
 * @param  {String} type
 * @param  {Object} attrs
 * @return {djs.model.Base} the newly created model instance
 */
ElementFactory.prototype.create = function(type, attrs) {

  var el = Model.create(type, assign({
    id: type + '_' + (this._uid++)
  }, attrs || {}));

  // shallow wire relationships

  if (el.source) {
    el.source.outgoing.push(el);
  }

  if (el.target) {
    el.target.incoming.push(el);
  }

  if (el.label) {
    el.label.labelTarget = el;
  }

  if (el.host) {
    el.host.attachers.push(el);
  }

  return el;
};