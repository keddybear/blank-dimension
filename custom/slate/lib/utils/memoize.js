'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Is in development?
 *
 * @type {Boolean}
 */

var IS_DEV = typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production';

/**
 * GLOBAL: True if memoization should is enabled. Only effective when `IS_DEV`.
 *
 * @type {Boolean}
 */

var ENABLED = true;

/**
 * GLOBAL: Changing this cache key will clear all previous cached results.
 * Only effective when `IS_DEV`.
 *
 * @type {Number}
 */

var CACHE_KEY = 0;

/**
 * The leaf node of a cache tree. Used to support variable argument length. A
 * unique object, so that native Maps will key it by reference.
 *
 * @type {Object}
 */

var LEAF = {};

/**
 * A value to represent a memoized undefined value. Allows efficient value
 * retrieval using Map.get only.
 *
 * @type {Object}
 */

var UNDEFINED = {};

/**
 * Default value for unset keys in native Maps
 *
 * @type {Undefined}
 */

var UNSET = undefined;

/**
 * Memoize all of the `properties` on a `object`.
 *
 * @param {Object} object
 * @param {Array} properties
 * @return {Record}
 */

function memoize(object, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var _options$takesArgumen = options.takesArguments,
      takesArguments = _options$takesArgumen === undefined ? true : _options$takesArgumen;
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var property = _step.value;

      var original = object[property];

      if (!original) {
        throw new Error('Object does not have a property named "' + property + '".');
      }

      object[property] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        if (IS_DEV) {
          // If memoization is disabled, call into the original method.
          if (!ENABLED) return original.apply(this, args);

          // If the cache key is different, previous caches must be cleared.
          if (CACHE_KEY !== this.__cache_key) {
            this.__cache_key = CACHE_KEY;
            this.__cache = new Map(); // eslint-disable-line no-undef,no-restricted-globals
          }
        }

        if (!this.__cache) {
          this.__cache = new Map(); // eslint-disable-line no-undef,no-restricted-globals
        }

        var cachedValue = void 0;
        var keys = void 0;

        if (takesArguments) {
          keys = [property].concat(args);
          cachedValue = getIn(this.__cache, keys);
        } else {
          cachedValue = this.__cache.get(property);
        }

        // If we've got a result already, return it.
        if (cachedValue !== UNSET) {
          return cachedValue === UNDEFINED ? undefined : cachedValue;
        }

        // Otherwise calculate what it should be once and cache it.
        var value = original.apply(this, args);
        var v = value === undefined ? UNDEFINED : value;

        if (takesArguments) {
          this.__cache = setIn(this.__cache, keys, v);
        } else {
          this.__cache.set(property, v);
        }

        return value;
      };
    };

    for (var _iterator = properties[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
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
 * Get a value at a key path in a tree of Map.
 *
 * If not set, returns UNSET.
 * If the set value is undefined, returns UNDEFINED.
 *
 * @param {Map} map
 * @param {Array} keys
 * @return {Any|UNSET|UNDEFINED}
 */

function getIn(map, keys) {
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = keys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var key = _step2.value;

      map = map.get(key);
      if (map === UNSET) return UNSET;
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

  return map.get(LEAF);
}

/**
 * Set a value at a key path in a tree of Map, creating Maps on the go.
 *
 * @param {Map} map
 * @param {Array} keys
 * @param {Any} value
 * @return {Map}
 */

function setIn(map, keys, value) {
  var parent = map;
  var child = void 0;

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = keys[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var key = _step3.value;

      child = parent.get(key);

      // If the path was not created yet...
      if (child === UNSET) {
        child = new Map(); // eslint-disable-line no-undef,no-restricted-globals
        parent.set(key, child);
      }

      parent = child;
    }

    // The whole path has been created, so set the value to the bottom most map.
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

  child.set(LEAF, value);
  return map;
}

/**
 * In DEV mode, clears the previously memoized values, globally.
 *
 * @return {Void}
 */

function __clear() {
  CACHE_KEY++;

  if (CACHE_KEY >= Number.MAX_SAFE_INTEGER) {
    CACHE_KEY = 0;
  }
}

/**
 * In DEV mode, enable or disable the use of memoize values, globally.
 *
 * @param {Boolean} enabled
 * @return {Void}
 */

function __enable(enabled) {
  ENABLED = enabled;
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = memoize;
exports.__clear = __clear;
exports.__enable = __enable;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9tZW1vaXplLmpzIl0sIm5hbWVzIjpbIklTX0RFViIsInByb2Nlc3MiLCJlbnYiLCJOT0RFX0VOViIsIkVOQUJMRUQiLCJDQUNIRV9LRVkiLCJMRUFGIiwiVU5ERUZJTkVEIiwiVU5TRVQiLCJ1bmRlZmluZWQiLCJtZW1vaXplIiwib2JqZWN0IiwicHJvcGVydGllcyIsIm9wdGlvbnMiLCJ0YWtlc0FyZ3VtZW50cyIsInByb3BlcnR5Iiwib3JpZ2luYWwiLCJFcnJvciIsImFyZ3MiLCJhcHBseSIsIl9fY2FjaGVfa2V5IiwiX19jYWNoZSIsIk1hcCIsImNhY2hlZFZhbHVlIiwia2V5cyIsImdldEluIiwiZ2V0IiwidmFsdWUiLCJ2Iiwic2V0SW4iLCJzZXQiLCJtYXAiLCJrZXkiLCJwYXJlbnQiLCJjaGlsZCIsIl9fY2xlYXIiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwiX19lbmFibGUiLCJlbmFibGVkIiwiZGVmYXVsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7OztBQU1BLElBQU1BLFNBQ0osT0FBT0MsT0FBUCxLQUFtQixXQUFuQixJQUNBQSxRQUFRQyxHQURSLElBRUFELFFBQVFDLEdBQVIsQ0FBWUMsUUFBWixLQUF5QixZQUgzQjs7QUFNQTs7Ozs7O0FBTUEsSUFBSUMsVUFBVSxJQUFkOztBQUVBOzs7Ozs7O0FBT0EsSUFBSUMsWUFBWSxDQUFoQjs7QUFFQTs7Ozs7OztBQU9BLElBQU1DLE9BQU8sRUFBYjs7QUFFQTs7Ozs7OztBQU9BLElBQU1DLFlBQVksRUFBbEI7O0FBRUE7Ozs7OztBQU1BLElBQU1DLFFBQVFDLFNBQWQ7O0FBRUE7Ozs7Ozs7O0FBUUEsU0FBU0MsT0FBVCxDQUFpQkMsTUFBakIsRUFBeUJDLFVBQXpCLEVBQW1EO0FBQUEsTUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUEsOEJBQ2ZBLE9BRGUsQ0FDekNDLGNBRHlDO0FBQUEsTUFDekNBLGNBRHlDLHlDQUN4QixJQUR3QjtBQUFBO0FB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QUFQLENBQVdNLEdBQVgsQ0FBUjs7QUFFQTtBQUNBLFVBQUlFLFVBQVUxQixLQUFkLEVBQXFCO0FBQ25CMEIsZ0JBQVEsSUFBSVosR0FBSixFQUFSLENBRG1CLENBQ0Q7QUFDbEJXLGVBQU9ILEdBQVAsQ0FBV0UsR0FBWCxFQUFnQkUsS0FBaEI7QUFDRDs7QUFFREQsZUFBU0MsS0FBVDtBQUNEOztBQUVEO0FBaEIrQjtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOztBQWlCL0JBLFFBQU1KLEdBQU4sQ0FBVXhCLElBQVYsRUFBZ0JxQixLQUFoQjtBQUNBLFNBQU9JLEdBQVA7QUFDRDs7QUFFRDs7Ozs7O0FBTUEsU0FBU0ksT0FBVCxHQUFtQjtBQUNqQjlCOztBQUVBLE1BQUlBLGFBQWErQixPQUFPQyxnQkFBeEIsRUFBMEM7QUFDeENoQyxnQkFBWSxDQUFaO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7OztBQU9BLFNBQVNpQyxRQUFULENBQWtCQyxPQUFsQixFQUEyQjtBQUN6Qm5DLFlBQVVtQyxPQUFWO0FBQ0Q7O0FBRUQ7Ozs7OztRQU9hQyxPLEdBQVg5QixPO1FBQ0F5QixPLEdBQUFBLE87UUFDQUcsUSxHQUFBQSxRIiwiZmlsZSI6Im1lbW9pemUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogSXMgaW4gZGV2ZWxvcG1lbnQ/XG4gKlxuICogQHR5cGUge0Jvb2xlYW59XG4gKi9cblxuY29uc3QgSVNfREVWID0gKFxuICB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgcHJvY2Vzcy5lbnYgJiZcbiAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJ1xuKVxuXG4vKipcbiAqIEdMT0JBTDogVHJ1ZSBpZiBtZW1vaXphdGlvbiBzaG91bGQgaXMgZW5hYmxlZC4gT25seSBlZmZlY3RpdmUgd2hlbiBgSVNfREVWYC5cbiAqXG4gKiBAdHlwZSB7Qm9vbGVhbn1cbiAqL1xuXG5sZXQgRU5BQkxFRCA9IHRydWVcblxuLyoqXG4gKiBHTE9CQUw6IENoYW5naW5nIHRoaXMgY2FjaGUga2V5IHdpbGwgY2xlYXIgYWxsIHByZXZpb3VzIGNhY2hlZCByZXN1bHRzLlxuICogT25seSBlZmZlY3RpdmUgd2hlbiBgSVNfREVWYC5cbiAqXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5cbmxldCBDQUNIRV9LRVkgPSAwXG5cbi8qKlxuICogVGhlIGxlYWYgbm9kZSBvZiBhIGNhY2hlIHRyZWUuIFVzZWQgdG8gc3VwcG9ydCB2YXJpYWJsZSBhcmd1bWVudCBsZW5ndGguIEFcbiAqIHVuaXF1ZSBvYmplY3QsIHNvIHRoYXQgbmF0aXZlIE1hcHMgd2lsbCBrZXkgaXQgYnkgcmVmZXJlbmNlLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgTEVBRiA9IHt9XG5cbi8qKlxuICogQSB2YWx1ZSB0byByZXByZXNlbnQgYSBtZW1vaXplZCB1bmRlZmluZWQgdmFsdWUuIEFsbG93cyBlZmZpY2llbnQgdmFsdWVcbiAqIHJldHJpZXZhbCB1c2luZyBNYXAuZ2V0IG9ubHkuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBVTkRFRklORUQgPSB7fVxuXG4vKipcbiAqIERlZmF1bHQgdmFsdWUgZm9yIHVuc2V0IGtleXMgaW4gbmF0aXZlIE1hcHNcbiAqXG4gKiBAdHlwZSB7VW5kZWZpbmVkfVxuICovXG5cbmNvbnN0IFVOU0VUID0gdW5kZWZpbmVkXG5cbi8qKlxuICogTWVtb2l6ZSBhbGwgb2YgdGhlIGBwcm9wZXJ0aWVzYCBvbiBhIGBvYmplY3RgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmplY3RcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3BlcnRpZXNcbiAqIEByZXR1cm4ge1JlY29yZH1cbiAqL1xuXG5mdW5jdGlvbiBtZW1vaXplKG9iamVjdCwgcHJvcGVydGllcywgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IHsgdGFrZXNBcmd1bWVudHMgPSB0cnVlIH0gPSBvcHRpb25zXG5cbiAgZm9yIChjb25zdCBwcm9wZXJ0eSBvZiBwcm9wZXJ0aWVzKSB7XG4gICAgY29uc3Qgb3JpZ2luYWwgPSBvYmplY3RbcHJvcGVydHldXG5cbiAgICBpZiAoIW9yaWdpbmFsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYE9iamVjdCBkb2VzIG5vdCBoYXZlIGEgcHJvcGVydHkgbmFtZWQgXCIke3Byb3BlcnR5fVwiLmApXG4gICAgfVxuXG4gICAgb2JqZWN0W3Byb3BlcnR5XSA9IGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgICBpZiAoSVNfREVWKSB7XG4gICAgICAgIC8vIElmIG1lbW9pemF0aW9uIGlzIGRpc2FibGVkLCBjYWxsIGludG8gdGhlIG9yaWdpbmFsIG1ldGhvZC5cbiAgICAgICAgaWYgKCFFTkFCTEVEKSByZXR1cm4gb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncylcblxuICAgICAgICAvLyBJZiB0aGUgY2FjaGUga2V5IGlzIGRpZmZlcmVudCwgcHJldmlvdXMgY2FjaGVzIG11c3QgYmUgY2xlYXJlZC5cbiAgICAgICAgaWYgKENBQ0hFX0tFWSAhPT0gdGhpcy5fX2NhY2hlX2tleSkge1xuICAgICAgICAgIHRoaXMuX19jYWNoZV9rZXkgPSBDQUNIRV9LRVlcbiAgICAgICAgICB0aGlzLl9fY2FjaGUgPSBuZXcgTWFwKCkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZixuby1yZXN0cmljdGVkLWdsb2JhbHNcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX19jYWNoZSkge1xuICAgICAgICB0aGlzLl9fY2FjaGUgPSBuZXcgTWFwKCkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZixuby1yZXN0cmljdGVkLWdsb2JhbHNcbiAgICAgIH1cblxuICAgICAgbGV0IGNhY2hlZFZhbHVlXG4gICAgICBsZXQga2V5c1xuXG4gICAgICBpZiAodGFrZXNBcmd1bWVudHMpIHtcbiAgICAgICAga2V5cyA9IFtwcm9wZXJ0eSwgLi4uYXJnc11cbiAgICAgICAgY2FjaGVkVmFsdWUgPSBnZXRJbih0aGlzLl9fY2FjaGUsIGtleXMpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWNoZWRWYWx1ZSA9IHRoaXMuX19jYWNoZS5nZXQocHJvcGVydHkpXG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlJ3ZlIGdvdCBhIHJlc3VsdCBhbHJlYWR5LCByZXR1cm4gaXQuXG4gICAgICBpZiAoY2FjaGVkVmFsdWUgIT09IFVOU0VUKSB7XG4gICAgICAgIHJldHVybiBjYWNoZWRWYWx1ZSA9PT0gVU5ERUZJTkVEID8gdW5kZWZpbmVkIDogY2FjaGVkVmFsdWVcbiAgICAgIH1cblxuICAgICAgLy8gT3RoZXJ3aXNlIGNhbGN1bGF0ZSB3aGF0IGl0IHNob3VsZCBiZSBvbmNlIGFuZCBjYWNoZSBpdC5cbiAgICAgIGNvbnN0IHZhbHVlID0gb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncylcbiAgICAgIGNvbnN0IHYgPSB2YWx1ZSA9PT0gdW5kZWZpbmVkID8gVU5ERUZJTkVEIDogdmFsdWVcblxuICAgICAgaWYgKHRha2VzQXJndW1lbnRzKSB7XG4gICAgICAgIHRoaXMuX19jYWNoZSA9IHNldEluKHRoaXMuX19jYWNoZSwga2V5cywgdilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX19jYWNoZS5zZXQocHJvcGVydHksIHYpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEdldCBhIHZhbHVlIGF0IGEga2V5IHBhdGggaW4gYSB0cmVlIG9mIE1hcC5cbiAqXG4gKiBJZiBub3Qgc2V0LCByZXR1cm5zIFVOU0VULlxuICogSWYgdGhlIHNldCB2YWx1ZSBpcyB1bmRlZmluZWQsIHJldHVybnMgVU5ERUZJTkVELlxuICpcbiAqIEBwYXJhbSB7TWFwfSBtYXBcbiAqIEBwYXJhbSB7QXJyYXl9IGtleXNcbiAqIEByZXR1cm4ge0FueXxVTlNFVHxVTkRFRklORUR9XG4gKi9cblxuZnVuY3Rpb24gZ2V0SW4obWFwLCBrZXlzKSB7XG4gIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICBtYXAgPSBtYXAuZ2V0KGtleSlcbiAgICBpZiAobWFwID09PSBVTlNFVCkgcmV0dXJuIFVOU0VUXG4gIH1cblxuICByZXR1cm4gbWFwLmdldChMRUFGKVxufVxuXG4vKipcbiAqIFNldCBhIHZhbHVlIGF0IGEga2V5IHBhdGggaW4gYSB0cmVlIG9mIE1hcCwgY3JlYXRpbmcgTWFwcyBvbiB0aGUgZ28uXG4gKlxuICogQHBhcmFtIHtNYXB9IG1hcFxuICogQHBhcmFtIHtBcnJheX0ga2V5c1xuICogQHBhcmFtIHtBbnl9IHZhbHVlXG4gKiBAcmV0dXJuIHtNYXB9XG4gKi9cblxuZnVuY3Rpb24gc2V0SW4obWFwLCBrZXlzLCB2YWx1ZSkge1xuICBsZXQgcGFyZW50ID0gbWFwXG4gIGxldCBjaGlsZFxuXG4gIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICBjaGlsZCA9IHBhcmVudC5nZXQoa2V5KVxuXG4gICAgLy8gSWYgdGhlIHBhdGggd2FzIG5vdCBjcmVhdGVkIHlldC4uLlxuICAgIGlmIChjaGlsZCA9PT0gVU5TRVQpIHtcbiAgICAgIGNoaWxkID0gbmV3IE1hcCgpIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYsbm8tcmVzdHJpY3RlZC1nbG9iYWxzXG4gICAgICBwYXJlbnQuc2V0KGtleSwgY2hpbGQpXG4gICAgfVxuXG4gICAgcGFyZW50ID0gY2hpbGRcbiAgfVxuXG4gIC8vIFRoZSB3aG9sZSBwYXRoIGhhcyBiZWVuIGNyZWF0ZWQsIHNvIHNldCB0aGUgdmFsdWUgdG8gdGhlIGJvdHRvbSBtb3N0IG1hcC5cbiAgY2hpbGQuc2V0KExFQUYsIHZhbHVlKVxuICByZXR1cm4gbWFwXG59XG5cbi8qKlxuICogSW4gREVWIG1vZGUsIGNsZWFycyB0aGUgcHJldmlvdXNseSBtZW1vaXplZCB2YWx1ZXMsIGdsb2JhbGx5LlxuICpcbiAqIEByZXR1cm4ge1ZvaWR9XG4gKi9cblxuZnVuY3Rpb24gX19jbGVhcigpIHtcbiAgQ0FDSEVfS0VZKytcblxuICBpZiAoQ0FDSEVfS0VZID49IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSB7XG4gICAgQ0FDSEVfS0VZID0gMFxuICB9XG59XG5cbi8qKlxuICogSW4gREVWIG1vZGUsIGVuYWJsZSBvciBkaXNhYmxlIHRoZSB1c2Ugb2YgbWVtb2l6ZSB2YWx1ZXMsIGdsb2JhbGx5LlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gZW5hYmxlZFxuICogQHJldHVybiB7Vm9pZH1cbiAqL1xuXG5mdW5jdGlvbiBfX2VuYWJsZShlbmFibGVkKSB7XG4gIEVOQUJMRUQgPSBlbmFibGVkXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0IHtcbiAgbWVtb2l6ZSBhcyBkZWZhdWx0LFxuICBfX2NsZWFyLFxuICBfX2VuYWJsZVxufVxuIl19