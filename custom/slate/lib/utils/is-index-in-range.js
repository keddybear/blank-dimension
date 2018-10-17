"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Check if an `index` of a `text` node is in a `range`.
 *
 * @param {Number} index
 * @param {Text} text
 * @param {Range} range
 * @return {Boolean}
 */

function isIndexInRange(index, text, range) {
  var startKey = range.startKey,
      startOffset = range.startOffset,
      endKey = range.endKey,
      endOffset = range.endOffset;


  if (text.key == startKey && text.key == endKey) {
    return startOffset <= index && index < endOffset;
  } else if (text.key == startKey) {
    return startOffset <= index;
  } else if (text.key == endKey) {
    return index < endOffset;
  } else {
    return true;
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = isIndexInRange;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9pcy1pbmRleC1pbi1yYW5nZS5qcyJdLCJuYW1lcyI6WyJpc0luZGV4SW5SYW5nZSIsImluZGV4IiwidGV4dCIsInJhbmdlIiwic3RhcnRLZXkiLCJzdGFydE9mZnNldCIsImVuZEtleSIsImVuZE9mZnNldCIsImtleSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7Ozs7OztBQVNBLFNBQVNBLGNBQVQsQ0FBd0JDLEtBQXhCLEVBQStCQyxJQUEvQixFQUFxQ0MsS0FBckMsRUFBNEM7QUFBQSxNQUNsQ0MsUUFEa0MsR0FDV0QsS0FEWCxDQUNsQ0MsUUFEa0M7QUFBQSxNQUN4QkMsV0FEd0IsR0FDV0YsS0FEWCxDQUN4QkUsV0FEd0I7QUFBQSxNQUNYQyxNQURXLEdBQ1dILEtBRFgsQ0FDWEcsTUFEVztBQUFBLE1BQ0hDLFNBREcsR0FDV0osS0FEWCxDQUNISSxTQURHOzs7QUFHMUMsTUFBSUwsS0FBS00sR0FBTCxJQUFZSixRQUFaLElBQXdCRixLQUFLTSxHQUFMLElBQVlGLE1BQXhDLEVBQWdEO0FBQzlDLFdBQU9ELGVBQWVKLEtBQWYsSUFBd0JBLFFBQVFNLFNBQXZDO0FBQ0QsR0FGRCxNQUVPLElBQUlMLEtBQUtNLEdBQUwsSUFBWUosUUFBaEIsRUFBMEI7QUFDL0IsV0FBT0MsZUFBZUosS0FBdEI7QUFDRCxHQUZNLE1BRUEsSUFBSUMsS0FBS00sR0FBTCxJQUFZRixNQUFoQixFQUF3QjtBQUM3QixXQUFPTCxRQUFRTSxTQUFmO0FBQ0QsR0FGTSxNQUVBO0FBQ0wsV0FBTyxJQUFQO0FBQ0Q7QUFDRjs7QUFFRDs7Ozs7O2tCQU1lUCxjIiwiZmlsZSI6ImlzLWluZGV4LWluLXJhbmdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIENoZWNrIGlmIGFuIGBpbmRleGAgb2YgYSBgdGV4dGAgbm9kZSBpcyBpbiBhIGByYW5nZWAuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gKiBAcGFyYW0ge1RleHR9IHRleHRcbiAqIEBwYXJhbSB7UmFuZ2V9IHJhbmdlXG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICovXG5cbmZ1bmN0aW9uIGlzSW5kZXhJblJhbmdlKGluZGV4LCB0ZXh0LCByYW5nZSkge1xuICBjb25zdCB7IHN0YXJ0S2V5LCBzdGFydE9mZnNldCwgZW5kS2V5LCBlbmRPZmZzZXQgfSA9IHJhbmdlXG5cbiAgaWYgKHRleHQua2V5ID09IHN0YXJ0S2V5ICYmIHRleHQua2V5ID09IGVuZEtleSkge1xuICAgIHJldHVybiBzdGFydE9mZnNldCA8PSBpbmRleCAmJiBpbmRleCA8IGVuZE9mZnNldFxuICB9IGVsc2UgaWYgKHRleHQua2V5ID09IHN0YXJ0S2V5KSB7XG4gICAgcmV0dXJuIHN0YXJ0T2Zmc2V0IDw9IGluZGV4XG4gIH0gZWxzZSBpZiAodGV4dC5rZXkgPT0gZW5kS2V5KSB7XG4gICAgcmV0dXJuIGluZGV4IDwgZW5kT2Zmc2V0XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgaXNJbmRleEluUmFuZ2VcbiJdfQ==