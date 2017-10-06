'use strict';

var Collections = require('../../../util/Collections');


/**
 * A handler that implements reversible deletion of Connections.
 *
 */
function DeleteConnectionHandler(canvas, modeling) {
  this._canvas = canvas;
  this._modeling = modeling;
}

DeleteConnectionHandler.$inject = [ 'canvas', 'modeling' ];

module.exports = DeleteConnectionHandler;


DeleteConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection,
      parent = connection.parent,
      source = connection.source,
      target = connection.target;

  context.parent = parent;
  context.parentIndex = Collections.indexOf(parent.children, connection);

  context.source = source;
  context.target = target;

  Collections.remove(source.outgoing, connection);
  connection.source = null;

  Collections.remove(target.incoming, connection);
  connection.target = null;

  this._canvas.removeConnection(connection);

  return connection;
};

/**
 * Command revert implementation.
 */
DeleteConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection,
      parent = context.parent,
      parentIndex = context.parentIndex,
      source = context.source,
      target = context.target;

  Collections.add(source.outgoing, connection);
  connection.source = source;

  Collections.add(target.incoming, connection);
  connection.target = target;

  // restore previous location in old parent
  Collections.add(parent.children, connection, parentIndex);

  this._canvas.addConnection(connection, parent);

  return connection;
};
