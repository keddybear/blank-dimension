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

var _character = require('./character');

var _character2 = _interopRequireDefault(_character);

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
  marks: new _immutable.Set(),
  text: ''
};

/**
 * Leaf.
 *
 * @type {Leaf}
 */

var Leaf = function (_Record) {
  _inherits(Leaf, _Record);

  function Leaf() {
    _classCallCheck(this, Leaf);

    return _possibleConstructorReturn(this, (Leaf.__proto__ || Object.getPrototypeOf(Leaf)).apply(this, arguments));
  }

  _createClass(Leaf, [{
    key: 'getCharacters',


    /**
     * Return leaf as a list of characters
     *
     * @return {List<Character>}
     */

    value: function getCharacters() {
      var marks = this.marks;

      var characters = _character2.default.createList(this.text.split('').map(function (char) {
        return _character2.default.create({
          text: char,
          marks: marks
        });
      }));

      return characters;
    }

    /**
     * Return a JSON representation of the leaf.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
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
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'leaf';
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Leaf` with `attrs`.
     *
     * @param {Object|Leaf} attrs
     * @return {Leaf}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Leaf.isLeaf(attrs)) {
        return attrs;
      }

      if (typeof attrs == 'string') {
        attrs = { text: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Leaf.fromJSON(attrs);
      }

      throw new Error('`Leaf.create` only accepts objects, strings or leaves, but you passed it: ' + attrs);
    }

    /**
     * Create a `Leaf` list from `attrs`.
     *
     * @param {Array<Leaf|Object>|List<Leaf|Object>} attrs
     * @return {List<Leaf>}
     */

  }, {
    key: 'createList',
    value: function createList() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (_immutable.List.isList(attrs) || Array.isArray(attrs)) {
        var list = new _immutable.List(attrs.map(Leaf.create));
        return list;
      }

      throw new Error('`Leaf.createList` only accepts arrays or lists, but you passed it: ' + attrs);
    }

    /**
     * Create a `Leaf` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Leaf}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$text = object.text,
          text = _object$text === undefined ? '' : _object$text,
          _object$marks = object.marks,
          marks = _object$marks === undefined ? [] : _object$marks;


      var leaf = new Leaf({
        text: text,
        marks: new _immutable.Set(marks.map(_mark2.default.fromJSON))
      });

      return leaf;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isLeaf',


    /**
     * Check if `any` is a `Leaf`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isLeaf(any) {
      return !!(any && any[_modelTypes2.default.LEAF]);
    }

    /**
     * Check if `any` is a list of leaves.
     *
     * @param {Any} any
     * @return {Boolean}
     */

  }, {
    key: 'isLeafList',
    value: function isLeafList(any) {
      return _immutable.List.isList(any) && any.every(function (item) {
        return Leaf.isLeaf(item);
      });
    }
  }]);

  return Leaf;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Leaf.fromJS = Leaf.fromJSON;
Leaf.prototype[_modelTypes2.default.LEAF] = true;

/**
 * Export.
 *
 * @type {Leaf}
 */

exports.default = Leaf;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvbGVhZi5qcyJdLCJuYW1lcyI6WyJERUZBVUxUUyIsIm1hcmtzIiwidGV4dCIsIkxlYWYiLCJjaGFyYWN0ZXJzIiwiY3JlYXRlTGlzdCIsInNwbGl0IiwibWFwIiwiY2hhciIsImNyZWF0ZSIsIm9iamVjdCIsImtpbmQiLCJ0b0FycmF5IiwibSIsInRvSlNPTiIsImF0dHJzIiwiaXNMZWFmIiwiZnJvbUpTT04iLCJFcnJvciIsImlzTGlzdCIsIkFycmF5IiwiaXNBcnJheSIsImxpc3QiLCJsZWFmIiwiYW55IiwiTEVBRiIsImV2ZXJ5IiwiaXRlbSIsImZyb21KUyIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFdBQVc7QUFDZkMsU0FBTyxvQkFEUTtBQUVmQyxRQUFNO0FBRlMsQ0FBakI7O0FBS0E7Ozs7OztJQU1NQyxJOzs7Ozs7Ozs7Ozs7O0FBb0dKOzs7Ozs7b0NBTWdCO0FBQUEsVUFDTkYsS0FETSxHQUNJLElBREosQ0FDTkEsS0FETTs7QUFFZCxVQUFNRyxhQUFhLG9CQUFVQyxVQUFWLENBQXFCLEtBQUtILElBQUwsQ0FDckNJLEtBRHFDLENBQy9CLEVBRCtCLEVBRXJDQyxHQUZxQyxDQUVqQyxVQUFDQyxJQUFELEVBQVU7QUFDYixlQUFPLG9CQUFVQyxNQUFWLENBQWlCO0FBQ3RCUCxnQkFBTU0sSUFEZ0I7QUFFdEJQO0FBRnNCLFNBQWpCLENBQVA7QUFJRCxPQVBxQyxDQUFyQixDQUFuQjs7QUFTQSxhQUFPRyxVQUFQO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OzZCQU1TO0FBQ1AsVUFBTU0sU0FBUztBQUNiQyxjQUFNLEtBQUtBLElBREU7QUFFYlQsY0FBTSxLQUFLQSxJQUZFO0FBR2JELGVBQU8sS0FBS0EsS0FBTCxDQUFXVyxPQUFYLEdBQXFCTCxHQUFyQixDQUF5QjtBQUFBLGlCQUFLTSxFQUFFQyxNQUFGLEVBQUw7QUFBQSxTQUF6QjtBQUhNLE9BQWY7O0FBTUEsYUFBT0osTUFBUDtBQUNEOztBQUVEOzs7Ozs7MkJBSU87QUFDTCxhQUFPLEtBQUtJLE1BQUwsRUFBUDtBQUNEOzs7OztBQXBERDs7Ozs7O3dCQU1XO0FBQ1QsYUFBTyxNQUFQO0FBQ0Q7Ozs7O0FBaEdEOzs7Ozs7OzZCQU8wQjtBQUFBLFVBQVpDLEtBQVksdUVBQUosRUFBSTs7QUFDeEIsVUFBSVosS0FBS2EsTUFBTCxDQUFZRCxLQUFaLENBQUosRUFBd0I7QUFDdEIsZUFBT0EsS0FBUDtBQUNEOztBQUVELFVBQUksT0FBT0EsS0FBUCxJQUFnQixRQUFwQixFQUE4QjtBQUM1QkEsZ0JBQVEsRUFBRWIsTUFBTWEsS0FBUixFQUFSO0FBQ0Q7O0FBRUQsVUFBSSw2QkFBY0EsS0FBZCxDQUFKLEVBQTBCO0FBQ3hCLGVBQU9aLEtBQUtjLFFBQUwsQ0FBY0YsS0FBZCxDQUFQO0FBQ0Q7O0FBRUQsWUFBTSxJQUFJRyxLQUFKLGdGQUF5RkgsS0FBekYsQ0FBTjtBQUNEOztBQUVEOzs7Ozs7Ozs7aUNBTzhCO0FBQUEsVUFBWkEsS0FBWSx1RUFBSixFQUFJOztBQUM1QixVQUFJLGdCQUFLSSxNQUFMLENBQVlKLEtBQVosS0FBc0JLLE1BQU1DLE9BQU4sQ0FBY04sS0FBZCxDQUExQixFQUFnRDtBQUM5QyxZQUFNTyxPQUFPLG9CQUFTUCxNQUFNUixHQUFOLENBQVVKLEtBQUtNLE1BQWYsQ0FBVCxDQUFiO0FBQ0EsZUFBT2EsSUFBUDtBQUNEOztBQUVELFlBQU0sSUFBSUosS0FBSix5RUFBa0ZILEtBQWxGLENBQU47QUFDRDs7QUFFRDs7Ozs7Ozs7OzZCQU9nQkwsTSxFQUFRO0FBQUEseUJBSWxCQSxNQUprQixDQUVwQlIsSUFGb0I7QUFBQSxVQUVwQkEsSUFGb0IsZ0NBRWIsRUFGYTtBQUFBLDBCQUlsQlEsTUFKa0IsQ0FHcEJULEtBSG9CO0FBQUEsVUFHcEJBLEtBSG9CLGlDQUdaLEVBSFk7OztBQU10QixVQUFNc0IsT0FBTyxJQUFJcEIsSUFBSixDQUFTO0FBQ3BCRCxrQkFEb0I7QUFFcEJELGVBQU8sbUJBQVFBLE1BQU1NLEdBQU4sQ0FBVSxlQUFLVSxRQUFmLENBQVI7QUFGYSxPQUFULENBQWI7O0FBS0EsYUFBT00sSUFBUDtBQUNEOztBQUVEOzs7Ozs7OztBQU1BOzs7Ozs7OzJCQU9jQyxHLEVBQUs7QUFDakIsYUFBTyxDQUFDLEVBQUVBLE9BQU9BLElBQUkscUJBQVlDLElBQWhCLENBQVQsQ0FBUjtBQUNEOztBQUVEOzs7Ozs7Ozs7K0JBT2tCRCxHLEVBQUs7QUFDckIsYUFBTyxnQkFBS0wsTUFBTCxDQUFZSyxHQUFaLEtBQW9CQSxJQUFJRSxLQUFKLENBQVU7QUFBQSxlQUFRdkIsS0FBS2EsTUFBTCxDQUFZVyxJQUFaLENBQVI7QUFBQSxPQUFWLENBQTNCO0FBQ0Q7Ozs7RUF4RmdCLHVCQUFPM0IsUUFBUCxDOztBQWtKbkI7Ozs7QUFsSk1HLEksQ0FrRUd5QixNLEdBQVN6QixLQUFLYyxRO0FBb0Z2QmQsS0FBSzBCLFNBQUwsQ0FBZSxxQkFBWUosSUFBM0IsSUFBbUMsSUFBbkM7O0FBRUE7Ozs7OztrQkFNZXRCLEkiLCJmaWxlIjoibGVhZi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnaXMtcGxhaW4tb2JqZWN0J1xuaW1wb3J0IHsgTGlzdCwgUmVjb3JkLCBTZXQgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBNT0RFTF9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvbW9kZWwtdHlwZXMnXG5pbXBvcnQgQ2hhcmFjdGVyIGZyb20gJy4vY2hhcmFjdGVyJ1xuaW1wb3J0IE1hcmsgZnJvbSAnLi9tYXJrJ1xuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICBtYXJrczogbmV3IFNldCgpLFxuICB0ZXh0OiAnJyxcbn1cblxuLyoqXG4gKiBMZWFmLlxuICpcbiAqIEB0eXBlIHtMZWFmfVxuICovXG5cbmNsYXNzIExlYWYgZXh0ZW5kcyBSZWNvcmQoREVGQVVMVFMpIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBMZWFmYCB3aXRoIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fExlYWZ9IGF0dHJzXG4gICAqIEByZXR1cm4ge0xlYWZ9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSkge1xuICAgIGlmIChMZWFmLmlzTGVhZihhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgYXR0cnMgPT0gJ3N0cmluZycpIHtcbiAgICAgIGF0dHJzID0geyB0ZXh0OiBhdHRycyB9XG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gTGVhZi5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYExlYWYuY3JlYXRlXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzLCBzdHJpbmdzIG9yIGxlYXZlcywgYnV0IHlvdSBwYXNzZWQgaXQ6ICR7YXR0cnN9YClcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBgTGVhZmAgbGlzdCBmcm9tIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXk8TGVhZnxPYmplY3Q+fExpc3Q8TGVhZnxPYmplY3Q+fSBhdHRyc1xuICAgKiBAcmV0dXJuIHtMaXN0PExlYWY+fVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlTGlzdChhdHRycyA9IFtdKSB7XG4gICAgaWYgKExpc3QuaXNMaXN0KGF0dHJzKSB8fCBBcnJheS5pc0FycmF5KGF0dHJzKSkge1xuICAgICAgY29uc3QgbGlzdCA9IG5ldyBMaXN0KGF0dHJzLm1hcChMZWFmLmNyZWF0ZSkpXG4gICAgICByZXR1cm4gbGlzdFxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgTGVhZi5jcmVhdGVMaXN0XFxgIG9ubHkgYWNjZXB0cyBhcnJheXMgb3IgbGlzdHMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYExlYWZgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge0xlYWZ9XG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlNPTihvYmplY3QpIHtcbiAgICBjb25zdCB7XG4gICAgICB0ZXh0ID0gJycsXG4gICAgICBtYXJrcyA9IFtdLFxuICAgIH0gPSBvYmplY3RcblxuICAgIGNvbnN0IGxlYWYgPSBuZXcgTGVhZih7XG4gICAgICB0ZXh0LFxuICAgICAgbWFya3M6IG5ldyBTZXQobWFya3MubWFwKE1hcmsuZnJvbUpTT04pKSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGxlYWZcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgZnJvbUpTYC5cbiAgICovXG5cbiAgc3RhdGljIGZyb21KUyA9IExlYWYuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgTGVhZmAuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzTGVhZihhbnkpIHtcbiAgICByZXR1cm4gISEoYW55ICYmIGFueVtNT0RFTF9UWVBFUy5MRUFGXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVjayBpZiBgYW55YCBpcyBhIGxpc3Qgb2YgbGVhdmVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gYW55XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc0xlYWZMaXN0KGFueSkge1xuICAgIHJldHVybiBMaXN0LmlzTGlzdChhbnkpICYmIGFueS5ldmVyeShpdGVtID0+IExlYWYuaXNMZWFmKGl0ZW0pKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgbm9kZSdzIGtpbmQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgcmV0dXJuICdsZWFmJ1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBsZWFmIGFzIGEgbGlzdCBvZiBjaGFyYWN0ZXJzXG4gICAqXG4gICAqIEByZXR1cm4ge0xpc3Q8Q2hhcmFjdGVyPn1cbiAgICovXG5cbiAgZ2V0Q2hhcmFjdGVycygpIHtcbiAgICBjb25zdCB7IG1hcmtzIH0gPSB0aGlzXG4gICAgY29uc3QgY2hhcmFjdGVycyA9IENoYXJhY3Rlci5jcmVhdGVMaXN0KHRoaXMudGV4dFxuICAgICAgLnNwbGl0KCcnKVxuICAgICAgLm1hcCgoY2hhcikgPT4ge1xuICAgICAgICByZXR1cm4gQ2hhcmFjdGVyLmNyZWF0ZSh7XG4gICAgICAgICAgdGV4dDogY2hhcixcbiAgICAgICAgICBtYXJrc1xuICAgICAgICB9KVxuICAgICAgfSkpXG5cbiAgICByZXR1cm4gY2hhcmFjdGVyc1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIGxlYWYuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgdG9KU09OKCkge1xuICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMua2luZCxcbiAgICAgIHRleHQ6IHRoaXMudGV4dCxcbiAgICAgIG1hcmtzOiB0aGlzLm1hcmtzLnRvQXJyYXkoKS5tYXAobSA9PiBtLnRvSlNPTigpKSxcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYHRvSlNgLlxuICAgKi9cblxuICB0b0pTKCkge1xuICAgIHJldHVybiB0aGlzLnRvSlNPTigpXG4gIH1cblxufVxuXG4vKipcbiAqIEF0dGFjaCBhIHBzZXVkby1zeW1ib2wgZm9yIHR5cGUgY2hlY2tpbmcuXG4gKi9cblxuTGVhZi5wcm90b3R5cGVbTU9ERUxfVFlQRVMuTEVBRl0gPSB0cnVlXG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtMZWFmfVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IExlYWZcbiJdfQ==