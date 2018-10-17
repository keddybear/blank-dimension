'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _immutable = require('immutable');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Data.
 *
 * This isn't an immutable record, it's just a thin wrapper around `Map` so that
 * we can allow for more convenient creation.
 *
 * @type {Object}
 */

var Data = function () {
  function Data() {
    _classCallCheck(this, Data);
  }

  _createClass(Data, null, [{
    key: 'create',


    /**
     * Create a new `Data` with `attrs`.
     *
     * @param {Object|Data|Map} attrs
     * @return {Data} data
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (_immutable.Map.isMap(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Data.fromJSON(attrs);
      }

      throw new Error('`Data.create` only accepts objects or maps, but you passed it: ' + attrs);
    }

    /**
     * Create a `Data` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Data}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      return new _immutable.Map(object);
    }

    /**
     * Alias `fromJS`.
     */

  }]);

  return Data;
}();

/**
 * Export.
 *
 * @type {Object}
 */

Data.fromJS = Data.fromJSON;
exports.default = Data;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvZGF0YS5qcyJdLCJuYW1lcyI6WyJEYXRhIiwiYXR0cnMiLCJpc01hcCIsImZyb21KU09OIiwiRXJyb3IiLCJvYmplY3QiLCJmcm9tSlMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7Ozs7OztJQVNNQSxJOzs7Ozs7Ozs7QUFFSjs7Ozs7Ozs2QkFPMEI7QUFBQSxVQUFaQyxLQUFZLHVFQUFKLEVBQUk7O0FBQ3hCLFVBQUksZUFBSUMsS0FBSixDQUFVRCxLQUFWLENBQUosRUFBc0I7QUFDcEIsZUFBT0EsS0FBUDtBQUNEOztBQUVELFVBQUksNkJBQWNBLEtBQWQsQ0FBSixFQUEwQjtBQUN4QixlQUFPRCxLQUFLRyxRQUFMLENBQWNGLEtBQWQsQ0FBUDtBQUNEOztBQUVELFlBQU0sSUFBSUcsS0FBSixxRUFBOEVILEtBQTlFLENBQU47QUFDRDs7QUFFRDs7Ozs7Ozs7OzZCQU9nQkksTSxFQUFRO0FBQ3RCLGFBQU8sbUJBQVFBLE1BQVIsQ0FBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7QUFRRjs7Ozs7O0FBeENNTCxJLENBb0NHTSxNLEdBQVNOLEtBQUtHLFE7a0JBVVJILEkiLCJmaWxlIjoiZGF0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSAnaXMtcGxhaW4tb2JqZWN0J1xuaW1wb3J0IHsgTWFwIH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG4vKipcbiAqIERhdGEuXG4gKlxuICogVGhpcyBpc24ndCBhbiBpbW11dGFibGUgcmVjb3JkLCBpdCdzIGp1c3QgYSB0aGluIHdyYXBwZXIgYXJvdW5kIGBNYXBgIHNvIHRoYXRcbiAqIHdlIGNhbiBhbGxvdyBmb3IgbW9yZSBjb252ZW5pZW50IGNyZWF0aW9uLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY2xhc3MgRGF0YSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgRGF0YWAgd2l0aCBgYXR0cnNgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdHxEYXRhfE1hcH0gYXR0cnNcbiAgICogQHJldHVybiB7RGF0YX0gZGF0YVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlKGF0dHJzID0ge30pIHtcbiAgICBpZiAoTWFwLmlzTWFwKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzXG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gRGF0YS5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYERhdGEuY3JlYXRlXFxgIG9ubHkgYWNjZXB0cyBvYmplY3RzIG9yIG1hcHMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYERhdGFgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge0RhdGF9XG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlNPTihvYmplY3QpIHtcbiAgICByZXR1cm4gbmV3IE1hcChvYmplY3QpXG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYGZyb21KU2AuXG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlMgPSBEYXRhLmZyb21KU09OXG5cbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBEYXRhXG4iXX0=