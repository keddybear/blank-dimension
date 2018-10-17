'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./document');

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  isVoid: false,
  key: undefined,
  nodes: new _immutable.List(),
  type: undefined
};

/**
 * Block.
 *
 * @type {Block}
 */

var Block = function (_Record) {
  _inherits(Block, _Record);

  function Block() {
    _classCallCheck(this, Block);

    return _possibleConstructorReturn(this, (Block.__proto__ || Object.getPrototypeOf(Block)).apply(this, arguments));
  }

  _createClass(Block, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the block.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        kind: this.kind,
        type: this.type,
        isVoid: this.isVoid,
        data: this.data.toJSON(),
        nodes: this.nodes.toArray().map(function (n) {
          return n.toJSON(options);
        })
      };

      if (options.preserveKeys) {
        object.key = this.key;
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
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'block';
    }

    /**
     * Check if the block is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the concatenated text of all the block's children.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.getText();
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Block` from `attrs`.
     *
     * @param {Object|String|Block} attrs
     * @return {Block}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Block.isBlock(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { type: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Block.fromJSON(attrs);
      }

      throw new Error('`Block.create` only accepts objects, strings or blocks, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Blocks` from `attrs`.
     *
     * @param {Array<Block|Object>|List<Block|Object>} attrs
     * @return {List<Block>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(attrs) || Array.isArray(attrs)) {
        var list = new _immutable.List(attrs.map(Block.create));
        return list;
      }

      throw new Error('`Block.createList` only accepts arrays or lists, but you passed it: ' + attrs);
    }

    /**
     * Create a `Block` from a JSON `object`.
     *
     * @param {Object|Block} object
     * @return {Block}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Block.isBlock(object)) {
        return object;
      }

      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          _object$isVoid = object.isVoid,
          isVoid = _object$isVoid === undefined ? false : _object$isVoid,
          _object$key = object.key,
          key = _object$key === undefined ? (0, _generateKey2.default)() : _object$key,
          _object$nodes = object.nodes,
          nodes = _object$nodes === undefined ? [] : _object$nodes,
          type = object.type;


      if (typeof type != 'string') {
        throw new Error('`Block.fromJSON` requires a `type` string.');
      }

      var block = new Block({
        key: key,
        type: type,
        isVoid: !!isVoid,
        data: new _immutable.Map(data),
        nodes: new _immutable.List(nodes.map(_node2.default.fromJSON))
      });

      return block;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isBlock',


    /**
     * Check if `any` is a `Block`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isBlock(any) {
      return !!(any && any[_modelTypes2.default.BLOCK]);
    }

    /**
     * Check if `any` is a block list.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isBlockList',
    value: function isBlockList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Block.isBlock(item);
      });
    }
  }]);

  return Block;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Block.fromJS = Block.fromJSON;
Block.prototype[_modelTypes2.default.BLOCK] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(_node2.default.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Block.prototype[method] = _node2.default.prototype[method];
});

/**
 * Export.
 *
 * @type {Block}
 */

exports.default = Block;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvYmxvY2suanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJkYXRhIiwiaXNWb2lkIiwia2V5IiwidW5kZWZpbmVkIiwibm9kZXMiLCJ0eXBlIiwiQmxvY2siLCJvcHRpb25zIiwib2JqZWN0Iiwia2luZCIsInRvSlNPTiIsInRvQXJyYXkiLCJtYXAiLCJuIiwicHJlc2VydmVLZXlzIiwidGV4dCIsImdldFRleHQiLCJhdHRycyIsImlzQmxvY2siLCJmcm9tSlNPTiIsIkVycm9yIiwiaXNMaXN0IiwiQXJyYXkiLCJpc0FycmF5IiwibGlzdCIsImNyZWF0ZSIsImJsb2NrIiwiYW55IiwiQkxPQ0siLCJldmVyeSIsIml0ZW0iLCJmcm9tSlMiLCJwcm90b3R5cGUiLCJPYmplY3QiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzIiwiZm9yRWFjaCIsIm1ldGhvZCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFLQTs7QUFNQTs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7QUFmQTs7OztBQU1BOzs7O0FBV0E7Ozs7OztBQU1BLElBQU1BLFdBQVc7QUFDZkMsUUFBTSxvQkFEUztBQUVmQyxVQUFRLEtBRk87QUFHZkMsT0FBS0MsU0FIVTtBQUlmQyxTQUFPLHFCQUpRO0FBS2ZDLFFBQU1GO0FBTFMsQ0FBakI7O0FBUUE7Ozs7OztJQU1NRyxLOzs7Ozs7Ozs7Ozs7O0FBc0lKOzs7Ozs7OzZCQU9xQjtBQUFBLFVBQWRDLE9BQWMsdUVBQUosRUFBSTs7QUFDbkIsVUFBTUMsU0FBUztBQUNiQyxjQUFNLEtBQUtBLElBREU7QUFFYkosY0FBTSxLQUFLQSxJQUZFO0FBR2JKLGdCQUFRLEtBQUtBLE1BSEE7QUFJYkQsY0FBTSxLQUFLQSxJQUFMLENBQVVVLE1BQVYsRUFKTztBQUtiTixlQUFPLEtBQUtBLEtBQUwsQ0FBV08sT0FBWCxHQUFxQkMsR0FBckIsQ0FBeUI7QUFBQSxpQkFBS0MsRUFBRUgsTUFBRixDQUFTSCxPQUFULENBQUw7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ZCxDQUFSO0FBQUEsT0FBVixDQUEzQjtBQUNEOzs7O0VBdEdpQix1QkFBTy9CLFFBQVAsQzs7QUF1S3BCOzs7O0FBdktNTyxLLENBZ0ZHeUIsTSxHQUFTekIsTUFBTWEsUTtBQTJGeEJiLE1BQU0wQixTQUFOLENBQWdCLHFCQUFZSixLQUE1QixJQUFxQyxJQUFyQzs7QUFFQTs7OztBQUlBSyxPQUFPQyxtQkFBUCxDQUEyQixlQUFLRixTQUFoQyxFQUEyQ0csT0FBM0MsQ0FBbUQsVUFBQ0MsTUFBRCxFQUFZO0FBQzdELE1BQUlBLFVBQVUsYUFBZCxFQUE2QjtBQUM3QjlCLFFBQU0wQixTQUFOLENBQWdCSSxNQUFoQixJQUEwQixlQUFLSixTQUFMLENBQWVJLE1BQWYsQ0FBMUI7QUFDRCxDQUhEOztBQUtBOzs7Ozs7a0JBTWU5QixLIiwiZmlsZSI6ImJsb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIFByZXZlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCAnLi9kb2N1bWVudCdcblxuLyoqXG4gKiBEZXBlbmRlbmNpZXMuXG4gKi9cblxuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnaXMtcGxhaW4tb2JqZWN0J1xuaW1wb3J0IHsgTGlzdCwgTWFwLCBSZWNvcmQgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBNT0RFTF9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvbW9kZWwtdHlwZXMnXG5pbXBvcnQgTm9kZSBmcm9tICcuL25vZGUnXG5pbXBvcnQgZ2VuZXJhdGVLZXkgZnJvbSAnLi4vdXRpbHMvZ2VuZXJhdGUta2V5J1xuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICBkYXRhOiBuZXcgTWFwKCksXG4gIGlzVm9pZDogZmFsc2UsXG4gIGtleTogdW5kZWZpbmVkLFxuICBub2RlczogbmV3IExpc3QoKSxcbiAgdHlwZTogdW5kZWZpbmVkLFxufVxuXG4vKipcbiAqIEJsb2NrLlxuICpcbiAqIEB0eXBlIHtCbG9ja31cbiAqL1xuXG5jbGFzcyBCbG9jayBleHRlbmRzIFJlY29yZChERUZBVUxUUykge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYEJsb2NrYCBmcm9tIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ3xCbG9ja30gYXR0cnNcbiAgICogQHJldHVybiB7QmxvY2t9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSkge1xuICAgIGlmIChCbG9jay5pc0Jsb2NrKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBhdHRycyA9PSAnc3RyaW5nJykge1xuICAgICAgYXR0cnMgPSB7IHR5cGU6IGF0dHJzIH1cbiAgICB9XG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdChhdHRycykpIHtcbiAgICAgIHJldHVybiBCbG9jay5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYEJsb2NrLmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cywgc3RyaW5ncyBvciBibG9ja3MsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbGlzdCBvZiBgQmxvY2tzYCBmcm9tIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8QmxvY2t8T2JqZWN0PnxMaXN0PEJsb2NrfE9iamVjdD59IGF0dHJzXG4gICAqIEByZXR1cm4ge0xpc3Q8QmxvY2s+fVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlTGlzdChhdHRycyA9IFtdKSB7XG4gICAgaWYgKExpc3QuaXNMaXN0KGF0dHJzKSB8fCBBcnJheS5pc0FycmF5KGF0dHJzKSkge1xuICAgICAgY29uc3QgbGlzdCA9IG5ldyBMaXN0KGF0dHJzLm1hcChCbG9jay5jcmVhdGUpKVxuICAgICAgcmV0dXJuIGxpc3RcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYEJsb2NrLmNyZWF0ZUxpc3RcXGAgb25seSBhY2NlcHRzIGFycmF5cyBvciBsaXN0cywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgQmxvY2tgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxCbG9ja30gb2JqZWN0XG4gICAqIEByZXR1cm4ge0Jsb2NrfVxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTT04ob2JqZWN0KSB7XG4gICAgaWYgKEJsb2NrLmlzQmxvY2sob2JqZWN0KSkge1xuICAgICAgcmV0dXJuIG9iamVjdFxuICAgIH1cblxuICAgIGNvbnN0IHtcbiAgICAgIGRhdGEgPSB7fSxcbiAgICAgIGlzVm9pZCA9IGZhbHNlLFxuICAgICAga2V5ID0gZ2VuZXJhdGVLZXkoKSxcbiAgICAgIG5vZGVzID0gW10sXG4gICAgICB0eXBlLFxuICAgIH0gPSBvYmplY3RcblxuICAgIGlmICh0eXBlb2YgdHlwZSAhPSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgQmxvY2suZnJvbUpTT05gIHJlcXVpcmVzIGEgYHR5cGVgIHN0cmluZy4nKVxuICAgIH1cblxuICAgIGNvbnN0IGJsb2NrID0gbmV3IEJsb2NrKHtcbiAgICAgIGtleSxcbiAgICAgIHR5cGUsXG4gICAgICBpc1ZvaWQ6ICEhaXNWb2lkLFxuICAgICAgZGF0YTogbmV3IE1hcChkYXRhKSxcbiAgICAgIG5vZGVzOiBuZXcgTGlzdChub2Rlcy5tYXAoTm9kZS5mcm9tSlNPTikpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gYmxvY2tcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgZnJvbUpTYC5cbiAgICovXG5cbiAgc3RhdGljIGZyb21KUyA9IEJsb2NrLmZyb21KU09OXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgYEJsb2NrYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNCbG9jayhhbnkpIHtcbiAgICByZXR1cm4gISEoYW55ICYmIGFueVtNT0RFTF9UWVBFUy5CTE9DS10pXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBibG9jayBsaXN0LlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gYW55XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc0Jsb2NrTGlzdChhbnkpIHtcbiAgICByZXR1cm4gTGlzdC5pc0xpc3QoYW55KSAmJiBhbnkuZXZlcnkoaXRlbSA9PiBCbG9jay5pc0Jsb2NrKGl0ZW0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbm9kZSdzIGtpbmQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgcmV0dXJuICdibG9jaydcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiB0aGUgYmxvY2sgaXMgZW1wdHkuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0VtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLnRleHQgPT0gJydcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNvbmNhdGVuYXRlZCB0ZXh0IG9mIGFsbCB0aGUgYmxvY2sncyBjaGlsZHJlbi5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQgdGV4dCgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUZXh0KClcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm4gYSBKU09OIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBibG9jay5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04ob3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAga2luZDogdGhpcy5raW5kLFxuICAgICAgdHlwZTogdGhpcy50eXBlLFxuICAgICAgaXNWb2lkOiB0aGlzLmlzVm9pZCxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YS50b0pTT04oKSxcbiAgICAgIG5vZGVzOiB0aGlzLm5vZGVzLnRvQXJyYXkoKS5tYXAobiA9PiBuLnRvSlNPTihvcHRpb25zKSksXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucHJlc2VydmVLZXlzKSB7XG4gICAgICBvYmplY3Qua2V5ID0gdGhpcy5rZXlcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYHRvSlNgLlxuICAgKi9cblxuICB0b0pTKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50b0pTT04ob3B0aW9ucylcbiAgfVxuXG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5CbG9jay5wcm90b3R5cGVbTU9ERUxfVFlQRVMuQkxPQ0tdID0gdHJ1ZVxuXG4vKipcbiAqIE1peCBpbiBgTm9kZWAgbWV0aG9kcy5cbiAqL1xuXG5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhOb2RlLnByb3RvdHlwZSkuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gIGlmIChtZXRob2QgPT0gJ2NvbnN0cnVjdG9yJykgcmV0dXJuXG4gIEJsb2NrLnByb3RvdHlwZVttZXRob2RdID0gTm9kZS5wcm90b3R5cGVbbWV0aG9kXVxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0Jsb2NrfVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IEJsb2NrXG4iXX0=