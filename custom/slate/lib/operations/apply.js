'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _node = require('../models/node');

var _node2 = _interopRequireDefault(_node);

var _mark = require('../models/mark');

var _mark2 = _interopRequireDefault(_mark);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:operation:apply');

/**
 * Applying functions.
 *
 * @type {Object}
 */

var APPLIERS = {

  /**
   * Add mark to text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  add_mark: function add_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length;

    var mark = _mark2.default.create(operation.mark);
    var _value = value,
        document = _value.document;

    var node = document.assertPath(path);
    node = node.addMark(offset, length, mark);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Insert a `node` at `index` in a node by `path`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  insert_node: function insert_node(value, operation) {
    var path = operation.path;

    var node = _node2.default.create(operation.node);
    var index = path[path.length - 1];
    var rest = path.slice(0, -1);
    var _value2 = value,
        document = _value2.document;

    var parent = document.assertPath(rest);
    parent = parent.insertNode(index, node);
    document = document.updateNode(parent);
    value = value.set('document', document);
    return value;
  },


  /**
   * Insert `text` at `offset` in node by `path`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  insert_text: function insert_text(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        text = operation.text;
    var marks = operation.marks;

    if (Array.isArray(marks)) marks = _mark2.default.createSet(marks);

    var _value3 = value,
        document = _value3.document,
        selection = _value3.selection;
    var _selection = selection,
        anchorKey = _selection.anchorKey,
        focusKey = _selection.focusKey,
        anchorOffset = _selection.anchorOffset,
        focusOffset = _selection.focusOffset;

    var node = document.assertPath(path);

    // Update the document
    node = node.insertText(offset, text, marks);
    document = document.updateNode(node);

    // Update the selection
    if (anchorKey == node.key && anchorOffset >= offset) {
      selection = selection.moveAnchor(text.length);
    }
    if (focusKey == node.key && focusOffset >= offset) {
      selection = selection.moveFocus(text.length);
    }

    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Merge a node at `path` with the previous node.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  merge_node: function merge_node(value, operation) {
    var path = operation.path;

    var withPath = path.slice(0, path.length - 1).concat([path[path.length - 1] - 1]);
    var _value4 = value,
        document = _value4.document,
        selection = _value4.selection;

    var one = document.assertPath(withPath);
    var two = document.assertPath(path);
    var parent = document.getParent(one.key);
    var oneIndex = parent.nodes.indexOf(one);
    var twoIndex = parent.nodes.indexOf(two);

    // Perform the merge in the document.
    parent = parent.mergeNode(oneIndex, twoIndex);
    document = document.updateNode(parent);

    // If the nodes are text nodes and the selection is inside the second node
    // update it to refer to the first node instead.
    if (one.kind == 'text') {
      var _selection2 = selection,
          anchorKey = _selection2.anchorKey,
          anchorOffset = _selection2.anchorOffset,
          focusKey = _selection2.focusKey,
          focusOffset = _selection2.focusOffset;

      var normalize = false;

      if (anchorKey == two.key) {
        selection = selection.moveAnchorTo(one.key, one.text.length + anchorOffset);
        normalize = true;
      }

      if (focusKey == two.key) {
        selection = selection.moveFocusTo(one.key, one.text.length + focusOffset);
        normalize = true;
      }

      if (normalize) {
        selection = selection.normalize(document);
      }
    }

    // Update the document and selection.
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Move a node by `path` to `newPath`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  move_node: function move_node(value, operation) {
    var path = operation.path,
        newPath = operation.newPath;

    var newIndex = newPath[newPath.length - 1];
    var newParentPath = newPath.slice(0, -1);
    var oldParentPath = path.slice(0, -1);
    var oldIndex = path[path.length - 1];
    var _value5 = value,
        document = _value5.document;

    var node = document.assertPath(path);

    // Remove the node from its current parent.
    var parent = document.getParent(node.key);
    parent = parent.removeNode(oldIndex);
    document = document.updateNode(parent);

    // Find the new target...
    var target = void 0;

    // If the old path and the rest of the new path are the same, then the new
    // target is the old parent.
    if (oldParentPath.every(function (x, i) {
      return x === newParentPath[i];
    }) && oldParentPath.length === newParentPath.length) {
      target = parent;
    }

    // Otherwise, if the old path removal resulted in the new path being no longer
    // correct, we need to decrement the new path at the old path's last index.
    else if (oldParentPath.every(function (x, i) {
        return x === newParentPath[i];
      }) && oldIndex < newParentPath[oldParentPath.length]) {
        newParentPath[oldParentPath.length]--;
        target = document.assertPath(newParentPath);
      }

      // Otherwise, we can just grab the target normally...
      else {
          target = document.assertPath(newParentPath);
        }

    // Insert the new node to its new parent.
    target = target.insertNode(newIndex, node);
    document = document.updateNode(target);
    value = value.set('document', document);
    return value;
  },


  /**
   * Remove mark from text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  remove_mark: function remove_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length;

    var mark = _mark2.default.create(operation.mark);
    var _value6 = value,
        document = _value6.document;

    var node = document.assertPath(path);
    node = node.removeMark(offset, length, mark);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Remove a node by `path`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  remove_node: function remove_node(value, operation) {
    var path = operation.path;
    var _value7 = value,
        document = _value7.document,
        selection = _value7.selection;
    var _selection3 = selection,
        startKey = _selection3.startKey,
        endKey = _selection3.endKey;

    var node = document.assertPath(path);
    // If the selection is set, check to see if it needs to be updated.
    if (selection.isSet) {
      var hasStartNode = node.hasNode(startKey);
      var hasEndNode = node.hasNode(endKey);
      var first = node.kind == 'text' ? node : node.getFirstText() || node;
      var last = node.kind == 'text' ? node : node.getLastText() || node;
      var prev = document.getPreviousText(first.key);
      var next = document.getNextText(last.key);

      // If the start point was in this node, update it to be just before/after.
      if (hasStartNode) {
        if (prev) {
          selection = selection.moveStartTo(prev.key, prev.text.length);
        } else if (next) {
          selection = selection.moveStartTo(next.key, 0);
        } else {
          selection = selection.deselect();
        }
      }

      // If the end point was in this node, update it to be just before/after.
      if (selection.isSet && hasEndNode) {
        if (prev) {
          selection = selection.moveEndTo(prev.key, prev.text.length);
        } else if (next) {
          selection = selection.moveEndTo(next.key, 0);
        } else {
          selection = selection.deselect();
        }
      }

      // If the selection wasn't deselected, normalize it.
      if (selection.isSet) {
        selection = selection.normalize(document);
      }
    }

    // Remove the node from the document.
    var parent = document.getParent(node.key);
    var index = parent.nodes.indexOf(node);
    parent = parent.removeNode(index);
    document = document.updateNode(parent);

    // Update the document and selection.
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Remove `text` at `offset` in node by `path`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  remove_text: function remove_text(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        text = operation.text;
    var length = text.length;

    var rangeOffset = offset + length;
    var _value8 = value,
        document = _value8.document,
        selection = _value8.selection;
    var _selection4 = selection,
        anchorKey = _selection4.anchorKey,
        focusKey = _selection4.focusKey,
        anchorOffset = _selection4.anchorOffset,
        focusOffset = _selection4.focusOffset;

    var node = document.assertPath(path);

    // Update the selection.
    if (anchorKey == node.key && anchorOffset >= rangeOffset) {
      selection = selection.moveAnchor(-length);
    }

    if (focusKey == node.key && focusOffset >= rangeOffset) {
      selection = selection.moveFocus(-length);
    }

    node = node.removeText(offset, length);
    document = document.updateNode(node);
    value = value.set('document', document).set('selection', selection);
    return value;
  },


  /**
   * Set `properties` on mark on text at `offset` and `length` in node by `path`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  set_mark: function set_mark(value, operation) {
    var path = operation.path,
        offset = operation.offset,
        length = operation.length,
        properties = operation.properties;

    var mark = _mark2.default.create(operation.mark);
    var _value9 = value,
        document = _value9.document;

    var node = document.assertPath(path);
    node = node.updateMark(offset, length, mark, properties);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Set `properties` on a node by `path`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  set_node: function set_node(value, operation) {
    var path = operation.path,
        properties = operation.properties;
    var _value10 = value,
        document = _value10.document;

    var node = document.assertPath(path);

    // Delete properties that are not allowed to be updated.
    delete properties.nodes;
    delete properties.key;

    node = node.merge(properties);
    document = document.updateNode(node);
    value = value.set('document', document);
    return value;
  },


  /**
   * Set `properties` on the selection.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  set_selection: function set_selection(value, operation) {
    var properties = _extends({}, operation.properties);
    var _value11 = value,
        document = _value11.document,
        selection = _value11.selection;


    if (properties.marks != null) {
      properties.marks = _mark2.default.createSet(properties.marks);
    }

    if (properties.anchorPath !== undefined) {
      properties.anchorKey = properties.anchorPath === null ? null : document.assertPath(properties.anchorPath).key;
      delete properties.anchorPath;
    }

    if (properties.focusPath !== undefined) {
      properties.focusKey = properties.focusPath === null ? null : document.assertPath(properties.focusPath).key;
      delete properties.focusPath;
    }

    selection = selection.merge(properties);
    selection = selection.normalize(document);
    value = value.set('selection', selection);
    return value;
  },


  /**
   * Set `properties` on `value`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  set_value: function set_value(value, operation) {
    var properties = operation.properties;

    // Delete properties that are not allowed to be updated.

    delete properties.document;
    delete properties.selection;
    delete properties.history;

    value = value.merge(properties);
    return value;
  },


  /**
   * Split a node by `path` at `offset`.
   *
   * @param {Value} value
   * @param {Object} operation
   * @return {Value}
   */

  split_node: function split_node(value, operation) {
    var path = operation.path,
        position = operation.position;
    var _value12 = value,
        document = _value12.document,
        selection = _value12.selection;

    // Calculate a few things...

    var node = document.assertPath(path);
    var parent = document.getParent(node.key);
    var index = parent.nodes.indexOf(node);

    // Split the node by its parent.
    parent = parent.splitNode(index, position);
    document = document.updateNode(parent);

    // Determine whether we need to update the selection...
    var _selection5 = selection,
        startKey = _selection5.startKey,
        endKey = _selection5.endKey,
        startOffset = _selection5.startOffset,
        endOffset = _selection5.endOffset;

    var next = document.getNextText(node.key);
    var normalize = false;

    // If the start point is after or equal to the split, update it.
    if (node.key == startKey && position <= startOffset) {
      selection = selection.moveStartTo(next.key, startOffset - position);
      normalize = true;
    }

    // If the end point is after or equal to the split, update it.
    if (node.key == endKey && position <= endOffset) {
      selection = selection.moveEndTo(next.key, endOffset - position);
      normalize = true;
    }

    // Normalize the selection if we changed it, since the methods we use might
    // leave it in a non-normalized value.
    if (normalize) {
      selection = selection.normalize(document);
    }

    // Return the updated value.
    value = value.set('document', document).set('selection', selection);
    return value;
  }
};

/**
 * Apply an `operation` to a `value`.
 *
 * @param {Value} value
 * @param {Object} operation
 * @return {Value} value
 */

function applyOperation(value, operation) {
  var type = operation.type;

  var apply = APPLIERS[type];

  if (!apply) {
    throw new Error('Unknown operation type: "' + type + '".');
  }

  debug(type, operation);
  value = apply(value, operation);
  return value;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = applyOperation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vcGVyYXRpb25zL2FwcGx5LmpzIl0sIm5hbWVzIjpbImRlYnVnIiwiQVBQTElFUlMiLCJhZGRfbWFyayIsInZhbHVlIiwib3BlcmF0aW9uIiwicGF0aCIsIm9mZnNldCIsImxlbmd0aCIsIm1hcmsiLCJjcmVhdGUiLCJkb2N1bWVudCIsIm5vZGUiLCJhc3NlcnRQYXRoIiwiYWRkTWFyayIsInVwZGF0ZU5vZGUiLCJzZXQiLCJpbnNlcnRfbm9kZSIsImluZGV4IiwicmVzdCIsInNsaWNlIiwicGFyZW50IiwiaW5zZXJ0Tm9kZSIsImluc2VydF90ZXh0IiwidGV4dCIsIm1hcmtzIiwiQXJyYXkiLCJpc0FycmF5IiwiY3JlYXRlU2V0Iiwic2VsZWN0aW9uIiwiYW5jaG9yS2V5IiwiZm9jdXNLZXkiLCJhbmNob3JPZmZzZXQiLCJmb2N1c09mZnNldCIsImluc2VydFRleHQiLCJrZXkiLCJtb3ZlQW5jaG9yIiwibW92ZUZvY3VzIiwibWVyZ2Vfbm9kZSIsIndpdGhQYXRoIiwiY29uY2F0Iiwib25lIiwidHdvIiwiZ2V0UGFyZW50Iiwib25lSW5kZXgiLCJub2RlcyIsImluZGV4T2YiLCJ0d29JbmRleCIsIm1lcmdlTm9kZSIsImtpbmQiLCJub3JtYWxpemUiLCJtb3ZlQW5jaG9yVG8iLCJtb3ZlRm9jdXNUbyIsIm1vdmVfbm9kZSIsIm5ld1BhdGgiLCJuZXdJbmRleCIsIm5ld1BhcmVudFBhdGgiLCJvbGRQYXJlbnRQYXRoIiwib2xkSW5kZXgiLCJyZW1vdmVOb2RlIiwidGFyZ2V0IiwiZXZlcnkiLCJ4IiwiaSIsInJlbW92ZV9tYXJrIiwicmVtb3ZlTWFyayIsInJlbW92ZV9ub2RlIiwic3RhcnRLZXkiLCJlbmRLZXkiLCJpc1NldCIsImhhc1N0YXJ0Tm9kZSIsImhhc05vZGUiLCJoYXNFbmROb2RlIiwiZmlyc3QiLCJnZXRGaXJzdFRleHQiLCJsYXN0IiwiZ2V0TGFzdFRleHQiLCJwcmV2IiwiZ2V0UHJldmlvdXNUZXh0IiwibmV4dCIsImdldE5leHRUZXh0IiwibW92ZVN0YXJ0VG8iLCJkZXNlbGVjdCIsIm1vdmVFbmRUbyIsInJlbW92ZV90ZXh0IiwicmFuZ2VPZmZzZXQiLCJyZW1vdmVUZXh0Iiwic2V0X21hcmsiLCJwcm9wZXJ0aWVzIiwidXBkYXRlTWFyayIsInNldF9ub2RlIiwibWVyZ2UiLCJzZXRfc2VsZWN0aW9uIiwiYW5jaG9yUGF0aCIsInVuZGVmaW5lZCIsImZvY3VzUGF0aCIsInNldF92YWx1ZSIsImhpc3RvcnkiLCJzcGxpdF9ub2RlIiwicG9zaXRpb24iLCJzcGxpdE5vZGUiLCJzdGFydE9mZnNldCIsImVuZE9mZnNldCIsImFwcGx5T3BlcmF0aW9uIiwidHlwZSIsImFwcGx5IiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsUUFBUSxxQkFBTSx1QkFBTixDQUFkOztBQUVBOzs7Ozs7QUFNQSxJQUFNQyxXQUFXOztBQUVmOzs7Ozs7OztBQVFBQyxVQVZlLG9CQVVOQyxLQVZNLEVBVUNDLFNBVkQsRUFVWTtBQUFBLFFBQ2pCQyxJQURpQixHQUNRRCxTQURSLENBQ2pCQyxJQURpQjtBQUFBLFFBQ1hDLE1BRFcsR0FDUUYsU0FEUixDQUNYRSxNQURXO0FBQUEsUUFDSEMsTUFERyxHQUNRSCxTQURSLENBQ0hHLE1BREc7O0FBRXpCLFFBQU1DLE9BQU8sZUFBS0MsTUFBTCxDQUFZTCxVQUFVSSxJQUF0QixDQUFiO0FBRnlCLGlCQUdOTCxLQUhNO0FBQUEsUUFHbkJPLFFBSG1CLFVBR25CQSxRQUhtQjs7QUFJekIsUUFBSUMsT0FBT0QsU0FBU0UsVUFBVCxDQUFvQlAsSUFBcEIsQ0FBWDtBQUNBTSxXQUFPQSxLQUFLRSxPQUFMLENBQWFQLE1BQWIsRUFBcUJDLE1BQXJCLEVBQTZCQyxJQUE3QixDQUFQO0FBQ0FFLGVBQVdBLFNBQVNJLFVBQVQsQ0FBb0JILElBQXBCLENBQVg7QUFDQVIsWUFBUUEsTUFBTVksR0FBTixDQUFVLFVBQVYsRUFB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LENBQW9CdkMsUUFBcEIsQ0FBWjtBQUNEOztBQUVEO0FBQ0FQLFlBQVFBLE1BQU1ZLEdBQU4sQ0FBVSxVQUFWLEVBQXNCTCxRQUF0QixFQUFnQ0ssR0FBaEMsQ0FBb0MsV0FBcEMsRUFBaURhLFNBQWpELENBQVI7QUFDQSxXQUFPekIsS0FBUDtBQUNEO0FBcGJjLENBQWpCOztBQXdiQTs7Ozs7Ozs7QUFRQSxTQUFTbUcsY0FBVCxDQUF3Qm5HLEtBQXhCLEVBQStCQyxTQUEvQixFQUEwQztBQUFBLE1BQ2hDbUcsSUFEZ0MsR0FDdkJuRyxTQUR1QixDQUNoQ21HLElBRGdDOztBQUV4QyxNQUFNQyxRQUFRdkcsU0FBU3NHLElBQVQsQ0FBZDs7QUFFQSxNQUFJLENBQUNDLEtBQUwsRUFBWTtBQUNWLFVBQU0sSUFBSUMsS0FBSiwrQkFBc0NGLElBQXRDLFFBQU47QUFDRDs7QUFFRHZHLFFBQU11RyxJQUFOLEVBQVluRyxTQUFaO0FBQ0FELFVBQVFxRyxNQUFNckcsS0FBTixFQUFhQyxTQUFiLENBQVI7QUFDQSxTQUFPRCxLQUFQO0FBQ0Q7O0FBRUQ7Ozs7OztrQkFNZW1HLGMiLCJmaWxlIjoiYXBwbHkuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBEZWJ1ZyBmcm9tICdkZWJ1ZydcblxuaW1wb3J0IE5vZGUgZnJvbSAnLi4vbW9kZWxzL25vZGUnXG5pbXBvcnQgTWFyayBmcm9tICcuLi9tb2RlbHMvbWFyaydcblxuLyoqXG4gKiBEZWJ1Zy5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuY29uc3QgZGVidWcgPSBEZWJ1Zygnc2xhdGU6b3BlcmF0aW9uOmFwcGx5JylcblxuLyoqXG4gKiBBcHBseWluZyBmdW5jdGlvbnMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBBUFBMSUVSUyA9IHtcblxuICAvKipcbiAgICogQWRkIG1hcmsgdG8gdGV4dCBhdCBgb2Zmc2V0YCBhbmQgYGxlbmd0aGAgaW4gbm9kZSBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIGFkZF9tYXJrKHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHBhdGgsIG9mZnNldCwgbGVuZ3RoIH0gPSBvcGVyYXRpb25cbiAgICBjb25zdCBtYXJrID0gTWFyay5jcmVhdGUob3BlcmF0aW9uLm1hcmspXG4gICAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnRQYXRoKHBhdGgpXG4gICAgbm9kZSA9IG5vZGUuYWRkTWFyayhvZmZzZXQsIGxlbmd0aCwgbWFyaylcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUobm9kZSlcbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudClcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogSW5zZXJ0IGEgYG5vZGVgIGF0IGBpbmRleGAgaW4gYSBub2RlIGJ5IGBwYXRoYC5cbiAgICpcbiAgICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wZXJhdGlvblxuICAgKiBAcmV0dXJuIHtWYWx1ZX1cbiAgICovXG5cbiAgaW5zZXJ0X25vZGUodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcGF0aCB9ID0gb3BlcmF0aW9uXG4gICAgY29uc3Qgbm9kZSA9IE5vZGUuY3JlYXRlKG9wZXJhdGlvbi5ub2RlKVxuICAgIGNvbnN0IGluZGV4ID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdXG4gICAgY29uc3QgcmVzdCA9IHBhdGguc2xpY2UoMCwgLTEpXG4gICAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgbGV0IHBhcmVudCA9IGRvY3VtZW50LmFzc2VydFBhdGgocmVzdClcbiAgICBwYXJlbnQgPSBwYXJlbnQuaW5zZXJ0Tm9kZShpbmRleCwgbm9kZSlcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUocGFyZW50KVxuICAgIHZhbHVlID0gdmFsdWUuc2V0KCdkb2N1bWVudCcsIGRvY3VtZW50KVxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBJbnNlcnQgYHRleHRgIGF0IGBvZmZzZXRgIGluIG5vZGUgYnkgYHBhdGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3BlcmF0aW9uXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICBpbnNlcnRfdGV4dCh2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgeyBwYXRoLCBvZmZzZXQsIHRleHQgfSA9IG9wZXJhdGlvblxuXG4gICAgbGV0IHsgbWFya3MgfSA9IG9wZXJhdGlvblxuICAgIGlmIChBcnJheS5pc0FycmF5KG1hcmtzKSkgbWFya3MgPSBNYXJrLmNyZWF0ZVNldChtYXJrcylcblxuICAgIGxldCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgY29uc3QgeyBhbmNob3JLZXksIGZvY3VzS2V5LCBhbmNob3JPZmZzZXQsIGZvY3VzT2Zmc2V0IH0gPSBzZWxlY3Rpb25cbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmFzc2VydFBhdGgocGF0aClcblxuICAgIC8vIFVwZGF0ZSB0aGUgZG9jdW1lbnRcbiAgICBub2RlID0gbm9kZS5pbnNlcnRUZXh0KG9mZnNldCwgdGV4dCwgbWFya3MpXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKG5vZGUpXG5cbiAgICAvLyBVcGRhdGUgdGhlIHNlbGVjdGlvblxuICAgIGlmIChhbmNob3JLZXkgPT0gbm9kZS5rZXkgJiYgYW5jaG9yT2Zmc2V0ID49IG9mZnNldCkge1xuICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1vdmVBbmNob3IodGV4dC5sZW5ndGgpXG4gICAgfVxuICAgIGlmIChmb2N1c0tleSA9PSBub2RlLmtleSAmJiBmb2N1c09mZnNldCA+PSBvZmZzZXQpIHtcbiAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlRm9jdXModGV4dC5sZW5ndGgpXG4gICAgfVxuXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpLnNldCgnc2VsZWN0aW9uJywgc2VsZWN0aW9uKVxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBNZXJnZSBhIG5vZGUgYXQgYHBhdGhgIHdpdGggdGhlIHByZXZpb3VzIG5vZGUuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIG1lcmdlX25vZGUodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcGF0aCB9ID0gb3BlcmF0aW9uXG4gICAgY29uc3Qgd2l0aFBhdGggPSBwYXRoLnNsaWNlKDAsIHBhdGgubGVuZ3RoIC0gMSkuY29uY2F0KFtwYXRoW3BhdGgubGVuZ3RoIC0gMV0gLSAxXSlcbiAgICBsZXQgeyBkb2N1bWVudCwgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICAgIGNvbnN0IG9uZSA9IGRvY3VtZW50LmFzc2VydFBhdGgod2l0aFBhdGgpXG4gICAgY29uc3QgdHdvID0gZG9jdW1lbnQuYXNzZXJ0UGF0aChwYXRoKVxuICAgIGxldCBwYXJlbnQgPSBkb2N1bWVudC5nZXRQYXJlbnQob25lLmtleSlcbiAgICBjb25zdCBvbmVJbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKG9uZSlcbiAgICBjb25zdCB0d29JbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKHR3bylcblxuICAgIC8vIFBlcmZvcm0gdGhlIG1lcmdlIGluIHRoZSBkb2N1bWVudC5cbiAgICBwYXJlbnQgPSBwYXJlbnQubWVyZ2VOb2RlKG9uZUluZGV4LCB0d29JbmRleClcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUocGFyZW50KVxuXG4gICAgLy8gSWYgdGhlIG5vZGVzIGFyZSB0ZXh0IG5vZGVzIGFuZCB0aGUgc2VsZWN0aW9uIGlzIGluc2lkZSB0aGUgc2Vjb25kIG5vZGVcbiAgICAvLyB1cGRhdGUgaXQgdG8gcmVmZXIgdG8gdGhlIGZpcnN0IG5vZGUgaW5zdGVhZC5cbiAgICBpZiAob25lLmtpbmQgPT0gJ3RleHQnKSB7XG4gICAgICBjb25zdCB7IGFuY2hvcktleSwgYW5jaG9yT2Zmc2V0LCBmb2N1c0tleSwgZm9jdXNPZmZzZXQgfSA9IHNlbGVjdGlvblxuICAgICAgbGV0IG5vcm1hbGl6ZSA9IGZhbHNlXG5cbiAgICAgIGlmIChhbmNob3JLZXkgPT0gdHdvLmtleSkge1xuICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubW92ZUFuY2hvclRvKG9uZS5rZXksIG9uZS50ZXh0Lmxlbmd0aCArIGFuY2hvck9mZnNldClcbiAgICAgICAgbm9ybWFsaXplID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZiAoZm9jdXNLZXkgPT0gdHdvLmtleSkge1xuICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubW92ZUZvY3VzVG8ob25lLmtleSwgb25lLnRleHQubGVuZ3RoICsgZm9jdXNPZmZzZXQpXG4gICAgICAgIG5vcm1hbGl6ZSA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKG5vcm1hbGl6ZSkge1xuICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubm9ybWFsaXplKGRvY3VtZW50KVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgZG9jdW1lbnQgYW5kIHNlbGVjdGlvbi5cbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudCkuc2V0KCdzZWxlY3Rpb24nLCBzZWxlY3Rpb24pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIE1vdmUgYSBub2RlIGJ5IGBwYXRoYCB0byBgbmV3UGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIG1vdmVfbm9kZSh2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgeyBwYXRoLCBuZXdQYXRoIH0gPSBvcGVyYXRpb25cbiAgICBjb25zdCBuZXdJbmRleCA9IG5ld1BhdGhbbmV3UGF0aC5sZW5ndGggLSAxXVxuICAgIGNvbnN0IG5ld1BhcmVudFBhdGggPSBuZXdQYXRoLnNsaWNlKDAsIC0xKVxuICAgIGNvbnN0IG9sZFBhcmVudFBhdGggPSBwYXRoLnNsaWNlKDAsIC0xKVxuICAgIGNvbnN0IG9sZEluZGV4ID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdXG4gICAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmFzc2VydFBhdGgocGF0aClcblxuICAgIC8vIFJlbW92ZSB0aGUgbm9kZSBmcm9tIGl0cyBjdXJyZW50IHBhcmVudC5cbiAgICBsZXQgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KG5vZGUua2V5KVxuICAgIHBhcmVudCA9IHBhcmVudC5yZW1vdmVOb2RlKG9sZEluZGV4KVxuICAgIGRvY3VtZW50ID0gZG9jdW1lbnQudXBkYXRlTm9kZShwYXJlbnQpXG5cbiAgICAvLyBGaW5kIHRoZSBuZXcgdGFyZ2V0Li4uXG4gICAgbGV0IHRhcmdldFxuXG4gICAgLy8gSWYgdGhlIG9sZCBwYXRoIGFuZCB0aGUgcmVzdCBvZiB0aGUgbmV3IHBhdGggYXJlIHRoZSBzYW1lLCB0aGVuIHRoZSBuZXdcbiAgICAvLyB0YXJnZXQgaXMgdGhlIG9sZCBwYXJlbnQuXG4gICAgaWYgKFxuICAgICAgKG9sZFBhcmVudFBhdGguZXZlcnkoKHgsIGkpID0+IHggPT09IG5ld1BhcmVudFBhdGhbaV0pKSAmJlxuICAgICAgKG9sZFBhcmVudFBhdGgubGVuZ3RoID09PSBuZXdQYXJlbnRQYXRoLmxlbmd0aClcbiAgICApIHtcbiAgICAgIHRhcmdldCA9IHBhcmVudFxuICAgIH1cblxuICAgIC8vIE90aGVyd2lzZSwgaWYgdGhlIG9sZCBwYXRoIHJlbW92YWwgcmVzdWx0ZWQgaW4gdGhlIG5ldyBwYXRoIGJlaW5nIG5vIGxvbmdlclxuICAgIC8vIGNvcnJlY3QsIHdlIG5lZWQgdG8gZGVjcmVtZW50IHRoZSBuZXcgcGF0aCBhdCB0aGUgb2xkIHBhdGgncyBsYXN0IGluZGV4LlxuICAgIGVsc2UgaWYgKFxuICAgICAgKG9sZFBhcmVudFBhdGguZXZlcnkoKHgsIGkpID0+IHggPT09IG5ld1BhcmVudFBhdGhbaV0pKSAmJlxuICAgICAgKG9sZEluZGV4IDwgbmV3UGFyZW50UGF0aFtvbGRQYXJlbnRQYXRoLmxlbmd0aF0pXG4gICAgKSB7XG4gICAgICBuZXdQYXJlbnRQYXRoW29sZFBhcmVudFBhdGgubGVuZ3RoXS0tXG4gICAgICB0YXJnZXQgPSBkb2N1bWVudC5hc3NlcnRQYXRoKG5ld1BhcmVudFBhdGgpXG4gICAgfVxuXG4gICAgLy8gT3RoZXJ3aXNlLCB3ZSBjYW4ganVzdCBncmFiIHRoZSB0YXJnZXQgbm9ybWFsbHkuLi5cbiAgICBlbHNlIHtcbiAgICAgIHRhcmdldCA9IGRvY3VtZW50LmFzc2VydFBhdGgobmV3UGFyZW50UGF0aClcbiAgICB9XG5cbiAgICAvLyBJbnNlcnQgdGhlIG5ldyBub2RlIHRvIGl0cyBuZXcgcGFyZW50LlxuICAgIHRhcmdldCA9IHRhcmdldC5pbnNlcnROb2RlKG5ld0luZGV4LCBub2RlKVxuICAgIGRvY3VtZW50ID0gZG9jdW1lbnQudXBkYXRlTm9kZSh0YXJnZXQpXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBtYXJrIGZyb20gdGV4dCBhdCBgb2Zmc2V0YCBhbmQgYGxlbmd0aGAgaW4gbm9kZSBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIHJlbW92ZV9tYXJrKHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHBhdGgsIG9mZnNldCwgbGVuZ3RoIH0gPSBvcGVyYXRpb25cbiAgICBjb25zdCBtYXJrID0gTWFyay5jcmVhdGUob3BlcmF0aW9uLm1hcmspXG4gICAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnRQYXRoKHBhdGgpXG4gICAgbm9kZSA9IG5vZGUucmVtb3ZlTWFyayhvZmZzZXQsIGxlbmd0aCwgbWFyaylcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUobm9kZSlcbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudClcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogUmVtb3ZlIGEgbm9kZSBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIHJlbW92ZV9ub2RlKHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHBhdGggfSA9IG9wZXJhdGlvblxuICAgIGxldCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgY29uc3QgeyBzdGFydEtleSwgZW5kS2V5IH0gPSBzZWxlY3Rpb25cbiAgICBjb25zdCBub2RlID0gZG9jdW1lbnQuYXNzZXJ0UGF0aChwYXRoKVxuICAgIC8vIElmIHRoZSBzZWxlY3Rpb24gaXMgc2V0LCBjaGVjayB0byBzZWUgaWYgaXQgbmVlZHMgdG8gYmUgdXBkYXRlZC5cbiAgICBpZiAoc2VsZWN0aW9uLmlzU2V0KSB7XG4gICAgICBjb25zdCBoYXNTdGFydE5vZGUgPSBub2RlLmhhc05vZGUoc3RhcnRLZXkpXG4gICAgICBjb25zdCBoYXNFbmROb2RlID0gbm9kZS5oYXNOb2RlKGVuZEtleSlcbiAgICAgIGNvbnN0IGZpcnN0ID0gbm9kZS5raW5kID09ICd0ZXh0JyA/IG5vZGUgOiBub2RlLmdldEZpcnN0VGV4dCgpIHx8IG5vZGVcbiAgICAgIGNvbnN0IGxhc3QgPSBub2RlLmtpbmQgPT0gJ3RleHQnID8gbm9kZSA6IG5vZGUuZ2V0TGFzdFRleHQoKSB8fCBub2RlXG4gICAgICBjb25zdCBwcmV2ID0gZG9jdW1lbnQuZ2V0UHJldmlvdXNUZXh0KGZpcnN0LmtleSlcbiAgICAgIGNvbnN0IG5leHQgPSBkb2N1bWVudC5nZXROZXh0VGV4dChsYXN0LmtleSlcblxuICAgICAgLy8gSWYgdGhlIHN0YXJ0IHBvaW50IHdhcyBpbiB0aGlzIG5vZGUsIHVwZGF0ZSBpdCB0byBiZSBqdXN0IGJlZm9yZS9hZnRlci5cbiAgICAgIGlmIChoYXNTdGFydE5vZGUpIHtcbiAgICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubW92ZVN0YXJ0VG8ocHJldi5rZXksIHByZXYudGV4dC5sZW5ndGgpXG4gICAgICAgIH0gZWxzZSBpZiAobmV4dCkge1xuICAgICAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlU3RhcnRUbyhuZXh0LmtleSwgMClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24uZGVzZWxlY3QoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBlbmQgcG9pbnQgd2FzIGluIHRoaXMgbm9kZSwgdXBkYXRlIGl0IHRvIGJlIGp1c3QgYmVmb3JlL2FmdGVyLlxuICAgICAgaWYgKHNlbGVjdGlvbi5pc1NldCAmJiBoYXNFbmROb2RlKSB7XG4gICAgICAgIGlmIChwcmV2KSB7XG4gICAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1vdmVFbmRUbyhwcmV2LmtleSwgcHJldi50ZXh0Lmxlbmd0aClcbiAgICAgICAgfSBlbHNlIGlmIChuZXh0KSB7XG4gICAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1vdmVFbmRUbyhuZXh0LmtleSwgMClcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24uZGVzZWxlY3QoKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBzZWxlY3Rpb24gd2Fzbid0IGRlc2VsZWN0ZWQsIG5vcm1hbGl6ZSBpdC5cbiAgICAgIGlmIChzZWxlY3Rpb24uaXNTZXQpIHtcbiAgICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm5vcm1hbGl6ZShkb2N1bWVudClcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZW1vdmUgdGhlIG5vZGUgZnJvbSB0aGUgZG9jdW1lbnQuXG4gICAgbGV0IHBhcmVudCA9IGRvY3VtZW50LmdldFBhcmVudChub2RlLmtleSlcbiAgICBjb25zdCBpbmRleCA9IHBhcmVudC5ub2Rlcy5pbmRleE9mKG5vZGUpXG4gICAgcGFyZW50ID0gcGFyZW50LnJlbW92ZU5vZGUoaW5kZXgpXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKHBhcmVudClcblxuICAgIC8vIFVwZGF0ZSB0aGUgZG9jdW1lbnQgYW5kIHNlbGVjdGlvbi5cbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudCkuc2V0KCdzZWxlY3Rpb24nLCBzZWxlY3Rpb24pXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBgdGV4dGAgYXQgYG9mZnNldGAgaW4gbm9kZSBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIHJlbW92ZV90ZXh0KHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHBhdGgsIG9mZnNldCwgdGV4dCB9ID0gb3BlcmF0aW9uXG4gICAgY29uc3QgeyBsZW5ndGggfSA9IHRleHRcbiAgICBjb25zdCByYW5nZU9mZnNldCA9IG9mZnNldCArIGxlbmd0aFxuICAgIGxldCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gICAgY29uc3QgeyBhbmNob3JLZXksIGZvY3VzS2V5LCBhbmNob3JPZmZzZXQsIGZvY3VzT2Zmc2V0IH0gPSBzZWxlY3Rpb25cbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmFzc2VydFBhdGgocGF0aClcblxuICAgIC8vIFVwZGF0ZSB0aGUgc2VsZWN0aW9uLlxuICAgIGlmIChhbmNob3JLZXkgPT0gbm9kZS5rZXkgJiYgYW5jaG9yT2Zmc2V0ID49IHJhbmdlT2Zmc2V0KSB7XG4gICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubW92ZUFuY2hvcigtbGVuZ3RoKVxuICAgIH1cblxuICAgIGlmIChmb2N1c0tleSA9PSBub2RlLmtleSAmJiBmb2N1c09mZnNldCA+PSByYW5nZU9mZnNldCkge1xuICAgICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1vdmVGb2N1cygtbGVuZ3RoKVxuICAgIH1cblxuICAgIG5vZGUgPSBub2RlLnJlbW92ZVRleHQob2Zmc2V0LCBsZW5ndGgpXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKG5vZGUpXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpLnNldCgnc2VsZWN0aW9uJywgc2VsZWN0aW9uKVxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgYHByb3BlcnRpZXNgIG9uIG1hcmsgb24gdGV4dCBhdCBgb2Zmc2V0YCBhbmQgYGxlbmd0aGAgaW4gbm9kZSBieSBgcGF0aGAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIHNldF9tYXJrKHZhbHVlLCBvcGVyYXRpb24pIHtcbiAgICBjb25zdCB7IHBhdGgsIG9mZnNldCwgbGVuZ3RoLCBwcm9wZXJ0aWVzIH0gPSBvcGVyYXRpb25cbiAgICBjb25zdCBtYXJrID0gTWFyay5jcmVhdGUob3BlcmF0aW9uLm1hcmspXG4gICAgbGV0IHsgZG9jdW1lbnQgfSA9IHZhbHVlXG4gICAgbGV0IG5vZGUgPSBkb2N1bWVudC5hc3NlcnRQYXRoKHBhdGgpXG4gICAgbm9kZSA9IG5vZGUudXBkYXRlTWFyayhvZmZzZXQsIGxlbmd0aCwgbWFyaywgcHJvcGVydGllcylcbiAgICBkb2N1bWVudCA9IGRvY3VtZW50LnVwZGF0ZU5vZGUobm9kZSlcbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnZG9jdW1lbnQnLCBkb2N1bWVudClcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxuICAvKipcbiAgICogU2V0IGBwcm9wZXJ0aWVzYCBvbiBhIG5vZGUgYnkgYHBhdGhgLlxuICAgKlxuICAgKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3BlcmF0aW9uXG4gICAqIEByZXR1cm4ge1ZhbHVlfVxuICAgKi9cblxuICBzZXRfbm9kZSh2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgeyBwYXRoLCBwcm9wZXJ0aWVzIH0gPSBvcGVyYXRpb25cbiAgICBsZXQgeyBkb2N1bWVudCB9ID0gdmFsdWVcbiAgICBsZXQgbm9kZSA9IGRvY3VtZW50LmFzc2VydFBhdGgocGF0aClcblxuICAgIC8vIERlbGV0ZSBwcm9wZXJ0aWVzIHRoYXQgYXJlIG5vdCBhbGxvd2VkIHRvIGJlIHVwZGF0ZWQuXG4gICAgZGVsZXRlIHByb3BlcnRpZXMubm9kZXNcbiAgICBkZWxldGUgcHJvcGVydGllcy5rZXlcblxuICAgIG5vZGUgPSBub2RlLm1lcmdlKHByb3BlcnRpZXMpXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKG5vZGUpXG4gICAgdmFsdWUgPSB2YWx1ZS5zZXQoJ2RvY3VtZW50JywgZG9jdW1lbnQpXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIFNldCBgcHJvcGVydGllc2Agb24gdGhlIHNlbGVjdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtWYWx1ZX0gdmFsdWVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wZXJhdGlvblxuICAgKiBAcmV0dXJuIHtWYWx1ZX1cbiAgICovXG5cbiAgc2V0X3NlbGVjdGlvbih2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgcHJvcGVydGllcyA9IHsgLi4ub3BlcmF0aW9uLnByb3BlcnRpZXMgfVxuICAgIGxldCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG5cbiAgICBpZiAocHJvcGVydGllcy5tYXJrcyAhPSBudWxsKSB7XG4gICAgICBwcm9wZXJ0aWVzLm1hcmtzID0gTWFyay5jcmVhdGVTZXQocHJvcGVydGllcy5tYXJrcylcbiAgICB9XG5cbiAgICBpZiAocHJvcGVydGllcy5hbmNob3JQYXRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHByb3BlcnRpZXMuYW5jaG9yS2V5ID0gcHJvcGVydGllcy5hbmNob3JQYXRoID09PSBudWxsXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IGRvY3VtZW50LmFzc2VydFBhdGgocHJvcGVydGllcy5hbmNob3JQYXRoKS5rZXlcbiAgICAgIGRlbGV0ZSBwcm9wZXJ0aWVzLmFuY2hvclBhdGhcbiAgICB9XG5cbiAgICBpZiAocHJvcGVydGllcy5mb2N1c1BhdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgcHJvcGVydGllcy5mb2N1c0tleSA9IHByb3BlcnRpZXMuZm9jdXNQYXRoID09PSBudWxsXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IGRvY3VtZW50LmFzc2VydFBhdGgocHJvcGVydGllcy5mb2N1c1BhdGgpLmtleVxuICAgICAgZGVsZXRlIHByb3BlcnRpZXMuZm9jdXNQYXRoXG4gICAgfVxuXG4gICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm1lcmdlKHByb3BlcnRpZXMpXG4gICAgc2VsZWN0aW9uID0gc2VsZWN0aW9uLm5vcm1hbGl6ZShkb2N1bWVudClcbiAgICB2YWx1ZSA9IHZhbHVlLnNldCgnc2VsZWN0aW9uJywgc2VsZWN0aW9uKVxuICAgIHJldHVybiB2YWx1ZVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgYHByb3BlcnRpZXNgIG9uIGB2YWx1ZWAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIHNldF92YWx1ZSh2YWx1ZSwgb3BlcmF0aW9uKSB7XG4gICAgY29uc3QgeyBwcm9wZXJ0aWVzIH0gPSBvcGVyYXRpb25cblxuICAgIC8vIERlbGV0ZSBwcm9wZXJ0aWVzIHRoYXQgYXJlIG5vdCBhbGxvd2VkIHRvIGJlIHVwZGF0ZWQuXG4gICAgZGVsZXRlIHByb3BlcnRpZXMuZG9jdW1lbnRcbiAgICBkZWxldGUgcHJvcGVydGllcy5zZWxlY3Rpb25cbiAgICBkZWxldGUgcHJvcGVydGllcy5oaXN0b3J5XG5cbiAgICB2YWx1ZSA9IHZhbHVlLm1lcmdlKHByb3BlcnRpZXMpXG4gICAgcmV0dXJuIHZhbHVlXG4gIH0sXG5cbiAgLyoqXG4gICAqIFNwbGl0IGEgbm9kZSBieSBgcGF0aGAgYXQgYG9mZnNldGAuXG4gICAqXG4gICAqIEBwYXJhbSB7VmFsdWV9IHZhbHVlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcGVyYXRpb25cbiAgICogQHJldHVybiB7VmFsdWV9XG4gICAqL1xuXG4gIHNwbGl0X25vZGUodmFsdWUsIG9wZXJhdGlvbikge1xuICAgIGNvbnN0IHsgcGF0aCwgcG9zaXRpb24gfSA9IG9wZXJhdGlvblxuICAgIGxldCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG5cbiAgICAvLyBDYWxjdWxhdGUgYSBmZXcgdGhpbmdzLi4uXG4gICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50LmFzc2VydFBhdGgocGF0aClcbiAgICBsZXQgcGFyZW50ID0gZG9jdW1lbnQuZ2V0UGFyZW50KG5vZGUua2V5KVxuICAgIGNvbnN0IGluZGV4ID0gcGFyZW50Lm5vZGVzLmluZGV4T2Yobm9kZSlcblxuICAgIC8vIFNwbGl0IHRoZSBub2RlIGJ5IGl0cyBwYXJlbnQuXG4gICAgcGFyZW50ID0gcGFyZW50LnNwbGl0Tm9kZShpbmRleCwgcG9zaXRpb24pXG4gICAgZG9jdW1lbnQgPSBkb2N1bWVudC51cGRhdGVOb2RlKHBhcmVudClcblxuICAgIC8vIERldGVybWluZSB3aGV0aGVyIHdlIG5lZWQgdG8gdXBkYXRlIHRoZSBzZWxlY3Rpb24uLi5cbiAgICBjb25zdCB7IHN0YXJ0S2V5LCBlbmRLZXksIHN0YXJ0T2Zmc2V0LCBlbmRPZmZzZXQgfSA9IHNlbGVjdGlvblxuICAgIGNvbnN0IG5leHQgPSBkb2N1bWVudC5nZXROZXh0VGV4dChub2RlLmtleSlcbiAgICBsZXQgbm9ybWFsaXplID0gZmFsc2VcblxuICAgIC8vIElmIHRoZSBzdGFydCBwb2ludCBpcyBhZnRlciBvciBlcXVhbCB0byB0aGUgc3BsaXQsIHVwZGF0ZSBpdC5cbiAgICBpZiAobm9kZS5rZXkgPT0gc3RhcnRLZXkgJiYgcG9zaXRpb24gPD0gc3RhcnRPZmZzZXQpIHtcbiAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5tb3ZlU3RhcnRUbyhuZXh0LmtleSwgc3RhcnRPZmZzZXQgLSBwb3NpdGlvbilcbiAgICAgIG5vcm1hbGl6ZSA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgZW5kIHBvaW50IGlzIGFmdGVyIG9yIGVxdWFsIHRvIHRoZSBzcGxpdCwgdXBkYXRlIGl0LlxuICAgIGlmIChub2RlLmtleSA9PSBlbmRLZXkgJiYgcG9zaXRpb24gPD0gZW5kT2Zmc2V0KSB7XG4gICAgICBzZWxlY3Rpb24gPSBzZWxlY3Rpb24ubW92ZUVuZFRvKG5leHQua2V5LCBlbmRPZmZzZXQgLSBwb3NpdGlvbilcbiAgICAgIG5vcm1hbGl6ZSA9IHRydWVcbiAgICB9XG5cbiAgICAvLyBOb3JtYWxpemUgdGhlIHNlbGVjdGlvbiBpZiB3ZSBjaGFuZ2VkIGl0LCBzaW5jZSB0aGUgbWV0aG9kcyB3ZSB1c2UgbWlnaHRcbiAgICAvLyBsZWF2ZSBpdCBpbiBhIG5vbi1ub3JtYWxpemVkIHZhbHVlLlxuICAgIGlmIChub3JtYWxpemUpIHtcbiAgICAgIHNlbGVjdGlvbiA9IHNlbGVjdGlvbi5ub3JtYWxpemUoZG9jdW1lbnQpXG4gICAgfVxuXG4gICAgLy8gUmV0dXJuIHRoZSB1cGRhdGVkIHZhbHVlLlxuICAgIHZhbHVlID0gdmFsdWUuc2V0KCdkb2N1bWVudCcsIGRvY3VtZW50KS5zZXQoJ3NlbGVjdGlvbicsIHNlbGVjdGlvbilcbiAgICByZXR1cm4gdmFsdWVcbiAgfSxcblxufVxuXG4vKipcbiAqIEFwcGx5IGFuIGBvcGVyYXRpb25gIHRvIGEgYHZhbHVlYC5cbiAqXG4gKiBAcGFyYW0ge1ZhbHVlfSB2YWx1ZVxuICogQHBhcmFtIHtPYmplY3R9IG9wZXJhdGlvblxuICogQHJldHVybiB7VmFsdWV9IHZhbHVlXG4gKi9cblxuZnVuY3Rpb24gYXBwbHlPcGVyYXRpb24odmFsdWUsIG9wZXJhdGlvbikge1xuICBjb25zdCB7IHR5cGUgfSA9IG9wZXJhdGlvblxuICBjb25zdCBhcHBseSA9IEFQUExJRVJTW3R5cGVdXG5cbiAgaWYgKCFhcHBseSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biBvcGVyYXRpb24gdHlwZTogXCIke3R5cGV9XCIuYClcbiAgfVxuXG4gIGRlYnVnKHR5cGUsIG9wZXJhdGlvbilcbiAgdmFsdWUgPSBhcHBseSh2YWx1ZSwgb3BlcmF0aW9uKVxuICByZXR1cm4gdmFsdWVcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGFwcGx5T3BlcmF0aW9uXG4iXX0=