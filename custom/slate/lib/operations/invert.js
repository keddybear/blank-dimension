'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:operation:invert');

/**
 * Invert an `op`.
 *
 * @param {Object} op
 * @return {Object}
 */

function invertOperation(op) {
  var type = op.type;

  debug(type, op);

  /**
   * Insert node.
   */

  if (type == 'insert_node') {
    return _extends({}, op, {
      type: 'remove_node'
    });
  }

  /**
   * Remove node.
   */

  if (type == 'remove_node') {
    return _extends({}, op, {
      type: 'insert_node'
    });
  }

  /**
   * Move node.
   */

  if (type == 'move_node') {
    return _extends({}, op, {
      path: op.newPath,
      newPath: op.path
    });
  }

  /**
   * Merge node.
   */

  if (type == 'merge_node') {
    var path = op.path;
    var length = path.length;

    var last = length - 1;
    return _extends({}, op, {
      type: 'split_node',
      path: path.slice(0, last).concat([path[last] - 1])
    });
  }

  /**
   * Split node.
   */

  if (type == 'split_node') {
    var _path = op.path;
    var _length = _path.length;

    var _last = _length - 1;
    return _extends({}, op, {
      type: 'merge_node',
      path: _path.slice(0, _last).concat([_path[_last] + 1])
    });
  }

  /**
   * Set node.
   */

  if (type == 'set_node') {
    var properties = op.properties,
        node = op.node;

    return _extends({}, op, {
      node: node.merge(properties),
      properties: (0, _pick2.default)(node, Object.keys(properties))
    });
  }

  /**
   * Insert text.
   */

  if (type == 'insert_text') {
    return _extends({}, op, {
      type: 'remove_text'
    });
  }

  /**
   * Remove text.
   */

  if (type == 'remove_text') {
    return _extends({}, op, {
      type: 'insert_text'
    });
  }

  /**
   * Add mark.
   */

  if (type == 'add_mark') {
    return _extends({}, op, {
      type: 'remove_mark'
    });
  }

  /**
   * Remove mark.
   */

  if (type == 'remove_mark') {
    return _extends({}, op, {
      type: 'add_mark'
    });
  }

  /**
   * Set mark.
   */

  if (type == 'set_mark') {
    var _properties = op.properties,
        mark = op.mark;

    return _extends({}, op, {
      mark: mark.merge(_properties),
      properties: (0, _pick2.default)(mark, Object.keys(_properties))
    });
  }

  /**
   * Set selection.
   */

  if (type == 'set_selection') {
    var _properties2 = op.properties,
        selection = op.selection;

    var inverse = _extends({}, op, {
      selection: _extends({}, selection, _properties2),
      properties: (0, _pick2.default)(selection, Object.keys(_properties2))
    });

    return inverse;
  }

  /**
   * Set value.
   */

  if (type == 'set_value') {
    var _properties3 = op.properties,
        value = op.value;

    return _extends({}, op, {
      value: value.merge(_properties3),
      properties: (0, _pick2.default)(value, Object.keys(_properties3))
    });
  }

  /**
   * Unknown.
   */

  throw new Error('Unknown op type: "' + type + '".');
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = invertOperation;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9vcGVyYXRpb25zL2ludmVydC5qcyJdLCJuYW1lcyI6WyJkZWJ1ZyIsImludmVydE9wZXJhdGlvbiIsIm9wIiwidHlwZSIsInBhdGgiLCJuZXdQYXRoIiwibGVuZ3RoIiwibGFzdCIsInNsaWNlIiwiY29uY2F0IiwicHJvcGVydGllcyIsIm5vZGUiLCJtZXJnZSIsIk9iamVjdCIsImtleXMiLCJtYXJrIiwic2VsZWN0aW9uIiwiaW52ZXJzZSIsInZhbHVlIiwiRXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQ0E7Ozs7QUFDQTs7Ozs7O0FBRUE7Ozs7OztBQU1BLElBQU1BLFFBQVEscUJBQU0sd0JBQU4sQ0FBZDs7QUFFQTs7Ozs7OztBQU9BLFNBQVNDLGVBQVQsQ0FBeUJDLEVBQXpCLEVBQTZCO0FBQUEsTUFDbkJDLElBRG1CLEdBQ1ZELEVBRFUsQ0FDbkJDLElBRG1COztBQUUzQkgsUUFBTUcsSUFBTixFQUFZRCxFQUFaOztBQUVBOzs7O0FBSUEsTUFBSUMsUUFBUSxhQUFaLEVBQTJCO0FBQ3pCLHdCQUNLRCxFQURMO0FBRUVDLFlBQU07QUFGUjtBQUlEOztBQUVEOzs7O0FBSUEsTUFBSUEsUUFBUSxhQUFaLEVBQTJCO0FBQ3pCLHdCQUNLRCxFQURMO0FBRUVDLFlBQU07QUFGUjtBQUlEOztBQUVEOzs7O0FBSUEsTUFBSUEsUUFBUSxXQUFaLEVBQXlCO0FBQ3ZCLHdCQUNLRCxFQURMO0FBRUVFLFlBQU1GLEdBQUdHLE9BRlg7QUFHRUEsZUFBU0gsR0FBR0U7QUFIZDtBQUtEOztBQUVEOzs7O0FBSUEsTUFBSUQsUUFBUSxZQUFaLEVBQTBCO0FBQUEsUUFDaEJDLElBRGdCLEdBQ1BGLEVBRE8sQ0FDaEJFLElBRGdCO0FBQUEsUUFFaEJFLE1BRmdCLEdBRUxGLElBRkssQ0FFaEJFLE1BRmdCOztBQUd4QixRQUFNQyxPQUFPRCxTQUFTLENBQXRCO0FBQ0Esd0JBQ0tKLEVBREw7QUFFRUMsWUFBTSxZQUZSO0FBR0VDLFlBQU1BLEtBQUtJ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YnVnJ1xuaW1wb3J0IHBpY2sgZnJvbSAnbG9kYXNoL3BpY2snXG5cbi8qKlxuICogRGVidWcuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmNvbnN0IGRlYnVnID0gRGVidWcoJ3NsYXRlOm9wZXJhdGlvbjppbnZlcnQnKVxuXG4vKipcbiAqIEludmVydCBhbiBgb3BgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcFxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGludmVydE9wZXJhdGlvbihvcCkge1xuICBjb25zdCB7IHR5cGUgfSA9IG9wXG4gIGRlYnVnKHR5cGUsIG9wKVxuXG4gIC8qKlxuICAgKiBJbnNlcnQgbm9kZS5cbiAgICovXG5cbiAgaWYgKHR5cGUgPT0gJ2luc2VydF9ub2RlJykge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5vcCxcbiAgICAgIHR5cGU6ICdyZW1vdmVfbm9kZScsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBub2RlLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAncmVtb3ZlX25vZGUnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLm9wLFxuICAgICAgdHlwZTogJ2luc2VydF9ub2RlJyxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogTW92ZSBub2RlLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnbW92ZV9ub2RlJykge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5vcCxcbiAgICAgIHBhdGg6IG9wLm5ld1BhdGgsXG4gICAgICBuZXdQYXRoOiBvcC5wYXRoLFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNZXJnZSBub2RlLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnbWVyZ2Vfbm9kZScpIHtcbiAgICBjb25zdCB7IHBhdGggfSA9IG9wXG4gICAgY29uc3QgeyBsZW5ndGggfSA9IHBhdGhcbiAgICBjb25zdCBsYXN0ID0gbGVuZ3RoIC0gMVxuICAgIHJldHVybiB7XG4gICAgICAuLi5vcCxcbiAgICAgIHR5cGU6ICdzcGxpdF9ub2RlJyxcbiAgICAgIHBhdGg6IHBhdGguc2xpY2UoMCwgbGFzdCkuY29uY2F0KFtwYXRoW2xhc3RdIC0gMV0pLFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTcGxpdCBub2RlLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnc3BsaXRfbm9kZScpIHtcbiAgICBjb25zdCB7IHBhdGggfSA9IG9wXG4gICAgY29uc3QgeyBsZW5ndGggfSA9IHBhdGhcbiAgICBjb25zdCBsYXN0ID0gbGVuZ3RoIC0gMVxuICAgIHJldHVybiB7XG4gICAgICAuLi5vcCxcbiAgICAgIHR5cGU6ICdtZXJnZV9ub2RlJyxcbiAgICAgIHBhdGg6IHBhdGguc2xpY2UoMCwgbGFzdCkuY29uY2F0KFtwYXRoW2xhc3RdICsgMV0pLFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgbm9kZS5cbiAgICovXG5cbiAgaWYgKHR5cGUgPT0gJ3NldF9ub2RlJykge1xuICAgIGNvbnN0IHsgcHJvcGVydGllcywgbm9kZSB9ID0gb3BcbiAgICByZXR1cm4ge1xuICAgICAgLi4ub3AsXG4gICAgICBub2RlOiBub2RlLm1lcmdlKHByb3BlcnRpZXMpLFxuICAgICAgcHJvcGVydGllczogcGljayhub2RlLCBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKSksXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEluc2VydCB0ZXh0LlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnaW5zZXJ0X3RleHQnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLm9wLFxuICAgICAgdHlwZTogJ3JlbW92ZV90ZXh0JyxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlIHRleHQuXG4gICAqL1xuXG4gIGlmICh0eXBlID09ICdyZW1vdmVfdGV4dCcpIHtcbiAgICByZXR1cm4ge1xuICAgICAgLi4ub3AsXG4gICAgICB0eXBlOiAnaW5zZXJ0X3RleHQnLFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgbWFyay5cbiAgICovXG5cbiAgaWYgKHR5cGUgPT0gJ2FkZF9tYXJrJykge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5vcCxcbiAgICAgIHR5cGU6ICdyZW1vdmVfbWFyaycsXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZSBtYXJrLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAncmVtb3ZlX21hcmsnKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLm9wLFxuICAgICAgdHlwZTogJ2FkZF9tYXJrJyxcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IG1hcmsuXG4gICAqL1xuXG4gIGlmICh0eXBlID09ICdzZXRfbWFyaycpIHtcbiAgICBjb25zdCB7IHByb3BlcnRpZXMsIG1hcmsgfSA9IG9wXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLm9wLFxuICAgICAgbWFyazogbWFyay5tZXJnZShwcm9wZXJ0aWVzKSxcbiAgICAgIHByb3BlcnRpZXM6IHBpY2sobWFyaywgT2JqZWN0LmtleXMocHJvcGVydGllcykpLFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgc2VsZWN0aW9uLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnc2V0X3NlbGVjdGlvbicpIHtcbiAgICBjb25zdCB7IHByb3BlcnRpZXMsIHNlbGVjdGlvbiB9ID0gb3BcbiAgICBjb25zdCBpbnZlcnNlID0ge1xuICAgICAgLi4ub3AsXG4gICAgICBzZWxlY3Rpb246IHsgLi4uc2VsZWN0aW9uLCAuLi5wcm9wZXJ0aWVzIH0sXG4gICAgICBwcm9wZXJ0aWVzOiBwaWNrKHNlbGVjdGlvbiwgT2JqZWN0LmtleXMocHJvcGVydGllcykpLFxuICAgIH1cblxuICAgIHJldHVybiBpbnZlcnNlXG4gIH1cblxuICAvKipcbiAgICogU2V0IHZhbHVlLlxuICAgKi9cblxuICBpZiAodHlwZSA9PSAnc2V0X3ZhbHVlJykge1xuICAgIGNvbnN0IHsgcHJvcGVydGllcywgdmFsdWUgfSA9IG9wXG4gICAgcmV0dXJuIHtcbiAgICAgIC4uLm9wLFxuICAgICAgdmFsdWU6IHZhbHVlLm1lcmdlKHByb3BlcnRpZXMpLFxuICAgICAgcHJvcGVydGllczogcGljayh2YWx1ZSwgT2JqZWN0LmtleXMocHJvcGVydGllcykpLFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBVbmtub3duLlxuICAgKi9cblxuICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gb3AgdHlwZTogXCIke3R5cGV9XCIuYClcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0Z1bmN0aW9ufVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IGludmVydE9wZXJhdGlvblxuIl19