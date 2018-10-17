'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _direction = require('direction');

var _direction2 = _interopRequireDefault(_direction);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _immutable = require('immutable');

var _block = require('./block');

var _block2 = _interopRequireDefault(_block);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _inline = require('./inline');

var _inline2 = _interopRequireDefault(_inline);

var _range8 = require('./range');

var _range9 = _interopRequireDefault(_range8);

var _text = require('./text');

var _text2 = _interopRequireDefault(_text);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

var _isIndexInRange = require('../utils/is-index-in-range');

var _isIndexInRange2 = _interopRequireDefault(_isIndexInRange);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Node.
 *
 * And interface that `Document`, `Block` and `Inline` all implement, to make
 * working with the recursive node tree easier.
 *
 * @type {Node}
 */

var Node = function () {
  function Node() {
    _classCallCheck(this, Node);
  }

  _createClass(Node, [{
    key: 'areDescendantsSorted',


    /**
     * True if the node has both descendants in that order, false otherwise. The
     * order is depth-first, post-order.
     *
     * @param {String} first
     * @param {String} second
     * @return {Boolean}
     */

    value: function areDescendantsSorted(first, second) {
      first = assertKey(first);
      second = assertKey(second);

      var keys = this.getKeysAsArray();
      var firstIndex = keys.indexOf(first);
      var secondIndex = keys.indexOf(second);
      if (firstIndex == -1 || secondIndex == -1) return null;

      return firstIndex < secondIndex;
    }

    /**
     * Assert that a node has a child by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertChild',
    value: function assertChild(key) {
      var child = this.getChild(key);

      if (!child) {
        key = assertKey(key);
        throw new Error('Could not find a child node with key "' + key + '".');
      }

      return child;
    }

    /**
     * Assert that a node has a descendant by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertDescendant',
    value: function assertDescendant(key) {
      var descendant = this.getDescendant(key);

      if (!descendant) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      return descendant;
    }

    /**
     * Assert that a node's tree has a node by `key` and return it.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'assertNode',
    value: function assertNode(key) {
      var node = this.getNode(key);

      if (!node) {
        key = assertKey(key);
        throw new Error('Could not find a node with key "' + key + '".');
      }

      return node;
    }

    /**
     * Assert that a node exists at `path` and return it.
     *
     * @param {Array} path
     * @return {Node}
     */

  }, {
    key: 'assertPath',
    value: function assertPath(path) {
      var descendant = this.getDescendantAtPath(path);

      if (!descendant) {
        throw new Error('Could not find a descendant at path "' + path + '".');
      }

      return descendant;
    }

    /**
     * Recursively filter all descendant nodes with `iterator`.
     *
     * @param {Function} iterator
     * @return {List<Node>}
     */

  }, {
    key: 'filterDescendants',
    value: function filterDescendants(iterator) {
      var matches = [];

      this.forEachDescendant(function (node, i, nodes) {
        if (iterator(node, i, nodes)) matches.push(node);
      });

      return (0, _immutable.List)(matches);
    }

    /**
     * Recursively find all descendant nodes by `iterator`.
     *
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'findDescendant',
    value: function findDescendant(iterator) {
      var found = null;

      this.forEachDescendant(function (node, i, nodes) {
        if (iterator(node, i, nodes)) {
          found = node;
          return false;
        }
      });

      return found;
    }

    /**
     * Recursively iterate over all descendant nodes with `iterator`. If the
     * iterator returns false it will break the loop.
     *
     * @param {Function} iterator
     */

  }, {
    key: 'forEachDescendant',
    value: function forEachDescendant(iterator) {
      var ret = void 0;

      this.nodes.forEach(function (child, i, nodes) {
        if (iterator(child, i, nodes) === false) {
          ret = false;
          return false;
        }

        if (child.kind != 'text') {
          ret = child.forEachDescendant(iterator);
          return ret;
        }
      });

      return ret;
    }

    /**
     * Get the path of ancestors of a descendant node by `key`.
     *
     * @param {String|Node} key
     * @return {List<Node>|Null}
     */

  }, {
    key: 'getAncestors',
    value: function getAncestors(key) {
      key = assertKey(key);

      if (key == this.key) return (0, _immutable.List)();
      if (this.hasChild(key)) return (0, _immutable.List)([this]);

      var ancestors = void 0;
      this.nodes.find(function (node) {
        if (node.kind == 'text') return false;
        ancestors = node.getAncestors(key);
        return ancestors;
      });

      if (ancestors) {
        return ancestors.unshift(this);
      } else {
        return null;
      }
    }

    /**
     * Get the leaf block descendants of the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocks',
    value: function getBlocks() {
      var array = this.getBlocksAsArray();
      return new _immutable.List(array);
    }

    /**
     * Get the leaf block descendants of the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksAsArray',
    value: function getBlocksAsArray() {
      return this.nodes.reduce(function (array, child) {
        if (child.kind != 'block') return array;
        if (!child.isLeafBlock()) return array.concat(child.getBlocksAsArray());
        array.push(child);
        return array;
      }, []);
    }

    /**
     * Get the leaf block descendants in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksAtRange',
    value: function getBlocksAtRange(range) {
      var array = this.getBlocksAtRangeAsArray(range);
      // Eliminate duplicates by converting to an `OrderedSet` first.
      return new _immutable.List(new _immutable.OrderedSet(array));
    }

    /**
     * Get the leaf block descendants in a `range` as an array
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getBlocksAtRangeAsArray',
    value: function getBlocksAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      var _range = range,
          startKey = _range.startKey,
          endKey = _range.endKey;

      var startBlock = this.getClosestBlock(startKey);

      // PERF: the most common case is when the range is in a single block node,
      // where we can avoid a lot of iterating of the tree.
      if (startKey == endKey) return [startBlock];

      var endBlock = this.getClosestBlock(endKey);
      var blocks = this.getBlocksAsArray();
      var start = blocks.indexOf(startBlock);
      var end = blocks.indexOf(endBlock);
      return blocks.slice(start, end + 1);
    }

    /**
     * Get all of the leaf blocks that match a `type`.
     *
     * @param {String} type
     * @return {List<Node>}
     */

  }, {
    key: 'getBlocksByType',
    value: function getBlocksByType(type) {
      var array = this.getBlocksByTypeAsArray(type);
      return new _immutable.List(array);
    }

    /**
     * Get all of the leaf blocks that match a `type` as an array
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getBlocksByTypeAsArray',
    value: function getBlocksByTypeAsArray(type) {
      return this.nodes.reduce(function (array, node) {
        if (node.kind != 'block') {
          return array;
        } else if (node.isLeafBlock() && node.type == type) {
          array.push(node);
          return array;
        } else {
          return array.concat(node.getBlocksByTypeAsArray(type));
        }
      }, []);
    }

    /**
     * Get all of the characters for every text node.
     *
     * @return {List<Character>}
     */

  }, {
    key: 'getCharacters',
    value: function getCharacters() {
      var array = this.getCharactersAsArray();
      return new _immutable.List(array);
    }

    /**
     * Get all of the characters for every text node as an array
     *
     * @return {Array}
     */

  }, {
    key: 'getCharactersAsArray',
    value: function getCharactersAsArray() {
      return this.nodes.reduce(function (arr, node) {
        return node.kind == 'text' ? arr.concat(node.characters.toArray()) : arr.concat(node.getCharactersAsArray());
      }, []);
    }

    /**
     * Get a list of the characters in a `range`.
     *
     * @param {Range} range
     * @return {List<Character>}
     */

  }, {
    key: 'getCharactersAtRange',
    value: function getCharactersAtRange(range) {
      var array = this.getCharactersAtRangeAsArray(range);
      return new _immutable.List(array);
    }

    /**
     * Get a list of the characters in a `range` as an array.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getCharactersAtRangeAsArray',
    value: function getCharactersAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      return this.getTextsAtRange(range).reduce(function (arr, text) {
        var chars = text.characters.filter(function (char, i) {
          return (0, _isIndexInRange2.default)(i, text, range);
        }).toArray();

        return arr.concat(chars);
      }, []);
    }

    /**
     * Get a child node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getChild',
    value: function getChild(key) {
      key = assertKey(key);
      return this.nodes.find(function (node) {
        return node.key == key;
      });
    }

    /**
     * Get closest parent of node by `key` that matches `iterator`.
     *
     * @param {String} key
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'getClosest',
    value: function getClosest(key, iterator) {
      key = assertKey(key);
      var ancestors = this.getAncestors(key);
      if (!ancestors) {
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      // Exclude this node itself.
      return ancestors.rest().findLast(iterator);
    }

    /**
     * Get the closest block parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestBlock',
    value: function getClosestBlock(key) {
      return this.getClosest(key, function (parent) {
        return parent.kind == 'block';
      });
    }

    /**
     * Get the closest inline parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestInline',
    value: function getClosestInline(key) {
      return this.getClosest(key, function (parent) {
        return parent.kind == 'inline';
      });
    }

    /**
     * Get the closest void parent of a `node`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getClosestVoid',
    value: function getClosestVoid(key) {
      return this.getClosest(key, function (parent) {
        return parent.isVoid;
      });
    }

    /**
     * Get the common ancestor of nodes `one` and `two` by keys.
     *
     * @param {String} one
     * @param {String} two
     * @return {Node}
     */

  }, {
    key: 'getCommonAncestor',
    value: function getCommonAncestor(one, two) {
      one = assertKey(one);
      two = assertKey(two);

      if (one == this.key) return this;
      if (two == this.key) return this;

      this.assertDescendant(one);
      this.assertDescendant(two);
      var ancestors = new _immutable.List();
      var oneParent = this.getParent(one);
      var twoParent = this.getParent(two);

      while (oneParent) {
        ancestors = ancestors.push(oneParent);
        oneParent = this.getParent(oneParent.key);
      }

      while (twoParent) {
        if (ancestors.includes(twoParent)) return twoParent;
        twoParent = this.getParent(twoParent.key);
      }
    }

    /**
     * Get the decorations for the node from a `stack`.
     *
     * @param {Stack} stack
     * @return {List}
     */

  }, {
    key: 'getDecorations',
    value: function getDecorations(stack) {
      var decorations = stack.find('decorateNode', this);
      var list = _range9.default.createList(decorations || []);
      return list;
    }

    /**
     * Get the depth of a child node by `key`, with optional `startAt`.
     *
     * @param {String} key
     * @param {Number} startAt (optional)
     * @return {Number} depth
     */

  }, {
    key: 'getDepth',
    value: function getDepth(key) {
      var startAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;

      this.assertDescendant(key);
      if (this.hasChild(key)) return startAt;
      return this.getFurthestAncestor(key).getDepth(key, startAt + 1);
    }

    /**
     * Get a descendant node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getDescendant',
    value: function getDescendant(key) {
      key = assertKey(key);
      var descendantFound = null;

      var found = this.nodes.find(function (node) {
        if (node.key === key) {
          return node;
        } else if (node.kind !== 'text') {
          descendantFound = node.getDescendant(key);
          return descendantFound;
        } else {
          return false;
        }
      });

      return descendantFound || found;
    }

    /**
     * Get a descendant by `path`.
     *
     * @param {Array} path
     * @return {Node|Null}
     */

  }, {
    key: 'getDescendantAtPath',
    value: function getDescendantAtPath(path) {
      var descendant = this;

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var index = _step.value;

          if (!descendant) return;
          if (!descendant.nodes) return;
          descendant = descendant.nodes.get(index);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return descendant;
    }

    /**
     * Get the first child text node.
     *
     * @return {Node|Null}
     */

  }, {
    key: 'getFirstText',
    value: function getFirstText() {
      var descendantFound = null;

      var found = this.nodes.find(function (node) {
        if (node.kind == 'text') return true;
        descendantFound = node.getFirstText();
        return descendantFound;
      });

      return descendantFound || found;
    }

    /**
     * Get a fragment of the node at a `range`.
     *
     * @param {Range} range
     * @return {Document}
     */

  }, {
    key: 'getFragmentAtRange',
    value: function getFragmentAtRange(range) {
      range = range.normalize(this);
      if (range.isUnset) return _document2.default.create();

      var node = this;

      // Make sure the children exist.
      var _range2 = range,
          startKey = _range2.startKey,
          startOffset = _range2.startOffset,
          endKey = _range2.endKey,
          endOffset = _range2.endOffset;

      var startText = node.assertDescendant(startKey);
      var endText = node.assertDescendant(endKey);

      // Split at the start and end.
      var child = startText;
      var previous = void 0;
      var parent = void 0;

      while (parent = node.getParent(child.key)) {
        var index = parent.nodes.indexOf(child);
        var position = child.kind == 'text' ? startOffset : child.nodes.indexOf(previous);

        parent = parent.splitNode(index, position);
        node = node.updateNode(parent);
        previous = parent.nodes.get(index + 1);
        child = parent;
      }

      child = startKey == endKey ? node.getNextText(startKey) : endText;

      while (parent = node.getParent(child.key)) {
        var _index = parent.nodes.indexOf(child);
        var _position = child.kind == 'text' ? startKey == endKey ? endOffset - startOffset : endOffset : child.nodes.indexOf(previous);

        parent = parent.splitNode(_index, _position);
        node = node.updateNode(parent);
        previous = parent.nodes.get(_index + 1);
        child = parent;
      }

      // Get the start and end nodes.
      var startNode = node.getNextSibling(node.getFurthestAncestor(startKey).key);
      var endNode = startKey == endKey ? node.getNextSibling(node.getNextSibling(node.getFurthestAncestor(endKey).key).key) : node.getNextSibling(node.getFurthestAncestor(endKey).key);

      // Get children range of nodes from start to end nodes
      var startIndex = node.nodes.indexOf(startNode);
      var endIndex = node.nodes.indexOf(endNode);
      var nodes = node.nodes.slice(startIndex, endIndex);

      // Return a new document fragment.
      return _document2.default.create({ nodes: nodes });
    }

    /**
     * Get the furthest parent of a node by `key` that matches an `iterator`.
     *
     * @param {String} key
     * @param {Function} iterator
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthest',
    value: function getFurthest(key, iterator) {
      var ancestors = this.getAncestors(key);
      if (!ancestors) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      // Exclude this node itself
      return ancestors.rest().find(iterator);
    }

    /**
     * Get the furthest block parent of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestBlock',
    value: function getFurthestBlock(key) {
      return this.getFurthest(key, function (node) {
        return node.kind == 'block';
      });
    }

    /**
     * Get the furthest inline parent of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestInline',
    value: function getFurthestInline(key) {
      return this.getFurthest(key, function (node) {
        return node.kind == 'inline';
      });
    }

    /**
     * Get the furthest ancestor of a node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestAncestor',
    value: function getFurthestAncestor(key) {
      key = assertKey(key);
      return this.nodes.find(function (node) {
        if (node.key == key) return true;
        if (node.kind == 'text') return false;
        return node.hasDescendant(key);
      });
    }

    /**
     * Get the furthest ancestor of a node by `key` that has only one child.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getFurthestOnlyChildAncestor',
    value: function getFurthestOnlyChildAncestor(key) {
      var ancestors = this.getAncestors(key);

      if (!ancestors) {
        key = assertKey(key);
        throw new Error('Could not find a descendant node with key "' + key + '".');
      }

      return ancestors
      // Skip this node...
      .skipLast()
      // Take parents until there are more than one child...
      .reverse().takeUntil(function (p) {
        return p.nodes.size > 1;
      })
      // And pick the highest.
      .last();
    }

    /**
     * Get the closest inline nodes for each text node in the node.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getInlines',
    value: function getInlines() {
      var array = this.getInlinesAsArray();
      return new _immutable.List(array);
    }

    /**
     * Get the closest inline nodes for each text node in the node, as an array.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesAsArray',
    value: function getInlinesAsArray() {
      var array = [];

      this.nodes.forEach(function (child) {
        if (child.kind == 'text') return;
        if (child.isLeafInline()) {
          array.push(child);
        } else {
          array = array.concat(child.getInlinesAsArray());
        }
      });

      return array;
    }

    /**
     * Get the closest inline nodes for each text node in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesAtRange',
    value: function getInlinesAtRange(range) {
      var array = this.getInlinesAtRangeAsArray(range);
      // Remove duplicates by converting it to an `OrderedSet` first.
      return new _immutable.List(new _immutable.OrderedSet(array));
    }

    /**
     * Get the closest inline nodes for each text node in a `range` as an array.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getInlinesAtRangeAsArray',
    value: function getInlinesAtRangeAsArray(range) {
      var _this = this;

      range = range.normalize(this);
      if (range.isUnset) return [];

      return this.getTextsAtRangeAsArray(range).map(function (text) {
        return _this.getClosestInline(text.key);
      }).filter(function (exists) {
        return exists;
      });
    }

    /**
     * Get all of the leaf inline nodes that match a `type`.
     *
     * @param {String} type
     * @return {List<Node>}
     */

  }, {
    key: 'getInlinesByType',
    value: function getInlinesByType(type) {
      var array = this.getInlinesByTypeAsArray(type);
      return new _immutable.List(array);
    }

    /**
     * Get all of the leaf inline nodes that match a `type` as an array.
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getInlinesByTypeAsArray',
    value: function getInlinesByTypeAsArray(type) {
      return this.nodes.reduce(function (inlines, node) {
        if (node.kind == 'text') {
          return inlines;
        } else if (node.isLeafInline() && node.type == type) {
          inlines.push(node);
          return inlines;
        } else {
          return inlines.concat(node.getInlinesByTypeAsArray(type));
        }
      }, []);
    }

    /**
     * Return a set of all keys in the node as an array.
     *
     * @return {Array<String>}
     */

  }, {
    key: 'getKeysAsArray',
    value: function getKeysAsArray() {
      var keys = [];

      this.forEachDescendant(function (desc) {
        keys.push(desc.key);
      });

      return keys;
    }

    /**
     * Return a set of all keys in the node.
     *
     * @return {Set<String>}
     */

  }, {
    key: 'getKeys',
    value: function getKeys() {
      var keys = this.getKeysAsArray();
      return new _immutable.Set(keys);
    }

    /**
     * Get the last child text node.
     *
     * @return {Node|Null}
     */

  }, {
    key: 'getLastText',
    value: function getLastText() {
      var descendantFound = null;

      var found = this.nodes.findLast(function (node) {
        if (node.kind == 'text') return true;
        descendantFound = node.getLastText();
        return descendantFound;
      });

      return descendantFound || found;
    }

    /**
     * Get all of the marks for all of the characters of every text node.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarks',
    value: function getMarks() {
      var array = this.getMarksAsArray();
      return new _immutable.Set(array);
    }

    /**
     * Get all of the marks for all of the characters of every text node.
     *
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarks',
    value: function getOrderedMarks() {
      var array = this.getMarksAsArray();
      return new _immutable.OrderedSet(array);
    }

    /**
     * Get all of the marks as an array.
     *
     * @return {Array}
     */

  }, {
    key: 'getMarksAsArray',
    value: function getMarksAsArray() {
      return this.nodes.reduce(function (marks, node) {
        return marks.concat(node.getMarksAsArray());
      }, []);
    }

    /**
     * Get a set of the marks in a `range`.
     *
     * @param {Range} range
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksAtRange',
    value: function getMarksAtRange(range) {
      var array = this.getMarksAtRangeAsArray(range);
      return new _immutable.Set(array);
    }

    /**
     * Get a set of the marks in a `range`.
     *
     * @param {Range} range
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarksAtRange',
    value: function getOrderedMarksAtRange(range) {
      var array = this.getMarksAtRangeAsArray(range);
      return new _immutable.OrderedSet(array);
    }

    /**
     * Get a set of the active marks in a `range`.
     *
     * @param {Range} range
     * @return {Set<Mark>}
     */

  }, {
    key: 'getActiveMarksAtRange',
    value: function getActiveMarksAtRange(range) {
      var array = this.getActiveMarksAtRangeAsArray(range);
      return new _immutable.Set(array);
    }

    /**
     * Get a set of the marks in a `range`, by unioning.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getMarksAtRangeAsArray',
    value: function getMarksAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      var _range3 = range,
          startKey = _range3.startKey,
          startOffset = _range3.startOffset;

      // If the range is collapsed at the start of the node, check the previous.

      if (range.isCollapsed && startOffset == 0) {
        var previous = this.getPreviousText(startKey);
        if (!previous || previous.text.length == 0) return [];
        var char = previous.characters.get(previous.text.length - 1);
        return char.marks.toArray();
      }

      // If the range is collapsed, check the character before the start.
      if (range.isCollapsed) {
        var text = this.getDescendant(startKey);
        var _char = text.characters.get(range.startOffset - 1);
        return _char.marks.toArray();
      }

      // Otherwise, get a set of the marks for each character in the range.
      return this.getCharactersAtRange(range).reduce(function (memo, char) {
        char.marks.toArray().forEach(function (c) {
          return memo.push(c);
        });
        return memo;
      }, []);
    }

    /**
     * Get a set of marks in a `range`, by intersecting.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getActiveMarksAtRangeAsArray',
    value: function getActiveMarksAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      var _range4 = range,
          startKey = _range4.startKey,
          startOffset = _range4.startOffset;

      // If the range is collapsed at the start of the node, check the previous.

      if (range.isCollapsed && startOffset == 0) {
        var previous = this.getPreviousText(startKey);
        if (!previous || !previous.length) return [];
        var char = previous.characters.get(previous.length - 1);
        return char.marks.toArray();
      }

      // If the range is collapsed, check the character before the start.
      if (range.isCollapsed) {
        var text = this.getDescendant(startKey);
        var _char2 = text.characters.get(range.startOffset - 1);
        return _char2.marks.toArray();
      }

      // Otherwise, get a set of the marks for each character in the range.
      var chars = this.getCharactersAtRange(range);
      var first = chars.first();
      if (!first) return [];

      var memo = first.marks;

      chars.slice(1).forEach(function (char) {
        memo = memo.intersect(char.marks);
        return memo.size != 0;
      });

      return memo.toArray();
    }

    /**
     * Get all of the marks that match a `type`.
     *
     * @param {String} type
     * @return {Set<Mark>}
     */

  }, {
    key: 'getMarksByType',
    value: function getMarksByType(type) {
      var array = this.getMarksByTypeAsArray(type);
      return new _immutable.Set(array);
    }

    /**
     * Get all of the marks that match a `type`.
     *
     * @param {String} type
     * @return {OrderedSet<Mark>}
     */

  }, {
    key: 'getOrderedMarksByType',
    value: function getOrderedMarksByType(type) {
      var array = this.getMarksByTypeAsArray(type);
      return new _immutable.OrderedSet(array);
    }

    /**
     * Get all of the marks that match a `type` as an array.
     *
     * @param {String} type
     * @return {Array}
     */

  }, {
    key: 'getMarksByTypeAsArray',
    value: function getMarksByTypeAsArray(type) {
      return this.nodes.reduce(function (array, node) {
        return node.kind == 'text' ? array.concat(node.getMarksAsArray().filter(function (m) {
          return m.type == type;
        })) : array.concat(node.getMarksByTypeAsArray(type));
      }, []);
    }

    /**
     * Get the block node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextBlock',
    value: function getNextBlock(key) {
      var child = this.assertDescendant(key);
      var last = void 0;

      if (child.kind == 'block') {
        last = child.getLastText();
      } else {
        var block = this.getClosestBlock(key);
        last = block.getLastText();
      }

      var next = this.getNextText(last.key);
      if (!next) return null;

      return this.getClosestBlock(next.key);
    }

    /**
     * Get the node after a descendant by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextSibling',
    value: function getNextSibling(key) {
      key = assertKey(key);

      var parent = this.getParent(key);
      var after = parent.nodes.skipUntil(function (child) {
        return child.key == key;
      });

      if (after.size == 0) {
        throw new Error('Could not find a child node with key "' + key + '".');
      }
      return after.get(1);
    }

    /**
     * Get the text node after a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNextText',
    value: function getNextText(key) {
      key = assertKey(key);
      return this.getTexts().skipUntil(function (text) {
        return text.key == key;
      }).get(1);
    }

    /**
     * Get a node in the tree by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getNode',
    value: function getNode(key) {
      key = assertKey(key);
      return this.key == key ? this : this.getDescendant(key);
    }

    /**
     * Get a node in the tree by `path`.
     *
     * @param {Array} path
     * @return {Node|Null}
     */

  }, {
    key: 'getNodeAtPath',
    value: function getNodeAtPath(path) {
      return path.length ? this.getDescendantAtPath(path) : this;
    }

    /**
     * Get the offset for a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Number}
     */

  }, {
    key: 'getOffset',
    value: function getOffset(key) {
      this.assertDescendant(key);

      // Calculate the offset of the nodes before the highest child.
      var child = this.getFurthestAncestor(key);
      var offset = this.nodes.takeUntil(function (n) {
        return n == child;
      }).reduce(function (memo, n) {
        return memo + n.text.length;
      }, 0);

      // Recurse if need be.
      return this.hasChild(key) ? offset : offset + child.getOffset(key);
    }

    /**
     * Get the offset from a `range`.
     *
     * @param {Range} range
     * @return {Number}
     */

  }, {
    key: 'getOffsetAtRange',
    value: function getOffsetAtRange(range) {
      range = range.normalize(this);

      if (range.isUnset) {
        throw new Error('The range cannot be unset to calculcate its offset.');
      }

      if (range.isExpanded) {
        throw new Error('The range must be collapsed to calculcate its offset.');
      }

      var _range5 = range,
          startKey = _range5.startKey,
          startOffset = _range5.startOffset;

      return this.getOffset(startKey) + startOffset;
    }

    /**
     * Get the parent of a child node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getParent',
    value: function getParent(key) {
      if (this.hasChild(key)) return this;

      var node = null;

      this.nodes.find(function (child) {
        if (child.kind == 'text') {
          return false;
        } else {
          node = child.getParent(key);
          return node;
        }
      });

      return node;
    }

    /**
     * Get the path of a descendant node by `key`.
     *
     * @param {String|Node} key
     * @return {Array}
     */

  }, {
    key: 'getPath',
    value: function getPath(key) {
      var child = this.assertNode(key);
      var ancestors = this.getAncestors(key);
      var path = [];

      ancestors.reverse().forEach(function (ancestor) {
        var index = ancestor.nodes.indexOf(child);
        path.unshift(index);
        child = ancestor;
      });

      return path;
    }

    /**
     * Get the placeholder for the node from a `schema`.
     *
     * @param {Schema} schema
     * @return {Component|Void}
     */

  }, {
    key: 'getPlaceholder',
    value: function getPlaceholder(schema) {
      return schema.__getPlaceholder(this);
    }

    /**
     * Get the block node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousBlock',
    value: function getPreviousBlock(key) {
      var child = this.assertDescendant(key);
      var first = void 0;

      if (child.kind == 'block') {
        first = child.getFirstText();
      } else {
        var block = this.getClosestBlock(key);
        first = block.getFirstText();
      }

      var previous = this.getPreviousText(first.key);
      if (!previous) return null;

      return this.getClosestBlock(previous.key);
    }

    /**
     * Get the node before a descendant node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousSibling',
    value: function getPreviousSibling(key) {
      key = assertKey(key);
      var parent = this.getParent(key);
      var before = parent.nodes.takeUntil(function (child) {
        return child.key == key;
      });

      if (before.size == parent.nodes.size) {
        throw new Error('Could not find a child node with key "' + key + '".');
      }

      return before.last();
    }

    /**
     * Get the text node before a descendant text node by `key`.
     *
     * @param {String} key
     * @return {Node|Null}
     */

  }, {
    key: 'getPreviousText',
    value: function getPreviousText(key) {
      key = assertKey(key);
      return this.getTexts().takeUntil(function (text) {
        return text.key == key;
      }).last();
    }

    /**
     * Get the indexes of the selection for a `range`, given an extra flag for
     * whether the node `isSelected`, to determine whether not finding matches
     * means everything is selected or nothing is.
     *
     * @param {Range} range
     * @param {Boolean} isSelected
     * @return {Object|Null}
     */

  }, {
    key: 'getSelectionIndexes',
    value: function getSelectionIndexes(range) {
      var isSelected = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var startKey = range.startKey,
          endKey = range.endKey;

      // PERF: if we're not selected, or the range is blurred, we can exit early.

      if (!isSelected || range.isBlurred) {
        return null;
      }

      // PERF: if the start and end keys are the same, just check for the child
      // that contains that single key.
      if (startKey == endKey) {
        var child = this.getFurthestAncestor(startKey);
        var index = child ? this.nodes.indexOf(child) : null;
        return { start: index, end: index + 1 };
      }

      // Otherwise, check all of the children...
      var start = null;
      var end = null;

      this.nodes.forEach(function (child, i) {
        if (child.kind == 'text') {
          if (start == null && child.key == startKey) start = i;
          if (end == null && child.key == endKey) end = i + 1;
        } else {
          if (start == null && child.hasDescendant(startKey)) start = i;
          if (end == null && child.hasDescendant(endKey)) end = i + 1;
        }

        // PERF: exit early if both start and end have been found.
        return start == null || end == null;
      });

      if (isSelected && start == null) start = 0;
      if (isSelected && end == null) end = this.nodes.size;
      return start == null ? null : { start: start, end: end };
    }

    /**
     * Get the concatenated text string of all child nodes.
     *
     * @return {String}
     */

  }, {
    key: 'getText',
    value: function getText() {
      return this.nodes.reduce(function (string, node) {
        return string + node.text;
      }, '');
    }

    /**
     * Get the descendent text node at an `offset`.
     *
     * @param {String} offset
     * @return {Node|Null}
     */

  }, {
    key: 'getTextAtOffset',
    value: function getTextAtOffset(offset) {
      // PERF: Add a few shortcuts for the obvious cases.
      if (offset == 0) return this.getFirstText();
      if (offset == this.text.length) return this.getLastText();
      if (offset < 0 || offset > this.text.length) return null;

      var length = 0;

      return this.getTexts().find(function (node, i, nodes) {
        length += node.text.length;
        return length > offset;
      });
    }

    /**
     * Get the direction of the node's text.
     *
     * @return {String}
     */

  }, {
    key: 'getTextDirection',
    value: function getTextDirection() {
      var dir = (0, _direction2.default)(this.text);
      return dir == 'neutral' ? undefined : dir;
    }

    /**
     * Recursively get all of the child text nodes in order of appearance.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getTexts',
    value: function getTexts() {
      var array = this.getTextsAsArray();
      return new _immutable.List(array);
    }

    /**
     * Recursively get all the leaf text nodes in order of appearance, as array.
     *
     * @return {List<Node>}
     */

  }, {
    key: 'getTextsAsArray',
    value: function getTextsAsArray() {
      var array = [];

      this.nodes.forEach(function (node) {
        if (node.kind == 'text') {
          array.push(node);
        } else {
          array = array.concat(node.getTextsAsArray());
        }
      });

      return array;
    }

    /**
     * Get all of the text nodes in a `range`.
     *
     * @param {Range} range
     * @return {List<Node>}
     */

  }, {
    key: 'getTextsAtRange',
    value: function getTextsAtRange(range) {
      var array = this.getTextsAtRangeAsArray(range);
      return new _immutable.List(array);
    }

    /**
     * Get all of the text nodes in a `range` as an array.
     *
     * @param {Range} range
     * @return {Array}
     */

  }, {
    key: 'getTextsAtRangeAsArray',
    value: function getTextsAtRangeAsArray(range) {
      range = range.normalize(this);
      if (range.isUnset) return [];

      var _range6 = range,
          startKey = _range6.startKey,
          endKey = _range6.endKey;

      var startText = this.getDescendant(startKey);

      // PERF: the most common case is when the range is in a single text node,
      // where we can avoid a lot of iterating of the tree.
      if (startKey == endKey) return [startText];

      var endText = this.getDescendant(endKey);
      var texts = this.getTextsAsArray();
      var start = texts.indexOf(startText);
      var end = texts.indexOf(endText);
      return texts.slice(start, end + 1);
    }

    /**
     * Check if a child node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasChild',
    value: function hasChild(key) {
      return !!this.getChild(key);
    }

    /**
     * Recursively check if a child node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasDescendant',
    value: function hasDescendant(key) {
      return !!this.getDescendant(key);
    }

    /**
     * Recursively check if a node exists by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasNode',
    value: function hasNode(key) {
      return !!this.getNode(key);
    }

    /**
     * Check if a node has a void parent by `key`.
     *
     * @param {String} key
     * @return {Boolean}
     */

  }, {
    key: 'hasVoidParent',
    value: function hasVoidParent(key) {
      return !!this.getClosest(key, function (parent) {
        return parent.isVoid;
      });
    }

    /**
     * Insert a `node` at `index`.
     *
     * @param {Number} index
     * @param {Node} node
     * @return {Node}
     */

  }, {
    key: 'insertNode',
    value: function insertNode(index, node) {
      var keys = this.getKeys();

      if (keys.contains(node.key)) {
        node = node.regenerateKey();
      }

      if (node.kind != 'text') {
        node = node.mapDescendants(function (desc) {
          return keys.contains(desc.key) ? desc.regenerateKey() : desc;
        });
      }

      var nodes = this.nodes.insert(index, node);
      return this.set('nodes', nodes);
    }

    /**
     * Check whether the node is in a `range`.
     *
     * @param {Range} range
     * @return {Boolean}
     */

  }, {
    key: 'isInRange',
    value: function isInRange(range) {
      range = range.normalize(this);

      var node = this;
      var _range7 = range,
          startKey = _range7.startKey,
          endKey = _range7.endKey,
          isCollapsed = _range7.isCollapsed;

      // PERF: solve the most common cast where the start or end key are inside
      // the node, for collapsed selections.

      if (node.key == startKey || node.key == endKey || node.hasDescendant(startKey) || node.hasDescendant(endKey)) {
        return true;
      }

      // PERF: if the selection is collapsed and the previous check didn't return
      // true, then it must be false.
      if (isCollapsed) {
        return false;
      }

      // Otherwise, look through all of the leaf text nodes in the range, to see
      // if any of them are inside the node.
      var texts = node.getTextsAtRange(range);
      var memo = false;

      texts.forEach(function (text) {
        if (node.hasDescendant(text.key)) memo = true;
        return memo;
      });

      return memo;
    }

    /**
     * Check whether the node is a leaf block.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isLeafBlock',
    value: function isLeafBlock() {
      return this.kind == 'block' && this.nodes.every(function (n) {
        return n.kind != 'block';
      });
    }

    /**
     * Check whether the node is a leaf inline.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isLeafInline',
    value: function isLeafInline() {
      return this.kind == 'inline' && this.nodes.every(function (n) {
        return n.kind != 'inline';
      });
    }

    /**
     * Merge a children node `first` with another children node `second`.
     * `first` and `second` will be concatenated in that order.
     * `first` and `second` must be two Nodes or two Text.
     *
     * @param {Node} first
     * @param {Node} second
     * @return {Node}
     */

  }, {
    key: 'mergeNode',
    value: function mergeNode(withIndex, index) {
      var node = this;
      var one = node.nodes.get(withIndex);
      var two = node.nodes.get(index);

      if (one.kind != two.kind) {
        throw new Error('Tried to merge two nodes of different kinds: "' + one.kind + '" and "' + two.kind + '".');
      }

      // If the nodes are text nodes, concatenate their characters together.
      if (one.kind == 'text') {
        var characters = one.characters.concat(two.characters);
        one = one.set('characters', characters);
      }

      // Otherwise, concatenate their child nodes together.
      else {
          var nodes = one.nodes.concat(two.nodes);
          one = one.set('nodes', nodes);
        }

      node = node.removeNode(index);
      node = node.removeNode(withIndex);
      node = node.insertNode(withIndex, one);
      return node;
    }

    /**
     * Map all child nodes, updating them in their parents. This method is
     * optimized to not return a new node if no changes are made.
     *
     * @param {Function} iterator
     * @return {Node}
     */

  }, {
    key: 'mapChildren',
    value: function mapChildren(iterator) {
      var _this2 = this;

      var nodes = this.nodes;


      nodes.forEach(function (node, i) {
        var ret = iterator(node, i, _this2.nodes);
        if (ret != node) nodes = nodes.set(ret.key, ret);
      });

      return this.set('nodes', nodes);
    }

    /**
     * Map all descendant nodes, updating them in their parents. This method is
     * optimized to not return a new node if no changes are made.
     *
     * @param {Function} iterator
     * @return {Node}
     */

  }, {
    key: 'mapDescendants',
    value: function mapDescendants(iterator) {
      var _this3 = this;

      var nodes = this.nodes;


      nodes.forEach(function (node, i) {
        var ret = node;
        if (ret.kind != 'text') ret = ret.mapDescendants(iterator);
        ret = iterator(ret, i, _this3.nodes);
        if (ret == node) return;

        var index = nodes.indexOf(node);
        nodes = nodes.set(index, ret);
      });

      return this.set('nodes', nodes);
    }

    /**
     * Regenerate the node's key.
     *
     * @return {Node}
     */

  }, {
    key: 'regenerateKey',
    value: function regenerateKey() {
      var key = (0, _generateKey2.default)();
      return this.set('key', key);
    }

    /**
     * Remove a `node` from the children node map.
     *
     * @param {String} key
     * @return {Node}
     */

  }, {
    key: 'removeDescendant',
    value: function removeDescendant(key) {
      key = assertKey(key);

      var node = this;
      var parent = node.getParent(key);
      if (!parent) throw new Error('Could not find a descendant node with key "' + key + '".');

      var index = parent.nodes.findIndex(function (n) {
        return n.key === key;
      });
      var nodes = parent.nodes.splice(index, 1);

      parent = parent.set('nodes', nodes);
      node = node.updateNode(parent);
      return node;
    }

    /**
     * Remove a node at `index`.
     *
     * @param {Number} index
     * @return {Node}
     */

  }, {
    key: 'removeNode',
    value: function removeNode(index) {
      var nodes = this.nodes.splice(index, 1);
      return this.set('nodes', nodes);
    }

    /**
     * Split a child node by `index` at `position`.
     *
     * @param {Number} index
     * @param {Number} position
     * @return {Node}
     */

  }, {
    key: 'splitNode',
    value: function splitNode(index, position) {
      var node = this;
      var child = node.nodes.get(index);
      var one = void 0;
      var two = void 0;

      // If the child is a text node, the `position` refers to the text offset at
      // which to split it.
      if (child.kind == 'text') {
        var befores = child.characters.take(position);
        var afters = child.characters.skip(position);
        one = child.set('characters', befores);
        two = child.set('characters', afters).regenerateKey();
      }

      // Otherwise, if the child is not a text node, the `position` refers to the
      // index at which to split its children.
      else {
          var _befores = child.nodes.take(position);
          var _afters = child.nodes.skip(position);
          one = child.set('nodes', _befores);
          two = child.set('nodes', _afters).regenerateKey();
        }

      // Remove the old node and insert the newly split children.
      node = node.removeNode(index);
      node = node.insertNode(index, two);
      node = node.insertNode(index, one);
      return node;
    }

    /**
     * Set a new value for a child node by `key`.
     *
     * @param {Node} node
     * @return {Node}
     */

  }, {
    key: 'updateNode',
    value: function updateNode(node) {
      if (node.key == this.key) {
        return node;
      }

      var child = this.assertDescendant(node.key);
      var ancestors = this.getAncestors(node.key);

      ancestors.reverse().forEach(function (parent) {
        var _parent = parent,
            nodes = _parent.nodes;

        var index = nodes.indexOf(child);
        child = parent;
        nodes = nodes.set(index, node);
        parent = parent.set('nodes', nodes);
        node = parent;
      });

      return node;
    }

    /**
     * Validate the node against a `schema`.
     *
     * @param {Schema} schema
     * @return {Function|Null}
     */

  }, {
    key: 'validate',
    value: function validate(schema) {
      return schema.validateNode(this);
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Node` with `attrs`.
     *
     * @param {Object|Node} attrs
     * @return {Node}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Node.isNode(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        switch (attrs.kind) {
          case 'block':
            return _block2.default.create(attrs);
          case 'document':
            return _document2.default.create(attrs);
          case 'inline':
            return _inline2.default.create(attrs);
          case 'text':
            return _text2.default.create(attrs);
          default:
            {
              throw new Error('`Node.create` requires a `kind` string.');
            }
        }
      }

      throw new Error('`Node.create` only accepts objects or nodes but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Nodes` from an array.
     *
     * @param {Array<Object|Node>} elements
     * @return {List<Node>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Node.create));
        return list;
      }

      throw new Error('`Node.createList` only accepts lists or arrays, but you passed it: ' + elements);
    }

    /**
     * Create a dictionary of settable node properties from `attrs`.
     *
     * @param {Object|String|Node} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (_block2.default.isBlock(attrs) || _inline2.default.isInline(attrs)) {
        return {
          data: attrs.data,
          isVoid: attrs.isVoid,
          type: attrs.type
        };
      }

      if (typeof attrs == 'string') {
        return { type: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        var props = {};
        if ('type' in attrs) props.type = attrs.type;
        if ('data' in attrs) props.data = _data2.default.create(attrs.data);
        if ('isVoid' in attrs) props.isVoid = attrs.isVoid;
        return props;
      }

      throw new Error('`Node.createProperties` only accepts objects, strings, blocks or inlines, but you passed it: ' + attrs);
    }

    /**
     * Create a `Node` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Node}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var kind = object.kind;


      switch (kind) {
        case 'block':
          return _block2.default.fromJSON(object);
        case 'document':
          return _document2.default.fromJSON(object);
        case 'inline':
          return _inline2.default.fromJSON(object);
        case 'text':
          return _text2.default.fromJSON(object);
        default:
          {
            throw new Error('`Node.fromJSON` requires a `kind` of either \'block\', \'document\', \'inline\' or \'text\', but you passed: ' + kind);
          }
      }
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isNode',


    /**
     * Check if `any` is a `Node`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isNode(any) {
      return _block2.default.isBlock(any) || _document2.default.isDocument(any) || _inline2.default.isInline(any) || _text2.default.isText(any);
    }

    /**
     * Check if `any` is a list of nodes.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isNodeList',
    value: function isNodeList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Node.isNode(item);
      });
    }
  }]);

  return Node;
}();

/**
 * Assert a key `arg`.
 *
 * @param {String} arg
 * @return {String}
 */

Node.fromJS = Node.fromJSON;
function assertKey(arg) {
  if (typeof arg == 'string') return arg;
  throw new Error('Invalid `key` argument! It must be a key string, but you passed: ' + arg);
}

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Node.prototype, ['getBlocks', 'getBlocksAsArray', 'getCharacters', 'getCharactersAsArray', 'getFirstText', 'getInlines', 'getInlinesAsArray', 'getKeys', 'getKeysAsArray', 'getLastText', 'getMarks', 'getOrderedMarks', 'getMarksAsArray', 'getText', 'getTextDirection', 'getTexts', 'getTextsAsArray', 'isLeafBlock', 'isLeafInline'], {
  takesArguments: false
});

(0, _memoize2.default)(Node.prototype, ['areDescendantsSorted', 'getActiveMarksAtRange', 'getActiveMarksAtRangeAsArray', 'getAncestors', 'getBlocksAtRange', 'getBlocksAtRangeAsArray', 'getBlocksByType', 'getBlocksByTypeAsArray', 'getCharactersAtRange', 'getCharactersAtRangeAsArray', 'getChild', 'getClosestBlock', 'getClosestInline', 'getClosestVoid', 'getCommonAncestor', 'getDecorations', 'getDepth', 'getDescendant', 'getDescendantAtPath', 'getFragmentAtRange', 'getFurthestBlock', 'getFurthestInline', 'getFurthestAncestor', 'getFurthestOnlyChildAncestor', 'getInlinesAtRange', 'getInlinesAtRangeAsArray', 'getInlinesByType', 'getInlinesByTypeAsArray', 'getMarksAtRange', 'getOrderedMarksAtRange', 'getMarksAtRangeAsArray', 'getMarksByType', 'getOrderedMarksByType', 'getMarksByTypeAsArray', 'getNextBlock', 'getNextSibling', 'getNextText', 'getNode', 'getNodeAtPath', 'getOffset', 'getOffsetAtRange', 'getParent', 'getPath', 'getPlaceholder', 'getPreviousBlock', 'getPreviousSibling', 'getPreviousText', 'getTextAtOffset', 'getTextsAtRange', 'getTextsAtRangeAsArray', 'hasChild', 'hasDescendant', 'hasNode', 'hasVoidParent', 'validate'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Node;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvbm9kZS5qcyJdLCJuYW1lcyI6WyJOb2RlIiwiZmlyc3QiLCJzZWNvbmQiLCJhc3NlcnRLZXkiLCJrZXlzIiwiZ2V0S2V5c0FzQXJyYXkiLCJmaXJzdEluZGV4IiwiaW5kZXhPZiIsInNlY29uZEluZGV4Iiwia2V5IiwiY2hpbGQiLCJnZXRDaGlsZCIsIkVycm9yIiwiZGVzY2VuZGFudCIsImdldERlc2NlbmRhbnQiLCJub2RlIiwiZ2V0Tm9kZSIsInBhdGgiLCJnZXREZXNjZW5kYW50QXRQYXRoIiwiaXRlcmF0b3IiLCJtYXRjaGVzIiwiZm9yRWFjaERlc2NlbmRhbnQiLCJpIiwibm9kZXMiLCJwdXNoIiwiZm91bmQiLCJyZXQiLCJmb3JFYWNoIiwia2luZCIsImhhc0NoaWxkIiwiYW5jZXN0b3JzIiwiZmluZCIsImdldEFuY2VzdG9ycyIsInVuc2hpZnQiLCJhcnJheSIsImdldEJsb2Nrc0FzQXJyYXkiLCJyZWR1Y2UiLCJpc0xlYWZCbG9jayIsImNvbmNhdCIsInJhbmdlIiwiZ2V0QmxvY2tzQXRSYW5nZUFzQXJyYXkiLCJub3JtYWxpemUiLCJpc1Vuc2V0Iiwic3RhcnRLZXkiLCJlbmRLZXkiLCJzdGFydEJsb2NrIiwiZ2V0Q2xvc2VzdEJsb2NrIiwiZW5kQmxvY2siLCJibG9ja3MiLCJzdGFydCIsImVuZCIsInNsaWNlIiwidHlwZSIsImdldEJsb2Nrc0J5VHlwZUFzQXJyYXkiLCJnZXRDaGFyYWN0ZXJzQXNBcnJheSIsImFyciIsImNoYXJhY3RlcnMiLCJ0b0FycmF5IiwiZ2V0Q2hhcmFjdGVyc0F0UmFuZ2VBc0FycmF5IiwiZ2V0VGV4dHNBdFJhbmdlIiwidGV4dCIsImNoYXJzIiwiZmlsdGVyIiwiY2hhciIsInJlc3QiLCJmaW5kTGFzdCIsImdldENsb3Nlc3QiLCJwYXJlbnQiLCJpc1ZvaWQiLCJvbmUiLCJ0d28iLCJhc3NlcnREZXNjZW5kYW50Iiwib25lUGFyZW50IiwiZ2V0UGFyZW50IiwidHdvUGFyZW50IiwiaW5jbHVkZXMiLCJzdGFjayIsImRlY29yYXRpb25zIiwibGlzdCIsImNyZWF0ZUxpc3QiLCJzdGFydEF0IiwiZ2V0RnVydGhlc3RBbmNlc3RvciIsImdldERlcHRoIiwiZGVzY2VuZGFudEZvdW5kIiwiaW5kZXgiLCJnZXQiLCJnZXRGaXJzdFRleHQiLCJjcmVhdGUiLCJzdGFydE9mZnNldCIsImVuZE9mZnNldCIsInN0YXJ0VGV4dCIsImVuZFRleHQiLCJwcmV2aW91cyIsInBvc2l0aW9uIiwic3BsaXROb2RlIiwidXBkYXRlTm9kZSIsImdldE5leHRUZXh0Iiwic3RhcnROb2RlIiwiZ2V0TmV4dFNpYmxpbmciLCJlbmROb2RlIiwic3RhcnRJbmRleCIsImVuZEluZGV4IiwiZ2V0RnVydGhlc3QiLCJoYXNEZXNjZW5kYW50Iiwic2tpcExhc3QiLCJyZXZlcnNlIiwidGFrZVVudGlsIiwicCIsInNpemUiLCJsYXN0IiwiZ2V0SW5saW5lc0FzQXJyYXkiLCJpc0xlYWZJbmxpbmUiLCJnZXRJbmxpbmVzQXRSYW5nZUFzQXJyYXkiLCJnZXRUZXh0c0F0UmFuZ2VBc0FycmF5IiwibWFwIiwiZ2V0Q2xvc2VzdElubGluZSIsImV4aXN0cyIsImdldElubGluZXNCeVR5cGVBc0FycmF5IiwiaW5saW5lcyIsImRlc2MiLCJnZXRMYXN0VGV4dCIsImdldE1hcmtzQXNBcnJheSIsIm1hcmtzIiwiZ2V0TWFya3NBdFJhbmdlQXNBcnJheSIsImdldEFjdGl2ZU1hcmtzQXRSYW5nZUFzQXJyYXkiLCJpc0NvbGxhcHNlZCIsImdldFByZXZpb3VzVGV4dCIsImxlbmd0aCIsImdldENoYXJhY3RlcnNBdFJhbmdlIiwibWVtbyIsImMiLCJpbnRlcnNlY3QiLCJnZXRNYXJrc0J5VHlwZUFzQXJyYXkiLCJtIiwiYmxvY2siLCJuZXh0IiwiYWZ0ZXIiLCJza2lwVW50aWwiLCJnZXRUZXh0cyIsIm9mZnNldCIsIm4iLCJnZXRPZmZzZXQiLCJpc0V4cGFuZGVkIiwiYXNzZXJ0Tm9kZSIsImFuY2VzdG9yIiwic2NoZW1hIiwiX19nZXRQbGFjZWhvbGRlciIsImJlZm9yZSIsImlzU2VsZWN0ZWQiLCJpc0JsdXJyZWQiLCJzdHJpbmciLCJkaXIiLCJ1bmRlZmluZWQiLCJnZXRUZXh0c0FzQXJyYXkiLCJ0ZXh0cyIsImdldEtleXMiLCJjb250YWlucyIsInJlZ2VuZXJhdGVLZXkiLCJtYXBEZXNjZW5kYW50cyIsImluc2VydCIsInNldCIsImV2ZXJ5Iiwid2l0aEluZGV4IiwicmVtb3ZlTm9kZSIsImluc2VydE5vZGUiLCJmaW5kSW5kZXgiLCJzcGxpY2UiLCJiZWZvcmVzIiwidGFrZSIsImFmdGVycyIsInNraXAiLCJ2YWxpZGF0ZU5vZGUiLCJhdHRycyIsImlzTm9kZSIsImVsZW1lbnRzIiwiaXNMaXN0IiwiQXJyYXkiLCJpc0FycmF5IiwiaXNCbG9jayIsImlzSW5saW5lIiwiZGF0YSIsInByb3BzIiwib2JqZWN0IiwiZnJvbUpTT04iLCJhbnkiLCJpc0RvY3VtZW50IiwiaXNUZXh0IiwiaXRlbSIsImZyb21KUyIsImFyZyIsInByb3RvdHlwZSIsInRha2VzQXJndW1lbnRzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUE7Ozs7Ozs7OztJQVNNQSxJOzs7Ozs7Ozs7QUFrSUo7Ozs7Ozs7Ozt5Q0FTcUJDLEssRUFBT0MsTSxFQUFRO0FBQ2xDRCxjQUFRRSxVQUFVRixLQUFWLENBQVI7QUFDQUMsZUFBU0MsVUFBVUQsTUFBVixDQUFUOztBQUVBLFVBQU1FLE9BQU8sS0FBS0MsY0FBTCxFQUFiO0FBQ0EsVUFBTUMsYUFBYUYsS0FBS0csT0FBTCxDQUFhTixLQUFiLENBQW5CO0FBQ0EsVUFBTU8sY0FBY0osS0FBS0csT0FBTCxDQUFhTCxNQUFiLENBQXBCO0FBQ0EsVUFBSUksY0FBYyxDQUFDLENBQWYsSUFBb0JFLGVBQWUsQ0FBQyxDQUF4QyxFQUEyQyxPQUFP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ckJzQixFQXNCdEIsbUJBdEJzQixFQXVCdEIscUJBdkJzQixFQXdCdEIsOEJBeEJzQixFQXlCdEIsbUJBekJzQixFQTBCdEIsMEJBMUJzQixFQTJCdEIsa0JBM0JzQixFQTRCdEIseUJBNUJzQixFQTZCdEIsaUJBN0JzQixFQThCdEIsd0JBOUJzQixFQStCdEIsd0JBL0JzQixFQWdDdEIsZ0JBaENzQixFQWlDdEIsdUJBakNzQixFQWtDdEIsdUJBbENzQixFQW1DdEIsY0FuQ3NCLEVBb0N0QixnQkFwQ3NCLEVBcUN0QixhQXJDc0IsRUFzQ3RCLFNBdENzQixFQXVDdEIsZUF2Q3NCLEVBd0N0QixXQXhDc0IsRUF5Q3RCLGtCQXpDc0IsRUEwQ3RCLFdBMUNzQixFQTJDdEIsU0EzQ3NCLEVBNEN0QixnQkE1Q3NCLEVBNkN0QixrQkE3Q3NCLEVBOEN0QixvQkE5Q3NCLEVBK0N0QixpQkEvQ3NCLEVBZ0R0QixpQkFoRHNCLEVBaUR0QixpQkFqRHNCLEVBa0R0Qix3QkFsRHNCLEVBbUR0QixVQW5Ec0IsRUFvRHRCLGVBcERzQixFQXFEdEIsU0FyRHNCLEVBc0R0QixlQXREc0IsRUF1RHRCLFVBdkRzQixDQUF4QixFQXdERztBQUNEQyxrQkFBZ0I7QUFEZixDQXhESDs7QUE0REE7Ozs7OztrQkFNZS9MLEkiLCJmaWxlIjoibm9kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGRpcmVjdGlvbiBmcm9tICdkaXJlY3Rpb24nXG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdpcy1wbGFpbi1vYmplY3QnXG5pbXBvcnQgeyBMaXN0LCBPcmRlcmVkU2V0LCBTZXQgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBCbG9jayBmcm9tICcuL2Jsb2NrJ1xuaW1wb3J0IERhdGEgZnJvbSAnLi9kYXRhJ1xuaW1wb3J0IERvY3VtZW50IGZyb20gJy4vZG9jdW1lbnQnXG5pbXBvcnQgSW5saW5lIGZyb20gJy4vaW5saW5lJ1xuaW1wb3J0IFJhbmdlIGZyb20gJy4vcmFuZ2UnXG5pbXBvcnQgVGV4dCBmcm9tICcuL3RleHQnXG5pbXBvcnQgZ2VuZXJhdGVLZXkgZnJvbSAnLi4vdXRpbHMvZ2VuZXJhdGUta2V5J1xuaW1wb3J0IGlzSW5kZXhJblJhbmdlIGZyb20gJy4uL3V0aWxzL2lzLWluZGV4LWluLXJhbmdlJ1xuaW1wb3J0IG1lbW9pemUgZnJvbSAnLi4vdXRpbHMvbWVtb2l6ZSdcblxuLyoqXG4gKiBOb2RlLlxuICpcbiAqIEFuZCBpbnRlcmZhY2UgdGhhdCBgRG9jdW1lbnRgLCBgQmxvY2tgIGFuZCBgSW5saW5lYCBhbGwgaW1wbGVtZW50LCB0byBtYWtlXG4gKiB3b3JraW5nIHdpdGggdGhlIHJlY3Vyc2l2ZSBub2RlIHRyZWUgZWFzaWVyLlxuICpcbiAqIEB0eXBlIHtOb2RlfVxuICovXG5cbmNsYXNzIE5vZGUge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYE5vZGVgIHdpdGggYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8Tm9kZX0gYXR0cnNcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZShhdHRycyA9IHt9KSB7XG4gICAgaWYgKE5vZGUuaXNOb2RlKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzXG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICBzd2l0Y2ggKGF0dHJzLmtpbmQpIHtcbiAgICAgICAgY2FzZSAnYmxvY2snOiByZXR1cm4gQmxvY2suY3JlYXRlKGF0dHJzKVxuICAgICAgICBjYXNlICdkb2N1bWVudCc6IHJldHVybiBEb2N1bWVudC5jcmVhdGUoYXR0cnMpXG4gICAgICAgIGNhc2UgJ2lubGluZSc6IHJldHVybiBJbmxpbmUuY3JlYXRlKGF0dHJzKVxuICAgICAgICBjYXNlICd0ZXh0JzogcmV0dXJuIFRleHQuY3JlYXRlKGF0dHJzKVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdgTm9kZS5jcmVhdGVgIHJlcXVpcmVzIGEgYGtpbmRgIHN0cmluZy4nKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBOb2RlLmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cyBvciBub2RlcyBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpc3Qgb2YgYE5vZGVzYCBmcm9tIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5PE9iamVjdHxOb2RlPn0gZWxlbWVudHNcbiAgICogQHJldHVybiB7TGlzdDxOb2RlPn1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZUxpc3QoZWxlbWVudHMgPSBbXSkge1xuICAgIGlmIChMaXN0LmlzTGlzdChlbGVtZW50cykgfHwgQXJyYXkuaXNBcnJheShlbGVtZW50cykpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBuZXcgTGlzdChlbGVtZW50cy5tYXAoTm9kZS5jcmVhdGUpKVxuICAgICAgcmV0dXJuIGxpc3RcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYE5vZGUuY3JlYXRlTGlzdFxcYCBvbmx5IGFjY2VwdHMgbGlzdHMgb3IgYXJyYXlzLCBidXQgeW91IHBhc3NlZCBpdDogJHtlbGVtZW50c31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGRpY3Rpb25hcnkgb2Ygc2V0dGFibGUgbm9kZSBwcm9wZXJ0aWVzIGZyb20gYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfE5vZGV9IGF0dHJzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZVByb3BlcnRpZXMoYXR0cnMgPSB7fSkge1xuICAgIGlmIChCbG9jay5pc0Jsb2NrKGF0dHJzKSB8fCBJbmxpbmUuaXNJbmxpbmUoYXR0cnMpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBkYXRhOiBhdHRycy5kYXRhLFxuICAgICAgICBpc1ZvaWQ6IGF0dHJzLmlzVm9pZCxcbiAgICAgICAgdHlwZTogYXR0cnMudHlwZSxcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGF0dHJzID09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyB0eXBlOiBhdHRycyB9XG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHt9XG4gICAgICBpZiAoJ3R5cGUnIGluIGF0dHJzKSBwcm9wcy50eXBlID0gYXR0cnMudHlwZVxuICAgICAgaWYgKCdkYXRhJyBpbiBhdHRycykgcHJvcHMuZGF0YSA9IERhdGEuY3JlYXRlKGF0dHJzLmRhdGEpXG4gICAgICBpZiAoJ2lzVm9pZCcgaW4gYXR0cnMpIHByb3BzLmlzVm9pZCA9IGF0dHJzLmlzVm9pZFxuICAgICAgcmV0dXJuIHByb3BzXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBOb2RlLmNyZWF0ZVByb3BlcnRpZXNcXGAgb25seSBhY2NlcHRzIG9iamVjdHMsIHN0cmluZ3MsIGJsb2NrcyBvciBpbmxpbmVzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBOb2RlYCBmcm9tIGEgSlNPTiBgb2JqZWN0YC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTT04ob2JqZWN0KSB7XG4gICAgY29uc3QgeyBraW5kIH0gPSBvYmplY3RcblxuICAgIHN3aXRjaCAoa2luZCkge1xuICAgICAgY2FzZSAnYmxvY2snOiByZXR1cm4gQmxvY2suZnJvbUpTT04ob2JqZWN0KVxuICAgICAgY2FzZSAnZG9jdW1lbnQnOiByZXR1cm4gRG9jdW1lbnQuZnJvbUpTT04ob2JqZWN0KVxuICAgICAgY2FzZSAnaW5saW5lJzogcmV0dXJuIElubGluZS5mcm9tSlNPTihvYmplY3QpXG4gICAgICBjYXNlICd0ZXh0JzogcmV0dXJuIFRleHQuZnJvbUpTT04ob2JqZWN0KVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYE5vZGUuZnJvbUpTT05cXGAgcmVxdWlyZXMgYSBcXGBraW5kXFxgIG9mIGVpdGhlciAnYmxvY2snLCAnZG9jdW1lbnQnLCAnaW5saW5lJyBvciAndGV4dCcsIGJ1dCB5b3UgcGFzc2VkOiAke2tpbmR9YClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYGZyb21KU2AuXG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlMgPSBOb2RlLmZyb21KU09OXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgYE5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gYW55XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc05vZGUoYW55KSB7XG4gICAgcmV0dXJuIChcbiAgICAgIEJsb2NrLmlzQmxvY2soYW55KSB8fFxuICAgICAgRG9jdW1lbnQuaXNEb2N1bWVudChhbnkpIHx8XG4gICAgICBJbmxpbmUuaXNJbmxpbmUoYW55KSB8fFxuICAgICAgVGV4dC5pc1RleHQoYW55KVxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgYW55YCBpcyBhIGxpc3Qgb2Ygbm9kZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzTm9kZUxpc3QoYW55KSB7XG4gICAgcmV0dXJuIExpc3QuaXNMaXN0KGFueSkgJiYgYW55LmV2ZXJ5KGl0ZW0gPT4gTm9kZS5pc05vZGUoaXRlbSkpXG4gIH1cblxuICAvKipcbiAgICogVHJ1ZSBpZiB0aGUgbm9kZSBoYXMgYm90aCBkZXNjZW5kYW50cyBpbiB0aGF0IG9yZGVyLCBmYWxzZSBvdGhlcndpc2UuIFRoZVxuICAgKiBvcmRlciBpcyBkZXB0aC1maXJzdCwgcG9zdC1vcmRlci5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGZpcnN0XG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzZWNvbmRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgYXJlRGVzY2VuZGFudHNTb3J0ZWQoZmlyc3QsIHNlY29uZCkge1xuICAgIGZpcnN0ID0gYXNzZXJ0S2V5KGZpcnN0KVxuICAgIHNlY29uZCA9IGFzc2VydEtleShzZWNvbmQpXG5cbiAgICBjb25zdCBrZXlzID0gdGhpcy5nZXRLZXlzQXNBcnJheSgpXG4gICAgY29uc3QgZmlyc3RJbmRleCA9IGtleXMuaW5kZXhPZihmaXJzdClcbiAgICBjb25zdCBzZWNvbmRJbmRleCA9IGtleXMuaW5kZXhPZihzZWNvbmQpXG4gICAgaWYgKGZpcnN0SW5kZXggPT0gLTEgfHwgc2Vjb25kSW5kZXggPT0gLTEpIHJldHVybiBudWxsXG5cbiAgICByZXR1cm4gZmlyc3RJbmRleCA8IHNlY29uZEluZGV4XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBub2RlIGhhcyBhIGNoaWxkIGJ5IGBrZXlgIGFuZCByZXR1cm4gaXQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgYXNzZXJ0Q2hpbGQoa2V5KSB7XG4gICAgY29uc3QgY2hpbGQgPSB0aGlzLmdldENoaWxkKGtleSlcblxuICAgIGlmICghY2hpbGQpIHtcbiAgICAgIGtleSA9IGFzc2VydEtleShrZXkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgY2hpbGQgbm9kZSB3aXRoIGtleSBcIiR7a2V5fVwiLmApXG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkXG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBub2RlIGhhcyBhIGRlc2NlbmRhbnQgYnkgYGtleWAgYW5kIHJldHVybiBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBhc3NlcnREZXNjZW5kYW50KGtleSkge1xuICAgIGNvbnN0IGRlc2NlbmRhbnQgPSB0aGlzLmdldERlc2NlbmRhbnQoa2V5KVxuXG4gICAgaWYgKCFkZXNjZW5kYW50KSB7XG4gICAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhIGRlc2NlbmRhbnQgbm9kZSB3aXRoIGtleSBcIiR7a2V5fVwiLmApXG4gICAgfVxuXG4gICAgcmV0dXJuIGRlc2NlbmRhbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBBc3NlcnQgdGhhdCBhIG5vZGUncyB0cmVlIGhhcyBhIG5vZGUgYnkgYGtleWAgYW5kIHJldHVybiBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBhc3NlcnROb2RlKGtleSkge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldE5vZGUoa2V5KVxuXG4gICAgaWYgKCFub2RlKSB7XG4gICAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhIG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIi5gKVxuICAgIH1cblxuICAgIHJldHVybiBub2RlXG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IHRoYXQgYSBub2RlIGV4aXN0cyBhdCBgcGF0aGAgYW5kIHJldHVybiBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gcGF0aFxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBhc3NlcnRQYXRoKHBhdGgpIHtcbiAgICBjb25zdCBkZXNjZW5kYW50ID0gdGhpcy5nZXREZXNjZW5kYW50QXRQYXRoKHBhdGgpXG5cbiAgICBpZiAoIWRlc2NlbmRhbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBkZXNjZW5kYW50IGF0IHBhdGggXCIke3BhdGh9XCIuYClcbiAgICB9XG5cbiAgICByZXR1cm4gZGVzY2VuZGFudFxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGZpbHRlciBhbGwgZGVzY2VuZGFudCBub2RlcyB3aXRoIGBpdGVyYXRvcmAuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIGZpbHRlckRlc2NlbmRhbnRzKGl0ZXJhdG9yKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IFtdXG5cbiAgICB0aGlzLmZvckVhY2hEZXNjZW5kYW50KChub2RlLCBpLCBub2RlcykgPT4ge1xuICAgICAgaWYgKGl0ZXJhdG9yKG5vZGUsIGksIG5vZGVzKSkgbWF0Y2hlcy5wdXNoKG5vZGUpXG4gICAgfSlcblxuICAgIHJldHVybiBMaXN0KG1hdGNoZXMpXG4gIH1cblxuICAvKipcbiAgICogUmVjdXJzaXZlbHkgZmluZCBhbGwgZGVzY2VuZGFudCBub2RlcyBieSBgaXRlcmF0b3JgLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRvclxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGZpbmREZXNjZW5kYW50KGl0ZXJhdG9yKSB7XG4gICAgbGV0IGZvdW5kID0gbnVsbFxuXG4gICAgdGhpcy5mb3JFYWNoRGVzY2VuZGFudCgobm9kZSwgaSwgbm9kZXMpID0+IHtcbiAgICAgIGlmIChpdGVyYXRvcihub2RlLCBpLCBub2RlcykpIHtcbiAgICAgICAgZm91bmQgPSBub2RlXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gZm91bmRcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBpdGVyYXRlIG92ZXIgYWxsIGRlc2NlbmRhbnQgbm9kZXMgd2l0aCBgaXRlcmF0b3JgLiBJZiB0aGVcbiAgICogaXRlcmF0b3IgcmV0dXJucyBmYWxzZSBpdCB3aWxsIGJyZWFrIHRoZSBsb29wLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRvclxuICAgKi9cblxuICBmb3JFYWNoRGVzY2VuZGFudChpdGVyYXRvcikge1xuICAgIGxldCByZXRcblxuICAgIHRoaXMubm9kZXMuZm9yRWFjaCgoY2hpbGQsIGksIG5vZGVzKSA9PiB7XG4gICAgICBpZiAoaXRlcmF0b3IoY2hpbGQsIGksIG5vZGVzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0ID0gZmFsc2VcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGlmIChjaGlsZC5raW5kICE9ICd0ZXh0Jykge1xuICAgICAgICByZXQgPSBjaGlsZC5mb3JFYWNoRGVzY2VuZGFudChpdGVyYXRvcilcbiAgICAgICAgcmV0dXJuIHJldFxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gcmV0XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwYXRoIG9mIGFuY2VzdG9ycyBvZiBhIGRlc2NlbmRhbnQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8Tm9kZX0ga2V5XG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT58TnVsbH1cbiAgICovXG5cbiAgZ2V0QW5jZXN0b3JzKGtleSkge1xuICAgIGtleSA9IGFzc2VydEtleShrZXkpXG5cbiAgICBpZiAoa2V5ID09IHRoaXMua2V5KSByZXR1cm4gTGlzdCgpXG4gICAgaWYgKHRoaXMuaGFzQ2hpbGQoa2V5KSkgcmV0dXJuIExpc3QoW3RoaXNdKVxuXG4gICAgbGV0IGFuY2VzdG9yc1xuICAgIHRoaXMubm9kZXMuZmluZCgobm9kZSkgPT4ge1xuICAgICAgaWYgKG5vZGUua2luZCA9PSAndGV4dCcpIHJldHVybiBmYWxzZVxuICAgICAgYW5jZXN0b3JzID0gbm9kZS5nZXRBbmNlc3RvcnMoa2V5KVxuICAgICAgcmV0dXJuIGFuY2VzdG9yc1xuICAgIH0pXG5cbiAgICBpZiAoYW5jZXN0b3JzKSB7XG4gICAgICByZXR1cm4gYW5jZXN0b3JzLnVuc2hpZnQodGhpcylcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsZWFmIGJsb2NrIGRlc2NlbmRhbnRzIG9mIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRCbG9ja3MoKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldEJsb2Nrc0FzQXJyYXkoKVxuICAgIHJldHVybiBuZXcgTGlzdChhcnJheSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxlYWYgYmxvY2sgZGVzY2VuZGFudHMgb2YgdGhlIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8Tm9kZT59XG4gICAqL1xuXG4gIGdldEJsb2Nrc0FzQXJyYXkoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXMucmVkdWNlKChhcnJheSwgY2hpbGQpID0+IHtcbiAgICAgIGlmIChjaGlsZC5raW5kICE9ICdibG9jaycpIHJldHVybiBhcnJheVxuICAgICAgaWYgKCFjaGlsZC5pc0xlYWZCbG9jaygpKSByZXR1cm4gYXJyYXkuY29uY2F0KGNoaWxkLmdldEJsb2Nrc0FzQXJyYXkoKSlcbiAgICAgIGFycmF5LnB1c2goY2hpbGQpXG4gICAgICByZXR1cm4gYXJyYXlcbiAgICB9LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGxlYWYgYmxvY2sgZGVzY2VuZGFudHMgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRCbG9ja3NBdFJhbmdlKHJhbmdlKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldEJsb2Nrc0F0UmFuZ2VBc0FycmF5KHJhbmdlKVxuICAgIC8vIEVsaW1pbmF0ZSBkdXBsaWNhdGVzIGJ5IGNvbnZlcnRpbmcgdG8gYW4gYE9yZGVyZWRTZXRgIGZpcnN0LlxuICAgIHJldHVybiBuZXcgTGlzdChuZXcgT3JkZXJlZFNldChhcnJheSkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsZWFmIGJsb2NrIGRlc2NlbmRhbnRzIGluIGEgYHJhbmdlYCBhcyBhbiBhcnJheVxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0QmxvY2tzQXRSYW5nZUFzQXJyYXkocmFuZ2UpIHtcbiAgICByYW5nZSA9IHJhbmdlLm5vcm1hbGl6ZSh0aGlzKVxuICAgIGlmIChyYW5nZS5pc1Vuc2V0KSByZXR1cm4gW11cblxuICAgIGNvbnN0IHsgc3RhcnRLZXksIGVuZEtleSB9ID0gcmFuZ2VcbiAgICBjb25zdCBzdGFydEJsb2NrID0gdGhpcy5nZXRDbG9zZXN0QmxvY2soc3RhcnRLZXkpXG5cbiAgICAvLyBQRVJGOiB0aGUgbW9zdCBjb21tb24gY2FzZSBpcyB3aGVuIHRoZSByYW5nZSBpcyBpbiBhIHNpbmdsZSBibG9jayBub2RlLFxuICAgIC8vIHdoZXJlIHdlIGNhbiBhdm9pZCBhIGxvdCBvZiBpdGVyYXRpbmcgb2YgdGhlIHRyZWUuXG4gICAgaWYgKHN0YXJ0S2V5ID09IGVuZEtleSkgcmV0dXJuIFtzdGFydEJsb2NrXVxuXG4gICAgY29uc3QgZW5kQmxvY2sgPSB0aGlzLmdldENsb3Nlc3RCbG9jayhlbmRLZXkpXG4gICAgY29uc3QgYmxvY2tzID0gdGhpcy5nZXRCbG9ja3NBc0FycmF5KClcbiAgICBjb25zdCBzdGFydCA9IGJsb2Nrcy5pbmRleE9mKHN0YXJ0QmxvY2spXG4gICAgY29uc3QgZW5kID0gYmxvY2tzLmluZGV4T2YoZW5kQmxvY2spXG4gICAgcmV0dXJuIGJsb2Nrcy5zbGljZShzdGFydCwgZW5kICsgMSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIG9mIHRoZSBsZWFmIGJsb2NrcyB0aGF0IG1hdGNoIGEgYHR5cGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRCbG9ja3NCeVR5cGUodHlwZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRCbG9ja3NCeVR5cGVBc0FycmF5KHR5cGUpXG4gICAgcmV0dXJuIG5ldyBMaXN0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgb2YgdGhlIGxlYWYgYmxvY2tzIHRoYXQgbWF0Y2ggYSBgdHlwZWAgYXMgYW4gYXJyYXlcbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGdldEJsb2Nrc0J5VHlwZUFzQXJyYXkodHlwZSkge1xuICAgIHJldHVybiB0aGlzLm5vZGVzLnJlZHVjZSgoYXJyYXksIG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLmtpbmQgIT0gJ2Jsb2NrJykge1xuICAgICAgICByZXR1cm4gYXJyYXlcbiAgICAgIH0gZWxzZSBpZiAobm9kZS5pc0xlYWZCbG9jaygpICYmIG5vZGUudHlwZSA9PSB0eXBlKSB7XG4gICAgICAgIGFycmF5LnB1c2gobm9kZSlcbiAgICAgICAgcmV0dXJuIGFycmF5XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gYXJyYXkuY29uY2F0KG5vZGUuZ2V0QmxvY2tzQnlUeXBlQXNBcnJheSh0eXBlKSlcbiAgICAgIH1cbiAgICB9LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIG9mIHRoZSBjaGFyYWN0ZXJzIGZvciBldmVyeSB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8Q2hhcmFjdGVyPn1cbiAgICovXG5cbiAgZ2V0Q2hhcmFjdGVycygpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0Q2hhcmFjdGVyc0FzQXJyYXkoKVxuICAgIHJldHVybiBuZXcgTGlzdChhcnJheSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIG9mIHRoZSBjaGFyYWN0ZXJzIGZvciBldmVyeSB0ZXh0IG5vZGUgYXMgYW4gYXJyYXlcbiAgICpcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGdldENoYXJhY3RlcnNBc0FycmF5KCkge1xuICAgIHJldHVybiB0aGlzLm5vZGVzLnJlZHVjZSgoYXJyLCBub2RlKSA9PiB7XG4gICAgICByZXR1cm4gbm9kZS5raW5kID09ICd0ZXh0J1xuICAgICAgICA/IGFyci5jb25jYXQobm9kZS5jaGFyYWN0ZXJzLnRvQXJyYXkoKSlcbiAgICAgICAgOiBhcnIuY29uY2F0KG5vZGUuZ2V0Q2hhcmFjdGVyc0FzQXJyYXkoKSlcbiAgICB9LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBsaXN0IG9mIHRoZSBjaGFyYWN0ZXJzIGluIGEgYHJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHJldHVybiB7TGlzdDxDaGFyYWN0ZXI+fVxuICAgKi9cblxuICBnZXRDaGFyYWN0ZXJzQXRSYW5nZShyYW5nZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRDaGFyYWN0ZXJzQXRSYW5nZUFzQXJyYXkocmFuZ2UpXG4gICAgcmV0dXJuIG5ldyBMaXN0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGxpc3Qgb2YgdGhlIGNoYXJhY3RlcnMgaW4gYSBgcmFuZ2VgIGFzIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0Q2hhcmFjdGVyc0F0UmFuZ2VBc0FycmF5KHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcbiAgICBpZiAocmFuZ2UuaXNVbnNldCkgcmV0dXJuIFtdXG5cbiAgICByZXR1cm4gdGhpc1xuICAgICAgLmdldFRleHRzQXRSYW5nZShyYW5nZSlcbiAgICAgIC5yZWR1Y2UoKGFyciwgdGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBjaGFycyA9IHRleHQuY2hhcmFjdGVyc1xuICAgICAgICAgIC5maWx0ZXIoKGNoYXIsIGkpID0+IGlzSW5kZXhJblJhbmdlKGksIHRleHQsIHJhbmdlKSlcbiAgICAgICAgICAudG9BcnJheSgpXG5cbiAgICAgICAgcmV0dXJuIGFyci5jb25jYXQoY2hhcnMpXG4gICAgICB9LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBjaGlsZCBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Q2hpbGQoa2V5KSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICByZXR1cm4gdGhpcy5ub2Rlcy5maW5kKG5vZGUgPT4gbm9kZS5rZXkgPT0ga2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBjbG9zZXN0IHBhcmVudCBvZiBub2RlIGJ5IGBrZXlgIHRoYXQgbWF0Y2hlcyBgaXRlcmF0b3JgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Q2xvc2VzdChrZXksIGl0ZXJhdG9yKSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICBjb25zdCBhbmNlc3RvcnMgPSB0aGlzLmdldEFuY2VzdG9ycyhrZXkpXG4gICAgaWYgKCFhbmNlc3RvcnMpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBkZXNjZW5kYW50IG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIi5gKVxuICAgIH1cblxuICAgIC8vIEV4Y2x1ZGUgdGhpcyBub2RlIGl0c2VsZi5cbiAgICByZXR1cm4gYW5jZXN0b3JzLnJlc3QoKS5maW5kTGFzdChpdGVyYXRvcilcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsb3Nlc3QgYmxvY2sgcGFyZW50IG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0Q2xvc2VzdEJsb2NrKGtleSkge1xuICAgIHJldHVybiB0aGlzLmdldENsb3Nlc3Qoa2V5LCBwYXJlbnQgPT4gcGFyZW50LmtpbmQgPT0gJ2Jsb2NrJylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsb3Nlc3QgaW5saW5lIHBhcmVudCBvZiBhIGBub2RlYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldENsb3Nlc3RJbmxpbmUoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xvc2VzdChrZXksIHBhcmVudCA9PiBwYXJlbnQua2luZCA9PSAnaW5saW5lJylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNsb3Nlc3Qgdm9pZCBwYXJlbnQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXRDbG9zZXN0Vm9pZChrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDbG9zZXN0KGtleSwgcGFyZW50ID0+IHBhcmVudC5pc1ZvaWQpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb21tb24gYW5jZXN0b3Igb2Ygbm9kZXMgYG9uZWAgYW5kIGB0d29gIGJ5IGtleXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBvbmVcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR3b1xuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBnZXRDb21tb25BbmNlc3RvcihvbmUsIHR3bykge1xuICAgIG9uZSA9IGFzc2VydEtleShvbmUpXG4gICAgdHdvID0gYXNzZXJ0S2V5KHR3bylcblxuICAgIGlmIChvbmUgPT0gdGhpcy5rZXkpIHJldHVybiB0aGlzXG4gICAgaWYgKHR3byA9PSB0aGlzLmtleSkgcmV0dXJuIHRoaXNcblxuICAgIHRoaXMuYXNzZXJ0RGVzY2VuZGFudChvbmUpXG4gICAgdGhpcy5hc3NlcnREZXNjZW5kYW50KHR3bylcbiAgICBsZXQgYW5jZXN0b3JzID0gbmV3IExpc3QoKVxuICAgIGxldCBvbmVQYXJlbnQgPSB0aGlzLmdldFBhcmVudChvbmUpXG4gICAgbGV0IHR3b1BhcmVudCA9IHRoaXMuZ2V0UGFyZW50KHR3bylcblxuICAgIHdoaWxlIChvbmVQYXJlbnQpIHtcbiAgICAgIGFuY2VzdG9ycyA9IGFuY2VzdG9ycy5wdXNoKG9uZVBhcmVudClcbiAgICAgIG9uZVBhcmVudCA9IHRoaXMuZ2V0UGFyZW50KG9uZVBhcmVudC5rZXkpXG4gICAgfVxuXG4gICAgd2hpbGUgKHR3b1BhcmVudCkge1xuICAgICAgaWYgKGFuY2VzdG9ycy5pbmNsdWRlcyh0d29QYXJlbnQpKSByZXR1cm4gdHdvUGFyZW50XG4gICAgICB0d29QYXJlbnQgPSB0aGlzLmdldFBhcmVudCh0d29QYXJlbnQua2V5KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRlY29yYXRpb25zIGZvciB0aGUgbm9kZSBmcm9tIGEgYHN0YWNrYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdGFja30gc3RhY2tcbiAgICogQHJldHVybiB7TGlzdH1cbiAgICovXG5cbiAgZ2V0RGVjb3JhdGlvbnMoc3RhY2spIHtcbiAgICBjb25zdCBkZWNvcmF0aW9ucyA9IHN0YWNrLmZpbmQoJ2RlY29yYXRlTm9kZScsIHRoaXMpXG4gICAgY29uc3QgbGlzdCA9IFJhbmdlLmNyZWF0ZUxpc3QoZGVjb3JhdGlvbnMgfHwgW10pXG4gICAgcmV0dXJuIGxpc3RcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRlcHRoIG9mIGEgY2hpbGQgbm9kZSBieSBga2V5YCwgd2l0aCBvcHRpb25hbCBgc3RhcnRBdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0QXQgKG9wdGlvbmFsKVxuICAgKiBAcmV0dXJuIHtOdW1iZXJ9IGRlcHRoXG4gICAqL1xuXG4gIGdldERlcHRoKGtleSwgc3RhcnRBdCA9IDEpIHtcbiAgICB0aGlzLmFzc2VydERlc2NlbmRhbnQoa2V5KVxuICAgIGlmICh0aGlzLmhhc0NoaWxkKGtleSkpIHJldHVybiBzdGFydEF0XG4gICAgcmV0dXJuIHRoaXNcbiAgICAgIC5nZXRGdXJ0aGVzdEFuY2VzdG9yKGtleSlcbiAgICAgIC5nZXREZXB0aChrZXksIHN0YXJ0QXQgKyAxKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGRlc2NlbmRhbnQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldERlc2NlbmRhbnQoa2V5KSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICBsZXQgZGVzY2VuZGFudEZvdW5kID0gbnVsbFxuXG4gICAgY29uc3QgZm91bmQgPSB0aGlzLm5vZGVzLmZpbmQoKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLmtleSA9PT0ga2V5KSB7XG4gICAgICAgIHJldHVybiBub2RlXG4gICAgICB9IGVsc2UgaWYgKG5vZGUua2luZCAhPT0gJ3RleHQnKSB7XG4gICAgICAgIGRlc2NlbmRhbnRGb3VuZCA9IG5vZGUuZ2V0RGVzY2VuZGFudChrZXkpXG4gICAgICAgIHJldHVybiBkZXNjZW5kYW50Rm91bmRcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH0pXG5cbiAgICByZXR1cm4gZGVzY2VuZGFudEZvdW5kIHx8IGZvdW5kXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgZGVzY2VuZGFudCBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXREZXNjZW5kYW50QXRQYXRoKHBhdGgpIHtcbiAgICBsZXQgZGVzY2VuZGFudCA9IHRoaXNcblxuICAgIGZvciAoY29uc3QgaW5kZXggb2YgcGF0aCkge1xuICAgICAgaWYgKCFkZXNjZW5kYW50KSByZXR1cm5cbiAgICAgIGlmICghZGVzY2VuZGFudC5ub2RlcykgcmV0dXJuXG4gICAgICBkZXNjZW5kYW50ID0gZGVzY2VuZGFudC5ub2Rlcy5nZXQoaW5kZXgpXG4gICAgfVxuXG4gICAgcmV0dXJuIGRlc2NlbmRhbnRcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZpcnN0IGNoaWxkIHRleHQgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXRGaXJzdFRleHQoKSB7XG4gICAgbGV0IGRlc2NlbmRhbnRGb3VuZCA9IG51bGxcblxuICAgIGNvbnN0IGZvdW5kID0gdGhpcy5ub2Rlcy5maW5kKChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS5raW5kID09ICd0ZXh0JykgcmV0dXJuIHRydWVcbiAgICAgIGRlc2NlbmRhbnRGb3VuZCA9IG5vZGUuZ2V0Rmlyc3RUZXh0KClcbiAgICAgIHJldHVybiBkZXNjZW5kYW50Rm91bmRcbiAgICB9KVxuXG4gICAgcmV0dXJuIGRlc2NlbmRhbnRGb3VuZCB8fCBmb3VuZFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGZyYWdtZW50IG9mIHRoZSBub2RlIGF0IGEgYHJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHJldHVybiB7RG9jdW1lbnR9XG4gICAqL1xuXG4gIGdldEZyYWdtZW50QXRSYW5nZShyYW5nZSkge1xuICAgIHJhbmdlID0gcmFuZ2Uubm9ybWFsaXplKHRoaXMpXG4gICAgaWYgKHJhbmdlLmlzVW5zZXQpIHJldHVybiBEb2N1bWVudC5jcmVhdGUoKVxuXG4gICAgbGV0IG5vZGUgPSB0aGlzXG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlIGNoaWxkcmVuIGV4aXN0LlxuICAgIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0LCBlbmRLZXksIGVuZE9mZnNldCB9ID0gcmFuZ2VcbiAgICBjb25zdCBzdGFydFRleHQgPSBub2RlLmFzc2VydERlc2NlbmRhbnQoc3RhcnRLZXkpXG4gICAgY29uc3QgZW5kVGV4dCA9IG5vZGUuYXNzZXJ0RGVzY2VuZGFudChlbmRLZXkpXG5cbiAgICAvLyBTcGxpdCBhdCB0aGUgc3RhcnQgYW5kIGVuZC5cbiAgICBsZXQgY2hpbGQgPSBzdGFydFRleHRcbiAgICBsZXQgcHJldmlvdXNcbiAgICBsZXQgcGFyZW50XG5cbiAgICB3aGlsZSAocGFyZW50ID0gbm9kZS5nZXRQYXJlbnQoY2hpbGQua2V5KSkge1xuICAgICAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuaW5kZXhPZihjaGlsZClcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gY2hpbGQua2luZCA9PSAndGV4dCdcbiAgICAgICAgPyBzdGFydE9mZnNldFxuICAgICAgICA6IGNoaWxkLm5vZGVzLmluZGV4T2YocHJldmlvdXMpXG5cbiAgICAgIHBhcmVudCA9IHBhcmVudC5zcGxpdE5vZGUoaW5kZXgsIHBvc2l0aW9uKVxuICAgICAgbm9kZSA9IG5vZGUudXBkYXRlTm9kZShwYXJlbnQpXG4gICAgICBwcmV2aW91cyA9IHBhcmVudC5ub2Rlcy5nZXQoaW5kZXggKyAxKVxuICAgICAgY2hpbGQgPSBwYXJlbnRcbiAgICB9XG5cbiAgICBjaGlsZCA9IHN0YXJ0S2V5ID09IGVuZEtleSA/IG5vZGUuZ2V0TmV4dFRleHQoc3RhcnRLZXkpIDogZW5kVGV4dFxuXG4gICAgd2hpbGUgKHBhcmVudCA9IG5vZGUuZ2V0UGFyZW50KGNoaWxkLmtleSkpIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2YoY2hpbGQpXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGNoaWxkLmtpbmQgPT0gJ3RleHQnXG4gICAgICAgID8gc3RhcnRLZXkgPT0gZW5kS2V5ID8gZW5kT2Zmc2V0IC0gc3RhcnRPZmZzZXQgOiBlbmRPZmZzZXRcbiAgICAgICAgOiBjaGlsZC5ub2Rlcy5pbmRleE9mKHByZXZpb3VzKVxuXG4gICAgICBwYXJlbnQgPSBwYXJlbnQuc3BsaXROb2RlKGluZGV4LCBwb3NpdGlvbilcbiAgICAgIG5vZGUgPSBub2RlLnVwZGF0ZU5vZGUocGFyZW50KVxuICAgICAgcHJldmlvdXMgPSBwYXJlbnQubm9kZXMuZ2V0KGluZGV4ICsgMSlcbiAgICAgIGNoaWxkID0gcGFyZW50XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBzdGFydCBhbmQgZW5kIG5vZGVzLlxuICAgIGNvbnN0IHN0YXJ0Tm9kZSA9IG5vZGUuZ2V0TmV4dFNpYmxpbmcobm9kZS5nZXRGdXJ0aGVzdEFuY2VzdG9yKHN0YXJ0S2V5KS5rZXkpXG4gICAgY29uc3QgZW5kTm9kZSA9IHN0YXJ0S2V5ID09IGVuZEtleVxuICAgICAgPyBub2RlLmdldE5leHRTaWJsaW5nKG5vZGUuZ2V0TmV4dFNpYmxpbmcobm9kZS5nZXRGdXJ0aGVzdEFuY2VzdG9yKGVuZEtleSkua2V5KS5rZXkpXG4gICAgICA6IG5vZGUuZ2V0TmV4dFNpYmxpbmcobm9kZS5nZXRGdXJ0aGVzdEFuY2VzdG9yKGVuZEtleSkua2V5KVxuXG4gICAgLy8gR2V0IGNoaWxkcmVuIHJhbmdlIG9mIG5vZGVzIGZyb20gc3RhcnQgdG8gZW5kIG5vZGVzXG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IG5vZGUubm9kZXMuaW5kZXhPZihzdGFydE5vZGUpXG4gICAgY29uc3QgZW5kSW5kZXggPSBub2RlLm5vZGVzLmluZGV4T2YoZW5kTm9kZSlcbiAgICBjb25zdCBub2RlcyA9IG5vZGUubm9kZXMuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpXG5cbiAgICAvLyBSZXR1cm4gYSBuZXcgZG9jdW1lbnQgZnJhZ21lbnQuXG4gICAgcmV0dXJuIERvY3VtZW50LmNyZWF0ZSh7IG5vZGVzIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmdXJ0aGVzdCBwYXJlbnQgb2YgYSBub2RlIGJ5IGBrZXlgIHRoYXQgbWF0Y2hlcyBhbiBgaXRlcmF0b3JgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGl0ZXJhdG9yXG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0RnVydGhlc3Qoa2V5LCBpdGVyYXRvcikge1xuICAgIGNvbnN0IGFuY2VzdG9ycyA9IHRoaXMuZ2V0QW5jZXN0b3JzKGtleSlcbiAgICBpZiAoIWFuY2VzdG9ycykge1xuICAgICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBkZXNjZW5kYW50IG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIi5gKVxuICAgIH1cblxuICAgIC8vIEV4Y2x1ZGUgdGhpcyBub2RlIGl0c2VsZlxuICAgIHJldHVybiBhbmNlc3RvcnMucmVzdCgpLmZpbmQoaXRlcmF0b3IpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmdXJ0aGVzdCBibG9jayBwYXJlbnQgb2YgYSBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0RnVydGhlc3RCbG9jayhrZXkpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRGdXJ0aGVzdChrZXksIG5vZGUgPT4gbm9kZS5raW5kID09ICdibG9jaycpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmdXJ0aGVzdCBpbmxpbmUgcGFyZW50IG9mIGEgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldEZ1cnRoZXN0SW5saW5lKGtleSkge1xuICAgIHJldHVybiB0aGlzLmdldEZ1cnRoZXN0KGtleSwgbm9kZSA9PiBub2RlLmtpbmQgPT0gJ2lubGluZScpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmdXJ0aGVzdCBhbmNlc3RvciBvZiBhIG5vZGUgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXRGdXJ0aGVzdEFuY2VzdG9yKGtleSkge1xuICAgIGtleSA9IGFzc2VydEtleShrZXkpXG4gICAgcmV0dXJuIHRoaXMubm9kZXMuZmluZCgobm9kZSkgPT4ge1xuICAgICAgaWYgKG5vZGUua2V5ID09IGtleSkgcmV0dXJuIHRydWVcbiAgICAgIGlmIChub2RlLmtpbmQgPT0gJ3RleHQnKSByZXR1cm4gZmFsc2VcbiAgICAgIHJldHVybiBub2RlLmhhc0Rlc2NlbmRhbnQoa2V5KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBmdXJ0aGVzdCBhbmNlc3RvciBvZiBhIG5vZGUgYnkgYGtleWAgdGhhdCBoYXMgb25seSBvbmUgY2hpbGQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXRGdXJ0aGVzdE9ubHlDaGlsZEFuY2VzdG9yKGtleSkge1xuICAgIGNvbnN0IGFuY2VzdG9ycyA9IHRoaXMuZ2V0QW5jZXN0b3JzKGtleSlcblxuICAgIGlmICghYW5jZXN0b3JzKSB7XG4gICAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgZmluZCBhIGRlc2NlbmRhbnQgbm9kZSB3aXRoIGtleSBcIiR7a2V5fVwiLmApXG4gICAgfVxuXG4gICAgcmV0dXJuIGFuY2VzdG9yc1xuICAgICAgLy8gU2tpcCB0aGlzIG5vZGUuLi5cbiAgICAgIC5za2lwTGFzdCgpXG4gICAgICAvLyBUYWtlIHBhcmVudHMgdW50aWwgdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgY2hpbGQuLi5cbiAgICAgIC5yZXZlcnNlKCkudGFrZVVudGlsKHAgPT4gcC5ub2Rlcy5zaXplID4gMSlcbiAgICAgIC8vIEFuZCBwaWNrIHRoZSBoaWdoZXN0LlxuICAgICAgLmxhc3QoKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2xvc2VzdCBpbmxpbmUgbm9kZXMgZm9yIGVhY2ggdGV4dCBub2RlIGluIHRoZSBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRJbmxpbmVzKCkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRJbmxpbmVzQXNBcnJheSgpXG4gICAgcmV0dXJuIG5ldyBMaXN0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2xvc2VzdCBpbmxpbmUgbm9kZXMgZm9yIGVhY2ggdGV4dCBub2RlIGluIHRoZSBub2RlLCBhcyBhbiBhcnJheS5cbiAgICpcbiAgICogQHJldHVybiB7TGlzdDxOb2RlPn1cbiAgICovXG5cbiAgZ2V0SW5saW5lc0FzQXJyYXkoKSB7XG4gICAgbGV0IGFycmF5ID0gW11cblxuICAgIHRoaXMubm9kZXMuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgIGlmIChjaGlsZC5raW5kID09ICd0ZXh0JykgcmV0dXJuXG4gICAgICBpZiAoY2hpbGQuaXNMZWFmSW5saW5lKCkpIHtcbiAgICAgICAgYXJyYXkucHVzaChjaGlsZClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFycmF5ID0gYXJyYXkuY29uY2F0KGNoaWxkLmdldElubGluZXNBc0FycmF5KCkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBhcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY2xvc2VzdCBpbmxpbmUgbm9kZXMgZm9yIGVhY2ggdGV4dCBub2RlIGluIGEgYHJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHJldHVybiB7TGlzdDxOb2RlPn1cbiAgICovXG5cbiAgZ2V0SW5saW5lc0F0UmFuZ2UocmFuZ2UpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0SW5saW5lc0F0UmFuZ2VBc0FycmF5KHJhbmdlKVxuICAgIC8vIFJlbW92ZSBkdXBsaWNhdGVzIGJ5IGNvbnZlcnRpbmcgaXQgdG8gYW4gYE9yZGVyZWRTZXRgIGZpcnN0LlxuICAgIHJldHVybiBuZXcgTGlzdChuZXcgT3JkZXJlZFNldChhcnJheSkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjbG9zZXN0IGlubGluZSBub2RlcyBmb3IgZWFjaCB0ZXh0IG5vZGUgaW4gYSBgcmFuZ2VgIGFzIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0SW5saW5lc0F0UmFuZ2VBc0FycmF5KHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcbiAgICBpZiAocmFuZ2UuaXNVbnNldCkgcmV0dXJuIFtdXG5cbiAgICByZXR1cm4gdGhpc1xuICAgICAgLmdldFRleHRzQXRSYW5nZUFzQXJyYXkocmFuZ2UpXG4gICAgICAubWFwKHRleHQgPT4gdGhpcy5nZXRDbG9zZXN0SW5saW5lKHRleHQua2V5KSlcbiAgICAgIC5maWx0ZXIoZXhpc3RzID0+IGV4aXN0cylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIG9mIHRoZSBsZWFmIGlubGluZSBub2RlcyB0aGF0IG1hdGNoIGEgYHR5cGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRJbmxpbmVzQnlUeXBlKHR5cGUpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0SW5saW5lc0J5VHlwZUFzQXJyYXkodHlwZSlcbiAgICByZXR1cm4gbmV3IExpc3QoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbGVhZiBpbmxpbmUgbm9kZXMgdGhhdCBtYXRjaCBhIGB0eXBlYCBhcyBhbiBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGdldElubGluZXNCeVR5cGVBc0FycmF5KHR5cGUpIHtcbiAgICByZXR1cm4gdGhpcy5ub2Rlcy5yZWR1Y2UoKGlubGluZXMsIG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLmtpbmQgPT0gJ3RleHQnKSB7XG4gICAgICAgIHJldHVybiBpbmxpbmVzXG4gICAgICB9IGVsc2UgaWYgKG5vZGUuaXNMZWFmSW5saW5lKCkgJiYgbm9kZS50eXBlID09IHR5cGUpIHtcbiAgICAgICAgaW5saW5lcy5wdXNoKG5vZGUpXG4gICAgICAgIHJldHVybiBpbmxpbmVzXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gaW5saW5lcy5jb25jYXQobm9kZS5nZXRJbmxpbmVzQnlUeXBlQXNBcnJheSh0eXBlKSlcbiAgICAgIH1cbiAgICB9LCBbXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBzZXQgb2YgYWxsIGtleXMgaW4gdGhlIG5vZGUgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5PFN0cmluZz59XG4gICAqL1xuXG4gIGdldEtleXNBc0FycmF5KCkge1xuICAgIGNvbnN0IGtleXMgPSBbXVxuXG4gICAgdGhpcy5mb3JFYWNoRGVzY2VuZGFudCgoZGVzYykgPT4ge1xuICAgICAga2V5cy5wdXNoKGRlc2Mua2V5KVxuICAgIH0pXG5cbiAgICByZXR1cm4ga2V5c1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIHNldCBvZiBhbGwga2V5cyBpbiB0aGUgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7U2V0PFN0cmluZz59XG4gICAqL1xuXG4gIGdldEtleXMoKSB7XG4gICAgY29uc3Qga2V5cyA9IHRoaXMuZ2V0S2V5c0FzQXJyYXkoKVxuICAgIHJldHVybiBuZXcgU2V0KGtleXMpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBsYXN0IGNoaWxkIHRleHQgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXRMYXN0VGV4dCgpIHtcbiAgICBsZXQgZGVzY2VuZGFudEZvdW5kID0gbnVsbFxuXG4gICAgY29uc3QgZm91bmQgPSB0aGlzLm5vZGVzLmZpbmRMYXN0KChub2RlKSA9PiB7XG4gICAgICBpZiAobm9kZS5raW5kID09ICd0ZXh0JykgcmV0dXJuIHRydWVcbiAgICAgIGRlc2NlbmRhbnRGb3VuZCA9IG5vZGUuZ2V0TGFzdFRleHQoKVxuICAgICAgcmV0dXJuIGRlc2NlbmRhbnRGb3VuZFxuICAgIH0pXG5cbiAgICByZXR1cm4gZGVzY2VuZGFudEZvdW5kIHx8IGZvdW5kXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3MgZm9yIGFsbCBvZiB0aGUgY2hhcmFjdGVycyBvZiBldmVyeSB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge1NldDxNYXJrPn1cbiAgICovXG5cbiAgZ2V0TWFya3MoKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldE1hcmtzQXNBcnJheSgpXG4gICAgcmV0dXJuIG5ldyBTZXQoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3MgZm9yIGFsbCBvZiB0aGUgY2hhcmFjdGVycyBvZiBldmVyeSB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge09yZGVyZWRTZXQ8TWFyaz59XG4gICAqL1xuXG4gIGdldE9yZGVyZWRNYXJrcygpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0TWFya3NBc0FycmF5KClcbiAgICByZXR1cm4gbmV3IE9yZGVyZWRTZXQoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3MgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRNYXJrc0FzQXJyYXkoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXMucmVkdWNlKChtYXJrcywgbm9kZSkgPT4ge1xuICAgICAgcmV0dXJuIG1hcmtzLmNvbmNhdChub2RlLmdldE1hcmtzQXNBcnJheSgpKVxuICAgIH0sIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNldCBvZiB0aGUgbWFya3MgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtTZXQ8TWFyaz59XG4gICAqL1xuXG4gIGdldE1hcmtzQXRSYW5nZShyYW5nZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRNYXJrc0F0UmFuZ2VBc0FycmF5KHJhbmdlKVxuICAgIHJldHVybiBuZXcgU2V0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNldCBvZiB0aGUgbWFya3MgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtPcmRlcmVkU2V0PE1hcms+fVxuICAgKi9cblxuICBnZXRPcmRlcmVkTWFya3NBdFJhbmdlKHJhbmdlKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldE1hcmtzQXRSYW5nZUFzQXJyYXkocmFuZ2UpXG4gICAgcmV0dXJuIG5ldyBPcmRlcmVkU2V0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIHNldCBvZiB0aGUgYWN0aXZlIG1hcmtzIGluIGEgYHJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHJldHVybiB7U2V0PE1hcms+fVxuICAgKi9cblxuICBnZXRBY3RpdmVNYXJrc0F0UmFuZ2UocmFuZ2UpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0QWN0aXZlTWFya3NBdFJhbmdlQXNBcnJheShyYW5nZSlcbiAgICByZXR1cm4gbmV3IFNldChhcnJheSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBzZXQgb2YgdGhlIG1hcmtzIGluIGEgYHJhbmdlYCwgYnkgdW5pb25pbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRNYXJrc0F0UmFuZ2VBc0FycmF5KHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcbiAgICBpZiAocmFuZ2UuaXNVbnNldCkgcmV0dXJuIFtdXG5cbiAgICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCB9ID0gcmFuZ2VcblxuICAgIC8vIElmIHRoZSByYW5nZSBpcyBjb2xsYXBzZWQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBub2RlLCBjaGVjayB0aGUgcHJldmlvdXMuXG4gICAgaWYgKHJhbmdlLmlzQ29sbGFwc2VkICYmIHN0YXJ0T2Zmc2V0ID09IDApIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzID0gdGhpcy5nZXRQcmV2aW91c1RleHQoc3RhcnRLZXkpXG4gICAgICBpZiAoIXByZXZpb3VzIHx8IHByZXZpb3VzLnRleHQubGVuZ3RoID09IDApIHJldHVybiBbXVxuICAgICAgY29uc3QgY2hhciA9IHByZXZpb3VzLmNoYXJhY3RlcnMuZ2V0KHByZXZpb3VzLnRleHQubGVuZ3RoIC0gMSlcbiAgICAgIHJldHVybiBjaGFyLm1hcmtzLnRvQXJyYXkoKVxuICAgIH1cblxuICAgIC8vIElmIHRoZSByYW5nZSBpcyBjb2xsYXBzZWQsIGNoZWNrIHRoZSBjaGFyYWN0ZXIgYmVmb3JlIHRoZSBzdGFydC5cbiAgICBpZiAocmFuZ2UuaXNDb2xsYXBzZWQpIHtcbiAgICAgIGNvbnN0IHRleHQgPSB0aGlzLmdldERlc2NlbmRhbnQoc3RhcnRLZXkpXG4gICAgICBjb25zdCBjaGFyID0gdGV4dC5jaGFyYWN0ZXJzLmdldChyYW5nZS5zdGFydE9mZnNldCAtIDEpXG4gICAgICByZXR1cm4gY2hhci5tYXJrcy50b0FycmF5KClcbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIGdldCBhIHNldCBvZiB0aGUgbWFya3MgZm9yIGVhY2ggY2hhcmFjdGVyIGluIHRoZSByYW5nZS5cbiAgICByZXR1cm4gdGhpc1xuICAgICAgLmdldENoYXJhY3RlcnNBdFJhbmdlKHJhbmdlKVxuICAgICAgLnJlZHVjZSgobWVtbywgY2hhcikgPT4ge1xuICAgICAgICBjaGFyLm1hcmtzLnRvQXJyYXkoKS5mb3JFYWNoKGMgPT4gbWVtby5wdXNoKGMpKVxuICAgICAgICByZXR1cm4gbWVtb1xuICAgICAgfSwgW10pXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgc2V0IG9mIG1hcmtzIGluIGEgYHJhbmdlYCwgYnkgaW50ZXJzZWN0aW5nLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0QWN0aXZlTWFya3NBdFJhbmdlQXNBcnJheShyYW5nZSkge1xuICAgIHJhbmdlID0gcmFuZ2Uubm9ybWFsaXplKHRoaXMpXG4gICAgaWYgKHJhbmdlLmlzVW5zZXQpIHJldHVybiBbXVxuXG4gICAgY29uc3QgeyBzdGFydEtleSwgc3RhcnRPZmZzZXQgfSA9IHJhbmdlXG5cbiAgICAvLyBJZiB0aGUgcmFuZ2UgaXMgY29sbGFwc2VkIGF0IHRoZSBzdGFydCBvZiB0aGUgbm9kZSwgY2hlY2sgdGhlIHByZXZpb3VzLlxuICAgIGlmIChyYW5nZS5pc0NvbGxhcHNlZCAmJiBzdGFydE9mZnNldCA9PSAwKSB7XG4gICAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuZ2V0UHJldmlvdXNUZXh0KHN0YXJ0S2V5KVxuICAgICAgaWYgKCFwcmV2aW91cyB8fCAhcHJldmlvdXMubGVuZ3RoKSByZXR1cm4gW11cbiAgICAgIGNvbnN0IGNoYXIgPSBwcmV2aW91cy5jaGFyYWN0ZXJzLmdldChwcmV2aW91cy5sZW5ndGggLSAxKVxuICAgICAgcmV0dXJuIGNoYXIubWFya3MudG9BcnJheSgpXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHJhbmdlIGlzIGNvbGxhcHNlZCwgY2hlY2sgdGhlIGNoYXJhY3RlciBiZWZvcmUgdGhlIHN0YXJ0LlxuICAgIGlmIChyYW5nZS5pc0NvbGxhcHNlZCkge1xuICAgICAgY29uc3QgdGV4dCA9IHRoaXMuZ2V0RGVzY2VuZGFudChzdGFydEtleSlcbiAgICAgIGNvbnN0IGNoYXIgPSB0ZXh0LmNoYXJhY3RlcnMuZ2V0KHJhbmdlLnN0YXJ0T2Zmc2V0IC0gMSlcbiAgICAgIHJldHVybiBjaGFyLm1hcmtzLnRvQXJyYXkoKVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgZ2V0IGEgc2V0IG9mIHRoZSBtYXJrcyBmb3IgZWFjaCBjaGFyYWN0ZXIgaW4gdGhlIHJhbmdlLlxuICAgIGNvbnN0IGNoYXJzID0gdGhpcy5nZXRDaGFyYWN0ZXJzQXRSYW5nZShyYW5nZSlcbiAgICBjb25zdCBmaXJzdCA9IGNoYXJzLmZpcnN0KClcbiAgICBpZiAoIWZpcnN0KSByZXR1cm4gW11cblxuICAgIGxldCBtZW1vID0gZmlyc3QubWFya3NcblxuICAgIGNoYXJzLnNsaWNlKDEpLmZvckVhY2goKGNoYXIpID0+IHtcbiAgICAgIG1lbW8gPSBtZW1vLmludGVyc2VjdChjaGFyLm1hcmtzKVxuICAgICAgcmV0dXJuIG1lbW8uc2l6ZSAhPSAwXG4gICAgfSlcblxuICAgIHJldHVybiBtZW1vLnRvQXJyYXkoKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgb2YgdGhlIG1hcmtzIHRoYXQgbWF0Y2ggYSBgdHlwZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlXG4gICAqIEByZXR1cm4ge1NldDxNYXJrPn1cbiAgICovXG5cbiAgZ2V0TWFya3NCeVR5cGUodHlwZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRNYXJrc0J5VHlwZUFzQXJyYXkodHlwZSlcbiAgICByZXR1cm4gbmV3IFNldChhcnJheSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYWxsIG9mIHRoZSBtYXJrcyB0aGF0IG1hdGNoIGEgYHR5cGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZVxuICAgKiBAcmV0dXJuIHtPcmRlcmVkU2V0PE1hcms+fVxuICAgKi9cblxuICBnZXRPcmRlcmVkTWFya3NCeVR5cGUodHlwZSkge1xuICAgIGNvbnN0IGFycmF5ID0gdGhpcy5nZXRNYXJrc0J5VHlwZUFzQXJyYXkodHlwZSlcbiAgICByZXR1cm4gbmV3IE9yZGVyZWRTZXQoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgbWFya3MgdGhhdCBtYXRjaCBhIGB0eXBlYCBhcyBhbiBhcnJheS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGdldE1hcmtzQnlUeXBlQXNBcnJheSh0eXBlKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXMucmVkdWNlKChhcnJheSwgbm9kZSkgPT4ge1xuICAgICAgcmV0dXJuIG5vZGUua2luZCA9PSAndGV4dCdcbiAgICAgICAgPyBhcnJheS5jb25jYXQobm9kZS5nZXRNYXJrc0FzQXJyYXkoKS5maWx0ZXIobSA9PiBtLnR5cGUgPT0gdHlwZSkpXG4gICAgICAgIDogYXJyYXkuY29uY2F0KG5vZGUuZ2V0TWFya3NCeVR5cGVBc0FycmF5KHR5cGUpKVxuICAgIH0sIFtdKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYmxvY2sgbm9kZSBiZWZvcmUgYSBkZXNjZW5kYW50IHRleHQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldE5leHRCbG9jayhrZXkpIHtcbiAgICBjb25zdCBjaGlsZCA9IHRoaXMuYXNzZXJ0RGVzY2VuZGFudChrZXkpXG4gICAgbGV0IGxhc3RcblxuICAgIGlmIChjaGlsZC5raW5kID09ICdibG9jaycpIHtcbiAgICAgIGxhc3QgPSBjaGlsZC5nZXRMYXN0VGV4dCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGJsb2NrID0gdGhpcy5nZXRDbG9zZXN0QmxvY2soa2V5KVxuICAgICAgbGFzdCA9IGJsb2NrLmdldExhc3RUZXh0KClcbiAgICB9XG5cbiAgICBjb25zdCBuZXh0ID0gdGhpcy5nZXROZXh0VGV4dChsYXN0LmtleSlcbiAgICBpZiAoIW5leHQpIHJldHVybiBudWxsXG5cbiAgICByZXR1cm4gdGhpcy5nZXRDbG9zZXN0QmxvY2sobmV4dC5rZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBub2RlIGFmdGVyIGEgZGVzY2VuZGFudCBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldE5leHRTaWJsaW5nKGtleSkge1xuICAgIGtleSA9IGFzc2VydEtleShrZXkpXG5cbiAgICBjb25zdCBwYXJlbnQgPSB0aGlzLmdldFBhcmVudChrZXkpXG4gICAgY29uc3QgYWZ0ZXIgPSBwYXJlbnQubm9kZXNcbiAgICAgIC5za2lwVW50aWwoY2hpbGQgPT4gY2hpbGQua2V5ID09IGtleSlcblxuICAgIGlmIChhZnRlci5zaXplID09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBjaGlsZCBub2RlIHdpdGgga2V5IFwiJHtrZXl9XCIuYClcbiAgICB9XG4gICAgcmV0dXJuIGFmdGVyLmdldCgxKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdGV4dCBub2RlIGFmdGVyIGEgZGVzY2VuZGFudCB0ZXh0IG5vZGUgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXROZXh0VGV4dChrZXkpIHtcbiAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgIHJldHVybiB0aGlzLmdldFRleHRzKClcbiAgICAgIC5za2lwVW50aWwodGV4dCA9PiB0ZXh0LmtleSA9PSBrZXkpXG4gICAgICAuZ2V0KDEpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbm9kZSBpbiB0aGUgdHJlZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldE5vZGUoa2V5KSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcbiAgICByZXR1cm4gdGhpcy5rZXkgPT0ga2V5ID8gdGhpcyA6IHRoaXMuZ2V0RGVzY2VuZGFudChrZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGEgbm9kZSBpbiB0aGUgdHJlZSBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IHBhdGhcbiAgICogQHJldHVybiB7Tm9kZXxOdWxsfVxuICAgKi9cblxuICBnZXROb2RlQXRQYXRoKHBhdGgpIHtcbiAgICByZXR1cm4gcGF0aC5sZW5ndGggPyB0aGlzLmdldERlc2NlbmRhbnRBdFBhdGgocGF0aCkgOiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBvZmZzZXQgZm9yIGEgZGVzY2VuZGFudCB0ZXh0IG5vZGUgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7TnVtYmVyfVxuICAgKi9cblxuICBnZXRPZmZzZXQoa2V5KSB7XG4gICAgdGhpcy5hc3NlcnREZXNjZW5kYW50KGtleSlcblxuICAgIC8vIENhbGN1bGF0ZSB0aGUgb2Zmc2V0IG9mIHRoZSBub2RlcyBiZWZvcmUgdGhlIGhpZ2hlc3QgY2hpbGQuXG4gICAgY29uc3QgY2hpbGQgPSB0aGlzLmdldEZ1cnRoZXN0QW5jZXN0b3Ioa2V5KVxuICAgIGNvbnN0IG9mZnNldCA9IHRoaXMubm9kZXNcbiAgICAgIC50YWtlVW50aWwobiA9PiBuID09IGNoaWxkKVxuICAgICAgLnJlZHVjZSgobWVtbywgbikgPT4gbWVtbyArIG4udGV4dC5sZW5ndGgsIDApXG5cbiAgICAvLyBSZWN1cnNlIGlmIG5lZWQgYmUuXG4gICAgcmV0dXJuIHRoaXMuaGFzQ2hpbGQoa2V5KVxuICAgICAgPyBvZmZzZXRcbiAgICAgIDogb2Zmc2V0ICsgY2hpbGQuZ2V0T2Zmc2V0KGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG9mZnNldCBmcm9tIGEgYHJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtSYW5nZX0gcmFuZ2VcbiAgICogQHJldHVybiB7TnVtYmVyfVxuICAgKi9cblxuICBnZXRPZmZzZXRBdFJhbmdlKHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcblxuICAgIGlmIChyYW5nZS5pc1Vuc2V0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSByYW5nZSBjYW5ub3QgYmUgdW5zZXQgdG8gY2FsY3VsY2F0ZSBpdHMgb2Zmc2V0LicpXG4gICAgfVxuXG4gICAgaWYgKHJhbmdlLmlzRXhwYW5kZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHJhbmdlIG11c3QgYmUgY29sbGFwc2VkIHRvIGNhbGN1bGNhdGUgaXRzIG9mZnNldC4nKVxuICAgIH1cblxuICAgIGNvbnN0IHsgc3RhcnRLZXksIHN0YXJ0T2Zmc2V0IH0gPSByYW5nZVxuICAgIHJldHVybiB0aGlzLmdldE9mZnNldChzdGFydEtleSkgKyBzdGFydE9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcGFyZW50IG9mIGEgY2hpbGQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldFBhcmVudChrZXkpIHtcbiAgICBpZiAodGhpcy5oYXNDaGlsZChrZXkpKSByZXR1cm4gdGhpc1xuXG4gICAgbGV0IG5vZGUgPSBudWxsXG5cbiAgICB0aGlzLm5vZGVzLmZpbmQoKGNoaWxkKSA9PiB7XG4gICAgICBpZiAoY2hpbGQua2luZCA9PSAndGV4dCcpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlID0gY2hpbGQuZ2V0UGFyZW50KGtleSlcbiAgICAgICAgcmV0dXJuIG5vZGVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBhdGggb2YgYSBkZXNjZW5kYW50IG5vZGUgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfE5vZGV9IGtleVxuICAgKiBAcmV0dXJuIHtBcnJheX1cbiAgICovXG5cbiAgZ2V0UGF0aChrZXkpIHtcbiAgICBsZXQgY2hpbGQgPSB0aGlzLmFzc2VydE5vZGUoa2V5KVxuICAgIGNvbnN0IGFuY2VzdG9ycyA9IHRoaXMuZ2V0QW5jZXN0b3JzKGtleSlcbiAgICBjb25zdCBwYXRoID0gW11cblxuICAgIGFuY2VzdG9ycy5yZXZlcnNlKCkuZm9yRWFjaCgoYW5jZXN0b3IpID0+IHtcbiAgICAgIGNvbnN0IGluZGV4ID0gYW5jZXN0b3Iubm9kZXMuaW5kZXhPZihjaGlsZClcbiAgICAgIHBhdGgudW5zaGlmdChpbmRleClcbiAgICAgIGNoaWxkID0gYW5jZXN0b3JcbiAgICB9KVxuXG4gICAgcmV0dXJuIHBhdGhcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHBsYWNlaG9sZGVyIGZvciB0aGUgbm9kZSBmcm9tIGEgYHNjaGVtYWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U2NoZW1hfSBzY2hlbWFcbiAgICogQHJldHVybiB7Q29tcG9uZW50fFZvaWR9XG4gICAqL1xuXG4gIGdldFBsYWNlaG9sZGVyKHNjaGVtYSkge1xuICAgIHJldHVybiBzY2hlbWEuX19nZXRQbGFjZWhvbGRlcih0aGlzKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYmxvY2sgbm9kZSBiZWZvcmUgYSBkZXNjZW5kYW50IHRleHQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldFByZXZpb3VzQmxvY2soa2V5KSB7XG4gICAgY29uc3QgY2hpbGQgPSB0aGlzLmFzc2VydERlc2NlbmRhbnQoa2V5KVxuICAgIGxldCBmaXJzdFxuXG4gICAgaWYgKGNoaWxkLmtpbmQgPT0gJ2Jsb2NrJykge1xuICAgICAgZmlyc3QgPSBjaGlsZC5nZXRGaXJzdFRleHQoKVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBibG9jayA9IHRoaXMuZ2V0Q2xvc2VzdEJsb2NrKGtleSlcbiAgICAgIGZpcnN0ID0gYmxvY2suZ2V0Rmlyc3RUZXh0KClcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2aW91cyA9IHRoaXMuZ2V0UHJldmlvdXNUZXh0KGZpcnN0LmtleSlcbiAgICBpZiAoIXByZXZpb3VzKSByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIHRoaXMuZ2V0Q2xvc2VzdEJsb2NrKHByZXZpb3VzLmtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5vZGUgYmVmb3JlIGEgZGVzY2VuZGFudCBub2RlIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0UHJldmlvdXNTaWJsaW5nKGtleSkge1xuICAgIGtleSA9IGFzc2VydEtleShrZXkpXG4gICAgY29uc3QgcGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoa2V5KVxuICAgIGNvbnN0IGJlZm9yZSA9IHBhcmVudC5ub2Rlc1xuICAgICAgLnRha2VVbnRpbChjaGlsZCA9PiBjaGlsZC5rZXkgPT0ga2V5KVxuXG4gICAgaWYgKGJlZm9yZS5zaXplID09IHBhcmVudC5ub2Rlcy5zaXplKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIGEgY2hpbGQgbm9kZSB3aXRoIGtleSBcIiR7a2V5fVwiLmApXG4gICAgfVxuXG4gICAgcmV0dXJuIGJlZm9yZS5sYXN0KClcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHRleHQgbm9kZSBiZWZvcmUgYSBkZXNjZW5kYW50IHRleHQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtOb2RlfE51bGx9XG4gICAqL1xuXG4gIGdldFByZXZpb3VzVGV4dChrZXkpIHtcbiAgICBrZXkgPSBhc3NlcnRLZXkoa2V5KVxuICAgIHJldHVybiB0aGlzLmdldFRleHRzKClcbiAgICAgIC50YWtlVW50aWwodGV4dCA9PiB0ZXh0LmtleSA9PSBrZXkpXG4gICAgICAubGFzdCgpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBpbmRleGVzIG9mIHRoZSBzZWxlY3Rpb24gZm9yIGEgYHJhbmdlYCwgZ2l2ZW4gYW4gZXh0cmEgZmxhZyBmb3JcbiAgICogd2hldGhlciB0aGUgbm9kZSBgaXNTZWxlY3RlZGAsIHRvIGRldGVybWluZSB3aGV0aGVyIG5vdCBmaW5kaW5nIG1hdGNoZXNcbiAgICogbWVhbnMgZXZlcnl0aGluZyBpcyBzZWxlY3RlZCBvciBub3RoaW5nIGlzLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGlzU2VsZWN0ZWRcbiAgICogQHJldHVybiB7T2JqZWN0fE51bGx9XG4gICAqL1xuXG4gIGdldFNlbGVjdGlvbkluZGV4ZXMocmFuZ2UsIGlzU2VsZWN0ZWQgPSBmYWxzZSkge1xuICAgIGNvbnN0IHsgc3RhcnRLZXksIGVuZEtleSB9ID0gcmFuZ2VcblxuICAgIC8vIFBFUkY6IGlmIHdlJ3JlIG5vdCBzZWxlY3RlZCwgb3IgdGhlIHJhbmdlIGlzIGJsdXJyZWQsIHdlIGNhbiBleGl0IGVhcmx5LlxuICAgIGlmICghaXNTZWxlY3RlZCB8fCByYW5nZS5pc0JsdXJyZWQpIHtcbiAgICAgIHJldHVybiBudWxsXG4gICAgfVxuXG4gICAgLy8gUEVSRjogaWYgdGhlIHN0YXJ0IGFuZCBlbmQga2V5cyBhcmUgdGhlIHNhbWUsIGp1c3QgY2hlY2sgZm9yIHRoZSBjaGlsZFxuICAgIC8vIHRoYXQgY29udGFpbnMgdGhhdCBzaW5nbGUga2V5LlxuICAgIGlmIChzdGFydEtleSA9PSBlbmRLZXkpIHtcbiAgICAgIGNvbnN0IGNoaWxkID0gdGhpcy5nZXRGdXJ0aGVzdEFuY2VzdG9yKHN0YXJ0S2V5KVxuICAgICAgY29uc3QgaW5kZXggPSBjaGlsZCA/IHRoaXMubm9kZXMuaW5kZXhPZihjaGlsZCkgOiBudWxsXG4gICAgICByZXR1cm4geyBzdGFydDogaW5kZXgsIGVuZDogaW5kZXggKyAxIH1cbiAgICB9XG5cbiAgICAvLyBPdGhlcndpc2UsIGNoZWNrIGFsbCBvZiB0aGUgY2hpbGRyZW4uLi5cbiAgICBsZXQgc3RhcnQgPSBudWxsXG4gICAgbGV0IGVuZCA9IG51bGxcblxuICAgIHRoaXMubm9kZXMuZm9yRWFjaCgoY2hpbGQsIGkpID0+IHtcbiAgICAgIGlmIChjaGlsZC5raW5kID09ICd0ZXh0Jykge1xuICAgICAgICBpZiAoc3RhcnQgPT0gbnVsbCAmJiBjaGlsZC5rZXkgPT0gc3RhcnRLZXkpIHN0YXJ0ID0gaVxuICAgICAgICBpZiAoZW5kID09IG51bGwgJiYgY2hpbGQua2V5ID09IGVuZEtleSkgZW5kID0gaSArIDFcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChzdGFydCA9PSBudWxsICYmIGNoaWxkLmhhc0Rlc2NlbmRhbnQoc3RhcnRLZXkpKSBzdGFydCA9IGlcbiAgICAgICAgaWYgKGVuZCA9PSBudWxsICYmIGNoaWxkLmhhc0Rlc2NlbmRhbnQoZW5kS2V5KSkgZW5kID0gaSArIDFcbiAgICAgIH1cblxuICAgICAgLy8gUEVSRjogZXhpdCBlYXJseSBpZiBib3RoIHN0YXJ0IGFuZCBlbmQgaGF2ZSBiZWVuIGZvdW5kLlxuICAgICAgcmV0dXJuIHN0YXJ0ID09IG51bGwgfHwgZW5kID09IG51bGxcbiAgICB9KVxuXG4gICAgaWYgKGlzU2VsZWN0ZWQgJiYgc3RhcnQgPT0gbnVsbCkgc3RhcnQgPSAwXG4gICAgaWYgKGlzU2VsZWN0ZWQgJiYgZW5kID09IG51bGwpIGVuZCA9IHRoaXMubm9kZXMuc2l6ZVxuICAgIHJldHVybiBzdGFydCA9PSBudWxsID8gbnVsbCA6IHsgc3RhcnQsIGVuZCB9XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25jYXRlbmF0ZWQgdGV4dCBzdHJpbmcgb2YgYWxsIGNoaWxkIG5vZGVzLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldFRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMubm9kZXMucmVkdWNlKChzdHJpbmcsIG5vZGUpID0+IHtcbiAgICAgIHJldHVybiBzdHJpbmcgKyBub2RlLnRleHRcbiAgICB9LCAnJylcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGRlc2NlbmRlbnQgdGV4dCBub2RlIGF0IGFuIGBvZmZzZXRgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gb2Zmc2V0XG4gICAqIEByZXR1cm4ge05vZGV8TnVsbH1cbiAgICovXG5cbiAgZ2V0VGV4dEF0T2Zmc2V0KG9mZnNldCkge1xuICAgIC8vIFBFUkY6IEFkZCBhIGZldyBzaG9ydGN1dHMgZm9yIHRoZSBvYnZpb3VzIGNhc2VzLlxuICAgIGlmIChvZmZzZXQgPT0gMCkgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RUZXh0KClcbiAgICBpZiAob2Zmc2V0ID09IHRoaXMudGV4dC5sZW5ndGgpIHJldHVybiB0aGlzLmdldExhc3RUZXh0KClcbiAgICBpZiAob2Zmc2V0IDwgMCB8fCBvZmZzZXQgPiB0aGlzLnRleHQubGVuZ3RoKSByZXR1cm4gbnVsbFxuXG4gICAgbGV0IGxlbmd0aCA9IDBcblxuICAgIHJldHVybiB0aGlzXG4gICAgICAuZ2V0VGV4dHMoKVxuICAgICAgLmZpbmQoKG5vZGUsIGksIG5vZGVzKSA9PiB7XG4gICAgICAgIGxlbmd0aCArPSBub2RlLnRleHQubGVuZ3RoXG4gICAgICAgIHJldHVybiBsZW5ndGggPiBvZmZzZXRcbiAgICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBkaXJlY3Rpb24gb2YgdGhlIG5vZGUncyB0ZXh0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldFRleHREaXJlY3Rpb24oKSB7XG4gICAgY29uc3QgZGlyID0gZGlyZWN0aW9uKHRoaXMudGV4dClcbiAgICByZXR1cm4gZGlyID09ICduZXV0cmFsJyA/IHVuZGVmaW5lZCA6IGRpclxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGdldCBhbGwgb2YgdGhlIGNoaWxkIHRleHQgbm9kZXMgaW4gb3JkZXIgb2YgYXBwZWFyYW5jZS5cbiAgICpcbiAgICogQHJldHVybiB7TGlzdDxOb2RlPn1cbiAgICovXG5cbiAgZ2V0VGV4dHMoKSB7XG4gICAgY29uc3QgYXJyYXkgPSB0aGlzLmdldFRleHRzQXNBcnJheSgpXG4gICAgcmV0dXJuIG5ldyBMaXN0KGFycmF5KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlY3Vyc2l2ZWx5IGdldCBhbGwgdGhlIGxlYWYgdGV4dCBub2RlcyBpbiBvcmRlciBvZiBhcHBlYXJhbmNlLCBhcyBhcnJheS5cbiAgICpcbiAgICogQHJldHVybiB7TGlzdDxOb2RlPn1cbiAgICovXG5cbiAgZ2V0VGV4dHNBc0FycmF5KCkge1xuICAgIGxldCBhcnJheSA9IFtdXG5cbiAgICB0aGlzLm5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgIGlmIChub2RlLmtpbmQgPT0gJ3RleHQnKSB7XG4gICAgICAgIGFycmF5LnB1c2gobm9kZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFycmF5ID0gYXJyYXkuY29uY2F0KG5vZGUuZ2V0VGV4dHNBc0FycmF5KCkpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiBhcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhbGwgb2YgdGhlIHRleHQgbm9kZXMgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtMaXN0PE5vZGU+fVxuICAgKi9cblxuICBnZXRUZXh0c0F0UmFuZ2UocmFuZ2UpIHtcbiAgICBjb25zdCBhcnJheSA9IHRoaXMuZ2V0VGV4dHNBdFJhbmdlQXNBcnJheShyYW5nZSlcbiAgICByZXR1cm4gbmV3IExpc3QoYXJyYXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBvZiB0aGUgdGV4dCBub2RlcyBpbiBhIGByYW5nZWAgYXMgYW4gYXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRUZXh0c0F0UmFuZ2VBc0FycmF5KHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS5ub3JtYWxpemUodGhpcylcbiAgICBpZiAocmFuZ2UuaXNVbnNldCkgcmV0dXJuIFtdXG5cbiAgICBjb25zdCB7IHN0YXJ0S2V5LCBlbmRLZXkgfSA9IHJhbmdlXG4gICAgY29uc3Qgc3RhcnRUZXh0ID0gdGhpcy5nZXREZXNjZW5kYW50KHN0YXJ0S2V5KVxuXG4gICAgLy8gUEVSRjogdGhlIG1vc3QgY29tbW9uIGNhc2UgaXMgd2hlbiB0aGUgcmFuZ2UgaXMgaW4gYSBzaW5nbGUgdGV4dCBub2RlLFxuICAgIC8vIHdoZXJlIHdlIGNhbiBhdm9pZCBhIGxvdCBvZiBpdGVyYXRpbmcgb2YgdGhlIHRyZWUuXG4gICAgaWYgKHN0YXJ0S2V5ID09IGVuZEtleSkgcmV0dXJuIFtzdGFydFRleHRdXG5cbiAgICBjb25zdCBlbmRUZXh0ID0gdGhpcy5nZXREZXNjZW5kYW50KGVuZEtleSlcbiAgICBjb25zdCB0ZXh0cyA9IHRoaXMuZ2V0VGV4dHNBc0FycmF5KClcbiAgICBjb25zdCBzdGFydCA9IHRleHRzLmluZGV4T2Yoc3RhcnRUZXh0KVxuICAgIGNvbnN0IGVuZCA9IHRleHRzLmluZGV4T2YoZW5kVGV4dClcbiAgICByZXR1cm4gdGV4dHMuc2xpY2Uoc3RhcnQsIGVuZCArIDEpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYSBjaGlsZCBub2RlIGV4aXN0cyBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNDaGlsZChrZXkpIHtcbiAgICByZXR1cm4gISF0aGlzLmdldENoaWxkKGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBjaGVjayBpZiBhIGNoaWxkIG5vZGUgZXhpc3RzIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGhhc0Rlc2NlbmRhbnQoa2V5KSB7XG4gICAgcmV0dXJuICEhdGhpcy5nZXREZXNjZW5kYW50KGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWN1cnNpdmVseSBjaGVjayBpZiBhIG5vZGUgZXhpc3RzIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGhhc05vZGUoa2V5KSB7XG4gICAgcmV0dXJuICEhdGhpcy5nZXROb2RlKGtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIG5vZGUgaGFzIGEgdm9pZCBwYXJlbnQgYnkgYGtleWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzVm9pZFBhcmVudChrZXkpIHtcbiAgICByZXR1cm4gISF0aGlzLmdldENsb3Nlc3Qoa2V5LCBwYXJlbnQgPT4gcGFyZW50LmlzVm9pZClcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYSBgbm9kZWAgYXQgYGluZGV4YC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBpbnNlcnROb2RlKGluZGV4LCBub2RlKSB7XG4gICAgY29uc3Qga2V5cyA9IHRoaXMuZ2V0S2V5cygpXG5cbiAgICBpZiAoa2V5cy5jb250YWlucyhub2RlLmtleSkpIHtcbiAgICAgIG5vZGUgPSBub2RlLnJlZ2VuZXJhdGVLZXkoKVxuICAgIH1cblxuICAgIGlmIChub2RlLmtpbmQgIT0gJ3RleHQnKSB7XG4gICAgICBub2RlID0gbm9kZS5tYXBEZXNjZW5kYW50cygoZGVzYykgPT4ge1xuICAgICAgICByZXR1cm4ga2V5cy5jb250YWlucyhkZXNjLmtleSlcbiAgICAgICAgICA/IGRlc2MucmVnZW5lcmF0ZUtleSgpXG4gICAgICAgICAgOiBkZXNjXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5ub2Rlcy5pbnNlcnQoaW5kZXgsIG5vZGUpXG4gICAgcmV0dXJuIHRoaXMuc2V0KCdub2RlcycsIG5vZGVzKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIG5vZGUgaXMgaW4gYSBgcmFuZ2VgLlxuICAgKlxuICAgKiBAcGFyYW0ge1JhbmdlfSByYW5nZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBpc0luUmFuZ2UocmFuZ2UpIHtcbiAgICByYW5nZSA9IHJhbmdlLm5vcm1hbGl6ZSh0aGlzKVxuXG4gICAgY29uc3Qgbm9kZSA9IHRoaXNcbiAgICBjb25zdCB7IHN0YXJ0S2V5LCBlbmRLZXksIGlzQ29sbGFwc2VkIH0gPSByYW5nZVxuXG4gICAgLy8gUEVSRjogc29sdmUgdGhlIG1vc3QgY29tbW9uIGNhc3Qgd2hlcmUgdGhlIHN0YXJ0IG9yIGVuZCBrZXkgYXJlIGluc2lkZVxuICAgIC8vIHRoZSBub2RlLCBmb3IgY29sbGFwc2VkIHNlbGVjdGlvbnMuXG4gICAgaWYgKFxuICAgICAgbm9kZS5rZXkgPT0gc3RhcnRLZXkgfHxcbiAgICAgIG5vZGUua2V5ID09IGVuZEtleSB8fFxuICAgICAgbm9kZS5oYXNEZXNjZW5kYW50KHN0YXJ0S2V5KSB8fFxuICAgICAgbm9kZS5oYXNEZXNjZW5kYW50KGVuZEtleSlcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgLy8gUEVSRjogaWYgdGhlIHNlbGVjdGlvbiBpcyBjb2xsYXBzZWQgYW5kIHRoZSBwcmV2aW91cyBjaGVjayBkaWRuJ3QgcmV0dXJuXG4gICAgLy8gdHJ1ZSwgdGhlbiBpdCBtdXN0IGJlIGZhbHNlLlxuICAgIGlmIChpc0NvbGxhcHNlZCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBsb29rIHRocm91Z2ggYWxsIG9mIHRoZSBsZWFmIHRleHQgbm9kZXMgaW4gdGhlIHJhbmdlLCB0byBzZWVcbiAgICAvLyBpZiBhbnkgb2YgdGhlbSBhcmUgaW5zaWRlIHRoZSBub2RlLlxuICAgIGNvbnN0IHRleHRzID0gbm9kZS5nZXRUZXh0c0F0UmFuZ2UocmFuZ2UpXG4gICAgbGV0IG1lbW8gPSBmYWxzZVxuXG4gICAgdGV4dHMuZm9yRWFjaCgodGV4dCkgPT4ge1xuICAgICAgaWYgKG5vZGUuaGFzRGVzY2VuZGFudCh0ZXh0LmtleSkpIG1lbW8gPSB0cnVlXG4gICAgICByZXR1cm4gbWVtb1xuICAgIH0pXG5cbiAgICByZXR1cm4gbWVtb1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIG5vZGUgaXMgYSBsZWFmIGJsb2NrLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBpc0xlYWZCbG9jaygpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5raW5kID09ICdibG9jaycgJiZcbiAgICAgIHRoaXMubm9kZXMuZXZlcnkobiA9PiBuLmtpbmQgIT0gJ2Jsb2NrJylcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgbm9kZSBpcyBhIGxlYWYgaW5saW5lLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBpc0xlYWZJbmxpbmUoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMua2luZCA9PSAnaW5saW5lJyAmJlxuICAgICAgdGhpcy5ub2Rlcy5ldmVyeShuID0+IG4ua2luZCAhPSAnaW5saW5lJylcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogTWVyZ2UgYSBjaGlsZHJlbiBub2RlIGBmaXJzdGAgd2l0aCBhbm90aGVyIGNoaWxkcmVuIG5vZGUgYHNlY29uZGAuXG4gICAqIGBmaXJzdGAgYW5kIGBzZWNvbmRgIHdpbGwgYmUgY29uY2F0ZW5hdGVkIGluIHRoYXQgb3JkZXIuXG4gICAqIGBmaXJzdGAgYW5kIGBzZWNvbmRgIG11c3QgYmUgdHdvIE5vZGVzIG9yIHR3byBUZXh0LlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IGZpcnN0XG4gICAqIEBwYXJhbSB7Tm9kZX0gc2Vjb25kXG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuXG4gIG1lcmdlTm9kZSh3aXRoSW5kZXgsIGluZGV4KSB7XG4gICAgbGV0IG5vZGUgPSB0aGlzXG4gICAgbGV0IG9uZSA9IG5vZGUubm9kZXMuZ2V0KHdpdGhJbmRleClcbiAgICBjb25zdCB0d28gPSBub2RlLm5vZGVzLmdldChpbmRleClcblxuICAgIGlmIChvbmUua2luZCAhPSB0d28ua2luZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBUcmllZCB0byBtZXJnZSB0d28gbm9kZXMgb2YgZGlmZmVyZW50IGtpbmRzOiBcIiR7b25lLmtpbmR9XCIgYW5kIFwiJHt0d28ua2luZH1cIi5gKVxuICAgIH1cblxuICAgIC8vIElmIHRoZSBub2RlcyBhcmUgdGV4dCBub2RlcywgY29uY2F0ZW5hdGUgdGhlaXIgY2hhcmFjdGVycyB0b2dldGhlci5cbiAgICBpZiAob25lLmtpbmQgPT0gJ3RleHQnKSB7XG4gICAgICBjb25zdCBjaGFyYWN0ZXJzID0gb25lLmNoYXJhY3RlcnMuY29uY2F0KHR3by5jaGFyYWN0ZXJzKVxuICAgICAgb25lID0gb25lLnNldCgnY2hhcmFjdGVycycsIGNoYXJhY3RlcnMpXG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBjb25jYXRlbmF0ZSB0aGVpciBjaGlsZCBub2RlcyB0b2dldGhlci5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IG5vZGVzID0gb25lLm5vZGVzLmNvbmNhdCh0d28ubm9kZXMpXG4gICAgICBvbmUgPSBvbmUuc2V0KCdub2RlcycsIG5vZGVzKVxuICAgIH1cblxuICAgIG5vZGUgPSBub2RlLnJlbW92ZU5vZGUoaW5kZXgpXG4gICAgbm9kZSA9IG5vZGUucmVtb3ZlTm9kZSh3aXRoSW5kZXgpXG4gICAgbm9kZSA9IG5vZGUuaW5zZXJ0Tm9kZSh3aXRoSW5kZXgsIG9uZSlcbiAgICByZXR1cm4gbm9kZVxuICB9XG5cbiAgLyoqXG4gICAqIE1hcCBhbGwgY2hpbGQgbm9kZXMsIHVwZGF0aW5nIHRoZW0gaW4gdGhlaXIgcGFyZW50cy4gVGhpcyBtZXRob2QgaXNcbiAgICogb3B0aW1pemVkIHRvIG5vdCByZXR1cm4gYSBuZXcgbm9kZSBpZiBubyBjaGFuZ2VzIGFyZSBtYWRlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRvclxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBtYXBDaGlsZHJlbihpdGVyYXRvcikge1xuICAgIGxldCB7IG5vZGVzIH0gPSB0aGlzXG5cbiAgICBub2Rlcy5mb3JFYWNoKChub2RlLCBpKSA9PiB7XG4gICAgICBjb25zdCByZXQgPSBpdGVyYXRvcihub2RlLCBpLCB0aGlzLm5vZGVzKVxuICAgICAgaWYgKHJldCAhPSBub2RlKSBub2RlcyA9IG5vZGVzLnNldChyZXQua2V5LCByZXQpXG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzLnNldCgnbm9kZXMnLCBub2RlcylcbiAgfVxuXG4gIC8qKlxuICAgKiBNYXAgYWxsIGRlc2NlbmRhbnQgbm9kZXMsIHVwZGF0aW5nIHRoZW0gaW4gdGhlaXIgcGFyZW50cy4gVGhpcyBtZXRob2QgaXNcbiAgICogb3B0aW1pemVkIHRvIG5vdCByZXR1cm4gYSBuZXcgbm9kZSBpZiBubyBjaGFuZ2VzIGFyZSBtYWRlLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRvclxuICAgKiBAcmV0dXJuIHtOb2RlfVxuICAgKi9cblxuICBtYXBEZXNjZW5kYW50cyhpdGVyYXRvcikge1xuICAgIGxldCB7IG5vZGVzIH0gPSB0aGlzXG5cbiAgICBub2Rlcy5mb3JFYWNoKChub2RlLCBpKSA9PiB7XG4gICAgICBsZXQgcmV0ID0gbm9kZVxuICAgICAgaWYgKHJldC5raW5kICE9ICd0ZXh0JykgcmV0ID0gcmV0Lm1hcERlc2NlbmRhbnRzKGl0ZXJhdG9yKVxuICAgICAgcmV0ID0gaXRlcmF0b3IocmV0LCBpLCB0aGlzLm5vZGVzKVxuICAgICAgaWYgKHJldCA9PSBub2RlKSByZXR1cm5cblxuICAgICAgY29uc3QgaW5kZXggPSBub2Rlcy5pbmRleE9mKG5vZGUpXG4gICAgICBub2RlcyA9IG5vZGVzLnNldChpbmRleCwgcmV0KVxuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpcy5zZXQoJ25vZGVzJywgbm9kZXMpXG4gIH1cblxuICAvKipcbiAgICogUmVnZW5lcmF0ZSB0aGUgbm9kZSdzIGtleS5cbiAgICpcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgcmVnZW5lcmF0ZUtleSgpIHtcbiAgICBjb25zdCBrZXkgPSBnZW5lcmF0ZUtleSgpXG4gICAgcmV0dXJuIHRoaXMuc2V0KCdrZXknLCBrZXkpXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgYG5vZGVgIGZyb20gdGhlIGNoaWxkcmVuIG5vZGUgbWFwLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuXG4gIHJlbW92ZURlc2NlbmRhbnQoa2V5KSB7XG4gICAga2V5ID0gYXNzZXJ0S2V5KGtleSlcblxuICAgIGxldCBub2RlID0gdGhpc1xuICAgIGxldCBwYXJlbnQgPSBub2RlLmdldFBhcmVudChrZXkpXG4gICAgaWYgKCFwYXJlbnQpIHRocm93IG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgYSBkZXNjZW5kYW50IG5vZGUgd2l0aCBrZXkgXCIke2tleX1cIi5gKVxuXG4gICAgY29uc3QgaW5kZXggPSBwYXJlbnQubm9kZXMuZmluZEluZGV4KG4gPT4gbi5rZXkgPT09IGtleSlcbiAgICBjb25zdCBub2RlcyA9IHBhcmVudC5ub2Rlcy5zcGxpY2UoaW5kZXgsIDEpXG5cbiAgICBwYXJlbnQgPSBwYXJlbnQuc2V0KCdub2RlcycsIG5vZGVzKVxuICAgIG5vZGUgPSBub2RlLnVwZGF0ZU5vZGUocGFyZW50KVxuICAgIHJldHVybiBub2RlXG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIGEgbm9kZSBhdCBgaW5kZXhgLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgcmVtb3ZlTm9kZShpbmRleCkge1xuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5ub2Rlcy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgcmV0dXJuIHRoaXMuc2V0KCdub2RlcycsIG5vZGVzKVxuICB9XG5cbiAgLyoqXG4gICAqIFNwbGl0IGEgY2hpbGQgbm9kZSBieSBgaW5kZXhgIGF0IGBwb3NpdGlvbmAuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpbmRleFxuICAgKiBAcGFyYW0ge051bWJlcn0gcG9zaXRpb25cbiAgICogQHJldHVybiB7Tm9kZX1cbiAgICovXG5cbiAgc3BsaXROb2RlKGluZGV4LCBwb3NpdGlvbikge1xuICAgIGxldCBub2RlID0gdGhpc1xuICAgIGNvbnN0IGNoaWxkID0gbm9kZS5ub2Rlcy5nZXQoaW5kZXgpXG4gICAgbGV0IG9uZVxuICAgIGxldCB0d29cblxuICAgIC8vIElmIHRoZSBjaGlsZCBpcyBhIHRleHQgbm9kZSwgdGhlIGBwb3NpdGlvbmAgcmVmZXJzIHRvIHRoZSB0ZXh0IG9mZnNldCBhdFxuICAgIC8vIHdoaWNoIHRvIHNwbGl0IGl0LlxuICAgIGlmIChjaGlsZC5raW5kID09ICd0ZXh0Jykge1xuICAgICAgY29uc3QgYmVmb3JlcyA9IGNoaWxkLmNoYXJhY3RlcnMudGFrZShwb3NpdGlvbilcbiAgICAgIGNvbnN0IGFmdGVycyA9IGNoaWxkLmNoYXJhY3RlcnMuc2tpcChwb3NpdGlvbilcbiAgICAgIG9uZSA9IGNoaWxkLnNldCgnY2hhcmFjdGVycycsIGJlZm9yZXMpXG4gICAgICB0d28gPSBjaGlsZC5zZXQoJ2NoYXJhY3RlcnMnLCBhZnRlcnMpLnJlZ2VuZXJhdGVLZXkoKVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIGNoaWxkIGlzIG5vdCBhIHRleHQgbm9kZSwgdGhlIGBwb3NpdGlvbmAgcmVmZXJzIHRvIHRoZVxuICAgIC8vIGluZGV4IGF0IHdoaWNoIHRvIHNwbGl0IGl0cyBjaGlsZHJlbi5cbiAgICBlbHNlIHtcbiAgICAgIGNvbnN0IGJlZm9yZXMgPSBjaGlsZC5ub2Rlcy50YWtlKHBvc2l0aW9uKVxuICAgICAgY29uc3QgYWZ0ZXJzID0gY2hpbGQubm9kZXMuc2tpcChwb3NpdGlvbilcbiAgICAgIG9uZSA9IGNoaWxkLnNldCgnbm9kZXMnLCBiZWZvcmVzKVxuICAgICAgdHdvID0gY2hpbGQuc2V0KCdub2RlcycsIGFmdGVycykucmVnZW5lcmF0ZUtleSgpXG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoZSBvbGQgbm9kZSBhbmQgaW5zZXJ0IHRoZSBuZXdseSBzcGxpdCBjaGlsZHJlbi5cbiAgICBub2RlID0gbm9kZS5yZW1vdmVOb2RlKGluZGV4KVxuICAgIG5vZGUgPSBub2RlLmluc2VydE5vZGUoaW5kZXgsIHR3bylcbiAgICBub2RlID0gbm9kZS5pbnNlcnROb2RlKGluZGV4LCBvbmUpXG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgYSBuZXcgdmFsdWUgZm9yIGEgY2hpbGQgbm9kZSBieSBga2V5YC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge05vZGV9XG4gICAqL1xuXG4gIHVwZGF0ZU5vZGUobm9kZSkge1xuICAgIGlmIChub2RlLmtleSA9PSB0aGlzLmtleSkge1xuICAgICAgcmV0dXJuIG5vZGVcbiAgICB9XG5cbiAgICBsZXQgY2hpbGQgPSB0aGlzLmFzc2VydERlc2NlbmRhbnQobm9kZS5rZXkpXG4gICAgY29uc3QgYW5jZXN0b3JzID0gdGhpcy5nZXRBbmNlc3RvcnMobm9kZS5rZXkpXG5cbiAgICBhbmNlc3RvcnMucmV2ZXJzZSgpLmZvckVhY2goKHBhcmVudCkgPT4ge1xuICAgICAgbGV0IHsgbm9kZXMgfSA9IHBhcmVudFxuICAgICAgY29uc3QgaW5kZXggPSBub2Rlcy5pbmRleE9mKGNoaWxkKVxuICAgICAgY2hpbGQgPSBwYXJlbnRcbiAgICAgIG5vZGVzID0gbm9kZXMuc2V0KGluZGV4LCBub2RlKVxuICAgICAgcGFyZW50ID0gcGFyZW50LnNldCgnbm9kZXMnLCBub2RlcylcbiAgICAgIG5vZGUgPSBwYXJlbnRcbiAgICB9KVxuXG4gICAgcmV0dXJuIG5vZGVcbiAgfVxuXG4gIC8qKlxuICAgKiBWYWxpZGF0ZSB0aGUgbm9kZSBhZ2FpbnN0IGEgYHNjaGVtYWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U2NoZW1hfSBzY2hlbWFcbiAgICogQHJldHVybiB7RnVuY3Rpb258TnVsbH1cbiAgICovXG5cbiAgdmFsaWRhdGUoc2NoZW1hKSB7XG4gICAgcmV0dXJuIHNjaGVtYS52YWxpZGF0ZU5vZGUodGhpcylcbiAgfVxuXG59XG5cbi8qKlxuICogQXNzZXJ0IGEga2V5IGBhcmdgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhcmdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRLZXkoYXJnKSB7XG4gIGlmICh0eXBlb2YgYXJnID09ICdzdHJpbmcnKSByZXR1cm4gYXJnXG4gIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBcXGBrZXlcXGAgYXJndW1lbnQhIEl0IG11c3QgYmUgYSBrZXkgc3RyaW5nLCBidXQgeW91IHBhc3NlZDogJHthcmd9YClcbn1cblxuLyoqXG4gKiBNZW1vaXplIHJlYWQgbWV0aG9kcy5cbiAqL1xuXG5tZW1vaXplKE5vZGUucHJvdG90eXBlLCBbXG4gICdnZXRCbG9ja3MnLFxuICAnZ2V0QmxvY2tzQXNBcnJheScsXG4gICdnZXRDaGFyYWN0ZXJzJyxcbiAgJ2dldENoYXJhY3RlcnNBc0FycmF5JyxcbiAgJ2dldEZpcnN0VGV4dCcsXG4gICdnZXRJbmxpbmVzJyxcbiAgJ2dldElubGluZXNBc0FycmF5JyxcbiAgJ2dldEtleXMnLFxuICAnZ2V0S2V5c0FzQXJyYXknLFxuICAnZ2V0TGFzdFRleHQnLFxuICAnZ2V0TWFya3MnLFxuICAnZ2V0T3JkZXJlZE1hcmtzJyxcbiAgJ2dldE1hcmtzQXNBcnJheScsXG4gICdnZXRUZXh0JyxcbiAgJ2dldFRleHREaXJlY3Rpb24nLFxuICAnZ2V0VGV4dHMnLFxuICAnZ2V0VGV4dHNBc0FycmF5JyxcbiAgJ2lzTGVhZkJsb2NrJyxcbiAgJ2lzTGVhZklubGluZScsXG5dLCB7XG4gIHRha2VzQXJndW1lbnRzOiBmYWxzZVxufSlcblxubWVtb2l6ZShOb2RlLnByb3RvdHlwZSwgW1xuICAnYXJlRGVzY2VuZGFudHNTb3J0ZWQnLFxuICAnZ2V0QWN0aXZlTWFya3NBdFJhbmdlJyxcbiAgJ2dldEFjdGl2ZU1hcmtzQXRSYW5nZUFzQXJyYXknLFxuICAnZ2V0QW5jZXN0b3JzJyxcbiAgJ2dldEJsb2Nrc0F0UmFuZ2UnLFxuICAnZ2V0QmxvY2tzQXRSYW5nZUFzQXJyYXknLFxuICAnZ2V0QmxvY2tzQnlUeXBlJyxcbiAgJ2dldEJsb2Nrc0J5VHlwZUFzQXJyYXknLFxuICAnZ2V0Q2hhcmFjdGVyc0F0UmFuZ2UnLFxuICAnZ2V0Q2hhcmFjdGVyc0F0UmFuZ2VBc0FycmF5JyxcbiAgJ2dldENoaWxkJyxcbiAgJ2dldENsb3Nlc3RCbG9jaycsXG4gICdnZXRDbG9zZXN0SW5saW5lJyxcbiAgJ2dldENsb3Nlc3RWb2lkJyxcbiAgJ2dldENvbW1vbkFuY2VzdG9yJyxcbiAgJ2dldERlY29yYXRpb25zJyxcbiAgJ2dldERlcHRoJyxcbiAgJ2dldERlc2NlbmRhbnQnLFxuICAnZ2V0RGVzY2VuZGFudEF0UGF0aCcsXG4gICdnZXRGcmFnbWVudEF0UmFuZ2UnLFxuICAnZ2V0RnVydGhlc3RCbG9jaycsXG4gICdnZXRGdXJ0aGVzdElubGluZScsXG4gICdnZXRGdXJ0aGVzdEFuY2VzdG9yJyxcbiAgJ2dldEZ1cnRoZXN0T25seUNoaWxkQW5jZXN0b3InLFxuICAnZ2V0SW5saW5lc0F0UmFuZ2UnLFxuICAnZ2V0SW5saW5lc0F0UmFuZ2VBc0FycmF5JyxcbiAgJ2dldElubGluZXNCeVR5cGUnLFxuICAnZ2V0SW5saW5lc0J5VHlwZUFzQXJyYXknLFxuICAnZ2V0TWFya3NBdFJhbmdlJyxcbiAgJ2dldE9yZGVyZWRNYXJrc0F0UmFuZ2UnLFxuICAnZ2V0TWFya3NBdFJhbmdlQXNBcnJheScsXG4gICdnZXRNYXJrc0J5VHlwZScsXG4gICdnZXRPcmRlcmVkTWFya3NCeVR5cGUnLFxuICAnZ2V0TWFya3NCeVR5cGVBc0FycmF5JyxcbiAgJ2dldE5leHRCbG9jaycsXG4gICdnZXROZXh0U2libGluZycsXG4gICdnZXROZXh0VGV4dCcsXG4gICdnZXROb2RlJyxcbiAgJ2dldE5vZGVBdFBhdGgnLFxuICAnZ2V0T2Zmc2V0JyxcbiAgJ2dldE9mZnNldEF0UmFuZ2UnLFxuICAnZ2V0UGFyZW50JyxcbiAgJ2dldFBhdGgnLFxuICAnZ2V0UGxhY2Vob2xkZXInLFxuICAnZ2V0UHJldmlvdXNCbG9jaycsXG4gICdnZXRQcmV2aW91c1NpYmxpbmcnLFxuICAnZ2V0UHJldmlvdXNUZXh0JyxcbiAgJ2dldFRleHRBdE9mZnNldCcsXG4gICdnZXRUZXh0c0F0UmFuZ2UnLFxuICAnZ2V0VGV4dHNBdFJhbmdlQXNBcnJheScsXG4gICdoYXNDaGlsZCcsXG4gICdoYXNEZXNjZW5kYW50JyxcbiAgJ2hhc05vZGUnLFxuICAnaGFzVm9pZFBhcmVudCcsXG4gICd2YWxpZGF0ZScsXG5dLCB7XG4gIHRha2VzQXJndW1lbnRzOiB0cnVlXG59KVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IE5vZGVcbiJdfQ==