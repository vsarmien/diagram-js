'use strict';

var Collections = require('../../../util/Collections');


function CreateConnectionHandler(canvas, layouter) {
  this._canvas = canvas;
  this._layouter = layouter;
}

CreateConnectionHandler.$inject = [ 'canvas', 'layouter' ];

module.exports = CreateConnectionHandler;



////// api /////////////////////////////////////////

/**
 * Appends a shape to a target shape
 *
 * @param {Object} context
 * @param {djs.element.Base} context.source the source object
 * @param {djs.element.Base} context.target the parent object
 * @param {Point} context.position position of the new element
 */
CreateConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection,
      source = context.source,
      target = context.target,
      parent = context.parent,
      parentIndex = context.parentIndex,
      hints = context.hints;

  if (!source || !target) {
    throw new Error('source and target required');
  }

  if (!parent) {
    throw new Error('parent required');
  }

  connection.source = source;
  Collections.add(source.outgoing, connection);

  connection.target = target;
  Collections.add(target.incoming, connection);

  if (!connection.waypoints) {
    connection.waypoints = this._layouter.layoutConnection(connection, hints);
  }

  // add connection
  this._canvas.addConnection(connection, parent, parentIndex);

  return connection;
};

CreateConnectionHandler.prototype.revert = function(context) {
  var connection = context.connection,
      source = connection.source,
      target = connection.target;

  this._canvas.removeConnection(connection);

  Collections.remove(source.outgoing, connection);
  connection.source = null;

  Collections.remove(target.incoming, connection);
  connection.target = null;
};