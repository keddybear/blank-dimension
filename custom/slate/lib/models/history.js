'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _isEqual = require('lodash/isEqual');

var _isEqual2 = _interopRequireDefault(_isEqual);

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
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:history');

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  redos: new _immutable.Stack(),
  undos: new _immutable.Stack()
};

/**
 * History.
 *
 * @type {History}
 */

var History = function (_Record) {
  _inherits(History, _Record);

  function History() {
    _classCallCheck(this, History);

    return _possibleConstructorReturn(this, (History.__proto__ || Object.getPrototypeOf(History)).apply(this, arguments));
  }

  _createClass(History, [{
    key: 'save',


    /**
     * Save an `operation` into the history.
     *
     * @param {Object} operation
     * @param {Object} options
     * @return {History}
     */

    value: function save(operation) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var history = this;
      var _history = history,
          undos = _history.undos,
          redos = _history.redos;
      var merge = options.merge,
          skip = options.skip;

      var prevBatch = undos.peek();
      var prevOperation = prevBatch && prevBatch[prevBatch.length - 1];

      if (skip == null) {
        skip = shouldSkip(operation, prevOperation);
      }

      if (skip) {
        return history;
      }

      if (merge == null) {
        merge = shouldMerge(operation, prevOperation);
      }

      debug('save', { operation: operation, merge: merge });

      // If the `merge` flag is true, add the operation to the previous batch.
      if (merge) {
        var batch = prevBatch.slice();
        batch.push(operation);
        undos = undos.pop();
        undos = undos.push(batch);
      }

      // Otherwise, create a new batch with the operation.
      else {
          var _batch = [operation];
          undos = undos.push(_batch);
        }

      // Constrain the history to 100 entries for memory's sake.
      if (undos.length > 100) {
        undos = undos.take(100);
      }

      // Clear the redos and update the history.
      redos = redos.clear();
      history = history.set('undos', undos).set('redos', redos);
      return history;
    }

    /**
     * Return a JSON representation of the history.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        kind: this.kind,
        redos: this.redos.toJSON(),
        undos: this.undos.toJSON()
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
      return 'history';
    }
  }], [{
    key: 'create',


    /**
     * Create a new `History` with `attrs`.
     *
     * @param {Object|History} attrs
     * @return {History}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (History.isHistory(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return History.fromJSON(attrs);
      }

      throw new Error('`History.create` only accepts objects or histories, but you passed it: ' + attrs);
    }

    /**
     * Create a `History` from a JSON `object`.
     *
     * @param {Object} object
     * @return {History}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      var _object$redos = object.redos,
          redos = _object$redos === undefined ? [] : _object$redos,
          _object$undos = object.undos,
          undos = _object$undos === undefined ? [] : _object$undos;


      var history = new History({
        redos: new _immutable.Stack(redos),
        undos: new _immutable.Stack(undos)
      });

      return history;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isHistory',


    /**
     * Check if `any` is a `History`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isHistory(any) {
      return !!(any && any[_modelTypes2.default.HISTORY]);
    }
  }]);

  return History;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

History.fromJS = History.fromJSON;
History.prototype[_modelTypes2.default.HISTORY] = true;

/**
 * Check whether to merge a new operation `o` into the previous operation `p`.
 *
 * @param {Object} o
 * @param {Object} p
 * @return {Boolean}
 */

function shouldMerge(o, p) {
  if (!p) return false;

  var merge = o.type == 'set_selection' && p.type == 'set_selection' || o.type == 'insert_text' && p.type == 'insert_text' && o.offset == p.offset + p.text.length && (0, _isEqual2.default)(o.path, p.path) || o.type == 'remove_text' && p.type == 'remove_text' && o.offset + o.text.length == p.offset && (0, _isEqual2.default)(o.path, p.path);

  return merge;
}

/**
 * Check whether to skip a new operation `o`, given previous operation `p`.
 *
 * @param {Object} o
 * @param {Object} p
 * @return {Boolean}
 */

function shouldSkip(o, p) {
  if (!p) return false;

  var skip = o.type == 'set_selection' && p.type == 'set_selection';

  return skip;
}

/**
 * Export.
 *
 * @type {History}
 */

exports.default = History;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvaGlzdG9yeS5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsIkRFRkFVTFRTIiwicmVkb3MiLCJ1bmRvcyIsIkhpc3RvcnkiLCJvcGVyYXRpb24iLCJvcHRpb25zIiwiaGlzdG9yeSIsIm1lcmdlIiwic2tpcCIsInByZXZCYXRjaCIsInBlZWsiLCJwcmV2T3BlcmF0aW9uIiwibGVuZ3RoIiwic2hvdWxkU2tpcCIsInNob3VsZE1lcmdlIiwiYmF0Y2giLCJzbGljZSIsInB1c2giLCJwb3AiLCJ0YWtlIiwiY2xlYXIiLCJzZXQiLCJvYmplY3QiLCJraW5kIiwidG9KU09OIiwiYXR0cnMiLCJpc0hpc3RvcnkiLCJmcm9tSlNPTiIsIkVycm9yIiwiYW55IiwiSElTVE9SWSIsImZyb21KUyIsInByb3RvdHlwZSIsIm8iLCJwIiwidHlwZSIsIm9mZnNldCIsInRleHQiLCJwYXRoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOztBQUVBOzs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsUUFBUSxxQkFBTSxlQUFOLENBQWQ7O0FBRUE7Ozs7OztBQU1BLElBQU1DLFdBQVc7QUFDZkMsU0FBTyxzQkFEUTtBQUVmQyxTQUFPO0FBRlEsQ0FBakI7O0FBS0E7Ozs7OztJQU1NQyxPOzs7Ozs7Ozs7Ozs7O0FBcUVKOzs7Ozs7Ozt5QkFRS0MsUyxFQUF5QjtBQUFBLFVBQWRDLE9BQWMsdUVBQUosRUFBSTs7QUFDNUIsVUFBSUMsVUFBVSxJQUFkO0FBRDRCLHFCQUVMQSxPQUZLO0FBQUEsVUFFdEJKLEtBRnNCLFlBRXRCQSxLQUZzQjtBQUFBLFVBRWZELEtBRmUsWUFFZkEsS0FGZTtBQUFBLFVBR3RCTSxLQUhzQixHQUdORixPQUhNLENBR3RCRSxLQUhzQjtBQUFBLFVBR2ZDLElBSGUsR0FHTkgsT0FITSxDQUdmRyxJQUhlOztBQUk1QixVQUFNQyxZQUFZUCxNQUFNUSxJQUFOLEVBQWxCO0FBQ0EsVUFB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QXpDOztBQUVBOzs7Ozs7OztBQVFBLFNBQVNoQixXQUFULENBQXFCbUIsQ0FBckIsRUFBd0JDLENBQXhCLEVBQTJCO0FBQ3pCLE1BQUksQ0FBQ0EsQ0FBTCxFQUFRLE9BQU8sS0FBUDs7QUFFUixNQUFNM0IsUUFFRjBCLEVBQUVFLElBQUYsSUFBVSxlQUFWLElBQ0FELEVBQUVDLElBQUYsSUFBVSxlQUZaLElBSUVGLEVBQUVFLElBQUYsSUFBVSxhQUFWLElBQ0FELEVBQUVDLElBQUYsSUFBVSxhQURWLElBRUFGLEVBQUVHLE1BQUYsSUFBWUYsRUFBRUUsTUFBRixHQUFXRixFQUFFRyxJQUFGLENBQU96QixNQUY5QixJQUdBLHVCQUFRcUIsRUFBRUssSUFBVixFQUFnQkosRUFBRUksSUFBbEIsQ0FQRixJQVNFTCxFQUFFRSxJQUFGLElBQVUsYUFBVixJQUNBRCxFQUFFQyxJQUFGLElBQVUsYUFEVixJQUVBRixFQUFFRyxNQUFGLEdBQVdILEVBQUVJLElBQUYsQ0FBT3pCLE1BQWxCLElBQTRCc0IsRUFBRUUsTUFGOUIsSUFHQSx1QkFBUUgsRUFBRUssSUFBVixFQUFnQkosRUFBRUksSUFBbEIsQ0FiSjs7QUFpQkEsU0FBTy9CLEtBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7QUFRQSxTQUFTTSxVQUFULENBQW9Cb0IsQ0FBcEIsRUFBdUJDLENBQXZCLEVBQTBCO0FBQ3hCLE1BQUksQ0FBQ0EsQ0FBTCxFQUFRLE9BQU8sS0FBUDs7QUFFUixNQUFNMUIsT0FDSnlCLEVBQUVFLElBQUYsSUFBVSxlQUFWLElBQ0FELEVBQUVDLElBQUYsSUFBVSxlQUZaOztBQUtBLFNBQU8zQixJQUFQO0FBQ0Q7O0FBRUQ7Ozs7OztrQkFNZUwsTyIsImZpbGUiOiJoaXN0b3J5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnXG5pbXBvcnQgaXNFcXVhbCBmcm9tICdsb2Rhc2gvaXNFcXVhbCdcbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCB7IFJlY29yZCwgU3RhY2sgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBNT0RFTF9UWVBFUyBmcm9tICcuLi9jb25zdGFudHMvbW9kZWwtdHlwZXMnXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOmhpc3RvcnknKVxuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICByZWRvczogbmV3IFN0YWNrKCksXG4gIHVuZG9zOiBuZXcgU3RhY2soKSxcbn1cblxuLyoqXG4gKiBIaXN0b3J5LlxuICpcbiAqIEB0eXBlIHtIaXN0b3J5fVxuICovXG5cbmNsYXNzIEhpc3RvcnkgZXh0ZW5kcyBSZWNvcmQoREVGQVVMVFMpIHtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBIaXN0b3J5YCB3aXRoIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fEhpc3Rvcnl9IGF0dHJzXG4gICAqIEByZXR1cm4ge0hpc3Rvcnl9XG4gICAqL1xuXG4gIHN0YXRpYyBjcmVhdGUoYXR0cnMgPSB7fSkge1xuICAgIGlmIChIaXN0b3J5LmlzSGlzdG9yeShhdHRycykpIHtcbiAgICAgIHJldHVybiBhdHRyc1xuICAgIH1cblxuICAgIGlmIChpc1BsYWluT2JqZWN0KGF0dHJzKSkge1xuICAgICAgcmV0dXJuIEhpc3RvcnkuZnJvbUpTT04oYXR0cnMpXG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IEVycm9yKGBcXGBIaXN0b3J5LmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cyBvciBoaXN0b3JpZXMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYEhpc3RvcnlgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge0hpc3Rvcnl9XG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlNPTihvYmplY3QpIHtcbiAgICBjb25zdCB7XG4gICAgICByZWRvcyA9IFtdLFxuICAgICAgdW5kb3MgPSBbXSxcbiAgICB9ID0gb2JqZWN0XG5cbiAgICBjb25zdCBoaXN0b3J5ID0gbmV3IEhpc3Rvcnkoe1xuICAgICAgcmVkb3M6IG5ldyBTdGFjayhyZWRvcyksXG4gICAgICB1bmRvczogbmV3IFN0YWNrKHVuZG9zKSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIGhpc3RvcnlcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgZnJvbUpTYC5cbiAgICovXG5cbiAgc3RhdGljIGZyb21KUyA9IEhpc3RvcnkuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgSGlzdG9yeWAuXG4gICAqXG4gICAqIEBwYXJhbSB7QW55fSBhbnlcbiAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc3RhdGljIGlzSGlzdG9yeShhbnkpIHtcbiAgICByZXR1cm4gISEoYW55ICYmIGFueVtNT0RFTF9UWVBFUy5ISVNUT1JZXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGtpbmQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgcmV0dXJuICdoaXN0b3J5J1xuICB9XG5cbiAgLyoqXG4gICAqIFNhdmUgYW4gYG9wZXJhdGlvbmAgaW50byB0aGUgaGlzdG9yeS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wZXJhdGlvblxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgKiBAcmV0dXJuIHtIaXN0b3J5fVxuICAgKi9cblxuICBzYXZlKG9wZXJhdGlvbiwgb3B0aW9ucyA9IHt9KSB7XG4gICAgbGV0IGhpc3RvcnkgPSB0aGlzXG4gICAgbGV0IHsgdW5kb3MsIHJlZG9zIH0gPSBoaXN0b3J5XG4gICAgbGV0IHsgbWVyZ2UsIHNraXAgfSA9IG9wdGlvbnNcbiAgICBjb25zdCBwcmV2QmF0Y2ggPSB1bmRvcy5wZWVrKClcbiAgICBjb25zdCBwcmV2T3BlcmF0aW9uID0gcHJldkJhdGNoICYmIHByZXZCYXRjaFtwcmV2QmF0Y2gubGVuZ3RoIC0gMV1cblxuICAgIGlmIChza2lwID09IG51bGwpIHtcbiAgICAgIHNraXAgPSBzaG91bGRTa2lwKG9wZXJhdGlvbiwgcHJldk9wZXJhdGlvbilcbiAgICB9XG5cbiAgICBpZiAoc2tpcCkge1xuICAgICAgcmV0dXJuIGhpc3RvcnlcbiAgICB9XG5cbiAgICBpZiAobWVyZ2UgPT0gbnVsbCkge1xuICAgICAgbWVyZ2UgPSBzaG91bGRNZXJnZShvcGVyYXRpb24sIHByZXZPcGVyYXRpb24pXG4gICAgfVxuXG4gICAgZGVidWcoJ3NhdmUnLCB7IG9wZXJhdGlvbiwgbWVyZ2UgfSlcblxuICAgIC8vIElmIHRoZSBgbWVyZ2VgIGZsYWcgaXMgdHJ1ZSwgYWRkIHRoZSBvcGVyYXRpb24gdG8gdGhlIHByZXZpb3VzIGJhdGNoLlxuICAgIGlmIChtZXJnZSkge1xuICAgICAgY29uc3QgYmF0Y2ggPSBwcmV2QmF0Y2guc2xpY2UoKVxuICAgICAgYmF0Y2gucHVzaChvcGVyYXRpb24pXG4gICAgICB1bmRvcyA9IHVuZG9zLnBvcCgpXG4gICAgICB1bmRvcyA9IHVuZG9zLnB1c2goYmF0Y2gpXG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCBjcmVhdGUgYSBuZXcgYmF0Y2ggd2l0aCB0aGUgb3BlcmF0aW9uLlxuICAgIGVsc2Uge1xuICAgICAgY29uc3QgYmF0Y2ggPSBbb3BlcmF0aW9uXVxuICAgICAgdW5kb3MgPSB1bmRvcy5wdXNoKGJhdGNoKVxuICAgIH1cblxuICAgIC8vIENvbnN0cmFpbiB0aGUgaGlzdG9yeSB0byAxMDAgZW50cmllcyBmb3IgbWVtb3J5J3Mgc2FrZS5cbiAgICBpZiAodW5kb3MubGVuZ3RoID4gMTAwKSB7XG4gICAgICB1bmRvcyA9IHVuZG9zLnRha2UoMTAwKVxuICAgIH1cblxuICAgIC8vIENsZWFyIHRoZSByZWRvcyBhbmQgdXBkYXRlIHRoZSBoaXN0b3J5LlxuICAgIHJlZG9zID0gcmVkb3MuY2xlYXIoKVxuICAgIGhpc3RvcnkgPSBoaXN0b3J5LnNldCgndW5kb3MnLCB1bmRvcykuc2V0KCdyZWRvcycsIHJlZG9zKVxuICAgIHJldHVybiBoaXN0b3J5XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgaGlzdG9yeS5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04oKSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAga2luZDogdGhpcy5raW5kLFxuICAgICAgcmVkb3M6IHRoaXMucmVkb3MudG9KU09OKCksXG4gICAgICB1bmRvczogdGhpcy51bmRvcy50b0pTT04oKSxcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYHRvSlNgLlxuICAgKi9cblxuICB0b0pTKCkge1xuICAgIHJldHVybiB0aGlzLnRvSlNPTigpXG4gIH1cblxufVxuXG4vKipcbiAqIEF0dGFjaCBhIHBzZXVkby1zeW1ib2wgZm9yIHR5cGUgY2hlY2tpbmcuXG4gKi9cblxuSGlzdG9yeS5wcm90b3R5cGVbTU9ERUxfVFlQRVMuSElTVE9SWV0gPSB0cnVlXG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0byBtZXJnZSBhIG5ldyBvcGVyYXRpb24gYG9gIGludG8gdGhlIHByZXZpb3VzIG9wZXJhdGlvbiBgcGAuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9cbiAqIEBwYXJhbSB7T2JqZWN0fSBwXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIHNob3VsZE1lcmdlKG8sIHApIHtcbiAgaWYgKCFwKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBtZXJnZSA9IChcbiAgICAoXG4gICAgICBvLnR5cGUgPT0gJ3NldF9zZWxlY3Rpb24nICYmXG4gICAgICBwLnR5cGUgPT0gJ3NldF9zZWxlY3Rpb24nXG4gICAgKSB8fCAoXG4gICAgICBvLnR5cGUgPT0gJ2luc2VydF90ZXh0JyAmJlxuICAgICAgcC50eXBlID09ICdpbnNlcnRfdGV4dCcgJiZcbiAgICAgIG8ub2Zmc2V0ID09IHAub2Zmc2V0ICsgcC50ZXh0Lmxlbmd0aCAmJlxuICAgICAgaXNFcXVhbChvLnBhdGgsIHAucGF0aClcbiAgICApIHx8IChcbiAgICAgIG8udHlwZSA9PSAncmVtb3ZlX3RleHQnICYmXG4gICAgICBwLnR5cGUgPT0gJ3JlbW92ZV90ZXh0JyAmJlxuICAgICAgby5vZmZzZXQgKyBvLnRleHQubGVuZ3RoID09IHAub2Zmc2V0ICYmXG4gICAgICBpc0VxdWFsKG8ucGF0aCwgcC5wYXRoKVxuICAgIClcbiAgKVxuXG4gIHJldHVybiBtZXJnZVxufVxuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdG8gc2tpcCBhIG5ldyBvcGVyYXRpb24gYG9gLCBnaXZlbiBwcmV2aW91cyBvcGVyYXRpb24gYHBgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvXG4gKiBAcGFyYW0ge09iamVjdH0gcFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBzaG91bGRTa2lwKG8sIHApIHtcbiAgaWYgKCFwKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBza2lwID0gKFxuICAgIG8udHlwZSA9PSAnc2V0X3NlbGVjdGlvbicgJiZcbiAgICBwLnR5cGUgPT0gJ3NldF9zZWxlY3Rpb24nXG4gIClcblxuICByZXR1cm4gc2tpcFxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7SGlzdG9yeX1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBIaXN0b3J5XG4iXX0=