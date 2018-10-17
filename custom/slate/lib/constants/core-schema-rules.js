'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _immutable = require('immutable');

var _text = require('../models/text');

var _text2 = _interopRequireDefault(_text);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Define the core schema rules, order-sensitive.
 *
 * @type {Array}
 */

var CORE_SCHEMA_RULES = [

/**
 * Only allow block nodes in documents.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.kind != 'document') return;
    var invalids = node.nodes.filter(function (n) {
      return n.kind != 'block';
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Only allow block nodes or inline and text nodes in blocks.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.kind != 'block') return;
    var first = node.nodes.first();
    if (!first) return;
    var kinds = first.kind == 'block' ? ['block'] : ['inline', 'text'];
    var invalids = node.nodes.filter(function (n) {
      return !kinds.includes(n.kind);
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Only allow inline and text nodes in inlines.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.kind != 'inline') return;
    var invalids = node.nodes.filter(function (n) {
      return n.kind != 'inline' && n.kind != 'text';
    });
    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Ensure that block and inline nodes have at least one text child.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.kind != 'block' && node.kind != 'inline') return;
    if (node.nodes.size > 0) return;

    return function (change) {
      var text = _text2.default.create();
      change.insertNodeByKey(node.key, 0, text, { normalize: false });
    };
  }
},

/**
 * Ensure that void nodes contain a text node with a single space of text.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (!node.isVoid) return;
    if (node.kind != 'block' && node.kind != 'inline') return;
    if (node.text == ' ' && node.nodes.size == 1) return;

    return function (change) {
      var text = _text2.default.create(' ');
      var index = node.nodes.size;

      change.insertNodeByKey(node.key, index, text, { normalize: false });

      node.nodes.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Ensure that inline nodes are never empty.
 *
 * This rule is applied to all blocks, because when they contain an empty
 * inline, we need to remove the inline from that parent block. If `validate`
 * was to be memoized, it should be against the parent node, not the inline
 * themselves.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.kind != 'block') return;
    var invalids = node.nodes.filter(function (n) {
      return n.kind == 'inline' && n.text == '';
    });
    if (!invalids.size) return;

    return function (change) {
      // If all of the block's nodes are invalid, insert an empty text node so
      // that the selection will be preserved when they are all removed.
      if (node.nodes.size == invalids.size) {
        var text = _text2.default.create();
        change.insertNodeByKey(node.key, 1, text, { normalize: false });
      }

      invalids.forEach(function (child) {
        change.removeNodeByKey(child.key, { normalize: false });
      });
    };
  }
},

/**
 * Ensure that inline void nodes are surrounded by text nodes, by adding extra
 * blank text nodes if necessary.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.kind != 'block' && node.kind != 'inline') return;

    var invalids = node.nodes.reduce(function (list, child, index) {
      if (child.kind !== 'inline') return list;

      var prev = index > 0 ? node.nodes.get(index - 1) : null;
      var next = node.nodes.get(index + 1);
      // We don't test if "prev" is inline, since it has already been processed in the loop
      var insertBefore = !prev;
      var insertAfter = !next || next.kind == 'inline';

      if (insertAfter || insertBefore) {
        list = list.push({ insertAfter: insertAfter, insertBefore: insertBefore, index: index });
      }

      return list;
    }, new _immutable.List());

    if (!invalids.size) return;

    return function (change) {
      // Shift for every text node inserted previously.
      var shift = 0;

      invalids.forEach(function (_ref) {
        var index = _ref.index,
            insertAfter = _ref.insertAfter,
            insertBefore = _ref.insertBefore;

        if (insertBefore) {
          change.insertNodeByKey(node.key, shift + index, _text2.default.create(), { normalize: false });
          shift++;
        }

        if (insertAfter) {
          change.insertNodeByKey(node.key, shift + index + 1, _text2.default.create(), { normalize: false });
          shift++;
        }
      });
    };
  }
},

/**
 * Merge adjacent text nodes.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.kind != 'block' && node.kind != 'inline') return;

    var invalids = node.nodes.map(function (child, i) {
      var next = node.nodes.get(i + 1);
      if (child.kind != 'text') return;
      if (!next || next.kind != 'text') return;
      return next;
    }).filter(Boolean);

    if (!invalids.size) return;

    return function (change) {
      // Reverse the list to handle consecutive merges, since the earlier nodes
      // will always exist after each merge.
      invalids.reverse().forEach(function (n) {
        change.mergeNodeByKey(n.key, { normalize: false });
      });
    };
  }
},

/**
 * Prevent extra empty text nodes, except when adjacent to inline void nodes.
 *
 * @type {Object}
 */

{
  validateNode: function validateNode(node) {
    if (node.kind != 'block' && node.kind != 'inline') return;
    var nodes = node.nodes;

    if (nodes.size <= 1) return;

    var invalids = nodes.filter(function (desc, i) {
      if (desc.kind != 'text') return;
      if (desc.text.length > 0) return;

      var prev = i > 0 ? nodes.get(i - 1) : null;
      var next = nodes.get(i + 1);

      // If it's the first node, and the next is a void, preserve it.
      if (!prev && next.kind == 'inline') return;

      // It it's the last node, and the previous is an inline, preserve it.
      if (!next && prev.kind == 'inline') return;

      // If it's surrounded by inlines, preserve it.
      if (next && prev && next.kind == 'inline' && prev.kind == 'inline') return;

      // Otherwise, remove it.
      return true;
    });

    if (!invalids.size) return;

    return function (change) {
      invalids.forEach(function (text) {
        change.removeNodeByKey(text.key, { normalize: false });
      });
    };
  }
}];

/**
 * Export.
 *
 * @type {Array}
 */

exports.default = CORE_SCHEMA_RULES;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25zdGFudHMvY29yZS1zY2hlbWEtcnVsZXMuanMiXSwibmFtZXMiOlsiQ09SRV9TQ0hFTUFfUlVMRVMiLCJ2YWxpZGF0ZU5vZGUiLCJub2RlIiwia2luZCIsImludmFsaWRzIiwibm9kZXMiLCJmaWx0ZXIiLCJuIiwic2l6ZSIsImNoYW5nZSIsImZvckVhY2giLCJjaGlsZCIsInJlbW92ZU5vZGVCeUtleSIsImtleSIsIm5vcm1hbGl6ZSIsImZpcnN0Iiwia2luZHMiLCJpbmNsdWRlcyIsInRleHQiLCJjcmVhdGUiLCJpbnNlcnROb2RlQnlLZXkiLCJpc1ZvaWQiLCJpbmRleCIsInJlZHVjZSIsImxpc3QiLCJwcmV2IiwiZ2V0IiwibmV4dCIsImluc2VydEJlZm9yZSIsImluc2VydEFmdGVyIiwicHVzaCIsInNoaWZ0IiwibWFwIiwiaSIsIkJvb2xlYW4iLCJyZXZlcnNlIiwibWVyZ2VOb2RlQnlLZXkiLCJkZXNjIiwibGVuZ3RoIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFDQTs7QUFFQTs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLG9CQUFvQjs7QUFFeEI7Ozs7OztBQU1BO0FBQ0VDLGNBREYsd0JBQ2VDLElBRGYsRUFDcUI7QUFDakIsUUFBSUEsS0FBS0MsSUFBTCxJQUFhLFVBQWpCLEVBQTZCO0FBQzdCLFFBQU1DLFdBQVdGLEtBQUtHLEtBQUwsQ0FBV0MsTUFBWCxDQUFrQjtBQUFBLGFBQUtDLEVBQUVKLElBQUYsSUFBVSxPQUFmO0FBQUEsS0FBbEIsQ0FBakI7QUFDQSxRQUFJLENBQUNDLFNBQVNJLElBQWQsRUFBb0I7O0FBRXBCLFdBQU8sVUFBQ0MsTUFBRCxFQUFZO0FBQ2pCTCxlQUFTTSxPQUFULENBQWlCLFVBQUNDLEtBQUQsRUFBVztBQUMxQkYsZUFBT0csZUFBUCxDQUF1QkQsTUFBTUUsR0FBN0IsRUFBa0MsRUFBRUMsV0FBVyxLQUFiLEVBQWxDO0FBQ0QsT0FGRDtBQUdELEtBSkQ7QUFLRDtBQVhILENBUndCOztBQXNC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Iiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgeyBMaXN0IH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgVGV4dCBmcm9tICcuLi9tb2RlbHMvdGV4dCdcblxuLyoqXG4gKiBEZWZpbmUgdGhlIGNvcmUgc2NoZW1hIHJ1bGVzLCBvcmRlci1zZW5zaXRpdmUuXG4gKlxuICogQHR5cGUge0FycmF5fVxuICovXG5cbmNvbnN0IENPUkVfU0NIRU1BX1JVTEVTID0gW1xuXG4gIC8qKlxuICAgKiBPbmx5IGFsbG93IGJsb2NrIG5vZGVzIGluIGRvY3VtZW50cy5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAge1xuICAgIHZhbGlkYXRlTm9kZShub2RlKSB7XG4gICAgICBpZiAobm9kZS5raW5kICE9ICdkb2N1bWVudCcpIHJldHVyblxuICAgICAgY29uc3QgaW52YWxpZHMgPSBub2RlLm5vZGVzLmZpbHRlcihuID0+IG4ua2luZCAhPSAnYmxvY2snKVxuICAgICAgaWYgKCFpbnZhbGlkcy5zaXplKSByZXR1cm5cblxuICAgICAgcmV0dXJuIChjaGFuZ2UpID0+IHtcbiAgICAgICAgaW52YWxpZHMuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBPbmx5IGFsbG93IGJsb2NrIG5vZGVzIG9yIGlubGluZSBhbmQgdGV4dCBub2RlcyBpbiBibG9ja3MuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHtcbiAgICB2YWxpZGF0ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUua2luZCAhPSAnYmxvY2snKSByZXR1cm5cbiAgICAgIGNvbnN0IGZpcnN0ID0gbm9kZS5ub2Rlcy5maXJzdCgpXG4gICAgICBpZiAoIWZpcnN0KSByZXR1cm5cbiAgICAgIGNvbnN0IGtpbmRzID0gZmlyc3Qua2luZCA9PSAnYmxvY2snID8gWydibG9jayddIDogWydpbmxpbmUnLCAndGV4dCddXG4gICAgICBjb25zdCBpbnZhbGlkcyA9IG5vZGUubm9kZXMuZmlsdGVyKG4gPT4gIWtpbmRzLmluY2x1ZGVzKG4ua2luZCkpXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICBpbnZhbGlkcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIE9ubHkgYWxsb3cgaW5saW5lIGFuZCB0ZXh0IG5vZGVzIGluIGlubGluZXMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHtcbiAgICB2YWxpZGF0ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUua2luZCAhPSAnaW5saW5lJykgcmV0dXJuXG4gICAgICBjb25zdCBpbnZhbGlkcyA9IG5vZGUubm9kZXMuZmlsdGVyKG4gPT4gbi5raW5kICE9ICdpbmxpbmUnICYmIG4ua2luZCAhPSAndGV4dCcpXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICBpbnZhbGlkcy5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgICAgIGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoY2hpbGQua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEVuc3VyZSB0aGF0IGJsb2NrIGFuZCBpbmxpbmUgbm9kZXMgaGF2ZSBhdCBsZWFzdCBvbmUgdGV4dCBjaGlsZC5cbiAgICpcbiAgICogQHR5cGUge09iamVjdH1cbiAgICovXG5cbiAge1xuICAgIHZhbGlkYXRlTm9kZShub2RlKSB7XG4gICAgICBpZiAobm9kZS5raW5kICE9ICdibG9jaycgJiYgbm9kZS5raW5kICE9ICdpbmxpbmUnKSByZXR1cm5cbiAgICAgIGlmIChub2RlLm5vZGVzLnNpemUgPiAwKSByZXR1cm5cblxuICAgICAgcmV0dXJuIChjaGFuZ2UpID0+IHtcbiAgICAgICAgY29uc3QgdGV4dCA9IFRleHQuY3JlYXRlKClcbiAgICAgICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShub2RlLmtleSwgMCwgdGV4dCwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBFbnN1cmUgdGhhdCB2b2lkIG5vZGVzIGNvbnRhaW4gYSB0ZXh0IG5vZGUgd2l0aCBhIHNpbmdsZSBzcGFjZSBvZiB0ZXh0LlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB7XG4gICAgdmFsaWRhdGVOb2RlKG5vZGUpIHtcbiAgICAgIGlmICghbm9kZS5pc1ZvaWQpIHJldHVyblxuICAgICAgaWYgKG5vZGUua2luZCAhPSAnYmxvY2snICYmIG5vZGUua2luZCAhPSAnaW5saW5lJykgcmV0dXJuXG4gICAgICBpZiAobm9kZS50ZXh0ID09ICcgJyAmJiBub2RlLm5vZGVzLnNpemUgPT0gMSkgcmV0dXJuXG5cbiAgICAgIHJldHVybiAoY2hhbmdlKSA9PiB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBUZXh0LmNyZWF0ZSgnICcpXG4gICAgICAgIGNvbnN0IGluZGV4ID0gbm9kZS5ub2Rlcy5zaXplXG5cbiAgICAgICAgY2hhbmdlLmluc2VydE5vZGVCeUtleShub2RlLmtleSwgaW5kZXgsIHRleHQsIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuXG4gICAgICAgIG5vZGUubm9kZXMuZm9yRWFjaCgoY2hpbGQpID0+IHtcbiAgICAgICAgICBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBFbnN1cmUgdGhhdCBpbmxpbmUgbm9kZXMgYXJlIG5ldmVyIGVtcHR5LlxuICAgKlxuICAgKiBUaGlzIHJ1bGUgaXMgYXBwbGllZCB0byBhbGwgYmxvY2tzLCBiZWNhdXNlIHdoZW4gdGhleSBjb250YWluIGFuIGVtcHR5XG4gICAqIGlubGluZSwgd2UgbmVlZCB0byByZW1vdmUgdGhlIGlubGluZSBmcm9tIHRoYXQgcGFyZW50IGJsb2NrLiBJZiBgdmFsaWRhdGVgXG4gICAqIHdhcyB0byBiZSBtZW1vaXplZCwgaXQgc2hvdWxkIGJlIGFnYWluc3QgdGhlIHBhcmVudCBub2RlLCBub3QgdGhlIGlubGluZVxuICAgKiB0aGVtc2VsdmVzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB7XG4gICAgdmFsaWRhdGVOb2RlKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLmtpbmQgIT0gJ2Jsb2NrJykgcmV0dXJuXG4gICAgICBjb25zdCBpbnZhbGlkcyA9IG5vZGUubm9kZXMuZmlsdGVyKG4gPT4gbi5raW5kID09ICdpbmxpbmUnICYmIG4udGV4dCA9PSAnJylcbiAgICAgIGlmICghaW52YWxpZHMuc2l6ZSkgcmV0dXJuXG5cbiAgICAgIHJldHVybiAoY2hhbmdlKSA9PiB7XG4gICAgICAgIC8vIElmIGFsbCBvZiB0aGUgYmxvY2sncyBub2RlcyBhcmUgaW52YWxpZCwgaW5zZXJ0IGFuIGVtcHR5IHRleHQgbm9kZSBzb1xuICAgICAgICAvLyB0aGF0IHRoZSBzZWxlY3Rpb24gd2lsbCBiZSBwcmVzZXJ2ZWQgd2hlbiB0aGV5IGFyZSBhbGwgcmVtb3ZlZC5cbiAgICAgICAgaWYgKG5vZGUubm9kZXMuc2l6ZSA9PSBpbnZhbGlkcy5zaXplKSB7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IFRleHQuY3JlYXRlKClcbiAgICAgICAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KG5vZGUua2V5LCAxLCB0ZXh0LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfVxuXG4gICAgICAgIGludmFsaWRzLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleShjaGlsZC5rZXksIHsgbm9ybWFsaXplOiBmYWxzZSB9KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogRW5zdXJlIHRoYXQgaW5saW5lIHZvaWQgbm9kZXMgYXJlIHN1cnJvdW5kZWQgYnkgdGV4dCBub2RlcywgYnkgYWRkaW5nIGV4dHJhXG4gICAqIGJsYW5rIHRleHQgbm9kZXMgaWYgbmVjZXNzYXJ5LlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB7XG4gICAgdmFsaWRhdGVOb2RlKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLmtpbmQgIT0gJ2Jsb2NrJyAmJiBub2RlLmtpbmQgIT0gJ2lubGluZScpIHJldHVyblxuXG4gICAgICBjb25zdCBpbnZhbGlkcyA9IG5vZGUubm9kZXMucmVkdWNlKChsaXN0LCBjaGlsZCwgaW5kZXgpID0+IHtcbiAgICAgICAgaWYgKGNoaWxkLmtpbmQgIT09ICdpbmxpbmUnKSByZXR1cm4gbGlzdFxuXG4gICAgICAgIGNvbnN0IHByZXYgPSBpbmRleCA+IDAgPyBub2RlLm5vZGVzLmdldChpbmRleCAtIDEpIDogbnVsbFxuICAgICAgICBjb25zdCBuZXh0ID0gbm9kZS5ub2Rlcy5nZXQoaW5kZXggKyAxKVxuICAgICAgICAvLyBXZSBkb24ndCB0ZXN0IGlmIFwicHJldlwiIGlzIGlubGluZSwgc2luY2UgaXQgaGFzIGFscmVhZHkgYmVlbiBwcm9jZXNzZWQgaW4gdGhlIGxvb3BcbiAgICAgICAgY29uc3QgaW5zZXJ0QmVmb3JlID0gIXByZXZcbiAgICAgICAgY29uc3QgaW5zZXJ0QWZ0ZXIgPSAhbmV4dCB8fCAobmV4dC5raW5kID09ICdpbmxpbmUnKVxuXG4gICAgICAgIGlmIChpbnNlcnRBZnRlciB8fCBpbnNlcnRCZWZvcmUpIHtcbiAgICAgICAgICBsaXN0ID0gbGlzdC5wdXNoKHsgaW5zZXJ0QWZ0ZXIsIGluc2VydEJlZm9yZSwgaW5kZXggfSlcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBsaXN0XG4gICAgICB9LCBuZXcgTGlzdCgpKVxuXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICAvLyBTaGlmdCBmb3IgZXZlcnkgdGV4dCBub2RlIGluc2VydGVkIHByZXZpb3VzbHkuXG4gICAgICAgIGxldCBzaGlmdCA9IDBcblxuICAgICAgICBpbnZhbGlkcy5mb3JFYWNoKCh7IGluZGV4LCBpbnNlcnRBZnRlciwgaW5zZXJ0QmVmb3JlIH0pID0+IHtcbiAgICAgICAgICBpZiAoaW5zZXJ0QmVmb3JlKSB7XG4gICAgICAgICAgICBjaGFuZ2UuaW5zZXJ0Tm9kZUJ5S2V5KG5vZGUua2V5LCBzaGlmdCArIGluZGV4LCBUZXh0LmNyZWF0ZSgpLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgICAgIHNoaWZ0KytcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoaW5zZXJ0QWZ0ZXIpIHtcbiAgICAgICAgICAgIGNoYW5nZS5pbnNlcnROb2RlQnlLZXkobm9kZS5rZXksIHNoaWZ0ICsgaW5kZXggKyAxLCBUZXh0LmNyZWF0ZSgpLCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgICAgIHNoaWZ0KytcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBNZXJnZSBhZGphY2VudCB0ZXh0IG5vZGVzLlxuICAgKlxuICAgKiBAdHlwZSB7T2JqZWN0fVxuICAgKi9cblxuICB7XG4gICAgdmFsaWRhdGVOb2RlKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLmtpbmQgIT0gJ2Jsb2NrJyAmJiBub2RlLmtpbmQgIT0gJ2lubGluZScpIHJldHVyblxuXG4gICAgICBjb25zdCBpbnZhbGlkcyA9IG5vZGUubm9kZXNcbiAgICAgICAgLm1hcCgoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICBjb25zdCBuZXh0ID0gbm9kZS5ub2Rlcy5nZXQoaSArIDEpXG4gICAgICAgICAgaWYgKGNoaWxkLmtpbmQgIT0gJ3RleHQnKSByZXR1cm5cbiAgICAgICAgICBpZiAoIW5leHQgfHwgbmV4dC5raW5kICE9ICd0ZXh0JykgcmV0dXJuXG4gICAgICAgICAgcmV0dXJuIG5leHRcbiAgICAgICAgfSlcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKVxuXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICAvLyBSZXZlcnNlIHRoZSBsaXN0IHRvIGhhbmRsZSBjb25zZWN1dGl2ZSBtZXJnZXMsIHNpbmNlIHRoZSBlYXJsaWVyIG5vZGVzXG4gICAgICAgIC8vIHdpbGwgYWx3YXlzIGV4aXN0IGFmdGVyIGVhY2ggbWVyZ2UuXG4gICAgICAgIGludmFsaWRzLnJldmVyc2UoKS5mb3JFYWNoKChuKSA9PiB7XG4gICAgICAgICAgY2hhbmdlLm1lcmdlTm9kZUJ5S2V5KG4ua2V5LCB7IG5vcm1hbGl6ZTogZmFsc2UgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFByZXZlbnQgZXh0cmEgZW1wdHkgdGV4dCBub2RlcywgZXhjZXB0IHdoZW4gYWRqYWNlbnQgdG8gaW5saW5lIHZvaWQgbm9kZXMuXG4gICAqXG4gICAqIEB0eXBlIHtPYmplY3R9XG4gICAqL1xuXG4gIHtcbiAgICB2YWxpZGF0ZU5vZGUobm9kZSkge1xuICAgICAgaWYgKG5vZGUua2luZCAhPSAnYmxvY2snICYmIG5vZGUua2luZCAhPSAnaW5saW5lJykgcmV0dXJuXG4gICAgICBjb25zdCB7IG5vZGVzIH0gPSBub2RlXG4gICAgICBpZiAobm9kZXMuc2l6ZSA8PSAxKSByZXR1cm5cblxuICAgICAgY29uc3QgaW52YWxpZHMgPSBub2Rlcy5maWx0ZXIoKGRlc2MsIGkpID0+IHtcbiAgICAgICAgaWYgKGRlc2Mua2luZCAhPSAndGV4dCcpIHJldHVyblxuICAgICAgICBpZiAoZGVzYy50ZXh0Lmxlbmd0aCA+IDApIHJldHVyblxuXG4gICAgICAgIGNvbnN0IHByZXYgPSBpID4gMCA/IG5vZGVzLmdldChpIC0gMSkgOiBudWxsXG4gICAgICAgIGNvbnN0IG5leHQgPSBub2Rlcy5nZXQoaSArIDEpXG5cbiAgICAgICAgLy8gSWYgaXQncyB0aGUgZmlyc3Qgbm9kZSwgYW5kIHRoZSBuZXh0IGlzIGEgdm9pZCwgcHJlc2VydmUgaXQuXG4gICAgICAgIGlmICghcHJldiAmJiBuZXh0LmtpbmQgPT0gJ2lubGluZScpIHJldHVyblxuXG4gICAgICAgIC8vIEl0IGl0J3MgdGhlIGxhc3Qgbm9kZSwgYW5kIHRoZSBwcmV2aW91cyBpcyBhbiBpbmxpbmUsIHByZXNlcnZlIGl0LlxuICAgICAgICBpZiAoIW5leHQgJiYgcHJldi5raW5kID09ICdpbmxpbmUnKSByZXR1cm5cblxuICAgICAgICAvLyBJZiBpdCdzIHN1cnJvdW5kZWQgYnkgaW5saW5lcywgcHJlc2VydmUgaXQuXG4gICAgICAgIGlmIChuZXh0ICYmIHByZXYgJiYgbmV4dC5raW5kID09ICdpbmxpbmUnICYmIHByZXYua2luZCA9PSAnaW5saW5lJykgcmV0dXJuXG5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCByZW1vdmUgaXQuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9KVxuXG4gICAgICBpZiAoIWludmFsaWRzLnNpemUpIHJldHVyblxuXG4gICAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgICBpbnZhbGlkcy5mb3JFYWNoKCh0ZXh0KSA9PiB7XG4gICAgICAgICAgY2hhbmdlLnJlbW92ZU5vZGVCeUtleSh0ZXh0LmtleSwgeyBub3JtYWxpemU6IGZhbHNlIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbl1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0FycmF5fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IENPUkVfU0NIRU1BX1JVTEVTXG4iXX0=