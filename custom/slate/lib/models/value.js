'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _data = require('./data');

var _data2 = _interopRequireDefault(_data);

var _document = require('./document');

var _document2 = _interopRequireDefault(_document);

var _history = require('./history');

var _history2 = _interopRequireDefault(_history);

var _range = require('./range');

var _range2 = _interopRequireDefault(_range);

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

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
  data: new _immutable.Map(),
  decorations: null,
  document: _document2.default.create(),
  history: _history2.default.create(),
  schema: _schema2.default.create(),
  selection: _range2.default.create()
};

/**
 * Value.
 *
 * @type {Value}
 */

var Value = function (_Record) {
  _inherits(Value, _Record);

  function Value() {
    _classCallCheck(this, Value);

    return _possibleConstructorReturn(this, (Value.__proto__ || Object.getPrototypeOf(Value)).apply(this, arguments));
  }

  _createClass(Value, [{
    key: 'change',


    /**
     * Create a new `Change` with the current value as a starting point.
     *
     * @param {Object} attrs
     * @return {Change}
     */

    value: function change() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var Change = require('./change').default;
      return new Change(_extends({}, attrs, { value: this }));
    }

    /**
     * Return a JSON representation of the value.
     *
     * @param {Object} options
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        kind: this.kind,
        document: this.document.toJSON(options)
      };

      if (options.preserveData) {
        object.data = this.data.toJSON();
      }

      if (options.preserveDecorations) {
        object.decorations = this.decorations ? this.decorations.toArray().map(function (d) {
          return d.toJSON();
        }) : null;
      }

      if (options.preserveHistory) {
        object.history = this.history.toJSON();
      }

      if (options.preserveSelection) {
        object.selection = this.selection.toJSON();
      }

      if (options.preserveSchema) {
        object.schema = this.schema.toJSON();
      }

      if (options.preserveSelection && !options.preserveKeys) {
        var document = this.document,
            selection = this.selection;

        object.selection.anchorPath = selection.isSet ? document.getPath(selection.anchorKey) : null;
        object.selection.focusPath = selection.isSet ? document.getPath(selection.focusKey) : null;
        delete object.selection.anchorKey;
        delete object.selection.focusKey;
      }

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'value';
    }

    /**
     * Are there undoable events?
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasUndos',
    get: function get() {
      return this.history.undos.size > 0;
    }

    /**
     * Are there redoable events?
     *
     * @return {Boolean}
     */

  }, {
    key: 'hasRedos',
    get: function get() {
      return this.history.redos.size > 0;
    }

    /**
     * Is the current selection blurred?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isBlurred',
    get: function get() {
      return this.selection.isBlurred;
    }

    /**
     * Is the current selection focused?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isFocused',
    get: function get() {
      return this.selection.isFocused;
    }

    /**
     * Is the current selection collapsed?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isCollapsed',
    get: function get() {
      return this.selection.isCollapsed;
    }

    /**
     * Is the current selection expanded?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isExpanded',
    get: function get() {
      return this.selection.isExpanded;
    }

    /**
     * Is the current selection backward?
     *
     * @return {Boolean} isBackward
     */

  }, {
    key: 'isBackward',
    get: function get() {
      return this.selection.isBackward;
    }

    /**
     * Is the current selection forward?
     *
     * @return {Boolean}
     */

  }, {
    key: 'isForward',
    get: function get() {
      return this.selection.isForward;
    }

    /**
     * Get the current start key.
     *
     * @return {String}
     */

  }, {
    key: 'startKey',
    get: function get() {
      return this.selection.startKey;
    }

    /**
     * Get the current end key.
     *
     * @return {String}
     */

  }, {
    key: 'endKey',
    get: function get() {
      return this.selection.endKey;
    }

    /**
     * Get the current start offset.
     *
     * @return {String}
     */

  }, {
    key: 'startOffset',
    get: function get() {
      return this.selection.startOffset;
    }

    /**
     * Get the current end offset.
     *
     * @return {String}
     */

  }, {
    key: 'endOffset',
    get: function get() {
      return this.selection.endOffset;
    }

    /**
     * Get the current anchor key.
     *
     * @return {String}
     */

  }, {
    key: 'anchorKey',
    get: function get() {
      return this.selection.anchorKey;
    }

    /**
     * Get the current focus key.
     *
     * @return {String}
     */

  }, {
    key: 'focusKey',
    get: function get() {
      return this.selection.focusKey;
    }

    /**
     * Get the current anchor offset.
     *
     * @return {String}
     */

  }, {
    key: 'anchorOffset',
    get: function get() {
      return this.selection.anchorOffset;
    }

    /**
     * Get the current focus offset.
     *
     * @return {String}
     */

  }, {
    key: 'focusOffset',
    get: function get() {
      return this.selection.focusOffset;
    }

    /**
     * Get the current start text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'startBlock',
    get: function get() {
      return this.startKey && this.document.getClosestBlock(this.startKey);
    }

    /**
     * Get the current end text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'endBlock',
    get: function get() {
      return this.endKey && this.document.getClosestBlock(this.endKey);
    }

    /**
     * Get the current anchor text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'anchorBlock',
    get: function get() {
      return this.anchorKey && this.document.getClosestBlock(this.anchorKey);
    }

    /**
     * Get the current focus text node's closest block parent.
     *
     * @return {Block}
     */

  }, {
    key: 'focusBlock',
    get: function get() {
      return this.focusKey && this.document.getClosestBlock(this.focusKey);
    }

    /**
     * Get the current start text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'startInline',
    get: function get() {
      return this.startKey && this.document.getClosestInline(this.startKey);
    }

    /**
     * Get the current end text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'endInline',
    get: function get() {
      return this.endKey && this.document.getClosestInline(this.endKey);
    }

    /**
     * Get the current anchor text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'anchorInline',
    get: function get() {
      return this.anchorKey && this.document.getClosestInline(this.anchorKey);
    }

    /**
     * Get the current focus text node's closest inline parent.
     *
     * @return {Inline}
     */

  }, {
    key: 'focusInline',
    get: function get() {
      return this.focusKey && this.document.getClosestInline(this.focusKey);
    }

    /**
     * Get the current start text node.
     *
     * @return {Text}
     */

  }, {
    key: 'startText',
    get: function get() {
      return this.startKey && this.document.getDescendant(this.startKey);
    }

    /**
     * Get the current end node.
     *
     * @return {Text}
     */

  }, {
    key: 'endText',
    get: function get() {
      return this.endKey && this.document.getDescendant(this.endKey);
    }

    /**
     * Get the current anchor node.
     *
     * @return {Text}
     */

  }, {
    key: 'anchorText',
    get: function get() {
      return this.anchorKey && this.document.getDescendant(this.anchorKey);
    }

    /**
     * Get the current focus node.
     *
     * @return {Text}
     */

  }, {
    key: 'focusText',
    get: function get() {
      return this.focusKey && this.document.getDescendant(this.focusKey);
    }

    /**
     * Get the next block node.
     *
     * @return {Block}
     */

  }, {
    key: 'nextBlock',
    get: function get() {
      return this.endKey && this.document.getNextBlock(this.endKey);
    }

    /**
     * Get the previous block node.
     *
     * @return {Block}
     */

  }, {
    key: 'previousBlock',
    get: function get() {
      return this.startKey && this.document.getPreviousBlock(this.startKey);
    }

    /**
     * Get the next inline node.
     *
     * @return {Inline}
     */

  }, {
    key: 'nextInline',
    get: function get() {
      return this.endKey && this.document.getNextInline(this.endKey);
    }

    /**
     * Get the previous inline node.
     *
     * @return {Inline}
     */

  }, {
    key: 'previousInline',
    get: function get() {
      return this.startKey && this.document.getPreviousInline(this.startKey);
    }

    /**
     * Get the next text node.
     *
     * @return {Text}
     */

  }, {
    key: 'nextText',
    get: function get() {
      return this.endKey && this.document.getNextText(this.endKey);
    }

    /**
     * Get the previous text node.
     *
     * @return {Text}
     */

  }, {
    key: 'previousText',
    get: function get() {
      return this.startKey && this.document.getPreviousText(this.startKey);
    }

    /**
     * Get the characters in the current selection.
     *
     * @return {List<Character>}
     */

  }, {
    key: 'characters',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getCharactersAtRange(this.selection);
    }

    /**
     * Get the marks of the current selection.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'marks',
    get: function get() {
      return this.selection.isUnset ? new _immutable.Set() : this.selection.marks || this.document.getMarksAtRange(this.selection);
    }

    /**
     * Get the active marks of the current selection.
     *
     * @return {Set<Mark>}
     */

  }, {
    key: 'activeMarks',
    get: function get() {
      return this.selection.isUnset ? new _immutable.Set() : this.selection.marks || this.document.getActiveMarksAtRange(this.selection);
    }

    /**
     * Get the block nodes in the current selection.
     *
     * @return {List<Block>}
     */

  }, {
    key: 'blocks',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getBlocksAtRange(this.selection);
    }

    /**
     * Get the fragment of the current selection.
     *
     * @return {Document}
     */

  }, {
    key: 'fragment',
    get: function get() {
      return this.selection.isUnset ? _document2.default.create() : this.document.getFragmentAtRange(this.selection);
    }

    /**
     * Get the inline nodes in the current selection.
     *
     * @return {List<Inline>}
     */

  }, {
    key: 'inlines',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getInlinesAtRange(this.selection);
    }

    /**
     * Get the text nodes in the current selection.
     *
     * @return {List<Text>}
     */

  }, {
    key: 'texts',
    get: function get() {
      return this.selection.isUnset ? new _immutable.List() : this.document.getTextsAtRange(this.selection);
    }

    /**
     * Check whether the selection is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      if (this.isCollapsed) return true;
      if (this.endOffset != 0 && this.startOffset != 0) return false;
      return this.fragment.text.length == 0;
    }

    /**
     * Check whether the selection is collapsed in a void node.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isInVoid',
    get: function get() {
      if (this.isExpanded) return false;
      return this.document.hasVoidParent(this.startKey);
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Value` with `attrs`.
     *
     * @param {Object|Value} attrs
     * @param {Object} options
     * @return {Value}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      if (Value.isValue(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Value.fromJSON(attrs);
      }

      throw new Error('`Value.create` only accepts objects or values, but you passed it: ' + attrs);
    }

    /**
     * Create a dictionary of settable value properties from `attrs`.
     *
     * @param {Object|Value} attrs
     * @return {Object}
     */

  }, {
    key: 'createProperties',
    value: function createProperties() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Value.isValue(attrs)) {
        return {
          data: attrs.data,
          decorations: attrs.decorations,
          schema: attrs.schema
        };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        var props = {};
        if ('data' in attrs) props.data = _data2.default.create(attrs.data);
        if ('decorations' in attrs) props.decorations = _range2.default.createList(attrs.decorations);
        if ('schema' in attrs) props.schema = _schema2.default.create(attrs.schema);
        return props;
      }

      throw new Error('`Value.createProperties` only accepts objects or values, but you passed it: ' + attrs);
    }

    /**
     * Create a `Value` from a JSON `object`.
     *
     * @param {Object} object
     * @param {Object} options
     *   @property {Boolean} normalize
     *   @property {Array} plugins
     * @return {Value}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _object$document = object.document,
          document = _object$document === undefined ? {} : _object$document,
          _object$selection = object.selection,
          selection = _object$selection === undefined ? {} : _object$selection,
          _object$schema = object.schema,
          schema = _object$schema === undefined ? {} : _object$schema;


      var data = new _immutable.Map();

      document = _document2.default.fromJSON(document);
      selection = _range2.default.fromJSON(selection);
      schema = _schema2.default.fromJSON(schema);

      // Allow plugins to set a default value for `data`.
      if (options.plugins) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = options.plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var plugin = _step.value;

            if (plugin.data) data = data.merge(plugin.data);
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
      }

      // Then merge in the `data` provided.
      if ('data' in object) {
        data = data.merge(object.data);
      }

      if (selection.isUnset) {
        var text = document.getFirstText();
        if (text) selection = selection.collapseToStartOf(text);
      }

      var value = new Value({
        data: data,
        document: document,
        selection: selection,
        schema: schema
      });

      if (options.normalize !== false) {
        value = value.change({ save: false }).normalize().value;
      }

      return value;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isValue',


    /**
     * Check if a `value` is a `Value`.
     *
     * @param {Any} value
     * @return {Boolean}
     */

    value: function isValue(value) {
      return !!(value && value[_modelTypes2.default.VALUE]);
    }
  }]);

  return Value;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Value.fromJS = Value.fromJSON;
Value.prototype[_modelTypes2.default.VALUE] = true;

/**
 * Export.
 */

exports.default = Value;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvdmFsdWUuanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJkYXRhIiwiZGVjb3JhdGlvbnMiLCJkb2N1bWVudCIsImNyZWF0ZSIsImhpc3RvcnkiLCJzY2hlbWEiLCJzZWxlY3Rpb24iLCJWYWx1ZSIsImF0dHJzIiwiQ2hhbmdlIiwicmVxdWlyZSIsImRlZmF1bHQiLCJ2YWx1ZSIsIm9wdGlvbnMiLCJvYmplY3QiLCJraW5kIiwidG9KU09OIiwicHJlc2VydmVEYXRhIiwicHJlc2VydmVEZWNvcmF0aW9ucyIsInRvQXJyYXkiLCJtYXAiLCJkIiwicHJlc2VydmVIaXN0b3J5IiwicHJlc2VydmVTZWxlY3Rpb24iLCJwcmVzZXJ2ZVNjaGVtYSIsInByZXNlcnZlS2V5cyIsImFuY2hvclBhdGgiLCJpc1NldCIsImdldFBhdGgiLCJhbmNob3JLZXkiLCJmb2N1c1BhdGgiLCJmb2N1c0tleSIsInVuZG9zIiwic2l6ZSIsInJlZG9zIiwiaXNCbHVycmVkIiwiaXNGb2N1c2VkIiwiaXNDb2xsYXBzZWQiLCJpc0V4cGFuZGVkIiwiaXNCYWNrd2FyZCIsImlzRm9yd2FyZCIsInN0YXJ0S2V5IiwiZW5kS2V5Iiwic3RhcnRPZmZzZXQiLCJlbmRPZmZzZXQiLCJhbmNob3JPZmZzZXQiLCJmb2N1c09mZnNldCIsImdldENsb3Nlc3RCbG9jayIsImdldENsb3Nlc3RJbmxpbmUiLCJnZXREZXNjZW5kYW50IiwiZ2V0TmV4dEJsb2NrIiwiZ2V0UHJldmlvdXNCbG9jayIsImdldE5leHRJbmxpbmUiLCJnZXRQcmV2aW91c0lubGluZSIsImdldE5leHRUZXh0IiwiZ2V0UHJldmlvdXNUZXh0IiwiaXNVbnNldCIsImdldENoYXJhY3RlcnNBdFJhbmdlIiwibWFya3MiLCJnZXRNYXJrc0F0UmFuZ2UiLCJnZXRBY3RpdmVNYXJrc0F0UmFuZ2UiLCJnZXRCbG9ja3NBdFJhbmdlIiwiZ2V0RnJhZ21lbnRBdFJhbmdlIiwiZ2V0SW5saW5lc0F0UmFuZ2UiLCJnZXRUZXh0c0F0UmFuZ2UiLCJmcmFnbWVudCIsInRleHQiLCJsZW5ndGgiLCJoYXNWb2lkUGFyZW50IiwiaXNWYWx1ZSIsImZyb21KU09OIiwiRXJyb3IiLCJwcm9wcyIsImNyZWF0ZUxpc3QiLCJwbHVnaW5zIiwicGx1Z2luIiwibWVyZ2UiLCJnZXRGaXJzdFRleHQiLCJjb2xsYXBzZVRvU3RhcnRPZiIsIm5vcm1hbGl6ZSIsImNoYW5nZSIsInNhdmUiLCJWQUxVRSIsImZyb21KUyIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOzs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsV0FBVztBQUNmQyxRQUFNLG9CQURTO0FBRWZDLGVBQWEsSUFGRTtBQUdmQyxZQUFVLG1CQUFTQyxNQUFULEVBSEs7QUFJZkMsV0FBUyxrQkFBUUQsTUFBUixFQUpNO0FBS2ZFLFVBQVEsaUJBQU9GLE1BQVAsRUFMTztBQU1mRyxhQUFXLGdCQUFNSCxNQUFOO0FBTkksQ0FBakI7O0FBU0E7Ozs7OztJQU1NSSxLOzs7Ozs7Ozs7Ozs7O0FBaWtCSjs7Ozs7Ozs2QkFPbUI7QUFBQSxVQUFaQyxLQUFZLHVFQUFKLEVBQUk7O0FBQ2pCLFVBQU1DLFNBQVNDLFFBQVEsVUFBUixFQUFvQkMsT0FBbkM7QUFDQSxhQUFPLElBQUlGLE1BQUosY0FBZ0JELEtBQWhCLElBQXVCSSxPQUFPLElBQTlCLElBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7OzZCQU9xQjtBQUFBLFVBQWRDLE9BQWMsdUVBQUosRUFBSTs7QUFDbkIsVUFBTUMsU0FBUztBQUNiQyxjQUFNLEtBQUtBLElBREU7QUFFYmIsa0JBQVUsS0FBS0EsUUFBTCxDQUFjYyxNQUFkLENBQXFCSCxPQUFyQjtBQUZHLE9BQWY7O0FBS0EsVUFBSUEsUUFBUUksWUFBWixFQUEwQjtBQUN4QkgsZUFBT2QsSUFBUCxHQUFjLEtBQUtBLElBQUwsQ0FBVWdCLE1BQVYs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O0FBbW9CcEI7Ozs7QUFub0JNUSxLLENBMkdHNEUsTSxHQUFTNUUsTUFBTStELFE7QUE0aEJ4Qi9ELE1BQU02RSxTQUFOLENBQWdCLHFCQUFZRixLQUE1QixJQUFxQyxJQUFyQzs7QUFFQTs7OztrQkFJZTNFLEsiLCJmaWxlIjoidmFsdWUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCB7IFJlY29yZCwgU2V0LCBMaXN0LCBNYXAgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBNT0RFTF9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvbW9kZWwtdHlwZXMnXG5pbXBvcnQgRGF0YSBmcm9tICcuL2RhdGEnXG5pbXBvcnQgRG9jdW1lbnQgZnJvbSAnLi9kb2N1bWVudCdcbmltcG9ydCBIaXN0b3J5IGZyb20gJy4vaGlzdG9yeSdcbmltcG9ydCBSYW5nZSBmcm9tICcuL3JhbmdlJ1xuaW1wb3J0IFNjaGVtYSBmcm9tICcuL3NjaGVtYSdcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgZGF0YTogbmV3IE1hcCgpLFxuICBkZWNvcmF0aW9uczogbnVsbCxcbiAgZG9jdW1lbnQ6IERvY3VtZW50LmNyZWF0ZSgpLFxuICBoaXN0b3J5OiBIaXN0b3J5LmNyZWF0ZSgpLFxuICBzY2hlbWE6IFNjaGVtYS5jcmVhdGUoKSxcbiAgc2VsZWN0aW9uOiBSYW5nZS5jcmVhdGUoKSxcbn1cblxuLyoqXG4gKiBWYWx1ZS5cbiAqXG4gKiBAdHlwZSB7VmFsdWV9XG4gKi9cblxuY2xhc3MgVmFsdWUgZXh0ZW5kcyBSZWNvcmQoREVGQVVMVFMpIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBWYWx1ZWAgd2l0aCBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxWYWx1ZX0gYXR0cnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgaWYgKFZhbHVlLmlzVmFsdWUoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gYXR0cnNcbiAgICB9XG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdChhdHRycykpIHtcbiAgICAgIHJldHVybiBWYWx1ZS5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYFZhbHVlLmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cyBvciB2YWx1ZXMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgZGljdGlvbmFyeSBvZiBzZXR0YWJsZSB2YWx1ZSBwcm9wZXJ0aWVzIGZyb20gYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8VmFsdWV9IGF0dHJzXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZVByb3BlcnRpZXMoYXR0cnMgPSB7fSkge1xuICAgIGlmIChWYWx1ZS5pc1ZhbHVlKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZGF0YTogYXR0cnMuZGF0YSxcbiAgICAgICAgZGVjb3JhdGlvbnM6IGF0dHJzLmRlY29yYXRpb25zLFxuICAgICAgICBzY2hlbWE6IGF0dHJzLnNjaGVtYSxcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdChhdHRycykpIHtcbiAgICAgIGNvbnN0IHByb3BzID0ge31cbiAgICAgIGlmICgnZGF0YScgaW4gYXR0cnMpIHByb3BzLmRhdGEgPSBEYXRhLmNyZWF0ZShhdHRycy5kYXRhKVxuICAgICAgaWYgKCdkZWNvcmF0aW9ucycgaW4gYXR0cnMpIHByb3BzLmRlY29yYXRpb25zID0gUmFuZ2UuY3JlYXRlTGlzdChhdHRycy5kZWNvcmF0aW9ucylcbiAgICAgIGlmICgnc2NoZW1hJyBpbiBhdHRycykgcHJvcHMuc2NoZW1hID0gU2NoZW1hLmNyZWF0ZShhdHRycy5zY2hlbWEpXG4gICAgICByZXR1cm4gcHJvcHNcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYFZhbHVlLmNyZWF0ZVByb3BlcnRpZXNcXGAgb25seSBhY2NlcHRzIG9iamVjdHMgb3IgdmFsdWVzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBWYWx1ZWAgZnJvbSBhIEpTT04gYG9iamVjdGAuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogICBAcHJvcGVydHkge0Jvb2xlYW59IG5vcm1hbGl6ZVxuICAgKiAgIEBwcm9wZXJ0eSB7QXJyYXl9IHBsdWdpbnNcbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlNPTihvYmplY3QsIG9wdGlvbnMgPSB7fSkge1xuICAgIGxldCB7XG4gICAgICBkb2N1bWVudCA9IHt9LFxuICAgICAgc2VsZWN0aW9uID0ge30sXG4gICAgICBzY2hlbWEgPSB7fSxcbiAgICB9ID0gb2JqZWN0XG5cbiAgICBsZXQgZGF0YSA9IG5ldyBNYXAoKVxuXG4gICAgZG9jdW1lbnQgPSBEb2N1bWVudC5mcm9tSlNPTihkb2N1bWVudClcbiAgICBzZWxlY3Rpb24gPSBSYW5nZS5mcm9tSlNPTihzZWxlY3Rpb24pXG4gICAgc2NoZW1hID0gU2NoZW1hLmZyb21KU09OKHNjaGVtYSlcblxuICAgIC8vIEFsbG93IHBsdWdpbnMgdG8gc2V0IGEgZGVmYXVsdCB2YWx1ZSBmb3IgYGRhdGFgLlxuICAgIGlmIChvcHRpb25zLnBsdWdpbnMpIHtcbiAgICAgIGZvciAoY29uc3QgcGx1Z2luIG9mIG9wdGlvbnMucGx1Z2lucykge1xuICAgICAgICBpZiAocGx1Z2luLmRhdGEpIGRhdGEgPSBkYXRhLm1lcmdlKHBsdWdpbi5kYXRhKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoZW4gbWVyZ2UgaW4gdGhlIGBkYXRhYCBwcm92aWRlZC5cbiAgICBpZiAoJ2RhdGEnIGluIG9iamVjdCkge1xuICAgICAgZGF0YSA9IGRhdGEubWVyZ2Uob2JqZWN0LmRhdGEpXG4gICAgfVxuXG4gICAgaWYgKHNlbGVjdGlvbi5pc1Vuc2V0KSB7XG4gICAgICBjb25zdCB0ZXh0ID0gZG9jdW1lbnQuZ2V0Rmlyc3RUZXh0KClcbiAgICAgIGlmICh0ZXh0KSBzZWxlY3Rpb24gPSBzZWxlY3Rpb24uY29sbGFwc2VUb1N0YXJ0T2YodGV4dClcbiAgICB9XG5cbiAgICBsZXQgdmFsdWUgPSBuZXcgVmFsdWUoe1xuICAgICAgZGF0YSxcbiAgICAgIGRvY3VtZW50LFxuICAgICAgc2VsZWN0aW9uLFxuICAgICAgc2NoZW1hLFxuICAgIH0pXG5cbiAgICBpZiAob3B0aW9ucy5ub3JtYWxpemUgIT09IGZhbHNlKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLmNoYW5nZSh7IHNhdmU6IGZhbHNlIH0pLm5vcm1hbGl6ZSgpLnZhbHVlXG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYGZyb21KU2AuXG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlMgPSBWYWx1ZS5mcm9tSlNPTlxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBhIGB2YWx1ZWAgaXMgYSBgVmFsdWVgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gdmFsdWVcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzVmFsdWUodmFsdWUpIHtcbiAgICByZXR1cm4gISEodmFsdWUgJiYgdmFsdWVbTU9ERUxfVFlQRVMuVkFMVUVdKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUga2luZC5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQga2luZCgpIHtcbiAgICByZXR1cm4gJ3ZhbHVlJ1xuICB9XG5cbiAgLyoqXG4gICAqIEFyZSB0aGVyZSB1bmRvYWJsZSBldmVudHM/XG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBoYXNVbmRvcygpIHtcbiAgICByZXR1cm4gdGhpcy5oaXN0b3J5LnVuZG9zLnNpemUgPiAwXG4gIH1cblxuICAvKipcbiAgICogQXJlIHRoZXJlIHJlZG9hYmxlIGV2ZW50cz9cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGhhc1JlZG9zKCkge1xuICAgIHJldHVybiB0aGlzLmhpc3RvcnkucmVkb3Muc2l6ZSA+IDBcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gYmx1cnJlZD9cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzQmx1cnJlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNCbHVycmVkXG4gIH1cblxuICAvKipcbiAgICogSXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGZvY3VzZWQ/XG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0ZvY3VzZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmlzRm9jdXNlZFxuICB9XG5cbiAgLyoqXG4gICAqIElzIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBjb2xsYXBzZWQ/XG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0NvbGxhcHNlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNDb2xsYXBzZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBJcyB0aGUgY3VycmVudCBzZWxlY3Rpb24gZXhwYW5kZWQ/XG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0V4cGFuZGVkKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5pc0V4cGFuZGVkXG4gIH1cblxuICAvKipcbiAgICogSXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGJhY2t3YXJkP1xuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufSBpc0JhY2t3YXJkXG4gICAqL1xuXG4gIGdldCBpc0JhY2t3YXJkKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5pc0JhY2t3YXJkXG4gIH1cblxuICAvKipcbiAgICogSXMgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGZvcndhcmQ/XG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0ZvcndhcmQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmlzRm9yd2FyZFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBzdGFydCBrZXkuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IHN0YXJ0S2V5KCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5zdGFydEtleVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBlbmQga2V5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBlbmRLZXkoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmVuZEtleVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBzdGFydCBvZmZzZXQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IHN0YXJ0T2Zmc2V0KCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5zdGFydE9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBlbmQgb2Zmc2V0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBlbmRPZmZzZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmVuZE9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBhbmNob3Iga2V5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBhbmNob3JLZXkoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmFuY2hvcktleVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBmb2N1cyBrZXkuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGZvY3VzS2V5KCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5mb2N1c0tleVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBhbmNob3Igb2Zmc2V0LlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBhbmNob3JPZmZzZXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmFuY2hvck9mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBmb2N1cyBvZmZzZXQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGZvY3VzT2Zmc2V0KCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5mb2N1c09mZnNldFxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBzdGFydCB0ZXh0IG5vZGUncyBjbG9zZXN0IGJsb2NrIHBhcmVudC5cbiAgICpcbiAgICogQHJldHVybiB7QmxvY2t9XG4gICAqL1xuXG4gIGdldCBzdGFydEJsb2NrKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0S2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0Q2xvc2VzdEJsb2NrKHRoaXMuc3RhcnRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGVuZCB0ZXh0IG5vZGUncyBjbG9zZXN0IGJsb2NrIHBhcmVudC5cbiAgICpcbiAgICogQHJldHVybiB7QmxvY2t9XG4gICAqL1xuXG4gIGdldCBlbmRCbG9jaygpIHtcbiAgICByZXR1cm4gdGhpcy5lbmRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRDbG9zZXN0QmxvY2sodGhpcy5lbmRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGFuY2hvciB0ZXh0IG5vZGUncyBjbG9zZXN0IGJsb2NrIHBhcmVudC5cbiAgICpcbiAgICogQHJldHVybiB7QmxvY2t9XG4gICAqL1xuXG4gIGdldCBhbmNob3JCbG9jaygpIHtcbiAgICByZXR1cm4gdGhpcy5hbmNob3JLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRDbG9zZXN0QmxvY2sodGhpcy5hbmNob3JLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGZvY3VzIHRleHQgbm9kZSdzIGNsb3Nlc3QgYmxvY2sgcGFyZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCbG9ja31cbiAgICovXG5cbiAgZ2V0IGZvY3VzQmxvY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuZm9jdXNLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRDbG9zZXN0QmxvY2sodGhpcy5mb2N1c0tleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgc3RhcnQgdGV4dCBub2RlJ3MgY2xvc2VzdCBpbmxpbmUgcGFyZW50LlxuICAgKlxuICAgKiBAcmV0dXJuIHtJbmxpbmV9XG4gICAqL1xuXG4gIGdldCBzdGFydElubGluZSgpIHtcbiAgICByZXR1cm4gdGhpcy5zdGFydEtleSAmJiB0aGlzLmRvY3VtZW50LmdldENsb3Nlc3RJbmxpbmUodGhpcy5zdGFydEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgZW5kIHRleHQgbm9kZSdzIGNsb3Nlc3QgaW5saW5lIHBhcmVudC5cbiAgICpcbiAgICogQHJldHVybiB7SW5saW5lfVxuICAgKi9cblxuICBnZXQgZW5kSW5saW5lKCkge1xuICAgIHJldHVybiB0aGlzLmVuZEtleSAmJiB0aGlzLmRvY3VtZW50LmdldENsb3Nlc3RJbmxpbmUodGhpcy5lbmRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGFuY2hvciB0ZXh0IG5vZGUncyBjbG9zZXN0IGlubGluZSBwYXJlbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge0lubGluZX1cbiAgICovXG5cbiAgZ2V0IGFuY2hvcklubGluZSgpIHtcbiAgICByZXR1cm4gdGhpcy5hbmNob3JLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRDbG9zZXN0SW5saW5lKHRoaXMuYW5jaG9yS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBmb2N1cyB0ZXh0IG5vZGUncyBjbG9zZXN0IGlubGluZSBwYXJlbnQuXG4gICAqXG4gICAqIEByZXR1cm4ge0lubGluZX1cbiAgICovXG5cbiAgZ2V0IGZvY3VzSW5saW5lKCkge1xuICAgIHJldHVybiB0aGlzLmZvY3VzS2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0Q2xvc2VzdElubGluZSh0aGlzLmZvY3VzS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBzdGFydCB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHR9XG4gICAqL1xuXG4gIGdldCBzdGFydFRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXREZXNjZW5kYW50KHRoaXMuc3RhcnRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjdXJyZW50IGVuZCBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0fVxuICAgKi9cblxuICBnZXQgZW5kVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXREZXNjZW5kYW50KHRoaXMuZW5kS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgY3VycmVudCBhbmNob3Igbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgZ2V0IGFuY2hvclRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYW5jaG9yS2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0RGVzY2VuZGFudCh0aGlzLmFuY2hvcktleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgZm9jdXMgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7VGV4dH1cbiAgICovXG5cbiAgZ2V0IGZvY3VzVGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5mb2N1c0tleSAmJiB0aGlzLmRvY3VtZW50LmdldERlc2NlbmRhbnQodGhpcy5mb2N1c0tleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5leHQgYmxvY2sgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7QmxvY2t9XG4gICAqL1xuXG4gIGdldCBuZXh0QmxvY2soKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5kS2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0TmV4dEJsb2NrKHRoaXMuZW5kS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcHJldmlvdXMgYmxvY2sgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7QmxvY2t9XG4gICAqL1xuXG4gIGdldCBwcmV2aW91c0Jsb2NrKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0S2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0UHJldmlvdXNCbG9jayh0aGlzLnN0YXJ0S2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbmV4dCBpbmxpbmUgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7SW5saW5lfVxuICAgKi9cblxuICBnZXQgbmV4dElubGluZSgpIHtcbiAgICByZXR1cm4gdGhpcy5lbmRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXROZXh0SW5saW5lKHRoaXMuZW5kS2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgcHJldmlvdXMgaW5saW5lIG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge0lubGluZX1cbiAgICovXG5cbiAgZ2V0IHByZXZpb3VzSW5saW5lKCkge1xuICAgIHJldHVybiB0aGlzLnN0YXJ0S2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0UHJldmlvdXNJbmxpbmUodGhpcy5zdGFydEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5leHQgdGV4dCBub2RlLlxuICAgKlxuICAgKiBAcmV0dXJuIHtUZXh0fVxuICAgKi9cblxuICBnZXQgbmV4dFRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZW5kS2V5ICYmIHRoaXMuZG9jdW1lbnQuZ2V0TmV4dFRleHQodGhpcy5lbmRLZXkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBwcmV2aW91cyB0ZXh0IG5vZGUuXG4gICAqXG4gICAqIEByZXR1cm4ge1RleHR9XG4gICAqL1xuXG4gIGdldCBwcmV2aW91c1RleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuc3RhcnRLZXkgJiYgdGhpcy5kb2N1bWVudC5nZXRQcmV2aW91c1RleHQodGhpcy5zdGFydEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNoYXJhY3RlcnMgaW4gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtMaXN0PENoYXJhY3Rlcj59XG4gICAqL1xuXG4gIGdldCBjaGFyYWN0ZXJzKCkge1xuICAgIHJldHVybiB0aGlzLnNlbGVjdGlvbi5pc1Vuc2V0XG4gICAgICA/IG5ldyBMaXN0KClcbiAgICAgIDogdGhpcy5kb2N1bWVudC5nZXRDaGFyYWN0ZXJzQXRSYW5nZSh0aGlzLnNlbGVjdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG1hcmtzIG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7U2V0PE1hcms+fVxuICAgKi9cblxuICBnZXQgbWFya3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmlzVW5zZXRcbiAgICAgID8gbmV3IFNldCgpXG4gICAgICA6IHRoaXMuc2VsZWN0aW9uLm1hcmtzIHx8IHRoaXMuZG9jdW1lbnQuZ2V0TWFya3NBdFJhbmdlKHRoaXMuc2VsZWN0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYWN0aXZlIG1hcmtzIG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7U2V0PE1hcms+fVxuICAgKi9cblxuICBnZXQgYWN0aXZlTWFya3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmlzVW5zZXRcbiAgICAgID8gbmV3IFNldCgpXG4gICAgICA6IHRoaXMuc2VsZWN0aW9uLm1hcmtzIHx8IHRoaXMuZG9jdW1lbnQuZ2V0QWN0aXZlTWFya3NBdFJhbmdlKHRoaXMuc2VsZWN0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYmxvY2sgbm9kZXMgaW4gdGhlIGN1cnJlbnQgc2VsZWN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJuIHtMaXN0PEJsb2NrPn1cbiAgICovXG5cbiAgZ2V0IGJsb2NrcygpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNVbnNldFxuICAgICAgPyBuZXcgTGlzdCgpXG4gICAgICA6IHRoaXMuZG9jdW1lbnQuZ2V0QmxvY2tzQXRSYW5nZSh0aGlzLnNlbGVjdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGZyYWdtZW50IG9mIHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAgICpcbiAgICogQHJldHVybiB7RG9jdW1lbnR9XG4gICAqL1xuXG4gIGdldCBmcmFnbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNVbnNldFxuICAgICAgPyBEb2N1bWVudC5jcmVhdGUoKVxuICAgICAgOiB0aGlzLmRvY3VtZW50LmdldEZyYWdtZW50QXRSYW5nZSh0aGlzLnNlbGVjdGlvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGlubGluZSBub2RlcyBpbiB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8SW5saW5lPn1cbiAgICovXG5cbiAgZ2V0IGlubGluZXMoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0aW9uLmlzVW5zZXRcbiAgICAgID8gbmV3IExpc3QoKVxuICAgICAgOiB0aGlzLmRvY3VtZW50LmdldElubGluZXNBdFJhbmdlKHRoaXMuc2VsZWN0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgdGV4dCBub2RlcyBpbiB0aGUgY3VycmVudCBzZWxlY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8VGV4dD59XG4gICAqL1xuXG4gIGdldCB0ZXh0cygpIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3Rpb24uaXNVbnNldFxuICAgICAgPyBuZXcgTGlzdCgpXG4gICAgICA6IHRoaXMuZG9jdW1lbnQuZ2V0VGV4dHNBdFJhbmdlKHRoaXMuc2VsZWN0aW9uKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIHdoZXRoZXIgdGhlIHNlbGVjdGlvbiBpcyBlbXB0eS5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzRW1wdHkoKSB7XG4gICAgaWYgKHRoaXMuaXNDb2xsYXBzZWQpIHJldHVybiB0cnVlXG4gICAgaWYgKHRoaXMuZW5kT2Zmc2V0ICE9IDAgJiYgdGhpcy5zdGFydE9mZnNldCAhPSAwKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdGhpcy5mcmFnbWVudC50ZXh0Lmxlbmd0aCA9PSAwXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgd2hldGhlciB0aGUgc2VsZWN0aW9uIGlzIGNvbGxhcHNlZCBpbiBhIHZvaWQgbm9kZS5cbiAgICpcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZ2V0IGlzSW5Wb2lkKCkge1xuICAgIGlmICh0aGlzLmlzRXhwYW5kZWQpIHJldHVybiBmYWxzZVxuICAgIHJldHVybiB0aGlzLmRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQodGhpcy5zdGFydEtleSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYENoYW5nZWAgd2l0aCB0aGUgY3VycmVudCB2YWx1ZSBhcyBhIHN0YXJ0aW5nIHBvaW50LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gYXR0cnNcbiAgICogQHJldHVybiB7Q2hhbmdlfVxuICAgKi9cblxuICBjaGFuZ2UoYXR0cnMgPSB7fSkge1xuICAgIGNvbnN0IENoYW5nZSA9IHJlcXVpcmUoJy4vY2hhbmdlJykuZGVmYXVsdFxuICAgIHJldHVybiBuZXcgQ2hhbmdlKHsgLi4uYXR0cnMsIHZhbHVlOiB0aGlzIH0pXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgdG9KU09OKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMua2luZCxcbiAgICAgIGRvY3VtZW50OiB0aGlzLmRvY3VtZW50LnRvSlNPTihvcHRpb25zKSxcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5wcmVzZXJ2ZURhdGEpIHtcbiAgICAgIG9iamVjdC5kYXRhID0gdGhpcy5kYXRhLnRvSlNPTigpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucHJlc2VydmVEZWNvcmF0aW9ucykge1xuICAgICAgb2JqZWN0LmRlY29yYXRpb25zID0gdGhpcy5kZWNvcmF0aW9ucyA/IHRoaXMuZGVjb3JhdGlvbnMudG9BcnJheSgpLm1hcChkID0+IGQudG9KU09OKCkpIDogbnVsbFxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnByZXNlcnZlSGlzdG9yeSkge1xuICAgICAgb2JqZWN0Lmhpc3RvcnkgPSB0aGlzLmhpc3RvcnkudG9KU09OKClcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5wcmVzZXJ2ZVNlbGVjdGlvbikge1xuICAgICAgb2JqZWN0LnNlbGVjdGlvbiA9IHRoaXMuc2VsZWN0aW9uLnRvSlNPTigpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucHJlc2VydmVTY2hlbWEpIHtcbiAgICAgIG9iamVjdC5zY2hlbWEgPSB0aGlzLnNjaGVtYS50b0pTT04oKVxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnByZXNlcnZlU2VsZWN0aW9uICYmICFvcHRpb25zLnByZXNlcnZlS2V5cykge1xuICAgICAgY29uc3QgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB0aGlzXG4gICAgICBvYmplY3Quc2VsZWN0aW9uLmFuY2hvclBhdGggPSBzZWxlY3Rpb24uaXNTZXQgPyBkb2N1bWVudC5nZXRQYXRoKHNlbGVjdGlvbi5hbmNob3JLZXkpIDogbnVsbFxuICAgICAgb2JqZWN0LnNlbGVjdGlvbi5mb2N1c1BhdGggPSBzZWxlY3Rpb24uaXNTZXQgPyBkb2N1bWVudC5nZXRQYXRoKHNlbGVjdGlvbi5mb2N1c0tleSkgOiBudWxsXG4gICAgICBkZWxldGUgb2JqZWN0LnNlbGVjdGlvbi5hbmNob3JLZXlcbiAgICAgIGRlbGV0ZSBvYmplY3Quc2VsZWN0aW9uLmZvY3VzS2V5XG4gICAgfVxuXG4gICAgcmV0dXJuIG9iamVjdFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGB0b0pTYC5cbiAgICovXG5cbiAgdG9KUyhvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMudG9KU09OKG9wdGlvbnMpXG4gIH1cblxufVxuXG4vKipcbiAqIEF0dGFjaCBhIHBzZXVkby1zeW1ib2wgZm9yIHR5cGUgY2hlY2tpbmcuXG4gKi9cblxuVmFsdWUucHJvdG90eXBlW01PREVMX1RZUEVTLlZBTFVFXSA9IHRydWVcblxuLyoqXG4gKiBFeHBvcnQuXG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgVmFsdWVcbiJdfQ==