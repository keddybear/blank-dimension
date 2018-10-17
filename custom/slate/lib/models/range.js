'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _slateDevLogger = require('slate-dev-logger');

var _slateDevLogger2 = _interopRequireDefault(_slateDevLogger);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _mark = require('./mark');

var _mark2 = _interopRequireDefault(_mark);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  anchorKey: null,
  anchorOffset: 0,
  focusKey: null,
  focusOffset: 0,
  isBackward: null,
  isFocused: false,
  marks: null
};

/**
 * Range.
 *
 * @type {Range}
 */

var Range = function (_Record) {
  _inherits(Range, _Record);

  function Range() {
    _classCallCheck(this, Range);

    return _possibleConstructorReturn(this, (Range.__proto__ || Object.getPrototypeOf(Range)).apply(this, arguments));
  }

  _createClass(Range, [{
    key: 'hasAnchorAtStartOf',


    /**
     * Check whether anchor point of the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

    value: function hasAnchorAtStartOf(node) {
      // PERF: Do a check for a `0` offset first since it's quickest.
      if (this.anchorOffset != 0) return false;
      var first = getFirst(node);
      return this.anchorKey == first.key;
    }

    /**
     * Check whether anchor point of the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorAtEndOf',
    value: function hasAnchorAtEndOf(node) {
      var last = getLast(node);
      return this.anchorKey == last.key && this.anchorOffset == last.text.length;
    }

    /**
     * Check whether the anchor edge of a range is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorBetween',
    value: function hasAnchorBetween(node, start, end) {
      return this.anchorOffset <= end && start <= this.anchorOffset && this.hasAnchorIn(node);
    }

    /**
     * Check whether the anchor edge of a range is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasAnchorIn',
    value: function hasAnchorIn(node) {
      return node.kind == 'text' ? node.key == this.anchorKey : this.anchorKey != null && node.hasDescendant(this.anchorKey);
    }

    /**
     * Check whether focus point of the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtEndOf',
    value: function hasFocusAtEndOf(node) {
      var last = getLast(node);
      return this.focusKey == last.key && this.focusOffset == last.text.length;
    }

    /**
     * Check whether focus point of the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusAtStartOf',
    value: function hasFocusAtStartOf(node) {
      if (this.focusOffset != 0) return false;
      var first = getFirst(node);
      return this.focusKey == first.key;
    }

    /**
     * Check whether the focus edge of a range is in a `node` and at an
     * offset between `start` and `end`.
     *
     * @param {Node} node
     * @param {Number} start
     * @param {Number} end
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusBetween',
    value: function hasFocusBetween(node, start, end) {
      return start <= this.focusOffset && this.focusOffset <= end && this.hasFocusIn(node);
    }

    /**
     * Check whether the focus edge of a range is in a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'hasFocusIn',
    value: function hasFocusIn(node) {
      return node.kind == 'text' ? node.key == this.focusKey : this.focusKey != null && node.hasDescendant(this.focusKey);
    }

    /**
     * Check whether the range is at the start of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'isAtStartOf',
    value: function isAtStartOf(node) {
      return this.isCollapsed && this.hasAnchorAtStartOf(node);
    }

    /**
     * Check whether the range is at the end of a `node`.
     *
     * @param {Node} node
     * @return {Boolean}
     */

  }, {
    key: 'isAtEndOf',
    value: function isAtEndOf(node) {
      return this.isCollapsed && this.hasAnchorAtEndOf(node);
    }

    /**
     * Focus the range.
     *
     * @return {Range}
     */

  }, {
    key: 'focus',
    value: function focus() {
      return this.merge({
        isFocused: true
      });
    }

    /**
     * Blur the range.
     *
     * @return {Range}
     */

  }, {
    key: 'blur',
    value: function blur() {
      return this.merge({
        isFocused: false
      });
    }

    /**
     * Unset the range.
     *
     * @return {Range}
     */

  }, {
    key: 'deselect',
    value: function deselect() {
      return this.merge({
        anchorKey: null,
        anchorOffset: 0,
        focusKey: null,
        focusOffset: 0,
        isFocused: false,
        isBackward: false
      });
    }

    /**
     * Flip the range.
     *
     * @return {Range}
     */

  }, {
    key: 'flip',
    value: function flip() {
      return this.merge({
        anchorKey: this.focusKey,
        anchorOffset: this.focusOffset,
        focusKey: this.anchorKey,
        focusOffset: this.anchorOffset,
        isBackward: this.isBackward == null ? null : !this.isBackward
      });
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Range}
     */

  }, {
    key: 'moveAnchor',
    value: function moveAnchor() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var anchorKey = this.anchorKey,
          focusKey = this.focusKey,
          focusOffset = this.focusOffset,
          isBackward = this.isBackward;

      var anchorOffset = this.anchorOffset + n;
      return this.merge({
        anchorOffset: anchorOffset,
        isBackward: anchorKey == focusKey ? anchorOffset > focusOffset : isBackward
      });
    }

    /**
     * Move the anchor offset `n` characters.
     *
     * @param {Number} n (optional)
     * @return {Range}
     */

  }, {
    key: 'moveFocus',
    value: function moveFocus() {
      var n = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var anchorKey = this.anchorKey,
          anchorOffset = this.anchorOffset,
          focusKey = this.focusKey,
          isBackward = this.isBackward;

      var focusOffset = this.focusOffset + n;
      return this.merge({
        focusOffset: focusOffset,
        isBackward: focusKey == anchorKey ? anchorOffset > focusOffset : isBackward
      });
    }

    /**
     * Move the range's anchor point to a `key` and `offset`.
     *
     * @param {String} key
     * @param {Number} offset
     * @return {Range}
     */

  }, {
    key: 'moveAnchorTo',
    value: function moveAnchorTo(key, offset) {
      var anchorKey = this.anchorKey,
          focusKey = this.focusKey,
          focusOffset = this.focusOffset,
          isBackward = this.isBackward;

      return this.merge({
        anchorKey: key,
        anchorOffset: offset,
        isBackward: key == focusKey ? offset > focusOffset : key == anchorKey ? isBackward : null
      });
    }

    /**
     * Move the range's focus point to a `key` and `offset`.
     *
     * @param {String} key
     * @param {Number} offset
     * @return {Range}
     */

  }, {
    key: 'moveFocusTo',
    value: function moveFocusTo(key, offset) {
      var focusKey = this.focusKey,
          anchorKey = this.anchorKey,
          anchorOffset = this.anchorOffset,
          isBackward = this.isBackward;

      return this.merge({
        focusKey: key,
        focusOffset: offset,
        isBackward: key == anchorKey ? anchorOffset > offset : key == focusKey ? isBackward : null
      });
    }

    /**
     * Move the range to `anchorOffset`.
     *
     * @param {Number} anchorOffset
     * @return {Range}
     */

  }, {
    key: 'moveAnchorOffsetTo',
    value: function moveAnchorOffsetTo(anchorOffset) {
      return this.merge({
        anchorOffset: anchorOffset,
        isBackward: this.anchorKey == this.focusKey ? anchorOffset > this.focusOffset : this.isBackward
      });
    }

    /**
     * Move the range to `focusOffset`.
     *
     * @param {Number} focusOffset
     * @return {Range}
     */

  }, {
    key: 'moveFocusOffsetTo',
    value: function moveFocusOffsetTo(focusOffset) {
      return this.merge({
        focusOffset: focusOffset,
        isBackward: this.anchorKey == this.focusKey ? this.anchorOffset > focusOffset : this.isBackward
      });
    }

    /**
     * Move the range to `anchorOffset` and `focusOffset`.
     *
     * @param {Number} anchorOffset
     * @param {Number} focusOffset (optional)
     * @return {Range}
     */

  }, {
    key: 'moveOffsetsTo',
    value: function moveOffsetsTo(anchorOffset) {
      var focusOffset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : anchorOffset;

      return this.moveAnchorOffsetTo(anchorOffset).moveFocusOffsetTo(focusOffset);
    }

    /**
     * Move the focus point to the anchor point.
     *
     * @return {Range}
     */

  }, {
    key: 'moveToAnchor',
    value: function moveToAnchor() {
      return this.moveFocusTo(this.anchorKey, this.anchorOffset);
    }

    /**
     * Move the anchor point to the focus point.
     *
     * @return {Range}
     */

  }, {
    key: 'moveToFocus',
    value: function moveToFocus() {
      return this.moveAnchorTo(this.focusKey, this.focusOffset);
    }

    /**
     * Move the range's anchor point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveAnchorToStartOf',
    value: function moveAnchorToStartOf(node) {
      node = getFirst(node);
      return this.moveAnchorTo(node.key, 0);
    }

    /**
     * Move the range's anchor point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveAnchorToEndOf',
    value: function moveAnchorToEndOf(node) {
      node = getLast(node);
      return this.moveAnchorTo(node.key, node.text.length);
    }

    /**
     * Move the range's focus point to the start of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveFocusToStartOf',
    value: function moveFocusToStartOf(node) {
      node = getFirst(node);
      return this.moveFocusTo(node.key, 0);
    }

    /**
     * Move the range's focus point to the end of a `node`.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'moveFocusToEndOf',
    value: function moveFocusToEndOf(node) {
      node = getLast(node);
      return this.moveFocusTo(node.key, node.text.length);
    }

    /**
     * Move to the entire range of `start` and `end` nodes.
     *
     * @param {Node} start
     * @param {Node} end (optional)
     * @return {Range}
     */

  }, {
    key: 'moveToRangeOf',
    value: function moveToRangeOf(start) {
      var end = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : start;

      return this.moveAnchorToStartOf(start).moveFocusToEndOf(end);
    }

    /**
     * Normalize the range, relative to a `node`, ensuring that the anchor
     * and focus nodes of the range always refer to leaf text nodes.
     *
     * @param {Node} node
     * @return {Range}
     */

  }, {
    key: 'normalize',
    value: function normalize(node) {
      var range = this;
      var anchorKey = range.anchorKey,
          anchorOffset = range.anchorOffset,
          focusKey = range.focusKey,
          focusOffset = range.focusOffset,
          isBackward = range.isBackward;

      // If the range is unset, make sure it is properly zeroed out.

      if (anchorKey == null || focusKey == null) {
        return range.merge({
          anchorKey: null,
          anchorOffset: 0,
          focusKey: null,
          focusOffset: 0,
          isBackward: false
        });
      }

      // Get the anchor and focus nodes.
      var anchorNode = node.getDescendant(anchorKey);
      var focusNode = node.getDescendant(focusKey);

      // If the range is malformed, warn and zero it out.
      if (!anchorNode || !focusNode) {
        _slateDevLogger2.default.warn('The range was invalid and was reset. The range in question was:', range);
        var first = node.getFirstText();
        return range.merge({
          anchorKey: first ? first.key : null,
          anchorOffset: 0,
          focusKey: first ? first.key : null,
          focusOffset: 0,
          isBackward: false
        });
      }

      // If the anchor node isn't a text node, match it to one.
      if (anchorNode.kind != 'text') {
        _slateDevLogger2.default.warn('The range anchor was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:', anchorNode);
        var anchorText = anchorNode.getTextAtOffset(anchorOffset);
        var offset = anchorNode.getOffset(anchorText.key);
        anchorOffset = anchorOffset - offset;
        anchorNode = anchorText;
      }

      // If the focus node isn't a text node, match it to one.
      if (focusNode.kind != 'text') {
        _slateDevLogger2.default.warn('The range focus was set to a Node that is not a Text node. This should not happen and can degrade performance. The node in question was:', focusNode);
        var focusText = focusNode.getTextAtOffset(focusOffset);
        var _offset = focusNode.getOffset(focusText.key);
        focusOffset = focusOffset - _offset;
        focusNode = focusText;
      }

      // If `isBackward` is not set, derive it.
      if (isBackward == null) {
        if (anchorNode.key === focusNode.key) {
          isBackward = anchorOffset > focusOffset;
        } else {
          isBackward = !node.areDescendantsSorted(anchorNode.key, focusNode.key);
        }
      }

      // Merge in any updated properties.
      return range.merge({
        anchorKey: anchorNode.key,
        anchorOffset: anchorOffset,
        focusKey: focusNode.key,
        focusOffset: focusOffset,
        isBackward: isBackward
      });
    }

    /**
     * Return a JSON representation of the range.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        kind: this.kind,
        anchorKey: this.anchorKey,
        anchorOffset: this.anchorOffset,
        focusKey: this.focusKey,
        focusOffset: this.focusOffset,
        isBackward: this.isBackward,
        isFocused: this.isFocused,
        marks: this.marks == null ? null : this.marks.toArray().map(function (m) {
          return m.toJSON();
        })
      };

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS() {
      return this.toJSON();
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'range';
    }

    /**
     * Check whether the range is blurred.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlurred',
    get: function get() {
      return !this.isFocused;
    }

    /**
     * Check whether the range is collapsed.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.anchorKey == this.focusKey && this.anchorOffset == this.focusOffset;
    }

    /**
     * Check whether the range is expanded.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isExpanded',
    get: function get() {
      return !this.isCollapsed;
    }

    /**
     * Check whether the range is forward.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isForward',
    get: function get() {
      return this.isBackward == null ? null : !this.isBackward;
    }

    /**
     * Check whether the range's keys are set.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isSet',
    get: function get() {
      return this.anchorKey != null && this.focusKey != null;
    }

    /**
     * Check whether the range's keys are not set.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isUnset',
    get: function get() {
      return !this.isSet;
    }

    /**
     * Get the start key.
     *
     * @return {String}
     */

  }, {
    key: 'startKey',
    get: function get() {
      return this.isBackward ? this.focusKey : this.anchorKey;
    }

    /**
     * Get the start offset.
     *
     * @return {String}
     */

  }, {
    key: 'startOffset',
    get: function get() {
      return this.isBackward ? this.focusOffset : this.anchorOffset;
    }

    /**
     * Get the end key.
     *
     * @return {String}
     */

  }, {
    key: 'endKey',
    get: function get() {
      return this.isBackward ? this.anchorKey : this.focusKey;
    }

    /**
     * Get the end offset.
     *
     * @return {String}
     */

  }, {
    key: 'endOffset',
    get: function get() {
      return this.isBackward ? this.anchorOffset : this.focusOffset;
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Range` with `attrs`.
     *
     * @param {Object|Range} attrs
     * @return {Range}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Range.isRange(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Range.fromJSON(attrs);
      }

      throw new Error('`Range.create` only accepts objects or ranges, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Ranges` from `elements`.
     *
     * @param {Array<Range|Object>|List<Range|Object>} elements
     * @return {List<Range>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Range.create));
        return list;
      }

      throw new Error('`Range.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a dictionary of settable range properties from `attrs`.
     *
     * @param {Object|String|Range} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Range.isRange(attrs)) {
        return {
          anchorKey: attrs.anchorKey,
          anchorOffset: attrs.anchorOffset,
          focusKey: attrs.focusKey,
          focusOffset: attrs.focusOffset,
          isBackward: attrs.isBackward,
          isFocused: attrs.isFocused,
          marks: attrs.marks
        };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        var props = {};
        if ('anchorKey' in attrs) props.anchorKey = attrs.anchorKey;
        if ('anchorOffset' in attrs) props.anchorOffset = attrs.anchorOffset;
        if ('focusKey' in attrs) props.focusKey = attrs.focusKey;
        if ('focusOffset' in attrs) props.focusOffset = attrs.focusOffset;
        if ('isBackward' in attrs) props.isBackward = attrs.isBackward;
        if ('isFocused' in attrs) props.isFocused = attrs.isFocused;
        if ('marks' in attrs) props.marks = attrs.marks;
        return props;
      }

      throw new Error('`Range.createProperties` only accepts objects or ranges, but you passed it: ' + attrs);
    }

    /**
     * Create a `Range` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Range}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$anchorKey = object.anchorKey,
          anchorKey = _object$anchorKey === undefined ? null : _object$anchorKey,
          _object$anchorOffset = object.anchorOffset,
          anchorOffset = _object$anchorOffset === undefined ? 0 : _object$anchorOffset,
          _object$focusKey = object.focusKey,
          focusKey = _object$focusKey === undefined ? null : _object$focusKey,
          _object$focusOffset = object.focusOffset,
          focusOffset = _object$focusOffset === undefined ? 0 : _object$focusOffset,
          _object$isBackward = object.isBackward,
          isBackward = _object$isBackward === undefined ? null : _object$isBackward,
          _object$isFocused = object.isFocused,
          isFocused = _object$isFocused === undefined ? false : _object$isFocused,
          _object$marks = object.marks,
          marks = _object$marks === undefined ? null : _object$marks;


      var range = new Range({
        anchorKey: anchorKey,
        anchorOffset: anchorOffset,
        focusKey: focusKey,
        focusOffset: focusOffset,
        isBackward: isBackward,
        isFocused: isFocused,
        marks: marks == null ? null : new _immutable.Set(marks.map(_mark2.default.fromJSON))
      });

      return range;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isRange',


    /**
     * Check if an `obj` is a `Range`.
     *
     * @param {Any} obj
     * @return {Boolean}
     */

    value: function isRange(obj) {
      return !!(obj && obj[_modelTypes2.default.RANGE]);
    }
  }]);

  return Range;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Range.fromJS = Range.fromJSON;
Range.prototype[_modelTypes2.default.RANGE] = true;

/**
 * Mix in some "move" convenience methods.
 */

var MOVE_METHODS = [['move', ''], ['move', 'To'], ['move', 'ToStartOf'], ['move', 'ToEndOf']];

MOVE_METHODS.forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      p = _ref2[0],
      s = _ref2[1];

  Range.prototype['' + p + s] = function () {
    var _ref3;

    return (_ref3 = this[p + 'Anchor' + s].apply(this, arguments))[p + 'Focus' + s].apply(_ref3, arguments);
  };
});

/**
 * Mix in the "start", "end" and "edge" convenience methods.
 */

var EDGE_METHODS = [['has', 'AtStartOf', true], ['has', 'AtEndOf', true], ['has', 'Between', true], ['has', 'In', true], ['collapseTo', ''], ['move', ''], ['moveTo', ''], ['move', 'To'], ['move', 'OffsetTo']];

EDGE_METHODS.forEach(function (_ref4) {
  var _ref5 = _slicedToArray(_ref4, 3),
      p = _ref5[0],
      s = _ref5[1],
      hasEdge = _ref5[2];

  var anchor = p + 'Anchor' + s;
  var focus = p + 'Focus' + s;

  Range.prototype[p + 'Start' + s] = function () {
    return this.isBackward ? this[focus].apply(this, arguments) : this[anchor].apply(this, arguments);
  };

  Range.prototype[p + 'End' + s] = function () {
    return this.isBackward ? this[anchor].apply(this, arguments) : this[focus].apply(this, arguments);
  };

  if (hasEdge) {
    Range.prototype[p + 'Edge' + s] = function () {
      return this[anchor].apply(this, arguments) || this[focus].apply(this, arguments);
    };
  }
});

/**
 * Mix in some aliases for convenience / parallelism with the browser APIs.
 */

var ALIAS_METHODS = [['collapseTo', 'moveTo'], ['collapseToAnchor', 'moveToAnchor'], ['collapseToFocus', 'moveToFocus'], ['collapseToStart', 'moveToStart'], ['collapseToEnd', 'moveToEnd'], ['collapseToStartOf', 'moveToStartOf'], ['collapseToEndOf', 'moveToEndOf'], ['extend', 'moveFocus'], ['extendTo', 'moveFocusTo'], ['extendToStartOf', 'moveFocusToStartOf'], ['extendToEndOf', 'moveFocusToEndOf']];

ALIAS_METHODS.forEach(function (_ref6) {
  var _ref7 = _slicedToArray(_ref6, 2),
      alias = _ref7[0],
      method = _ref7[1];

  Range.prototype[alias] = function () {
    return this[method].apply(this, arguments);
  };
});

/**
 * Get the first text of a `node`.
 *
 * @param {Node} node
 * @return {Text}
 */

function getFirst(node) {
  return node.kind == 'text' ? node : node.getFirstText();
}

/**
 * Get the last text of a `node`.
 *
 * @param {Node} node
 * @return {Text}
 */

function getLast(node) {
  return node.kind == 'text' ? node : node.getLastText();
}

/**
 * Export.
 *
 * @type {Range}
 */

exports.default = Range;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvcmFuZ2UuanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJhbmNob3JLZXkiLCJhbmNob3JPZmZzZXQiLCJmb2N1c0tleSIsImZvY3VzT2Zmc2V0IiwiaXNCYWNrd2FyZCIsImlzRm9jdXNlZCIsIm1hcmtzIiwiUmFuZ2UiLCJub2RlIiwiZmlyc3QiLCJnZXRGaXJzdCIsImtleSIsImxhc3QiLCJnZXRMYXN0IiwidGV4dCIsImxlbmd0aCIsInN0YXJ0IiwiZW5kIiwiaGFzQW5jaG9ySW4iLCJraW5kIiwiaGFzRGVzY2VuZGFudCIsImhhc0ZvY3VzSW4iLCJpc0NvbGxhcHNlZCIsImhhc0FuY2hvckF0U3RhcnRPZiIsImhhc0FuY2hvckF0RW5kT2YiLCJtZXJnZSIsIm4iLCJvZmZzZXQiLCJtb3ZlQW5jaG9yT2Zmc2V0VG8iLCJtb3ZlRm9jdXNPZmZzZXRUbyIsIm1vdmVGb2N1c1RvIiwibW92ZUFuY2hvclRvIiwibW92ZUFuY2hvclRvU3RhcnRPZiIsIm1vdmVGb2N1c1RvRW5kT2YiLCJyYW5nZSIsImFuY2hvck5vZGUiLCJnZXREZXNjZW5kYW50IiwiZm9jdXNOb2RlIiwid2FybiIsImdldEZpcnN0VGV4dCIsImFuY2hvclRleHQiLCJnZXRUZXh0QXRPZmZzZXQiLCJnZXRPZmZzZXQiLCJmb2N1c1RleHQiLCJhcmVEZXNjZW5kYW50c1NvcnRlZCIsIm9iamVjdCIsInRvQXJyYXkiLCJtYXAiLCJtIiwidG9KU09OIiwiaXNTZXQiLCJhdHRycyIsImlzUmFuZ2UiLCJmcm9tSlNPTiIsIkVycm9yIiwiZWxlbWVudHMiLCJpc0xpc3QiLCJBcnJheSIsImlzQXJyYXkiLCJsaXN0IiwiY3JlYXRlIiwicHJvcHMiLCJvYmoiLCJSQU5HRSIsImZyb21KUyIsInByb3RvdHlwZSIsIk1PVkVfTUVUSE9EUyIsImZvckVhY2giLCJwIiwicyIsIkVER0VfTUVUSE9EUyIsImhhc0VkZ2UiLCJhbmNob3IiLCJmb2N1cyIsIkFMSUFTX01FVEhPRFMi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RCxFQUFxQixjQUFyQixDQUZvQixFQUdwQixDQUFDLGlCQUFELEVBQW9CLGFBQXBCLENBSG9CLEVBSXBCLENBQUMsaUJBQUQsRUFBb0IsYUFBcEIsQ0FKb0IsRUFLcEIsQ0FBQyxlQUFELEVBQWtCLFdBQWxCLENBTG9CLEVBTXBCLENBQUMsbUJBQUQsRUFBc0IsZUFBdEIsQ0FOb0IsRUFPcEIsQ0FBQyxpQkFBRCxFQUFvQixhQUFwQixDQVBvQixFQVFwQixDQUFDLFFBQUQsRUFBVyxXQUFYLENBUm9CLEVBU3BCLENBQUMsVUFBRCxFQUFhLGFBQWIsQ0FUb0IsRUFVcEIsQ0FBQyxpQkFBRCxFQUFvQixvQkFBcEIsQ0FWb0IsRUFXcEIsQ0FBQyxlQUFELEVBQWtCLGtCQUFsQixDQVhvQixDQUF0Qjs7QUFjQUEsY0FBY1AsT0FBZCxDQUFzQixpQkFBdUI7QUFBQTtBQUFBLE1BQXBCUSxLQUFvQjtBQUFBLE1BQWJDLE1BQWE7O0FBQzNDckUsUUFBTTBELFNBQU4sQ0FBZ0JVLEtBQWhCLElBQXlCLFlBQW1CO0FBQzFDLFdBQU8sS0FBS0MsTUFBTCx3QkFBUDtBQUNELEdBRkQ7QUFHRCxDQUpEOztBQU1BOzs7Ozs7O0FBT0EsU0FBU2xFLFFBQVQsQ0FBa0JGLElBQWxCLEVBQXdCO0FBQ3RCLFNBQU9BLEtBQUtXLElBQUwsSUFBYSxNQUFiLEdBQXNCWCxJQUF0QixHQUE2QkEsS0FBSytCLFlBQUwsRUFBcEM7QUFDRDs7QUFFRDs7Ozs7OztBQU9BLFNBQVMxQixPQUFULENBQWlCTCxJQUFqQixFQUF1QjtBQUNyQixTQUFPQSxLQUFLVyxJQUFMLElBQWEsTUFBYixHQUFzQlgsSUFBdEIsR0FBNkJBLEtBQUtxRSxXQUFMLEVBQXBDO0FBQ0Q7O0FBRUQ7Ozs7OztrQkFNZXRFLEsiLCJmaWxlIjoicmFuZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCBsb2dnZXIgZnJvbSAnc2xhdGUtZGV2LWxvZ2dlcidcbmltcG9ydCB7IExpc3QsIFJlY29yZCwgU2V0IH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IE1hcmsgZnJvbSAnLi9tYXJrJ1xuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICBhbmNob3JLZXk6IG51bGwsXG4gIGFuY2hvck9mZnNldDogMCxcbiAgZm9jdXNLZXk6IG51bGwsXG4gIGZvY3VzT2Zmc2V0OiAwLFxuICBpc0JhY2t3YXJkOiBudWxsLFxuICBpc0ZvY3VzZWQ6IGZhbHNlLFxuICBtYXJrczogbnVsbCxcbn1cblxuLyoqXG4gKiBSYW5nZS5cbiAqXG4gKiBAdHlwZSB7UmFuZ2V9XG4gKi9cblxuY2xhc3MgUmFuZ2UgZXh0ZW5kcyBSZWNvcmQoREVGQVVMVFMpIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBSYW5nZWAgd2l0aCBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxSYW5nZX0gYXR0cnNcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSkge1xuICAgIGlmIChSYW5nZS5pc1JhbmdlKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzXG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gUmFuZ2UuZnJvbUpTT04oYXR0cnMpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBSYW5nZS5jcmVhdGVcXGAgb25seSBhY2NlcHRzIG9iamVjdHMgb3IgcmFuZ2VzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpc3Qgb2YgYFJhbmdlc2AgZnJvbSBgZWxlbWVudHNgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5PFJhbmdlfE9iamVjdD58TGlzdDxSYW5nZXxPYmplY3Q+fSBlbGVtZW50c1xuICAgKiBAcmV0dXJuIHtMaXN0PFJhbmdlPn1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZUxpc3QoZWxlbWVudHMgPSBbXSkge1xuICAgIGlmIChMaXN0LmlzTGlzdChlbGVtZW50cykgfHwgQXJyYXkuaXNBcnJheShlbGVtZW50cykpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBuZXcgTGlzdChlbGVtZW50cy5tYXAoUmFuZ2UuY3JlYXRlKSlcbiAgICAgIHJldHVybiBsaXN0XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBSYW5nZS5jcmVhdGVMaXN0XFxgIG9ubHkgYWNjZXB0cyBhcnJheXMgb3IgbGlzdHMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2VsZW1lbnRzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgZGljdGlvbmFyeSBvZiBzZXR0YWJsZSByYW5nZSBwcm9wZXJ0aWVzIGZyb20gYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8U3RyaW5nfFJhbmdlfSBhdHRyc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGVQcm9wZXJ0aWVzKGF0dHJzID0ge30pIHtcbiAgICBpZiAoUmFuZ2UuaXNSYW5nZShhdHRycykpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGFuY2hvcktleTogYXR0cnMuYW5jaG9yS2V5LFxuICAgICAgICBhbmNob3JPZmZzZXQ6IGF0dHJzLmFuY2hvck9mZnNldCxcbiAgICAgICAgZm9jdXNLZXk6IGF0dHJzLmZvY3VzS2V5LFxuICAgICAgICBmb2N1c09mZnNldDogYXR0cnMuZm9jdXNPZmZzZXQsXG4gICAgICAgIGlzQmFja3dhcmQ6IGF0dHJzLmlzQmFja3dhcmQsXG4gICAgICAgIGlzRm9jdXNlZDogYXR0cnMuaXNGb2N1c2VkLFxuICAgICAgICBtYXJrczogYXR0cnMubWFya3MsXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICBjb25zdCBwcm9wcyA9IHt9XG4gICAgICBpZiAoJ2FuY2hvcktleScgaW4gYXR0cnMpIHByb3BzLmFuY2hvcktleSA9IGF0dHJzLmFuY2hvcktleVxuICAgICAgaWYgKCdhbmNob3JPZmZzZXQnIGluIGF0dHJzKSBwcm9wcy5hbmNob3JPZmZzZXQgPSBhdHRycy5hbmNob3JPZmZzZXRcbiAgICAgIGlmICgnZm9jdXNLZXknIGluIGF0dHJzKSBwcm9wcy5mb2N1c0tleSA9IGF0dHJzLmZvY3VzS2V5XG4gICAgICBpZiAoJ2ZvY3VzT2Zmc2V0JyBpbiBhdHRycykgcHJvcHMuZm9jdXNPZmZzZXQgPSBhdHRycy5mb2N1c09mZnNldFxuICAgICAgaWYgKCdpc0JhY2t3YXJkJyBpbiBhdHRycykgcHJvcHMuaXNCYWNrd2FyZCA9IGF0dHJzLmlzQmFja3dhcmRcbiAgICAgIGlmICgnaXNGb2N1c2VkJyBpbiBhdHRycykgcHJvcHMuaXNGb2N1c2VkID0gYXR0cnMuaXNGb2N1c2VkXG4gICAgICBpZiAoJ21hcmtzJyBpbiBhdHRycykgcHJvcHMubWFya3MgPSBhdHRycy5tYXJrc1xuICAgICAgcmV0dXJuIHByb3BzXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBSYW5nZS5jcmVhdGVQcm9wZXJ0aWVzXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzIG9yIHJhbmdlcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgUmFuZ2VgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTT04ob2JqZWN0KSB7XG4gICAgY29uc3Qge1xuICAgICAgYW5jaG9yS2V5ID0gbnVsbCxcbiAgICAgIGFuY2hvck9mZnNldCA9IDAsXG4gICAgICBmb2N1c0tleSA9IG51bGwsXG4gICAgICBmb2N1c09mZnNldCA9IDAsXG4gICAgICBpc0JhY2t3YXJkID0gbnVsbCxcbiAgICAgIGlzRm9jdXNlZCA9IGZhbHNlLFxuICAgICAgbWFya3MgPSBudWxsLFxuICAgIH0gPSBvYmplY3RcblxuICAgIGNvbnN0IHJhbmdlID0gbmV3IFJhbmdlKHtcbiAgICAgIGFuY2hvcktleSxcbiAgICAgIGFuY2hvck9mZnNldCxcbiAgICAgIGZvY3VzS2V5LFxuICAgICAgZm9jdXNPZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkLFxuICAgICAgaXNGb2N1c2VkLFxuICAgICAgbWFya3M6IG1hcmtzID09IG51bGwgPyBudWxsIDogbmV3IFNldChtYXJrcy5tYXAoTWFyay5mcm9tSlNPTikpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gcmFuZ2VcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgZnJvbUpTYC5cbiAgICovXG5cbiAgc3RhdGljIGZyb21KUyA9IFJhbmdlLmZyb21KU09OXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGFuIGBvYmpgIGlzIGEgYFJhbmdlYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IG9ialxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNSYW5nZShvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9ialtNT0RFTF9UWVBFUy5SQU5HRV0pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBraW5kLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBraW5kKCkge1xuICAgIHJldHVybiAncmFuZ2UnXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgcmFuZ2UgaXMgYmx1cnJlZC5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzQmx1cnJlZCgpIHtcbiAgICByZXR1cm4gIXRoaXMuaXNGb2N1c2VkXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgcmFuZ2UgaXMgY29sbGFwc2VkLlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNDb2xsYXBzZWQoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHRoaXMuYW5jaG9yS2V5ID09IHRoaXMuZm9jdXNLZXkgJiZcbiAgICAgIHRoaXMuYW5jaG9yT2Zmc2V0ID09IHRoaXMuZm9jdXNPZmZzZXRcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgcmFuZ2UgaXMgZXhwYW5kZWQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0V4cGFuZGVkKCkge1xuICAgIHJldHVybiAhdGhpcy5pc0NvbGxhcHNlZFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHJhbmdlIGlzIGZvcndhcmQuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0ZvcndhcmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNCYWNrd2FyZCA9PSBudWxsID8gbnVsbCA6ICF0aGlzLmlzQmFja3dhcmRcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSByYW5nZSdzIGtleXMgYXJlIHNldC5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzU2V0KCkge1xuICAgIHJldHVybiB0aGlzLmFuY2hvcktleSAhPSBudWxsICYmIHRoaXMuZm9jdXNLZXkgIT0gbnVsbFxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHJhbmdlJ3Mga2V5cyBhcmUgbm90IHNldC5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzVW5zZXQoKSB7XG4gICAgcmV0dXJuICF0aGlzLmlzU2V0XG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBzdGFydCBrZXkuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IHN0YXJ0S2V5KCkge1xuICAgIHJldHVybiB0aGlzLmlzQmFja3dhcmQgPyB0aGlzLmZvY3VzS2V5IDogdGhpcy5hbmNob3JLZXlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIHN0YXJ0IG9mZnNldC5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQgc3RhcnRPZmZzZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNCYWNrd2FyZCA/IHRoaXMuZm9jdXNPZmZzZXQgOiB0aGlzLmFuY2hvck9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgZW5kIGtleS5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQgZW5kS2V5KCkge1xuICAgIHJldHVybiB0aGlzLmlzQmFja3dhcmQgPyB0aGlzLmFuY2hvcktleSA6IHRoaXMuZm9jdXNLZXlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVuZCBvZmZzZXQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGVuZE9mZnNldCgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0JhY2t3YXJkID8gdGhpcy5hbmNob3JPZmZzZXQgOiB0aGlzLmZvY3VzT2Zmc2V0XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhbmNob3IgcG9pbnQgb2YgdGhlIHJhbmdlIGlzIGF0IHRoZSBzdGFydCBvZiBhIGBub2RlYC5cbiAgICpcbiAgICogQHBhcmFtIHtOb2RlfSBub2RlXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGhhc0FuY2hvckF0U3RhcnRPZihub2RlKSB7XG4gICAgLy8gUEVSRjogRG8gYSBjaGVjayBmb3IgYSBgMGAgb2Zmc2V0IGZpcnN0IHNpbmNlIGl0J3MgcXVpY2tlc3QuXG4gICAgaWYgKHRoaXMuYW5jaG9yT2Zmc2V0ICE9IDApIHJldHVybiBmYWxzZVxuICAgIGNvbnN0IGZpcnN0ID0gZ2V0Rmlyc3Qobm9kZSlcbiAgICByZXR1cm4gdGhpcy5hbmNob3JLZXkgPT0gZmlyc3Qua2V5XG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBhbmNob3IgcG9pbnQgb2YgdGhlIHJhbmdlIGlzIGF0IHRoZSBlbmQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNBbmNob3JBdEVuZE9mKG5vZGUpIHtcbiAgICBjb25zdCBsYXN0ID0gZ2V0TGFzdChub2RlKVxuICAgIHJldHVybiB0aGlzLmFuY2hvcktleSA9PSBsYXN0LmtleSAmJiB0aGlzLmFuY2hvck9mZnNldCA9PSBsYXN0LnRleHQubGVuZ3RoXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgYW5jaG9yIGVkZ2Ugb2YgYSByYW5nZSBpcyBpbiBhIGBub2RlYCBhbmQgYXQgYW5cbiAgICogb2Zmc2V0IGJldHdlZW4gYHN0YXJ0YCBhbmQgYGVuZGAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcGFyYW0ge051bWJlcn0gc3RhcnRcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGVuZFxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNBbmNob3JCZXR3ZWVuKG5vZGUsIHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgdGhpcy5hbmNob3JPZmZzZXQgPD0gZW5kICYmXG4gICAgICBzdGFydCA8PSB0aGlzLmFuY2hvck9mZnNldCAmJlxuICAgICAgdGhpcy5oYXNBbmNob3JJbihub2RlKVxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBhbmNob3IgZWRnZSBvZiBhIHJhbmdlIGlzIGluIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzQW5jaG9ySW4obm9kZSkge1xuICAgIHJldHVybiBub2RlLmtpbmQgPT0gJ3RleHQnXG4gICAgICA/IG5vZGUua2V5ID09IHRoaXMuYW5jaG9yS2V5XG4gICAgICA6IHRoaXMuYW5jaG9yS2V5ICE9IG51bGwgJiYgbm9kZS5oYXNEZXNjZW5kYW50KHRoaXMuYW5jaG9yS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgZm9jdXMgcG9pbnQgb2YgdGhlIHJhbmdlIGlzIGF0IHRoZSBlbmQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNGb2N1c0F0RW5kT2Yobm9kZSkge1xuICAgIGNvbnN0IGxhc3QgPSBnZXRMYXN0KG5vZGUpXG4gICAgcmV0dXJuIHRoaXMuZm9jdXNLZXkgPT0gbGFzdC5rZXkgJiYgdGhpcy5mb2N1c09mZnNldCA9PSBsYXN0LnRleHQubGVuZ3RoXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciBmb2N1cyBwb2ludCBvZiB0aGUgcmFuZ2UgaXMgYXQgdGhlIHN0YXJ0IG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzRm9jdXNBdFN0YXJ0T2Yobm9kZSkge1xuICAgIGlmICh0aGlzLmZvY3VzT2Zmc2V0ICE9IDApIHJldHVybiBmYWxzZVxuICAgIGNvbnN0IGZpcnN0ID0gZ2V0Rmlyc3Qobm9kZSlcbiAgICByZXR1cm4gdGhpcy5mb2N1c0tleSA9PSBmaXJzdC5rZXlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBmb2N1cyBlZGdlIG9mIGEgcmFuZ2UgaXMgaW4gYSBgbm9kZWAgYW5kIGF0IGFuXG4gICAqIG9mZnNldCBiZXR3ZWVuIGBzdGFydGAgYW5kIGBlbmRgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IHN0YXJ0XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBlbmRcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaGFzRm9jdXNCZXR3ZWVuKG5vZGUsIHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gKFxuICAgICAgc3RhcnQgPD0gdGhpcy5mb2N1c09mZnNldCAmJlxuICAgICAgdGhpcy5mb2N1c09mZnNldCA8PSBlbmQgJiZcbiAgICAgIHRoaXMuaGFzRm9jdXNJbihub2RlKVxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSBmb2N1cyBlZGdlIG9mIGEgcmFuZ2UgaXMgaW4gYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBoYXNGb2N1c0luKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5raW5kID09ICd0ZXh0J1xuICAgICAgPyBub2RlLmtleSA9PSB0aGlzLmZvY3VzS2V5XG4gICAgICA6IHRoaXMuZm9jdXNLZXkgIT0gbnVsbCAmJiBub2RlLmhhc0Rlc2NlbmRhbnQodGhpcy5mb2N1c0tleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSByYW5nZSBpcyBhdCB0aGUgc3RhcnQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBpc0F0U3RhcnRPZihub2RlKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNDb2xsYXBzZWQgJiYgdGhpcy5oYXNBbmNob3JBdFN0YXJ0T2Yobm9kZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayB3aGV0aGVyIHRoZSByYW5nZSBpcyBhdCB0aGUgZW5kIG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaXNBdEVuZE9mKG5vZGUpIHtcbiAgICByZXR1cm4gdGhpcy5pc0NvbGxhcHNlZCAmJiB0aGlzLmhhc0FuY2hvckF0RW5kT2Yobm9kZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBGb2N1cyB0aGUgcmFuZ2UuXG4gICAqXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBmb2N1cygpIHtcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBpc0ZvY3VzZWQ6IHRydWVcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEJsdXIgdGhlIHJhbmdlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgYmx1cigpIHtcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBpc0ZvY3VzZWQ6IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBVbnNldCB0aGUgcmFuZ2UuXG4gICAqXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBkZXNlbGVjdCgpIHtcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBhbmNob3JLZXk6IG51bGwsXG4gICAgICBhbmNob3JPZmZzZXQ6IDAsXG4gICAgICBmb2N1c0tleTogbnVsbCxcbiAgICAgIGZvY3VzT2Zmc2V0OiAwLFxuICAgICAgaXNGb2N1c2VkOiBmYWxzZSxcbiAgICAgIGlzQmFja3dhcmQ6IGZhbHNlXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBGbGlwIHRoZSByYW5nZS5cbiAgICpcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIGZsaXAoKSB7XG4gICAgcmV0dXJuIHRoaXMubWVyZ2Uoe1xuICAgICAgYW5jaG9yS2V5OiB0aGlzLmZvY3VzS2V5LFxuICAgICAgYW5jaG9yT2Zmc2V0OiB0aGlzLmZvY3VzT2Zmc2V0LFxuICAgICAgZm9jdXNLZXk6IHRoaXMuYW5jaG9yS2V5LFxuICAgICAgZm9jdXNPZmZzZXQ6IHRoaXMuYW5jaG9yT2Zmc2V0LFxuICAgICAgaXNCYWNrd2FyZDogdGhpcy5pc0JhY2t3YXJkID09IG51bGwgPyBudWxsIDogIXRoaXMuaXNCYWNrd2FyZCxcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIGFuY2hvciBvZmZzZXQgYG5gIGNoYXJhY3RlcnMuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBuIChvcHRpb25hbClcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVBbmNob3IobiA9IDEpIHtcbiAgICBjb25zdCB7IGFuY2hvcktleSwgZm9jdXNLZXksIGZvY3VzT2Zmc2V0LCBpc0JhY2t3YXJkIH0gPSB0aGlzXG4gICAgY29uc3QgYW5jaG9yT2Zmc2V0ID0gdGhpcy5hbmNob3JPZmZzZXQgKyBuXG4gICAgcmV0dXJuIHRoaXMubWVyZ2Uoe1xuICAgICAgYW5jaG9yT2Zmc2V0LFxuICAgICAgaXNCYWNrd2FyZDogYW5jaG9yS2V5ID09IGZvY3VzS2V5XG4gICAgICAgID8gYW5jaG9yT2Zmc2V0ID4gZm9jdXNPZmZzZXRcbiAgICAgICAgOiBpc0JhY2t3YXJkXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSBhbmNob3Igb2Zmc2V0IGBuYCBjaGFyYWN0ZXJzLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gbiAob3B0aW9uYWwpXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlRm9jdXMobiA9IDEpIHtcbiAgICBjb25zdCB7IGFuY2hvcktleSwgYW5jaG9yT2Zmc2V0LCBmb2N1c0tleSwgaXNCYWNrd2FyZCB9ID0gdGhpc1xuICAgIGNvbnN0IGZvY3VzT2Zmc2V0ID0gdGhpcy5mb2N1c09mZnNldCArIG5cbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBmb2N1c09mZnNldCxcbiAgICAgIGlzQmFja3dhcmQ6IGZvY3VzS2V5ID09IGFuY2hvcktleVxuICAgICAgICA/IGFuY2hvck9mZnNldCA+IGZvY3VzT2Zmc2V0XG4gICAgICAgIDogaXNCYWNrd2FyZFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgcmFuZ2UncyBhbmNob3IgcG9pbnQgdG8gYSBga2V5YCBhbmQgYG9mZnNldGAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldFxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZUFuY2hvclRvKGtleSwgb2Zmc2V0KSB7XG4gICAgY29uc3QgeyBhbmNob3JLZXksIGZvY3VzS2V5LCBmb2N1c09mZnNldCwgaXNCYWNrd2FyZCB9ID0gdGhpc1xuICAgIHJldHVybiB0aGlzLm1lcmdlKHtcbiAgICAgIGFuY2hvcktleToga2V5LFxuICAgICAgYW5jaG9yT2Zmc2V0OiBvZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkOiBrZXkgPT0gZm9jdXNLZXlcbiAgICAgICAgPyBvZmZzZXQgPiBmb2N1c09mZnNldFxuICAgICAgICA6IGtleSA9PSBhbmNob3JLZXkgPyBpc0JhY2t3YXJkIDogbnVsbFxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgcmFuZ2UncyBmb2N1cyBwb2ludCB0byBhIGBrZXlgIGFuZCBgb2Zmc2V0YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0XG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlRm9jdXNUbyhrZXksIG9mZnNldCkge1xuICAgIGNvbnN0IHsgZm9jdXNLZXksIGFuY2hvcktleSwgYW5jaG9yT2Zmc2V0LCBpc0JhY2t3YXJkIH0gPSB0aGlzXG4gICAgcmV0dXJuIHRoaXMubWVyZ2Uoe1xuICAgICAgZm9jdXNLZXk6IGtleSxcbiAgICAgIGZvY3VzT2Zmc2V0OiBvZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkOiBrZXkgPT0gYW5jaG9yS2V5XG4gICAgICAgID8gYW5jaG9yT2Zmc2V0ID4gb2Zmc2V0XG4gICAgICAgIDoga2V5ID09IGZvY3VzS2V5ID8gaXNCYWNrd2FyZCA6IG51bGxcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIHJhbmdlIHRvIGBhbmNob3JPZmZzZXRgLlxuICAgKlxuICAgKiBAcGFyYW0ge051bWJlcn0gYW5jaG9yT2Zmc2V0XG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlQW5jaG9yT2Zmc2V0VG8oYW5jaG9yT2Zmc2V0KSB7XG4gICAgcmV0dXJuIHRoaXMubWVyZ2Uoe1xuICAgICAgYW5jaG9yT2Zmc2V0LFxuICAgICAgaXNCYWNrd2FyZDogdGhpcy5hbmNob3JLZXkgPT0gdGhpcy5mb2N1c0tleVxuICAgICAgICA/IGFuY2hvck9mZnNldCA+IHRoaXMuZm9jdXNPZmZzZXRcbiAgICAgICAgOiB0aGlzLmlzQmFja3dhcmRcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIHJhbmdlIHRvIGBmb2N1c09mZnNldGAuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBmb2N1c09mZnNldFxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZUZvY3VzT2Zmc2V0VG8oZm9jdXNPZmZzZXQpIHtcbiAgICByZXR1cm4gdGhpcy5tZXJnZSh7XG4gICAgICBmb2N1c09mZnNldCxcbiAgICAgIGlzQmFja3dhcmQ6IHRoaXMuYW5jaG9yS2V5ID09IHRoaXMuZm9jdXNLZXlcbiAgICAgICAgPyB0aGlzLmFuY2hvck9mZnNldCA+IGZvY3VzT2Zmc2V0XG4gICAgICAgIDogdGhpcy5pc0JhY2t3YXJkXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSByYW5nZSB0byBgYW5jaG9yT2Zmc2V0YCBhbmQgYGZvY3VzT2Zmc2V0YC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGFuY2hvck9mZnNldFxuICAgKiBAcGFyYW0ge051bWJlcn0gZm9jdXNPZmZzZXQgKG9wdGlvbmFsKVxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZU9mZnNldHNUbyhhbmNob3JPZmZzZXQsIGZvY3VzT2Zmc2V0ID0gYW5jaG9yT2Zmc2V0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgICAgIC5tb3ZlQW5jaG9yT2Zmc2V0VG8oYW5jaG9yT2Zmc2V0KVxuICAgICAgLm1vdmVGb2N1c09mZnNldFRvKGZvY3VzT2Zmc2V0KVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIGZvY3VzIHBvaW50IHRvIHRoZSBhbmNob3IgcG9pbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlVG9BbmNob3IoKSB7XG4gICAgcmV0dXJuIHRoaXMubW92ZUZvY3VzVG8odGhpcy5hbmNob3JLZXksIHRoaXMuYW5jaG9yT2Zmc2V0KVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIGFuY2hvciBwb2ludCB0byB0aGUgZm9jdXMgcG9pbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge1JhbmdlfVxuICAgKi9cblxuICBtb3ZlVG9Gb2N1cygpIHtcbiAgICByZXR1cm4gdGhpcy5tb3ZlQW5jaG9yVG8odGhpcy5mb2N1c0tleSwgdGhpcy5mb2N1c09mZnNldClcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlIHRoZSByYW5nZSdzIGFuY2hvciBwb2ludCB0byB0aGUgc3RhcnQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZUFuY2hvclRvU3RhcnRPZihub2RlKSB7XG4gICAgbm9kZSA9IGdldEZpcnN0KG5vZGUpXG4gICAgcmV0dXJuIHRoaXMubW92ZUFuY2hvclRvKG5vZGUua2V5LCAwKVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIHJhbmdlJ3MgYW5jaG9yIHBvaW50IHRvIHRoZSBlbmQgb2YgYSBgbm9kZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICAgKiBAcmV0dXJuIHtSYW5nZX1cbiAgICovXG5cbiAgbW92ZUFuY2hvclRvRW5kT2Yobm9kZSkge1xuICAgIG5vZGUgPSBnZXRMYXN0KG5vZGUpXG4gICAgcmV0dXJuIHRoaXMubW92ZUFuY2hvclRvKG5vZGUua2V5LCBub2RlLnRleHQubGVuZ3RoKVxuICB9XG5cbiAgLyoqXG4gICAqIE1vdmUgdGhlIHJhbmdlJ3MgZm9jdXMgcG9pbnQgdG8gdGhlIHN0YXJ0IG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVGb2N1c1RvU3RhcnRPZihub2RlKSB7XG4gICAgbm9kZSA9IGdldEZpcnN0KG5vZGUpXG4gICAgcmV0dXJuIHRoaXMubW92ZUZvY3VzVG8obm9kZS5rZXksIDApXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0aGUgcmFuZ2UncyBmb2N1cyBwb2ludCB0byB0aGUgZW5kIG9mIGEgYG5vZGVgLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVGb2N1c1RvRW5kT2Yobm9kZSkge1xuICAgIG5vZGUgPSBnZXRMYXN0KG5vZGUpXG4gICAgcmV0dXJuIHRoaXMubW92ZUZvY3VzVG8obm9kZS5rZXksIG5vZGUudGV4dC5sZW5ndGgpXG4gIH1cblxuICAvKipcbiAgICogTW92ZSB0byB0aGUgZW50aXJlIHJhbmdlIG9mIGBzdGFydGAgYW5kIGBlbmRgIG5vZGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IHN0YXJ0XG4gICAqIEBwYXJhbSB7Tm9kZX0gZW5kIChvcHRpb25hbClcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG1vdmVUb1JhbmdlT2Yoc3RhcnQsIGVuZCA9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgICAgIC5tb3ZlQW5jaG9yVG9TdGFydE9mKHN0YXJ0KVxuICAgICAgLm1vdmVGb2N1c1RvRW5kT2YoZW5kKVxuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZSB0aGUgcmFuZ2UsIHJlbGF0aXZlIHRvIGEgYG5vZGVgLCBlbnN1cmluZyB0aGF0IHRoZSBhbmNob3JcbiAgICogYW5kIGZvY3VzIG5vZGVzIG9mIHRoZSByYW5nZSBhbHdheXMgcmVmZXIgdG8gbGVhZiB0ZXh0IG5vZGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7UmFuZ2V9XG4gICAqL1xuXG4gIG5vcm1hbGl6ZShub2RlKSB7XG4gICAgY29uc3QgcmFuZ2UgPSB0aGlzXG4gICAgbGV0IHsgYW5jaG9yS2V5LCBhbmNob3JPZmZzZXQsIGZvY3VzS2V5LCBmb2N1c09mZnNldCwgaXNCYWNrd2FyZCB9ID0gcmFuZ2VcblxuICAgIC8vIElmIHRoZSByYW5nZSBpcyB1bnNldCwgbWFrZSBzdXJlIGl0IGlzIHByb3Blcmx5IHplcm9lZCBvdXQuXG4gICAgaWYgKGFuY2hvcktleSA9PSBudWxsIHx8IGZvY3VzS2V5ID09IG51bGwpIHtcbiAgICAgIHJldHVybiByYW5nZS5tZXJnZSh7XG4gICAgICAgIGFuY2hvcktleTogbnVsbCxcbiAgICAgICAgYW5jaG9yT2Zmc2V0OiAwLFxuICAgICAgICBmb2N1c0tleTogbnVsbCxcbiAgICAgICAgZm9jdXNPZmZzZXQ6IDAsXG4gICAgICAgIGlzQmFja3dhcmQ6IGZhbHNlLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBHZXQgdGhlIGFuY2hvciBhbmQgZm9jdXMgbm9kZXMuXG4gICAgbGV0IGFuY2hvck5vZGUgPSBub2RlLmdldERlc2NlbmRhbnQoYW5jaG9yS2V5KVxuICAgIGxldCBmb2N1c05vZGUgPSBub2RlLmdldERlc2NlbmRhbnQoZm9jdXNLZXkpXG5cbiAgICAvLyBJZiB0aGUgcmFuZ2UgaXMgbWFsZm9ybWVkLCB3YXJuIGFuZCB6ZXJvIGl0IG91dC5cbiAgICBpZiAoIWFuY2hvck5vZGUgfHwgIWZvY3VzTm9kZSkge1xuICAgICAgbG9nZ2VyLndhcm4oJ1RoZSByYW5nZSB3YXMgaW52YWxpZCBhbmQgd2FzIHJlc2V0LiBUaGUgcmFuZ2UgaW4gcXVlc3Rpb24gd2FzOicsIHJhbmdlKVxuICAgICAgY29uc3QgZmlyc3QgPSBub2RlLmdldEZpcnN0VGV4dCgpXG4gICAgICByZXR1cm4gcmFuZ2UubWVyZ2Uoe1xuICAgICAgICBhbmNob3JLZXk6IGZpcnN0ID8gZmlyc3Qua2V5IDogbnVsbCxcbiAgICAgICAgYW5jaG9yT2Zmc2V0OiAwLFxuICAgICAgICBmb2N1c0tleTogZmlyc3QgPyBmaXJzdC5rZXkgOiBudWxsLFxuICAgICAgICBmb2N1c09mZnNldDogMCxcbiAgICAgICAgaXNCYWNrd2FyZDogZmFsc2UsXG4gICAgICB9KVxuICAgIH1cblxuICAgIC8vIElmIHRoZSBhbmNob3Igbm9kZSBpc24ndCBhIHRleHQgbm9kZSwgbWF0Y2ggaXQgdG8gb25lLlxuICAgIGlmIChhbmNob3JOb2RlLmtpbmQgIT0gJ3RleHQnKSB7XG4gICAgICBsb2dnZXIud2FybignVGhlIHJhbmdlIGFuY2hvciB3YXMgc2V0IHRvIGEgTm9kZSB0aGF0IGlzIG5vdCBhIFRleHQgbm9kZS4gVGhpcyBzaG91bGQgbm90IGhhcHBlbiBhbmQgY2FuIGRlZ3JhZGUgcGVyZm9ybWFuY2UuIFRoZSBub2RlIGluIHF1ZXN0aW9uIHdhczonLCBhbmNob3JOb2RlKVxuICAgICAgY29uc3QgYW5jaG9yVGV4dCA9IGFuY2hvck5vZGUuZ2V0VGV4dEF0T2Zmc2V0KGFuY2hvck9mZnNldClcbiAgICAgIGNvbnN0IG9mZnNldCA9IGFuY2hvck5vZGUuZ2V0T2Zmc2V0KGFuY2hvclRleHQua2V5KVxuICAgICAgYW5jaG9yT2Zmc2V0ID0gYW5jaG9yT2Zmc2V0IC0gb2Zmc2V0XG4gICAgICBhbmNob3JOb2RlID0gYW5jaG9yVGV4dFxuICAgIH1cblxuICAgIC8vIElmIHRoZSBmb2N1cyBub2RlIGlzbid0IGEgdGV4dCBub2RlLCBtYXRjaCBpdCB0byBvbmUuXG4gICAgaWYgKGZvY3VzTm9kZS5raW5kICE9ICd0ZXh0Jykge1xuICAgICAgbG9nZ2VyLndhcm4oJ1RoZSByYW5nZSBmb2N1cyB3YXMgc2V0IHRvIGEgTm9kZSB0aGF0IGlzIG5vdCBhIFRleHQgbm9kZS4gVGhpcyBzaG91bGQgbm90IGhhcHBlbiBhbmQgY2FuIGRlZ3JhZGUgcGVyZm9ybWFuY2UuIFRoZSBub2RlIGluIHF1ZXN0aW9uIHdhczonLCBmb2N1c05vZGUpXG4gICAgICBjb25zdCBmb2N1c1RleHQgPSBmb2N1c05vZGUuZ2V0VGV4dEF0T2Zmc2V0KGZvY3VzT2Zmc2V0KVxuICAgICAgY29uc3Qgb2Zmc2V0ID0gZm9jdXNOb2RlLmdldE9mZnNldChmb2N1c1RleHQua2V5KVxuICAgICAgZm9jdXNPZmZzZXQgPSBmb2N1c09mZnNldCAtIG9mZnNldFxuICAgICAgZm9jdXNOb2RlID0gZm9jdXNUZXh0XG4gICAgfVxuXG4gICAgLy8gSWYgYGlzQmFja3dhcmRgIGlzIG5vdCBzZXQsIGRlcml2ZSBpdC5cbiAgICBpZiAoaXNCYWNrd2FyZCA9PSBudWxsKSB7XG4gICAgICBpZiAoYW5jaG9yTm9kZS5rZXkgPT09IGZvY3VzTm9kZS5rZXkpIHtcbiAgICAgICAgaXNCYWNrd2FyZCA9IGFuY2hvck9mZnNldCA+IGZvY3VzT2Zmc2V0XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0JhY2t3YXJkID0gIW5vZGUuYXJlRGVzY2VuZGFudHNTb3J0ZWQoYW5jaG9yTm9kZS5rZXksIGZvY3VzTm9kZS5rZXkpXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWVyZ2UgaW4gYW55IHVwZGF0ZWQgcHJvcGVydGllcy5cbiAgICByZXR1cm4gcmFuZ2UubWVyZ2Uoe1xuICAgICAgYW5jaG9yS2V5OiBhbmNob3JOb2RlLmtleSxcbiAgICAgIGFuY2hvck9mZnNldCxcbiAgICAgIGZvY3VzS2V5OiBmb2N1c05vZGUua2V5LFxuICAgICAgZm9jdXNPZmZzZXQsXG4gICAgICBpc0JhY2t3YXJkXG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSByYW5nZS5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04oKSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAga2luZDogdGhpcy5raW5kLFxuICAgICAgYW5jaG9yS2V5OiB0aGlzLmFuY2hvcktleSxcbiAgICAgIGFuY2hvck9mZnNldDogdGhpcy5hbmNob3JPZmZzZXQsXG4gICAgICBmb2N1c0tleTogdGhpcy5mb2N1c0tleSxcbiAgICAgIGZvY3VzT2Zmc2V0OiB0aGlzLmZvY3VzT2Zmc2V0LFxuICAgICAgaXNCYWNrd2FyZDogdGhpcy5pc0JhY2t3YXJkLFxuICAgICAgaXNGb2N1c2VkOiB0aGlzLmlzRm9jdXNlZCxcbiAgICAgIG1hcmtzOiB0aGlzLm1hcmtzID09IG51bGwgPyBudWxsIDogdGhpcy5tYXJrcy50b0FycmF5KCkubWFwKG0gPT4gbS50b0pTT04oKSksXG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGB0b0pTYC5cbiAgICovXG5cbiAgdG9KUygpIHtcbiAgICByZXR1cm4gdGhpcy50b0pTT04oKVxuICB9XG5cbn1cblxuLyoqXG4gKiBBdHRhY2ggYSBwc2V1ZG8tc3ltYm9sIGZvciB0eXBlIGNoZWNraW5nLlxuICovXG5cblJhbmdlLnByb3RvdHlwZVtNT0RFTF9UWVBFUy5SQU5HRV0gPSB0cnVlXG5cbi8qKlxuICogTWl4IGluIHNvbWUgXCJtb3ZlXCIgY29udmVuaWVuY2UgbWV0aG9kcy5cbiAqL1xuXG5jb25zdCBNT1ZFX01FVEhPRFMgPSBbXG4gIFsnbW92ZScsICcnXSxcbiAgWydtb3ZlJywgJ1RvJ10sXG4gIFsnbW92ZScsICdUb1N0YXJ0T2YnXSxcbiAgWydtb3ZlJywgJ1RvRW5kT2YnXSxcbl1cblxuTU9WRV9NRVRIT0RTLmZvckVhY2goKFsgcCwgcyBdKSA9PiB7XG4gIFJhbmdlLnByb3RvdHlwZVtgJHtwfSR7c31gXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgICAgIFtgJHtwfUFuY2hvciR7c31gXSguLi5hcmdzKVxuICAgICAgW2Ake3B9Rm9jdXMke3N9YF0oLi4uYXJncylcbiAgfVxufSlcblxuLyoqXG4gKiBNaXggaW4gdGhlIFwic3RhcnRcIiwgXCJlbmRcIiBhbmQgXCJlZGdlXCIgY29udmVuaWVuY2UgbWV0aG9kcy5cbiAqL1xuXG5jb25zdCBFREdFX01FVEhPRFMgPSBbXG4gIFsnaGFzJywgJ0F0U3RhcnRPZicsIHRydWVdLFxuICBbJ2hhcycsICdBdEVuZE9mJywgdHJ1ZV0sXG4gIFsnaGFzJywgJ0JldHdlZW4nLCB0cnVlXSxcbiAgWydoYXMnLCAnSW4nLCB0cnVlXSxcbiAgWydjb2xsYXBzZVRvJywgJyddLFxuICBbJ21vdmUnLCAnJ10sXG4gIFsnbW92ZVRvJywgJyddLFxuICBbJ21vdmUnLCAnVG8nXSxcbiAgWydtb3ZlJywgJ09mZnNldFRvJ10sXG5dXG5cbkVER0VfTUVUSE9EUy5mb3JFYWNoKChbIHAsIHMsIGhhc0VkZ2UgXSkgPT4ge1xuICBjb25zdCBhbmNob3IgPSBgJHtwfUFuY2hvciR7c31gXG4gIGNvbnN0IGZvY3VzID0gYCR7cH1Gb2N1cyR7c31gXG5cbiAgUmFuZ2UucHJvdG90eXBlW2Ake3B9U3RhcnQke3N9YF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLmlzQmFja3dhcmRcbiAgICAgID8gdGhpc1tmb2N1c10oLi4uYXJncylcbiAgICAgIDogdGhpc1thbmNob3JdKC4uLmFyZ3MpXG4gIH1cblxuICBSYW5nZS5wcm90b3R5cGVbYCR7cH1FbmQke3N9YF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgIHJldHVybiB0aGlzLmlzQmFja3dhcmRcbiAgICAgID8gdGhpc1thbmNob3JdKC4uLmFyZ3MpXG4gICAgICA6IHRoaXNbZm9jdXNdKC4uLmFyZ3MpXG4gIH1cblxuICBpZiAoaGFzRWRnZSkge1xuICAgIFJhbmdlLnByb3RvdHlwZVtgJHtwfUVkZ2Uke3N9YF0gPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgcmV0dXJuIHRoaXNbYW5jaG9yXSguLi5hcmdzKSB8fCB0aGlzW2ZvY3VzXSguLi5hcmdzKVxuICAgIH1cbiAgfVxufSlcblxuLyoqXG4gKiBNaXggaW4gc29tZSBhbGlhc2VzIGZvciBjb252ZW5pZW5jZSAvIHBhcmFsbGVsaXNtIHdpdGggdGhlIGJyb3dzZXIgQVBJcy5cbiAqL1xuXG5jb25zdCBBTElBU19NRVRIT0RTID0gW1xuICBbJ2NvbGxhcHNlVG8nLCAnbW92ZVRvJ10sXG4gIFsnY29sbGFwc2VUb0FuY2hvcicsICdtb3ZlVG9BbmNob3InXSxcbiAgWydjb2xsYXBzZVRvRm9jdXMnLCAnbW92ZVRvRm9jdXMnXSxcbiAgWydjb2xsYXBzZVRvU3RhcnQnLCAnbW92ZVRvU3RhcnQnXSxcbiAgWydjb2xsYXBzZVRvRW5kJywgJ21vdmVUb0VuZCddLFxuICBbJ2NvbGxhcHNlVG9TdGFydE9mJywgJ21vdmVUb1N0YXJ0T2YnXSxcbiAgWydjb2xsYXBzZVRvRW5kT2YnLCAnbW92ZVRvRW5kT2YnXSxcbiAgWydleHRlbmQnLCAnbW92ZUZvY3VzJ10sXG4gIFsnZXh0ZW5kVG8nLCAnbW92ZUZvY3VzVG8nXSxcbiAgWydleHRlbmRUb1N0YXJ0T2YnLCAnbW92ZUZvY3VzVG9TdGFydE9mJ10sXG4gIFsnZXh0ZW5kVG9FbmRPZicsICdtb3ZlRm9jdXNUb0VuZE9mJ10sXG5dXG5cbkFMSUFTX01FVEhPRFMuZm9yRWFjaCgoWyBhbGlhcywgbWV0aG9kIF0pID0+IHtcbiAgUmFuZ2UucHJvdG90eXBlW2FsaWFzXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgcmV0dXJuIHRoaXNbbWV0aG9kXSguLi5hcmdzKVxuICB9XG59KVxuXG4vKipcbiAqIEdldCB0aGUgZmlyc3QgdGV4dCBvZiBhIGBub2RlYC5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqIEByZXR1cm4ge1RleHR9XG4gKi9cblxuZnVuY3Rpb24gZ2V0Rmlyc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5raW5kID09ICd0ZXh0JyA/IG5vZGUgOiBub2RlLmdldEZpcnN0VGV4dCgpXG59XG5cbi8qKlxuICogR2V0IHRoZSBsYXN0IHRleHQgb2YgYSBgbm9kZWAuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtUZXh0fVxuICovXG5cbmZ1bmN0aW9uIGdldExhc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5raW5kID09ICd0ZXh0JyA/IG5vZGUgOiBub2RlLmdldExhc3RUZXh0KClcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge1JhbmdlfVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IFJhbmdlXG4iXX0=