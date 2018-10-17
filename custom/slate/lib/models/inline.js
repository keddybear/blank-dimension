'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./document');

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _immutable = require('immutable');

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

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
 * Inline.
 *
 * @type {Inline}
 */

var Inline = function (_Record) {
  _inherits(Inline, _Record);

  function Inline() {
    _classCallCheck(this, Inline);

    return _possibleConstructorReturn(this, (Inline.__proto__ || Object.getPrototypeOf(Inline)).apply(this, arguments));
  }

  _createClass(Inline, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the inline.
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
      return 'inline';
    }

    /**
     * Check if the inline is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the concatenated text of all the inline's children.
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
     * Create a new `Inline` with `attrs`.
     *
     * @param {Object|String|Inline} attrs
     * @return {Inline}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Inline.isInline(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { type: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Inline.fromJSON(attrs);
      }

      throw new Error('`Inline.create` only accepts objects, strings or inlines, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Inlines` from an array.
     *
     * @param {Array<Inline|Object>|List<Inline|Object>} elements
     * @return {List<Inline>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Inline.create));
        return list;
      }

      throw new Error('`Inline.createList` only accepts arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Inline` from a JSON `object`.
     *
     * @param {Object|Inline} object
     * @return {Inline}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Inline.isInline(object)) {
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
        throw new Error('`Inline.fromJS` requires a `type` string.');
      }

      var inline = new Inline({
        key: key,
        type: type,
        isVoid: !!isVoid,
        data: new _immutable.Map(data),
        nodes: new _immutable.List(nodes.map(_node2.default.fromJSON))
      });

      return inline;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isInline',


    /**
     * Check if `any` is a `Inline`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isInline(any) {
      return !!(any && any[_modelTypes2.default.INLINE]);
    }

    /**
     * Check if `any` is a list of inlines.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isInlineList',
    value: function isInlineList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Inline.isInline(item);
      });
    }
  }]);

  return Inline;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Inline.fromJS = Inline.fromJSON;
Inline.prototype[_modelTypes2.default.INLINE] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(_node2.default.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Inline.prototype[method] = _node2.default.prototype[method];
});

/**
 * Export.
 *
 * @type {Inline}
 */

exports.default = Inline;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvaW5saW5lLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRTIiwiZGF0YSIsImlzVm9pZCIsImtleSIsInVuZGVmaW5lZCIsIm5vZGVzIiwidHlwZSIsIklubGluZSIsIm9wdGlvbnMiLCJvYmplY3QiLCJraW5kIiwidG9KU09OIiwidG9BcnJheSIsIm1hcCIsIm4iLCJwcmVzZXJ2ZUtleXMiLCJ0ZXh0IiwiZ2V0VGV4dCIsImF0dHJzIiwiaXNJbmxpbmUiLCJmcm9tSlNPTiIsIkVycm9yIiwiZWxlbWVudHMiLCJpc0xpc3QiLCJBcnJheSIsImlzQXJyYXkiLCJsaXN0IiwiY3JlYXRlIiwiaW5saW5lIiwiYW55IiwiSU5MSU5FIiwiZXZlcnkiLCJpdGVtIiwiZnJvbUpTIiwicHJvdG90eXBlIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImZvckVhY2giLCJtZXRob2QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBS0E7O0FBTUE7Ozs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7O0FBZkE7Ozs7QUFNQTs7OztBQVdBOzs7Ozs7QUFNQSxJQUFNQSxXQUFXO0FBQ2ZDLFFBQU0sb0JBRFM7QUFFZkMsVUFBUSxLQUZPO0FBR2ZDLE9BQUtDLFNBSFU7QUFJZkMsU0FBTyxxQkFKUTtBQUtmQyxRQUFNRjtBQUxTLENBQWpCOztBQVFBOzs7Ozs7SUFNTUcsTTs7Ozs7Ozs7Ozs7OztBQXNJSjs7Ozs7Ozs2QkFPcUI7QUFBQSxVQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQ25CLFVBQU1DLFNBQVM7QUFDYkMsY0FBTSxLQUFLQSxJQURFO0FBRWJKLGNBQU0sS0FBS0EsSUFGRTtBQUdiSixnQkFBUSxLQUFLQSxNQUhBO0FBSWJELGNBQU0sS0FBS0EsSUFBTCxDQUFVVSxNQUFWLEVBSk87QUFLYk4sZUFBTyxLQUFLQSxLQUFMLENBQVdPLE9BQVgsR0FBcUJDLEdBQXJCLENBQXlCO0FBQUEsaUJBQUtDLEVBQUVILE1BQUYs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UXhCLE9BQU9ZLFFBQVAsQ0FBZ0JhLElBQWhCLENBQVI7QUFBQSxPQUFWLENBQTNCO0FBQ0Q7Ozs7RUF0R2tCLHVCQUFPaEMsUUFBUCxDOztBQXVLckI7Ozs7QUF2S01PLE0sQ0FnRkcwQixNLEdBQVMxQixPQUFPYSxRO0FBMkZ6QmIsT0FBTzJCLFNBQVAsQ0FBaUIscUJBQVlKLE1BQTdCLElBQXVDLElBQXZDOztBQUVBOzs7O0FBSUFLLE9BQU9DLG1CQUFQLENBQTJCLGVBQUtGLFNBQWhDLEVBQTJDRyxPQUEzQyxDQUFtRCxVQUFDQyxNQUFELEVBQVk7QUFDN0QsTUFBSUEsVUFBVSxhQUFkLEVBQTZCO0FBQzdCL0IsU0FBTzJCLFNBQVAsQ0FBaUJJLE1BQWpCLElBQTJCLGVBQUtKLFNBQUwsQ0FBZUksTUFBZixDQUEzQjtBQUNELENBSEQ7O0FBS0E7Ozs7OztrQkFNZS9CLE0iLCJmaWxlIjoiaW5saW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIFByZXZlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCAnLi9kb2N1bWVudCdcblxuLyoqXG4gKiBEZXBlbmRlbmNpZXMuXG4gKi9cblxuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnaXMtcGxhaW4tb2JqZWN0J1xuaW1wb3J0IHsgTGlzdCwgTWFwLCBSZWNvcmQgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBOb2RlIGZyb20gJy4vbm9kZSdcbmltcG9ydCBNT0RFTF9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvbW9kZWwtdHlwZXMnXG5pbXBvcnQgZ2VuZXJhdGVLZXkgZnJvbSAnLi4vdXRpbHMvZ2VuZXJhdGUta2V5J1xuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICBkYXRhOiBuZXcgTWFwKCksXG4gIGlzVm9pZDogZmFsc2UsXG4gIGtleTogdW5kZWZpbmVkLFxuICBub2RlczogbmV3IExpc3QoKSxcbiAgdHlwZTogdW5kZWZpbmVkLFxufVxuXG4vKipcbiAqIElubGluZS5cbiAqXG4gKiBAdHlwZSB7SW5saW5lfVxuICovXG5cbmNsYXNzIElubGluZSBleHRlbmRzIFJlY29yZChERUZBVUxUUykge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYElubGluZWAgd2l0aCBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxTdHJpbmd8SW5saW5lfSBhdHRyc1xuICAgKiBAcmV0dXJuIHtJbmxpbmV9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSkge1xuICAgIGlmIChJbmxpbmUuaXNJbmxpbmUoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gYXR0cnNcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGF0dHJzID09ICdzdHJpbmcnKSB7XG4gICAgICBhdHRycyA9IHsgdHlwZTogYXR0cnMgfVxuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgcmV0dXJuIElubGluZS5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYElubGluZS5jcmVhdGVcXGAgb25seSBhY2NlcHRzIG9iamVjdHMsIHN0cmluZ3Mgb3IgaW5saW5lcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBsaXN0IG9mIGBJbmxpbmVzYCBmcm9tIGFuIGFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5PElubGluZXxPYmplY3Q+fExpc3Q8SW5saW5lfE9iamVjdD59IGVsZW1lbnRzXG4gICAqIEByZXR1cm4ge0xpc3Q8SW5saW5lPn1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZUxpc3QoZWxlbWVudHMgPSBbXSkge1xuICAgIGlmIChMaXN0LmlzTGlzdChlbGVtZW50cykgfHwgQXJyYXkuaXNBcnJheShlbGVtZW50cykpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBuZXcgTGlzdChlbGVtZW50cy5tYXAoSW5saW5lLmNyZWF0ZSkpXG4gICAgICByZXR1cm4gbGlzdFxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgSW5saW5lLmNyZWF0ZUxpc3RcXGAgb25seSBhY2NlcHRzIGFycmF5cyBvciBsaXN0cywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7ZWxlbWVudHN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgSW5saW5lYCBmcm9tIGEgSlNPTiBgb2JqZWN0YC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8SW5saW5lfSBvYmplY3RcbiAgICogQHJldHVybiB7SW5saW5lfVxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTT04ob2JqZWN0KSB7XG4gICAgaWYgKElubGluZS5pc0lubGluZShvYmplY3QpKSB7XG4gICAgICByZXR1cm4gb2JqZWN0XG4gICAgfVxuXG4gICAgY29uc3Qge1xuICAgICAgZGF0YSA9IHt9LFxuICAgICAgaXNWb2lkID0gZmFsc2UsXG4gICAgICBrZXkgPSBnZW5lcmF0ZUtleSgpLFxuICAgICAgbm9kZXMgPSBbXSxcbiAgICAgIHR5cGUsXG4gICAgfSA9IG9iamVjdFxuXG4gICAgaWYgKHR5cGVvZiB0eXBlICE9ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2BJbmxpbmUuZnJvbUpTYCByZXF1aXJlcyBhIGB0eXBlYCBzdHJpbmcuJylcbiAgICB9XG5cbiAgICBjb25zdCBpbmxpbmUgPSBuZXcgSW5saW5lKHtcbiAgICAgIGtleSxcbiAgICAgIHR5cGUsXG4gICAgICBpc1ZvaWQ6ICEhaXNWb2lkLFxuICAgICAgZGF0YTogbmV3IE1hcChkYXRhKSxcbiAgICAgIG5vZGVzOiBuZXcgTGlzdChub2Rlcy5tYXAoTm9kZS5mcm9tSlNPTikpLFxuICAgIH0pXG5cbiAgICByZXR1cm4gaW5saW5lXG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYGZyb21KU2AuXG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlMgPSBJbmxpbmUuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgSW5saW5lYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNJbmxpbmUoYW55KSB7XG4gICAgcmV0dXJuICEhKGFueSAmJiBhbnlbTU9ERUxfVFlQRVMuSU5MSU5FXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgYW55YCBpcyBhIGxpc3Qgb2YgaW5saW5lcy5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNJbmxpbmVMaXN0KGFueSkge1xuICAgIHJldHVybiBMaXN0LmlzTGlzdChhbnkpICYmIGFueS5ldmVyeShpdGVtID0+IElubGluZS5pc0lubGluZShpdGVtKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5vZGUncyBraW5kLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBraW5kKCkge1xuICAgIHJldHVybiAnaW5saW5lJ1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHRoZSBpbmxpbmUgaXMgZW1wdHkuXG4gICAqXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIGdldCBpc0VtcHR5KCkge1xuICAgIHJldHVybiB0aGlzLnRleHQgPT0gJydcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGNvbmNhdGVuYXRlZCB0ZXh0IG9mIGFsbCB0aGUgaW5saW5lJ3MgY2hpbGRyZW4uXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IHRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGV4dCgpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgaW5saW5lLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9XG4gICAqL1xuXG4gIHRvSlNPTihvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBvYmplY3QgPSB7XG4gICAgICBraW5kOiB0aGlzLmtpbmQsXG4gICAgICB0eXBlOiB0aGlzLnR5cGUsXG4gICAgICBpc1ZvaWQ6IHRoaXMuaXNWb2lkLFxuICAgICAgZGF0YTogdGhpcy5kYXRhLnRvSlNPTigpLFxuICAgICAgbm9kZXM6IHRoaXMubm9kZXMudG9BcnJheSgpLm1hcChuID0+IG4udG9KU09OKG9wdGlvbnMpKSxcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5wcmVzZXJ2ZUtleXMpIHtcbiAgICAgIG9iamVjdC5rZXkgPSB0aGlzLmtleVxuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgdG9KU2AuXG4gICAqL1xuXG4gIHRvSlMob3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLnRvSlNPTihvcHRpb25zKVxuICB9XG5cbn1cblxuLyoqXG4gKiBBdHRhY2ggYSBwc2V1ZG8tc3ltYm9sIGZvciB0eXBlIGNoZWNraW5nLlxuICovXG5cbklubGluZS5wcm90b3R5cGVbTU9ERUxfVFlQRVMuSU5MSU5FXSA9IHRydWVcblxuLyoqXG4gKiBNaXggaW4gYE5vZGVgIG1ldGhvZHMuXG4gKi9cblxuT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoTm9kZS5wcm90b3R5cGUpLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICBpZiAobWV0aG9kID09ICdjb25zdHJ1Y3RvcicpIHJldHVyblxuICBJbmxpbmUucHJvdG90eXBlW21ldGhvZF0gPSBOb2RlLnByb3RvdHlwZVttZXRob2RdXG59KVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7SW5saW5lfVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IElubGluZVxuIl19