'use strict';

var LOW_PRIORITY = 740;

var svgAppend = require('tiny-svg/lib/append'),
    svgAttr = require('tiny-svg/lib/attr'),
    svgClasses = require('tiny-svg/lib/classes'),
    svgCreate = require('tiny-svg/lib/create'),
    svgRemove = require('tiny-svg/lib/remove'),
    svgClear = require('tiny-svg/lib/clear');


/**
 * Shows a connection preview during element creation.
 *
 * @param {didi.Injector} injector
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementFactory} elementFactory
 */
function CreateConnectPreview(injector, eventBus, canvas, graphicsFactory, elementFactory) {

  // optional components

  var connectionDocking = injector.get('connectionDocking', false);
  var layouter = injector.get('layouter', false);


  // visual helpers

  function createConnectVisual() {

    var visual = svgCreate('g');
    svgAttr(visual, {
      'pointer-events': 'none'
    });

    svgClasses(visual).add('djs-dragger');

    svgAppend(canvas.getDefaultLayer(), visual);

    return visual;
  }

  // move integration

  eventBus.on('create.move', LOW_PRIORITY, function(event) {

    var context = event.context,
        source = context.source,
        shape = context.shape,
        connectVisual = context.connectVisual,
        canExecute = context.canExecute,
        connect = canExecute && canExecute.connect,
        getConnection = context.getConnection,
        connection;


    if (!getConnection) {
      getConnection = context.getConnection = Cacher(function(attrs) {
        return elementFactory.create('connection', attrs);
      });
    }

    if (!connectVisual) {
      connectVisual = context.connectVisual = createConnectVisual();
    }

    svgClear(connectVisual);

    if (connect) {
      connection = getConnection(connectionAttrs(connect));

      // monkey patch shape position for intersection to work
      shape.x = Math.round(event.x - shape.width / 2);
      shape.y = Math.round(event.y - shape.height / 2);

      if (layouter) {
        connection.waypoints = [];

        connection.waypoints = layouter.layoutConnection(connection, {
          source: source,
          target: shape
        });
      } else {
        connection.waypoints = [
          { x: source.x + source.width / 2, y: source.y + source.height / 2 },
          { x: event.x, y: event.y }
        ];
      }

      if (connectionDocking) {
        connection.waypoints = connectionDocking.getCroppedWaypoints(connection, source, shape);
      }

      graphicsFactory.drawConnection(connectVisual, connection);
    }
  });


  eventBus.on('create.cleanup', function(event) {
    var context = event.context;

    if (context.connectVisual) {
      svgRemove(context.connectVisual);
    }
  });

}

CreateConnectPreview.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'graphicsFactory',
  'elementFactory'
];

module.exports = CreateConnectPreview;


//////// helpers //////////////

function connectionAttrs(connect) {

  if (typeof connect === 'boolean') {
    return {};
  } else {
    return connect;
  }
}


function Cacher(createFn) {

  var entries = {};

  return function(attrs) {

    var key = JSON.stringify(attrs);

    var e = entries[key];

    if (!e) {
      e = entries[key] = createFn(attrs);
    }

    return e;
  };
}