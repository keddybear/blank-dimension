'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _invert = require('../operations/invert');

var _invert2 = _interopRequireDefault(_invert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Redo to the next value in the history.
 *
 * @param {Change} change
 */

Changes.redo = function (change) {
  var value = change.value;
  var _value = value,
      history = _value.history;

  if (!history) return;

  var _history = history,
      undos = _history.undos,
      redos = _history.redos;

  var next = redos.peek();
  if (!next) return;

  // Shift the next value into the undo stack.
  redos = redos.pop();
  undos = undos.push(next);

  // Replay the next operations.
  next.forEach(function (op) {
    change.applyOperation(op, { save: false });
  });

  // Update the history.
  value = change.value;
  history = history.set('undos', undos).set('redos', redos);
  value = value.set('history', history);
  change.value = value;
};

/**
 * Undo the previous operations in the history.
 *
 * @param {Change} change
 */

Changes.undo = function (change) {
  var value = change.value;
  var _value2 = value,
      history = _value2.history;

  if (!history) return;

  var _history2 = history,
      undos = _history2.undos,
      redos = _history2.redos;

  var previous = undos.peek();
  if (!previous) return;

  // Shift the previous operations into the redo stack.
  undos = undos.pop();
  redos = redos.push(previous);

  // Replay the inverse of the previous operations.
  previous.slice().reverse().map(_invert2.default).forEach(function (inverse) {
    change.applyOperation(inverse, { save: false });
  });

  // Update the history.
  value = change.value;
  history = history.set('undos', undos).set('redos', redos);
  value = value.set('history', history);
  change.value = value;
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL29uLWhpc3RvcnkuanMiXSwibmFtZXMiOlsiQ2hhbmdlcyIsInJlZG8iLCJjaGFuZ2UiLCJ2YWx1ZSIsImhpc3RvcnkiLCJ1bmRvcyIsInJlZG9zIiwibmV4dCIsInBlZWsiLCJwb3AiLCJwdXNoIiwiZm9yRWFjaCIsIm9wIiwiYXBwbHlPcGVyYXRpb24iLCJzYXZlIiwic2V0IiwidW5kbyIsInByZXZpb3VzIiwic2xpY2UiLCJyZXZlcnNlIiwibWFwIiwiaW52ZXJzZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxVQUFVLEVBQWhCOztBQUVBOzs7Ozs7QUFNQUEsUUFBUUMsSUFBUixHQUFlLFVBQUNDLE1BQUQsRUFBWTtBQUFBLE1BQ25CQyxLQURtQixHQUNURCxNQURTLENBQ25CQyxLQURtQjtBQUFBLGVBRVBBLEtBRk87QUFBQSxNQUVuQkMsT0FGbUIsVUFFbkJBLE9BRm1COztBQUd6QixNQUFJLENBQUNBLE9BQUwsRUFBYzs7QUFIVyxpQkFLRkEsT0FMRTtBQUFBLE1BS25CQyxLQUxtQixZQUtuQkEsS0FMbUI7QUFBQSxNQUtaQyxLQUxZLFlBS1pBLEtBTFk7O0FBTXpCLE1BQU1DLE9BQU9ELE1BQU1FLElBQU4sRUFBYjtBQUNBLE1BQUksQ0FBQ0QsSUFBTCxFQUFXOztBQUVYO0FBQ0FELFVBQVFBLE1BQU1HLEdBQU4sRUFBUjtBQUNBSixVQUFRQSxNQUFNSyxJQUFOLENBQVdILElBQVgsQ0FBUjs7QUFFQTtBQUNBQSxPQUFLSSxPQUFMLENBQWEsVUFBQ0MsRUFBRCxFQUFRO0FBQ25CVixXQUFPVyxjQUFQLENBQXNCRCxFQUF0QixFQUEwQixFQUFFRSxNQUFNLEtBQVIsRUFBMUI7QUFDRCxHQUZEOztBQUlBO0FBQ0FYLFVBQVFELE9BQU9DLEtBQWY7QUFDQUMsWUFBVUEsUUFBUVcsR0FBUixDQUFZLE9BQVosRUFBcUJWLEtBQXJCLEVBQTRCVSxHQUE1QixDQUFnQyxPQUFoQyxFQUF5Q1QsS0FBekMsQ0FBVjtBQUNBSCxVQUFRQSxNQUFNWSxHQUFOLENBQVUsU0FBVixFQUFxQlgsT0FBckIsQ0FBUjtBQUNBRixTQUFPQyxLQUFQLEdBQWVBLEtBQWY7QUFDRCxDQXZCRDs7QUF5QkE7Ozs7OztBQU1BSCxRQUFRZ0IsSUFBUixHQUFlLFVBQUNkLE1BQUQsRUFBWTtBQUFBLE1BQ25CQyxLQURtQixHQUNURCxNQURTLENBQ25CQyxLQURtQjtBQUFBLGdCQUVQQSxLQUZPO0FBQUEsTUFFbkJDLE9BRm1CLFdBRW5CQSxPQUZtQjs7QUFHekIsTUFBSSxDQUFDQSxPQUFMLEVBQWM7O0FBSFcsa0JBS0ZBLE9BTEU7QUFBQSxNQUtuQkMsS0FMbUIsYUFLbkJBLEtBTG1CO0FBQUEsTUFLWkMsS0FMWSxhQUtaQSxLQUxZOztBQU16QixNQUFNVyxXQUFXWixNQUFNRyxJQUFOLEVBQWpCO0FBQ0EsTUFBSSxDQUFDUyxRQUFMLEVBQWU7O0FBRWY7QUFDQVosVUFBUUEsTUFBTUksR0FBTixFQUFSO0FBQ0FILFVBQVFBLE1BQU1JLElBQU4sQ0FBV08sUUFBWCxDQUFSOztBQUVBO0FBQ0FBLFdBQVNDLEtBQVQsR0FBaUJDLE9BQWpCLEdBQTJCQyxHQUEzQixtQkFBdUNULE9BQXZDLENBQStDLFVBQUNVLE9BQUQsRUFBYTtBQUMxRG5CLFdBQU9XLGNBQVAsQ0FBc0JRLE9BQXRCLEVBQStCLEVBQUVQLE1BQU0sS0FBUixFQUEvQjtBQUNELEdBRkQ7O0FBSUE7QUFDQVgsVUFBUUQsT0FBT0MsS0FBZjtBQUNBQyxZQUFVQSxRQUFRVyxHQUFSLENBQVksT0FBWixFQUFxQlYsS0FBckIsRUFBNEJVLEdBQTVCLENBQWdDLE9BQWhDLEVBQXlDVCxLQUF6QyxDQUFWO0FBQ0FILFVBQVFBLE1BQU1ZLEdBQU4sQ0FBVSxTQUFWLEVBQXFCWCxPQUFyQixDQUFSO0FBQ0FGLFNBQU9DLEtBQVAsR0FBZUEsS0FBZjtBQUNELENBdkJEOztBQXlCQTs7Ozs7O2tCQU1lSCxPIiwiZmlsZSI6Im9uLWhpc3RvcnkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBpbnZlcnQgZnJvbSAnLi4vb3BlcmF0aW9ucy9pbnZlcnQnXG5cbi8qKlxuICogQ2hhbmdlcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IENoYW5nZXMgPSB7fVxuXG4vKipcbiAqIFJlZG8gdG8gdGhlIG5leHQgdmFsdWUgaW4gdGhlIGhpc3RvcnkuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICovXG5cbkNoYW5nZXMucmVkbyA9IChjaGFuZ2UpID0+IHtcbiAgbGV0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBsZXQgeyBoaXN0b3J5IH0gPSB2YWx1ZVxuICBpZiAoIWhpc3RvcnkpIHJldHVyblxuXG4gIGxldCB7IHVuZG9zLCByZWRvcyB9ID0gaGlzdG9yeVxuICBjb25zdCBuZXh0ID0gcmVkb3MucGVlaygpXG4gIGlmICghbmV4dCkgcmV0dXJuXG5cbiAgLy8gU2hpZnQgdGhlIG5leHQgdmFsdWUgaW50byB0aGUgdW5kbyBzdGFjay5cbiAgcmVkb3MgPSByZWRvcy5wb3AoKVxuICB1bmRvcyA9IHVuZG9zLnB1c2gobmV4dClcblxuICAvLyBSZXBsYXkgdGhlIG5leHQgb3BlcmF0aW9ucy5cbiAgbmV4dC5mb3JFYWNoKChvcCkgPT4ge1xuICAgIGNoYW5nZS5hcHBseU9wZXJhdGlvbihvcCwgeyBzYXZlOiBmYWxzZSB9KVxuICB9KVxuXG4gIC8vIFVwZGF0ZSB0aGUgaGlzdG9yeS5cbiAgdmFsdWUgPSBjaGFuZ2UudmFsdWVcbiAgaGlzdG9yeSA9IGhpc3Rvcnkuc2V0KCd1bmRvcycsIHVuZG9zKS5zZXQoJ3JlZG9zJywgcmVkb3MpXG4gIHZhbHVlID0gdmFsdWUuc2V0KCdoaXN0b3J5JywgaGlzdG9yeSlcbiAgY2hhbmdlLnZhbHVlID0gdmFsdWVcbn1cblxuLyoqXG4gKiBVbmRvIHRoZSBwcmV2aW91cyBvcGVyYXRpb25zIGluIHRoZSBoaXN0b3J5LlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqL1xuXG5DaGFuZ2VzLnVuZG8gPSAoY2hhbmdlKSA9PiB7XG4gIGxldCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgaGlzdG9yeSB9ID0gdmFsdWVcbiAgaWYgKCFoaXN0b3J5KSByZXR1cm5cblxuICBsZXQgeyB1bmRvcywgcmVkb3MgfSA9IGhpc3RvcnlcbiAgY29uc3QgcHJldmlvdXMgPSB1bmRvcy5wZWVrKClcbiAgaWYgKCFwcmV2aW91cykgcmV0dXJuXG5cbiAgLy8gU2hpZnQgdGhlIHByZXZpb3VzIG9wZXJhdGlvbnMgaW50byB0aGUgcmVkbyBzdGFjay5cbiAgdW5kb3MgPSB1bmRvcy5wb3AoKVxuICByZWRvcyA9IHJlZG9zLnB1c2gocHJldmlvdXMpXG5cbiAgLy8gUmVwbGF5IHRoZSBpbnZlcnNlIG9mIHRoZSBwcmV2aW91cyBvcGVyYXRpb25zLlxuICBwcmV2aW91cy5zbGljZSgpLnJldmVyc2UoKS5tYXAoaW52ZXJ0KS5mb3JFYWNoKChpbnZlcnNlKSA9PiB7XG4gICAgY2hhbmdlLmFwcGx5T3BlcmF0aW9uKGludmVyc2UsIHsgc2F2ZTogZmFsc2UgfSlcbiAgfSlcblxuICAvLyBVcGRhdGUgdGhlIGhpc3RvcnkuXG4gIHZhbHVlID0gY2hhbmdlLnZhbHVlXG4gIGhpc3RvcnkgPSBoaXN0b3J5LnNldCgndW5kb3MnLCB1bmRvcykuc2V0KCdyZWRvcycsIHJlZG9zKVxuICB2YWx1ZSA9IHZhbHVlLnNldCgnaGlzdG9yeScsIGhpc3RvcnkpXG4gIGNoYW5nZS52YWx1ZSA9IHZhbHVlXG59XG5cbi8qKlxuICogRXhwb3J0LlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgQ2hhbmdlc1xuIl19