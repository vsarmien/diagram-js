'use strict';

var getOriginalEvent = require('./Event').getOriginal;

var isMac = require('./Platform').isMac;

var CTRL_CODE = 17,
    ALT_CODE = 18,
    SHIFT_CODE = 16;

function isPrimaryButton(event) {
  // button === 0 -> left áka primary mouse button
  return !(getOriginalEvent(event) || event).button;
}

module.exports.isPrimaryButton = isPrimaryButton;

module.exports.isMac = isMac;

module.exports.hasPrimaryModifier = function(event) {
  var originalEvent = getOriginalEvent(event) || event;

  if (!isPrimaryButton(event)) {
    return false;
  }

  // Use alt as primary modifier key for mac OS
  if (isMac()) {
    return originalEvent.altKey;
  } else {
    return originalEvent.ctrlKey;
  }
};

module.exports.isPrimaryModifier = function(event) {
  var code = event.keyCode;

  if (isMac()) {
    return code === ALT_CODE;
  } else {
    return code === CTRL_CODE;
  }
};


module.exports.hasSecondaryModifier = function(event) {
  var originalEvent = getOriginalEvent(event) || event;

  return isPrimaryButton(event) && originalEvent.shiftKey;
};

module.exports.isSecondaryModifier = function(event) {
  var code = event.keyCode;

  return code === SHIFT_CODE;
};