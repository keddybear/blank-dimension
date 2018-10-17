'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _mergeWith = require('lodash/mergeWith');

var _mergeWith2 = _interopRequireDefault(_mergeWith);

var _immutable = require('immutable');

var _coreSchemaRules = require('../constants/core-schema-rules');

var _coreSchemaRules2 = _interopRequireDefault(_coreSchemaRules);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _stack = require('./stack');

var _stack2 = _interopRequireDefault(_stack);

var _memoize = require('../utils/memoize');

var _memoize2 = _interopRequireDefault(_memoize);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Validation failure reasons.
 *
 * @type {Object}
 */

var CHILD_KIND_INVALID = 'child_kind_invalid';
var CHILD_REQUIRED = 'child_required';
var CHILD_TYPE_INVALID = 'child_type_invalid';
var CHILD_UNKNOWN = 'child_unknown';
var NODE_DATA_INVALID = 'node_data_invalid';
var NODE_IS_VOID_INVALID = 'node_is_void_invalid';
var NODE_MARK_INVALID = 'node_mark_invalid';
var NODE_TEXT_INVALID = 'node_text_invalid';
var PARENT_KIND_INVALID = 'parent_kind_invalid';
var PARENT_TYPE_INVALID = 'parent_type_invalid';

/**
 * Debug.
 *
 * @type {Function}
 */

var debug = (0, _debug2.default)('slate:schema');

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  stack: _stack2.default.create(),
  document: {},
  blocks: {},
  inlines: {}
};

/**
 * Schema.
 *
 * @type {Schema}
 */

var Schema = function (_Record) {
  _inherits(Schema, _Record);

  function Schema() {
    _classCallCheck(this, Schema);

    return _possibleConstructorReturn(this, (Schema.__proto__ || Object.getPrototypeOf(Schema)).apply(this, arguments));
  }

  _createClass(Schema, [{
    key: 'getRule',


    /**
     * Get the rule for an `object`.
     *
     * @param {Mixed} object
     * @return {Object}
     */

    value: function getRule(object) {
      switch (object.kind) {
        case 'document':
          return this.document;
        case 'block':
          return this.blocks[object.type];
        case 'inline':
          return this.inlines[object.type];
      }
    }

    /**
     * Get a dictionary of the parent rule validations by child type.
     *
     * @return {Object|Null}
     */

  }, {
    key: 'getParentRules',
    value: function getParentRules() {
      var blocks = this.blocks,
          inlines = this.inlines;

      var parents = {};

      for (var key in blocks) {
        var rule = blocks[key];
        if (rule.parent == null) continue;
        parents[key] = rule;
      }

      for (var _key in inlines) {
        var _rule = inlines[_key];
        if (_rule.parent == null) continue;
        parents[_key] = _rule;
      }

      return Object.keys(parents).length == 0 ? null : parents;
    }

    /**
     * Fail validation by returning a normalizing change function.
     *
     * @param {String} reason
     * @param {Object} context
     * @return {Function}
     */

  }, {
    key: 'fail',
    value: function fail(reason, context) {
      var _this2 = this;

      return function (change) {
        debug('normalizing', { reason: reason, context: context });
        var rule = context.rule;

        var count = change.operations.length;
        if (rule.normalize) rule.normalize(change, reason, context);
        if (change.operations.length > count) return;
        _this2.normalize(change, reason, context);
      };
    }

    /**
     * Normalize an invalid value with `reason` and `context`.
     *
     * @param {Change} change
     * @param {String} reason
     * @param {Mixed} context
     */

  }, {
    key: 'normalize',
    value: function normalize(change, reason, context) {
      switch (reason) {
        case CHILD_KIND_INVALID:
        case CHILD_TYPE_INVALID:
        case CHILD_UNKNOWN:
          {
            var child = context.child,
                node = context.node;

            return child.kind == 'text' && node.kind == 'block' && node.nodes.size == 1 ? change.removeNodeByKey(node.key) : change.removeNodeByKey(child.key);
          }

        case CHILD_REQUIRED:
        case NODE_TEXT_INVALID:
        case PARENT_KIND_INVALID:
        case PARENT_TYPE_INVALID:
          {
            var _node = context.node;

            return _node.kind == 'document' ? _node.nodes.forEach(function (child) {
              return change.removeNodeByKey(child.key);
            }) : change.removeNodeByKey(_node.key);
          }

        case NODE_DATA_INVALID:
          {
            var _node2 = context.node,
                key = context.key;

            return _node2.data.get(key) === undefined && _node2.kind != 'document' ? change.removeNodeByKey(_node2.key) : change.setNodeByKey(_node2.key, { data: _node2.data.delete(key) });
          }

        case NODE_IS_VOID_INVALID:
          {
            var _node3 = context.node;

            return change.setNodeByKey(_node3.key, { isVoid: !_node3.isVoid });
          }

        case NODE_MARK_INVALID:
          {
            var _node4 = context.node,
                mark = context.mark;

            return _node4.getTexts().forEach(function (t) {
              return change.removeMarkByKey(t.key, 0, t.text.length, mark);
            });
          }
      }
    }

    /**
     * Validate a `node` with the schema, returning a function that will fix the
     * invalid node, or void if the node is valid.
     *
     * @param {Node} node
     * @return {Function|Void}
     */

  }, {
    key: 'validateNode',
    value: function validateNode(node) {
      var ret = this.stack.find('validateNode', node);
      if (ret) return ret;

      if (node.kind == 'text') return;

      var rule = this.getRule(node) || {};
      var parents = this.getParentRules();
      var ctx = { node: node, rule: rule };

      if (rule.isVoid != null) {
        if (node.isVoid != rule.isVoid) {
          return this.fail(NODE_IS_VOID_INVALID, ctx);
        }
      }

      if (rule.data != null) {
        for (var key in rule.data) {
          var fn = rule.data[key];
          var value = node.data.get(key);

          if (!fn(value)) {
            return this.fail(NODE_DATA_INVALID, _extends({}, ctx, { key: key, value: value }));
          }
        }
      }

      if (rule.marks != null) {
        var marks = node.getMarks().toArray();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = marks[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var mark = _step.value;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = rule.marks[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var def = _step2.value;

                if (def.type != mark.type) {
                  return this.fail(NODE_MARK_INVALID, _extends({}, ctx, { mark: mark }));
                }
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

      if (rule.text != null) {
        var text = node.text;


        if (!rule.text.test(text)) {
          return this.fail(NODE_TEXT_INVALID, _extends({}, ctx, { text: text }));
        }
      }

      if (rule.nodes != null || parents != null) {
        var nextDef = function nextDef() {
          offset = offset == null ? null : 0;
          _def = defs.shift();
          min = _def && (_def.min == null ? 0 : _def.min);
          max = _def && (_def.max == null ? Infinity : _def.max);
          return !!_def;
        };

        var nextChild = function nextChild() {
          index = index == null ? 0 : index + 1;
          offset = offset == null ? 0 : offset + 1;
          child = children[index];
          if (max != null && offset == max) nextDef();
          return !!child;
        };

        var children = node.nodes.toArray();
        var defs = rule.nodes != null ? rule.nodes.slice() : [];

        var offset = void 0;
        var min = void 0;
        var index = void 0;
        var _def = void 0;
        var max = void 0;
        var child = void 0;

        if (rule.nodes != null) {
          nextDef();
        }

        while (nextChild()) {
          if (parents != null && child.kind != 'text' && child.type in parents) {
            var r = parents[child.type];

            if (r.parent.kinds != null && !r.parent.kinds.includes(node.kind)) {
              return this.fail(PARENT_KIND_INVALID, { node: child, parent: node, rule: r });
            }

            if (r.parent.types != null && !r.parent.types.includes(node.type)) {
              return this.fail(PARENT_TYPE_INVALID, { node: child, parent: node, rule: r });
            }
          }

          if (rule.nodes != null) {
            if (!_def) {
              return this.fail(CHILD_UNKNOWN, _extends({}, ctx, { child: child, index: index }));
            }

            if (_def.kinds != null && !_def.kinds.includes(child.kind)) {
              if (offset >= min && nextDef()) continue;
              return this.fail(CHILD_KIND_INVALID, _extends({}, ctx, { child: child, index: index }));
            }

            if (_def.types != null && !_def.types.includes(child.type)) {
              if (offset >= min && nextDef()) continue;
              return this.fail(CHILD_TYPE_INVALID, _extends({}, ctx, { child: child, index: index }));
            }
          }
        }

        if (rule.nodes != null) {
          while (min != null) {
            if (offset < min) {
              return this.fail(CHILD_REQUIRED, _extends({}, ctx, { index: index }));
            }

            nextDef();
          }
        }
      }
    }

    /**
     * Return a JSON representation of the schema.
     *
     * @return {Object}
     */

  }, {
    key: 'toJSON',
    value: function toJSON() {
      var object = {
        kind: this.kind,
        document: this.document,
        blocks: this.blocks,
        inlines: this.inlines
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
      return 'schema';
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Schema` with `attrs`.
     *
     * @param {Object|Schema} attrs
     * @return {Schema}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Schema.isSchema(attrs)) {
        return attrs;
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Schema.fromJSON(attrs);
      }

      throw new Error('`Schema.create` only accepts objects or schemas, but you passed it: ' + attrs);
    }

    /**
     * Create a `Schema` from a JSON `object`.
     *
     * @param {Object} object
     * @return {Schema}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Schema.isSchema(object)) {
        return object;
      }

      var plugins = object.plugins;


      if (object.rules) {
        throw new Error('Schemas in Slate have changed! They are no longer accept a `rules` property.');
      }

      if (object.nodes) {
        throw new Error('Schemas in Slate have changed! They are no longer accept a `nodes` property.');
      }

      if (!plugins) {
        plugins = [{ schema: object }];
      }

      var schema = resolveSchema(plugins);
      var stack = _stack2.default.create({ plugins: [].concat(_toConsumableArray(_coreSchemaRules2.default), _toConsumableArray(plugins)) });
      var ret = new Schema(_extends({}, schema, { stack: stack }));
      return ret;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isSchema',


    /**
     * Check if `any` is a `Schema`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isSchema(any) {
      return !!(any && any[_modelTypes2.default.SCHEMA]);
    }
  }]);

  return Schema;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Resolve a set of schema rules from an array of `plugins`.
 *
 * @param {Array} plugins
 * @return {Object}
 */

Schema.fromJS = Schema.fromJSON;
function resolveSchema() {
  var plugins = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var schema = {
    document: {},
    blocks: {},
    inlines: {}
  };

  plugins.slice().reverse().forEach(function (plugin) {
    if (!plugin.schema) return;

    if (plugin.schema.rules) {
      throw new Error('Schemas in Slate have changed! They are no longer accept a `rules` property.');
    }

    if (plugin.schema.nodes) {
      throw new Error('Schemas in Slate have changed! They are no longer accept a `nodes` property.');
    }

    var _plugin$schema = plugin.schema,
        _plugin$schema$docume = _plugin$schema.document,
        document = _plugin$schema$docume === undefined ? {} : _plugin$schema$docume,
        _plugin$schema$blocks = _plugin$schema.blocks,
        blocks = _plugin$schema$blocks === undefined ? {} : _plugin$schema$blocks,
        _plugin$schema$inline = _plugin$schema.inlines,
        inlines = _plugin$schema$inline === undefined ? {} : _plugin$schema$inline;

    var d = resolveDocumentRule(document);
    var bs = {};
    var is = {};

    for (var key in blocks) {
      bs[key] = resolveNodeRule('block', key, blocks[key]);
    }

    for (var _key2 in inlines) {
      is[_key2] = resolveNodeRule('inline', _key2, inlines[_key2]);
    }

    (0, _mergeWith2.default)(schema.document, d, customizer);
    (0, _mergeWith2.default)(schema.blocks, bs, customizer);
    (0, _mergeWith2.default)(schema.inlines, is, customizer);
  });

  return schema;
}

/**
 * Resolve a document rule `obj`.
 *
 * @param {Object} obj
 * @return {Object}
 */

function resolveDocumentRule(obj) {
  return _extends({
    data: {},
    nodes: null
  }, obj);
}

/**
 * Resolve a node rule with `type` from `obj`.
 *
 * @param {String} kind
 * @param {String} type
 * @param {Object} obj
 * @return {Object}
 */

function resolveNodeRule(kind, type, obj) {
  return _extends({
    data: {},
    isVoid: null,
    nodes: null,
    parent: null,
    text: null
  }, obj);
}

/**
 * A Lodash customizer for merging `kinds` and `types` arrays.
 *
 * @param {Mixed} target
 * @param {Mixed} source
 * @return {Array|Void}
 */

function customizer(target, source, key) {
  if (key == 'kinds' || key == 'types') {
    return target == null ? source : target.concat(source);
  }
}

/**
 * Attach a pseudo-symbol for type checking.
 */

Schema.prototype[_modelTypes2.default.SCHEMA] = true;

/**
 * Memoize read methods.
 */

(0, _memoize2.default)(Schema.prototype, ['getParentRules'], {
  takesArguments: true
});

/**
 * Export.
 *
 * @type {Schema}
 */

exports.default = Schema;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvc2NoZW1hLmpzIl0sIm5hbWVzIjpbIkNISUxEX0tJTkRfSU5WQUxJRCIsIkNISUxEX1JFUVVJUkVEIiwiQ0hJTERfVFlQRV9JTlZBTElEIiwiQ0hJTERfVU5LTk9XTiIsIk5PREVfREFUQV9JTlZBTElEIiwiTk9ERV9JU19WT0lEX0lOVkFMSUQiLCJOT0RFX01BUktfSU5WQUxJRCIsIk5PREVfVEVYVF9JTlZBTElEIiwiUEFSRU5UX0tJTkRfSU5WQUxJRCIsIlBBUkVOVF9UWVBFX0lOVkFMSUQiLCJkZWJ1ZyIsIkRFRkFVTFRTIiwic3RhY2siLCJjcmVhdGUiLCJkb2N1bWVudCIsImJsb2NrcyIsImlubGluZXMiLCJTY2hlbWEiLCJvYmplY3QiLCJraW5kIiwidHlwZSIsInBhcmVudHMiLCJrZXkiLCJydWxlIiwicGFyZW50IiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsInJlYXNvbiIsImNvbnRleHQiLCJjaGFuZ2UiLCJjb3VudCIsIm9wZXJhdGlvbnMiLCJub3JtYWxpemUiLCJjaGlsZCIsIm5vZGUiLCJub2RlcyIsInNpemUiLCJyZW1vdmVOb2RlQnlLZXkiLCJmb3JFYWNoIiwiZGF0YSIsImdldCIsInVuZGVmaW5lZCIsInNldE5vZGVCeUtleSIsImRlbGV0ZSIsImlzVm9pZCIsIm1hcmsiLCJnZXRUZXh0cyIsInJlbW92ZU1hcmtCeUtleSIsInQiLCJ0ZXh0IiwicmV0IiwiZmluZCIsImdldFJ1bGUiLCJnZXRQYXJlbnRSdWxlcyIsImN0eCIsImZhaWwiLCJmbiIsInZhbHVlIiwibWFya3MiLCJnZXRNYXJrcyIsInRvQXJyYXkiLCJkZWYiLCJ0ZXN0IiwibmV4dERlZiIsIm9mZnNldCIsImRlZnMiLCJzaGlmdCIsIm1pbiIsIm1heCIsIkluZmluaXR5IiwibmV4dENoaWxkIiwiaW5kZXgiLCJjaGlsZHJlbiIsInNsaWNlIiwiciIsImtpbmRzIiwiaW5jbHVkZXMiLCJ0eXBlcyIsInRvSlNPTiIsImF0dHJzIiwiaXNTY2hlbWEiLCJmcm9tSlNPTiIsIkVycm9yIiwicGx1Z2lucyIsInJ1bGVzIiwic2NoZW1hIiwicmVzb2x2ZVNjaGVtYSIsImFueSIsIlNDSEVNQSIsImZyb21KUyIsInJldmVyc2UiLCJwbHVnaW4iLCJkIiwicmVzb2x2ZURvY3VtZW50UnVsZSIsImJzIiwiaXMiLCJyZXNvbHZlTm9kZVJ1bGUiLCJjdXN0b21pemVyIiwib2JqIiwidGFyZ2V0Iiwic291cmNlIiwiY29uY2F0IiwicHJvdG90eXBlIiwidGFrZXNBcmd1bWVudHMiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEscUJBQXFCLG9CQUEzQjtBQUNBLElBQU1DLGlCQUFpQixnQkFBdkI7QUFDQSxJQUFNQyxxQkFBcUIsb0JBQTNCO0FBQ0EsSUFBTUMsZ0JBQWdCLGVBQXRCO0FBQ0EsSUFBTUMsb0JBQW9CLG1CQUExQjtBQUNBLElBQU1DLHVCQUF1QixzQkFBN0I7QUFDQSxJQUFNQyxvQkFBb0IsbUJBQTFCO0FBQ0EsSUFBTUMsb0JBQW9CLG1CQUExQjtBQUNBLElBQU1DLHNCQUFzQixxQkFBNUI7QUFDQSxJQUFNQyxzQkFBc0IscUJBQTVCOztBQUVBOzs7Ozs7QUFNQSxJQUFNQyxRQUFRLHFCQUFNLGNBQU4sQ0FBZDs7QUFFQTs7Ozs7O0FBTUEsSUFBTUMsV0FBVztBQUNmQyxTQUFPLGdCQUFNQyxNQUFOLEVBRFE7QUFFZkMsWUFBVSxFQUZLO0FBR2ZDLFVBQVEsRUFITztBQUlmQyxXQUFTO0FBSk0sQ0FBakI7O0FBT0E7Ozs7OztJQU1NQyxNOzs7Ozs7Ozs7Ozs7O0FBZ0ZKOzs7Ozs7OzRCQU9RQyxNLEVBQVE7QUFDZCxjQUFRQSxPQUFPQyxJQUFmO0FBQ0UsYUFBSyxVQUFMO0FBQWlCLGlCQUFPLEtBQUtMLFFBQVo7QUFDakIsYUFBSyxPQUFMO0FBQWMsaUJBQU8sS0FBS0MsTUFB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RVQsV0FBTyxJQUhUO0FBSUVaLFlBQVEsSUFKVjtBQUtFMEIsVUFBTTtBQUxSLEtBTUtpRCxHQU5MO0FBUUQ7O0FBRUQ7Ozs7Ozs7O0FBUUEsU0FBU0QsVUFBVCxDQUFvQkUsTUFBcEIsRUFBNEJDLE1BQTVCLEVBQW9DL0UsR0FBcEMsRUFBeUM7QUFDdkMsTUFBSUEsT0FBTyxPQUFQLElBQWtCQSxPQUFPLE9BQTdCLEVBQXNDO0FBQ3BDLFdBQU84RSxVQUFVLElBQVYsR0FBaUJDLE1BQWpCLEdBQTBCRCxPQUFPRSxNQUFQLENBQWNELE1BQWQsQ0FBakM7QUFDRDtBQUNGOztBQUVEOzs7O0FBSUFwRixPQUFPc0YsU0FBUCxDQUFpQixxQkFBWWQsTUFBN0IsSUFBdUMsSUFBdkM7O0FBRUE7Ozs7QUFJQSx1QkFBUXhFLE9BQU9zRixTQUFmLEVBQTBCLENBQ3hCLGdCQUR3QixDQUExQixFQUVHO0FBQ0RDLGtCQUFnQjtBQURmLENBRkg7O0FBTUE7Ozs7OztrQkFNZXZGLE0iLCJmaWxlIjoic2NoZW1hLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgRGVidWcgZnJvbSAnZGVidWcnXG5pbXBvcnQgaXNQbGFpbk9iamVjdCBmcm9tICdpcy1wbGFpbi1vYmplY3QnXG5pbXBvcnQgbWVyZ2VXaXRoIGZyb20gJ2xvZGFzaC9tZXJnZVdpdGgnXG5pbXBvcnQgeyBSZWNvcmQgfSBmcm9tICdpbW11dGFibGUnXG5cbmltcG9ydCBDT1JFX1NDSEVNQV9SVUxFUyBmcm9tICcuLi9jb25zdGFudHMvY29yZS1zY2hlbWEtcnVsZXMnXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IFN0YWNrIGZyb20gJy4vc3RhY2snXG5pbXBvcnQgbWVtb2l6ZSBmcm9tICcuLi91dGlscy9tZW1vaXplJ1xuXG4vKipcbiAqIFZhbGlkYXRpb24gZmFpbHVyZSByZWFzb25zLlxuICpcbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblxuY29uc3QgQ0hJTERfS0lORF9JTlZBTElEID0gJ2NoaWxkX2tpbmRfaW52YWxpZCdcbmNvbnN0IENISUxEX1JFUVVJUkVEID0gJ2NoaWxkX3JlcXVpcmVkJ1xuY29uc3QgQ0hJTERfVFlQRV9JTlZBTElEID0gJ2NoaWxkX3R5cGVfaW52YWxpZCdcbmNvbnN0IENISUxEX1VOS05PV04gPSAnY2hpbGRfdW5rbm93bidcbmNvbnN0IE5PREVfREFUQV9JTlZBTElEID0gJ25vZGVfZGF0YV9pbnZhbGlkJ1xuY29uc3QgTk9ERV9JU19WT0lEX0lOVkFMSUQgPSAnbm9kZV9pc192b2lkX2ludmFsaWQnXG5jb25zdCBOT0RFX01BUktfSU5WQUxJRCA9ICdub2RlX21hcmtfaW52YWxpZCdcbmNvbnN0IE5PREVfVEVYVF9JTlZBTElEID0gJ25vZGVfdGV4dF9pbnZhbGlkJ1xuY29uc3QgUEFSRU5UX0tJTkRfSU5WQUxJRCA9ICdwYXJlbnRfa2luZF9pbnZhbGlkJ1xuY29uc3QgUEFSRU5UX1RZUEVfSU5WQUxJRCA9ICdwYXJlbnRfdHlwZV9pbnZhbGlkJ1xuXG4vKipcbiAqIERlYnVnLlxuICpcbiAqIEB0eXBlIHtGdW5jdGlvbn1cbiAqL1xuXG5jb25zdCBkZWJ1ZyA9IERlYnVnKCdzbGF0ZTpzY2hlbWEnKVxuXG4vKipcbiAqIERlZmF1bHQgcHJvcGVydGllcy5cbiAqXG4gKiBAdHlwZSB7T2JqZWN0fVxuICovXG5cbmNvbnN0IERFRkFVTFRTID0ge1xuICBzdGFjazogU3RhY2suY3JlYXRlKCksXG4gIGRvY3VtZW50OiB7fSxcbiAgYmxvY2tzOiB7fSxcbiAgaW5saW5lczoge30sXG59XG5cbi8qKlxuICogU2NoZW1hLlxuICpcbiAqIEB0eXBlIHtTY2hlbWF9XG4gKi9cblxuY2xhc3MgU2NoZW1hIGV4dGVuZHMgUmVjb3JkKERFRkFVTFRTKSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgU2NoZW1hYCB3aXRoIGBhdHRyc2AuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fFNjaGVtYX0gYXR0cnNcbiAgICogQHJldHVybiB7U2NoZW1hfVxuICAgKi9cblxuICBzdGF0aWMgY3JlYXRlKGF0dHJzID0ge30pIHtcbiAgICBpZiAoU2NoZW1hLmlzU2NoZW1hKGF0dHJzKSkge1xuICAgICAgcmV0dXJuIGF0dHJzXG4gICAgfVxuXG4gICAgaWYgKGlzUGxhaW5PYmplY3QoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gU2NoZW1hLmZyb21KU09OKGF0dHJzKVxuICAgIH1cblxuICAgIHRocm93IG5ldyBFcnJvcihgXFxgU2NoZW1hLmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cyBvciBzY2hlbWFzLCBidXQgeW91IHBhc3NlZCBpdDogJHthdHRyc31gKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIGBTY2hlbWFgIGZyb20gYSBKU09OIGBvYmplY3RgLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge1NjaGVtYX1cbiAgICovXG5cbiAgc3RhdGljIGZyb21KU09OKG9iamVjdCkge1xuICAgIGlmIChTY2hlbWEuaXNTY2hlbWEob2JqZWN0KSkge1xuICAgICAgcmV0dXJuIG9iamVjdFxuICAgIH1cblxuICAgIGxldCB7IHBsdWdpbnMgfSA9IG9iamVjdFxuXG4gICAgaWYgKG9iamVjdC5ydWxlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTY2hlbWFzIGluIFNsYXRlIGhhdmUgY2hhbmdlZCEgVGhleSBhcmUgbm8gbG9uZ2VyIGFjY2VwdCBhIGBydWxlc2AgcHJvcGVydHkuJylcbiAgICB9XG5cbiAgICBpZiAob2JqZWN0Lm5vZGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NjaGVtYXMgaW4gU2xhdGUgaGF2ZSBjaGFuZ2VkISBUaGV5IGFyZSBubyBsb25nZXIgYWNjZXB0IGEgYG5vZGVzYCBwcm9wZXJ0eS4nKVxuICAgIH1cblxuICAgIGlmICghcGx1Z2lucykge1xuICAgICAgcGx1Z2lucyA9IFt7IHNjaGVtYTogb2JqZWN0IH1dXG4gICAgfVxuXG4gICAgY29uc3Qgc2NoZW1hID0gcmVzb2x2ZVNjaGVtYShwbHVnaW5zKVxuICAgIGNvbnN0IHN0YWNrID0gU3RhY2suY3JlYXRlKHsgcGx1Z2luczogWyAuLi5DT1JFX1NDSEVNQV9SVUxFUywgLi4ucGx1Z2lucyBdIH0pXG4gICAgY29uc3QgcmV0ID0gbmV3IFNjaGVtYSh7IC4uLnNjaGVtYSwgc3RhY2sgfSlcbiAgICByZXR1cm4gcmV0XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYGZyb21KU2AuXG4gICAqL1xuXG4gIHN0YXRpYyBmcm9tSlMgPSBTY2hlbWEuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgU2NoZW1hYC5cbiAgICpcbiAgICogQHBhcmFtIHtBbnl9IGFueVxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBzdGF0aWMgaXNTY2hlbWEoYW55KSB7XG4gICAgcmV0dXJuICEhKGFueSAmJiBhbnlbTU9ERUxfVFlQRVMuU0NIRU1BXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGtpbmQuXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IGtpbmQoKSB7XG4gICAgcmV0dXJuICdzY2hlbWEnXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBydWxlIGZvciBhbiBgb2JqZWN0YC5cbiAgICpcbiAgICogQHBhcmFtIHtNaXhlZH0gb2JqZWN0XG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgZ2V0UnVsZShvYmplY3QpIHtcbiAgICBzd2l0Y2ggKG9iamVjdC5raW5kKSB7XG4gICAgICBjYXNlICdkb2N1bWVudCc6IHJldHVybiB0aGlzLmRvY3VtZW50XG4gICAgICBjYXNlICdibG9jayc6IHJldHVybiB0aGlzLmJsb2Nrc1tvYmplY3QudHlwZV1cbiAgICAgIGNhc2UgJ2lubGluZSc6IHJldHVybiB0aGlzLmlubGluZXNbb2JqZWN0LnR5cGVdXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIGRpY3Rpb25hcnkgb2YgdGhlIHBhcmVudCBydWxlIHZhbGlkYXRpb25zIGJ5IGNoaWxkIHR5cGUuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdHxOdWxsfVxuICAgKi9cblxuICBnZXRQYXJlbnRSdWxlcygpIHtcbiAgICBjb25zdCB7IGJsb2NrcywgaW5saW5lcyB9ID0gdGhpc1xuICAgIGNvbnN0IHBhcmVudHMgPSB7fVxuXG4gICAgZm9yIChjb25zdCBrZXkgaW4gYmxvY2tzKSB7XG4gICAgICBjb25zdCBydWxlID0gYmxvY2tzW2tleV1cbiAgICAgIGlmIChydWxlLnBhcmVudCA9PSBudWxsKSBjb250aW51ZVxuICAgICAgcGFyZW50c1trZXldID0gcnVsZVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGlubGluZXMpIHtcbiAgICAgIGNvbnN0IHJ1bGUgPSBpbmxpbmVzW2tleV1cbiAgICAgIGlmIChydWxlLnBhcmVudCA9PSBudWxsKSBjb250aW51ZVxuICAgICAgcGFyZW50c1trZXldID0gcnVsZVxuICAgIH1cblxuICAgIHJldHVybiBPYmplY3Qua2V5cyhwYXJlbnRzKS5sZW5ndGggPT0gMCA/IG51bGwgOiBwYXJlbnRzXG4gIH1cblxuICAvKipcbiAgICogRmFpbCB2YWxpZGF0aW9uIGJ5IHJldHVybmluZyBhIG5vcm1hbGl6aW5nIGNoYW5nZSBmdW5jdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHJlYXNvblxuICAgKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICAgKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAgICovXG5cbiAgZmFpbChyZWFzb24sIGNvbnRleHQpIHtcbiAgICByZXR1cm4gKGNoYW5nZSkgPT4ge1xuICAgICAgZGVidWcoYG5vcm1hbGl6aW5nYCwgeyByZWFzb24sIGNvbnRleHQgfSlcbiAgICAgIGNvbnN0IHsgcnVsZSB9ID0gY29udGV4dFxuICAgICAgY29uc3QgY291bnQgPSBjaGFuZ2Uub3BlcmF0aW9ucy5sZW5ndGhcbiAgICAgIGlmIChydWxlLm5vcm1hbGl6ZSkgcnVsZS5ub3JtYWxpemUoY2hhbmdlLCByZWFzb24sIGNvbnRleHQpXG4gICAgICBpZiAoY2hhbmdlLm9wZXJhdGlvbnMubGVuZ3RoID4gY291bnQpIHJldHVyblxuICAgICAgdGhpcy5ub3JtYWxpemUoY2hhbmdlLCByZWFzb24sIGNvbnRleHQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZSBhbiBpbnZhbGlkIHZhbHVlIHdpdGggYHJlYXNvbmAgYW5kIGBjb250ZXh0YC5cbiAgICpcbiAgICogQHBhcmFtIHtDaGFuZ2V9IGNoYW5nZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gcmVhc29uXG4gICAqIEBwYXJhbSB7TWl4ZWR9IGNvbnRleHRcbiAgICovXG5cbiAgbm9ybWFsaXplKGNoYW5nZSwgcmVhc29uLCBjb250ZXh0KSB7XG4gICAgc3dpdGNoIChyZWFzb24pIHtcbiAgICAgIGNhc2UgQ0hJTERfS0lORF9JTlZBTElEOlxuICAgICAgY2FzZSBDSElMRF9UWVBFX0lOVkFMSUQ6XG4gICAgICBjYXNlIENISUxEX1VOS05PV046IHtcbiAgICAgICAgY29uc3QgeyBjaGlsZCwgbm9kZSB9ID0gY29udGV4dFxuICAgICAgICByZXR1cm4gY2hpbGQua2luZCA9PSAndGV4dCcgJiYgbm9kZS5raW5kID09ICdibG9jaycgJiYgbm9kZS5ub2Rlcy5zaXplID09IDFcbiAgICAgICAgICA/IGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkobm9kZS5rZXkpXG4gICAgICAgICAgOiBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KGNoaWxkLmtleSlcbiAgICAgIH1cblxuICAgICAgY2FzZSBDSElMRF9SRVFVSVJFRDpcbiAgICAgIGNhc2UgTk9ERV9URVhUX0lOVkFMSUQ6XG4gICAgICBjYXNlIFBBUkVOVF9LSU5EX0lOVkFMSUQ6XG4gICAgICBjYXNlIFBBUkVOVF9UWVBFX0lOVkFMSUQ6IHtcbiAgICAgICAgY29uc3QgeyBub2RlIH0gPSBjb250ZXh0XG4gICAgICAgIHJldHVybiBub2RlLmtpbmQgPT0gJ2RvY3VtZW50J1xuICAgICAgICAgID8gbm9kZS5ub2Rlcy5mb3JFYWNoKGNoaWxkID0+IGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkoY2hpbGQua2V5KSlcbiAgICAgICAgICA6IGNoYW5nZS5yZW1vdmVOb2RlQnlLZXkobm9kZS5rZXkpXG4gICAgICB9XG5cbiAgICAgIGNhc2UgTk9ERV9EQVRBX0lOVkFMSUQ6IHtcbiAgICAgICAgY29uc3QgeyBub2RlLCBrZXkgfSA9IGNvbnRleHRcbiAgICAgICAgcmV0dXJuIG5vZGUuZGF0YS5nZXQoa2V5KSA9PT0gdW5kZWZpbmVkICYmIG5vZGUua2luZCAhPSAnZG9jdW1lbnQnXG4gICAgICAgICAgPyBjaGFuZ2UucmVtb3ZlTm9kZUJ5S2V5KG5vZGUua2V5KVxuICAgICAgICAgIDogY2hhbmdlLnNldE5vZGVCeUtleShub2RlLmtleSwgeyBkYXRhOiBub2RlLmRhdGEuZGVsZXRlKGtleSkgfSlcbiAgICAgIH1cblxuICAgICAgY2FzZSBOT0RFX0lTX1ZPSURfSU5WQUxJRDoge1xuICAgICAgICBjb25zdCB7IG5vZGUgfSA9IGNvbnRleHRcbiAgICAgICAgcmV0dXJuIGNoYW5nZS5zZXROb2RlQnlLZXkobm9kZS5rZXksIHsgaXNWb2lkOiAhbm9kZS5pc1ZvaWQgfSlcbiAgICAgIH1cblxuICAgICAgY2FzZSBOT0RFX01BUktfSU5WQUxJRDoge1xuICAgICAgICBjb25zdCB7IG5vZGUsIG1hcmsgfSA9IGNvbnRleHRcbiAgICAgICAgcmV0dXJuIG5vZGUuZ2V0VGV4dHMoKS5mb3JFYWNoKHQgPT4gY2hhbmdlLnJlbW92ZU1hcmtCeUtleSh0LmtleSwgMCwgdC50ZXh0Lmxlbmd0aCwgbWFyaykpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFZhbGlkYXRlIGEgYG5vZGVgIHdpdGggdGhlIHNjaGVtYSwgcmV0dXJuaW5nIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGZpeCB0aGVcbiAgICogaW52YWxpZCBub2RlLCBvciB2b2lkIGlmIHRoZSBub2RlIGlzIHZhbGlkLlxuICAgKlxuICAgKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAgICogQHJldHVybiB7RnVuY3Rpb258Vm9pZH1cbiAgICovXG5cbiAgdmFsaWRhdGVOb2RlKG5vZGUpIHtcbiAgICBjb25zdCByZXQgPSB0aGlzLnN0YWNrLmZpbmQoJ3ZhbGlkYXRlTm9kZScsIG5vZGUpXG4gICAgaWYgKHJldCkgcmV0dXJuIHJldFxuXG4gICAgaWYgKG5vZGUua2luZCA9PSAndGV4dCcpIHJldHVyblxuXG4gICAgY29uc3QgcnVsZSA9IHRoaXMuZ2V0UnVsZShub2RlKSB8fCB7fVxuICAgIGNvbnN0IHBhcmVudHMgPSB0aGlzLmdldFBhcmVudFJ1bGVzKClcbiAgICBjb25zdCBjdHggPSB7IG5vZGUsIHJ1bGUgfVxuXG4gICAgaWYgKHJ1bGUuaXNWb2lkICE9IG51bGwpIHtcbiAgICAgIGlmIChub2RlLmlzVm9pZCAhPSBydWxlLmlzVm9pZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYWlsKE5PREVfSVNfVk9JRF9JTlZBTElELCBjdHgpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJ1bGUuZGF0YSAhPSBudWxsKSB7XG4gICAgICBmb3IgKGNvbnN0IGtleSBpbiBydWxlLmRhdGEpIHtcbiAgICAgICAgY29uc3QgZm4gPSBydWxlLmRhdGFba2V5XVxuICAgICAgICBjb25zdCB2YWx1ZSA9IG5vZGUuZGF0YS5nZXQoa2V5KVxuXG4gICAgICAgIGlmICghZm4odmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChOT0RFX0RBVEFfSU5WQUxJRCwgeyAuLi5jdHgsIGtleSwgdmFsdWUgfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChydWxlLm1hcmtzICE9IG51bGwpIHtcbiAgICAgIGNvbnN0IG1hcmtzID0gbm9kZS5nZXRNYXJrcygpLnRvQXJyYXkoKVxuXG4gICAgICBmb3IgKGNvbnN0IG1hcmsgb2YgbWFya3MpIHtcbiAgICAgICAgZm9yIChjb25zdCBkZWYgb2YgcnVsZS5tYXJrcykge1xuICAgICAgICAgIGlmIChkZWYudHlwZSAhPSBtYXJrLnR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZhaWwoTk9ERV9NQVJLX0lOVkFMSUQsIHsgLi4uY3R4LCBtYXJrIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJ1bGUudGV4dCAhPSBudWxsKSB7XG4gICAgICBjb25zdCB7IHRleHQgfSA9IG5vZGVcblxuICAgICAgaWYgKCFydWxlLnRleHQudGVzdCh0ZXh0KSkge1xuICAgICAgICByZXR1cm4gdGhpcy5mYWlsKE5PREVfVEVYVF9JTlZBTElELCB7IC4uLmN0eCwgdGV4dCB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChydWxlLm5vZGVzICE9IG51bGwgfHwgcGFyZW50cyAhPSBudWxsKSB7XG4gICAgICBjb25zdCBjaGlsZHJlbiA9IG5vZGUubm9kZXMudG9BcnJheSgpXG4gICAgICBjb25zdCBkZWZzID0gcnVsZS5ub2RlcyAhPSBudWxsID8gcnVsZS5ub2Rlcy5zbGljZSgpIDogW11cblxuICAgICAgbGV0IG9mZnNldFxuICAgICAgbGV0IG1pblxuICAgICAgbGV0IGluZGV4XG4gICAgICBsZXQgZGVmXG4gICAgICBsZXQgbWF4XG4gICAgICBsZXQgY2hpbGRcblxuICAgICAgZnVuY3Rpb24gbmV4dERlZigpIHtcbiAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0ID09IG51bGwgPyBudWxsIDogMFxuICAgICAgICBkZWYgPSBkZWZzLnNoaWZ0KClcbiAgICAgICAgbWluID0gZGVmICYmIChkZWYubWluID09IG51bGwgPyAwIDogZGVmLm1pbilcbiAgICAgICAgbWF4ID0gZGVmICYmIChkZWYubWF4ID09IG51bGwgPyBJbmZpbml0eSA6IGRlZi5tYXgpXG4gICAgICAgIHJldHVybiAhIWRlZlxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBuZXh0Q2hpbGQoKSB7XG4gICAgICAgIGluZGV4ID0gaW5kZXggPT0gbnVsbCA/IDAgOiBpbmRleCArIDFcbiAgICAgICAgb2Zmc2V0ID0gb2Zmc2V0ID09IG51bGwgPyAwIDogb2Zmc2V0ICsgMVxuICAgICAgICBjaGlsZCA9IGNoaWxkcmVuW2luZGV4XVxuICAgICAgICBpZiAobWF4ICE9IG51bGwgJiYgb2Zmc2V0ID09IG1heCkgbmV4dERlZigpXG4gICAgICAgIHJldHVybiAhIWNoaWxkXG4gICAgICB9XG5cbiAgICAgIGlmIChydWxlLm5vZGVzICE9IG51bGwpIHtcbiAgICAgICAgbmV4dERlZigpXG4gICAgICB9XG5cbiAgICAgIHdoaWxlIChuZXh0Q2hpbGQoKSkge1xuICAgICAgICBpZiAocGFyZW50cyAhPSBudWxsICYmIGNoaWxkLmtpbmQgIT0gJ3RleHQnICYmIGNoaWxkLnR5cGUgaW4gcGFyZW50cykge1xuICAgICAgICAgIGNvbnN0IHIgPSBwYXJlbnRzW2NoaWxkLnR5cGVdXG5cbiAgICAgICAgICBpZiAoci5wYXJlbnQua2luZHMgIT0gbnVsbCAmJiAhci5wYXJlbnQua2luZHMuaW5jbHVkZXMobm9kZS5raW5kKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChQQVJFTlRfS0lORF9JTlZBTElELCB7IG5vZGU6IGNoaWxkLCBwYXJlbnQ6IG5vZGUsIHJ1bGU6IHIgfSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoci5wYXJlbnQudHlwZXMgIT0gbnVsbCAmJiAhci5wYXJlbnQudHlwZXMuaW5jbHVkZXMobm9kZS50eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbChQQVJFTlRfVFlQRV9JTlZBTElELCB7IG5vZGU6IGNoaWxkLCBwYXJlbnQ6IG5vZGUsIHJ1bGU6IHIgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocnVsZS5ub2RlcyAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKCFkZWYpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZhaWwoQ0hJTERfVU5LTk9XTiwgeyAuLi5jdHgsIGNoaWxkLCBpbmRleCB9KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkZWYua2luZHMgIT0gbnVsbCAmJiAhZGVmLmtpbmRzLmluY2x1ZGVzKGNoaWxkLmtpbmQpKSB7XG4gICAgICAgICAgICBpZiAob2Zmc2V0ID49IG1pbiAmJiBuZXh0RGVmKCkpIGNvbnRpbnVlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsKENISUxEX0tJTkRfSU5WQUxJRCwgeyAuLi5jdHgsIGNoaWxkLCBpbmRleCB9KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChkZWYudHlwZXMgIT0gbnVsbCAmJiAhZGVmLnR5cGVzLmluY2x1ZGVzKGNoaWxkLnR5cGUpKSB7XG4gICAgICAgICAgICBpZiAob2Zmc2V0ID49IG1pbiAmJiBuZXh0RGVmKCkpIGNvbnRpbnVlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsKENISUxEX1RZUEVfSU5WQUxJRCwgeyAuLi5jdHgsIGNoaWxkLCBpbmRleCB9KVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAocnVsZS5ub2RlcyAhPSBudWxsKSB7XG4gICAgICAgIHdoaWxlIChtaW4gIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChvZmZzZXQgPCBtaW4pIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZhaWwoQ0hJTERfUkVRVUlSRUQsIHsgLi4uY3R4LCBpbmRleCB9KVxuICAgICAgICAgIH1cblxuICAgICAgICAgIG5leHREZWYoKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhIEpTT04gcmVwcmVzZW50YXRpb24gb2YgdGhlIHNjaGVtYS5cbiAgICpcbiAgICogQHJldHVybiB7T2JqZWN0fVxuICAgKi9cblxuICB0b0pTT04oKSB7XG4gICAgY29uc3Qgb2JqZWN0ID0ge1xuICAgICAga2luZDogdGhpcy5raW5kLFxuICAgICAgZG9jdW1lbnQ6IHRoaXMuZG9jdW1lbnQsXG4gICAgICBibG9ja3M6IHRoaXMuYmxvY2tzLFxuICAgICAgaW5saW5lczogdGhpcy5pbmxpbmVzLFxuICAgIH1cblxuICAgIHJldHVybiBvYmplY3RcbiAgfVxuXG4gIC8qKlxuICAgKiBBbGlhcyBgdG9KU2AuXG4gICAqL1xuXG4gIHRvSlMoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9KU09OKClcbiAgfVxuXG59XG5cbi8qKlxuICogUmVzb2x2ZSBhIHNldCBvZiBzY2hlbWEgcnVsZXMgZnJvbSBhbiBhcnJheSBvZiBgcGx1Z2luc2AuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGx1Z2luc1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIHJlc29sdmVTY2hlbWEocGx1Z2lucyA9IFtdKSB7XG4gIGNvbnN0IHNjaGVtYSA9IHtcbiAgICBkb2N1bWVudDoge30sXG4gICAgYmxvY2tzOiB7fSxcbiAgICBpbmxpbmVzOiB7fSxcbiAgfVxuXG4gIHBsdWdpbnMuc2xpY2UoKS5yZXZlcnNlKCkuZm9yRWFjaCgocGx1Z2luKSA9PiB7XG4gICAgaWYgKCFwbHVnaW4uc2NoZW1hKSByZXR1cm5cblxuICAgIGlmIChwbHVnaW4uc2NoZW1hLnJ1bGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NjaGVtYXMgaW4gU2xhdGUgaGF2ZSBjaGFuZ2VkISBUaGV5IGFyZSBubyBsb25nZXIgYWNjZXB0IGEgYHJ1bGVzYCBwcm9wZXJ0eS4nKVxuICAgIH1cblxuICAgIGlmIChwbHVnaW4uc2NoZW1hLm5vZGVzKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NjaGVtYXMgaW4gU2xhdGUgaGF2ZSBjaGFuZ2VkISBUaGV5IGFyZSBubyBsb25nZXIgYWNjZXB0IGEgYG5vZGVzYCBwcm9wZXJ0eS4nKVxuICAgIH1cblxuICAgIGNvbnN0IHsgZG9jdW1lbnQgPSB7fSwgYmxvY2tzID0ge30sIGlubGluZXMgPSB7fX0gPSBwbHVnaW4uc2NoZW1hXG4gICAgY29uc3QgZCA9IHJlc29sdmVEb2N1bWVudFJ1bGUoZG9jdW1lbnQpXG4gICAgY29uc3QgYnMgPSB7fVxuICAgIGNvbnN0IGlzID0ge31cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGJsb2Nrcykge1xuICAgICAgYnNba2V5XSA9IHJlc29sdmVOb2RlUnVsZSgnYmxvY2snLCBrZXksIGJsb2Nrc1trZXldKVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qga2V5IGluIGlubGluZXMpIHtcbiAgICAgIGlzW2tleV0gPSByZXNvbHZlTm9kZVJ1bGUoJ2lubGluZScsIGtleSwgaW5saW5lc1trZXldKVxuICAgIH1cblxuICAgIG1lcmdlV2l0aChzY2hlbWEuZG9jdW1lbnQsIGQsIGN1c3RvbWl6ZXIpXG4gICAgbWVyZ2VXaXRoKHNjaGVtYS5ibG9ja3MsIGJzLCBjdXN0b21pemVyKVxuICAgIG1lcmdlV2l0aChzY2hlbWEuaW5saW5lcywgaXMsIGN1c3RvbWl6ZXIpXG4gIH0pXG5cbiAgcmV0dXJuIHNjaGVtYVxufVxuXG4vKipcbiAqIFJlc29sdmUgYSBkb2N1bWVudCBydWxlIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiByZXNvbHZlRG9jdW1lbnRSdWxlKG9iaikge1xuICByZXR1cm4ge1xuICAgIGRhdGE6IHt9LFxuICAgIG5vZGVzOiBudWxsLFxuICAgIC4uLm9iaixcbiAgfVxufVxuXG4vKipcbiAqIFJlc29sdmUgYSBub2RlIHJ1bGUgd2l0aCBgdHlwZWAgZnJvbSBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2luZFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuXG5mdW5jdGlvbiByZXNvbHZlTm9kZVJ1bGUoa2luZCwgdHlwZSwgb2JqKSB7XG4gIHJldHVybiB7XG4gICAgZGF0YToge30sXG4gICAgaXNWb2lkOiBudWxsLFxuICAgIG5vZGVzOiBudWxsLFxuICAgIHBhcmVudDogbnVsbCxcbiAgICB0ZXh0OiBudWxsLFxuICAgIC4uLm9iaixcbiAgfVxufVxuXG4vKipcbiAqIEEgTG9kYXNoIGN1c3RvbWl6ZXIgZm9yIG1lcmdpbmcgYGtpbmRzYCBhbmQgYHR5cGVzYCBhcnJheXMuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdGFyZ2V0XG4gKiBAcGFyYW0ge01peGVkfSBzb3VyY2VcbiAqIEByZXR1cm4ge0FycmF5fFZvaWR9XG4gKi9cblxuZnVuY3Rpb24gY3VzdG9taXplcih0YXJnZXQsIHNvdXJjZSwga2V5KSB7XG4gIGlmwqAoa2V5ID09ICdraW5kcycgfHwga2V5ID09ICd0eXBlcycpwqB7XG4gICAgcmV0dXJuwqB0YXJnZXQgPT0gbnVsbCA/IHNvdXJjZSA6IHRhcmdldC5jb25jYXQoc291cmNlKVxuICB9XG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5TY2hlbWEucHJvdG90eXBlW01PREVMX1RZUEVTLlNDSEVNQV0gPSB0cnVlXG5cbi8qKlxuICogTWVtb2l6ZSByZWFkIG1ldGhvZHMuXG4gKi9cblxubWVtb2l6ZShTY2hlbWEucHJvdG90eXBlLCBbXG4gICdnZXRQYXJlbnRSdWxlcycsXG5dLCB7XG4gIHRha2VzQXJndW1lbnRzOiB0cnVlLFxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge1NjaGVtYX1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBTY2hlbWFcbiJdfQ==