'use strict';

var assign = require('lodash/object/assign'),
    inherits = require('inherits');


/**
 * @namespace djs.model
 */

/**
 * @memberOf djs.model
 */

/**
 * The basic graphical representation
 *
 * @class
 *
 * @abstract
 */
function Base(attrs) {

  assign(this, attrs || {});

  /**
   * The object that backs up the shape
   *
   * @name Base#businessObject
   * @type Object
   */
  defineProperty(this, 'businessObject', {
    writable: true
  });

  /**
   * The parent shape
   *
   * @name Base#parent
   * @type Shape
   */
  defineProperty(this, 'parent', {
    writable: true
  });

  /**
   * @name Base#label
   * @type Label
   */
  defineProperty(this, 'label', {
    writable: true
  });

  /**
   * The list of outgoing connections
   *
   * @name Base#outgoing
   * @type Array<Connection>
   */
  defineProperty(this, 'outgoing', {
    value: this.outgoing || []
  });

  /**
   * The list of incoming connections
   *
   * @name Base#incoming
   * @type Array<Connection>
   */
  defineProperty(this, 'incoming', {
    value: this.incoming || []
  });
}


/**
 * A graphical object
 *
 * @class
 * @constructor
 *
 * @extends Base
 */
function Shape(attrs) {
  Base.call(this, attrs);

  /**
   * The list of children
   *
   * @name Shape#children
   * @type Array<Base>
   */
  defineProperty(this, 'children', {
    enumerable: true,
    value: this.children || []
  });

  /**
   * @name Shape#host
   * @type Shape
   */
  defineProperty(this, 'host', {
    enumerable: false,
    writable: true
  });

  /**
   * @name Shape#attachers
   * @type Shape
   */
  defineProperty(this, 'attachers', {
    value: this.attachers || []
  });
}

inherits(Shape, Base);


/**
 * A root graphical object
 *
 * @class
 * @constructor
 *
 * @extends Shape
 */
function Root(attrs) {
  Shape.call(this, attrs);
}

inherits(Root, Shape);


/**
 * A label for an element
 *
 * @class
 * @constructor
 *
 * @extends Shape
 */
function Label(attrs) {
  Shape.call(this, attrs);

  /**
   * The labeled element
   *
   * @name Label#labelTarget
   * @type Base
   */
  defineProperty(this, 'labelTarget', {
    writable: true
  });
}

inherits(Label, Shape);


/**
 * A connection between two elements
 *
 * @class
 * @constructor
 *
 * @extends Base
 */
function Connection(attrs) {
  Base.call(this, attrs);

  /**
   * The element this connection originates from
   *
   * @name Connection#source
   * @type Base
   */
  defineProperty(this, 'source', {
    writable: true
  });

  /**
   * The element this connection points to
   *
   * @name Connection#target
   * @type Base
   */
  defineProperty(this, 'target', {
    writable: true
  });
}

inherits(Connection, Base);


var TYPES = {
  connection: Connection,
  shape: Shape,
  label: Label,
  root: Root
};

/**
 * Creates a new model element of the specified type
 *
 * @method create
 *
 * @example
 *
 * var shape1 = Model.create('shape', { x: 10, y: 10, width: 100, height: 100 });
 * var shape2 = Model.create('shape', { x: 210, y: 210, width: 100, height: 100 });
 *
 * var connection = Model.create('connection', { waypoints: [ { x: 110, y: 55 }, {x: 210, y: 55 } ] });
 *
 * @param  {String} type lower-cased model name
 * @param  {Object} attrs attributes to initialize the new model instance with
 *
 * @return {Base} the new model instance
 */
function create(type, attrs) {
  var Type = TYPES[type];
  if (!Type) {
    throw new Error('unknown type: <' + type + '>');
  }

  return new Type(attrs);
}

module.exports = {
  Base: Base,
  Root: Root,
  Shape: Shape,
  Connection: Connection,
  Label: Label,
  create: create
};


/////////// helpers ///////////////////////////////

function defineProperty(el, prop, attrs) {
  Object.defineProperty(el, prop, attrs);
}