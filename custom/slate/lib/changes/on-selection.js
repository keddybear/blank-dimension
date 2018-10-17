'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _isEmpty = require('is-empty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _pick = require('lodash/pick');

var _pick2 = _interopRequireDefault(_pick);

var _range = require('../models/range');

var _range2 = _interopRequireDefault(_range);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Set `properties` on the selection.
 *
 * @param {Change} change
 * @param {Object} properties
 */

Changes.select = function (change, properties) {
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  properties = _range2.default.createProperties(properties);

  var _options$snapshot = options.snapshot,
      snapshot = _options$snapshot === undefined ? false : _options$snapshot;
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var props = {};
  var sel = selection.toJSON();
  var next = selection.merge(properties).normalize(document);
  properties = (0, _pick2.default)(next, Object.keys(properties));

  // Remove any properties that are already equal to the current selection. And
  // create a dictionary of the previous values for all of the properties that
  // are being changed, for the inverse operation.
  for (var k in properties) {
    if (snapshot == false && properties[k] == sel[k]) continue;
    props[k] = properties[k];
  }

  // Resolve the selection keys into paths.
  sel.anchorPath = sel.anchorKey == null ? null : document.getPath(sel.anchorKey);
  delete sel.anchorKey;

  if (props.anchorKey) {
    props.anchorPath = props.anchorKey == null ? null : document.getPath(props.anchorKey);
    delete props.anchorKey;
  }

  sel.focusPath = sel.focusKey == null ? null : document.getPath(sel.focusKey);
  delete sel.focusKey;

  if (props.focusKey) {
    props.focusPath = props.focusKey == null ? null : document.getPath(props.focusKey);
    delete props.focusKey;
  }

  // If the selection moves, clear any marks, unless the new selection
  // properties change the marks in some way.
  var moved = ['anchorPath', 'anchorOffset', 'focusPath', 'focusOffset'].some(function (p) {
    return props.hasOwnProperty(p);
  });

  if (sel.marks && properties.marks == sel.marks && moved) {
    props.marks = null;
  }

  // If there are no new properties to set, abort.
  if ((0, _isEmpty2.default)(props)) {
    return;
  }

  // Apply the operation.
  change.applyOperation({
    type: 'set_selection',
    properties: props,
    selection: sel
  }, snapshot ? { skip: false, merge: false } : {});
};

/**
 * Select the whole document.
 *
 * @param {Change} change
 */

Changes.selectAll = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection;

  var next = selection.moveToRangeOf(document);
  change.select(next);
};

/**
 * Snapshot the current selection.
 *
 * @param {Change} change
 */

Changes.snapshotSelection = function (change) {
  var value = change.value;
  var selection = value.selection;

  change.select(selection, { snapshot: true });
};

/**
 * Move the anchor point backward, accounting for being at the start of a block.
 *
 * @param {Change} change
 */

Changes.moveAnchorCharBackward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      anchorText = value.anchorText,
      anchorBlock = value.anchorBlock;
  var anchorOffset = selection.anchorOffset;

  var previousText = document.getPreviousText(anchorText.key);
  var isInVoid = document.hasVoidParent(anchorText.key);
  var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);

  if (!isInVoid && anchorOffset > 0) {
    change.moveAnchor(-1);
    return;
  }

  if (!previousText) {
    return;
  }

  change.moveAnchorToEndOf(previousText);

  if (!isInVoid && !isPreviousInVoid && anchorBlock.hasNode(previousText.key)) {
    change.moveAnchor(-1);
  }
};

/**
 * Move the anchor point forward, accounting for being at the end of a block.
 *
 * @param {Change} change
 */

Changes.moveAnchorCharForward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      anchorText = value.anchorText,
      anchorBlock = value.anchorBlock;
  var anchorOffset = selection.anchorOffset;

  var nextText = document.getNextText(anchorText.key);
  var isInVoid = document.hasVoidParent(anchorText.key);
  var isNextInVoid = nextText && document.hasVoidParent(nextText.key);

  if (!isInVoid && anchorOffset < anchorText.text.length) {
    change.moveAnchor(1);
    return;
  }

  if (!nextText) {
    return;
  }

  change.moveAnchorToStartOf(nextText);

  if (!isInVoid && !isNextInVoid && anchorBlock.hasNode(nextText.key)) {
    change.moveAnchor(1);
  }
};

/**
 * Move the focus point backward, accounting for being at the start of a block.
 *
 * @param {Change} change
 */

Changes.moveFocusCharBackward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      focusText = value.focusText,
      focusBlock = value.focusBlock;
  var focusOffset = selection.focusOffset;

  var previousText = document.getPreviousText(focusText.key);
  var isInVoid = document.hasVoidParent(focusText.key);
  var isPreviousInVoid = previousText && document.hasVoidParent(previousText.key);

  if (!isInVoid && focusOffset > 0) {
    change.moveFocus(-1);
    return;
  }

  if (!previousText) {
    return;
  }

  change.moveFocusToEndOf(previousText);

  if (!isInVoid && !isPreviousInVoid && focusBlock.hasNode(previousText.key)) {
    change.moveFocus(-1);
  }
};

/**
 * Move the focus point forward, accounting for being at the end of a block.
 *
 * @param {Change} change
 */

Changes.moveFocusCharForward = function (change) {
  var value = change.value;
  var document = value.document,
      selection = value.selection,
      focusText = value.focusText,
      focusBlock = value.focusBlock;
  var focusOffset = selection.focusOffset;

  var nextText = document.getNextText(focusText.key);
  var isInVoid = document.hasVoidParent(focusText.key);
  var isNextInVoid = nextText && document.hasVoidParent(nextText.key);

  if (!isInVoid && focusOffset < focusText.text.length) {
    change.moveFocus(1);
    return;
  }

  if (!nextText) {
    return;
  }

  change.moveFocusToStartOf(nextText);

  if (!isInVoid && !isNextInVoid && focusBlock.hasNode(nextText.key)) {
    change.moveFocus(1);
  }
};

/**
 * Mix in move methods.
 */

var MOVE_DIRECTIONS = ['Forward', 'Backward'];

MOVE_DIRECTIONS.forEach(function (direction) {
  var anchor = 'moveAnchorChar' + direction;
  var focus = 'moveFocusChar' + direction;

  Changes['moveChar' + direction] = function (change) {
    change[anchor]()[focus]();
  };

  Changes['moveStartChar' + direction] = function (change) {
    if (change.value.isBackward) {
      change[focus]();
    } else {
      change[anchor]();
    }
  };

  Changes['moveEndChar' + direction] = function (change) {
    if (change.value.isBackward) {
      change[anchor]();
    } else {
      change[focus]();
    }
  };

  Changes['extendChar' + direction] = function (change) {
    change['moveFocusChar' + direction]();
  };

  Changes['collapseChar' + direction] = function (change) {
    var collapse = direction == 'Forward' ? 'collapseToEnd' : 'collapseToStart';
    change[collapse]()['moveChar' + direction]();
  };
});

/**
 * Mix in alias methods.
 */

var ALIAS_METHODS = [['collapseLineBackward', 'collapseToStartOfBlock'], ['collapseLineForward', 'collapseToEndOfBlock'], ['extendLineBackward', 'extendToStartOfBlock'], ['extendLineForward', 'extendToEndOfBlock']];

ALIAS_METHODS.forEach(function (_ref) {
  var _ref2 = _slicedToArray(_ref, 2),
      alias = _ref2[0],
      method = _ref2[1];

  Changes[alias] = function (change) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    change[method].apply(change, [change].concat(args));
  };
});

/**
 * Mix in selection changes that are just a proxy for the selection method.
 */

var PROXY_TRANSFORMS = ['blur', 'collapseTo', 'collapseToAnchor', 'collapseToEnd', 'collapseToEndOf', 'collapseToFocus', 'collapseToStart', 'collapseToStartOf', 'extend', 'extendTo', 'extendToEndOf', 'extendToStartOf', 'flip', 'focus', 'move', 'moveAnchor', 'moveAnchorOffsetTo', 'moveAnchorTo', 'moveAnchorToEndOf', 'moveAnchorToStartOf', 'moveEnd', 'moveEndOffsetTo', 'moveEndTo', 'moveFocus', 'moveFocusOffsetTo', 'moveFocusTo', 'moveFocusToEndOf', 'moveFocusToStartOf', 'moveOffsetsTo', 'moveStart', 'moveStartOffsetTo', 'moveStartTo', 'moveTo', 'moveToEnd', 'moveToEndOf', 'moveToRangeOf', 'moveToStart', 'moveToStartOf', 'deselect'];

PROXY_TRANSFORMS.forEach(function (method) {
  Changes[method] = function (change) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    var normalize = method != 'deselect';
    var value = change.value;
    var document = value.document,
        selection = value.selection;

    var next = selection[method].apply(selection, args);
    if (normalize) next = next.normalize(document);
    change.select(next);
  };
});

/**
 * Mix in node-related changes.
 */

var PREFIXES = ['moveTo', 'moveAnchorTo', 'moveFocusTo', 'moveStartTo', 'moveEndTo', 'collapseTo', 'extendTo'];

var DIRECTIONS = ['Next', 'Previous'];

var KINDS = ['Block', 'Inline', 'Text'];

PREFIXES.forEach(function (prefix) {
  var edges = ['Start', 'End'];

  if (prefix == 'moveTo') {
    edges.push('Range');
  }

  edges.forEach(function (edge) {
    var method = '' + prefix + edge + 'Of';

    KINDS.forEach(function (kind) {
      var getNode = kind == 'Text' ? 'getNode' : 'getClosest' + kind;

      Changes['' + method + kind] = function (change) {
        var value = change.value;
        var document = value.document,
            selection = value.selection;

        var node = document[getNode](selection.startKey);
        if (!node) return;
        change[method](node);
      };

      DIRECTIONS.forEach(function (direction) {
        var getDirectionNode = 'get' + direction + kind;
        var directionKey = direction == 'Next' ? 'startKey' : 'endKey';

        Changes['' + method + direction + kind] = function (change) {
          var value = change.value;
          var document = value.document,
              selection = value.selection;

          var node = document[getNode](selection[directionKey]);
          if (!node) return;
          var target = document[getDirectionNode](node.key);
          if (!target) return;
          change[method](target);
        };
      });
    });
  });
});

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL29uLXNlbGVjdGlvbi5qcyJdLCJuYW1lcyI6WyJDaGFuZ2VzIiwic2VsZWN0IiwiY2hhbmdlIiwicHJvcGVydGllcyIsIm9wdGlvbnMiLCJjcmVhdGVQcm9wZXJ0aWVzIiwic25hcHNob3QiLCJ2YWx1ZSIsImRvY3VtZW50Iiwic2VsZWN0aW9uIiwicHJvcHMiLCJzZWwiLCJ0b0pTT04iLCJuZXh0IiwibWVyZ2UiLCJub3JtYWxpemUiLCJPYmplY3QiLCJrZXlzIiwiayIsImFuY2hvclBhdGgiLCJhbmNob3JLZXkiLCJnZXRQYXRoIiwiZm9jdXNQYXRoIiwiZm9jdXNLZXkiLCJtb3ZlZCIsInNvbWUiLCJoYXNPd25Qcm9wZXJ0eSIsInAiLCJtYXJrcyIsImFwcGx5T3BlcmF0aW9uIiwidHlwZSIsInNraXAiLCJzZWxlY3RBbGwiLCJtb3ZlVG9SYW5nZU9mIiwic25hcHNob3RTZWxlY3Rpb24iLCJtb3ZlQW5jaG9yQ2hhckJhY2t3YXJkIiwiYW5jaG9yVGV4dCIsImFuY2hvckJsb2NrIiwiYW5jaG9yT2Zmc2V0IiwicHJldmlvdXNUZXh0IiwiZ2V0UHJldmlvdXNUZXh0Iiwia2V5IiwiaXNJblZvaWQiLCJoYXNWb2lkUGFyZW50IiwiaXNQcmV2aW91c0luVm9pZCIsIm1vdmVBbmNob3IiLCJtb3ZlQW5jaG9yVG9FbmRPZiIsImhhc05vZGUiLCJtb3ZlQW5jaG9yQ2hhckZvcndhcmQiLCJuZXh0VGV4dCIsImdldE5leHRUZXh0IiwiaXNOZXh0SW5Wb2lkIiwidGV4dCIsImxlbmd0aCIsIm1vdmVBbmNob3JUb1N0YXJ0T2YiLCJtb3ZlRm9jdXNDaGFyQmFja3dhcmQiLCJmb2N1c1RleHQiLCJmb2N1c0Jsb2NrIiwiZm9jdXNPZmZzZXQiLCJtb3ZlRm9jdXMiLCJtb3ZlRm9jdXNUb0VuZE9mIiwibW92ZUZvY3VzQ2hhckZvcndhcmQiLCJtb3ZlRm9jdXNUb1N0YXJ0T2YiLCJNT1ZFX0RJUkVDVElPTlMiLCJmb3JFYWNoIiwiZGlyZWN0aW9uIiwiYW5jaG9yIiwiZm9jdXMiLCJpc0JhY2t3YXJkIiwiY29sbGFwc2UiLCJBTElBU19NRVRIT0RTIiwiYWxpYXMiLCJtZXRob2QiLCJhcmdzIiwiUFJPWFlfVFJBTlNGT1JNUyIsIlBSRUZJWEVTIiwiRElSRUNUSU9OUyIsIktJTkRTIiwicHJlZml4IiwiZWRnZXMiLCJwdXNoIiwiZWRnZSIsImtpbmQiLCJnZXROb2RlIiwibm9kZSIsInN0YXJ0S2V5IiwiZ2V0RGlyZWN0aW9uTm9kZSIsImRpcmVjdGlvbktleSIsInRhcmdldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUVBOzs7Ozs7QUFNQSxJQUFNQSxVQUFVLEVBQWhCOztBQUVBOzs7Ozs7O0FBT0FBLFFBQVFDLE1BQVIsR0FBaUIsVUFBQ0MsTUFBRCxFQUFTQyxVQUFULEVBQXNDO0FBQUEsTUFBakJDLE9BQWlCLHVFQUFQLEVBQU87O0FBQ3JERCxlQUFhLGdCQUFNRSxnQkFBTixDQUF1QkYsVUFBdkIsQ0FBYjs7QUFEcUQsMEJBR3hCQyxPQUh3QixDQUc3Q0UsUUFINkM7QUFBQSxNQUc3Q0EsUUFINkMscUNBR2xDLEtBSGtDO0FBQUEsTUFJN0NDLEtBSjZDLEdBSW5DTCxNQUptQyxDQUk3Q0ssS0FKNkM7QUFBQSxNQUs3Q0MsUUFMNkMsR0FLckJELEtBTHFCLENBSzdDQyxRQUw2QztBQUFBLE1BS25DQyxTQUxtQyxHQUtyQkYsS0FMcUIsQ0FLbkNFLFNBTG1DOztBQU1yRCxNQUFNQyxRQUFRLEVBQWQ7QUFDQSxNQUFNQyxNQUFNRixVQUFVRyxNQUFWLEVBQVo7QUFDQSxNQUFNQyxPQUFPSixVQUFVSyxLQUFWLENBQWdCWCxVQUFoQixFQUE0QlksU0FBNUIsQ0FBc0NQLFFBQXRDLENBQWI7QUFDQUwsZUFBYSxvQkFBS1UsSUFBTCxFQUFXRyxPQUFPQyxJQUFQLENBQVlkLFVBQVosQ0FBWCxDQUFiOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQUssSUFBTWUsQ0FBWCxJQUFnQmYsVUFBaEIs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RXBCRCxLQUZvQixDQUU1Q0MsUUFGNEM7QUFBQSxjQUVsQ0MsU0FGa0MsR0FFcEJGLEtBRm9CLENBRWxDRSxTQUZrQzs7QUFHcEQsY0FBTTJFLE9BQU81RSxTQUFTMkUsT0FBVCxFQUFrQjFFLFVBQVU4RSxZQUFWLENBQWxCLENBQWI7QUFDQSxjQUFJLENBQUNILElBQUwsRUFBVztBQUNYLGNBQU1JLFNBQVNoRixTQUFTOEUsZ0JBQVQsRUFBMkJGLEtBQUszQyxHQUFoQyxDQUFmO0FBQ0EsY0FBSSxDQUFDK0MsTUFBTCxFQUFhO0FBQ2J0RixpQkFBT3NFLE1BQVAsRUFBZWdCLE1BQWY7QUFDRCxTQVJEO0FBU0QsT0FiRDtBQWNELEtBekJEO0FBMEJELEdBN0JEO0FBOEJELENBeENEOztBQTBDQTs7Ozs7O2tCQU1leEYsTyIsImZpbGUiOiJvbi1zZWxlY3Rpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmltcG9ydCBpc0VtcHR5IGZyb20gJ2lzLWVtcHR5J1xuaW1wb3J0IHBpY2sgZnJvbSAnbG9kYXNoL3BpY2snXG5cbmltcG9ydCBSYW5nZSBmcm9tICcuLi9tb2RlbHMvcmFuZ2UnXG5cbi8qKlxuICogQ2hhbmdlcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IENoYW5nZXMgPSB7fVxuXG4vKipcbiAqIFNldCBgcHJvcGVydGllc2Agb24gdGhlIHNlbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge09iamVjdH0gcHJvcGVydGllc1xuICovXG5cbkNoYW5nZXMuc2VsZWN0ID0gKGNoYW5nZSwgcHJvcGVydGllcywgb3B0aW9ucyA9IHt9KSA9PiB7XG4gIHByb3BlcnRpZXMgPSBSYW5nZS5jcmVhdGVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG5cbiAgY29uc3QgeyBzbmFwc2hvdCA9IGZhbHNlIH0gPSBvcHRpb25zXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gIGNvbnN0IHByb3BzID0ge31cbiAgY29uc3Qgc2VsID0gc2VsZWN0aW9uLnRvSlNPTigpXG4gIGNvbnN0IG5leHQgPSBzZWxlY3Rpb24ubWVyZ2UocHJvcGVydGllcykubm9ybWFsaXplKGRvY3VtZW50KVxuICBwcm9wZXJ0aWVzID0gcGljayhuZXh0LCBPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKSlcblxuICAvLyBSZW1vdmUgYW55IHByb3BlcnRpZXMgdGhhdCBhcmUgYWxyZWFkeSBlcXVhbCB0byB0aGUgY3VycmVudCBzZWxlY3Rpb24uIEFuZFxuICAvLyBjcmVhdGUgYSBkaWN0aW9uYXJ5IG9mIHRoZSBwcmV2aW91cyB2YWx1ZXMgZm9yIGFsbCBvZiB0aGUgcHJvcGVydGllcyB0aGF0XG4gIC8vIGFyZSBiZWluZyBjaGFuZ2VkLCBmb3IgdGhlIGludmVyc2Ugb3BlcmF0aW9uLlxuICBmb3IgKGNvbnN0IGsgaW4gcHJvcGVydGllcykge1xuICAgIGlmIChzbmFwc2hvdCA9PSBmYWxzZSAmJiBwcm9wZXJ0aWVzW2tdID09IHNlbFtrXSkgY29udGludWVcbiAgICBwcm9wc1trXSA9IHByb3BlcnRpZXNba11cbiAgfVxuXG4gIC8vIFJlc29sdmUgdGhlIHNlbGVjdGlvbiBrZXlzIGludG8gcGF0aHMuXG4gIHNlbC5hbmNob3JQYXRoID0gc2VsLmFuY2hvcktleSA9PSBudWxsID8gbnVsbCA6IGRvY3VtZW50LmdldFBhdGgoc2VsLmFuY2hvcktleSlcbiAgZGVsZXRlIHNlbC5hbmNob3JLZXlcblxuICBpZiAocHJvcHMuYW5jaG9yS2V5KSB7XG4gICAgcHJvcHMuYW5jaG9yUGF0aCA9IHByb3BzLmFuY2hvcktleSA9PSBudWxsID8gbnVsbCA6IGRvY3VtZW50LmdldFBhdGgocHJvcHMuYW5jaG9yS2V5KVxuICAgIGRlbGV0ZSBwcm9wcy5hbmNob3JLZXlcbiAgfVxuXG4gIHNlbC5mb2N1c1BhdGggPSBzZWwuZm9jdXNLZXkgPT0gbnVsbCA/IG51bGwgOiBkb2N1bWVudC5nZXRQYXRoKHNlbC5mb2N1c0tleSlcbiAgZGVsZXRlIHNlbC5mb2N1c0tleVxuXG4gIGlmIChwcm9wcy5mb2N1c0tleSkge1xuICAgIHByb3BzLmZvY3VzUGF0aCA9IHByb3BzLmZvY3VzS2V5ID09IG51bGwgPyBudWxsIDogZG9jdW1lbnQuZ2V0UGF0aChwcm9wcy5mb2N1c0tleSlcbiAgICBkZWxldGUgcHJvcHMuZm9jdXNLZXlcbiAgfVxuXG4gIC8vIElmIHRoZSBzZWxlY3Rpb24gbW92ZXMsIGNsZWFyIGFueSBtYXJrcywgdW5sZXNzIHRoZSBuZXcgc2VsZWN0aW9uXG4gIC8vIHByb3BlcnRpZXMgY2hhbmdlIHRoZSBtYXJrcyBpbiBzb21lIHdheS5cbiAgY29uc3QgbW92ZWQgPSBbXG4gICAgJ2FuY2hvclBhdGgnLFxuICAgICdhbmNob3JPZmZzZXQnLFxuICAgICdmb2N1c1BhdGgnLFxuICAgICdmb2N1c09mZnNldCcsXG4gIF0uc29tZShwID0+IHByb3BzLmhhc093blByb3BlcnR5KHApKVxuXG4gIGlmIChzZWwubWFya3MgJiYgcHJvcGVydGllcy5tYXJrcyA9PSBzZWwubWFya3MgJiYgbW92ZWQpIHtcbiAgICBwcm9wcy5tYXJrcyA9IG51bGxcbiAgfVxuXG4gIC8vIElmIHRoZXJlIGFyZSBubyBuZXcgcHJvcGVydGllcyB0byBzZXQsIGFib3J0LlxuICBpZiAoaXNFbXB0eShwcm9wcykpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIC8vIEFwcGx5IHRoZSBvcGVyYXRpb24uXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ3NldF9zZWxlY3Rpb24nLFxuICAgIHByb3BlcnRpZXM6IHByb3BzLFxuICAgIHNlbGVjdGlvbjogc2VsLFxuICB9LCBzbmFwc2hvdCA/IHsgc2tpcDogZmFsc2UsIG1lcmdlOiBmYWxzZSB9IDoge30pXG59XG5cbi8qKlxuICogU2VsZWN0IHRoZSB3aG9sZSBkb2N1bWVudC5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKi9cblxuQ2hhbmdlcy5zZWxlY3RBbGwgPSAoY2hhbmdlKSA9PiB7XG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICBjb25zdCB7IGRvY3VtZW50LCBzZWxlY3Rpb24gfSA9IHZhbHVlXG4gIGNvbnN0IG5leHQgPSBzZWxlY3Rpb24ubW92ZVRvUmFuZ2VPZihkb2N1bWVudClcbiAgY2hhbmdlLnNlbGVjdChuZXh0KVxufVxuXG4vKipcbiAqIFNuYXBzaG90IHRoZSBjdXJyZW50IHNlbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKi9cblxuQ2hhbmdlcy5zbmFwc2hvdFNlbGVjdGlvbiA9IChjaGFuZ2UpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgc2VsZWN0aW9uIH0gPSB2YWx1ZVxuICBjaGFuZ2Uuc2VsZWN0KHNlbGVjdGlvbiwgeyBzbmFwc2hvdDogdHJ1ZSB9KVxufVxuXG4vKipcbiAqIE1vdmUgdGhlIGFuY2hvciBwb2ludCBiYWNrd2FyZCwgYWNjb3VudGluZyBmb3IgYmVpbmcgYXQgdGhlIHN0YXJ0IG9mIGEgYmxvY2suXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICovXG5cbkNoYW5nZXMubW92ZUFuY2hvckNoYXJCYWNrd2FyZCA9IChjaGFuZ2UpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQsIHNlbGVjdGlvbiwgYW5jaG9yVGV4dCwgYW5jaG9yQmxvY2sgfSA9IHZhbHVlXG4gIGNvbnN0IHsgYW5jaG9yT2Zmc2V0IH0gPSBzZWxlY3Rpb25cbiAgY29uc3QgcHJldmlvdXNUZXh0ID0gZG9jdW1lbnQuZ2V0UHJldmlvdXNUZXh0KGFuY2hvclRleHQua2V5KVxuICBjb25zdCBpc0luVm9pZCA9IGRvY3VtZW50Lmhhc1ZvaWRQYXJlbnQoYW5jaG9yVGV4dC5rZXkpXG4gIGNvbnN0IGlzUHJldmlvdXNJblZvaWQgPSBwcmV2aW91c1RleHQgJiYgZG9jdW1lbnQuaGFzVm9pZFBhcmVudChwcmV2aW91c1RleHQua2V5KVxuXG4gIGlmICghaXNJblZvaWQgJiYgYW5jaG9yT2Zmc2V0ID4gMCkge1xuICAgIGNoYW5nZS5tb3ZlQW5jaG9yKC0xKVxuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKCFwcmV2aW91c1RleHQpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGNoYW5nZS5tb3ZlQW5jaG9yVG9FbmRPZihwcmV2aW91c1RleHQpXG5cbiAgaWYgKCFpc0luVm9pZCAmJiAhaXNQcmV2aW91c0luVm9pZCAmJiBhbmNob3JCbG9jay5oYXNOb2RlKHByZXZpb3VzVGV4dC5rZXkpKSB7XG4gICAgY2hhbmdlLm1vdmVBbmNob3IoLTEpXG4gIH1cbn1cblxuLyoqXG4gKiBNb3ZlIHRoZSBhbmNob3IgcG9pbnQgZm9yd2FyZCwgYWNjb3VudGluZyBmb3IgYmVpbmcgYXQgdGhlIGVuZCBvZiBhIGJsb2NrLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqL1xuXG5DaGFuZ2VzLm1vdmVBbmNob3JDaGFyRm9yd2FyZCA9IChjaGFuZ2UpID0+IHtcbiAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gIGNvbnN0IHsgZG9jdW1lbnQsIHNlbGVjdGlvbiwgYW5jaG9yVGV4dCwgYW5jaG9yQmxvY2sgfSA9IHZhbHVlXG4gIGNvbnN0IHsgYW5jaG9yT2Zmc2V0IH0gPSBzZWxlY3Rpb25cbiAgY29uc3QgbmV4dFRleHQgPSBkb2N1bWVudC5nZXROZXh0VGV4dChhbmNob3JUZXh0LmtleSlcbiAgY29uc3QgaXNJblZvaWQgPSBkb2N1bWVudC5oYXNWb2lkUGFyZW50KGFuY2hvclRleHQua2V5KVxuICBjb25zdCBpc05leHRJblZvaWQgPSBuZXh0VGV4dCAmJiBkb2N1bWVudC5oYXNWb2lkUGFyZW50KG5leHRUZXh0LmtleSlcblxuICBpZiAoIWlzSW5Wb2lkICYmIGFuY2hvck9mZnNldCA8IGFuY2hvclRleHQudGV4dC5sZW5ndGgpIHtcbiAgICBjaGFuZ2UubW92ZUFuY2hvcigxKVxuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKCFuZXh0VGV4dCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgY2hhbmdlLm1vdmVBbmNob3JUb1N0YXJ0T2YobmV4dFRleHQpXG5cbiAgaWYgKCFpc0luVm9pZCAmJiAhaXNOZXh0SW5Wb2lkICYmIGFuY2hvckJsb2NrLmhhc05vZGUobmV4dFRleHQua2V5KSkge1xuICAgIGNoYW5nZS5tb3ZlQW5jaG9yKDEpXG4gIH1cbn1cblxuLyoqXG4gKiBNb3ZlIHRoZSBmb2N1cyBwb2ludCBiYWNrd2FyZCwgYWNjb3VudGluZyBmb3IgYmVpbmcgYXQgdGhlIHN0YXJ0IG9mIGEgYmxvY2suXG4gKlxuICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICovXG5cbkNoYW5nZXMubW92ZUZvY3VzQ2hhckJhY2t3YXJkID0gKGNoYW5nZSkgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCwgc2VsZWN0aW9uLCBmb2N1c1RleHQsIGZvY3VzQmxvY2sgfSA9IHZhbHVlXG4gIGNvbnN0IHsgZm9jdXNPZmZzZXQgfSA9IHNlbGVjdGlvblxuICBjb25zdCBwcmV2aW91c1RleHQgPSBkb2N1bWVudC5nZXRQcmV2aW91c1RleHQoZm9jdXNUZXh0LmtleSlcbiAgY29uc3QgaXNJblZvaWQgPSBkb2N1bWVudC5oYXNWb2lkUGFyZW50KGZvY3VzVGV4dC5rZXkpXG4gIGNvbnN0IGlzUHJldmlvdXNJblZvaWQgPSBwcmV2aW91c1RleHQgJiYgZG9jdW1lbnQuaGFzVm9pZFBhcmVudChwcmV2aW91c1RleHQua2V5KVxuXG4gIGlmICghaXNJblZvaWQgJiYgZm9jdXNPZmZzZXQgPiAwKSB7XG4gICAgY2hhbmdlLm1vdmVGb2N1cygtMSlcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmICghcHJldmlvdXNUZXh0KSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBjaGFuZ2UubW92ZUZvY3VzVG9FbmRPZihwcmV2aW91c1RleHQpXG5cbiAgaWYgKCFpc0luVm9pZCAmJiAhaXNQcmV2aW91c0luVm9pZCAmJiBmb2N1c0Jsb2NrLmhhc05vZGUocHJldmlvdXNUZXh0LmtleSkpIHtcbiAgICBjaGFuZ2UubW92ZUZvY3VzKC0xKVxuICB9XG59XG5cbi8qKlxuICogTW92ZSB0aGUgZm9jdXMgcG9pbnQgZm9yd2FyZCwgYWNjb3VudGluZyBmb3IgYmVpbmcgYXQgdGhlIGVuZCBvZiBhIGJsb2NrLlxuICpcbiAqIEBwYXJhbSB7Q2hhbmdlfSBjaGFuZ2VcbiAqL1xuXG5DaGFuZ2VzLm1vdmVGb2N1c0NoYXJGb3J3YXJkID0gKGNoYW5nZSkgPT4ge1xuICBjb25zdCB7IHZhbHVlIH0gPSBjaGFuZ2VcbiAgY29uc3QgeyBkb2N1bWVudCwgc2VsZWN0aW9uLCBmb2N1c1RleHQsIGZvY3VzQmxvY2sgfSA9IHZhbHVlXG4gIGNvbnN0IHsgZm9jdXNPZmZzZXQgfSA9IHNlbGVjdGlvblxuICBjb25zdCBuZXh0VGV4dCA9IGRvY3VtZW50LmdldE5leHRUZXh0KGZvY3VzVGV4dC5rZXkpXG4gIGNvbnN0IGlzSW5Wb2lkID0gZG9jdW1lbnQuaGFzVm9pZFBhcmVudChmb2N1c1RleHQua2V5KVxuICBjb25zdCBpc05leHRJblZvaWQgPSBuZXh0VGV4dCAmJiBkb2N1bWVudC5oYXNWb2lkUGFyZW50KG5leHRUZXh0LmtleSlcblxuICBpZiAoIWlzSW5Wb2lkICYmIGZvY3VzT2Zmc2V0IDwgZm9jdXNUZXh0LnRleHQubGVuZ3RoKSB7XG4gICAgY2hhbmdlLm1vdmVGb2N1cygxKVxuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKCFuZXh0VGV4dCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgY2hhbmdlLm1vdmVGb2N1c1RvU3RhcnRPZihuZXh0VGV4dClcblxuICBpZiAoIWlzSW5Wb2lkICYmICFpc05leHRJblZvaWQgJiYgZm9jdXNCbG9jay5oYXNOb2RlKG5leHRUZXh0LmtleSkpIHtcbiAgICBjaGFuZ2UubW92ZUZvY3VzKDEpXG4gIH1cbn1cblxuLyoqXG4gKiBNaXggaW4gbW92ZSBtZXRob2RzLlxuICovXG5cbmNvbnN0IE1PVkVfRElSRUNUSU9OUyA9IFtcbiAgJ0ZvcndhcmQnLFxuICAnQmFja3dhcmQnLFxuXVxuXG5NT1ZFX0RJUkVDVElPTlMuZm9yRWFjaCgoZGlyZWN0aW9uKSA9PiB7XG4gIGNvbnN0IGFuY2hvciA9IGBtb3ZlQW5jaG9yQ2hhciR7ZGlyZWN0aW9ufWBcbiAgY29uc3QgZm9jdXMgPSBgbW92ZUZvY3VzQ2hhciR7ZGlyZWN0aW9ufWBcblxuICBDaGFuZ2VzW2Btb3ZlQ2hhciR7ZGlyZWN0aW9ufWBdID0gKGNoYW5nZSkgPT4ge1xuICAgIGNoYW5nZVthbmNob3JdKClbZm9jdXNdKClcbiAgfVxuXG4gIENoYW5nZXNbYG1vdmVTdGFydENoYXIke2RpcmVjdGlvbn1gXSA9IChjaGFuZ2UpID0+IHtcbiAgICBpZiAoY2hhbmdlLnZhbHVlLmlzQmFja3dhcmQpIHtcbiAgICAgIGNoYW5nZVtmb2N1c10oKVxuICAgIH0gZWxzZSB7XG4gICAgICBjaGFuZ2VbYW5jaG9yXSgpXG4gICAgfVxuICB9XG5cbiAgQ2hhbmdlc1tgbW92ZUVuZENoYXIke2RpcmVjdGlvbn1gXSA9IChjaGFuZ2UpID0+IHtcbiAgICBpZiAoY2hhbmdlLnZhbHVlLmlzQmFja3dhcmQpIHtcbiAgICAgIGNoYW5nZVthbmNob3JdKClcbiAgICB9IGVsc2Uge1xuICAgICAgY2hhbmdlW2ZvY3VzXSgpXG4gICAgfVxuICB9XG5cbiAgQ2hhbmdlc1tgZXh0ZW5kQ2hhciR7ZGlyZWN0aW9ufWBdID0gKGNoYW5nZSkgPT4ge1xuICAgIGNoYW5nZVtgbW92ZUZvY3VzQ2hhciR7ZGlyZWN0aW9ufWBdKClcbiAgfVxuXG4gIENoYW5nZXNbYGNvbGxhcHNlQ2hhciR7ZGlyZWN0aW9ufWBdID0gKGNoYW5nZSkgPT4ge1xuICAgIGNvbnN0IGNvbGxhcHNlID0gZGlyZWN0aW9uID09ICdGb3J3YXJkJyA/ICdjb2xsYXBzZVRvRW5kJyA6ICdjb2xsYXBzZVRvU3RhcnQnXG4gICAgY2hhbmdlW2NvbGxhcHNlXSgpW2Btb3ZlQ2hhciR7ZGlyZWN0aW9ufWBdKClcbiAgfVxufSlcblxuLyoqXG4gKiBNaXggaW4gYWxpYXMgbWV0aG9kcy5cbiAqL1xuXG5jb25zdCBBTElBU19NRVRIT0RTID0gW1xuICBbJ2NvbGxhcHNlTGluZUJhY2t3YXJkJywgJ2NvbGxhcHNlVG9TdGFydE9mQmxvY2snXSxcbiAgWydjb2xsYXBzZUxpbmVGb3J3YXJkJywgJ2NvbGxhcHNlVG9FbmRPZkJsb2NrJ10sXG4gIFsnZXh0ZW5kTGluZUJhY2t3YXJkJywgJ2V4dGVuZFRvU3RhcnRPZkJsb2NrJ10sXG4gIFsnZXh0ZW5kTGluZUZvcndhcmQnLCAnZXh0ZW5kVG9FbmRPZkJsb2NrJ10sXG5dXG5cbkFMSUFTX01FVEhPRFMuZm9yRWFjaCgoWyBhbGlhcywgbWV0aG9kIF0pID0+IHtcbiAgQ2hhbmdlc1thbGlhc10gPSBmdW5jdGlvbiAoY2hhbmdlLCAuLi5hcmdzKSB7XG4gICAgY2hhbmdlW21ldGhvZF0oY2hhbmdlLCAuLi5hcmdzKVxuICB9XG59KVxuXG4vKipcbiAqIE1peCBpbiBzZWxlY3Rpb24gY2hhbmdlcyB0aGF0IGFyZSBqdXN0IGEgcHJveHkgZm9yIHRoZSBzZWxlY3Rpb24gbWV0aG9kLlxuICovXG5cbmNvbnN0IFBST1hZX1RSQU5TRk9STVMgPSBbXG4gICdibHVyJyxcbiAgJ2NvbGxhcHNlVG8nLFxuICAnY29sbGFwc2VUb0FuY2hvcicsXG4gICdjb2xsYXBzZVRvRW5kJyxcbiAgJ2NvbGxhcHNlVG9FbmRPZicsXG4gICdjb2xsYXBzZVRvRm9jdXMnLFxuICAnY29sbGFwc2VUb1N0YXJ0JyxcbiAgJ2NvbGxhcHNlVG9TdGFydE9mJyxcbiAgJ2V4dGVuZCcsXG4gICdleHRlbmRUbycsXG4gICdleHRlbmRUb0VuZE9mJyxcbiAgJ2V4dGVuZFRvU3RhcnRPZicsXG4gICdmbGlwJyxcbiAgJ2ZvY3VzJyxcbiAgJ21vdmUnLFxuICAnbW92ZUFuY2hvcicsXG4gICdtb3ZlQW5jaG9yT2Zmc2V0VG8nLFxuICAnbW92ZUFuY2hvclRvJyxcbiAgJ21vdmVBbmNob3JUb0VuZE9mJyxcbiAgJ21vdmVBbmNob3JUb1N0YXJ0T2YnLFxuICAnbW92ZUVuZCcsXG4gICdtb3ZlRW5kT2Zmc2V0VG8nLFxuICAnbW92ZUVuZFRvJyxcbiAgJ21vdmVGb2N1cycsXG4gICdtb3ZlRm9jdXNPZmZzZXRUbycsXG4gICdtb3ZlRm9jdXNUbycsXG4gICdtb3ZlRm9jdXNUb0VuZE9mJyxcbiAgJ21vdmVGb2N1c1RvU3RhcnRPZicsXG4gICdtb3ZlT2Zmc2V0c1RvJyxcbiAgJ21vdmVTdGFydCcsXG4gICdtb3ZlU3RhcnRPZmZzZXRUbycsXG4gICdtb3ZlU3RhcnRUbycsXG4gICdtb3ZlVG8nLFxuICAnbW92ZVRvRW5kJyxcbiAgJ21vdmVUb0VuZE9mJyxcbiAgJ21vdmVUb1JhbmdlT2YnLFxuICAnbW92ZVRvU3RhcnQnLFxuICAnbW92ZVRvU3RhcnRPZicsXG4gICdkZXNlbGVjdCcsXG5dXG5cblBST1hZX1RSQU5TRk9STVMuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gIENoYW5nZXNbbWV0aG9kXSA9IChjaGFuZ2UsIC4uLmFyZ3MpID0+IHtcbiAgICBjb25zdCBub3JtYWxpemUgPSBtZXRob2QgIT0gJ2Rlc2VsZWN0J1xuICAgIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICAgIGNvbnN0IHsgZG9jdW1lbnQsIHNlbGVjdGlvbiB9ID0gdmFsdWVcbiAgICBsZXQgbmV4dCA9IHNlbGVjdGlvblttZXRob2RdKC4uLmFyZ3MpXG4gICAgaWYgKG5vcm1hbGl6ZSkgbmV4dCA9IG5leHQubm9ybWFsaXplKGRvY3VtZW50KVxuICAgIGNoYW5nZS5zZWxlY3QobmV4dClcbiAgfVxufSlcblxuLyoqXG4gKiBNaXggaW4gbm9kZS1yZWxhdGVkIGNoYW5nZXMuXG4gKi9cblxuY29uc3QgUFJFRklYRVMgPSBbXG4gICdtb3ZlVG8nLFxuICAnbW92ZUFuY2hvclRvJyxcbiAgJ21vdmVGb2N1c1RvJyxcbiAgJ21vdmVTdGFydFRvJyxcbiAgJ21vdmVFbmRUbycsXG4gICdjb2xsYXBzZVRvJyxcbiAgJ2V4dGVuZFRvJyxcbl1cblxuY29uc3QgRElSRUNUSU9OUyA9IFtcbiAgJ05leHQnLFxuICAnUHJldmlvdXMnLFxuXVxuXG5jb25zdCBLSU5EUyA9IFtcbiAgJ0Jsb2NrJyxcbiAgJ0lubGluZScsXG4gICdUZXh0Jyxcbl1cblxuUFJFRklYRVMuZm9yRWFjaCgocHJlZml4KSA9PiB7XG4gIGNvbnN0IGVkZ2VzID0gW1xuICAgICdTdGFydCcsXG4gICAgJ0VuZCcsXG4gIF1cblxuICBpZiAocHJlZml4ID09ICdtb3ZlVG8nKSB7XG4gICAgZWRnZXMucHVzaCgnUmFuZ2UnKVxuICB9XG5cbiAgZWRnZXMuZm9yRWFjaCgoZWRnZSkgPT4ge1xuICAgIGNvbnN0IG1ldGhvZCA9IGAke3ByZWZpeH0ke2VkZ2V9T2ZgXG5cbiAgICBLSU5EUy5mb3JFYWNoKChraW5kKSA9PiB7XG4gICAgICBjb25zdCBnZXROb2RlID0ga2luZCA9PSAnVGV4dCcgPyAnZ2V0Tm9kZScgOiBgZ2V0Q2xvc2VzdCR7a2luZH1gXG5cbiAgICAgIENoYW5nZXNbYCR7bWV0aG9kfSR7a2luZH1gXSA9IChjaGFuZ2UpID0+IHtcbiAgICAgICAgY29uc3QgeyB2YWx1ZSB9ID0gY2hhbmdlXG4gICAgICAgIGNvbnN0IHsgZG9jdW1lbnQsIHNlbGVjdGlvbiB9ID0gdmFsdWVcbiAgICAgICAgY29uc3Qgbm9kZSA9IGRvY3VtZW50W2dldE5vZGVdKHNlbGVjdGlvbi5zdGFydEtleSlcbiAgICAgICAgaWYgKCFub2RlKSByZXR1cm5cbiAgICAgICAgY2hhbmdlW21ldGhvZF0obm9kZSlcbiAgICAgIH1cblxuICAgICAgRElSRUNUSU9OUy5mb3JFYWNoKChkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgY29uc3QgZ2V0RGlyZWN0aW9uTm9kZSA9IGBnZXQke2RpcmVjdGlvbn0ke2tpbmR9YFxuICAgICAgICBjb25zdCBkaXJlY3Rpb25LZXkgPSBkaXJlY3Rpb24gPT0gJ05leHQnID8gJ3N0YXJ0S2V5JyA6ICdlbmRLZXknXG5cbiAgICAgICAgQ2hhbmdlc1tgJHttZXRob2R9JHtkaXJlY3Rpb259JHtraW5kfWBdID0gKGNoYW5nZSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuICAgICAgICAgIGNvbnN0IHsgZG9jdW1lbnQsIHNlbGVjdGlvbiB9ID0gdmFsdWVcbiAgICAgICAgICBjb25zdCBub2RlID0gZG9jdW1lbnRbZ2V0Tm9kZV0oc2VsZWN0aW9uW2RpcmVjdGlvbktleV0pXG4gICAgICAgICAgaWYgKCFub2RlKSByZXR1cm5cbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSBkb2N1bWVudFtnZXREaXJlY3Rpb25Ob2RlXShub2RlLmtleSlcbiAgICAgICAgICBpZiAoIXRhcmdldCkgcmV0dXJuXG4gICAgICAgICAgY2hhbmdlW21ldGhvZF0odGFyZ2V0KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH0pXG59KVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IENoYW5nZXNcbiJdfQ==