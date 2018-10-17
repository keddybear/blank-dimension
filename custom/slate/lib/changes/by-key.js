'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _node = require('../models/node');

var _node2 = _interopRequireDefault(_node);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Add mark to text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.addMarkByKey = function (change, key, offset, length, mark) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  mark = _mark2.default.create(mark);
  var _options$normalize = options.normalize,
      normalize = _options$normalize === undefined ? true : _options$normalize;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();

  var operations = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the operation, continue on.
    if (ay < bx || by < ax) return;

    // If the leaf already has the mark, continue on.
    if (leaf.marks.has(mark)) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);

    operations.push({
      type: 'add_mark',
      path: path,
      offset: start,
      length: end - start,
      mark: mark
    });
  });

  change.applyOperations(operations);

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert a `fragment` at `index` in a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} index
 * @param {Fragment} fragment
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertFragmentByKey = function (change, key, index, fragment) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize2 = options.normalize,
      normalize = _options$normalize2 === undefined ? true : _options$normalize2;


  fragment.nodes.forEach(function (node, i) {
    change.insertNodeByKey(key, index + i, node);
  });

  if (normalize) {
    change.normalizeNodeByKey(key);
  }
};

/**
 * Insert a `node` at `index` in a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} index
 * @param {Node} node
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertNodeByKey = function (change, key, index, node) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize3 = options.normalize,
      normalize = _options$normalize3 === undefined ? true : _options$normalize3;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);

  change.applyOperation({
    type: 'insert_node',
    path: [].concat(_toConsumableArray(path), [index]),
    node: node
  });

  if (normalize) {
    change.normalizeNodeByKey(key);
  }
};

/**
 * Insert `text` at `offset` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertTextByKey = function (change, key, offset, text, marks) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
  var _options$normalize4 = options.normalize,
      normalize = _options$normalize4 === undefined ? true : _options$normalize4;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  marks = marks || node.getMarksAtIndex(offset);

  change.applyOperation({
    type: 'insert_text',
    path: path,
    offset: offset,
    text: text,
    marks: marks
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Merge a node by `key` with the previous node.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.mergeNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$normalize5 = options.normalize,
      normalize = _options$normalize5 === undefined ? true : _options$normalize5;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var previous = document.getPreviousSibling(key);

  if (!previous) {
    throw new Error('Unable to merge node with key "' + key + '", no previous key.');
  }

  var position = previous.kind == 'text' ? previous.text.length : previous.nodes.size;

  change.applyOperation({
    type: 'merge_node',
    path: path,
    position: position
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Move a node by `key` to a new parent by `newKey` and `index`.
 * `newKey` is the key of the container (it can be the document itself)
 *
 * @param {Change} change
 * @param {String} key
 * @param {String} newKey
 * @param {Number} index
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.moveNodeByKey = function (change, key, newKey, newIndex) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize6 = options.normalize,
      normalize = _options$normalize6 === undefined ? true : _options$normalize6;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var newPath = document.getPath(newKey);

  change.applyOperation({
    type: 'move_node',
    path: path,
    newPath: [].concat(_toConsumableArray(newPath), [newIndex])
  });

  if (normalize) {
    var parent = document.getCommonAncestor(key, newKey);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Remove mark from text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeMarkByKey = function (change, key, offset, length, mark) {
  var options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  mark = _mark2.default.create(mark);
  var _options$normalize7 = options.normalize,
      normalize = _options$normalize7 === undefined ? true : _options$normalize7;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();

  var operations = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the operation, continue on.
    if (ay < bx || by < ax) return;

    // If the leaf already has the mark, continue on.
    if (!leaf.marks.has(mark)) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);

    operations.push({
      type: 'remove_mark',
      path: path,
      offset: start,
      length: end - start,
      mark: mark
    });
  });

  change.applyOperations(operations);

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Remove a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$normalize8 = options.normalize,
      normalize = _options$normalize8 === undefined ? true : _options$normalize8;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);

  change.applyOperation({
    type: 'remove_node',
    path: path,
    node: node
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Remove text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeTextByKey = function (change, key, offset, length) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize9 = options.normalize,
      normalize = _options$normalize9 === undefined ? true : _options$normalize9;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);
  var leaves = node.getLeaves();
  var text = node.text;


  var removals = [];
  var bx = offset;
  var by = offset + length;
  var o = 0;

  leaves.forEach(function (leaf) {
    var ax = o;
    var ay = ax + leaf.text.length;

    o += leaf.text.length;

    // If the leaf doesn't overlap with the removal, continue on.
    if (ay < bx || by < ax) return;

    // Otherwise, determine which offset and characters overlap.
    var start = Math.max(ax, bx);
    var end = Math.min(ay, by);
    var string = text.slice(start, end);

    removals.push({
      type: 'remove_text',
      path: path,
      offset: start,
      text: string,
      marks: leaf.marks
    });
  });

  // Apply in reverse order, so subsequent removals don't impact previous ones.
  change.applyOperations(removals.reverse());

  if (normalize) {
    var block = document.getClosestBlock(key);
    change.normalizeNodeByKey(block.key);
  }
};

/**
`* Replace a `node` with another `node`
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|Node} node
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.replaceNodeByKey = function (change, key, newNode) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  newNode = _node2.default.create(newNode);
  var _options$normalize10 = options.normalize,
      normalize = _options$normalize10 === undefined ? true : _options$normalize10;
  var value = change.value;
  var document = value.document;

  var node = document.getNode(key);
  var parent = document.getParent(key);
  var index = parent.nodes.indexOf(node);
  change.removeNodeByKey(key, { normalize: false });
  change.insertNodeByKey(parent.key, index, newNode, options);
  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Set `properties` on mark on text at `offset` and `length` in node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} offset
 * @param {Number} length
 * @param {Mark} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setMarkByKey = function (change, key, offset, length, mark, properties) {
  var options = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : {};

  mark = _mark2.default.create(mark);
  properties = _mark2.default.createProperties(properties);
  var _options$normalize11 = options.normalize,
      normalize = _options$normalize11 === undefined ? true : _options$normalize11;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);

  change.applyOperation({
    type: 'set_mark',
    path: path,
    offset: offset,
    length: length,
    mark: mark,
    properties: properties
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Set `properties` on a node by `key`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setNodeByKey = function (change, key, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _node2.default.createProperties(properties);
  var _options$normalize12 = options.normalize,
      normalize = _options$normalize12 === undefined ? true : _options$normalize12;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);
  var node = document.getNode(key);

  change.applyOperation({
    type: 'set_node',
    path: path,
    node: node,
    properties: properties
  });

  if (normalize) {
    change.normalizeNodeByKey(node.key);
  }
};

/**
 * Split a node by `key` at `position`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} position
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitNodeByKey = function (change, key, position) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize13 = options.normalize,
      normalize = _options$normalize13 === undefined ? true : _options$normalize13,
      _options$target = options.target,
      target = _options$target === undefined ? null : _options$target;
  var value = change.value;
  var document = value.document;

  var path = document.getPath(key);

  change.applyOperation({
    type: 'split_node',
    path: path,
    position: position,
    target: target
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Split a node deeply down the tree by `key`, `textKey` and `textOffset`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Number} position
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitDescendantsByKey = function (change, key, textKey, textOffset) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  if (key == textKey) {
    change.splitNodeByKey(textKey, textOffset, options);
    return;
  }

  var _options$normalize14 = options.normalize,
      normalize = _options$normalize14 === undefined ? true : _options$normalize14;
  var value = change.value;
  var document = value.document;


  var text = document.getNode(textKey);
  var ancestors = document.getAncestors(textKey);
  var nodes = ancestors.skipUntil(function (a) {
    return a.key == key;
  }).reverse().unshift(text);
  var previous = void 0;
  var index = void 0;

  nodes.forEach(function (node) {
    var prevIndex = index == null ? null : index;
    index = previous ? node.nodes.indexOf(previous) + 1 : textOffset;
    previous = node;
    change.splitNodeByKey(node.key, index, { normalize: false, target: prevIndex });
  });

  if (normalize) {
    var parent = document.getParent(key);
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Unwrap content from an inline parent with `properties`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapInlineByKey = function (change, key, properties, options) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var node = document.assertDescendant(key);
  var first = node.getFirstText();
  var last = node.getLastText();
  var range = selection.moveToRangeOf(first, last);
  change.unwrapInlineAtRange(range, properties, options);
};

/**
 * Unwrap content from a block parent with `properties`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapBlockByKey = function (change, key, properties, options) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var node = document.assertDescendant(key);
  var first = node.getFirstText();
  var last = node.getLastText();
  var range = selection.moveToRangeOf(first, last);
  change.unwrapBlockAtRange(range, properties, options);
};

/**
 * Unwrap a single node from its parent.
 *
 * If the node is surrounded with siblings, its parent will be
 * split. If the node is the only child, the parent is removed, and
 * simply replaced by the node itself.  Cannot unwrap a root node.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapNodeByKey = function (change, key) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$normalize15 = options.normalize,
      normalize = _options$normalize15 === undefined ? true : _options$normalize15;
  var value = change.value;
  var document = value.document;

  var parent = document.getParent(key);
  var node = parent.getChild(key);

  var index = parent.nodes.indexOf(node);
  var isFirst = index === 0;
  var isLast = index === parent.nodes.size - 1;

  var parentParent = document.getParent(parent.key);
  var parentIndex = parentParent.nodes.indexOf(parent);

  if (parent.nodes.size === 1) {
    change.moveNodeByKey(key, parentParent.key, parentIndex, { normalize: false });
    change.removeNodeByKey(parent.key, options);
  } else if (isFirst) {
    // Just move the node before its parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex, options);
  } else if (isLast) {
    // Just move the node after its parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex + 1, options);
  } else {
    // Split the parent.
    change.splitNodeByKey(parent.key, index, { normalize: false });

    // Extract the node in between the splitted parent.
    change.moveNodeByKey(key, parentParent.key, parentIndex + 1, { normalize: false });

    if (normalize) {
      change.normalizeNodeByKey(parentParent.key);
    }
  }
};

/**
 * Wrap a node in a block with `properties`.
 *
 * @param {Change} change
 * @param {String} key The node to wrap
 * @param {Block|Object|String} block The wrapping block (its children are discarded)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapBlockByKey = function (change, key, block, options) {
  block = _block2.default.create(block);
  block = block.set('nodes', block.nodes.clear());

  var document = change.value.document;

  var node = document.assertDescendant(key);
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);

  change.insertNodeByKey(parent.key, index, block, { normalize: false });
  change.moveNodeByKey(node.key, block.key, 0, options);
};

/**
 * Wrap a node in an inline with `properties`.
 *
 * @param {Change} change
 * @param {String} key The node to wrap
 * @param {Block|Object|String} inline The wrapping inline (its children are discarded)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapInlineByKey = function (change, key, inline, options) {
  inline = _inline2.default.create(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var document = change.value.document;

  var node = document.assertDescendant(key);
  var parent = document.getParent(node.key);
  var index = parent.nodes.indexOf(node);

  change.insertNodeByKey(parent.key, index, inline, { normalize: false });
  change.moveNodeByKey(node.key, inline.key, 0, options);
};

/**
 * Wrap a node by `key` with `parent`.
 *
 * @param {Change} change
 * @param {String} key
 * @param {Node|Object} parent
 * @param {Object} options
 */

Changes.wrapNodeByKey = function (change, key, parent) {
  parent = _node2.default.create(parent);
  parent = parent.set('nodes', parent.nodes.clear());

  if (parent.kind == 'block') {
    change.wrapBlockByKey(key, parent);
    return;
  }

  if (parent.kind == 'inline') {
    change.wrapInlineByKey(key, parent);
    return;
  }
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL2J5LWtleS5qcyJdLCJuYW1lcyI6WyJDaGFuZ2VzIiwiYWRkTWFya0J5S2V5IiwiY2hhbmdlIiwia2V5Iiwib2Zmc2V0IiwibGVuZ3RoIiwibWFyayIsIm9wdGlvbnMiLCJjcmVhdGUiLCJub3JtYWxpemUiLCJ2YWx1ZSIsImRvY3VtZW50IiwicGF0aCIsImdldFBhdGgiLCJub2RlIiwiZ2V0Tm9kZSIsImxlYXZlcyIsImdldExlYXZlcyIsIm9wZXJhdGlvbnMiLCJieCIsImJ5IiwibyIsImZvckVhY2giLCJsZWFmIiwiYXgiLCJheSIsInRleHQiLCJtYXJrcyIsImhhcyIsInN0YXJ0IiwiTWF0aCIsIm1heCIsImVuZCIsIm1pbiIsInB1c2giLCJ0eXBlIiwiYXBwbHlPcGVyYXRpb25zIiwicGFyZW50IiwiZ2V0UGFyZW50Iiwibm9ybWFsaXplTm9kZUJ5S2V5IiwiaW5zZXJ0RnJhZ21lbnRCeUtleSIsImluZGV4IiwiZnJhZ21lbnQiLCJub2RlcyIsImkiLCJpbnNlcnROb2RlQnlLZXkiLCJhcHBseU9wZXJhdGlvbiIsImluc2VydFRleHRCeUtleSIsImdldE1hcmtzQXRJbmRleCIsIm1lcmdlTm9kZUJ5S2V5IiwicHJldmlvdXMiLCJnZXRQcmV2aW91c1NpYmxpbmciLCJFcnJvciIsInBvc2l0aW9uIiwia2luZCIsInNpemUiLCJtb3ZlTm9kZUJ5S2V5IiwibmV3S2V5IiwibmV3SW5kZXgiLCJuZXdQYXRoIiwiZ2V0Q29tbW9uQW5jZXN0b3IiLCJyZW1vdmVNYXJrQnlLZXkiLCJyZW1vdmVOb2RlQnlLZXkiLCJyZW1vdmVUZXh0QnlLZXkiLCJyZW1vdmFscyIsInN0cmluZyIsInNsaWNlIiwicmV2ZXJzZSIsImJsb2NrIiwiZ2V0Q2xvc2VzdEJsb2NrIiwicmVwbGFjZU5vZGVCeUtleSIsIm5ld05vZGUiLCJpbmRleE9mIiwic2V0TWFya0J5S2V5IiwicHJvcGVydGllcyIsImNyZWF0ZVByb3BlcnRpZXMiLCJzZXROb2RlQnlLZXkiLCJzcGxpdE5vZGVCeUtleSIsInRhcmdldCIsInNwbGl0RGVzY2VuZGFudHNCeUtleSIsInRleHRLZXkiLCJ0ZXh0T2Zmc2V0IiwiYW5jZXN0b3JzIiwiZ2V0QW5jZXN0b3JzIiwic2tpcFVudGlsIiwiYSIsInVuc2hpZnQiLCJwcmV2SW5kZXgiLCJ1bndyYXBJbmxpbmVCeUtleSIsInNlbGVjdGlvbiIsImFzc2VydERlc2NlbmRhbnQiLCJmaXJzdCIsImdldEZpcnN0VGV4dCIsImxhc3QiLCJnZXRMYXN0VGV4dCIsInJhbmdlIiwibW92ZVRvUmFuZ2VPZiIsInVud3JhcElubGluZUF0UmFuZ2UiLCJ1bndyYXBCbG9ja0J5S2V5IiwidW53cmFwQmxvY2tBdFJhbmdlIiwidW53cmFwTm9kZUJ5S2V5IiwiZ2V0Q2hpbGQiLCJpc0ZpcnN0IiwiaXNMYXN0IiwicGFyZW50UGFyZW50IiwicGFyZW50SW5kZXgiLCJ3cmFwQmxvY2tCeUtleSIsInNldCIsImNsZWFyIiwid3JhcElubGluZUJ5S2V5IiwiaW5saW5lIiwid3JhcE5vZGVCeUtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFVBQVUsRUFBaEI7O0FBRUE7Ozs7Ozs7Ozs7OztBQVlBQSxRQUFRQyxZQUFSLEdBQXVCLFVBQUNDLE1BQUQsRUFBU0MsR0FBVCxFQUFjQyxNQUFkLEVBQXNCQyxNQUF0QixFQUE4QkMsSUFBOUIsRUFBcUQ7QUFBQSxNQUFqQkMsT0FBaUIsdUVBQVAsRUFBTzs7QUFDMUVELFNBQU8sZUFBS0UsTUFBTCxDQUFZRixJQUFaLENBQVA7QUFEMEUsMkJBRTdDQyxPQUY2QyxDQUVsRUUsU0FGa0U7QUFBQSxNQUVsRUEsU0FGa0Usc0NBRXRELElBRnNEO0FBQUEsTUFHbEVDLEtBSGtFLEdBR3hEUixNQUh3RCxDQUdsRVEsS0FIa0U7QUFBQSxNQUlsRUMsUUFKa0UsR0FJckRELEtBSnFELENBSWxFQyxRQUprRTs7QUFLMUUsTUFB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TWVyQyxPIiwiZmlsZSI6ImJ5LWtleS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IEJsb2NrIGZyb20gJy4uL21vZGVscy9ibG9jaydcbmltcG9ydCBJbmxpbmUgZnJvbSAnLi4vbW9kZWxzL2lubGluZSdcbmltcG9ydCBNYXJrIGZyb20gJy4uL21vZGVscy9tYXJrJ1xuaW1wb3J0IE5vZGUgZnJvbSAnLi4vbW9kZWxzL25vZGUnXG5cbi8qKlxuICogQ2hhbmdlcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IENoYW5nZXMgPSB7fVxuXG4vKipcbiAqIEFkZCBtYXJrIHRvIHRleHQgYXQgYG9mZnNldGAgYW5kIGBsZW5ndGhgIGluIG5vZGUgYnkgYGtleWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aFxuICogQHBhcmFtIHtNaXhlZH0gbWFya1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmFkZE1hcmtCeUtleSA9IChjaGFuZ2UsIGtleSwgb2Zmc2V0LCBsZW5ndGgsIG1hcmssIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBtYXJrID0gTWFyay5jcmVhdGUobWFyaylcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBwYXRoID0gZG9jdW1lbnQuZ2V0UGF0aChrZXkpXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5nZXROb2RlKGtleSlcbiAgY29uc3QgbGVhdmVzID0gbm9kZS5nZXRMZWF2ZXMoKVxuXG4gIGNvbnN0IG9wZXJhdGlvbnMgPSBbXVxuICBjb25zdCBieCA9IG9mZnNldFxuICBjb25zdCBieSA9IG9mZnNldCArIGxlbmd0aFxuICBsZXQgbyA9IDBcblxuICBsZWF2ZXMuZm9yRWFjaCgobGVhZikgPT4ge1xuICAgIGNvbnN0IGF4ID0gb1xuICAgIGNvbnN0IGF5ID0gYXggKyBsZWFmLnRleHQubGVuZ3RoXG5cbiAgICBvICs9IGxlYWYudGV4dC5sZW5ndGhcblxuICAgIC8vIElmIHRoZSBsZWFmIGRvZXNuJ3Qgb3ZlcmxhcCB3aXRoIHRoZSBvcGVyYXRpb24sIGNvbnRpbnVlIG9uLlxuICAgIGlmIChheSA8IGJ4IHx8IGJ5IDwgYXgpIHJldHVyblxuXG4gICAgLy8gSWYgdGhlIGxlYWYgYWxyZWFkeSBoYXMgdGhlIG1hcmssIGNvbnRpbnVlIG9uLlxuICAgIGlmIChsZWFmLm1hcmtzLmhhcyhtYXJrKSkgcmV0dXJuXG5cbiAgICAvLyBPdGhlcndpc2UsIGRldGVybWluZSB3aGljaCBvZmZzZXQgYW5kIGNoYXJhY3RlcnMgb3ZlcmxhcC5cbiAgICBjb25zdCBzdGFydCA9IE1hdGgubWF4KGF4LCBieClcbiAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihheSwgYnkpXG5cbiAgICBvcGVyYXRpb25zLnB1c2goe1xuICAgICAgdHlwZTogJ2FkZF9tYXJrJyxcbiAgICAgIHBhdGgsXG4gICAgICBvZmZzZXQ6IHN0YXJ0LFxuICAgICAgbGVuZ3RoOiBlbmQgLSBzdGFydCxcbiAgICAgIG1hcmssXG4gICAgfSlcbiAgfSlcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb25zKG9wZXJhdGlvbnMpXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IGEgYGZyYWdtZW50YCBhdCBgaW5kZXhgIGluIGEgbm9kZSBieSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAqIEBwYXJhbSB7RnJhZ21lbnR9IGZyYWdtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuaW5zZXJ0RnJhZ21lbnRCeUtleSA9IChjaGFuZ2UsIGtleSwgaW5kZXgsIGZyYWdtZW50LCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG5cbiAgZnJhZ21lbnQubm9kZXMuZm9yRWFjaCgobm9kZSwgaSkgPT4ge1xuICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkoa2V5LCBpbmRleCArIGksIG5vZGUpXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkoa2V5KVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IGEgYG5vZGVgIGF0IGBpbmRleGAgaW4gYSBub2RlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuaW5zZXJ0Tm9kZUJ5S2V5ID0gKGNoYW5nZSwga2V5LCBpbmRleCwgbm9kZSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ2luc2VydF9ub2RlJyxcbiAgICBwYXRoOiBbLi4ucGF0aCwgaW5kZXhdLFxuICAgIG5vZGUsXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkoa2V5KVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IGB0ZXh0YCBhdCBgb2Zmc2V0YCBpbiBub2RlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gKiBAcGFyYW0ge1NldDxNYXJrPn0gbWFya3MgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmluc2VydFRleHRCeUtleSA9IChjaGFuZ2UsIGtleSwgb2Zmc2V0LCB0ZXh0LCBtYXJrcywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0Tm9kZShrZXkpXG4gIG1hcmtzID0gbWFya3MgfHwgbm9kZS5nZXRNYXJrc0F0SW5kZXgob2Zmc2V0KVxuXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ2luc2VydF90ZXh0JyxcbiAgICBwYXRoLFxuICAgIG9mZnNldCxcbiAgICB0ZXh0LFxuICAgIG1hcmtzLFxuICB9KVxuXG4gIGlmIChub3JtYWxpemUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoa2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlIGEgbm9kZSBieSBga2V5YCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5tZXJnZU5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuICBjb25zdCBwcmV2aW91cyA9IGRvY3VtZW50LmdldFByZXZpb3VzU2libGluZyhrZXkpXG5cbiAgaWYgKCFwcmV2aW91cykge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIG1lcmdlIG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIiwgbm8gcHJldmlvdXMga2V5LmApXG4gIH1cblxuICBjb25zdCBwb3NpdGlvbiA9IHByZXZpb3VzLmtpbmQgPT0gJ3RleHQnID8gcHJldmlvdXMudGV4dC5sZW5ndGggOiBwcmV2aW91cy5ub2Rlcy5zaXplXG5cbiAgY2hhbmdlLmFwcGx5T3BlcmF0aW9uKHtcbiAgICB0eXBlOiAnbWVyZ2Vfbm9kZScsXG4gICAgcGF0aCxcbiAgICBwb3NpdGlvbixcbiAgfSlcblxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KGtleSlcbiAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KHBhcmVudC5rZXkpXG4gIH1cbn1cblxuLyoqXG4gKiBNb3ZlIGEgbm9kZSBieSBga2V5YCB0byBhIG5ldyBwYXJlbnQgYnkgYG5ld0tleWAgYW5kIGBpbmRleGAuXG4gKiBgbmV3S2V5YCBpcyB0aGUga2V5IG9mIHRoZSBjb250YWluZXIgKGl0IGNhbiBiZSB0aGUgZG9jdW1lbnQgaXRzZWxmKVxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7U3RyaW5nfSBuZXdLZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLm1vdmVOb2RlQnlLZXkgPSAoY2hhbmdlLCBrZXksIG5ld0tleSwgbmV3SW5kZXgsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHBhdGggPSBkb2N1bWVudC5nZXRQYXRoKGtleSlcbiAgY29uc3QgbmV3UGF0aCA9IGRvY3VtZW50LmdldFBhdGgobmV3S2V5KVxuXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ21vdmVfbm9kZScsXG4gICAgcGF0aCxcbiAgICBuZXdQYXRoOiBbLi4ubmV3UGF0aCwgbmV3SW5kZXhdLFxuICB9KVxuXG4gIGlmIChub3JtYWxpemUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRDb21tb25BbmNlc3RvcihrZXksIG5ld0tleSlcbiAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KHBhcmVudC5rZXkpXG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgbWFyayBmcm9tIHRleHQgYXQgYG9mZnNldGAgYW5kIGBsZW5ndGhgIGluIG5vZGUgYnkgYGtleWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aFxuICogQHBhcmFtIHtNYXJrfSBtYXJrXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMucmVtb3ZlTWFya0J5S2V5ID0gKGNoYW5nZSwga2V5LCBvZmZzZXQsIGxlbmd0aCwgbWFyaywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIG1hcmsgPSBNYXJrLmNyZWF0ZShtYXJrKVxuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHBhdGggPSBkb2N1bWVudC5nZXRQYXRoKGtleSlcbiAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmdldE5vZGUoa2V5KVxuICBjb25zdCBsZWF2ZXMgPSBub2RlLmdldExlYXZlcygpXG5cbiAgY29uc3Qgb3BlcmF0aW9ucyA9IFtdXG4gIGNvbnN0IGJ4ID0gb2Zmc2V0XG4gIGNvbnN0IGJ5ID0gb2Zmc2V0ICsgbGVuZ3RoXG4gIGxldCBvID0gMFxuXG4gIGxlYXZlcy5mb3JFYWNoKChsZWFmKSA9PiB7XG4gICAgY29uc3QgYXggPSBvXG4gICAgY29uc3QgYXkgPSBheCArIGxlYWYudGV4dC5sZW5ndGhcblxuICAgIG8gKz0gbGVhZi50ZXh0Lmxlbmd0aFxuXG4gICAgLy8gSWYgdGhlIGxlYWYgZG9lc24ndCBvdmVybGFwIHdpdGggdGhlIG9wZXJhdGlvbiwgY29udGludWUgb24uXG4gICAgaWYgKGF5IDwgYnggfHwgYnkgPCBheCkgcmV0dXJuXG5cbiAgICAvLyBJZiB0aGUgbGVhZiBhbHJlYWR5IGhhcyB0aGUgbWFyaywgY29udGludWUgb24uXG4gICAgaWYgKCFsZWFmLm1hcmtzLmhhcyhtYXJrKSkgcmV0dXJuXG5cbiAgICAvLyBPdGhlcndpc2UsIGRldGVybWluZSB3aGljaCBvZmZzZXQgYW5kIGNoYXJhY3RlcnMgb3ZlcmxhcC5cbiAgICBjb25zdCBzdGFydCA9IE1hdGgubWF4KGF4LCBieClcbiAgICBjb25zdCBlbmQgPSBNYXRoLm1pbihheSwgYnkpXG5cbiAgICBvcGVyYXRpb25zLnB1c2goe1xuICAgICAgdHlwZTogJ3JlbW92ZV9tYXJrJyxcbiAgICAgIHBhdGgsXG4gICAgICBvZmZzZXQ6IHN0YXJ0LFxuICAgICAgbGVuZ3RoOiBlbmQgLSBzdGFydCxcbiAgICAgIG1hcmssXG4gICAgfSlcbiAgfSlcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb25zKG9wZXJhdGlvbnMpXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIGEgbm9kZSBieSBga2V5YC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMucmVtb3ZlTm9kZUJ5S2V5ID0gKGNoYW5nZSwga2V5LCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBwYXRoID0gZG9jdW1lbnQuZ2V0UGF0aChrZXkpXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5nZXROb2RlKGtleSlcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb24oe1xuICAgIHR5cGU6ICdyZW1vdmVfbm9kZScsXG4gICAgcGF0aCxcbiAgICBub2RlLFxuICB9KVxuXG4gIGlmIChub3JtYWxpemUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoa2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSB0ZXh0IGF0IGBvZmZzZXRgIGFuZCBgbGVuZ3RoYCBpbiBub2RlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXRcbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGhcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5yZW1vdmVUZXh0QnlLZXkgPSAoY2hhbmdlLCBrZXksIG9mZnNldCwgbGVuZ3RoLCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBwYXRoID0gZG9jdW1lbnQuZ2V0UGF0aChrZXkpXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5nZXROb2RlKGtleSlcbiAgY29uc3QgbGVhdmVzID0gbm9kZS5nZXRMZWF2ZXMoKVxuICBjb25zdCB7IHRleHQgfSA9IG5vZGVcblxuICBjb25zdCByZW1vdmFscyA9IFtdXG4gIGNvbnN0IGJ4ID0gb2Zmc2V0XG4gIGNvbnN0IGJ5ID0gb2Zmc2V0ICsgbGVuZ3RoXG4gIGxldCBvID0gMFxuXG4gIGxlYXZlcy5mb3JFYWNoKChsZWFmKSA9PiB7XG4gICAgY29uc3QgYXggPSBvXG4gICAgY29uc3QgYXkgPSBheCArIGxlYWYudGV4dC5sZW5ndGhcblxuICAgIG8gKz0gbGVhZi50ZXh0Lmxlbmd0aFxuXG4gICAgLy8gSWYgdGhlIGxlYWYgZG9lc24ndCBvdmVybGFwIHdpdGggdGhlIHJlbW92YWwsIGNvbnRpbnVlIG9uLlxuICAgIGlmIChheSA8IGJ4IHx8IGJ5IDwgYXgpIHJldHVyblxuXG4gICAgLy8gT3RoZXJ3aXNlLCBkZXRlcm1pbmUgd2hpY2ggb2Zmc2V0IGFuZCBjaGFyYWN0ZXJzIG92ZXJsYXAuXG4gICAgY29uc3Qgc3RhcnQgPSBNYXRoLm1heChheCwgYngpXG4gICAgY29uc3QgZW5kID0gTWF0aC5taW4oYXksIGJ5KVxuICAgIGNvbnN0IHN0cmluZyA9IHRleHQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICAgIHJlbW92YWxzLnB1c2goe1xuICAgICAgdHlwZTogJ3JlbW92ZV90ZXh0JyxcbiAgICAgIHBhdGgsXG4gICAgICBvZmZzZXQ6IHN0YXJ0LFxuICAgICAgdGV4dDogc3RyaW5nLFxuICAgICAgbWFya3M6IGxlYWYubWFya3MsXG4gICAgfSlcbiAgfSlcblxuICAvLyBBcHBseSBpbiByZXZlcnNlIG9yZGVyLCBzbyBzdWJzZXF1ZW50IHJlbW92YWxzIGRvbid0IGltcGFjdCBwcmV2aW91cyBvbmVzLlxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb25zKHJlbW92YWxzLnJldmVyc2UoKSlcblxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY29uc3QgYmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soa2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkoYmxvY2sua2V5KVxuICB9XG59XG5cbi8qKlxuYCogUmVwbGFjZSBhIGBub2RlYCB3aXRoIGFub3RoZXIgYG5vZGVgXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtPYmplY3R8Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnJlcGxhY2VOb2RlQnlLZXkgPSAoY2hhbmdlLCBrZXksIG5ld05vZGUsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBuZXdOb2RlID0gTm9kZS5jcmVhdGUobmV3Tm9kZSlcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuZ2V0Tm9kZShrZXkpXG4gIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yobm9kZSlcbiAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShrZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHBhcmVudC5rZXksIGluZGV4LCBuZXdOb2RlLCBvcHRpb25zKVxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogU2V0IGBwcm9wZXJ0aWVzYCBvbiBtYXJrIG9uIHRleHQgYXQgYG9mZnNldGAgYW5kIGBsZW5ndGhgIGluIG5vZGUgYnkgYGtleWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFxuICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aFxuICogQHBhcmFtIHtNYXJrfSBtYXJrXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuc2V0TWFya0J5S2V5ID0gKGNoYW5nZSwga2V5LCBvZmZzZXQsIGxlbmd0aCwgbWFyaywgcHJvcGVydGllcywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIG1hcmsgPSBNYXJrLmNyZWF0ZShtYXJrKVxuICBwcm9wZXJ0aWVzID0gTWFyay5jcmVhdGVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgcGF0aCA9IGRvY3VtZW50LmdldFBhdGgoa2V5KVxuXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ3NldF9tYXJrJyxcbiAgICBwYXRoLFxuICAgIG9mZnNldCxcbiAgICBsZW5ndGgsXG4gICAgbWFyayxcbiAgICBwcm9wZXJ0aWVzLFxuICB9KVxuXG4gIGlmIChub3JtYWxpemUpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoa2V5KVxuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIFNldCBgcHJvcGVydGllc2Agb24gYSBub2RlIGJ5IGBrZXlgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gcHJvcGVydGllc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnNldE5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgcHJvcGVydGllcywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIHByb3BlcnRpZXMgPSBOb2RlLmNyZWF0ZVByb3BlcnRpZXMocHJvcGVydGllcylcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBwYXRoID0gZG9jdW1lbnQuZ2V0UGF0aChrZXkpXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5nZXROb2RlKGtleSlcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb24oe1xuICAgIHR5cGU6ICdzZXRfbm9kZScsXG4gICAgcGF0aCxcbiAgICBub2RlLFxuICAgIHByb3BlcnRpZXMsXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkobm9kZS5rZXkpXG4gIH1cbn1cblxuLyoqXG4gKiBTcGxpdCBhIG5vZGUgYnkgYGtleWAgYXQgYHBvc2l0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5zcGxpdE5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgcG9zaXRpb24sIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUsIHRhcmdldCA9IG51bGwgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHBhdGggPSBkb2N1bWVudC5nZXRQYXRoKGtleSlcblxuICBjaGFuZ2UuYXBwbHlPcGVyYXRpb24oe1xuICAgIHR5cGU6ICdzcGxpdF9ub2RlJyxcbiAgICBwYXRoLFxuICAgIHBvc2l0aW9uLFxuICAgIHRhcmdldCxcbiAgfSlcblxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KGtleSlcbiAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KHBhcmVudC5rZXkpXG4gIH1cbn1cblxuLyoqXG4gKiBTcGxpdCBhIG5vZGUgZGVlcGx5IGRvd24gdGhlIHRyZWUgYnkgYGtleWAsIGB0ZXh0S2V5YCBhbmQgYHRleHRPZmZzZXRgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBwb3NpdGlvblxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnNwbGl0RGVzY2VuZGFudHNCeUtleSA9IChjaGFuZ2UsIGtleSwgdGV4dEtleSwgdGV4dE9mZnNldCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGlmIChrZXkgPT0gdGV4dEtleSkge1xuICAgIGNoYW5nZS5zcGxpdE5vZGVCeUtleSh0ZXh0S2V5LCB0ZXh0T2Zmc2V0LCBvcHRpb25zKVxuICAgIHJldHVyblxuICB9XG5cbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuXG4gIGNvbnN0IHRleHQgPSBkb2N1bWVudC5nZXROb2RlKHRleHRLZXkpXG4gIGNvbnN0IGFuY2VzdG9ycyA9IGRvY3VtZW50LmdldEFuY2VzdG9ycyh0ZXh0S2V5KVxuICBjb25zdCBub2RlcyA9IGFuY2VzdG9ycy5za2lwVW50aWwoYSA9PiBhLmtleSA9PSBrZXkpLnJldmVyc2UoKS51bnNoaWZ0KHRleHQpXG4gIGxldCBwcmV2aW91c1xuICBsZXQgaW5kZXhcblxuICBub2Rlcy5mb3JFYWNoKChub2RlKSA9PiB7XG4gICAgY29uc3QgcHJldkluZGV4ID0gaW5kZXggPT0gbnVsbCA/IG51bGwgOiBpbmRleFxuICAgIGluZGV4ID0gcHJldmlvdXMgPyBub2RlLm5vZGVzLmluZGV4T2YocHJldmlvdXMpICsgMSA6IHRleHRPZmZzZXRcbiAgICBwcmV2aW91cyA9IG5vZGVcbiAgICBjaGFuZ2Uuc3BsaXROb2RlQnlLZXkobm9kZS5rZXksIGluZGV4LCB7IG5vcm1hbGl6ZTogZmFsc2UsIHRhcmdldDogcHJldkluZGV4IH0pXG4gIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogVW53cmFwIGNvbnRlbnQgZnJvbSBhbiBpbmxpbmUgcGFyZW50IHdpdGggYHByb3BlcnRpZXNgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ30gcHJvcGVydGllc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnVud3JhcElubGluZUJ5S2V5ID0gKGNoYW5nZSwga2V5LCBwcm9wZXJ0aWVzLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnREZXNjZW5kYW50KGtleSlcbiAgY29uc3QgZmlyc3QgPSBub2RlLmdldEZpcnN0VGV4dCgpXG4gIGNvbnN0IGxhc3QgPSBub2RlLmdldExhc3RUZXh0KClcbiAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24ubW92ZVRvUmFuZ2VPZihmaXJzdCwgbGFzdClcbiAgY2hhbmdlLnVud3JhcElubGluZUF0UmFuZ2UocmFuZ2UsIHByb3BlcnRpZXMsIG9wdGlvbnMpXG59XG5cbi8qKlxuICogVW53cmFwIGNvbnRlbnQgZnJvbSBhIGJsb2NrIHBhcmVudCB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge09iamVjdHxTdHJpbmd9IHByb3BlcnRpZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy51bndyYXBCbG9ja0J5S2V5ID0gKGNoYW5nZSwga2V5LCBwcm9wZXJ0aWVzLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnREZXNjZW5kYW50KGtleSlcbiAgY29uc3QgZmlyc3QgPSBub2RlLmdldEZpcnN0VGV4dCgpXG4gIGNvbnN0IGxhc3QgPSBub2RlLmdldExhc3RUZXh0KClcbiAgY29uc3QgcmFuZ2UgPSBzZWxlY3Rpb24ubW92ZVRvUmFuZ2VPZihmaXJzdCwgbGFzdClcbiAgY2hhbmdlLnVud3JhcEJsb2NrQXRSYW5nZShyYW5nZSwgcHJvcGVydGllcywgb3B0aW9ucylcbn1cblxuLyoqXG4gKiBVbndyYXAgYSBzaW5nbGUgbm9kZSBmcm9tIGl0cyBwYXJlbnQuXG4gKlxuICogSWYgdGhlIG5vZGUgaXMgc3Vycm91bmRlZCB3aXRoIHNpYmxpbmdzLCBpdHMgcGFyZW50IHdpbGwgYmVcbiAqIHNwbGl0LiBJZiB0aGUgbm9kZSBpcyB0aGUgb25seSBjaGlsZCwgdGhlIHBhcmVudCBpcyByZW1vdmVkLCBhbmRcbiAqIHNpbXBseSByZXBsYWNlZCBieSB0aGUgbm9kZSBpdHNlbGYuICBDYW5ub3QgdW53cmFwIGEgcm9vdCBub2RlLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy51bndyYXBOb2RlQnlLZXkgPSAoY2hhbmdlLCBrZXksIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChrZXkpXG4gIGNvbnN0IG5vZGUgPSBwYXJlbnQuZ2V0Q2hpbGQoa2V5KVxuXG4gIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yobm9kZSlcbiAgY29uc3QgaXNGaXJzdCA9IGluZGV4ID09PSAwXG4gIGNvbnN0IGlzTGFzdCA9IGluZGV4ID09PSBwYXJlbnQubm9kZXMuc2l6ZSAtIDFcblxuICBjb25zdCBwYXJlbnRQYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQocGFyZW50LmtleSlcbiAgY29uc3QgcGFyZW50SW5kZXggPSBwYXJlbnRQYXJlbnQubm9kZXMuaW5kZXhPZihwYXJlbnQpXG5cbiAgaWYgKHBhcmVudC5ub2Rlcy5zaXplID09PSAxKSB7XG4gICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoa2V5LCBwYXJlbnRQYXJlbnQua2V5LCBwYXJlbnRJbmRleCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShwYXJlbnQua2V5LCBvcHRpb25zKVxuICB9XG5cbiAgZWxzZSBpZiAoaXNGaXJzdCkge1xuICAgIC8vIEp1c3QgbW92ZSB0aGUgbm9kZSBiZWZvcmUgaXRzIHBhcmVudC5cbiAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShrZXksIHBhcmVudFBhcmVudC5rZXksIHBhcmVudEluZGV4LCBvcHRpb25zKVxuICB9XG5cbiAgZWxzZSBpZiAoaXNMYXN0KSB7XG4gICAgLy8gSnVzdCBtb3ZlIHRoZSBub2RlIGFmdGVyIGl0cyBwYXJlbnQuXG4gICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoa2V5LCBwYXJlbnRQYXJlbnQua2V5LCBwYXJlbnRJbmRleCArIDEsIG9wdGlvbnMpXG4gIH1cblxuICBlbHNlIHtcbiAgICAvLyBTcGxpdCB0aGUgcGFyZW50LlxuICAgIGNoYW5nZS5zcGxpdE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgICAvLyBFeHRyYWN0IHRoZSBub2RlIGluIGJldHdlZW4gdGhlIHNwbGl0dGVkIHBhcmVudC5cbiAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShrZXksIHBhcmVudFBhcmVudC5rZXksIHBhcmVudEluZGV4ICsgMSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KHBhcmVudFBhcmVudC5rZXkpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV3JhcCBhIG5vZGUgaW4gYSBibG9jayB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSBub2RlIHRvIHdyYXBcbiAqIEBwYXJhbSB7QmxvY2t8T2JqZWN0fFN0cmluZ30gYmxvY2sgVGhlIHdyYXBwaW5nIGJsb2NrIChpdHMgY2hpbGRyZW4gYXJlIGRpc2NhcmRlZClcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy53cmFwQmxvY2tCeUtleSA9IChjaGFuZ2UsIGtleSwgYmxvY2ssIG9wdGlvbnMpID0+IHtcbiAgYmxvY2sgPSBCbG9jay5jcmVhdGUoYmxvY2spXG4gIGJsb2NrID0gYmxvY2suc2V0KCdub2RlcycsIGJsb2NrLm5vZGVzLmNsZWFyKCkpXG5cbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gY2hhbmdlLnZhbHVlXG4gIGNvbnN0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnREZXNjZW5kYW50KGtleSlcbiAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KG5vZGUua2V5KVxuICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKG5vZGUpXG5cbiAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCwgYmxvY2ssIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICBjaGFuZ2UubW92ZU5vZGVCeUtleShub2RlLmtleSwgYmxvY2sua2V5LCAwLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIFdyYXAgYSBub2RlIGluIGFuIGlubGluZSB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSBub2RlIHRvIHdyYXBcbiAqIEBwYXJhbSB7QmxvY2t8T2JqZWN0fFN0cmluZ30gaW5saW5lIFRoZSB3cmFwcGluZyBpbmxpbmUgKGl0cyBjaGlsZHJlbiBhcmUgZGlzY2FyZGVkKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLndyYXBJbmxpbmVCeUtleSA9IChjaGFuZ2UsIGtleSwgaW5saW5lLCBvcHRpb25zKSA9PiB7XG4gIGlubGluZSA9IElubGluZS5jcmVhdGUoaW5saW5lKVxuICBpbmxpbmUgPSBpbmxpbmUuc2V0KCdub2RlcycsIGlubGluZS5ub2Rlcy5jbGVhcigpKVxuXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IGNoYW5nZS52YWx1ZVxuICBjb25zdCBub2RlID0gZG9jdW1lbnQuYXNzZXJ0RGVzY2VuZGFudChrZXkpXG4gIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChub2RlLmtleSlcbiAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihub2RlKVxuXG4gIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkocGFyZW50LmtleSwgaW5kZXgsIGlubGluZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KG5vZGUua2V5LCBpbmxpbmUua2V5LCAwLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIFdyYXAgYSBub2RlIGJ5IGBrZXlgIHdpdGggYHBhcmVudGAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHtOb2RlfE9iamVjdH0gcGFyZW50XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5cbkNoYW5nZXMud3JhcE5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSwgcGFyZW50KSA9PiB7XG4gIHBhcmVudCA9IE5vZGUuY3JlYXRlKHBhcmVudClcbiAgcGFyZW50ID0gcGFyZW50LnNldCgnbm9kZXMnLCBwYXJlbnQubm9kZXMuY2xlYXIoKSlcblxuICBpZiAocGFyZW50LmtpbmQgPT0gJ2Jsb2NrJykge1xuICAgIGNoYW5nZS53cmFwQmxvY2tCeUtleShrZXksIHBhcmVudClcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChwYXJlbnQua2luZCA9PSAnaW5saW5lJykge1xuICAgIGNoYW5nZS53cmFwSW5saW5lQnlLZXkoa2V5LCBwYXJlbnQpXG4gICAgcmV0dXJuXG4gIH1cbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBDaGFuZ2VzXG4iXX0=