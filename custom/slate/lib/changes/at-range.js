'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _block = require('../models/block');

var _block2 = _interopRequireDefault(_block);

var _inline = require('../models/inline');

var _inline2 = _interopRequireDefault(_inline);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

var _node = require('../models/node');

var _node2 = _interopRequireDefault(_node);

var _string = require('../utils/string');

var _string2 = _interopRequireDefault(_string);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Add a new `mark` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.addMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var _options$normalize = options.normalize,
      normalize = _options$normalize === undefined ? true : _options$normalize;
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;

  var texts = document.getTextsAtRange(range);

  texts.forEach(function (node) {
    var key = node.key;

    var index = 0;
    var length = node.text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    change.addMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Delete everything in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteAtRange = function (change, range) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  if (range.isCollapsed) return;

  // Snapshot the selection, which creates an extra undo save point, so that
  // when you undo a delete, the expanded selection will be retained.
  change.snapshotSelection();

  var _options$normalize2 = options.normalize,
      normalize = _options$normalize2 === undefined ? true : _options$normalize2;
  var value = change.value;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;
  var document = value.document;

  var isStartVoid = document.hasVoidParent(startKey);
  var isEndVoid = document.hasVoidParent(endKey);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);

  // Check if we have a "hanging" selection case where the even though the
  // selection extends into the start of the end node, we actually want to
  // ignore that for UX reasons.
  var isHanging = startOffset == 0 && endOffset == 0 && isStartVoid == false && startKey == startBlock.getFirstText().key && endKey == endBlock.getFirstText().key;

  // If it's a hanging selection, nudge it back to end in the previous text.
  if (isHanging && isEndVoid) {
    var prevText = document.getPreviousText(endKey);
    endKey = prevText.key;
    endOffset = prevText.text.length;
    isEndVoid = document.hasVoidParent(endKey);
  }

  // If the start node is inside a void node, remove the void node and update
  // the starting point to be right after it, continuously until the start point
  // is not a void, or until the entire range is handled.
  while (isStartVoid) {
    var startVoid = document.getClosestVoid(startKey);
    var nextText = document.getNextText(startKey);
    change.removeNodeByKey(startVoid.key, { normalize: false });

    // If the start and end keys are the same, we're done.
    if (startKey == endKey) return;

    // If there is no next text node, we're done.
    if (!nextText) return;

    // Continue...
    document = change.value.document;
    startKey = nextText.key;
    startOffset = 0;
    isStartVoid = document.hasVoidParent(startKey);
  }

  // If the end node is inside a void node, do the same thing but backwards. But
  // we don't need any aborting checks because if we've gotten this far there
  // must be a non-void node that will exit the loop.
  while (isEndVoid) {
    var endVoid = document.getClosestVoid(endKey);
    var _prevText = document.getPreviousText(endKey);
    change.removeNodeByKey(endVoid.key, { normalize: false });

    // Continue...
    document = change.value.document;
    endKey = _prevText.key;
    endOffset = _prevText.text.length;
    isEndVoid = document.hasVoidParent(endKey);
  }

  // If the start and end key are the same, and it was a hanging selection, we
  // can just remove the entire block.
  if (startKey == endKey && isHanging) {
    change.removeNodeByKey(startBlock.key, { normalize: normalize });
    return;
  }

  // Otherwise, if it wasn't hanging, we're inside a single text node, so we can
  // simply remove the text in the range.
  else if (startKey == endKey) {
      var index = startOffset;
      var length = endOffset - startOffset;
      change.removeTextByKey(startKey, index, length, { normalize: normalize });
      return;
    }

    // Otherwise, we need to recursively remove text and nodes inside the start
    // block after the start offset and inside the end block before the end
    // offset. Then remove any blocks that are in between the start and end
    // blocks. Then finally merge the start and end nodes.
    else {
        startBlock = document.getClosestBlock(startKey);
        endBlock = document.getClosestBlock(endKey);
        var startText = document.getNode(startKey);
        var endText = document.getNode(endKey);
        var startLength = startText.text.length - startOffset;
        var endLength = endOffset;

        var ancestor = document.getCommonAncestor(startKey, endKey);
        var startChild = ancestor.getFurthestAncestor(startKey);
        var endChild = ancestor.getFurthestAncestor(endKey);

        var startParent = document.getParent(startBlock.key);
        var startParentIndex = startParent.nodes.indexOf(startBlock);
        var endParentIndex = startParent.nodes.indexOf(endBlock);

        var child = void 0;

        // Iterate through all of the nodes in the tree after the start text node
        // but inside the end child, and remove them.
        child = startText;

        while (child.key != startChild.key) {
          var parent = document.getParent(child.key);
          var _index = parent.nodes.indexOf(child);
          var afters = parent.nodes.slice(_index + 1);

          afters.reverse().forEach(function (node) {
            change.removeNodeByKey(node.key, { normalize: false });
          });

          child = parent;
        }

        // Remove all of the middle children.
        var startChildIndex = ancestor.nodes.indexOf(startChild);
        var endChildIndex = ancestor.nodes.indexOf(endChild);
        var middles = ancestor.nodes.slice(startChildIndex + 1, endChildIndex);

        middles.reverse().forEach(function (node) {
          change.removeNodeByKey(node.key, { normalize: false });
        });

        // Remove the nodes before the end text node in the tree.
        child = endText;

        while (child.key != endChild.key) {
          var _parent = document.getParent(child.key);
          var _index2 = _parent.nodes.indexOf(child);
          var befores = _parent.nodes.slice(0, _index2);

          befores.reverse().forEach(function (node) {
            change.removeNodeByKey(node.key, { normalize: false });
          });

          child = _parent;
        }

        // Remove any overlapping text content from the leaf text nodes.
        if (startLength != 0) {
          change.removeTextByKey(startKey, startOffset, startLength, { normalize: false });
        }

        if (endLength != 0) {
          change.removeTextByKey(endKey, 0, endOffset, { normalize: false });
        }

        // If the start and end blocks aren't the same, move and merge the end block
        // into the start block.
        if (startBlock.key != endBlock.key) {
          document = change.value.document;
          var lonely = document.getFurthestOnlyChildAncestor(endBlock.key);

          // Move the end block to be right after the start block.
          if (endParentIndex != startParentIndex + 1) {
            change.moveNodeByKey(endBlock.key, startParent.key, startParentIndex + 1);
          }

          // If the selection is hanging, just remove the start block, otherwise
          // merge the end block into it.
          if (isHanging) {
            change.removeNodeByKey(startBlock.key, { normalize: false });
          } else {
            change.mergeNodeByKey(endBlock.key, { normalize: false });
          }

          // If nested empty blocks are left over above the end block, remove them.
          if (lonely) {
            change.removeNodeByKey(lonely.key, { normalize: false });
          }
        }

        // If we should normalize, do it now after everything.
        if (normalize) {
          change.normalizeNodeByKey(ancestor.key);
        }
      }
};

/**
 * Delete backward until the character boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteCharBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getCharOffsetBackward(text, o);
  change.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward until the line boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteLineBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  change.deleteBackwardAtRange(range, o, options);
};

/**
 * Delete backward until the word boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteWordBackwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getWordOffsetBackward(text, o);
  change.deleteBackwardAtRange(range, n, options);
};

/**
 * Delete backward `n` characters at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteBackwardAtRange = function (change, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize3 = options.normalize,
      normalize = _options$normalize3 === undefined ? true : _options$normalize3;
  var value = change.value;
  var document = value.document;
  var _range = range,
      startKey = _range.startKey,
      focusOffset = _range.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);

  // If the closest block is void, delete it.
  if (block && block.isVoid) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest is not void, but empty, remove it
  if (block && !block.isVoid && block.isEmpty && document.nodes.size !== 1) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest inline is void, delete it.
  var inline = document.getClosestInline(startKey);
  if (inline && inline.isVoid) {
    change.removeNodeByKey(inline.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtStartOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtStartOf(text)) {
    var prev = document.getPreviousText(text.key);
    var prevBlock = document.getClosestBlock(prev.key);
    var prevInline = document.getClosestInline(prev.key);

    // If the previous block is void, remove it.
    if (prevBlock && prevBlock.isVoid) {
      change.removeNodeByKey(prevBlock.key, { normalize: normalize });
      return;
    }

    // If the previous inline is void, remove it.
    if (prevInline && prevInline.isVoid) {
      change.removeNodeByKey(prevInline.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to merge the two blocks together.
    if (n == 1 && prevBlock != block) {
      range = range.merge({
        anchorKey: prev.key,
        anchorOffset: prev.text.length
      });

      change.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the focus offset is farther than the number of characters to delete,
  // just remove the characters backwards inside the current node.
  if (n < focusOffset) {
    range = range.merge({
      focusOffset: focusOffset - n,
      isBackward: true
    });

    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes backwards to go.
  var node = text;
  var offset = 0;
  var traversed = focusOffset;

  while (n > traversed) {
    node = document.getPreviousText(node.key);
    var next = traversed + node.text.length;
    if (n <= next) {
      offset = next - n;
      break;
    } else {
      traversed = next;
    }
  }

  // If the focus node is inside a void, go up until right after it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getNextText(parent.key);
    offset = 0;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset,
    isBackward: true
  });

  change.deleteAtRange(range, { normalize: normalize });
};

/**
 * Delete forward until the character boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteCharForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getCharOffsetForward(text, o);
  change.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward until the line boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteLineForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  change.deleteForwardAtRange(range, o, options);
};

/**
 * Delete forward until the word boundary at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteWordForwardAtRange = function (change, range, options) {
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var offset = startBlock.getOffset(startKey);
  var o = offset + startOffset;
  var text = startBlock.text;

  var n = _string2.default.getWordOffsetForward(text, o);
  change.deleteForwardAtRange(range, n, options);
};

/**
 * Delete forward `n` characters at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} n (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.deleteForwardAtRange = function (change, range) {
  var n = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize4 = options.normalize,
      normalize = _options$normalize4 === undefined ? true : _options$normalize4;
  var value = change.value;
  var document = value.document;
  var _range2 = range,
      startKey = _range2.startKey,
      focusOffset = _range2.focusOffset;

  // If the range is expanded, perform a regular delete instead.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  var block = document.getClosestBlock(startKey);

  // If the closest block is void, delete it.
  if (block && block.isVoid) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest is not void, but empty, remove it
  if (block && !block.isVoid && block.isEmpty && document.nodes.size !== 1) {
    change.removeNodeByKey(block.key, { normalize: normalize });
    return;
  }

  // If the closest inline is void, delete it.
  var inline = document.getClosestInline(startKey);
  if (inline && inline.isVoid) {
    change.removeNodeByKey(inline.key, { normalize: normalize });
    return;
  }

  // If the range is at the start of the document, abort.
  if (range.isAtEndOf(document)) {
    return;
  }

  // If the range is at the start of the text node, we need to figure out what
  // is behind it to know how to delete...
  var text = document.getDescendant(startKey);
  if (range.isAtEndOf(text)) {
    var next = document.getNextText(text.key);
    var nextBlock = document.getClosestBlock(next.key);
    var nextInline = document.getClosestInline(next.key);

    // If the previous block is void, remove it.
    if (nextBlock && nextBlock.isVoid) {
      change.removeNodeByKey(nextBlock.key, { normalize: normalize });
      return;
    }

    // If the previous inline is void, remove it.
    if (nextInline && nextInline.isVoid) {
      change.removeNodeByKey(nextInline.key, { normalize: normalize });
      return;
    }

    // If we're deleting by one character and the previous text node is not
    // inside the current block, we need to merge the two blocks together.
    if (n == 1 && nextBlock != block) {
      range = range.merge({
        focusKey: next.key,
        focusOffset: 0
      });

      change.deleteAtRange(range, { normalize: normalize });
      return;
    }
  }

  // If the remaining characters to the end of the node is greater than or equal
  // to the number of characters to delete, just remove the characters forwards
  // inside the current node.
  if (n <= text.text.length - focusOffset) {
    range = range.merge({
      focusOffset: focusOffset + n
    });

    change.deleteAtRange(range, { normalize: normalize });
    return;
  }

  // Otherwise, we need to see how many nodes forwards to go.
  var node = text;
  var offset = focusOffset;
  var traversed = text.text.length - focusOffset;

  while (n > traversed) {
    node = document.getNextText(node.key);
    var _next = traversed + node.text.length;
    if (n <= _next) {
      offset = n - traversed;
      break;
    } else {
      traversed = _next;
    }
  }

  // If the focus node is inside a void, go up until right before it.
  if (document.hasVoidParent(node.key)) {
    var parent = document.getClosestVoid(node.key);
    node = document.getPreviousText(parent.key);
    offset = node.text.length;
  }

  range = range.merge({
    focusKey: node.key,
    focusOffset: offset
  });

  change.deleteAtRange(range, { normalize: normalize });
};

/**
 * Insert a `block` node at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Block|String|Object} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertBlockAtRange = function (change, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = _block2.default.create(block);
  var _options$normalize5 = options.normalize,
      normalize = _options$normalize5 === undefined ? true : _options$normalize5;


  if (range.isExpanded) {
    change.deleteAtRange(range);
    range = range.collapseToStart();
  }

  var value = change.value;
  var document = value.document;
  var _range3 = range,
      startKey = _range3.startKey,
      startOffset = _range3.startOffset;

  var startBlock = document.getClosestBlock(startKey);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);

  if (startBlock.isVoid) {
    var extra = range.isAtEndOf(startBlock) ? 1 : 0;
    change.insertNodeByKey(parent.key, index + extra, block, { normalize: normalize });
  } else if (startBlock.isEmpty) {
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else if (range.isAtStartOf(startBlock)) {
    change.insertNodeByKey(parent.key, index, block, { normalize: normalize });
  } else if (range.isAtEndOf(startBlock)) {
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  } else {
    change.splitDescendantsByKey(startBlock.key, startKey, startOffset, { normalize: false });
    change.insertNodeByKey(parent.key, index + 1, block, { normalize: normalize });
  }

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert a `fragment` at a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Document} fragment
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertFragmentAtRange = function (change, range, fragment) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize6 = options.normalize,
      normalize = _options$normalize6 === undefined ? true : _options$normalize6;

  // If the range is expanded, delete it first.

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });
    range = range.collapseToStart();
  }

  // If the fragment is empty, there's nothing to do after deleting.
  if (!fragment.nodes.size) return;

  // Regenerate the keys for all of the fragments nodes, so that they're
  // guaranteed not to collide with the existing keys in the document. Otherwise
  // they will be rengerated automatically and we won't have an easy way to
  // reference them.
  fragment = fragment.mapDescendants(function (child) {
    return child.regenerateKey();
  });

  // Calculate a few things...
  var _range4 = range,
      startKey = _range4.startKey,
      startOffset = _range4.startOffset;
  var value = change.value;
  var document = value.document;

  var startText = document.getDescendant(startKey);
  var startBlock = document.getClosestBlock(startText.key);
  var startChild = startBlock.getFurthestAncestor(startText.key);
  var isAtStart = range.isAtStartOf(startBlock);
  var parent = document.getParent(startBlock.key);
  var index = parent.nodes.indexOf(startBlock);
  var blocks = fragment.getBlocks();
  var firstBlock = blocks.first();
  var lastBlock = blocks.last();

  // If the fragment only contains a void block, use `insertBlock` instead.
  if (firstBlock == lastBlock && firstBlock.isVoid) {
    change.insertBlockAtRange(range, firstBlock, options);
    return;
  }

  // If the first and last block aren't the same, we need to insert all of the
  // nodes after the fragment's first block at the index.
  if (firstBlock != lastBlock) {
    var lonelyParent = fragment.getFurthest(firstBlock.key, function (p) {
      return p.nodes.size == 1;
    });
    var lonelyChild = lonelyParent || firstBlock;
    var startIndex = parent.nodes.indexOf(startBlock);
    fragment = fragment.removeDescendant(lonelyChild.key);

    fragment.nodes.forEach(function (node, i) {
      var newIndex = startIndex + i + 1;
      change.insertNodeByKey(parent.key, newIndex, node, { normalize: false });
    });
  }

  // Check if we need to split the node.
  if (startOffset != 0) {
    change.splitDescendantsByKey(startChild.key, startKey, startOffset, { normalize: false });
  }

  // Update our variables with the new value.
  document = change.value.document;
  startText = document.getDescendant(startKey);
  startBlock = document.getClosestBlock(startKey);
  startChild = startBlock.getFurthestAncestor(startText.key);

  // If the first and last block aren't the same, we need to move any of the
  // starting block's children after the split into the last block of the
  // fragment, which has already been inserted.
  if (firstBlock != lastBlock) {
    var nextChild = isAtStart ? startChild : startBlock.getNextSibling(startChild.key);
    var nextNodes = nextChild ? startBlock.nodes.skipUntil(function (n) {
      return n.key == nextChild.key;
    }) : (0, _immutable.List)();
    var lastIndex = lastBlock.nodes.size;

    nextNodes.forEach(function (node, i) {
      var newIndex = lastIndex + i;
      change.moveNodeByKey(node.key, lastBlock.key, newIndex, { normalize: false });
    });
  }

  // If the starting block is empty, we replace it entirely with the first block
  // of the fragment, since this leads to a more expected behavior for the user.
  if (startBlock.isEmpty) {
    change.removeNodeByKey(startBlock.key, { normalize: false });
    change.insertNodeByKey(parent.key, index, firstBlock, { normalize: false });
  }

  // Otherwise, we maintain the starting block, and insert all of the first
  // block's inline nodes into it at the split point.
  else {
      var inlineChild = startBlock.getFurthestAncestor(startText.key);
      var inlineIndex = startBlock.nodes.indexOf(inlineChild);

      firstBlock.nodes.forEach(function (inline, i) {
        var o = startOffset == 0 ? 0 : 1;
        var newIndex = inlineIndex + i + o;
        change.insertNodeByKey(startBlock.key, newIndex, inline, { normalize: false });
      });
    }

  // Normalize if requested.
  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert an `inline` node at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Inline|String|Object} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertInlineAtRange = function (change, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize7 = options.normalize,
      normalize = _options$normalize7 === undefined ? true : _options$normalize7;

  inline = _inline2.default.create(inline);

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });
    range = range.collapseToStart();
  }

  var value = change.value;
  var document = value.document;
  var _range5 = range,
      startKey = _range5.startKey,
      startOffset = _range5.startOffset;

  var parent = document.getParent(startKey);
  var startText = document.assertDescendant(startKey);
  var index = parent.nodes.indexOf(startText);

  if (parent.isVoid) return;

  change.splitNodeByKey(startKey, startOffset, { normalize: false });
  change.insertNodeByKey(parent.key, index + 1, inline, { normalize: false });

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Insert `text` at a `range`, with optional `marks`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String} text
 * @param {Set<Mark>} marks (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.insertTextAtRange = function (change, range, text, marks) {
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var normalize = options.normalize;
  var value = change.value;
  var document = value.document;
  var startKey = range.startKey,
      startOffset = range.startOffset;

  var parent = document.getParent(startKey);

  if (parent.isVoid) return;

  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: false });
  }

  // PERF: Unless specified, don't normalize if only inserting text.
  if (normalize !== undefined) {
    normalize = range.isExpanded;
  }

  change.insertTextByKey(startKey, startOffset, text, marks, { normalize: normalize });
};

/**
 * Remove an existing `mark` to the characters at `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mark|String} mark (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.removeMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  var _options$normalize8 = options.normalize,
      normalize = _options$normalize8 === undefined ? true : _options$normalize8;
  var value = change.value;
  var document = value.document;

  var texts = document.getTextsAtRange(range);
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  texts.forEach(function (node) {
    var key = node.key;

    var index = 0;
    var length = node.text.length;

    if (key == startKey) index = startOffset;
    if (key == endKey) length = endOffset;
    if (key == startKey && key == endKey) length = endOffset - startOffset;

    change.removeMarkByKey(key, index, length, mark, { normalize: normalize });
  });
};

/**
 * Set the `properties` of block nodes in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setBlockAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize9 = options.normalize,
      normalize = _options$normalize9 === undefined ? true : _options$normalize9;
  var value = change.value;
  var document = value.document;

  var blocks = document.getBlocksAtRange(range);

  blocks.forEach(function (block) {
    change.setNodeByKey(block.key, properties, { normalize: normalize });
  });
};

/**
 * Set the `properties` of inline nodes in a `range`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Object|String} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.setInlineAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize10 = options.normalize,
      normalize = _options$normalize10 === undefined ? true : _options$normalize10;
  var value = change.value;
  var document = value.document;

  var inlines = document.getInlinesAtRange(range);

  inlines.forEach(function (inline) {
    change.setNodeByKey(inline.key, properties, { normalize: normalize });
  });
};

/**
 * Split the block nodes at a `range`, to optional `height`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitBlockAtRange = function (change, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize11 = options.normalize,
      normalize = _options$normalize11 === undefined ? true : _options$normalize11;


  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range6 = range,
      startKey = _range6.startKey,
      startOffset = _range6.startOffset;
  var value = change.value;
  var document = value.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestBlock(node.key);
  var h = 0;

  while (parent && parent.kind == 'block' && h < height) {
    node = parent;
    parent = document.getClosestBlock(parent.key);
    h++;
  }

  change.splitDescendantsByKey(node.key, startKey, startOffset, { normalize: normalize });
};

/**
 * Split the inline nodes at a `range`, to optional `height`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Number} height (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.splitInlineAtRange = function (change, range) {
  var height = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Infinity;
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var _options$normalize12 = options.normalize,
      normalize = _options$normalize12 === undefined ? true : _options$normalize12;


  if (range.isExpanded) {
    change.deleteAtRange(range, { normalize: normalize });
    range = range.collapseToStart();
  }

  var _range7 = range,
      startKey = _range7.startKey,
      startOffset = _range7.startOffset;
  var value = change.value;
  var document = value.document;

  var node = document.assertDescendant(startKey);
  var parent = document.getClosestInline(node.key);
  var h = 0;

  while (parent && parent.kind == 'inline' && h < height) {
    node = parent;
    parent = document.getClosestInline(parent.key);
    h++;
  }

  change.splitDescendantsByKey(node.key, startKey, startOffset, { normalize: normalize });
};

/**
 * Add or remove a `mark` from the characters at `range`, depending on whether
 * it's already there.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Mixed} mark
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.toggleMarkAtRange = function (change, range, mark) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  if (range.isCollapsed) return;

  mark = _mark2.default.create(mark);

  var _options$normalize13 = options.normalize,
      normalize = _options$normalize13 === undefined ? true : _options$normalize13;
  var value = change.value;
  var document = value.document;

  var marks = document.getActiveMarksAtRange(range);
  var exists = marks.some(function (m) {
    return m.equals(mark);
  });

  if (exists) {
    change.removeMarkAtRange(range, mark, { normalize: normalize });
  } else {
    change.addMarkAtRange(range, mark, { normalize: normalize });
  }
};

/**
 * Unwrap all of the block nodes in a `range` from a block with `properties`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapBlockAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _node2.default.createProperties(properties);

  var _options$normalize14 = options.normalize,
      normalize = _options$normalize14 === undefined ? true : _options$normalize14;
  var value = change.value;
  var document = value.document;

  var blocks = document.getBlocksAtRange(range);
  var wrappers = blocks.map(function (block) {
    return document.getClosest(block.key, function (parent) {
      if (parent.kind != 'block') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  wrappers.forEach(function (block) {
    var first = block.nodes.first();
    var last = block.nodes.last();
    var parent = document.getParent(block.key);
    var index = parent.nodes.indexOf(block);

    var children = block.nodes.filter(function (child) {
      return blocks.some(function (b) {
        return child == b || child.hasDescendant(b.key);
      });
    });

    var firstMatch = children.first();
    var lastMatch = children.last();

    if (first == firstMatch && last == lastMatch) {
      block.nodes.forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + i, { normalize: false });
      });

      change.removeNodeByKey(block.key, { normalize: false });
    } else if (last == lastMatch) {
      block.nodes.skipUntil(function (n) {
        return n == firstMatch;
      }).forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + 1 + i, { normalize: false });
      });
    } else if (first == firstMatch) {
      block.nodes.takeUntil(function (n) {
        return n == lastMatch;
      }).push(lastMatch).forEach(function (child, i) {
        change.moveNodeByKey(child.key, parent.key, index + i, { normalize: false });
      });
    } else {
      var firstText = firstMatch.getFirstText();
      change.splitDescendantsByKey(block.key, firstText.key, 0, { normalize: false });
      document = change.value.document;

      children.forEach(function (child, i) {
        if (i == 0) {
          var extra = child;
          child = document.getNextBlock(child.key);
          change.removeNodeByKey(extra.key, { normalize: false });
        }

        change.moveNodeByKey(child.key, parent.key, index + 1 + i, { normalize: false });
      });
    }
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    change.normalizeDocument();
  }
};

/**
 * Unwrap the inline nodes in a `range` from an inline with `properties`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String|Object} properties
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.unwrapInlineAtRange = function (change, range, properties) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  properties = _node2.default.createProperties(properties);

  var _options$normalize15 = options.normalize,
      normalize = _options$normalize15 === undefined ? true : _options$normalize15;
  var value = change.value;
  var document = value.document;

  var texts = document.getTextsAtRange(range);
  var inlines = texts.map(function (text) {
    return document.getClosest(text.key, function (parent) {
      if (parent.kind != 'inline') return false;
      if (properties.type != null && parent.type != properties.type) return false;
      if (properties.isVoid != null && parent.isVoid != properties.isVoid) return false;
      if (properties.data != null && !parent.data.isSuperset(properties.data)) return false;
      return true;
    });
  }).filter(function (exists) {
    return exists;
  }).toOrderedSet().toList();

  inlines.forEach(function (inline) {
    var parent = change.value.document.getParent(inline.key);
    var index = parent.nodes.indexOf(inline);

    inline.nodes.forEach(function (child, i) {
      change.moveNodeByKey(child.key, parent.key, index + i, { normalize: false });
    });
  });

  // TODO: optmize to only normalize the right block
  if (normalize) {
    change.normalizeDocument();
  }
};

/**
 * Wrap all of the blocks in a `range` in a new `block`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Block|Object|String} block
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapBlockAtRange = function (change, range, block) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

  block = _block2.default.create(block);
  block = block.set('nodes', block.nodes.clear());

  var _options$normalize16 = options.normalize,
      normalize = _options$normalize16 === undefined ? true : _options$normalize16;
  var value = change.value;
  var document = value.document;


  var blocks = document.getBlocksAtRange(range);
  var firstblock = blocks.first();
  var lastblock = blocks.last();
  var parent = void 0,
      siblings = void 0,
      index = void 0;

  // If there is only one block in the selection then we know the parent and
  // siblings.
  if (blocks.length === 1) {
    parent = document.getParent(firstblock.key);
    siblings = blocks;
  }

  // Determine closest shared parent to all blocks in selection.
  else {
      parent = document.getClosest(firstblock.key, function (p1) {
        return !!document.getClosest(lastblock.key, function (p2) {
          return p1 == p2;
        });
      });
    }

  // If no shared parent could be found then the parent is the document.
  if (parent == null) parent = document;

  // Create a list of direct children siblings of parent that fall in the
  // selection.
  if (siblings == null) {
    var indexes = parent.nodes.reduce(function (ind, node, i) {
      if (node == firstblock || node.hasDescendant(firstblock.key)) ind[0] = i;
      if (node == lastblock || node.hasDescendant(lastblock.key)) ind[1] = i;
      return ind;
    }, []);

    index = indexes[0];
    siblings = parent.nodes.slice(indexes[0], indexes[1] + 1);
  }

  // Get the index to place the new wrapped node at.
  if (index == null) {
    index = parent.nodes.indexOf(siblings.first());
  }

  // Inject the new block node into the parent.
  change.insertNodeByKey(parent.key, index, block, { normalize: false });

  // Move the sibling nodes into the new block node.
  siblings.forEach(function (node, i) {
    change.moveNodeByKey(node.key, block.key, i, { normalize: false });
  });

  if (normalize) {
    change.normalizeNodeByKey(parent.key);
  }
};

/**
 * Wrap the text and inlines in a `range` in a new `inline`.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {Inline|Object|String} inline
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapInlineAtRange = function (change, range, inline) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  var value = change.value;
  var document = value.document;
  var _options$normalize17 = options.normalize,
      normalize = _options$normalize17 === undefined ? true : _options$normalize17;
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  if (range.isCollapsed) {
    // Wrapping an inline void
    var inlineParent = document.getClosestInline(startKey);
    if (!inlineParent.isVoid) {
      return;
    }

    return change.wrapInlineByKey(inlineParent.key, inline, options);
  }

  inline = _inline2.default.create(inline);
  inline = inline.set('nodes', inline.nodes.clear());

  var blocks = document.getBlocksAtRange(range);
  var startBlock = document.getClosestBlock(startKey);
  var endBlock = document.getClosestBlock(endKey);
  var startChild = startBlock.getFurthestAncestor(startKey);
  var endChild = endBlock.getFurthestAncestor(endKey);

  change.splitDescendantsByKey(endChild.key, endKey, endOffset, { normalize: false });
  change.splitDescendantsByKey(startChild.key, startKey, startOffset, { normalize: false });

  document = change.value.document;
  startBlock = document.getDescendant(startBlock.key);
  endBlock = document.getDescendant(endBlock.key);
  startChild = startBlock.getFurthestAncestor(startKey);
  endChild = endBlock.getFurthestAncestor(endKey);
  var startIndex = startBlock.nodes.indexOf(startChild);
  var endIndex = endBlock.nodes.indexOf(endChild);

  if (startBlock == endBlock) {
    document = change.value.document;
    startBlock = document.getClosestBlock(startKey);
    startChild = startBlock.getFurthestAncestor(startKey);

    var startInner = document.getNextSibling(startChild.key);
    var startInnerIndex = startBlock.nodes.indexOf(startInner);
    var endInner = startKey == endKey ? startInner : startBlock.getFurthestAncestor(endKey);
    var inlines = startBlock.nodes.skipUntil(function (n) {
      return n == startInner;
    }).takeUntil(function (n) {
      return n == endInner;
    }).push(endInner);

    var node = inline.regenerateKey();

    change.insertNodeByKey(startBlock.key, startInnerIndex, node, { normalize: false });

    inlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, node.key, i, { normalize: false });
    });

    if (normalize) {
      change.normalizeNodeByKey(startBlock.key);
    }
  } else {
    var startInlines = startBlock.nodes.slice(startIndex + 1);
    var endInlines = endBlock.nodes.slice(0, endIndex + 1);
    var startNode = inline.regenerateKey();
    var endNode = inline.regenerateKey();

    change.insertNodeByKey(startBlock.key, startIndex - 1, startNode, { normalize: false });
    change.insertNodeByKey(endBlock.key, endIndex, endNode, { normalize: false });

    startInlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, startNode.key, i, { normalize: false });
    });

    endInlines.forEach(function (child, i) {
      change.moveNodeByKey(child.key, endNode.key, i, { normalize: false });
    });

    if (normalize) {
      change.normalizeNodeByKey(startBlock.key).normalizeNodeByKey(endBlock.key);
    }

    blocks.slice(1, -1).forEach(function (block) {
      var node = inline.regenerateKey();
      change.insertNodeByKey(block.key, 0, node, { normalize: false });

      block.nodes.forEach(function (child, i) {
        change.moveNodeByKey(child.key, node.key, i, { normalize: false });
      });

      if (normalize) {
        change.normalizeNodeByKey(block.key);
      }
    });
  }
};

/**
 * Wrap the text in a `range` in a prefix/suffix.
 *
 * @param {Change} change
 * @param {Range} range
 * @param {String} prefix
 * @param {String} suffix (optional)
 * @param {Object} options
 *   @property {Boolean} normalize
 */

Changes.wrapTextAtRange = function (change, range, prefix) {
  var suffix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : prefix;
  var options = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};
  var _options$normalize18 = options.normalize,
      normalize = _options$normalize18 === undefined ? true : _options$normalize18;
  var startKey = range.startKey,
      endKey = range.endKey;

  var start = range.collapseToStart();
  var end = range.collapseToEnd();

  if (startKey == endKey) {
    end = end.move(prefix.length);
  }

  change.insertTextAtRange(start, prefix, [], { normalize: normalize });
  change.insertTextAtRange(end, suffix, [], { normalize: normalize });
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL2F0LXJhbmdlLmpzIl0sIm5hbWVzIjpbIkNoYW5nZXMiLCJhZGRNYXJrQXRSYW5nZSIsImNoYW5nZSIsInJhbmdlIiwibWFyayIsIm9wdGlvbnMiLCJpc0NvbGxhcHNlZCIsIm5vcm1hbGl6ZSIsInZhbHVlIiwiZG9jdW1lbnQiLCJzdGFydEtleSIsInN0YXJ0T2Zmc2V0IiwiZW5kS2V5IiwiZW5kT2Zmc2V0IiwidGV4dHMiLCJnZXRUZXh0c0F0UmFuZ2UiLCJmb3JFYWNoIiwibm9kZSIsImtleSIsImluZGV4IiwibGVuZ3RoIiwidGV4dCIsImFkZE1hcmtCeUtleSIsImRlbGV0ZUF0UmFuZ2UiLCJzbmFwc2hvdFNlbGVjdGlvbiIsImlzU3RhcnRWb2lkIiwiaGFzVm9pZFBhcmVudCIsImlzRW5kVm9pZCIsInN0YXJ0QmxvY2siLCJnZXRDbG9zZXN0QmxvY2siLCJlbmRCbG9jayIsImlzSGFuZ2luZyIsImdldEZpcnN0VGV4dCIsInByZXZUZXh0IiwiZ2V0UHJldmlvdXNUZXh0Iiwic3RhcnRWb2lkIiwiZ2V0Q2xvc2VzdFZvaWQiLCJuZXh0VGV4dCIsImdldE5leHRUZXh0IiwicmVtb3ZlTm9kZUJ5S2V5IiwiZW5kVm9pZCIsInJlbW92ZVRleHRCeUtleSIsInN0YXJ0VGV4dCIsImdldE5vZGUiLCJlbmRUZXh0Iiwic3RhcnRMZW5ndGgiLCJlbmRMZW5ndGgiLCJhbmNlc3RvciIsImdldENvbW1vbkFuY2VzdG9yIiwic3RhcnRDaGlsZCIsImdldEZ1cnRoZXN0QW5jZXN0b3IiLCJlbmRDaGlsZCIsInN0YXJ0UGFyZW50IiwiZ2V0UGFyZW50Iiwic3RhcnRQYXJlbnRJbmRleCIsIm5vZGVzIiwiaW5kZXhPZiIsImVuZFBhcmVudEluZGV4IiwiY2hpbGQiLCJwYXJlbnQiLCJhZnRlcnMiLCJzbGljZSIsInJldmVyc2UiLCJzdGFydENoaWxkSW5kZXgiLCJlbmRDaGlsZEluZGV4IiwibWlkZGxlcyIsImJlZm9yZXMiLCJsb25lbHkiLCJnZXRGdXJ0aGVzdE9ubHlDaGlsZEFuY2VzdG9yIiwibW92ZU5vZGVCeUtleSIsIm1lcmdlTm9kZUJ5S2V5Iiwibm9ybWFsaXplTm9kZUJ5S2V5IiwiZGVsZXRlQ2hhckJhY2t3YXJkQXRSYW5nZSIsIm9mZnNldCIsImdldE9mZnNldCIsIm8iLCJuIiwiZ2V0Q2hhck9mZnNldEJhY2t3YXJkIiwiZGVsZXRlQmFja3dhcmRBdFJhbmdlIiwiZGVsZXRlTGluZUJhY2t3YXJkQXRSYW5nZSIsImRlbGV0ZVdvcmRCYWNrd2FyZEF0UmFuZ2UiLCJnZXRXb3JkT2Zmc2V0QmFja3dhcmQiLCJmb2N1c09mZnNldCIsImlzRXhwYW5kZWQiLCJibG9jayIsImlzVm9pZCIsImlzRW1wdHkiLCJzaXplIiwiaW5saW5lIiwiZ2V0Q2xvc2VzdElubGluZSIsImlzQXRTdGFydE9mIiwiZ2V0RGVzY2VuZGFudCIsInByZXYiLCJwcmV2QmxvY2siLCJwcmV2SW5saW5lIiwibWVyZ2UiLCJhbmNob3JLZXkiLCJhbmNob3JPZmZzZXQiLCJpc0JhY2t3YXJkIiwidHJhdmVyc2VkIiwibmV4dCIsImZvY3VzS2V5IiwiZGVsZXRlQ2hhckZvcndhcmRBdFJhbmdlIiwiZ2V0Q2hhck9mZnNldEZvcndhcmQiLCJkZWxldGVGb3J3YXJkQXRSYW5nZSIsImRlbGV0ZUxpbmVGb3J3YXJkQXRSYW5nZSIsImRlbGV0ZVdvcmRGb3J3YXJkQXRSYW5nZSIsImdldFdvcmRPZmZzZXRGb3J3YXJkIiwiaXNBdEVuZE9mIiwibmV4dEJsb2NrIiwibmV4dElubGluZSIsImluc2VydEJsb2NrQXRSYW5nZSIsImNyZWF0ZSIsImNvbGxhcHNlVG9TdGFydCIsImV4dHJhIiwiaW5zZXJ0Tm9kZUJ5S2V5Iiwic3BsaXREZXNjZW5kYW50c0J5S2V5IiwiaW5zZXJ0RnJhZ21lbnRBdFJhbmdlIiwiZnJhZ21lbnQiLCJtYXBEZXNjZW5kYW50cyIsInJlZ2VuZXJhdGVLZXkiLCJpc0F0U3RhcnQiLCJibG9ja3MiLCJnZXRCbG9ja3MiLCJmaXJzdEJsb2NrIiwiZmlyc3QiLCJsYXN0QmxvY2siLCJsYXN0IiwibG9uZWx5UGFyZW50IiwiZ2V0RnVydGhlc3QiLCJwIiwibG9uZWx5Q2hpbGQiLCJzdGFydEluZGV4IiwicmVtb3ZlRGVzY2VuZGFudCIsImkiLCJuZXdJbmRleCIsIm5leHRDaGlsZCIsImdldE5leHRTaWJsaW5nIiwibmV4dE5vZGVzIiwic2tpcFVudGlsIiwibGFzdEluZGV4IiwiaW5saW5lQ2hpbGQiLCJpbmxpbmVJbmRleCIsImluc2VydElubGluZUF0UmFuZ2UiLCJhc3NlcnREZXNjZW5kYW50Iiwic3BsaXROb2RlQnlLZXkiLCJpbnNlcnRUZXh0QXRSYW5nZSIsIm1hcmtzIiwidW5kZWZpbmVkIiwiaW5zZXJ0VGV4dEJ5S2V5IiwicmVtb3ZlTWFya0F0UmFuZ2UiLCJyZW1vdmVNYXJrQnlLZXkiLCJzZXRCbG9ja0F0UmFuZ2UiLCJwcm9wZXJ0aWVzIiwiZ2V0QmxvY2tzQXRSYW5nZSIsInNldE5vZGVCeUtleSIsInNldElubGluZUF0UmFuZ2UiLCJpbmxpbmVzIiwiZ2V0SW5saW5lc0F0UmFuZ2UiLCJzcGxpdEJsb2NrQXRSYW5nZSIsImhlaWdodCIsImgiLCJraW5kIiwic3BsaXRJbmxpbmVBdFJhbmdlIiwiSW5maW5pdHkiLCJ0b2dnbGVNYXJrQXRSYW5nZSIsImdldEFjdGl2ZU1hcmtzQXRSYW5nZSIsImV4aXN0cyIsInNvbWUiLCJtIiwiZXF1YWxzIiwidW53cmFwQmxvY2tBdFJhbmdlIiwiY3JlYXRlUHJvcGVydGllcyIsIndyYXBwZXJzIiwibWFwIiwiZ2V0Q2xvc2VzdCIsInR5cGUiLCJkYXRhIiwiaXNTdXBlcnNldCIsImZpbHRlciIsInRvT3JkZXJlZFNldCIsInRvTGlzdCIsImNoaWxkcmVuIiwiYiIsImhhc0Rlc2NlbmRhbnQiLCJmaXJzdE1hdGNoIiwibGFzdE1hdGNoIiwidGFrZVVudGlsIiwicHVzaCIsImZpcnN0VGV4dCIsImdldE5leHRCbG9jayIsIm5vcm1hbGl6ZURvY3VtZW50IiwidW53cmFwSW5saW5lQXRSYW5nZSIsIndyYXBCbG9ja0F0UmFuZ2UiLCJzZXQiLCJjbGVhciIsImZpcnN0YmxvY2siLCJsYXN0YmxvY2siLCJzaWJsaW5ncyIsInAxIiwicDIiLCJpbmRleGVzIiwicmVkdWNlIiwiaW5kIiwid3JhcElubGluZUF0UmFuZ2UiLCJpbmxpbmVQYXJlbnQiLCJ3cmFwSW5saW5lQnlLZXkiLCJlbmRJbmRleCIsInN0YXJ0SW5uZXIiLCJzdGFydElubmVySW5kZXgiLCJlbmRJbm5lciIsInN0YXJ0SW5saW5lcyIsImVuZElubGluZXMiLCJzdGFydE5vZGUiLCJlbmROb2RlIiwid3JhcFRleHRBdFJhbmdlIiwicHJlZml4Iiwic3VmZml4Iiwic3RhcnQiLCJlbmQiLCJjb2xsYXBzZVRvRW5kIiwibW92ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFVBQVUsRUFBaEI7O0FBRUE7Ozs7Ozs7Ozs7QUFVQUEsUUFBUUMsY0FBUixHQUF5QixVQUFDQyxNQUFELEVBQVNDLEtBQVQsRUFBZ0JDLElBQWhCLEVBQXVDO0FBQUEsTUFBakJDLE9BQWlCLHVFQUFQLEVBQU87O0FBQzlELE1BQUlGLE1BQU1HLFdBQVYsRUFBdUI7O0FBRHVDLDJCQUdqQ0QsT0FIaUMsQ0FHdERFLFNBSHNEO0FBQUEsTUFHdERBLFNBSHNELHNDQUcxQyxJQUgwQztBQUFBLE1BSXREQyxLQUpzRCxHQUk1Q04sTUFKNEMsQ0FJdERNLEtBSnNEO0FBQUEsTUFLdERDLFFBTHNELEdBS3pDRCxLQUx5QyxDQUt0REMsUUFMc0Q7QUFBQSxNQU10REMsUUFOc0QsR0FNVFAsS0FOUyxDQU10RE8sUUFOc0Q7QUFBQSxNQU01Q0MsV0FONEMsR0FNVFIsS0FOUyxDQU01Q1EsV0FONEM7QUFBQSxNQU0vQkMsTUFOK0IsR0FNVFQsS0FOUyxDQU0vQlMsTUFOK0I7QUFBQSxNQU12QkMsU0FOdUIsR0FNVFYsS0FOUyxDQU12QlUsU0FOdUI7O0FBTzlE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QUZxRCxDQUUxRU8sUUFGMEU7QUFBQSxNQUVoRUUsTUFGZ0UsR0FFckRULEtBRnFELENBRWhFUyxNQUZnRTs7QUFHbEYsTUFBTThNLFFBQVF2TixNQUFNOEcsZUFBTixFQUFkO0FBQ0EsTUFBSTBHLE1BQU14TixNQUFNeU4sYUFBTixFQUFWOztBQUVBLE1BQUlsTixZQUFZRSxNQUFoQixFQUF3QjtBQUN0QitNLFVBQU1BLElBQUlFLElBQUosQ0FBU0wsT0FBT3BNLE1BQWhCLENBQU47QUFDRDs7QUFFRGxCLFNBQU9nSixpQkFBUCxDQUF5QndFLEtBQXpCLEVBQWdDRixNQUFoQyxFQUF3QyxFQUF4QyxFQUE0QyxFQUFFak4sb0JBQUYsRUFBNUM7QUFDQUwsU0FBT2dKLGlCQUFQLENBQXlCeUUsR0FBekIsRUFBOEJGLE1BQTlCLEVBQXNDLEVBQXRDLEVBQTBDLEVBQUVsTixvQkFBRixFQUExQztBQUNELENBWkQ7O0FBY0E7Ozs7OztrQkFNZVAsTyIsImZpbGUiOiJhdC1yYW5nZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IHsgTGlzdCB9IGZyb20gJ2ltbXV0YWJsZSdcblxuaW1wb3J0IEJsb2NrIGZyb20gJy4uL21vZGVscy9ibG9jaydcbmltcG9ydCBJbmxpbmUgZnJvbSAnLi4vbW9kZWxzL2lubGluZSdcbmltcG9ydCBNYXJrIGZyb20gJy4uL21vZGVscy9tYXJrJ1xuaW1wb3J0IE5vZGUgZnJvbSAnLi4vbW9kZWxzL25vZGUnXG5pbXBvcnQgU3RyaW5nIGZyb20gJy4uL3V0aWxzL3N0cmluZydcblxuLyoqXG4gKiBDaGFuZ2VzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgQ2hhbmdlcyA9IHt9XG5cbi8qKlxuICogQWRkIGEgbmV3IGBtYXJrYCB0byB0aGUgY2hhcmFjdGVycyBhdCBgcmFuZ2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge01peGVkfSBtYXJrXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuYWRkTWFya0F0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgbWFyaywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGlmIChyYW5nZS5pc0NvbGxhcHNlZCkgcmV0dXJuXG5cbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgZW5kS2V5LCBlbmRPZmZzZXQgfSA9IHJhbmdlXG4gIGNvbnN0IHRleHRzID0gZG9jdW1lbnQuZ2V0VGV4dHNBdFJhbmdlKHJhbmdlKVxuXG4gIHRleHRzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICBjb25zdCB7IGtleSB9ID0gbm9kZVxuICAgIGxldCBpbmRleCA9IDBcbiAgICBsZXQgbGVuZ3RoID0gbm9kZS50ZXh0Lmxlbmd0aFxuXG4gICAgaWYgKGtleSA9PSBzdGFydEtleSkgaW5kZXggPSBzdGFydE9mZnNldFxuICAgIGlmIChrZXkgPT0gZW5kS2V5KSBsZW5ndGggPSBlbmRPZmZzZXRcbiAgICBpZiAoa2V5ID09IHN0YXJ0S2V5ICYmIGtleSA9PSBlbmRLZXkpIGxlbmd0aCA9IGVuZE9mZnNldCAtIHN0YXJ0T2Zmc2V0XG5cbiAgICBjaGFuZ2UuYWRkTWFya0J5S2V5KGtleSwgaW5kZXgsIGxlbmd0aCwgbWFyaywgeyBub3JtYWxpemUgfSlcbiAgfSlcbn1cblxuLyoqXG4gKiBEZWxldGUgZXZlcnl0aGluZyBpbiBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBpZiAocmFuZ2UuaXNDb2xsYXBzZWQpIHJldHVyblxuXG4gIC8vIFNuYXBzaG90IHRoZSBzZWxlY3Rpb24sIHdoaWNoIGNyZWF0ZXMgYW4gZXh0cmEgdW5kbyBzYXZlIHBvaW50LCBzbyB0aGF0XG4gIC8vIHdoZW4geW91IHVuZG8gYSBkZWxldGUsIHRoZSBleHBhbmRlZCBzZWxlY3Rpb24gd2lsbCBiZSByZXRhaW5lZC5cbiAgY2hhbmdlLnNuYXBzaG90U2VsZWN0aW9uKClcblxuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGxldCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgZW5kS2V5LCBlbmRPZmZzZXQgfSA9IHJhbmdlXG4gIGxldCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBsZXQgaXNTdGFydFZvaWQgPSBkb2N1bWVudC5oYXNWb2lkUGFyZW50KHN0YXJ0S2V5KVxuICBsZXQgaXNFbmRWb2lkID0gZG9jdW1lbnQuaGFzVm9pZFBhcmVudChlbmRLZXkpXG4gIGxldCBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICBsZXQgZW5kQmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soZW5kS2V5KVxuXG4gIC8vIENoZWNrIGlmIHdlIGhhdmUgYSBcImhhbmdpbmdcIiBzZWxlY3Rpb24gY2FzZSB3aGVyZSB0aGUgZXZlbiB0aG91Z2ggdGhlXG4gIC8vIHNlbGVjdGlvbiBleHRlbmRzIGludG8gdGhlIHN0YXJ0IG9mIHRoZSBlbmQgbm9kZSwgd2UgYWN0dWFsbHkgd2FudCB0b1xuICAvLyBpZ25vcmUgdGhhdCBmb3IgVVggcmVhc29ucy5cbiAgY29uc3QgaXNIYW5naW5nID0gKFxuICAgIHN0YXJ0T2Zmc2V0ID09IDAgJiZcbiAgICBlbmRPZmZzZXQgPT0gMCAmJlxuICAgIGlzU3RhcnRWb2lkID09IGZhbHNlICYmXG4gICAgc3RhcnRLZXkgPT0gc3RhcnRCbG9jay5nZXRGaXJzdFRleHQoKS5rZXkgJiZcbiAgICBlbmRLZXkgPT0gZW5kQmxvY2suZ2V0Rmlyc3RUZXh0KCkua2V5XG4gIClcblxuICAvLyBJZiBpdCdzIGEgaGFuZ2luZyBzZWxlY3Rpb24sIG51ZGdlIGl0IGJhY2sgdG8gZW5kIGluIHRoZSBwcmV2aW91cyB0ZXh0LlxuICBpZiAoaXNIYW5naW5nICYmIGlzRW5kVm9pZCkge1xuICAgIGNvbnN0IHByZXZUZXh0ID0gZG9jdW1lbnQuZ2V0UHJldmlvdXNUZXh0KGVuZEtleSlcbiAgICBlbmRLZXkgPSBwcmV2VGV4dC5rZXlcbiAgICBlbmRPZmZzZXQgPSBwcmV2VGV4dC50ZXh0Lmxlbmd0aFxuICAgIGlzRW5kVm9pZCA9IGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQoZW5kS2V5KVxuICB9XG5cbiAgLy8gSWYgdGhlIHN0YXJ0IG5vZGUgaXMgaW5zaWRlIGEgdm9pZCBub2RlLCByZW1vdmUgdGhlIHZvaWQgbm9kZSBhbmQgdXBkYXRlXG4gIC8vIHRoZSBzdGFydGluZyBwb2ludCB0byBiZSByaWdodCBhZnRlciBpdCwgY29udGludW91c2x5IHVudGlsIHRoZSBzdGFydCBwb2ludFxuICAvLyBpcyBub3QgYSB2b2lkLCBvciB1bnRpbCB0aGUgZW50aXJlIHJhbmdlIGlzIGhhbmRsZWQuXG4gIHdoaWxlIChpc1N0YXJ0Vm9pZCkge1xuICAgIGNvbnN0IHN0YXJ0Vm9pZCA9IGRvY3VtZW50LmdldENsb3Nlc3RWb2lkKHN0YXJ0S2V5KVxuICAgIGNvbnN0IG5leHRUZXh0ID0gZG9jdW1lbnQuZ2V0TmV4dFRleHQoc3RhcnRLZXkpXG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShzdGFydFZvaWQua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcblxuICAgIC8vIElmIHRoZSBzdGFydCBhbmQgZW5kIGtleXMgYXJlIHRoZSBzYW1lLCB3ZSdyZSBkb25lLlxuICAgIGlmIChzdGFydEtleSA9PSBlbmRLZXkpIHJldHVyblxuXG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gbmV4dCB0ZXh0IG5vZGUsIHdlJ3JlIGRvbmUuXG4gICAgaWYgKCFuZXh0VGV4dCkgcmV0dXJuXG5cbiAgICAvLyBDb250aW51ZS4uLlxuICAgIGRvY3VtZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50XG4gICAgc3RhcnRLZXkgPSBuZXh0VGV4dC5rZXlcbiAgICBzdGFydE9mZnNldCA9IDBcbiAgICBpc1N0YXJ0Vm9pZCA9IGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQoc3RhcnRLZXkpXG4gIH1cblxuICAvLyBJZiB0aGUgZW5kIG5vZGUgaXMgaW5zaWRlIGEgdm9pZCBub2RlLCBkbyB0aGUgc2FtZSB0aGluZyBidXQgYmFja3dhcmRzLiBCdXRcbiAgLy8gd2UgZG9uJ3QgbmVlZCBhbnkgYWJvcnRpbmcgY2hlY2tzIGJlY2F1c2UgaWYgd2UndmUgZ290dGVuIHRoaXMgZmFyIHRoZXJlXG4gIC8vIG11c3QgYmUgYSBub24tdm9pZCBub2RlIHRoYXQgd2lsbCBleGl0IHRoZSBsb29wLlxuICB3aGlsZSAoaXNFbmRWb2lkKSB7XG4gICAgY29uc3QgZW5kVm9pZCA9IGRvY3VtZW50LmdldENsb3Nlc3RWb2lkKGVuZEtleSlcbiAgICBjb25zdCBwcmV2VGV4dCA9IGRvY3VtZW50LmdldFByZXZpb3VzVGV4dChlbmRLZXkpXG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShlbmRWb2lkLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgICAvLyBDb250aW51ZS4uLlxuICAgIGRvY3VtZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50XG4gICAgZW5kS2V5ID0gcHJldlRleHQua2V5XG4gICAgZW5kT2Zmc2V0ID0gcHJldlRleHQudGV4dC5sZW5ndGhcbiAgICBpc0VuZFZvaWQgPSBkb2N1bWVudC5oYXNWb2lkUGFyZW50KGVuZEtleSlcbiAgfVxuXG4gIC8vIElmIHRoZSBzdGFydCBhbmQgZW5kIGtleSBhcmUgdGhlIHNhbWUsIGFuZCBpdCB3YXMgYSBoYW5naW5nIHNlbGVjdGlvbiwgd2VcbiAgLy8gY2FuIGp1c3QgcmVtb3ZlIHRoZSBlbnRpcmUgYmxvY2suXG4gIGlmIChzdGFydEtleSA9PSBlbmRLZXkgJiYgaXNIYW5naW5nKSB7XG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShzdGFydEJsb2NrLmtleSwgeyBub3JtYWxpemUgfSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIE90aGVyd2lzZSwgaWYgaXQgd2Fzbid0IGhhbmdpbmcsIHdlJ3JlIGluc2lkZSBhIHNpbmdsZSB0ZXh0IG5vZGUsIHNvIHdlIGNhblxuICAvLyBzaW1wbHkgcmVtb3ZlIHRoZSB0ZXh0IGluIHRoZSByYW5nZS5cbiAgZWxzZSBpZiAoc3RhcnRLZXkgPT0gZW5kS2V5KSB7XG4gICAgY29uc3QgaW5kZXggPSBzdGFydE9mZnNldFxuICAgIGNvbnN0IGxlbmd0aCA9IGVuZE9mZnNldCAtIHN0YXJ0T2Zmc2V0XG4gICAgY2hhbmdlLnJlbW92ZVRleHRCeUtleShzdGFydEtleSwgaW5kZXgsIGxlbmd0aCwgeyBub3JtYWxpemUgfSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIE90aGVyd2lzZSwgd2UgbmVlZCB0byByZWN1cnNpdmVseSByZW1vdmUgdGV4dCBhbmQgbm9kZXMgaW5zaWRlIHRoZSBzdGFydFxuICAvLyBibG9jayBhZnRlciB0aGUgc3RhcnQgb2Zmc2V0IGFuZCBpbnNpZGUgdGhlIGVuZCBibG9jayBiZWZvcmUgdGhlIGVuZFxuICAvLyBvZmZzZXQuIFRoZW4gcmVtb3ZlIGFueSBibG9ja3MgdGhhdCBhcmUgaW4gYmV0d2VlbiB0aGUgc3RhcnQgYW5kIGVuZFxuICAvLyBibG9ja3MuIFRoZW4gZmluYWxseSBtZXJnZSB0aGUgc3RhcnQgYW5kIGVuZCBub2Rlcy5cbiAgZWxzZSB7XG4gICAgc3RhcnRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhzdGFydEtleSlcbiAgICBlbmRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhlbmRLZXkpXG4gICAgY29uc3Qgc3RhcnRUZXh0ID0gZG9jdW1lbnQuZ2V0Tm9kZShzdGFydEtleSlcbiAgICBjb25zdCBlbmRUZXh0ID0gZG9jdW1lbnQuZ2V0Tm9kZShlbmRLZXkpXG4gICAgY29uc3Qgc3RhcnRMZW5ndGggPSBzdGFydFRleHQudGV4dC5sZW5ndGggLSBzdGFydE9mZnNldFxuICAgIGNvbnN0IGVuZExlbmd0aCA9IGVuZE9mZnNldFxuXG4gICAgY29uc3QgYW5jZXN0b3IgPSBkb2N1bWVudC5nZXRDb21tb25BbmNlc3RvcihzdGFydEtleSwgZW5kS2V5KVxuICAgIGNvbnN0IHN0YXJ0Q2hpbGQgPSBhbmNlc3Rvci5nZXRGdXJ0aGVzdEFuY2VzdG9yKHN0YXJ0S2V5KVxuICAgIGNvbnN0IGVuZENoaWxkID0gYW5jZXN0b3IuZ2V0RnVydGhlc3RBbmNlc3RvcihlbmRLZXkpXG5cbiAgICBjb25zdCBzdGFydFBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChzdGFydEJsb2NrLmtleSlcbiAgICBjb25zdCBzdGFydFBhcmVudEluZGV4ID0gc3RhcnRQYXJlbnQubm9kZXMuaW5kZXhPZihzdGFydEJsb2NrKVxuICAgIGNvbnN0IGVuZFBhcmVudEluZGV4ID0gc3RhcnRQYXJlbnQubm9kZXMuaW5kZXhPZihlbmRCbG9jaylcblxuICAgIGxldCBjaGlsZFxuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGFsbCBvZiB0aGUgbm9kZXMgaW4gdGhlIHRyZWUgYWZ0ZXIgdGhlIHN0YXJ0IHRleHQgbm9kZVxuICAgIC8vIGJ1dCBpbnNpZGUgdGhlIGVuZCBjaGlsZCwgYW5kIHJlbW92ZSB0aGVtLlxuICAgIGNoaWxkID0gc3RhcnRUZXh0XG5cbiAgICB3aGlsZSAoY2hpbGQua2V5ICE9IHN0YXJ0Q2hpbGQua2V5KSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoY2hpbGQua2V5KVxuICAgICAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihjaGlsZClcbiAgICAgIGNvbnN0IGFmdGVycyA9IHBhcmVudC5ub2Rlcy5zbGljZShpbmRleCArIDEpXG5cbiAgICAgIGFmdGVycy5yZXZlcnNlKCkuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KG5vZGUua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgIH0pXG5cbiAgICAgIGNoaWxkID0gcGFyZW50XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIGFsbCBvZiB0aGUgbWlkZGxlIGNoaWxkcmVuLlxuICAgIGNvbnN0IHN0YXJ0Q2hpbGRJbmRleCA9IGFuY2VzdG9yLm5vZGVzLmluZGV4T2Yoc3RhcnRDaGlsZClcbiAgICBjb25zdCBlbmRDaGlsZEluZGV4ID0gYW5jZXN0b3Iubm9kZXMuaW5kZXhPZihlbmRDaGlsZClcbiAgICBjb25zdCBtaWRkbGVzID0gYW5jZXN0b3Iubm9kZXMuc2xpY2Uoc3RhcnRDaGlsZEluZGV4ICsgMSwgZW5kQ2hpbGRJbmRleClcblxuICAgIG1pZGRsZXMucmV2ZXJzZSgpLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkobm9kZS5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIH0pXG5cbiAgICAvLyBSZW1vdmUgdGhlIG5vZGVzIGJlZm9yZSB0aGUgZW5kIHRleHQgbm9kZSBpbiB0aGUgdHJlZS5cbiAgICBjaGlsZCA9IGVuZFRleHRcblxuICAgIHdoaWxlIChjaGlsZC5rZXkgIT0gZW5kQ2hpbGQua2V5KSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoY2hpbGQua2V5KVxuICAgICAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihjaGlsZClcbiAgICAgIGNvbnN0IGJlZm9yZXMgPSBwYXJlbnQubm9kZXMuc2xpY2UoMCwgaW5kZXgpXG5cbiAgICAgIGJlZm9yZXMucmV2ZXJzZSgpLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShub2RlLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICB9KVxuXG4gICAgICBjaGlsZCA9IHBhcmVudFxuICAgIH1cblxuICAgIC8vIFJlbW92ZSBhbnkgb3ZlcmxhcHBpbmcgdGV4dCBjb250ZW50IGZyb20gdGhlIGxlYWYgdGV4dCBub2Rlcy5cbiAgICBpZiAoc3RhcnRMZW5ndGggIT0gMCkge1xuICAgICAgY2hhbmdlLnJlbW92ZVRleHRCeUtleShzdGFydEtleSwgc3RhcnRPZmZzZXQsIHN0YXJ0TGVuZ3RoLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICB9XG5cbiAgICBpZiAoZW5kTGVuZ3RoICE9IDApIHtcbiAgICAgIGNoYW5nZS5yZW1vdmVUZXh0QnlLZXkoZW5kS2V5LCAwLCBlbmRPZmZzZXQsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIH1cblxuICAgIC8vIElmIHRoZSBzdGFydCBhbmQgZW5kIGJsb2NrcyBhcmVuJ3QgdGhlIHNhbWUsIG1vdmUgYW5kIG1lcmdlIHRoZSBlbmQgYmxvY2tcbiAgICAvLyBpbnRvIHRoZSBzdGFydCBibG9jay5cbiAgICBpZiAoc3RhcnRCbG9jay5rZXkgIT0gZW5kQmxvY2sua2V5KSB7XG4gICAgICBkb2N1bWVudCA9IGNoYW5nZS52YWx1ZS5kb2N1bWVudFxuICAgICAgY29uc3QgbG9uZWx5ID0gZG9jdW1lbnQuZ2V0RnVydGhlc3RPbmx5Q2hpbGRBbmNlc3RvcihlbmRCbG9jay5rZXkpXG5cbiAgICAgIC8vIE1vdmUgdGhlIGVuZCBibG9jayB0byBiZSByaWdodCBhZnRlciB0aGUgc3RhcnQgYmxvY2suXG4gICAgICBpZiAoZW5kUGFyZW50SW5kZXggIT0gc3RhcnRQYXJlbnRJbmRleCArIDEpIHtcbiAgICAgICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoZW5kQmxvY2sua2V5LCBzdGFydFBhcmVudC5rZXksIHN0YXJ0UGFyZW50SW5kZXggKyAxKVxuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgc2VsZWN0aW9uIGlzIGhhbmdpbmcsIGp1c3QgcmVtb3ZlIHRoZSBzdGFydCBibG9jaywgb3RoZXJ3aXNlXG4gICAgICAvLyBtZXJnZSB0aGUgZW5kIGJsb2NrIGludG8gaXQuXG4gICAgICBpZiAoaXNIYW5naW5nKSB7XG4gICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoc3RhcnRCbG9jay5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hhbmdlLm1lcmdlTm9kZUJ5S2V5KGVuZEJsb2NrLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5lc3RlZCBlbXB0eSBibG9ja3MgYXJlIGxlZnQgb3ZlciBhYm92ZSB0aGUgZW5kIGJsb2NrLCByZW1vdmUgdGhlbS5cbiAgICAgIGlmIChsb25lbHkpIHtcbiAgICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShsb25lbHkua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBzaG91bGQgbm9ybWFsaXplLCBkbyBpdCBub3cgYWZ0ZXIgZXZlcnl0aGluZy5cbiAgICBpZiAobm9ybWFsaXplKSB7XG4gICAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KGFuY2VzdG9yLmtleSlcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBEZWxldGUgYmFja3dhcmQgdW50aWwgdGhlIGNoYXJhY3RlciBib3VuZGFyeSBhdCBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVDaGFyQmFja3dhcmRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICBjb25zdCBvZmZzZXQgPSBzdGFydEJsb2NrLmdldE9mZnNldChzdGFydEtleSlcbiAgY29uc3QgbyA9IG9mZnNldCArIHN0YXJ0T2Zmc2V0XG4gIGNvbnN0IHsgdGV4dCB9ID0gc3RhcnRCbG9ja1xuICBjb25zdCBuID0gU3RyaW5nLmdldENoYXJPZmZzZXRCYWNrd2FyZCh0ZXh0LCBvKVxuICBjaGFuZ2UuZGVsZXRlQmFja3dhcmRBdFJhbmdlKHJhbmdlLCBuLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIERlbGV0ZSBiYWNrd2FyZCB1bnRpbCB0aGUgbGluZSBib3VuZGFyeSBhdCBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVMaW5lQmFja3dhcmRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICBjb25zdCBvZmZzZXQgPSBzdGFydEJsb2NrLmdldE9mZnNldChzdGFydEtleSlcbiAgY29uc3QgbyA9IG9mZnNldCArIHN0YXJ0T2Zmc2V0XG4gIGNoYW5nZS5kZWxldGVCYWNrd2FyZEF0UmFuZ2UocmFuZ2UsIG8sIG9wdGlvbnMpXG59XG5cbi8qKlxuICogRGVsZXRlIGJhY2t3YXJkIHVudGlsIHRoZSB3b3JkIGJvdW5kYXJ5IGF0IGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmRlbGV0ZVdvcmRCYWNrd2FyZEF0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG4gIGNvbnN0IHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gIGNvbnN0IG9mZnNldCA9IHN0YXJ0QmxvY2suZ2V0T2Zmc2V0KHN0YXJ0S2V5KVxuICBjb25zdCBvID0gb2Zmc2V0ICsgc3RhcnRPZmZzZXRcbiAgY29uc3QgeyB0ZXh0IH0gPSBzdGFydEJsb2NrXG4gIGNvbnN0IG4gPSBTdHJpbmcuZ2V0V29yZE9mZnNldEJhY2t3YXJkKHRleHQsIG8pXG4gIGNoYW5nZS5kZWxldGVCYWNrd2FyZEF0UmFuZ2UocmFuZ2UsIG4sIG9wdGlvbnMpXG59XG5cbi8qKlxuICogRGVsZXRlIGJhY2t3YXJkIGBuYCBjaGFyYWN0ZXJzIGF0IGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtOdW1iZXJ9IG4gKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmRlbGV0ZUJhY2t3YXJkQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBuID0gMSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgZm9jdXNPZmZzZXQgfSA9IHJhbmdlXG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGV4cGFuZGVkLCBwZXJmb3JtIGEgcmVndWxhciBkZWxldGUgaW5zdGVhZC5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemUgfSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IGJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuXG4gIC8vIElmIHRoZSBjbG9zZXN0IGJsb2NrIGlzIHZvaWQsIGRlbGV0ZSBpdC5cbiAgaWYgKGJsb2NrICYmIGJsb2NrLmlzVm9pZCkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoYmxvY2sua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIGNsb3Nlc3QgaXMgbm90IHZvaWQsIGJ1dCBlbXB0eSwgcmVtb3ZlIGl0XG4gIGlmIChibG9jayAmJiAhYmxvY2suaXNWb2lkICYmIGJsb2NrLmlzRW1wdHkgJiYgZG9jdW1lbnQubm9kZXMuc2l6ZSAhPT0gMSkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoYmxvY2sua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIGNsb3Nlc3QgaW5saW5lIGlzIHZvaWQsIGRlbGV0ZSBpdC5cbiAgY29uc3QgaW5saW5lID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShzdGFydEtleSlcbiAgaWYgKGlubGluZSAmJiBpbmxpbmUuaXNWb2lkKSB7XG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShpbmxpbmUua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgZG9jdW1lbnQsIGFib3J0LlxuICBpZiAocmFuZ2UuaXNBdFN0YXJ0T2YoZG9jdW1lbnQpKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBJZiB0aGUgcmFuZ2UgaXMgYXQgdGhlIHN0YXJ0IG9mIHRoZSB0ZXh0IG5vZGUsIHdlIG5lZWQgdG8gZmlndXJlIG91dCB3aGF0XG4gIC8vIGlzIGJlaGluZCBpdCB0byBrbm93IGhvdyB0byBkZWxldGUuLi5cbiAgY29uc3QgdGV4dCA9IGRvY3VtZW50LmdldERlc2NlbmRhbnQoc3RhcnRLZXkpXG4gIGlmIChyYW5nZS5pc0F0U3RhcnRPZih0ZXh0KSkge1xuICAgIGNvbnN0IHByZXYgPSBkb2N1bWVudC5nZXRQcmV2aW91c1RleHQodGV4dC5rZXkpXG4gICAgY29uc3QgcHJldkJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHByZXYua2V5KVxuICAgIGNvbnN0IHByZXZJbmxpbmUgPSBkb2N1bWVudC5nZXRDbG9zZXN0SW5saW5lKHByZXYua2V5KVxuXG4gICAgLy8gSWYgdGhlIHByZXZpb3VzIGJsb2NrIGlzIHZvaWQsIHJlbW92ZSBpdC5cbiAgICBpZiAocHJldkJsb2NrICYmIHByZXZCbG9jay5pc1ZvaWQpIHtcbiAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkocHJldkJsb2NrLmtleSwgeyBub3JtYWxpemUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIHRoZSBwcmV2aW91cyBpbmxpbmUgaXMgdm9pZCwgcmVtb3ZlIGl0LlxuICAgIGlmIChwcmV2SW5saW5lICYmIHByZXZJbmxpbmUuaXNWb2lkKSB7XG4gICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KHByZXZJbmxpbmUua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gSWYgd2UncmUgZGVsZXRpbmcgYnkgb25lIGNoYXJhY3RlciBhbmQgdGhlIHByZXZpb3VzIHRleHQgbm9kZSBpcyBub3RcbiAgICAvLyBpbnNpZGUgdGhlIGN1cnJlbnQgYmxvY2ssIHdlIG5lZWQgdG8gbWVyZ2UgdGhlIHR3byBibG9ja3MgdG9nZXRoZXIuXG4gICAgaWYgKG4gPT0gMSAmJiBwcmV2QmxvY2sgIT0gYmxvY2spIHtcbiAgICAgIHJhbmdlID0gcmFuZ2UubWVyZ2Uoe1xuICAgICAgICBhbmNob3JLZXk6IHByZXYua2V5LFxuICAgICAgICBhbmNob3JPZmZzZXQ6IHByZXYudGV4dC5sZW5ndGgsXG4gICAgICB9KVxuXG4gICAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBmb2N1cyBvZmZzZXQgaXMgZmFydGhlciB0aGFuIHRoZSBudW1iZXIgb2YgY2hhcmFjdGVycyB0byBkZWxldGUsXG4gIC8vIGp1c3QgcmVtb3ZlIHRoZSBjaGFyYWN0ZXJzIGJhY2t3YXJkcyBpbnNpZGUgdGhlIGN1cnJlbnQgbm9kZS5cbiAgaWYgKG4gPCBmb2N1c09mZnNldCkge1xuICAgIHJhbmdlID0gcmFuZ2UubWVyZ2Uoe1xuICAgICAgZm9jdXNPZmZzZXQ6IGZvY3VzT2Zmc2V0IC0gbixcbiAgICAgIGlzQmFja3dhcmQ6IHRydWUsXG4gICAgfSlcblxuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCB3ZSBuZWVkIHRvIHNlZSBob3cgbWFueSBub2RlcyBiYWNrd2FyZHMgdG8gZ28uXG4gIGxldCBub2RlID0gdGV4dFxuICBsZXQgb2Zmc2V0ID0gMFxuICBsZXQgdHJhdmVyc2VkID0gZm9jdXNPZmZzZXRcblxuICB3aGlsZSAobiA+IHRyYXZlcnNlZCkge1xuICAgIG5vZGUgPSBkb2N1bWVudC5nZXRQcmV2aW91c1RleHQobm9kZS5rZXkpXG4gICAgY29uc3QgbmV4dCA9IHRyYXZlcnNlZCArIG5vZGUudGV4dC5sZW5ndGhcbiAgICBpZiAobiA8PSBuZXh0KSB7XG4gICAgICBvZmZzZXQgPSBuZXh0IC0gblxuICAgICAgYnJlYWtcbiAgICB9IGVsc2Uge1xuICAgICAgdHJhdmVyc2VkID0gbmV4dFxuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBmb2N1cyBub2RlIGlzIGluc2lkZSBhIHZvaWQsIGdvIHVwIHVudGlsIHJpZ2h0IGFmdGVyIGl0LlxuICBpZiAoZG9jdW1lbnQuaGFzVm9pZFBhcmVudChub2RlLmtleSkpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRDbG9zZXN0Vm9pZChub2RlLmtleSlcbiAgICBub2RlID0gZG9jdW1lbnQuZ2V0TmV4dFRleHQocGFyZW50LmtleSlcbiAgICBvZmZzZXQgPSAwXG4gIH1cblxuICByYW5nZSA9IHJhbmdlLm1lcmdlKHtcbiAgICBmb2N1c0tleTogbm9kZS5rZXksXG4gICAgZm9jdXNPZmZzZXQ6IG9mZnNldCxcbiAgICBpc0JhY2t3YXJkOiB0cnVlXG4gIH0pXG5cbiAgY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UsIHsgbm9ybWFsaXplIH0pXG59XG5cbi8qKlxuICogRGVsZXRlIGZvcndhcmQgdW50aWwgdGhlIGNoYXJhY3RlciBib3VuZGFyeSBhdCBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVDaGFyRm9yd2FyZEF0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG4gIGNvbnN0IHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gIGNvbnN0IG9mZnNldCA9IHN0YXJ0QmxvY2suZ2V0T2Zmc2V0KHN0YXJ0S2V5KVxuICBjb25zdCBvID0gb2Zmc2V0ICsgc3RhcnRPZmZzZXRcbiAgY29uc3QgeyB0ZXh0IH0gPSBzdGFydEJsb2NrXG4gIGNvbnN0IG4gPSBTdHJpbmcuZ2V0Q2hhck9mZnNldEZvcndhcmQodGV4dCwgbylcbiAgY2hhbmdlLmRlbGV0ZUZvcndhcmRBdFJhbmdlKHJhbmdlLCBuLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIERlbGV0ZSBmb3J3YXJkIHVudGlsIHRoZSBsaW5lIGJvdW5kYXJ5IGF0IGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmRlbGV0ZUxpbmVGb3J3YXJkQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCB9ID0gcmFuZ2VcbiAgY29uc3Qgc3RhcnRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhzdGFydEtleSlcbiAgY29uc3Qgb2Zmc2V0ID0gc3RhcnRCbG9jay5nZXRPZmZzZXQoc3RhcnRLZXkpXG4gIGNvbnN0IG8gPSBvZmZzZXQgKyBzdGFydE9mZnNldFxuICBjaGFuZ2UuZGVsZXRlRm9yd2FyZEF0UmFuZ2UocmFuZ2UsIG8sIG9wdGlvbnMpXG59XG5cbi8qKlxuICogRGVsZXRlIGZvcndhcmQgdW50aWwgdGhlIHdvcmQgYm91bmRhcnkgYXQgYSBgcmFuZ2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuZGVsZXRlV29yZEZvcndhcmRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICBjb25zdCBvZmZzZXQgPSBzdGFydEJsb2NrLmdldE9mZnNldChzdGFydEtleSlcbiAgY29uc3QgbyA9IG9mZnNldCArIHN0YXJ0T2Zmc2V0XG4gIGNvbnN0IHsgdGV4dCB9ID0gc3RhcnRCbG9ja1xuICBjb25zdCBuID0gU3RyaW5nLmdldFdvcmRPZmZzZXRGb3J3YXJkKHRleHQsIG8pXG4gIGNoYW5nZS5kZWxldGVGb3J3YXJkQXRSYW5nZShyYW5nZSwgbiwgb3B0aW9ucylcbn1cblxuLyoqXG4gKiBEZWxldGUgZm9yd2FyZCBgbmAgY2hhcmFjdGVycyBhdCBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBuIChvcHRpb25hbClcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5kZWxldGVGb3J3YXJkQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBuID0gMSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgZm9jdXNPZmZzZXQgfSA9IHJhbmdlXG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGV4cGFuZGVkLCBwZXJmb3JtIGEgcmVndWxhciBkZWxldGUgaW5zdGVhZC5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemUgfSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNvbnN0IGJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuXG4gIC8vIElmIHRoZSBjbG9zZXN0IGJsb2NrIGlzIHZvaWQsIGRlbGV0ZSBpdC5cbiAgaWYgKGJsb2NrICYmIGJsb2NrLmlzVm9pZCkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoYmxvY2sua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIGNsb3Nlc3QgaXMgbm90IHZvaWQsIGJ1dCBlbXB0eSwgcmVtb3ZlIGl0XG4gIGlmIChibG9jayAmJiAhYmxvY2suaXNWb2lkICYmIGJsb2NrLmlzRW1wdHkgJiYgZG9jdW1lbnQubm9kZXMuc2l6ZSAhPT0gMSkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoYmxvY2sua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIGNsb3Nlc3QgaW5saW5lIGlzIHZvaWQsIGRlbGV0ZSBpdC5cbiAgY29uc3QgaW5saW5lID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShzdGFydEtleSlcbiAgaWYgKGlubGluZSAmJiBpbmxpbmUuaXNWb2lkKSB7XG4gICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShpbmxpbmUua2V5LCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgZG9jdW1lbnQsIGFib3J0LlxuICBpZiAocmFuZ2UuaXNBdEVuZE9mKGRvY3VtZW50KSkge1xuICAgIHJldHVyblxuICB9XG5cbiAgLy8gSWYgdGhlIHJhbmdlIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgdGV4dCBub2RlLCB3ZSBuZWVkIHRvIGZpZ3VyZSBvdXQgd2hhdFxuICAvLyBpcyBiZWhpbmQgaXQgdG8ga25vdyBob3cgdG8gZGVsZXRlLi4uXG4gIGNvbnN0IHRleHQgPSBkb2N1bWVudC5nZXREZXNjZW5kYW50KHN0YXJ0S2V5KVxuICBpZiAocmFuZ2UuaXNBdEVuZE9mKHRleHQpKSB7XG4gICAgY29uc3QgbmV4dCA9IGRvY3VtZW50LmdldE5leHRUZXh0KHRleHQua2V5KVxuICAgIGNvbnN0IG5leHRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhuZXh0LmtleSlcbiAgICBjb25zdCBuZXh0SW5saW5lID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShuZXh0LmtleSlcblxuICAgIC8vIElmIHRoZSBwcmV2aW91cyBibG9jayBpcyB2b2lkLCByZW1vdmUgaXQuXG4gICAgaWYgKG5leHRCbG9jayAmJiBuZXh0QmxvY2suaXNWb2lkKSB7XG4gICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KG5leHRCbG9jay5rZXksIHsgbm9ybWFsaXplIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcHJldmlvdXMgaW5saW5lIGlzIHZvaWQsIHJlbW92ZSBpdC5cbiAgICBpZiAobmV4dElubGluZSAmJiBuZXh0SW5saW5lLmlzVm9pZCkge1xuICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShuZXh0SW5saW5lLmtleSwgeyBub3JtYWxpemUgfSlcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIC8vIElmIHdlJ3JlIGRlbGV0aW5nIGJ5IG9uZSBjaGFyYWN0ZXIgYW5kIHRoZSBwcmV2aW91cyB0ZXh0IG5vZGUgaXMgbm90XG4gICAgLy8gaW5zaWRlIHRoZSBjdXJyZW50IGJsb2NrLCB3ZSBuZWVkIHRvIG1lcmdlIHRoZSB0d28gYmxvY2tzIHRvZ2V0aGVyLlxuICAgIGlmIChuID09IDEgJiYgbmV4dEJsb2NrICE9IGJsb2NrKSB7XG4gICAgICByYW5nZSA9IHJhbmdlLm1lcmdlKHtcbiAgICAgICAgZm9jdXNLZXk6IG5leHQua2V5LFxuICAgICAgICBmb2N1c09mZnNldDogMFxuICAgICAgfSlcblxuICAgICAgY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UsIHsgbm9ybWFsaXplIH0pXG4gICAgICByZXR1cm5cbiAgICB9XG4gIH1cblxuICAvLyBJZiB0aGUgcmVtYWluaW5nIGNoYXJhY3RlcnMgdG8gdGhlIGVuZCBvZiB0aGUgbm9kZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWxcbiAgLy8gdG8gdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRvIGRlbGV0ZSwganVzdCByZW1vdmUgdGhlIGNoYXJhY3RlcnMgZm9yd2FyZHNcbiAgLy8gaW5zaWRlIHRoZSBjdXJyZW50IG5vZGUuXG4gIGlmIChuIDw9ICh0ZXh0LnRleHQubGVuZ3RoIC0gZm9jdXNPZmZzZXQpKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5tZXJnZSh7XG4gICAgICBmb2N1c09mZnNldDogZm9jdXNPZmZzZXQgKyBuXG4gICAgfSlcblxuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJldHVyblxuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCB3ZSBuZWVkIHRvIHNlZSBob3cgbWFueSBub2RlcyBmb3J3YXJkcyB0byBnby5cbiAgbGV0IG5vZGUgPSB0ZXh0XG4gIGxldCBvZmZzZXQgPSBmb2N1c09mZnNldFxuICBsZXQgdHJhdmVyc2VkID0gdGV4dC50ZXh0Lmxlbmd0aCAtIGZvY3VzT2Zmc2V0XG5cbiAgd2hpbGUgKG4gPiB0cmF2ZXJzZWQpIHtcbiAgICBub2RlID0gZG9jdW1lbnQuZ2V0TmV4dFRleHQobm9kZS5rZXkpXG4gICAgY29uc3QgbmV4dCA9IHRyYXZlcnNlZCArIG5vZGUudGV4dC5sZW5ndGhcbiAgICBpZiAobiA8PSBuZXh0KSB7XG4gICAgICBvZmZzZXQgPSBuIC0gdHJhdmVyc2VkXG4gICAgICBicmVha1xuICAgIH0gZWxzZSB7XG4gICAgICB0cmF2ZXJzZWQgPSBuZXh0XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlIGZvY3VzIG5vZGUgaXMgaW5zaWRlIGEgdm9pZCwgZ28gdXAgdW50aWwgcmlnaHQgYmVmb3JlIGl0LlxuICBpZiAoZG9jdW1lbnQuaGFzVm9pZFBhcmVudChub2RlLmtleSkpIHtcbiAgICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRDbG9zZXN0Vm9pZChub2RlLmtleSlcbiAgICBub2RlID0gZG9jdW1lbnQuZ2V0UHJldmlvdXNUZXh0KHBhcmVudC5rZXkpXG4gICAgb2Zmc2V0ID0gbm9kZS50ZXh0Lmxlbmd0aFxuICB9XG5cbiAgcmFuZ2UgPSByYW5nZS5tZXJnZSh7XG4gICAgZm9jdXNLZXk6IG5vZGUua2V5LFxuICAgIGZvY3VzT2Zmc2V0OiBvZmZzZXQsXG4gIH0pXG5cbiAgY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UsIHsgbm9ybWFsaXplIH0pXG59XG5cbi8qKlxuICogSW5zZXJ0IGEgYGJsb2NrYCBub2RlIGF0IGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7QmxvY2t8U3RyaW5nfE9iamVjdH0gYmxvY2tcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5pbnNlcnRCbG9ja0F0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgYmxvY2ssIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBibG9jayA9IEJsb2NrLmNyZWF0ZShibG9jaylcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSlcbiAgICByYW5nZSA9IHJhbmdlLmNvbGxhcHNlVG9TdGFydCgpXG4gIH1cblxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG4gIGNvbnN0IHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChzdGFydEJsb2NrLmtleSlcbiAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihzdGFydEJsb2NrKVxuXG4gIGlmIChzdGFydEJsb2NrLmlzVm9pZCkge1xuICAgIGNvbnN0IGV4dHJhID0gcmFuZ2UuaXNBdEVuZE9mKHN0YXJ0QmxvY2spID8gMSA6IDBcbiAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHBhcmVudC5rZXksIGluZGV4ICsgZXh0cmEsIGJsb2NrLCB7IG5vcm1hbGl6ZSB9KVxuICB9XG5cbiAgZWxzZSBpZiAoc3RhcnRCbG9jay5pc0VtcHR5KSB7XG4gICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCArIDEsIGJsb2NrLCB7IG5vcm1hbGl6ZSB9KVxuICB9XG5cbiAgZWxzZSBpZiAocmFuZ2UuaXNBdFN0YXJ0T2Yoc3RhcnRCbG9jaykpIHtcbiAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHBhcmVudC5rZXksIGluZGV4LCBibG9jaywgeyBub3JtYWxpemUgfSlcbiAgfVxuXG4gIGVsc2UgaWYgKHJhbmdlLmlzQXRFbmRPZihzdGFydEJsb2NrKSkge1xuICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkocGFyZW50LmtleSwgaW5kZXggKyAxLCBibG9jaywgeyBub3JtYWxpemUgfSlcbiAgfVxuXG4gIGVsc2Uge1xuICAgIGNoYW5nZS5zcGxpdERlc2NlbmRhbnRzQnlLZXkoc3RhcnRCbG9jay5rZXksIHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCArIDEsIGJsb2NrLCB7IG5vcm1hbGl6ZSB9KVxuICB9XG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIEluc2VydCBhIGBmcmFnbWVudGAgYXQgYSBgcmFuZ2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge0RvY3VtZW50fSBmcmFnbWVudFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmluc2VydEZyYWdtZW50QXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBmcmFnbWVudCwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuXG4gIC8vIElmIHRoZSByYW5nZSBpcyBleHBhbmRlZCwgZGVsZXRlIGl0IGZpcnN0LlxuICBpZiAocmFuZ2UuaXNFeHBhbmRlZCkge1xuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICByYW5nZSA9IHJhbmdlLmNvbGxhcHNlVG9TdGFydCgpXG4gIH1cblxuICAvLyBJZiB0aGUgZnJhZ21lbnQgaXMgZW1wdHksIHRoZXJlJ3Mgbm90aGluZyB0byBkbyBhZnRlciBkZWxldGluZy5cbiAgaWYgKCFmcmFnbWVudC5ub2Rlcy5zaXplKSByZXR1cm5cblxuICAvLyBSZWdlbmVyYXRlIHRoZSBrZXlzIGZvciBhbGwgb2YgdGhlIGZyYWdtZW50cyBub2Rlcywgc28gdGhhdCB0aGV5J3JlXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIGNvbGxpZGUgd2l0aCB0aGUgZXhpc3Rpbmcga2V5cyBpbiB0aGUgZG9jdW1lbnQuIE90aGVyd2lzZVxuICAvLyB0aGV5IHdpbGwgYmUgcmVuZ2VyYXRlZCBhdXRvbWF0aWNhbGx5IGFuZCB3ZSB3b24ndCBoYXZlIGFuIGVhc3kgd2F5IHRvXG4gIC8vIHJlZmVyZW5jZSB0aGVtLlxuICBmcmFnbWVudCA9IGZyYWdtZW50Lm1hcERlc2NlbmRhbnRzKGNoaWxkID0+IGNoaWxkLnJlZ2VuZXJhdGVLZXkoKSlcblxuICAvLyBDYWxjdWxhdGUgYSBmZXcgdGhpbmdzLi4uXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGxldCBzdGFydFRleHQgPSBkb2N1bWVudC5nZXREZXNjZW5kYW50KHN0YXJ0S2V5KVxuICBsZXQgc3RhcnRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhzdGFydFRleHQua2V5KVxuICBsZXQgc3RhcnRDaGlsZCA9IHN0YXJ0QmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihzdGFydFRleHQua2V5KVxuICBjb25zdCBpc0F0U3RhcnQgPSByYW5nZS5pc0F0U3RhcnRPZihzdGFydEJsb2NrKVxuICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoc3RhcnRCbG9jay5rZXkpXG4gIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yoc3RhcnRCbG9jaylcbiAgY29uc3QgYmxvY2tzID0gZnJhZ21lbnQuZ2V0QmxvY2tzKClcbiAgY29uc3QgZmlyc3RCbG9jayA9IGJsb2Nrcy5maXJzdCgpXG4gIGNvbnN0IGxhc3RCbG9jayA9IGJsb2Nrcy5sYXN0KClcblxuICAvLyBJZiB0aGUgZnJhZ21lbnQgb25seSBjb250YWlucyBhIHZvaWQgYmxvY2ssIHVzZSBgaW5zZXJ0QmxvY2tgIGluc3RlYWQuXG4gIGlmIChmaXJzdEJsb2NrID09IGxhc3RCbG9jayAmJiBmaXJzdEJsb2NrLmlzVm9pZCkge1xuICAgIGNoYW5nZS5pbnNlcnRCbG9ja0F0UmFuZ2UocmFuZ2UsIGZpcnN0QmxvY2ssIG9wdGlvbnMpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBJZiB0aGUgZmlyc3QgYW5kIGxhc3QgYmxvY2sgYXJlbid0IHRoZSBzYW1lLCB3ZSBuZWVkIHRvIGluc2VydCBhbGwgb2YgdGhlXG4gIC8vIG5vZGVzIGFmdGVyIHRoZSBmcmFnbWVudCdzIGZpcnN0IGJsb2NrIGF0IHRoZSBpbmRleC5cbiAgaWYgKGZpcnN0QmxvY2sgIT0gbGFzdEJsb2NrKSB7XG4gICAgY29uc3QgbG9uZWx5UGFyZW50ID0gZnJhZ21lbnQuZ2V0RnVydGhlc3QoZmlyc3RCbG9jay5rZXksIHAgPT4gcC5ub2Rlcy5zaXplID09IDEpXG4gICAgY29uc3QgbG9uZWx5Q2hpbGQgPSBsb25lbHlQYXJlbnQgfHwgZmlyc3RCbG9ja1xuICAgIGNvbnN0IHN0YXJ0SW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihzdGFydEJsb2NrKVxuICAgIGZyYWdtZW50ID0gZnJhZ21lbnQucmVtb3ZlRGVzY2VuZGFudChsb25lbHlDaGlsZC5rZXkpXG5cbiAgICBmcmFnbWVudC5ub2Rlcy5mb3JFYWNoKChub2RlLCBpKSA9PiB7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IHN0YXJ0SW5kZXggKyBpICsgMVxuICAgICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBuZXdJbmRleCwgbm9kZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8vIENoZWNrIGlmIHdlIG5lZWQgdG8gc3BsaXQgdGhlIG5vZGUuXG4gIGlmIChzdGFydE9mZnNldCAhPSAwKSB7XG4gICAgY2hhbmdlLnNwbGl0RGVzY2VuZGFudHNCeUtleShzdGFydENoaWxkLmtleSwgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgfVxuXG4gIC8vIFVwZGF0ZSBvdXIgdmFyaWFibGVzIHdpdGggdGhlIG5ldyB2YWx1ZS5cbiAgZG9jdW1lbnQgPSBjaGFuZ2UudmFsdWUuZG9jdW1lbnRcbiAgc3RhcnRUZXh0ID0gZG9jdW1lbnQuZ2V0RGVzY2VuZGFudChzdGFydEtleSlcbiAgc3RhcnRCbG9jayA9IGRvY3VtZW50LmdldENsb3Nlc3RCbG9jayhzdGFydEtleSlcbiAgc3RhcnRDaGlsZCA9IHN0YXJ0QmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihzdGFydFRleHQua2V5KVxuXG4gIC8vIElmIHRoZSBmaXJzdCBhbmQgbGFzdCBibG9jayBhcmVuJ3QgdGhlIHNhbWUsIHdlIG5lZWQgdG8gbW92ZSBhbnkgb2YgdGhlXG4gIC8vIHN0YXJ0aW5nIGJsb2NrJ3MgY2hpbGRyZW4gYWZ0ZXIgdGhlIHNwbGl0IGludG8gdGhlIGxhc3QgYmxvY2sgb2YgdGhlXG4gIC8vIGZyYWdtZW50LCB3aGljaCBoYXMgYWxyZWFkeSBiZWVuIGluc2VydGVkLlxuICBpZiAoZmlyc3RCbG9jayAhPSBsYXN0QmxvY2spIHtcbiAgICBjb25zdCBuZXh0Q2hpbGQgPSBpc0F0U3RhcnQgPyBzdGFydENoaWxkIDogc3RhcnRCbG9jay5nZXROZXh0U2libGluZyhzdGFydENoaWxkLmtleSlcbiAgICBjb25zdCBuZXh0Tm9kZXMgPSBuZXh0Q2hpbGQgPyBzdGFydEJsb2NrLm5vZGVzLnNraXBVbnRpbChuID0+IG4ua2V5ID09IG5leHRDaGlsZC5rZXkpIDogTGlzdCgpXG4gICAgY29uc3QgbGFzdEluZGV4ID0gbGFzdEJsb2NrLm5vZGVzLnNpemVcblxuICAgIG5leHROb2Rlcy5mb3JFYWNoKChub2RlLCBpKSA9PiB7XG4gICAgICBjb25zdCBuZXdJbmRleCA9IGxhc3RJbmRleCArIGlcbiAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KG5vZGUua2V5LCBsYXN0QmxvY2sua2V5LCBuZXdJbmRleCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfSlcbiAgfVxuXG4gIC8vIElmIHRoZSBzdGFydGluZyBibG9jayBpcyBlbXB0eSwgd2UgcmVwbGFjZSBpdCBlbnRpcmVseSB3aXRoIHRoZSBmaXJzdCBibG9ja1xuICAvLyBvZiB0aGUgZnJhZ21lbnQsIHNpbmNlIHRoaXMgbGVhZHMgdG8gYSBtb3JlIGV4cGVjdGVkIGJlaGF2aW9yIGZvciB0aGUgdXNlci5cbiAgaWYgKHN0YXJ0QmxvY2suaXNFbXB0eSkge1xuICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoc3RhcnRCbG9jay5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkocGFyZW50LmtleSwgaW5kZXgsIGZpcnN0QmxvY2ssIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICB9XG5cbiAgLy8gT3RoZXJ3aXNlLCB3ZSBtYWludGFpbiB0aGUgc3RhcnRpbmcgYmxvY2ssIGFuZCBpbnNlcnQgYWxsIG9mIHRoZSBmaXJzdFxuICAvLyBibG9jaydzIGlubGluZSBub2RlcyBpbnRvIGl0IGF0IHRoZSBzcGxpdCBwb2ludC5cbiAgZWxzZSB7XG4gICAgY29uc3QgaW5saW5lQ2hpbGQgPSBzdGFydEJsb2NrLmdldEZ1cnRoZXN0QW5jZXN0b3Ioc3RhcnRUZXh0LmtleSlcbiAgICBjb25zdCBpbmxpbmVJbmRleCA9IHN0YXJ0QmxvY2subm9kZXMuaW5kZXhPZihpbmxpbmVDaGlsZClcblxuICAgIGZpcnN0QmxvY2subm9kZXMuZm9yRWFjaCgoaW5saW5lLCBpKSA9PiB7XG4gICAgICBjb25zdCBvID0gc3RhcnRPZmZzZXQgPT0gMCA/IDAgOiAxXG4gICAgICBjb25zdCBuZXdJbmRleCA9IGlubGluZUluZGV4ICsgaSArIG9cbiAgICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkoc3RhcnRCbG9jay5rZXksIG5ld0luZGV4LCBpbmxpbmUsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIH0pXG4gIH1cblxuICAvLyBOb3JtYWxpemUgaWYgcmVxdWVzdGVkLlxuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShwYXJlbnQua2V5KVxuICB9XG59XG5cbi8qKlxuICogSW5zZXJ0IGFuIGBpbmxpbmVgIG5vZGUgYXQgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtJbmxpbmV8U3RyaW5nfE9iamVjdH0gaW5saW5lXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuaW5zZXJ0SW5saW5lQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBpbmxpbmUsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcbiAgaW5saW5lID0gSW5saW5lLmNyZWF0ZShpbmxpbmUpXG5cbiAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICBjaGFuZ2UuZGVsZXRlQXRSYW5nZShyYW5nZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgcmFuZ2UgPSByYW5nZS5jb2xsYXBzZVRvU3RhcnQoKVxuICB9XG5cbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoc3RhcnRLZXkpXG4gIGNvbnN0IHN0YXJ0VGV4dCA9IGRvY3VtZW50LmFzc2VydERlc2NlbmRhbnQoc3RhcnRLZXkpXG4gIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yoc3RhcnRUZXh0KVxuXG4gIGlmIChwYXJlbnQuaXNWb2lkKSByZXR1cm5cblxuICBjaGFuZ2Uuc3BsaXROb2RlQnlLZXkoc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgY2hhbmdlLmluc2VydE5vZGVCeUtleShwYXJlbnQua2V5LCBpbmRleCArIDEsIGlubGluZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkocGFyZW50LmtleSlcbiAgfVxufVxuXG4vKipcbiAqIEluc2VydCBgdGV4dGAgYXQgYSBgcmFuZ2VgLCB3aXRoIG9wdGlvbmFsIGBtYXJrc2AuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gKiBAcGFyYW0ge1NldDxNYXJrPn0gbWFya3MgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLmluc2VydFRleHRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIHRleHQsIG1hcmtzLCBvcHRpb25zID0ge30pID0+IHtcbiAgbGV0IHsgbm9ybWFsaXplIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCB9ID0gcmFuZ2VcbiAgY29uc3QgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KHN0YXJ0S2V5KVxuXG4gIGlmIChwYXJlbnQuaXNWb2lkKSByZXR1cm5cblxuICBpZiAocmFuZ2UuaXNFeHBhbmRlZCkge1xuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgfVxuXG4gIC8vIFBFUkY6IFVubGVzcyBzcGVjaWZpZWQsIGRvbid0IG5vcm1hbGl6ZSBpZiBvbmx5IGluc2VydGluZyB0ZXh0LlxuICBpZiAobm9ybWFsaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICBub3JtYWxpemUgPSByYW5nZS5pc0V4cGFuZGVkXG4gIH1cblxuICBjaGFuZ2UuaW5zZXJ0VGV4dEJ5S2V5KHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgdGV4dCwgbWFya3MsIHsgbm9ybWFsaXplIH0pXG59XG5cbi8qKlxuICogUmVtb3ZlIGFuIGV4aXN0aW5nIGBtYXJrYCB0byB0aGUgY2hhcmFjdGVycyBhdCBgcmFuZ2VgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge01hcmt8U3RyaW5nfSBtYXJrIChvcHRpb25hbClcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiAgIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gbm9ybWFsaXplXG4gKi9cblxuQ2hhbmdlcy5yZW1vdmVNYXJrQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBtYXJrLCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKHJhbmdlLmlzQ29sbGFwc2VkKSByZXR1cm5cblxuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IHRleHRzID0gZG9jdW1lbnQuZ2V0VGV4dHNBdFJhbmdlKHJhbmdlKVxuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgZW5kS2V5LCBlbmRPZmZzZXQgfSA9IHJhbmdlXG5cbiAgdGV4dHMuZm9yRWFjaCgobm9kZSkgPT4ge1xuICAgIGNvbnN0IHsga2V5IH0gPSBub2RlXG4gICAgbGV0IGluZGV4ID0gMFxuICAgIGxldCBsZW5ndGggPSBub2RlLnRleHQubGVuZ3RoXG5cbiAgICBpZiAoa2V5ID09IHN0YXJ0S2V5KSBpbmRleCA9IHN0YXJ0T2Zmc2V0XG4gICAgaWYgKGtleSA9PSBlbmRLZXkpIGxlbmd0aCA9IGVuZE9mZnNldFxuICAgIGlmIChrZXkgPT0gc3RhcnRLZXkgJiYga2V5ID09IGVuZEtleSkgbGVuZ3RoID0gZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXRcblxuICAgIGNoYW5nZS5yZW1vdmVNYXJrQnlLZXkoa2V5LCBpbmRleCwgbGVuZ3RoLCBtYXJrLCB7IG5vcm1hbGl6ZSB9KVxuICB9KVxufVxuXG4vKipcbiAqIFNldCB0aGUgYHByb3BlcnRpZXNgIG9mIGJsb2NrIG5vZGVzIGluIGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuc2V0QmxvY2tBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIHByb3BlcnRpZXMsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gIGNvbnN0IGJsb2NrcyA9IGRvY3VtZW50LmdldEJsb2Nrc0F0UmFuZ2UocmFuZ2UpXG5cbiAgYmxvY2tzLmZvckVhY2goKGJsb2NrKSA9PiB7XG4gICAgY2hhbmdlLnNldE5vZGVCeUtleShibG9jay5rZXksIHByb3BlcnRpZXMsIHsgbm9ybWFsaXplIH0pXG4gIH0pXG59XG5cbi8qKlxuICogU2V0IHRoZSBgcHJvcGVydGllc2Agb2YgaW5saW5lIG5vZGVzIGluIGEgYHJhbmdlYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMuc2V0SW5saW5lQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBwcm9wZXJ0aWVzLCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBpbmxpbmVzID0gZG9jdW1lbnQuZ2V0SW5saW5lc0F0UmFuZ2UocmFuZ2UpXG5cbiAgaW5saW5lcy5mb3JFYWNoKChpbmxpbmUpID0+IHtcbiAgICBjaGFuZ2Uuc2V0Tm9kZUJ5S2V5KGlubGluZS5rZXksIHByb3BlcnRpZXMsIHsgbm9ybWFsaXplIH0pXG4gIH0pXG59XG5cbi8qKlxuICogU3BsaXQgdGhlIGJsb2NrIG5vZGVzIGF0IGEgYHJhbmdlYCwgdG8gb3B0aW9uYWwgYGhlaWdodGAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHQgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnNwbGl0QmxvY2tBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIGhlaWdodCA9IDEsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcblxuICBpZiAocmFuZ2UuaXNFeHBhbmRlZCkge1xuICAgIGNoYW5nZS5kZWxldGVBdFJhbmdlKHJhbmdlLCB7IG5vcm1hbGl6ZSB9KVxuICAgIHJhbmdlID0gcmFuZ2UuY29sbGFwc2VUb1N0YXJ0KClcbiAgfVxuXG4gIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgbGV0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnREZXNjZW5kYW50KHN0YXJ0S2V5KVxuICBsZXQgcGFyZW50ID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKG5vZGUua2V5KVxuICBsZXQgaCA9IDBcblxuICB3aGlsZSAocGFyZW50ICYmIHBhcmVudC5raW5kID09ICdibG9jaycgJiYgaCA8IGhlaWdodCkge1xuICAgIG5vZGUgPSBwYXJlbnRcbiAgICBwYXJlbnQgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2socGFyZW50LmtleSlcbiAgICBoKytcbiAgfVxuXG4gIGNoYW5nZS5zcGxpdERlc2NlbmRhbnRzQnlLZXkobm9kZS5rZXksIHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgeyBub3JtYWxpemUgfSlcbn1cblxuLyoqXG4gKiBTcGxpdCB0aGUgaW5saW5lIG5vZGVzIGF0IGEgYHJhbmdlYCwgdG8gb3B0aW9uYWwgYGhlaWdodGAuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAqIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHQgKG9wdGlvbmFsKVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgQHByb3BlcnR5IHtCb29sZWFufSBub3JtYWxpemVcbiAqL1xuXG5DaGFuZ2VzLnNwbGl0SW5saW5lQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBoZWlnaHQgPSBJbmZpbml0eSwgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuXG4gIGlmIChyYW5nZS5pc0V4cGFuZGVkKSB7XG4gICAgY2hhbmdlLmRlbGV0ZUF0UmFuZ2UocmFuZ2UsIHsgbm9ybWFsaXplIH0pXG4gICAgcmFuZ2UgPSByYW5nZS5jb2xsYXBzZVRvU3RhcnQoKVxuICB9XG5cbiAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBsZXQgbm9kZSA9IGRvY3VtZW50LmFzc2VydERlc2NlbmRhbnQoc3RhcnRLZXkpXG4gIGxldCBwYXJlbnQgPSBkb2N1bWVudC5nZXRDbG9zZXN0SW5saW5lKG5vZGUua2V5KVxuICBsZXQgaCA9IDBcblxuICB3aGlsZSAocGFyZW50ICYmIHBhcmVudC5raW5kID09ICdpbmxpbmUnICYmIGggPCBoZWlnaHQpIHtcbiAgICBub2RlID0gcGFyZW50XG4gICAgcGFyZW50ID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShwYXJlbnQua2V5KVxuICAgIGgrK1xuICB9XG5cbiAgY2hhbmdlLnNwbGl0RGVzY2VuZGFudHNCeUtleShub2RlLmtleSwgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCB7IG5vcm1hbGl6ZSB9KVxufVxuXG4vKipcbiAqIEFkZCBvciByZW1vdmUgYSBgbWFya2AgZnJvbSB0aGUgY2hhcmFjdGVycyBhdCBgcmFuZ2VgLCBkZXBlbmRpbmcgb24gd2hldGhlclxuICogaXQncyBhbHJlYWR5IHRoZXJlLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge01peGVkfSBtYXJrXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMudG9nZ2xlTWFya0F0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgbWFyaywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGlmIChyYW5nZS5pc0NvbGxhcHNlZCkgcmV0dXJuXG5cbiAgbWFyayA9IE1hcmsuY3JlYXRlKG1hcmspXG5cbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCBtYXJrcyA9IGRvY3VtZW50LmdldEFjdGl2ZU1hcmtzQXRSYW5nZShyYW5nZSlcbiAgY29uc3QgZXhpc3RzID0gbWFya3Muc29tZShtID0+IG0uZXF1YWxzKG1hcmspKVxuXG4gIGlmIChleGlzdHMpIHtcbiAgICBjaGFuZ2UucmVtb3ZlTWFya0F0UmFuZ2UocmFuZ2UsIG1hcmssIHsgbm9ybWFsaXplIH0pXG4gIH0gZWxzZSB7XG4gICAgY2hhbmdlLmFkZE1hcmtBdFJhbmdlKHJhbmdlLCBtYXJrLCB7IG5vcm1hbGl6ZSB9KVxuICB9XG59XG5cbi8qKlxuICogVW53cmFwIGFsbCBvZiB0aGUgYmxvY2sgbm9kZXMgaW4gYSBgcmFuZ2VgIGZyb20gYSBibG9jayB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMudW53cmFwQmxvY2tBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIHByb3BlcnRpZXMsIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBwcm9wZXJ0aWVzID0gTm9kZS5jcmVhdGVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG5cbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBsZXQgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgYmxvY2tzID0gZG9jdW1lbnQuZ2V0QmxvY2tzQXRSYW5nZShyYW5nZSlcbiAgY29uc3Qgd3JhcHBlcnMgPSBibG9ja3NcbiAgICAubWFwKChibG9jaykgPT4ge1xuICAgICAgcmV0dXJuIGRvY3VtZW50LmdldENsb3Nlc3QoYmxvY2sua2V5LCAocGFyZW50KSA9PiB7XG4gICAgICAgIGlmIChwYXJlbnQua2luZCAhPSAnYmxvY2snKSByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnRpZXMudHlwZSAhPSBudWxsICYmIHBhcmVudC50eXBlICE9IHByb3BlcnRpZXMudHlwZSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLmlzVm9pZCAhPSBudWxsICYmIHBhcmVudC5pc1ZvaWQgIT0gcHJvcGVydGllcy5pc1ZvaWQpIHJldHVybiBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydGllcy5kYXRhICE9IG51bGwgJiYgIXBhcmVudC5kYXRhLmlzU3VwZXJzZXQocHJvcGVydGllcy5kYXRhKSkgcmV0dXJuIGZhbHNlXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9KVxuICAgIH0pXG4gICAgLmZpbHRlcihleGlzdHMgPT4gZXhpc3RzKVxuICAgIC50b09yZGVyZWRTZXQoKVxuICAgIC50b0xpc3QoKVxuXG4gIHdyYXBwZXJzLmZvckVhY2goKGJsb2NrKSA9PiB7XG4gICAgY29uc3QgZmlyc3QgPSBibG9jay5ub2Rlcy5maXJzdCgpXG4gICAgY29uc3QgbGFzdCA9IGJsb2NrLm5vZGVzLmxhc3QoKVxuICAgIGNvbnN0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChibG9jay5rZXkpXG4gICAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihibG9jaylcblxuICAgIGNvbnN0IGNoaWxkcmVuID0gYmxvY2subm9kZXMuZmlsdGVyKChjaGlsZCkgPT4ge1xuICAgICAgcmV0dXJuIGJsb2Nrcy5zb21lKGIgPT4gY2hpbGQgPT0gYiB8fCBjaGlsZC5oYXNEZXNjZW5kYW50KGIua2V5KSlcbiAgICB9KVxuXG4gICAgY29uc3QgZmlyc3RNYXRjaCA9IGNoaWxkcmVuLmZpcnN0KClcbiAgICBjb25zdCBsYXN0TWF0Y2ggPSBjaGlsZHJlbi5sYXN0KClcblxuICAgIGlmIChmaXJzdCA9PSBmaXJzdE1hdGNoICYmIGxhc3QgPT0gbGFzdE1hdGNoKSB7XG4gICAgICBibG9jay5ub2Rlcy5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShjaGlsZC5rZXksIHBhcmVudC5rZXksIGluZGV4ICsgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICB9KVxuXG4gICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KGJsb2NrLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfVxuXG4gICAgZWxzZSBpZiAobGFzdCA9PSBsYXN0TWF0Y2gpIHtcbiAgICAgIGJsb2NrLm5vZGVzXG4gICAgICAgIC5za2lwVW50aWwobiA9PiBuID09IGZpcnN0TWF0Y2gpXG4gICAgICAgIC5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgcGFyZW50LmtleSwgaW5kZXggKyAxICsgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgZWxzZSBpZiAoZmlyc3QgPT0gZmlyc3RNYXRjaCkge1xuICAgICAgYmxvY2subm9kZXNcbiAgICAgICAgLnRha2VVbnRpbChuID0+IG4gPT0gbGFzdE1hdGNoKVxuICAgICAgICAucHVzaChsYXN0TWF0Y2gpXG4gICAgICAgIC5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgcGFyZW50LmtleSwgaW5kZXggKyBpLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGZpcnN0VGV4dCA9IGZpcnN0TWF0Y2guZ2V0Rmlyc3RUZXh0KClcbiAgICAgIGNoYW5nZS5zcGxpdERlc2NlbmRhbnRzQnlLZXkoYmxvY2sua2V5LCBmaXJzdFRleHQua2V5LCAwLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgIGRvY3VtZW50ID0gY2hhbmdlLnZhbHVlLmRvY3VtZW50XG5cbiAgICAgIGNoaWxkcmVuLmZvckVhY2goKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICBjb25zdCBleHRyYSA9IGNoaWxkXG4gICAgICAgICAgY2hpbGQgPSBkb2N1bWVudC5nZXROZXh0QmxvY2soY2hpbGQua2V5KVxuICAgICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoZXh0cmEua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgcGFyZW50LmtleSwgaW5kZXggKyAxICsgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICB9KVxuICAgIH1cbiAgfSlcblxuICAvLyBUT0RPOiBvcHRtaXplIHRvIG9ubHkgbm9ybWFsaXplIHRoZSByaWdodCBibG9ja1xuICBpZiAobm9ybWFsaXplKSB7XG4gICAgY2hhbmdlLm5vcm1hbGl6ZURvY3VtZW50KClcbiAgfVxufVxuXG4vKipcbiAqIFVud3JhcCB0aGUgaW5saW5lIG5vZGVzIGluIGEgYHJhbmdlYCBmcm9tIGFuIGlubGluZSB3aXRoIGBwcm9wZXJ0aWVzYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBwcm9wZXJ0aWVzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMudW53cmFwSW5saW5lQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBwcm9wZXJ0aWVzLCBvcHRpb25zID0ge30pID0+IHtcbiAgcHJvcGVydGllcyA9IE5vZGUuY3JlYXRlUHJvcGVydGllcyhwcm9wZXJ0aWVzKVxuXG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgY29uc3QgdGV4dHMgPSBkb2N1bWVudC5nZXRUZXh0c0F0UmFuZ2UocmFuZ2UpXG4gIGNvbnN0IGlubGluZXMgPSB0ZXh0c1xuICAgIC5tYXAoKHRleHQpID0+IHtcbiAgICAgIHJldHVybiBkb2N1bWVudC5nZXRDbG9zZXN0KHRleHQua2V5LCAocGFyZW50KSA9PiB7XG4gICAgICAgIGlmIChwYXJlbnQua2luZCAhPSAnaW5saW5lJykgcmV0dXJuIGZhbHNlXG4gICAgICAgIGlmIChwcm9wZXJ0aWVzLnR5cGUgIT0gbnVsbCAmJiBwYXJlbnQudHlwZSAhPSBwcm9wZXJ0aWVzLnR5cGUpIHJldHVybiBmYWxzZVxuICAgICAgICBpZiAocHJvcGVydGllcy5pc1ZvaWQgIT0gbnVsbCAmJiBwYXJlbnQuaXNWb2lkICE9IHByb3BlcnRpZXMuaXNWb2lkKSByZXR1cm4gZmFsc2VcbiAgICAgICAgaWYgKHByb3BlcnRpZXMuZGF0YSAhPSBudWxsICYmICFwYXJlbnQuZGF0YS5pc1N1cGVyc2V0KHByb3BlcnRpZXMuZGF0YSkpIHJldHVybiBmYWxzZVxuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfSlcbiAgICB9KVxuICAgIC5maWx0ZXIoZXhpc3RzID0+IGV4aXN0cylcbiAgICAudG9PcmRlcmVkU2V0KClcbiAgICAudG9MaXN0KClcblxuICBpbmxpbmVzLmZvckVhY2goKGlubGluZSkgPT4ge1xuICAgIGNvbnN0IHBhcmVudCA9IGNoYW5nZS52YWx1ZS5kb2N1bWVudC5nZXRQYXJlbnQoaW5saW5lLmtleSlcbiAgICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKGlubGluZSlcblxuICAgIGlubGluZS5ub2Rlcy5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCBwYXJlbnQua2V5LCBpbmRleCArIGksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgIH0pXG4gIH0pXG5cbiAgLy8gVE9ETzogb3B0bWl6ZSB0byBvbmx5IG5vcm1hbGl6ZSB0aGUgcmlnaHQgYmxvY2tcbiAgaWYgKG5vcm1hbGl6ZSkge1xuICAgIGNoYW5nZS5ub3JtYWxpemVEb2N1bWVudCgpXG4gIH1cbn1cblxuLyoqXG4gKiBXcmFwIGFsbCBvZiB0aGUgYmxvY2tzIGluIGEgYHJhbmdlYCBpbiBhIG5ldyBgYmxvY2tgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcGFyYW0ge0Jsb2NrfE9iamVjdHxTdHJpbmd9IGJsb2NrXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMud3JhcEJsb2NrQXRSYW5nZSA9IChjaGFuZ2UsIHJhbmdlLCBibG9jaywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIGJsb2NrID0gQmxvY2suY3JlYXRlKGJsb2NrKVxuICBibG9jayA9IGJsb2NrLnNldCgnbm9kZXMnLCBibG9jay5ub2Rlcy5jbGVhcigpKVxuXG4gIGNvbnN0IHsgbm9ybWFsaXplID0gdHJ1ZSB9ID0gb3B0aW9uc1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCB9ID0gdmFsdWVcblxuICBjb25zdCBibG9ja3MgPSBkb2N1bWVudC5nZXRCbG9ja3NBdFJhbmdlKHJhbmdlKVxuICBjb25zdCBmaXJzdGJsb2NrID0gYmxvY2tzLmZpcnN0KClcbiAgY29uc3QgbGFzdGJsb2NrID0gYmxvY2tzLmxhc3QoKVxuICBsZXQgcGFyZW50LCBzaWJsaW5ncywgaW5kZXhcblxuICAvLyBJZiB0aGVyZSBpcyBvbmx5IG9uZSBibG9jayBpbiB0aGUgc2VsZWN0aW9uIHRoZW4gd2Uga25vdyB0aGUgcGFyZW50IGFuZFxuICAvLyBzaWJsaW5ncy5cbiAgaWYgKGJsb2Nrcy5sZW5ndGggPT09IDEpIHtcbiAgICBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQoZmlyc3RibG9jay5rZXkpXG4gICAgc2libGluZ3MgPSBibG9ja3NcbiAgfVxuXG4gIC8vIERldGVybWluZSBjbG9zZXN0IHNoYXJlZCBwYXJlbnQgdG8gYWxsIGJsb2NrcyBpbiBzZWxlY3Rpb24uXG4gIGVsc2Uge1xuICAgIHBhcmVudCA9IGRvY3VtZW50LmdldENsb3Nlc3QoZmlyc3RibG9jay5rZXksIChwMSkgPT4ge1xuICAgICAgcmV0dXJuICEhZG9jdW1lbnQuZ2V0Q2xvc2VzdChsYXN0YmxvY2sua2V5LCBwMiA9PiBwMSA9PSBwMilcbiAgICB9KVxuICB9XG5cbiAgLy8gSWYgbm8gc2hhcmVkIHBhcmVudCBjb3VsZCBiZSBmb3VuZCB0aGVuIHRoZSBwYXJlbnQgaXMgdGhlIGRvY3VtZW50LlxuICBpZiAocGFyZW50ID09IG51bGwpIHBhcmVudCA9IGRvY3VtZW50XG5cbiAgLy8gQ3JlYXRlIGEgbGlzdCBvZiBkaXJlY3QgY2hpbGRyZW4gc2libGluZ3Mgb2YgcGFyZW50IHRoYXQgZmFsbCBpbiB0aGVcbiAgLy8gc2VsZWN0aW9uLlxuICBpZiAoc2libGluZ3MgPT0gbnVsbCkge1xuICAgIGNvbnN0IGluZGV4ZXMgPSBwYXJlbnQubm9kZXMucmVkdWNlKChpbmQsIG5vZGUsIGkpID0+IHtcbiAgICAgIGlmIChub2RlID09IGZpcnN0YmxvY2sgfHwgbm9kZS5oYXNEZXNjZW5kYW50KGZpcnN0YmxvY2sua2V5KSkgaW5kWzBdID0gaVxuICAgICAgaWYgKG5vZGUgPT0gbGFzdGJsb2NrIHx8IG5vZGUuaGFzRGVzY2VuZGFudChsYXN0YmxvY2sua2V5KSkgaW5kWzFdID0gaVxuICAgICAgcmV0dXJuIGluZFxuICAgIH0sIFtdKVxuXG4gICAgaW5kZXggPSBpbmRleGVzWzBdXG4gICAgc2libGluZ3MgPSBwYXJlbnQubm9kZXMuc2xpY2UoaW5kZXhlc1swXSwgaW5kZXhlc1sxXSArIDEpXG4gIH1cblxuICAvLyBHZXQgdGhlIGluZGV4IHRvIHBsYWNlIHRoZSBuZXcgd3JhcHBlZCBub2RlIGF0LlxuICBpZiAoaW5kZXggPT0gbnVsbCkge1xuICAgIGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yoc2libGluZ3MuZmlyc3QoKSlcbiAgfVxuXG4gIC8vIEluamVjdCB0aGUgbmV3IGJsb2NrIG5vZGUgaW50byB0aGUgcGFyZW50LlxuICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHBhcmVudC5rZXksIGluZGV4LCBibG9jaywgeyBub3JtYWxpemU6IGZhbHNlIH0pXG5cbiAgLy8gTW92ZSB0aGUgc2libGluZyBub2RlcyBpbnRvIHRoZSBuZXcgYmxvY2sgbm9kZS5cbiAgc2libGluZ3MuZm9yRWFjaCgobm9kZSwgaSkgPT4ge1xuICAgIGNoYW5nZS5tb3ZlTm9kZUJ5S2V5KG5vZGUua2V5LCBibG9jay5rZXksIGksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICB9KVxuXG4gIGlmIChub3JtYWxpemUpIHtcbiAgICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KHBhcmVudC5rZXkpXG4gIH1cbn1cblxuLyoqXG4gKiBXcmFwIHRoZSB0ZXh0IGFuZCBpbmxpbmVzIGluIGEgYHJhbmdlYCBpbiBhIG5ldyBgaW5saW5lYC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtJbmxpbmV8T2JqZWN0fFN0cmluZ30gaW5saW5lXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMud3JhcElubGluZUF0UmFuZ2UgPSAoY2hhbmdlLCByYW5nZSwgaW5saW5lLCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGxldCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjb25zdCB7IG5vcm1hbGl6ZSA9IHRydWUgfSA9IG9wdGlvbnNcbiAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQsIGVuZEtleSwgZW5kT2Zmc2V0IH0gPSByYW5nZVxuXG4gIGlmIChyYW5nZS5pc0NvbGxhcHNlZCkge1xuICAgIC8vIFdyYXBwaW5nIGFuIGlubGluZSB2b2lkXG4gICAgY29uc3QgaW5saW5lUGFyZW50ID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZShzdGFydEtleSlcbiAgICBpZiAoIWlubGluZVBhcmVudC5pc1ZvaWQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHJldHVybiBjaGFuZ2Uud3JhcElubGluZUJ5S2V5KGlubGluZVBhcmVudC5rZXksIGlubGluZSwgb3B0aW9ucylcbiAgfVxuXG4gIGlubGluZSA9IElubGluZS5jcmVhdGUoaW5saW5lKVxuICBpbmxpbmUgPSBpbmxpbmUuc2V0KCdub2RlcycsIGlubGluZS5ub2Rlcy5jbGVhcigpKVxuXG4gIGNvbnN0IGJsb2NrcyA9IGRvY3VtZW50LmdldEJsb2Nrc0F0UmFuZ2UocmFuZ2UpXG4gIGxldCBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHN0YXJ0S2V5KVxuICBsZXQgZW5kQmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soZW5kS2V5KVxuICBsZXQgc3RhcnRDaGlsZCA9IHN0YXJ0QmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihzdGFydEtleSlcbiAgbGV0IGVuZENoaWxkID0gZW5kQmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihlbmRLZXkpXG5cbiAgY2hhbmdlLnNwbGl0RGVzY2VuZGFudHNCeUtleShlbmRDaGlsZC5rZXksIGVuZEtleSwgZW5kT2Zmc2V0LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgY2hhbmdlLnNwbGl0RGVzY2VuZGFudHNCeUtleShzdGFydENoaWxkLmtleSwgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcblxuICBkb2N1bWVudCA9IGNoYW5nZS52YWx1ZS5kb2N1bWVudFxuICBzdGFydEJsb2NrID0gZG9jdW1lbnQuZ2V0RGVzY2VuZGFudChzdGFydEJsb2NrLmtleSlcbiAgZW5kQmxvY2sgPSBkb2N1bWVudC5nZXREZXNjZW5kYW50KGVuZEJsb2NrLmtleSlcbiAgc3RhcnRDaGlsZCA9IHN0YXJ0QmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihzdGFydEtleSlcbiAgZW5kQ2hpbGQgPSBlbmRCbG9jay5nZXRGdXJ0aGVzdEFuY2VzdG9yKGVuZEtleSlcbiAgY29uc3Qgc3RhcnRJbmRleCA9IHN0YXJ0QmxvY2subm9kZXMuaW5kZXhPZihzdGFydENoaWxkKVxuICBjb25zdCBlbmRJbmRleCA9IGVuZEJsb2NrLm5vZGVzLmluZGV4T2YoZW5kQ2hpbGQpXG5cbiAgaWYgKHN0YXJ0QmxvY2sgPT0gZW5kQmxvY2spIHtcbiAgICBkb2N1bWVudCA9IGNoYW5nZS52YWx1ZS5kb2N1bWVudFxuICAgIHN0YXJ0QmxvY2sgPSBkb2N1bWVudC5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG4gICAgc3RhcnRDaGlsZCA9IHN0YXJ0QmxvY2suZ2V0RnVydGhlc3RBbmNlc3RvcihzdGFydEtleSlcblxuICAgIGNvbnN0IHN0YXJ0SW5uZXIgPSBkb2N1bWVudC5nZXROZXh0U2libGluZyhzdGFydENoaWxkLmtleSlcbiAgICBjb25zdCBzdGFydElubmVySW5kZXggPSBzdGFydEJsb2NrLm5vZGVzLmluZGV4T2Yoc3RhcnRJbm5lcilcbiAgICBjb25zdCBlbmRJbm5lciA9IHN0YXJ0S2V5ID09IGVuZEtleSA/IHN0YXJ0SW5uZXIgOiBzdGFydEJsb2NrLmdldEZ1cnRoZXN0QW5jZXN0b3IoZW5kS2V5KVxuICAgIGNvbnN0IGlubGluZXMgPSBzdGFydEJsb2NrLm5vZGVzXG4gICAgICAuc2tpcFVudGlsKG4gPT4gbiA9PSBzdGFydElubmVyKVxuICAgICAgLnRha2VVbnRpbChuID0+IG4gPT0gZW5kSW5uZXIpXG4gICAgICAucHVzaChlbmRJbm5lcilcblxuICAgIGNvbnN0IG5vZGUgPSBpbmxpbmUucmVnZW5lcmF0ZUtleSgpXG5cbiAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KHN0YXJ0QmxvY2sua2V5LCBzdGFydElubmVySW5kZXgsIG5vZGUsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuXG4gICAgaW5saW5lcy5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCBub2RlLmtleSwgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfSlcblxuICAgIGlmIChub3JtYWxpemUpIHtcbiAgICAgIGNoYW5nZS5ub3JtYWxpemVOb2RlQnlLZXkoc3RhcnRCbG9jay5rZXkpXG4gICAgfVxuICB9XG5cbiAgZWxzZSB7XG4gICAgY29uc3Qgc3RhcnRJbmxpbmVzID0gc3RhcnRCbG9jay5ub2Rlcy5zbGljZShzdGFydEluZGV4ICsgMSlcbiAgICBjb25zdCBlbmRJbmxpbmVzID0gZW5kQmxvY2subm9kZXMuc2xpY2UoMCwgZW5kSW5kZXggKyAxKVxuICAgIGNvbnN0IHN0YXJ0Tm9kZSA9IGlubGluZS5yZWdlbmVyYXRlS2V5KClcbiAgICBjb25zdCBlbmROb2RlID0gaW5saW5lLnJlZ2VuZXJhdGVLZXkoKVxuXG4gICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShzdGFydEJsb2NrLmtleSwgc3RhcnRJbmRleCAtIDEsIHN0YXJ0Tm9kZSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShlbmRCbG9jay5rZXksIGVuZEluZGV4LCBlbmROb2RlLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcblxuICAgIHN0YXJ0SW5saW5lcy5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCBzdGFydE5vZGUua2V5LCBpLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICB9KVxuXG4gICAgZW5kSW5saW5lcy5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgY2hhbmdlLm1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCBlbmROb2RlLmtleSwgaSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgfSlcblxuICAgIGlmIChub3JtYWxpemUpIHtcbiAgICAgIGNoYW5nZVxuICAgICAgICAubm9ybWFsaXplTm9kZUJ5S2V5KHN0YXJ0QmxvY2sua2V5KVxuICAgICAgICAubm9ybWFsaXplTm9kZUJ5S2V5KGVuZEJsb2NrLmtleSlcbiAgICB9XG5cbiAgICBibG9ja3Muc2xpY2UoMSwgLTEpLmZvckVhY2goKGJsb2NrKSA9PiB7XG4gICAgICBjb25zdCBub2RlID0gaW5saW5lLnJlZ2VuZXJhdGVLZXkoKVxuICAgICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShibG9jay5rZXksIDAsIG5vZGUsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuXG4gICAgICBibG9jay5ub2Rlcy5mb3JFYWNoKChjaGlsZCwgaSkgPT4ge1xuICAgICAgICBjaGFuZ2UubW92ZU5vZGVCeUtleShjaGlsZC5rZXksIG5vZGUua2V5LCBpLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgIH0pXG5cbiAgICAgIGlmIChub3JtYWxpemUpIHtcbiAgICAgICAgY2hhbmdlLm5vcm1hbGl6ZU5vZGVCeUtleShibG9jay5rZXkpXG4gICAgICB9XG4gICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIFdyYXAgdGhlIHRleHQgaW4gYSBgcmFuZ2VgIGluIGEgcHJlZml4L3N1ZmZpeC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICogQHBhcmFtIHtTdHJpbmd9IHByZWZpeFxuICogQHBhcmFtIHtTdHJpbmd9IHN1ZmZpeCAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICovXG5cbkNoYW5nZXMud3JhcFRleHRBdFJhbmdlID0gKGNoYW5nZSwgcmFuZ2UsIHByZWZpeCwgc3VmZml4ID0gcHJlZml4LCBvcHRpb25zID0ge30pID0+IHtcbiAgY29uc3QgeyBub3JtYWxpemUgPSB0cnVlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgc3RhcnRLZXksIGVuZEtleSB9ID0gcmFuZ2VcbiAgY29uc3Qgc3RhcnQgPSByYW5nZS5jb2xsYXBzZVRvU3RhcnQoKVxuICBsZXQgZW5kID0gcmFuZ2UuY29sbGFwc2VUb0VuZCgpXG5cbiAgaWYgKHN0YXJ0S2V5ID09IGVuZEtleSkge1xuICAgIGVuZCA9IGVuZC5tb3ZlKHByZWZpeC5sZW5ndGgpXG4gIH1cblxuICBjaGFuZ2UuaW5zZXJ0VGV4dEF0UmFuZ2Uoc3RhcnQsIHByZWZpeCwgW10sIHsgbm9ybWFsaXplIH0pXG4gIGNoYW5nZS5pbnNlcnRUZXh0QXRSYW5nZShlbmQsIHN1ZmZpeCwgW10sIHsgbm9ybWFsaXplIH0pXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlc1xuIl19