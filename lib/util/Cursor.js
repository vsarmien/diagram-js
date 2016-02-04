'use strict';

var domClasses = require('min-dom/lib/classes');

var CURSOR_CLS_PATTERN = /^djs-cursor-.*$/;

var CURSOR_DATA_ATTR = 'data-djs-cursors',
    COMMA = ',';

var CURSOR_TARGET_NODE = document.body;


function last(collection) {
  return collection && collection[collection.length - 1];
}

function getCursors() {

  var element = CURSOR_TARGET_NODE,
      cursorList = element.getAttribute(CURSOR_DATA_ATTR);

  if (cursorList) {
    return cursorList.split(COMMA);
  } else {
    return [];
  }
}

function setCursors(cursors) {

  var element = CURSOR_TARGET_NODE,
      elementClasses = domClasses(element);

  // remove cursors
  elementClasses.removeMatching(CURSOR_CLS_PATTERN);

  if (cursors.length) {
    element.setAttribute(CURSOR_DATA_ATTR, cursors.join(COMMA));

    // set cursor
    elementClasses.add('djs-cursor-' + last(cursors));
  } else {
    element.removeAttribute(CURSOR_DATA_ATTR);
  }
}

module.exports.set = function(mode) {
  var cursors = getCursors();

  cursors.push(mode);

  setCursors(cursors);
};

module.exports.unset = function() {
  var cursors = getCursors();

  // remove last
  cursors.pop();

  setCursors(cursors);
};

/**
 * Is a specific cursor active?
 *
 * @param  {String}  mode
 * @return {Boolean}
 */
module.exports.has = function(mode) {
  var cursors = getCursors();

  return last(cursors) === mode;
};

/**
 * Clear all cursor related data
 * and reset it to default state.
 */
module.exports.reset = function() {
  setCursors([]);
};