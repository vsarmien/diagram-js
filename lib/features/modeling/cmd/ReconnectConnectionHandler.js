'use strict';

var isArray = require('lodash/lang/isArray');

var Collections = require('../../../util/Collections');

/**
 * Reconnect connection handler
 */
function ReconnectConnectionHandler() { }

ReconnectConnectionHandler.$inject = [ ];

module.exports = ReconnectConnectionHandler;

ReconnectConnectionHandler.prototype.execute = function(context) {

  var newSource = context.newSource,
      newTarget = context.newTarget,
      connection = context.connection,
      dockingOrPoints = context.dockingOrPoints,
      oldWaypoints = connection.waypoints,
      newWaypoints;

  if (!newSource && !newTarget) {
    throw new Error('newSource or newTarget are required');
  }

  if (newSource && newTarget) {
    throw new Error('must specify either newSource or newTarget');
  }

  context.oldWaypoints = oldWaypoints;

  if (isArray(dockingOrPoints)) {
    newWaypoints = dockingOrPoints;
  } else {
    newWaypoints = oldWaypoints.slice();

    newWaypoints.splice(newSource ? 0 : -1, 1, dockingOrPoints);
  }

  if (newSource) {
    Collections.remove(connection.source.outgoing, connection);
    context.oldSource = connection.source;

    Collections.add(newSource.outgoing, connection);
    connection.source = newSource;
  }

  if (newTarget) {
    Collections.remove(connection.target.incoming, connection);
    context.oldTarget = connection.target;

    Collections.add(newTarget.incoming, connection);
    connection.target = newTarget;
  }

  connection.waypoints = newWaypoints;

  return connection;
};

ReconnectConnectionHandler.prototype.revert = function(context) {

  var newSource = context.newSource,
      oldSource = context.oldSource,
      newTarget = context.newTarget,
      oldTarget = context.oldTarget,
      connection = context.connection;

  if (newSource) {
    Collections.remove(newSource.outgoing, connection);
    Collections.add(oldSource.outgoing, connection);

    connection.source = context.oldSource;
  }

  if (newTarget) {
    Collections.remove(newTarget.incoming, connection);
    Collections.add(oldTarget.incoming, connection);

    connection.target = context.oldTarget;
  }

  connection.waypoints = context.oldWaypoints;

  return connection;
};