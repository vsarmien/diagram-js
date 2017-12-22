module.exports = {
  __depends__: [
    require('../dragging'),
    require('../rules')
  ],
  __init__: [
    'createConnectPreview'
  ],
  create: [ 'type', require('./Create') ],
  createConnectPreview: [ 'type', require('./CreateConnectPreview') ]
};
