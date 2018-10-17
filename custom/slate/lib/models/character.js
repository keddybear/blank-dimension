'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _immutable = require('immutable');

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

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
  marks: new _immutable.Set(),
  text: ''
};

/**
 * Character.
 *
 * @type {Character}
 */

var Character = function (_Record) {
  _inherits(Character, _Record);

  function Character() {
    _classCallCheck(this, Character);

    return _possibleConstructorReturn(this, (Character.__proto__ || Object.getPrototypeOf(Character)).apply(this, arguments));
  }

  _createClass(Character, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the character.
     *
     * @return {Object}
     */

    value: function toJSON() {
      var object = {
        kind: this.kind,
        text: this.text,
        marks: this.marks.toArray().map(function (m) {
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
      return 'character';
    }
  }], [{
    key: 'create',


    /**
     * Create a `Character` with `attrs`.
     *
     * @param {Object|String|Character} attrs
     * @return {Character}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Character.isCharacter(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { text: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Character.fromJSON(attrs);
      }

      throw new Error('`Character.create` only accepts objects, strings or characters, but you passed it: ' + attrs);
    }

    /**
     * Create a list of `Characters` from `elements`.
     *
     * @param {String|Array<Object|Character|String>|List<Object|Character|String>} elements
     * @return {List<Character>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var elements = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (typeof elements == 'string') {
        elements = elements.split('');
      }

      if (_immutable.List.isList(elements) || Array.isArray(elements)) {
        var list = new _immutable.List(elements.map(Character.create));
        return list;
      }

      throw new Error('`Block.createList` only accepts strings, arrays or lists, but you passed it: ' + elements);
    }

    /**
     * Create a `Character` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Character}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var text = object.text,
          _object$marks = object.marks,
          marks = _object$marks === undefined ? [] : _object$marks;


      if (typeof text != 'string') {
        throw new Error('`Character.fromJSON` requires a block `text` string.');
      }

      var character = new Character({
        text: text,
        marks: new _immutable.Set(marks)
      });

      return character;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isCharacter',


    /**
     * Check if `any` is a `Character`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isCharacter(any) {
      return !!(any && any[_modelTypes2.default.CHARACTER]);
    }

    /**
     * Check if `any` is a character list.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isCharacterList',
    value: function isCharacterList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Character.isCharacter(item);
      });
    }
  }]);

  return Character;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Character.fromJS = Character.fromJSON;
Character.prototype[_modelTypes2.default.CHARACTER] = true;

/**
 * Export.
 *
 * @type {Character}
 */

exports.default = Character;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvY2hhcmFjdGVyLmpzIl0sIm5hbWVzIjpbIkRFRkFVTFRTIiwibWFya3MiLCJ0ZXh0IiwiQ2hhcmFjdGVyIiwib2JqZWN0Iiwia2luZCIsInRvQXJyYXkiLCJtYXAiLCJtIiwidG9KU09OIiwiYXR0cnMiLCJpc0NoYXJhY3RlciIsImZyb21KU09OIiwiRXJyb3IiLCJlbGVtZW50cyIsInNwbGl0IiwiaXNMaXN0IiwiQXJyYXkiLCJpc0FycmF5IiwibGlzdCIsImNyZWF0ZSIsImNoYXJhY3RlciIsImFueSIsIkNIQVJBQ1RFUiIsImV2ZXJ5IiwiaXRlbSIsImZyb21KUyIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsV0FBVztBQUNmQyxTQUFPLG9CQURRO0FBRWZDLFFBQU07QUFGUyxDQUFqQjs7QUFLQTs7Ozs7O0lBTU1DLFM7Ozs7Ozs7Ozs7Ozs7QUE0R0o7Ozs7Ozs2QkFNUztBQUNQLFVBQU1DLFNBQVM7QUFDYkMsY0FBTSxLQUFLQSxJQURFO0FBRWJILGNBQU0sS0FBS0EsSUFGRTtBQUdiRCxlQUFPLEtBQUtBLEtBQUwsQ0FBV0ssT0FBWCxHQUFxQkMsR0FBckIsQ0FBeUI7QUFBQSxpQkFBS0MsRUFBRUMsTUFBRixFQUFMO0FBQUEsU0FBekI7QUFITSxPQUFmOztBQU1BLGFBQU9MLE1BQVA7QUFDRDs7QUFFRDs7Ozs7OzJCQUlPO0FBQ0wsYUFBTyxLQUFLSyxNQUFMLEVBQVA7QUFDRDs7Ozs7QUFoQ0Q7Ozs7Ozt3QkFNVztBQUNULGFBQU8sV0FBUDtBQUNEOzs7OztBQXhHRDs7Ozs7Ozs2QkFPMEI7QUFBQSxVQUFaQyxLQUFZLHVFQUFKLEVBQUk7O0FBQ3hCLFVBQUlQLFVBQVVRLFdBQVYsQ0FBc0JELEtBQXRCLENBQUosRUFBa0M7QUFDaEMsZUFBT0EsS0FBUDtBQUNEOztBQUVELFVBQUksT0FBT0EsS0FBUCxJQUFnQixRQUFwQixFQUE4QjtBQUM1QkEsZ0JBQVEsRUFBRVIsTUFBTVEsS0FBUixFQUFSO0FBQ0Q7O0FBRUQsVUFBSSw2QkFBY0EsS0FBZCxDQUFKLEVBQTBCO0FBQ3hCLGVBQU9QLFVBQVVTLFFBQVYsQ0FBbUJGLEtBQW5CLENBQVA7QUFDRDs7QUFFRCxZQUFNLElBQUlHLEtBQUoseUZBQWtHSCxLQUFsRyxDQUFOO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OztpQ0FPaUM7QUFBQSxVQUFmSSxRQUFlLHVFQUFKLEVBQUk7O0FBQy9CLFVBQUksT0FBT0EsUUFBUCxJQUFtQixRQUF2QixFQUFpQztBQUMvQkEsbUJBQVdBLFNBQVNDLEtBQVQsQ0FBZSxFQUFmLENBQVg7QUFDRDs7QUFFRCxVQUFJLGdCQUFLQyxNQUFMLENBQVlGLFFBQVosS0FBeUJHLE1BQU1DLE9BQU4sQ0FBY0osUUFBZCxDQUE3QixFQUFzRDtBQUNwRCxZQUFNSyxPQUFPLG9CQUFTTCxTQUFTUCxHQUFULENBQWFKLFVBQVVpQixNQUF2QixDQUFULENBQWI7QUFDQSxlQUFPRCxJQUFQO0FBQ0Q7O0FBRUQsWUFBTSxJQUFJTixLQUFKLG1GQUE0RkMsUUFBNUYsQ0FBTjtBQUNEOztBQUVEOzs7Ozs7Ozs7NkJBT2dCVixNLEVBQVE7QUFBQSxVQUVwQkYsSUFGb0IsR0FJbEJFLE1BSmtCLENBRXBCRixJQUZvQjtBQUFBLDBCQUlsQkUsTUFKa0IsQ0FHcEJILEtBSG9CO0FBQUEsVUFHcEJBLEtBSG9CLGlDQUdaLEVBSFk7OztBQU10QixVQUFJLE9BQU9DLElBQVAsSUFBZSxRQUFuQixFQUE2QjtBQUMzQixjQUFNLElBQUlXLEtBQUosQ0FBVSxzREFBVixDQUFOO0FBQ0Q7O0FBRUQsVUFBTVEsWUFBWSxJQUFJbEIsU0FBSixDQUFjO0FBQzlCRCxrQkFEOEI7QUFFOUJELGVBQU8sbUJBQVFBLEtBQVI7QUFGdUIsT0FBZCxDQUFsQjs7QUFLQSxhQUFPb0IsU0FBUDtBQUNEOztBQUVEOzs7Ozs7OztBQU1BOzs7Ozs7O2dDQU9tQkMsRyxFQUFLO0FBQ3RCLGFBQU8sQ0FBQyxFQUFFQSxPQUFPQSxJQUFJLHFCQUFZQyxTQUFoQixDQUFULENBQVI7QUFDRDs7QUFFRDs7Ozs7Ozs7O29DQU91QkQsRyxFQUFLO0FBQzFCLGFBQU8sZ0JBQUtOLE1BQUwsQ0FBWU0sR0FBWixLQUFvQkEsSUFBSUUsS0FBSixDQUFVO0FBQUEsZUFBUXJCLFVBQVVRLFdBQVYsQ0FBc0JjLElBQXRCLENBQVI7QUFBQSxPQUFWLENBQTNCO0FBQ0Q7Ozs7RUFoR3FCLHVCQUFPekIsUUFBUCxDOztBQXNJeEI7Ozs7QUF0SU1HLFMsQ0EwRUd1QixNLEdBQVN2QixVQUFVUyxRO0FBZ0U1QlQsVUFBVXdCLFNBQVYsQ0FBb0IscUJBQVlKLFNBQWhDLElBQTZDLElBQTdDOztBQUVBOzs7Ozs7a0JBTWVwQixTIiwiZmlsZSI6ImNoYXJhY3Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnaXMtcGxhaW4tb2JqZWN0J1xuaW1wb3J0IHsgTGlzdCwgUmVjb3JkLCBTZXQgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBNT0RFTF9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvbW9kZWwtdHlwZXMnXG5cbi8qKlxuICogRGVmYXVsdCBwcm9wZXJ0aWVzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgREVGQVVMVFMgPSB7XG4gIG1hcmtzOiBuZXcgU2V0KCksXG4gIHRleHQ6ICcnLFxufVxuXG4vKipcbiAqIENoYXJhY3Rlci5cbiAqXG4gKiBAdHlwZSB7Q2hhcmFjdGVyfVxuICovXG5cbmNsYXNzIENoYXJhY3RlciBleHRlbmRzIFJlY29yZChERUZBVUxUUykge1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgQ2hhcmFjdGVyYCB3aXRoIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fFN0cmluZ3xDaGFyYWN0ZXJ9IGF0dHJzXG4gICAqIEByZXR1cm4ge0NoYXJhY3Rlcn1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZShhdHRycyA9IHt9KSB7XG4gICAgaWYgKENoYXJhY3Rlci5pc0NoYXJhY3RlcihhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXR0cnMgPT0gJ3N0cmluZycpIHtcbiAgICAgIGF0dHJzID0geyB0ZXh0OiBhdHRycyB9XG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gQ2hhcmFjdGVyLmZyb21KU09OKGF0dHJzKVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgQ2hhcmFjdGVyLmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cywgc3RyaW5ncyBvciBjaGFyYWN0ZXJzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGxpc3Qgb2YgYENoYXJhY3RlcnNgIGZyb20gYGVsZW1lbnRzYC5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXk8T2JqZWN0fENoYXJhY3RlcnxTdHJpbmc+fExpc3Q8T2JqZWN0fENoYXJhY3RlcnxTdHJpbmc+fSBlbGVtZW50c1xuICAgKiBAcmV0dXJuIHtMaXN0PENoYXJhY3Rlcj59XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGVMaXN0KGVsZW1lbnRzID0gW10pIHtcbiAgICBpZiAodHlwZW9mIGVsZW1lbnRzID09ICdzdHJpbmcnKSB7XG4gICAgICBlbGVtZW50cyA9IGVsZW1lbnRzLnNwbGl0KCcnKVxuICAgIH1cblxuICAgIGlmIChMaXN0LmlzTGlzdChlbGVtZW50cykgfHwgQXJyYXkuaXNBcnJheShlbGVtZW50cykpIHtcbiAgICAgIGNvbnN0IGxpc3QgPSBuZXcgTGlzdChlbGVtZW50cy5tYXAoQ2hhcmFjdGVyLmNyZWF0ZSkpXG4gICAgICByZXR1cm4gbGlzdFxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgQmxvY2suY3JlYXRlTGlzdFxcYCBvbmx5IGFjY2VwdHMgc3RyaW5ncywgYXJyYXlzIG9yIGxpc3RzLCBidXQgeW91IHBhc3NlZCBpdDogJHtlbGVtZW50c31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBDaGFyYWN0ZXJgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge0NoYXJhY3Rlcn1cbiAgICovXG5cbiAgc3RhdGljIGZyb21KU09OKG9iamVjdCkge1xuICAgIGNvbnN0IHtcbiAgICAgIHRleHQsXG4gICAgICBtYXJrcyA9IFtdLFxuICAgIH0gPSBvYmplY3RcblxuICAgIGlmICh0eXBlb2YgdGV4dCAhPSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdgQ2hhcmFjdGVyLmZyb21KU09OYCByZXF1aXJlcyBhIGJsb2NrIGB0ZXh0YCBzdHJpbmcuJylcbiAgICB9XG5cbiAgICBjb25zdCBjaGFyYWN0ZXIgPSBuZXcgQ2hhcmFjdGVyKHtcbiAgICAgIHRleHQsXG4gICAgICBtYXJrczogbmV3IFNldChtYXJrcyksXG4gICAgfSlcblxuICAgIHJldHVybiBjaGFyYWN0ZXJcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgZnJvbUpTYC5cbiAgICovXG5cbiAgc3RhdGljIGZyb21KUyA9IENoYXJhY3Rlci5mcm9tSlNPTlxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgYW55YCBpcyBhIGBDaGFyYWN0ZXJgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gYW55XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc0NoYXJhY3RlcihhbnkpIHtcbiAgICByZXR1cm4gISEoYW55ICYmIGFueVtNT0RFTF9UWVBFUy5DSEFSQUNURVJdKVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgY2hhcmFjdGVyIGxpc3QuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzQ2hhcmFjdGVyTGlzdChhbnkpIHtcbiAgICByZXR1cm4gTGlzdC5pc0xpc3QoYW55KSAmJiBhbnkuZXZlcnkoaXRlbSA9PiBDaGFyYWN0ZXIuaXNDaGFyYWN0ZXIoaXRlbSkpXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBraW5kLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBraW5kKCkge1xuICAgIHJldHVybiAnY2hhcmFjdGVyJ1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGNoYXJhY3Rlci5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04oKSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAga2luZDogdGhpcy5raW5kLFxuICAgICAgdGV4dDogdGhpcy50ZXh0LFxuICAgICAgbWFya3M6IHRoaXMubWFya3MudG9BcnJheSgpLm1hcChtID0+IG0udG9KU09OKCkpLFxuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgdG9KU2AuXG4gICAqL1xuXG4gIHRvSlMoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9KU09OKClcbiAgfVxuXG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5DaGFyYWN0ZXIucHJvdG90eXBlW01PREVMX1RZUEVTLkNIQVJBQ1RFUl0gPSB0cnVlXG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtDaGFyYWN0ZXJ9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgQ2hhcmFjdGVyXG4iXX0=