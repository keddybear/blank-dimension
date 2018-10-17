'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _changes = require('../changes');

var _changes2 = _interopRequireDefault(_changes);

var _apply = require('../operations/apply');

var _apply2 = _interopRequireDefault(_apply);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:change');

/**
 * Change.
 *
 * @type {Change}
 */

var Change = function () {
  _createClass(Change, null, [{
    key: 'isChange',


    /**
     * Check if `any` is a `Change`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isChange(any) {
      return !!(any && any[_modelTypes2.default.CHANGE]);
    }

    /**
     * Create a new `Change` with `attrs`.
     *
     * @param {Object} attrs
     *   @property {Value} value
     */

  }]);

  function Change(attrs) {
    _classCallCheck(this, Change);

    var value = attrs.value;

    this.value = value;
    this.operations = [];
    this.flags = (0, _pick2.default)(attrs, ['merge', 'save']);
  }

  /**
   * Get the kind.
   *
   * @return {String}
   */

  _createClass(Change, [{
    key: 'applyOperation',


    /**
     * Apply an `operation` to the current value, saving the operation to the
     * history if needed.
     *
     * @param {Object} operation
     * @param {Object} options
     * @return {Change}
     */

    value: function applyOperation(operation) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var operations = this.operations,
          flags = this.flags;
      var value = this.value;
      var _value = value,
          history = _value.history;

      // Default options to the change-level flags, this allows for setting
      // specific options for all of the operations of a given change.

      options = _extends({}, flags, options);

      // Derive the default option values.
      var _options = options,
          _options$merge = _options.merge,
          merge = _options$merge === undefined ? operations.length == 0 ? null : true : _options$merge,
          _options$save = _options.save,
          save = _options$save === undefined ? true : _options$save,
          _options$skip = _options.skip,
          skip = _options$skip === undefined ? null : _options$skip;

      // Apply the operation to the value.

      debug('apply', { operation: operation, save: save, merge: merge });
      value = (0, _apply2.default)(value, operation);

      // If needed, save the operation to the history.
      if (history && save) {
        history = history.save(operation, { merge: merge, skip: skip });
        value = value.set('history', history);
      }

      // Update the mutable change object.
      this.value = value;
      this.operations.push(operation);
      return this;
    }

    /**
     * Apply a series of `operations` to the current value.
     *
     * @param {Array} operations
     * @param {Object} options
     * @return {Change}
     */

  }, {
    key: 'applyOperations',
    value: function applyOperations(operations, options) {
      var _this = this;

      operations.forEach(function (op) {
        return _this.applyOperation(op, options);
      });
      return this;
    }

    /**
     * Call a change `fn` with arguments.
     *
     * @param {Function} fn
     * @param {Mixed} ...args
     * @return {Change}
     */

  }, {
    key: 'call',
    value: function call(fn) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      fn.apply(undefined, [this].concat(args));
      return this;
    }

    /**
     * Set an operation flag by `key` to `value`.
     *
     * @param {String} key
     * @param {Any} value
     * @return {Change}
     */

  }, {
    key: 'setOperationFlag',
    value: function setOperationFlag(key, value) {
      this.flags[key] = value;
      return this;
    }

    /**
     * Unset an operation flag by `key`.
     *
     * @param {String} key
     * @return {Change}
     */

  }, {
    key: 'unsetOperationFlag',
    value: function unsetOperationFlag(key) {
      delete this.flags[key];
      return this;
    }
  }, {
    key: 'kind',
    get: function get() {
      return 'change';
    }
  }]);

  return Change;
}();

/**
 * Attach a pseudo-symbol for type checking.
 */

Change.prototype[_modelTypes2.default.CHANGE] = true;

/**
 * Add a change method for each of the changes.
 */

Object.keys(_changes2.default).forEach(function (type) {
  Change.prototype[type] = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    debug(type, { args: args });
    this.call.apply(this, [_changes2.default[type]].concat(args));
    return this;
  };
});

/**
 * Export.
 *
 * @type {Change}
 */

exports.default = Change;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvY2hhbmdlLmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiQ2hhbmdlIiwiYW55IiwiQ0hBTkdFIiwiYXR0cnMiLCJ2YWx1ZSIsIm9wZXJhdGlvbnMiLCJmbGFncyIsIm9wZXJhdGlvbiIsIm9wdGlvbnMiLCJoaXN0b3J5IiwibWVyZ2UiLCJsZW5ndGgiLCJzYXZlIiwic2tpcCIsInNldCIsInB1c2giLCJmb3JFYWNoIiwiYXBwbHlPcGVyYXRpb24iLCJvcCIsImZuIiwiYXJncyIsImtleSIsInByb3RvdHlwZSIsIk9iamVjdCIsImtleXMiLCJ0eXBlIiwiY2FsbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFFBQVEscUJBQU0sY0FBTixDQUFkOztBQUVBOzs7Ozs7SUFNTUMsTTs7Ozs7QUFFSjs7Ozs7Ozs2QkFPZ0JDLEcsRUFBSztBQUNuQixhQUFPLENBQUMsRUFBRUEsT0FBT0EsSUFBSSxxQkFBWUMsTUFBaEIsQ0FBVCxDQUFSO0FBQ0Q7O0FBRUQ7Ozs7Ozs7OztBQU9BLGtCQUFZQyxLQUFaLEVBQW1CO0FBQUE7O0FBQUEsUUFDVEMsS0FEUyxHQUNDRCxLQURELENBQ1RDLEtBRFM7O0FBRWpCLFNBQUtBLEtBQUwsR0FBYUEsS0FBYjtBQUNBLFNBQUtDLFVBQUwsR0FBa0IsRUFBbEI7QUFDQSxTQUFLQyxLQUFMLEdBQWEsb0JBQUtILEtBQUwsRUFBWSxDQUFDLE9BQUQsRUFBVSxNQUFWLENBQVosQ0FBYjtBQUNEOztBQUVEOzs7Ozs7Ozs7O0FBVUE7Ozs7Ozs7OzttQ0FTZUksUyxFQUF5QjtBQUFBLFVBQWRDLE9BQWMsdUVBQUosRUFBSTtBQUFBLFVBQzlCSCxVQUQ4QixHQUNSLElBRFEsQ0FDOUJBLFVBRDhCO0FBQUEsVUFDbEJDLEtBRGtCLEdBQ1IsSUFEUSxDQUNsQkEsS0FEa0I7QUFBQSxVQUVoQ0YsS0FGZ0MsR0FFdEIsSUFGc0IsQ0FFaENBLEtBRmdDO0FBQUEsbUJBR3BCQSxLQUhvQjtBQUFBLFVBR2hDSyxPQUhnQyxVQUdoQ0EsT0FIZ0M7O0FBS3RDO0FBQ0E7O0FBQ0FELDZCQUFlRixLQUFmLEVBQXlCRSxPQUF6Qjs7QUFFQTtBQVRzQyxxQkFjbENBLE9BZGtDO0FBQUEsb0NBV3BDRSxLQVhvQztBQUFBLFVBV3BDQSxLQVhvQyxrQ0FXNUJMLFdBQVdNLE1BQVgsSUFBcUIsQ0FBckIsR0FBeUIsSUFBekIsR0FBZ0MsSUFYSjtBQUFBLG1DQVlwQ0MsSUFab0M7QUFBQSxVQVlwQ0EsSUFab0MsaUNBWTdCLElBWjZCO0FBQUEsbUNBYXBDQyxJQWJvQztBQUFBLFVBYXBDQSxJQWJvQyxpQ0FhN0IsSUFiNkI7O0FBZ0J0Qzs7QUFDQWQsWUFBTSxPQUFOLEVBQWUsRUFBRVEsb0JBQUYsRUFBYUssVUFBYixFQUFtQkYsWUFBbkIsRUFBZjtBQUNBTixjQUFRLHFCQUFNQSxLQUFOLEVBQWFHLFNBQWIsQ0FBUjs7QUFFQTtBQUNBLFVBQUlFLFdBQVdHLElBQWYsRUFBcUI7QUFDbkJILGtCQUFVQSxRQUFRRyxJQUFSLENBQWFMLFNBQWIsRUFBd0IsRUFBRUcsWUFBRixFQUFTRyxVQUFULEVBQXhCLENBQVY7QUFDQVQsZ0JBQVFBLE1BQU1VLEdBQU4sQ0FBVSxTQUFWLEVBQXFCTCxPQUFyQixDQUFSO0FBQ0Q7O0FBRUQ7QUFDQSxXQUFLTCxLQUFMLEdBQWFBLEtBQWI7QUFDQSxXQUFLQyxVQUFMLENBQWdCVSxJQUFoQixDQUFxQlIsU0FBckI7QUFDQSxhQUFPLElBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7OztvQ0FRZ0JGLFUsRUFBWUcsTyxFQUFTO0FBQUE7O0FBQ25DSCxpQkFBV1csT0FBWCxDQUFtQjtBQUFBLGVBQU0sTUFBS0MsY0FBTCxDQUFvQkMsRUFBcEIsRUFBd0JWLE9BQXhCLENBQU47QUFBQSxPQUFuQjtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7O3lCQVFLVyxFLEVBQWE7QUFBQSx3Q0FBTkMsSUFBTTtBQUFOQSxZQUFNO0FBQUE7O0FBQ2hCRCwyQkFBRyxJQUFILFNBQVlDLElBQVo7QUFDQSxhQUFPLElBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7OztxQ0FRaUJDLEcsRUFBS2pCLEssRUFBTztBQUMzQixXQUFLRSxLQUFMLENBQVdlLEdBQVgsSUFBa0JqQixLQUFsQjtBQUNBLGFBQU8sSUFBUDtBQUNEOztBQUVEOzs7Ozs7Ozs7dUNBT21CaUIsRyxFQUFLO0FBQ3RCLGFBQU8sS0FBS2YsS0FBTCxDQUFXZSxHQUFYLENBQVA7QUFDQSxhQUFPLElBQVA7QUFDRDs7O3dCQTlGVTtBQUNULGFBQU8sUUFBUDtBQUNEOzs7Ozs7QUFnR0g7Ozs7QUFJQXJCLE9BQU9zQixTQUFQLENBQWlCLHFCQUFZcEIsTUFBN0IsSUFBdUMsSUFBdkM7O0FBRUE7Ozs7QUFJQXFCLE9BQU9DLElBQVAsb0JBQXFCUixPQUFyQixDQUE2QixVQUFDUyxJQUFELEVBQVU7QUFDckN6QixTQUFPc0IsU0FBUCxDQUFpQkcsSUFBakIsSUFBeUIsWUFBbUI7QUFBQSx1Q0FBTkwsSUFBTTtBQUFOQSxVQUFNO0FBQUE7O0FBQzFDckIsVUFBTTBCLElBQU4sRUFBWSxFQUFFTCxVQUFGLEVBQVo7QUFDQSxTQUFLTSxJQUFMLGNBQVUsa0JBQVFELElBQVIsQ0FBVixTQUE0QkwsSUFBNUI7QUFDQSxXQUFPLElBQVA7QUFDRCxHQUpEO0FBS0QsQ0FORDs7QUFRQTs7Ozs7O2tCQU1lcEIsTSIsImZpbGUiOiJjaGFuZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1ZydcbmltcG9ydCBwaWNrIGZyb20gJ2xvZGFzaC9waWNrJ1xuXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IENoYW5nZXMgZnJvbSAnLi4vY2hhbmdlcydcbmltcG9ydCBhcHBseSBmcm9tICcuLi9vcGVyYXRpb25zL2FwcGx5J1xuXG4vKipcbiAqIERlYnVnLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5jb25zdCBkZWJ1ZyA9IERlYnVnKCdzbGF0ZTpjaGFuZ2UnKVxuXG4vKipcbiAqIENoYW5nZS5cbiAqXG4gKiBAdHlwZSB7Q2hhbmdlfVxuICovXG5cbmNsYXNzIENoYW5nZSB7XG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIGBhbnlgIGlzIGEgYENoYW5nZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzQ2hhbmdlKGFueSkge1xuICAgIHJldHVybiAhIShhbnkgJiYgYW55W01PREVMX1RZUEVTLkNIQU5HRV0pXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBDaGFuZ2VgIHdpdGggYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG4gICAqICAgQHByb3BlcnR5IHtWYWx1ZX0gdmFsdWVcbiAgICovXG5cbiAgY29uc3RydWN0b3IoYXR0cnMpIHtcbiAgICBjb25zdCB7IHZhbHVlIH0gPSBhdHRyc1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZVxuICAgIHRoaXMub3BlcmF0aW9ucyA9IFtdXG4gICAgdGhpcy5mbGFncyA9IHBpY2soYXR0cnMsIFsnbWVyZ2UnLCAnc2F2ZSddKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCB0aGUga2luZC5cbiAgICpcbiAgICogQHJldHVybiB7U3RyaW5nfVxuICAgKi9cblxuICBnZXQga2luZCgpIHtcbiAgICByZXR1cm4gJ2NoYW5nZSdcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBhbiBgb3BlcmF0aW9uYCB0byB0aGUgY3VycmVudCB2YWx1ZSwgc2F2aW5nIHRoZSBvcGVyYXRpb24gdG8gdGhlXG4gICAqIGhpc3RvcnkgaWYgbmVlZGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3BlcmF0aW9uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge0NoYW5nZX1cbiAgICovXG5cbiAgYXBwbHlPcGVyYXRpb24ob3BlcmF0aW9uLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IG9wZXJhdGlvbnMsIGZsYWdzIH0gPSB0aGlzXG4gICAgbGV0IHsgdmFsdWUgfSA9IHRoaXNcbiAgICBsZXQgeyBoaXN0b3J5IH0gPSB2YWx1ZVxuXG4gICAgLy8gRGVmYXVsdCBvcHRpb25zIHRvIHRoZSBjaGFuZ2UtbGV2ZWwgZmxhZ3MsIHRoaXMgYWxsb3dzIGZvciBzZXR0aW5nXG4gICAgLy8gc3BlY2lmaWMgb3B0aW9ucyBmb3IgYWxsIG9mIHRoZSBvcGVyYXRpb25zIG9mIGEgZ2l2ZW4gY2hhbmdlLlxuICAgIG9wdGlvbnMgPSB7IC4uLmZsYWdzLCAuLi5vcHRpb25zIH1cblxuICAgIC8vIERlcml2ZSB0aGUgZGVmYXVsdCBvcHRpb24gdmFsdWVzLlxuICAgIGNvbnN0IHtcbiAgICAgIG1lcmdlID0gb3BlcmF0aW9ucy5sZW5ndGggPT0gMCA/IG51bGwgOiB0cnVlLFxuICAgICAgc2F2ZSA9IHRydWUsXG4gICAgICBza2lwID0gbnVsbCxcbiAgICB9ID0gb3B0aW9uc1xuXG4gICAgLy8gQXBwbHkgdGhlIG9wZXJhdGlvbiB0byB0aGUgdmFsdWUuXG4gICAgZGVidWcoJ2FwcGx5JywgeyBvcGVyYXRpb24sIHNhdmUsIG1lcmdlIH0pXG4gICAgdmFsdWUgPSBhcHBseSh2YWx1ZSwgb3BlcmF0aW9uKVxuXG4gICAgLy8gSWYgbmVlZGVkLCBzYXZlIHRoZSBvcGVyYXRpb24gdG8gdGhlIGhpc3RvcnkuXG4gICAgaWYgKGhpc3RvcnkgJiYgc2F2ZSkge1xuICAgICAgaGlzdG9yeSA9IGhpc3Rvcnkuc2F2ZShvcGVyYXRpb24sIHsgbWVyZ2UsIHNraXAgfSlcbiAgICAgIHZhbHVlID0gdmFsdWUuc2V0KCdoaXN0b3J5JywgaGlzdG9yeSlcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIG11dGFibGUgY2hhbmdlIG9iamVjdC5cbiAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgICB0aGlzLm9wZXJhdGlvbnMucHVzaChvcGVyYXRpb24pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBBcHBseSBhIHNlcmllcyBvZiBgb3BlcmF0aW9uc2AgdG8gdGhlIGN1cnJlbnQgdmFsdWUuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IG9wZXJhdGlvbnNcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICogQHJldHVybiB7Q2hhbmdlfVxuICAgKi9cblxuICBhcHBseU9wZXJhdGlvbnMob3BlcmF0aW9ucywgb3B0aW9ucykge1xuICAgIG9wZXJhdGlvbnMuZm9yRWFjaChvcCA9PiB0aGlzLmFwcGx5T3BlcmF0aW9uKG9wLCBvcHRpb25zKSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGwgYSBjaGFuZ2UgYGZuYCB3aXRoIGFyZ3VtZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAgICogQHBhcmFtIHtNaXhlZH0gLi4uYXJnc1xuICAgKiBAcmV0dXJuIHtDaGFuZ2V9XG4gICAqL1xuXG4gIGNhbGwoZm4sIC4uLmFyZ3MpIHtcbiAgICBmbih0aGlzLCAuLi5hcmdzKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogU2V0IGFuIG9wZXJhdGlvbiBmbGFnIGJ5IGBrZXlgIHRvIGB2YWx1ZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHtBbnl9IHZhbHVlXG4gICAqIEByZXR1cm4ge0NoYW5nZX1cbiAgICovXG5cbiAgc2V0T3BlcmF0aW9uRmxhZyhrZXksIHZhbHVlKSB7XG4gICAgdGhpcy5mbGFnc1trZXldID0gdmFsdWVcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqXG4gICAqIFVuc2V0IGFuIG9wZXJhdGlvbiBmbGFnIGJ5IGBrZXlgLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gICAqIEByZXR1cm4ge0NoYW5nZX1cbiAgICovXG5cbiAgdW5zZXRPcGVyYXRpb25GbGFnKGtleSkge1xuICAgIGRlbGV0ZSB0aGlzLmZsYWdzW2tleV1cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbn1cblxuLyoqXG4gKiBBdHRhY2ggYSBwc2V1ZG8tc3ltYm9sIGZvciB0eXBlIGNoZWNraW5nLlxuICovXG5cbkNoYW5nZS5wcm90b3R5cGVbTU9ERUxfVFlQRVMuQ0hBTkdFXSA9IHRydWVcblxuLyoqXG4gKiBBZGQgYSBjaGFuZ2UgbWV0aG9kIGZvciBlYWNoIG9mIHRoZSBjaGFuZ2VzLlxuICovXG5cbk9iamVjdC5rZXlzKENoYW5nZXMpLmZvckVhY2goKHR5cGUpID0+IHtcbiAgQ2hhbmdlLnByb3RvdHlwZVt0eXBlXSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgZGVidWcodHlwZSwgeyBhcmdzIH0pXG4gICAgdGhpcy5jYWxsKENoYW5nZXNbdHlwZV0sIC4uLmFyZ3MpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0NoYW5nZX1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBDaGFuZ2VcbiJdfQ==