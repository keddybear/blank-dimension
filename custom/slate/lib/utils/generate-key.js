"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * An auto-incrementing index for generating keys.
 *
 * @type {Number}
 */

var n = void 0;

/**
 * The global key generating function.
 *
 * @type {Function}
 */

var generate = void 0;

/**
 * Generate a key.
 *
 * @return {String}
 */

function generateKey() {
  return generate();
}

/**
 * Set a different unique ID generating `function`.
 *
 * @param {Function} func
 */

function setKeyGenerator(func) {
  generate = func;
}

/**
 * Reset the key generating function to its initial state.
 */

function resetKeyGenerator() {
  n = 0;
  generate = function generate() {
    return "" + n++;
  };
}

/**
 * Set the initial state.
 */

resetKeyGenerator();

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = generateKey;
exports.setKeyGenerator = setKeyGenerator;
exports.resetKeyGenerator = resetKeyGenerator;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9nZW5lcmF0ZS1rZXkuanMiXSwibmFtZXMiOlsibiIsImdlbmVyYXRlIiwiZ2VuZXJhdGVLZXkiLCJzZXRLZXlHZW5lcmF0b3IiLCJmdW5jIiwicmVzZXRLZXlHZW5lcmF0b3IiLCJkZWZhdWx0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7Ozs7O0FBTUEsSUFBSUEsVUFBSjs7QUFFQTs7Ozs7O0FBTUEsSUFBSUMsaUJBQUo7O0FBRUE7Ozs7OztBQU1BLFNBQVNDLFdBQVQsR0FBdUI7QUFDckIsU0FBT0QsVUFBUDtBQUNEOztBQUVEOzs7Ozs7QUFNQSxTQUFTRSxlQUFULENBQXlCQyxJQUF6QixFQUErQjtBQUM3QkgsYUFBV0csSUFBWDtBQUNEOztBQUVEOzs7O0FBSUEsU0FBU0MsaUJBQVQsR0FBNkI7QUFDM0JMLE1BQUksQ0FBSjtBQUNBQyxhQUFXO0FBQUEsZ0JBQVNELEdBQVQ7QUFBQSxHQUFYO0FBQ0Q7O0FBRUQ7Ozs7QUFJQUs7O0FBRUE7Ozs7OztRQU9pQkMsTyxHQUFmSixXO1FBQ0FDLGUsR0FBQUEsZTtRQUNBRSxpQixHQUFBQSxpQiIsImZpbGUiOiJnZW5lcmF0ZS1rZXkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQW4gYXV0by1pbmNyZW1lbnRpbmcgaW5kZXggZm9yIGdlbmVyYXRpbmcga2V5cy5cbiAqXG4gKiBAdHlwZSB7TnVtYmVyfVxuICovXG5cbmxldCBuXG5cbi8qKlxuICogVGhlIGdsb2JhbCBrZXkgZ2VuZXJhdGluZyBmdW5jdGlvbi5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxubGV0IGdlbmVyYXRlXG5cbi8qKlxuICogR2VuZXJhdGUgYSBrZXkuXG4gKlxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIGdlbmVyYXRlS2V5KCkge1xuICByZXR1cm4gZ2VuZXJhdGUoKVxufVxuXG4vKipcbiAqIFNldCBhIGRpZmZlcmVudCB1bmlxdWUgSUQgZ2VuZXJhdGluZyBgZnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmNcbiAqL1xuXG5mdW5jdGlvbiBzZXRLZXlHZW5lcmF0b3IoZnVuYykge1xuICBnZW5lcmF0ZSA9IGZ1bmNcbn1cblxuLyoqXG4gKiBSZXNldCB0aGUga2V5IGdlbmVyYXRpbmcgZnVuY3Rpb24gdG8gaXRzIGluaXRpYWwgc3RhdGUuXG4gKi9cblxuZnVuY3Rpb24gcmVzZXRLZXlHZW5lcmF0b3IoKSB7XG4gIG4gPSAwXG4gIGdlbmVyYXRlID0gKCkgPT4gYCR7bisrfWBcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGluaXRpYWwgc3RhdGUuXG4gKi9cblxucmVzZXRLZXlHZW5lcmF0b3IoKVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCB7XG4gIGdlbmVyYXRlS2V5IGFzIGRlZmF1bHQsXG4gIHNldEtleUdlbmVyYXRvcixcbiAgcmVzZXRLZXlHZW5lcmF0b3Jcbn1cbiJdfQ==