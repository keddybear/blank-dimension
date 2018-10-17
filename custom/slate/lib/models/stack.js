'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

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
  plugins: []
};

/**
 * Stack.
 *
 * @type {Stack}
 */

var Stack = function (_Record) {
  _inherits(Stack, _Record);

  function Stack() {
    _classCallCheck(this, Stack);

    return _possibleConstructorReturn(this, (Stack.__proto__ || Object.getPrototypeOf(Stack)).apply(this, arguments));
  }

  _createClass(Stack, [{
    key: 'getPluginsWith',


    /**
     * Get all plugins with `property`.
     *
     * @param {String} property
     * @return {Array}
     */

    value: function getPluginsWith(property) {
      return this.plugins.filter(function (plugin) {
        return plugin[property] != null;
      });
    }

    /**
     * Iterate the plugins with `property`, returning the first non-null value.
     *
     * @param {String} property
     * @param {Any} ...args
     */

  }, {
    key: 'find',
    value: function find(property) {
      var plugins = this.getPluginsWith(property);

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = plugins[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var plugin = _step.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) return ret;
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

    /**
     * Iterate the plugins with `property`, returning all the non-null values.
     *
     * @param {String} property
     * @param {Any} ...args
     * @return {Array}
     */

  }, {
    key: 'map',
    value: function map(property) {
      var plugins = this.getPluginsWith(property);
      var array = [];

      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = plugins[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var plugin = _step2.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) array.push(ret);
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return array;
    }

    /**
     * Iterate the plugins with `property`, breaking on any a non-null values.
     *
     * @param {String} property
     * @param {Any} ...args
     */

  }, {
    key: 'run',
    value: function run(property) {
      var plugins = this.getPluginsWith(property);

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = plugins[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var plugin = _step3.value;

          var ret = plugin[property].apply(plugin, args);
          if (ret != null) return;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }

    /**
     * Iterate the plugins with `property`, reducing to a set of React children.
     *
     * @param {String} property
     * @param {Object} props
     * @param {Any} ...args
     */

  }, {
    key: 'render',
    value: function render(property, props) {
      var plugins = this.getPluginsWith(property).reverse();
      var _props$children = props.children,
          children = _props$children === undefined ? null : _props$children;

      for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {

        for (var _iterator4 = plugins[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var plugin = _step4.value;

          var ret = plugin[property].apply(plugin, [props].concat(args));
          if (ret == null) continue;
          props.children = children = ret;
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return children;
    }
  }, {
    key: 'kind',


    /**
     * Get the kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'stack';
    }
  }], [{
    key: 'create',


    /**
     * Constructor.
     *
     * @param {Object} attrs
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _attrs$plugins = attrs.plugins,
          plugins = _attrs$plugins === undefined ? [] : _attrs$plugins;

      var stack = new Stack({ plugins: plugins });
      return stack;
    }

    /**
     * Check if `any` is a `Stack`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isStack',
    value: function isStack(any) {
      return !!(any && any[_modelTypes2.default.STACK]);
    }
  }]);

  return Stack;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Stack.prototype[_modelTypes2.default.STACK] = true;

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Stack.prototype, ['getPluginsWith'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Stack}
 */

exports.default = Stack;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvc3RhY2suanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJwbHVnaW5zIiwiU3RhY2siLCJwcm9wZXJ0eSIsImZpbHRlciIsInBsdWdpbiIsImdldFBsdWdpbnNXaXRoIiwiYXJncyIsInJldCIsImFycmF5IiwicHVzaCIsInByb3BzIiwicmV2ZXJzZSIsImNoaWxkcmVuIiwiYXR0cnMiLCJzdGFjayIsImFueSIsIlNUQUNLIiwicHJvdG90eXBlIiwidGFrZXNBcmd1bWVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7O0FBRUE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFdBQVc7QUFDZkMsV0FBUztBQURNLENBQWpCOztBQUlBOzs7Ozs7SUFNTUMsSzs7Ozs7Ozs7Ozs7OztBQW1DSjs7Ozs7OzttQ0FPZUMsUSxFQUFVO0FBQ3ZCLGFBQU8sS0FBS0YsT0FBTCxDQUFhRyxNQUFiLENBQW9CO0FBQUEsZUFBVUMsT0FBT0YsUUFBUCxLQUFvQixJQUE5QjtBQUFBLE9BQXBCLENBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7O3lCQU9LQSxRLEVBQW1CO0FBQ3RCLFVBQU1GLFVBQVUsS0FBS0ssY0FBTCxDQUFvQkgsUUFBcEIsQ0FBaEI7O0FBRHNCLHdDQUFOSSxJQUFNO0FBQU5BLFlBQU07QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFHdEIsNkJBQXFCTixPQUFyQiw4SEFBOEI7QUFBQSxjQUFuQkksTUFBbUI7O0FBQzVCLGNBQU1HLE1BQU1ILE9BQU9GLFFBQVAsZ0JBQW9CSSxJQUFwQixDQUFaO0FBQ0EsY0FBSUMsT0FBTyxJQUFYLEVBQWlCLE9BQU9BLEdBQVA7QUFDbEI7QUFOcUI7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQU92Qjs7QUFFRDs7Ozs7Ozs7Ozt3QkFRSUwsUSxFQUFtQjtBQUNyQixVQUFNRixVQUFVLEtBQUtLLGNBQUwsQ0FBb0JILFFBQXBCLENBQWhCO0FBQ0EsVUFBTU0sUUFBUSxFQUFkOztBQUZxQix5Q0FBTkYsSUFBTTtBQUFOQSxZQUFNO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBSXJCLDhCQUFxQk4sT0FBckIsbUlBQThCO0FBQUEsY0FBbkJJLE1BQW1COztBQUM1QixjQUFNRyxNQUFNSCxPQUFPRixRQUFQLGdCQUFvQkksSUFBcEIsQ0FBWjtBQUNBLGNBQUlDLE9BQU8sSUFBWCxFQUFpQkMsTUFBTUMsSUFBTixDQUFXRixHQUFYO0FBQ2xCO0FBUG9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBU3JCLGFBQU9DLEtBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7O3dCQU9JTixRLEVBQW1CO0FBQ3JCLFVBQU1GLFVBQVUsS0FBS0ssY0FBTCxDQUFvQkgsUUFBcEIsQ0FBaEI7O0FBRHFCLHlDQUFOSSxJQUFNO0FBQU5BLFlBQU07QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFHckIsOEJBQXFCTixPQUFyQixtSUFBOEI7QUFBQSxjQUFuQkksTUFBbUI7O0FBQzVCLGNBQU1HLE1BQU1ILE9BQU9GLFFBQVAsZ0JBQW9CSSxJQUFwQixDQUFaO0FBQ0EsY0FBSUMsT0FBTyxJQUFYLEVBQWlCO0FBQ2xCO0FBTm9CO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFPdEI7O0FBRUQ7Ozs7Ozs7Ozs7MkJBUU9MLFEsRUFBVVEsSyxFQUFnQjtBQUMvQixVQUFNVixVQUFVLEtBQUtLLGNBQUwsQ0FBb0JILFFBQXBCLEVBQThCUyxPQUE5QixFQUFoQjtBQUQrQiw0QkFFTEQsS0FGSyxDQUV6QkUsUUFGeUI7QUFBQSxVQUV6QkEsUUFGeUIsbUNBRWQsSUFGYzs7QUFBQSx5Q0FBTk4sSUFBTTtBQUFOQSxZQUFNO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBOztBQUkvQiw4QkFBcUJOLE9BQXJCLG1JQUE4QjtBQUFBLGNBQW5CSSxNQUFtQjs7QUFDNUIsY0FBTUcsTUFBTUgsT0FBT0YsUUFBUCxpQkFBaUJRLEtBQWpCLFNBQTJCSixJQUEzQixFQUFaO0FBQ0EsY0FBSUMsT0FBTyxJQUFYLEVBQWlCO0FBQ2pCRyxnQkFBTUUsUUFBTixHQUFpQkEsV0FBV0wsR0FBNUI7QUFDRDtBQVI4QjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQVUvQixhQUFPSyxRQUFQO0FBQ0Q7Ozs7O0FBNUZEOzs7Ozs7d0JBTVc7QUFDVCxhQUFPLE9BQVA7QUFDRDs7Ozs7QUEvQkQ7Ozs7Ozs2QkFNMEI7QUFBQSxVQUFaQyxLQUFZLHVFQUFKLEVBQUk7QUFBQSwyQkFDQ0EsS0FERCxDQUNoQmIsT0FEZ0I7QUFBQSxVQUNoQkEsT0FEZ0Isa0NBQ04sRUFETTs7QUFFeEIsVUFBTWMsUUFBUSxJQUFJYixLQUFKLENBQVUsRUFBRUQsZ0JBQUYsRUFBVixDQUFkO0FBQ0EsYUFBT2MsS0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7NEJBT2VDLEcsRUFBSztBQUNsQixhQUFPLENBQUMsRUFBRUEsT0FBT0EsSUFBSSxxQkFBWUMsS0FBaEIsQ0FBVCxDQUFSO0FBQ0Q7Ozs7RUF2QmlCLHVCQUFPakIsUUFBUCxDOztBQXlIcEI7Ozs7QUFJQUUsTUFBTWdCLFNBQU4sQ0FBZ0IscUJBQVlELEtBQTVCLElBQXFDLElBQXJDOztBQUVBOzs7O0FBSUEsdUJBQVFmLE1BQU1nQixTQUFkLEVBQXlCLENBQ3ZCLGdCQUR1QixDQUF6QixFQUVHO0FBQ0RDLGtCQUFnQjtBQURmLENBRkg7O0FBTUE7Ozs7OztrQkFNZWpCLEsiLCJmaWxlIjoic3RhY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IFJlY29yZCB9IGZyb20gJ2ltbXV0YWJsZSdcblxuaW1wb3J0IE1PREVMX1RZUEVTIGZyb20gJy4uL2NvbnN0YW50cy9tb2RlbC10eXBlcydcbmltcG9ydCBtZW1vaXplIGZyb20gJy4uL3V0aWxzL21lbW9pemUnXG5cbi8qKlxuICogRGVmYXVsdCBwcm9wZXJ0aWVzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgREVGQVVMVFMgPSB7XG4gIHBsdWdpbnM6IFtdLFxufVxuXG4vKipcbiAqIFN0YWNrLlxuICpcbiAqIEB0eXBlIHtTdGFja31cbiAqL1xuXG5jbGFzcyBTdGFjayBleHRlbmRzIFJlY29yZChERUZBVUxUUykge1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3Rvci5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSkge1xuICAgIGNvbnN0IHsgcGx1Z2lucyA9IFtdIH0gPSBhdHRyc1xuICAgIGNvbnN0IHN0YWNrID0gbmV3IFN0YWNrKHsgcGx1Z2lucyB9KVxuICAgIHJldHVybiBzdGFja1xuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgYFN0YWNrYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNTdGFjayhhbnkpIHtcbiAgICByZXR1cm4gISEoYW55ICYmIGFueVtNT0RFTF9UWVBFUy5TVEFDS10pXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBraW5kLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBraW5kKCkge1xuICAgIHJldHVybiAnc3RhY2snXG4gIH1cblxuICAvKipcbiAgICogR2V0IGFsbCBwbHVnaW5zIHdpdGggYHByb3BlcnR5YC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBnZXRQbHVnaW5zV2l0aChwcm9wZXJ0eSkge1xuICAgIHJldHVybiB0aGlzLnBsdWdpbnMuZmlsdGVyKHBsdWdpbiA9PiBwbHVnaW5bcHJvcGVydHldICE9IG51bGwpXG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSB0aGUgcGx1Z2lucyB3aXRoIGBwcm9wZXJ0eWAsIHJldHVybmluZyB0aGUgZmlyc3Qgbm9uLW51bGwgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge0FueX0gLi4uYXJnc1xuICAgKi9cblxuICBmaW5kKHByb3BlcnR5LCAuLi5hcmdzKSB7XG4gICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuZ2V0UGx1Z2luc1dpdGgocHJvcGVydHkpXG5cbiAgICBmb3IgKGNvbnN0IHBsdWdpbiBvZiBwbHVnaW5zKSB7XG4gICAgICBjb25zdCByZXQgPSBwbHVnaW5bcHJvcGVydHldKC4uLmFyZ3MpXG4gICAgICBpZiAocmV0ICE9IG51bGwpIHJldHVybiByZXRcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSXRlcmF0ZSB0aGUgcGx1Z2lucyB3aXRoIGBwcm9wZXJ0eWAsIHJldHVybmluZyBhbGwgdGhlIG5vbi1udWxsIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAqIEBwYXJhbSB7QW55fSAuLi5hcmdzXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cblxuICBtYXAocHJvcGVydHksIC4uLmFyZ3MpIHtcbiAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5nZXRQbHVnaW5zV2l0aChwcm9wZXJ0eSlcbiAgICBjb25zdCBhcnJheSA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IHBsdWdpbiBvZiBwbHVnaW5zKSB7XG4gICAgICBjb25zdCByZXQgPSBwbHVnaW5bcHJvcGVydHldKC4uLmFyZ3MpXG4gICAgICBpZiAocmV0ICE9IG51bGwpIGFycmF5LnB1c2gocmV0KVxuICAgIH1cblxuICAgIHJldHVybiBhcnJheVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgdGhlIHBsdWdpbnMgd2l0aCBgcHJvcGVydHlgLCBicmVha2luZyBvbiBhbnkgYSBub24tbnVsbCB2YWx1ZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wZXJ0eVxuICAgKiBAcGFyYW0ge0FueX0gLi4uYXJnc1xuICAgKi9cblxuICBydW4ocHJvcGVydHksIC4uLmFyZ3MpIHtcbiAgICBjb25zdCBwbHVnaW5zID0gdGhpcy5nZXRQbHVnaW5zV2l0aChwcm9wZXJ0eSlcblxuICAgIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbiAgICAgIGNvbnN0IHJldCA9IHBsdWdpbltwcm9wZXJ0eV0oLi4uYXJncylcbiAgICAgIGlmIChyZXQgIT0gbnVsbCkgcmV0dXJuXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEl0ZXJhdGUgdGhlIHBsdWdpbnMgd2l0aCBgcHJvcGVydHlgLCByZWR1Y2luZyB0byBhIHNldCBvZiBSZWFjdCBjaGlsZHJlbi5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wc1xuICAgKiBAcGFyYW0ge0FueX0gLi4uYXJnc1xuICAgKi9cblxuICByZW5kZXIocHJvcGVydHksIHByb3BzLCAuLi5hcmdzKSB7XG4gICAgY29uc3QgcGx1Z2lucyA9IHRoaXMuZ2V0UGx1Z2luc1dpdGgocHJvcGVydHkpLnJldmVyc2UoKVxuICAgIGxldCB7IGNoaWxkcmVuID0gbnVsbCB9ID0gcHJvcHNcblxuICAgIGZvciAoY29uc3QgcGx1Z2luIG9mIHBsdWdpbnMpIHtcbiAgICAgIGNvbnN0IHJldCA9IHBsdWdpbltwcm9wZXJ0eV0ocHJvcHMsIC4uLmFyZ3MpXG4gICAgICBpZiAocmV0ID09IG51bGwpIGNvbnRpbnVlXG4gICAgICBwcm9wcy5jaGlsZHJlbiA9IGNoaWxkcmVuID0gcmV0XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkcmVuXG4gIH1cblxufVxuXG4vKipcbiAqIEF0dGFjaCBhIHBzZXVkby1zeW1ib2wgZm9yIHR5cGUgY2hlY2tpbmcuXG4gKi9cblxuU3RhY2sucHJvdG90eXBlW01PREVMX1RZUEVTLlNUQUNLXSA9IHRydWVcblxuLyoqXG4gKiBNZW1vaXplIHJlYWQgbWV0aG9kcy5cbiAqL1xuXG5tZW1vaXplKFN0YWNrLnByb3RvdHlwZSwgW1xuICAnZ2V0UGx1Z2luc1dpdGgnLFxuXSwge1xuICB0YWtlc0FyZ3VtZW50czogdHJ1ZSxcbn0pXG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtTdGFja31cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBTdGFja1xuIl19