'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Normalize the value with its schema.
 *
 * @param {Change} change
 */

Changes.normalize = function (change) {
  change.normalizeDocument();
};

/**
 * Normalize the document with the value's schema.
 *
 * @param {Change} change
 */

Changes.normalizeDocument = function (change) {
  var value = change.value;
  var document = value.document;

  change.normalizeNodeByKey(document.key);
};

/**
 * Normalize a `node` and its children with the value's schema.
 *
 * @param {Change} change
 * @param {Node|String} key
 */

Changes.normalizeNodeByKey = function (change, key) {
  var value = change.value;
  var document = value.document,
      schema = value.schema;

  var node = document.assertNode(key);

  normalizeNodeAndChildren(change, node, schema);

  document = change.value.document;
  var ancestors = document.getAncestors(key);
  if (!ancestors) return;

  ancestors.forEach(function (ancestor) {
    normalizeNode(change, ancestor, schema);
  });
};

/**
 * Normalize a `node` and its children with a `schema`.
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNodeAndChildren(change, node, schema) {
  if (node.kind == 'text') {
    normalizeNode(change, node, schema);
    return;
  }

  // We can't just loop the children and normalize them, because in the process
  // of normalizing one child, we might end up creating another. Instead, we
  // have to normalize one at a time, and check for new children along the way.
  // PERF: use a mutable array here instead of an immutable stack.
  var keys = node.nodes.toArray().map(function (n) {
    return n.key;
  });

  // While there is still a child key that hasn't been normalized yet...

  var _loop = function _loop() {
    var ops = change.operations.length;
    var key = void 0;

    // PERF: use a mutable set here since we'll be add to it a lot.
    var set = new _immutable.Set().asMutable();

    // Unwind the stack, normalizing every child and adding it to the set.
    while (key = keys[0]) {
      var child = node.getChild(key);
      normalizeNodeAndChildren(change, child, schema);
      set.add(key);
      keys.shift();
    }

    // Turn the set immutable to be able to compare against it.
    set = set.asImmutable();

    // PERF: Only re-find the node and re-normalize any new children if
    // operations occured that might have changed it.
    if (change.operations.length != ops) {
      node = refindNode(change, node);

      // Add any new children back onto the stack.
      node.nodes.forEach(function (n) {
        if (set.has(n.key)) return;
        keys.unshift(n.key);
      });
    }
  };

  while (keys.length) {
    _loop();
  }

  // Normalize the node itself if it still exists.
  if (node) {
    normalizeNode(change, node, schema);
  }
}

/**
 * Re-find a reference to a node that may have been modified or removed
 * entirely by a change.
 *
 * @param {Change} change
 * @param {Node} node
 * @return {Node}
 */

function refindNode(change, node) {
  var value = change.value;
  var document = value.document;

  return node.kind == 'document' ? document : document.getDescendant(node.key);
}

/**
 * Normalize a `node` with a `schema`, but not its children.
 *
 * @param {Change} change
 * @param {Node} node
 * @param {Schema} schema
 */

function normalizeNode(change, node, schema) {
  var max = schema.stack.plugins.length + 1;
  var iterations = 0;

  function iterate(c, n) {
    var normalize = n.validate(schema);
    if (!normalize) return;

    // Run the `normalize` function to fix the node.
    normalize(c);

    // Re-find the node reference, in case it was updated. If the node no longer
    // exists, we're done for this branch.
    n = refindNode(c, n);
    if (!n) return;

    // Increment the iterations counter, and check to make sure that we haven't
    // exceeded the max. Without this check, it's easy for the `validate` or
    // `normalize` function of a schema rule to be written incorrectly and for
    // an infinite invalid loop to occur.
    iterations++;

    if (iterations > max) {
      throw new Error('A schema rule could not be validated after sufficient iterations. This is usually due to a `rule.validate` or `rule.normalize` function of a schema being incorrectly written, causing an infinite loop.');
    }

    // Otherwise, iterate again.
    iterate(c, n);
  }

  iterate(change, node);
}

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL3dpdGgtc2NoZW1hLmpzIl0sIm5hbWVzIjpbIkNoYW5nZXMiLCJub3JtYWxpemUiLCJjaGFuZ2UiLCJub3JtYWxpemVEb2N1bWVudCIsInZhbHVlIiwiZG9jdW1lbnQiLCJub3JtYWxpemVOb2RlQnlLZXkiLCJrZXkiLCJzY2hlbWEiLCJub2RlIiwiYXNzZXJ0Tm9kZSIsIm5vcm1hbGl6ZU5vZGVBbmRDaGlsZHJlbiIsImFuY2VzdG9ycyIsImdldEFuY2VzdG9ycyIsImZvckVhY2giLCJhbmNlc3RvciIsIm5vcm1hbGl6ZU5vZGUiLCJraW5kIiwia2V5cyIsIm5vZGVzIiwidG9BcnJheSIsIm1hcCIsIm4iLCJvcHMiLCJvcGVyYXRpb25zIiwibGVuZ3RoIiwic2V0IiwiYXNNdXRhYmxlIiwiY2hpbGQiLCJnZXRDaGlsZCIsImFkZCIsInNoaWZ0IiwiYXNJbW11dGFibGUiLCJyZWZpbmROb2RlIiwiaGFzIiwidW5zaGlmdCIsImdldERlc2NlbmRhbnQiLCJtYXgiLCJzdGFjayIsInBsdWdpbnMiLCJpdGVyYXRpb25zIiwiaXRlcmF0ZSIsImMiLCJ2YWxpZGF0ZSIsIkVycm9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsVUFBVSxFQUFoQjs7QUFFQTs7Ozs7O0FBTUFBLFFBQVFDLFNBQVIsR0FBb0IsVUFBQ0MsTUFBRCxFQUFZO0FBQzlCQSxTQUFPQyxpQkFBUDtBQUNELENBRkQ7O0FBSUE7Ozs7OztBQU1BSCxRQUFRRyxpQkFBUixHQUE0QixVQUFDRCxNQUFELEVBQVk7QUFBQSxNQUM5QkUsS0FEOEIsR0FDcEJGLE1BRG9CLENBQzlCRSxLQUQ4QjtBQUFBLE1BRTlCQyxRQUY4QixHQUVqQkQsS0FGaUIsQ0FFOUJDLFFBRjhCOztBQUd0Q0gsU0FBT0ksa0JBQVAsQ0FBMEJELFNBQVNFLEdBQW5DO0FBQ0QsQ0FKRDs7QUFNQTs7Ozs7OztBQU9BUCxRQUFRTSxrQkFBUixHQUE2QixVQUFDSixNQUFELEVBQVNLLEdBQVQsRUFBaUI7QUFBQSxNQUNwQ0gsS0FEb0MsR0FDMUJGLE1BRDBCLENBQ3BDRSxLQURvQztBQUFBLE1BRXRDQyxRQUZzQyxHQUVqQkQsS0FGaUIsQ0FFdENDLFFBRnNDO0FBQUEsTUFFNUJHLE1BRjRCLEdBRWpCSixLQUZpQixDQUU1QkksTUFGNEI7O0FBRzVDLE1BQU1DLE9BQU9KLFNBQVNLLFVBQVQsQ0FBb0JILEdBQXBCLENBQWI7O0FBRUFJLDJCQUF5QlQsTUFBekIsRUFBaUNPLElBQWpDLEVBQXVDRCxNQUF2Qzs7QUFFQUgsYUFBV0gsT0FBT0UsS0FBUCxDQUFhQyxRQUF4QjtBQUNBLE1BQU1PLFlBQVlQLFNBQVNRLFlBQVQsQ0FBc0JOLEdBQXRCLENBQWxCO0FBQ0EsTUFBSSxDQUFDSyxTQUFMLEVBQWdCOztBQUVoQkEsWUFBVUUsT0FBVixDQUFrQixVQUFDQyxRQUFELEVBQWM7QUFDOUJDLGtCQUFjZCxNQUFkLEVBQXNCYSxRQUF0QixFQUFnQ1AsTUFBaEM7QUFDRCxHQUZEO0FBR0QsQ0FkRDs7QUFnQkE7Ozs7Ozs7O0FBUUEsU0FBU0csd0JBQVQsQ0FBa0NULE1BQWxDLEVBQTBDTyxJQUExQyxFQUFnREQsTUFBaEQsRUFBd0Q7QUFDdEQsTUFBSUMsS0FBS1EsSUFBTCxJQUFhLE1BQWpCLEVBQXlCO0FBQ3ZCRCxrQkFBY2QsTUFBZCxFQUFzQk8sSUFBdEIsRUFBNEJELE1BQTVCO0FBQ0E7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU1VLE9BQU9ULEtBQUtVLEtBQUwsQ0FBV0MsT0FBWCxHQUFxQkMsR0FBckIsQ0FBeUI7QUFBQSxXQUFLQyxFQUFFZixHQUFQO0FBQUEsR0FBekIsQ0FBYjs7QUFFQTs7QUFac0Q7QUFjcEQsUUFBTWdCLE1BQU1yQixPQUFPc0IsVUFBUCxDQUFrQkMsTUFBOUI7QUFDQSxRQUFJbEIsWUFBSjs7QUFFQTtBQUNBLFFBQUltQixNQUFNLHFCQUFVQyxTQUFWLEVBQVY7O0FBRUE7QUFDQSxXQUFPcEIsTUFBTVcsS0FBSyxDQUFMLENBQWIsRUFBc0I7QUFDcEIsVUFBTVUsUUFBUW5CLEtBQUtvQixRQUFMLENBQWN0QixHQUFkLENBQWQ7QUFDQUksK0JBQXlCVCxNQUF6QixFQUFpQzBCLEtBQWpDLEVBQXdDcEIsTUFBeEM7QUFDQWtCLFVBQUlJLEdBQUosQ0FBUXZCLEdBQVI7QUFDQVcsV0FBS2EsS0FBTDtBQUNEOztBQUVEO0FBQ0FMLFVBQU1BLElBQUlNLFdBQUosRUFBTjs7QUFFQTtBQUNBO0FBQ0EsUUFBSTlCLE9BQU9zQixVQUFQLENBQWtCQyxNQUFsQixJQUE0QkYsR0FBaEMsRUFBcUM7QUFDbkNkLGFBQU93QixXQUFXL0IsTUFBWCxFQUFtQk8sSUFBbkIsQ0FBUDs7QUFFQTtBQUNBQSxXQUFLVSxLQUFMLENBQVdMLE9BQVgsQ0FBbUIsVUFBQ1EsQ0FBRCxFQUFPO0FBQ3hCLFlBQUlJLElBQUlRLEdBQUosQ0FBUVosRUFBRWYsR0FBVixDQUFKLEVBQW9CO0FBQ3BCVyxhQUFLaUIsT0FBTCxDQUFhYixFQUFFZixHQUFmO0FBQ0QsT0FIRDtBQUlEO0FBekNtRDs7QUFhdEQsU0FBT1csS0FBS08sTUFBWixFQUFvQjtBQUFBO0FBNkJuQjs7QUFFRDtBQUNBLE1BQUloQixJQUFKLEVBQVU7QUFDUk8sa0JBQWNkLE1BQWQsRUFBc0JPLElBQXRCLEVBQTRCRCxNQUE1QjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7OztBQVNBLFNBQVN5QixVQUFULENBQW9CL0IsTUFBcEIsRUFBNEJPLElBQTVCLEVBQWtDO0FBQUEsTUFDeEJMLEtBRHdCLEdBQ2RGLE1BRGMsQ0FDeEJFLEtBRHdCO0FBQUEsTUFFeEJDLFFBRndCLEdBRVhELEtBRlcsQ0FFeEJDLFFBRndCOztBQUdoQyxTQUFPSSxLQUFLUSxJQUFMLElBQWEsVUFBYixHQUNIWixRQURHLEdBRUhBLFNBQVMrQixhQUFULENBQXVCM0IsS0FBS0YsR0FBNUIsQ0FGSjtBQUdEOztBQUVEOzs7Ozs7OztBQVFBLFNBQVNTLGFBQVQsQ0FBdUJkLE1BQXZCLEVBQStCTyxJQUEvQixFQUFxQ0QsTUFBckMsRUFBNkM7QUFDM0MsTUFBTTZCLE1BQU03QixPQUFPOEIsS0FBUCxDQUFhQyxPQUFiLENBQXFCZCxNQUFyQixHQUE4QixDQUExQztBQUNBLE1BQUllLGFBQWEsQ0FBakI7O0FBRUEsV0FBU0MsT0FBVCxDQUFpQkMsQ0FBakIsRUFBb0JwQixDQUFwQixFQUF1QjtBQUNyQixRQUFNckIsWUFBWXFCLEVBQUVxQixRQUFGLENBQVduQyxNQUFYLENBQWxCO0FBQ0EsUUFBSSxDQUFDUCxTQUFMLEVBQWdCOztBQUVoQjtBQUNBQSxjQUFVeUMsQ0FBVjs7QUFFQTtBQUNBO0FBQ0FwQixRQUFJVyxXQUFXUyxDQUFYLEVBQWNwQixDQUFkLENBQUo7QUFDQSxRQUFJLENBQUNBLENBQUwsRUFBUTs7QUFFUjtBQUNBO0FBQ0E7QUFDQTtBQUNBa0I7O0FBRUEsUUFBSUEsYUFBYUgsR0FBakIsRUFBc0I7QUFDcEIsWUFBTSxJQUFJTyxLQUFKLENBQVUsME1BQVYsQ0FBTjtBQUNEOztBQUVEO0FBQ0FILFlBQVFDLENBQVIsRUFBV3BCLENBQVg7QUFDRDs7QUFFRG1CLFVBQVF2QyxNQUFSLEVBQWdCTyxJQUFoQjtBQUNEOztBQUVEOzs7Ozs7a0JBTWVULE8iLCJmaWxlIjoid2l0aC1zY2hlbWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCB7IFNldCB9IGZyb20gJ2ltbXV0YWJsZSdcblxuLyoqXG4gKiBDaGFuZ2VzLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgQ2hhbmdlcyA9IHt9XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSB2YWx1ZSB3aXRoIGl0cyBzY2hlbWEuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICovXG5cbkNoYW5nZXMubm9ybWFsaXplID0gKGNoYW5nZSkgPT4ge1xuICBjaGFuZ2Uubm9ybWFsaXplRG9jdW1lbnQoKVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgZG9jdW1lbnQgd2l0aCB0aGUgdmFsdWUncyBzY2hlbWEuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICovXG5cbkNoYW5nZXMubm9ybWFsaXplRG9jdW1lbnQgPSAoY2hhbmdlKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICBjaGFuZ2Uubm9ybWFsaXplTm9kZUJ5S2V5KGRvY3VtZW50LmtleSlcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSBgbm9kZWAgYW5kIGl0cyBjaGlsZHJlbiB3aXRoIHRoZSB2YWx1ZSdzIHNjaGVtYS5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge05vZGV8U3RyaW5nfSBrZXlcbiAqL1xuXG5DaGFuZ2VzLm5vcm1hbGl6ZU5vZGVCeUtleSA9IChjaGFuZ2UsIGtleSkgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgbGV0IHsgZG9jdW1lbnQsIHNjaGVtYSB9ID0gdmFsdWVcbiAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmFzc2VydE5vZGUoa2V5KVxuXG4gIG5vcm1hbGl6ZU5vZGVBbmRDaGlsZHJlbihjaGFuZ2UsIG5vZGUsIHNjaGVtYSlcblxuICBkb2N1bWVudCA9IGNoYW5nZS52YWx1ZS5kb2N1bWVudFxuICBjb25zdCBhbmNlc3RvcnMgPSBkb2N1bWVudC5nZXRBbmNlc3RvcnMoa2V5KVxuICBpZiAoIWFuY2VzdG9ycykgcmV0dXJuXG5cbiAgYW5jZXN0b3JzLmZvckVhY2goKGFuY2VzdG9yKSA9PiB7XG4gICAgbm9ybWFsaXplTm9kZShjaGFuZ2UsIGFuY2VzdG9yLCBzY2hlbWEpXG4gIH0pXG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgYG5vZGVgIGFuZCBpdHMgY2hpbGRyZW4gd2l0aCBhIGBzY2hlbWFgLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtTY2hlbWF9IHNjaGVtYVxuICovXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU5vZGVBbmRDaGlsZHJlbihjaGFuZ2UsIG5vZGUsIHNjaGVtYSkge1xuICBpZiAobm9kZS5raW5kID09ICd0ZXh0Jykge1xuICAgIG5vcm1hbGl6ZU5vZGUoY2hhbmdlLCBub2RlLCBzY2hlbWEpXG4gICAgcmV0dXJuXG4gIH1cblxuICAvLyBXZSBjYW4ndCBqdXN0IGxvb3AgdGhlIGNoaWxkcmVuIGFuZCBub3JtYWxpemUgdGhlbSwgYmVjYXVzZSBpbiB0aGUgcHJvY2Vzc1xuICAvLyBvZiBub3JtYWxpemluZyBvbmUgY2hpbGQsIHdlIG1pZ2h0IGVuZCB1cCBjcmVhdGluZyBhbm90aGVyLiBJbnN0ZWFkLCB3ZVxuICAvLyBoYXZlIHRvIG5vcm1hbGl6ZSBvbmUgYXQgYSB0aW1lLCBhbmQgY2hlY2sgZm9yIG5ldyBjaGlsZHJlbiBhbG9uZyB0aGUgd2F5LlxuICAvLyBQRVJGOiB1c2UgYSBtdXRhYmxlIGFycmF5IGhlcmUgaW5zdGVhZCBvZiBhbiBpbW11dGFibGUgc3RhY2suXG4gIGNvbnN0IGtleXMgPSBub2RlLm5vZGVzLnRvQXJyYXkoKS5tYXAobiA9PiBuLmtleSlcblxuICAvLyBXaGlsZSB0aGVyZSBpcyBzdGlsbCBhIGNoaWxkIGtleSB0aGF0IGhhc24ndCBiZWVuIG5vcm1hbGl6ZWQgeWV0Li4uXG4gIHdoaWxlIChrZXlzLmxlbmd0aCkge1xuICAgIGNvbnN0IG9wcyA9IGNoYW5nZS5vcGVyYXRpb25zLmxlbmd0aFxuICAgIGxldCBrZXlcblxuICAgIC8vIFBFUkY6IHVzZSBhIG11dGFibGUgc2V0IGhlcmUgc2luY2Ugd2UnbGwgYmUgYWRkIHRvIGl0IGEgbG90LlxuICAgIGxldCBzZXQgPSBuZXcgU2V0KCkuYXNNdXRhYmxlKClcblxuICAgIC8vIFVud2luZCB0aGUgc3RhY2ssIG5vcm1hbGl6aW5nIGV2ZXJ5IGNoaWxkIGFuZCBhZGRpbmcgaXQgdG8gdGhlIHNldC5cbiAgICB3aGlsZSAoa2V5ID0ga2V5c1swXSkge1xuICAgICAgY29uc3QgY2hpbGQgPSBub2RlLmdldENoaWxkKGtleSlcbiAgICAgIG5vcm1hbGl6ZU5vZGVBbmRDaGlsZHJlbihjaGFuZ2UsIGNoaWxkLCBzY2hlbWEpXG4gICAgICBzZXQuYWRkKGtleSlcbiAgICAgIGtleXMuc2hpZnQoKVxuICAgIH1cblxuICAgIC8vIFR1cm4gdGhlIHNldCBpbW11dGFibGUgdG8gYmUgYWJsZSB0byBjb21wYXJlIGFnYWluc3QgaXQuXG4gICAgc2V0ID0gc2V0LmFzSW1tdXRhYmxlKClcblxuICAgIC8vIFBFUkY6IE9ubHkgcmUtZmluZCB0aGUgbm9kZSBhbmQgcmUtbm9ybWFsaXplIGFueSBuZXcgY2hpbGRyZW4gaWZcbiAgICAvLyBvcGVyYXRpb25zIG9jY3VyZWQgdGhhdCBtaWdodCBoYXZlIGNoYW5nZWQgaXQuXG4gICAgaWYgKGNoYW5nZS5vcGVyYXRpb25zLmxlbmd0aCAhPSBvcHMpIHtcbiAgICAgIG5vZGUgPSByZWZpbmROb2RlKGNoYW5nZSwgbm9kZSlcblxuICAgICAgLy8gQWRkIGFueSBuZXcgY2hpbGRyZW4gYmFjayBvbnRvIHRoZSBzdGFjay5cbiAgICAgIG5vZGUubm9kZXMuZm9yRWFjaCgobikgPT4ge1xuICAgICAgICBpZiAoc2V0LmhhcyhuLmtleSkpIHJldHVyblxuICAgICAgICBrZXlzLnVuc2hpZnQobi5rZXkpXG4gICAgICB9KVxuICAgIH1cbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB0aGUgbm9kZSBpdHNlbGYgaWYgaXQgc3RpbGwgZXhpc3RzLlxuICBpZiAobm9kZSkge1xuICAgIG5vcm1hbGl6ZU5vZGUoY2hhbmdlLCBub2RlLCBzY2hlbWEpXG4gIH1cbn1cblxuLyoqXG4gKiBSZS1maW5kIGEgcmVmZXJlbmNlIHRvIGEgbm9kZSB0aGF0IG1heSBoYXZlIGJlZW4gbW9kaWZpZWQgb3IgcmVtb3ZlZFxuICogZW50aXJlbHkgYnkgYSBjaGFuZ2UuXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcmV0dXJuIHtOb2RlfVxuICovXG5cbmZ1bmN0aW9uIHJlZmluZE5vZGUoY2hhbmdlLCBub2RlKSB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50IH0gPSB2YWx1ZVxuICByZXR1cm4gbm9kZS5raW5kID09ICdkb2N1bWVudCdcbiAgICA/IGRvY3VtZW50XG4gICAgOiBkb2N1bWVudC5nZXREZXNjZW5kYW50KG5vZGUua2V5KVxufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIGBub2RlYCB3aXRoIGEgYHNjaGVtYWAsIGJ1dCBub3QgaXRzIGNoaWxkcmVuLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtTY2hlbWF9IHNjaGVtYVxuICovXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZU5vZGUoY2hhbmdlLCBub2RlLCBzY2hlbWEpIHtcbiAgY29uc3QgbWF4ID0gc2NoZW1hLnN0YWNrLnBsdWdpbnMubGVuZ3RoICsgMVxuICBsZXQgaXRlcmF0aW9ucyA9IDBcblxuICBmdW5jdGlvbiBpdGVyYXRlKGMsIG4pIHtcbiAgICBjb25zdCBub3JtYWxpemUgPSBuLnZhbGlkYXRlKHNjaGVtYSlcbiAgICBpZiAoIW5vcm1hbGl6ZSkgcmV0dXJuXG5cbiAgICAvLyBSdW4gdGhlIGBub3JtYWxpemVgIGZ1bmN0aW9uIHRvIGZpeCB0aGUgbm9kZS5cbiAgICBub3JtYWxpemUoYylcblxuICAgIC8vIFJlLWZpbmQgdGhlIG5vZGUgcmVmZXJlbmNlLCBpbiBjYXNlIGl0IHdhcyB1cGRhdGVkLiBJZiB0aGUgbm9kZSBubyBsb25nZXJcbiAgICAvLyBleGlzdHMsIHdlJ3JlIGRvbmUgZm9yIHRoaXMgYnJhbmNoLlxuICAgIG4gPSByZWZpbmROb2RlKGMsIG4pXG4gICAgaWYgKCFuKSByZXR1cm5cblxuICAgIC8vIEluY3JlbWVudCB0aGUgaXRlcmF0aW9ucyBjb3VudGVyLCBhbmQgY2hlY2sgdG8gbWFrZSBzdXJlIHRoYXQgd2UgaGF2ZW4ndFxuICAgIC8vIGV4Y2VlZGVkIHRoZSBtYXguIFdpdGhvdXQgdGhpcyBjaGVjaywgaXQncyBlYXN5IGZvciB0aGUgYHZhbGlkYXRlYCBvclxuICAgIC8vIGBub3JtYWxpemVgIGZ1bmN0aW9uIG9mIGEgc2NoZW1hIHJ1bGUgdG8gYmUgd3JpdHRlbiBpbmNvcnJlY3RseSBhbmQgZm9yXG4gICAgLy8gYW4gaW5maW5pdGUgaW52YWxpZCBsb29wIHRvIG9jY3VyLlxuICAgIGl0ZXJhdGlvbnMrK1xuXG4gICAgaWYgKGl0ZXJhdGlvbnMgPiBtYXgpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQSBzY2hlbWEgcnVsZSBjb3VsZCBub3QgYmUgdmFsaWRhdGVkIGFmdGVyIHN1ZmZpY2llbnQgaXRlcmF0aW9ucy4gVGhpcyBpcyB1c3VhbGx5IGR1ZSB0byBhIGBydWxlLnZhbGlkYXRlYCBvciBgcnVsZS5ub3JtYWxpemVgIGZ1bmN0aW9uIG9mIGEgc2NoZW1hIGJlaW5nIGluY29ycmVjdGx5IHdyaXR0ZW4sIGNhdXNpbmcgYW4gaW5maW5pdGUgbG9vcC4nKVxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgaXRlcmF0ZSBhZ2Fpbi5cbiAgICBpdGVyYXRlKGMsIG4pXG4gIH1cblxuICBpdGVyYXRlKGNoYW5nZSwgbm9kZSlcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBDaGFuZ2VzXG4iXX0=