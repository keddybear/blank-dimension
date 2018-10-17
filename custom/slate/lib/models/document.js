'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('./block');

require('./inline');

var _isPlainObject = require('is-plain-object');

var _isPlainObject2 = _interopRequireDefault(_isPlainObject);

var _immutable = require('immutable');

var _node = require('./node');

var _node2 = _interopRequireDefault(_node);

var _modelTypes = require('../constants/model-types');

var _modelTypes2 = _interopRequireDefault(_modelTypes);

var _generateKey = require('../utils/generate-key');

var _generateKey2 = _interopRequireDefault(_generateKey);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
/**
 * Prevent circular dependencies.
 */

/**
 * Dependencies.
 */

/**
 * Default properties.
 *
 * @type {Object}
 */

var DEFAULTS = {
  data: new _immutable.Map(),
  key: undefined,
  nodes: new _immutable.List()
};

/**
 * Document.
 *
 * @type {Document}
 */

var Document = function (_Record) {
  _inherits(Document, _Record);

  function Document() {
    _classCallCheck(this, Document);

    return _possibleConstructorReturn(this, (Document.__proto__ || Object.getPrototypeOf(Document)).apply(this, arguments));
  }

  _createClass(Document, [{
    key: 'toJSON',


    /**
     * Return a JSON representation of the document.
     *
     * @param {Object} options
     * @return {Object}
     */

    value: function toJSON() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      var object = {
        kind: this.kind,
        data: this.data.toJSON(),
        nodes: this.nodes.toArray().map(function (n) {
          return n.toJSON(options);
        })
      };

      if (options.preserveKeys) {
        object.key = this.key;
      }

      return object;
    }

    /**
     * Alias `toJS`.
     */

  }, {
    key: 'toJS',
    value: function toJS(options) {
      return this.toJSON(options);
    }
  }, {
    key: 'kind',


    /**
     * Get the node's kind.
     *
     * @return {String}
     */

    get: function get() {
      return 'document';
    }

    /**
     * Check if the document is empty.
     *
     * @return {Boolean}
     */

  }, {
    key: 'isEmpty',
    get: function get() {
      return this.text == '';
    }

    /**
     * Get the concatenated text of all the document's children.
     *
     * @return {String}
     */

  }, {
    key: 'text',
    get: function get() {
      return this.getText();
    }
  }], [{
    key: 'create',


    /**
     * Create a new `Document` with `attrs`.
     *
     * @param {Object|Array|List|Text} attrs
     * @return {Document}
     */

    value: function create() {
      var attrs = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      if (Document.isDocument(attrs)) {
        return attrs;
      }

      if (_immutable.List.isList(attrs) || Array.isArray(attrs)) {
        attrs = { nodes: attrs };
      }

      if ((0, _isPlainObject2.default)(attrs)) {
        return Document.fromJSON(attrs);
      }

      throw new Error('`Document.create` only accepts objects, arrays, lists or documents, but you passed it: ' + attrs);
    }

    /**
     * Create a `Document` from a JSON `object`.
     *
     * @param {Object|Document} object
     * @return {Document}
     */

  }, {
    key: 'fromJSON',
    value: function fromJSON(object) {
      if (Document.isDocument(object)) {
        return object;
      }

      var _object$data = object.data,
          data = _object$data === undefined ? {} : _object$data,
          _object$key = object.key,
          key = _object$key === undefined ? (0, _generateKey2.default)() : _object$key,
          _object$nodes = object.nodes,
          nodes = _object$nodes === undefined ? [] : _object$nodes;


      var document = new Document({
        key: key,
        data: new _immutable.Map(data),
        nodes: new _immutable.List(nodes.map(_node2.default.fromJSON))
      });

      return document;
    }

    /**
     * Alias `fromJS`.
     */

  }, {
    key: 'isDocument',


    /**
     * Check if `any` is a `Document`.
     *
     * @param {Any} any
     * @return {Boolean}
     */

    value: function isDocument(any) {
      return !!(any && any[_modelTypes2.default.DOCUMENT]);
    }
  }]);

  return Document;
}((0, _immutable.Record)(DEFAULTS));

/**
 * Attach a pseudo-symbol for type checking.
 */

Document.fromJS = Document.fromJSON;
Document.prototype[_modelTypes2.default.DOCUMENT] = true;

/**
 * Mix in `Node` methods.
 */

Object.getOwnPropertyNames(_node2.default.prototype).forEach(function (method) {
  if (method == 'constructor') return;
  Document.prototype[method] = _node2.default.prototype[method];
});

/**
 * Export.
 *
 * @type {Document}
 */

exports.default = Document;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvZG9jdW1lbnQuanMiXSwibmFtZXMiOlsiREVGQVVMVFMiLCJkYXRhIiwia2V5IiwidW5kZWZpbmVkIiwibm9kZXMiLCJEb2N1bWVudCIsIm9wdGlvbnMiLCJvYmplY3QiLCJraW5kIiwidG9KU09OIiwidG9BcnJheSIsIm1hcCIsIm4iLCJwcmVzZXJ2ZUtleXMiLCJ0ZXh0IiwiZ2V0VGV4dCIsImF0dHJzIiwiaXNEb2N1bWVudCIsImlzTGlzdCIsIkFycmF5IiwiaXNBcnJheSIsImZyb21KU09OIiwiRXJyb3IiLCJkb2N1bWVudCIsImFueSIsIkRPQ1VNRU5UIiwiZnJvbUpTIiwicHJvdG90eXBlIiwiT2JqZWN0IiwiZ2V0T3duUHJvcGVydHlOYW1lcyIsImZvckVhY2giLCJtZXRob2QiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBS0E7O0FBQ0E7O0FBTUE7Ozs7QUFDQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7O0FBaEJBOzs7O0FBT0E7Ozs7QUFXQTs7Ozs7O0FBTUEsSUFBTUEsV0FBVztBQUNmQyxRQUFNLG9CQURTO0FBRWZDLE9BQUtDLFNBRlU7QUFHZkMsU0FBTztBQUhRLENBQWpCOztBQU1BOzs7Ozs7SUFNTUMsUTs7Ozs7Ozs7Ozs7OztBQW1HSjs7Ozs7Ozs2QkFPcUI7QUFBQSxVQUFkQyxPQUFjLHVFQUFKLEVBQUk7O0FBQ25CLFVBQU1DLFNBQVM7QUFDYkMsY0FBTSxLQUFLQSxJQURFO0FBRWJQLGNBQU0sS0FBS0EsSUFBTCxDQUFVUSxNQUFWLEVBRk87QUFHYkwsZUFBTyxLQUFLQSxLQUFMLENBQVdNLE9BQVgsR0FBcUJDLEdBQXJCLENBQXlCO0FBQUEsaUJBQUtDLEVBQUVILE1BQUYsQ0FBU0gsT0FBVCxDQUFMO0FBQUEsU0FBekI7QUFITSxPQUFmOztBQU1BLFVBQUlBLFFBQVFPLFlBQVosRUFBMEI7QUFDeEJOLGVBQU9MLEdBQVAsR0FBYSxLQUFLQSxHQUFsQjtBQUNEOztBQUVELGFBQU9LLE1BQVA7QUFDRDs7QUFFRDs7Ozs7O3lCQUlLRCxPLEVBQVM7QUFDWixhQUFPLEtBQUtHLE1BQUwsQ0FBWUgsT0FBWixDQUFQO0FBQ0Q7Ozs7O0FBekREOzs7Ozs7d0JBTVc7QUFDVCxhQUFPLFVBQVA7QUFDRDs7QUFFRDs7Ozs7Ozs7d0JBTWM7QUFDWixhQUFPLEtBQUtRLElBQUwsSUFBYSxFQUFwQjtBQUNEOztBQUVEOzs7Ozs7Ozt3QkFNVztBQUNULGFBQU8sS0FBS0MsT0FBTCxFQUFQO0FBQ0Q7Ozs7O0FBL0ZEOzs7Ozs7OzZCQU8wQjtBQUFBLFVBQVpDLEtBQVksdUVBQUosRUFBSTs7QUFDeEIsVUFBSVgsU0FBU1ksVUFBVCxDQUFvQkQsS0FBcEIsQ0FBSixFQUFnQztBQUM5QixlQUFPQSxLQUFQO0FBQ0Q7O0FBRUQsVUFBSSxnQkFBS0UsTUFBTCxDQUFZRixLQUFaLEtBQXNCRyxNQUFNQyxPQUFOLENBQWNKLEtBQWQsQ0FBMUIsRUFBZ0Q7QUFDOUNBLGdCQUFRLEVBQUVaLE9BQU9ZLEtBQVQsRUFBUjtBQUNEOztBQUVELFVBQUksNkJBQWNBLEtBQWQsQ0FBSixFQUEwQjtBQUN4QixlQUFPWCxTQUFTZ0IsUUFBVCxDQUFrQkwsS0FBbEIsQ0FBUDtBQUNEOztBQUVELFlBQU0sSUFBSU0sS0FBSiw2RkFBc0dOLEtBQXRHLENBQU47QUFDRDs7QUFFRDs7Ozs7Ozs7OzZCQU9nQlQsTSxFQUFRO0FBQ3RCLFVBQUlGLFNBQVNZLFVBQVQsQ0FBb0JWLE1BQXBCLENBQUosRUFBaUM7QUFDL0IsZUFBT0EsTUFBUDtBQUNEOztBQUhxQix5QkFTbEJBLE1BVGtCLENBTXBCTixJQU5vQjtBQUFBLFVBTXBCQSxJQU5vQixnQ0FNYixFQU5hO0FBQUEsd0JBU2xCTSxNQVRrQixDQU9wQkwsR0FQb0I7QUFBQSxVQU9wQkEsR0FQb0IsK0JBT2QsNEJBUGM7QUFBQSwwQkFTbEJLLE1BVGtCLENBUXBCSCxLQVJvQjtBQUFBLFVBUXBCQSxLQVJvQixpQ0FRWixFQVJZOzs7QUFXdEIsVUFBTW1CLFdBQVcsSUFBSWxCLFFBQUosQ0FBYTtBQUM1QkgsZ0JBRDRCO0FBRTVCRCxjQUFNLG1CQUFRQSxJQUFSLENBRnNCO0FBRzVCRyxlQUFPLG9CQUFTQSxNQUFNTyxHQUFOLENBQVUsZUFBS1UsUUFBZixDQUFUO0FBSHFCLE9BQWIsQ0FBakI7O0FBTUEsYUFBT0UsUUFBUDtBQUNEOztBQUVEOzs7Ozs7OztBQU1BOzs7Ozs7OytCQU9rQkMsRyxFQUFLO0FBQ3JCLGFBQU8sQ0FBQyxFQUFFQSxPQUFPQSxJQUFJLHFCQUFZQyxRQUFoQixDQUFULENBQVI7QUFDRDs7OztFQW5Fb0IsdUJBQU96QixRQUFQLEM7O0FBa0l2Qjs7OztBQWxJTUssUSxDQXdER3FCLE0sR0FBU3JCLFNBQVNnQixRO0FBOEUzQmhCLFNBQVNzQixTQUFULENBQW1CLHFCQUFZRixRQUEvQixJQUEyQyxJQUEzQzs7QUFFQTs7OztBQUlBRyxPQUFPQyxtQkFBUCxDQUEyQixlQUFLRixTQUFoQyxFQUEyQ0csT0FBM0MsQ0FBbUQsVUFBQ0MsTUFBRCxFQUFZO0FBQzdELE1BQUlBLFVBQVUsYUFBZCxFQUE2QjtBQUM3QjFCLFdBQVNzQixTQUFULENBQW1CSSxNQUFuQixJQUE2QixlQUFLSixTQUFMLENBQWVJLE1BQWYsQ0FBN0I7QUFDRCxDQUhEOztBQUtBOzs7Ozs7a0JBTWUxQixRIiwiZmlsZSI6ImRvY3VtZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIFByZXZlbnQgY2lyY3VsYXIgZGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCAnLi9ibG9jaydcbmltcG9ydCAnLi9pbmxpbmUnXG5cbi8qKlxuICogRGVwZW5kZW5jaWVzLlxuICovXG5cbmltcG9ydCBpc1BsYWluT2JqZWN0IGZyb20gJ2lzLXBsYWluLW9iamVjdCdcbmltcG9ydCB7IExpc3QsIE1hcCwgUmVjb3JkIH0gZnJvbSAnaW1tdXRhYmxlJ1xuXG5pbXBvcnQgTm9kZSBmcm9tICcuL25vZGUnXG5pbXBvcnQgTU9ERUxfVFlQRVMgZnJvbSAnLi4vY29uc3RhbnRzL21vZGVsLXR5cGVzJ1xuaW1wb3J0IGdlbmVyYXRlS2V5IGZyb20gJy4uL3V0aWxzL2dlbmVyYXRlLWtleSdcblxuLyoqXG4gKiBEZWZhdWx0IHByb3BlcnRpZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgZGF0YTogbmV3IE1hcCgpLFxuICBrZXk6IHVuZGVmaW5lZCxcbiAgbm9kZXM6IG5ldyBMaXN0KCksXG59XG5cbi8qKlxuICogRG9jdW1lbnQuXG4gKlxuICogQHR5cGUge0RvY3VtZW50fVxuICovXG5cbmNsYXNzIERvY3VtZW50IGV4dGVuZHMgUmVjb3JkKERFRkFVTFRTKSB7XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgRG9jdW1lbnRgIHdpdGggYGF0dHJzYC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8QXJyYXl8TGlzdHxUZXh0fSBhdHRyc1xuICAgKiBAcmV0dXJuIHtEb2N1bWVudH1cbiAgICovXG5cbiAgc3RhdGljIGNyZWF0ZShhdHRycyA9IHt9KSB7XG4gICAgaWYgKERvY3VtZW50LmlzRG9jdW1lbnQoYXR0cnMpKSB7XG4gICAgICByZXR1cm4gYXR0cnNcbiAgICB9XG5cbiAgICBpZiAoTGlzdC5pc0xpc3QoYXR0cnMpIHx8IEFycmF5LmlzQXJyYXkoYXR0cnMpKSB7XG4gICAgICBhdHRycyA9IHsgbm9kZXM6IGF0dHJzIH1cbiAgICB9XG5cbiAgICBpZiAoaXNQbGFpbk9iamVjdChhdHRycykpIHtcbiAgICAgIHJldHVybiBEb2N1bWVudC5mcm9tSlNPTihhdHRycylcbiAgICB9XG5cbiAgICB0aHJvdyBuZXcgRXJyb3IoYFxcYERvY3VtZW50LmNyZWF0ZVxcYCBvbmx5IGFjY2VwdHMgb2JqZWN0cywgYXJyYXlzLCBsaXN0cyBvciBkb2N1bWVudHMsIGJ1dCB5b3UgcGFzc2VkIGl0OiAke2F0dHJzfWApXG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgYERvY3VtZW50YCBmcm9tIGEgSlNPTiBgb2JqZWN0YC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R8RG9jdW1lbnR9IG9iamVjdFxuICAgKiBAcmV0dXJuIHtEb2N1bWVudH1cbiAgICovXG5cbiAgc3RhdGljIGZyb21KU09OKG9iamVjdCkge1xuICAgIGlmIChEb2N1bWVudC5pc0RvY3VtZW50KG9iamVjdCkpIHtcbiAgICAgIHJldHVybiBvYmplY3RcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBkYXRhID0ge30sXG4gICAgICBrZXkgPSBnZW5lcmF0ZUtleSgpLFxuICAgICAgbm9kZXMgPSBbXSxcbiAgICB9ID0gb2JqZWN0XG5cbiAgICBjb25zdCBkb2N1bWVudCA9IG5ldyBEb2N1bWVudCh7XG4gICAgICBrZXksXG4gICAgICBkYXRhOiBuZXcgTWFwKGRhdGEpLFxuICAgICAgbm9kZXM6IG5ldyBMaXN0KG5vZGVzLm1hcChOb2RlLmZyb21KU09OKSksXG4gICAgfSlcblxuICAgIHJldHVybiBkb2N1bWVudFxuICB9XG5cbiAgLyoqXG4gICAqIEFsaWFzIGBmcm9tSlNgLlxuICAgKi9cblxuICBzdGF0aWMgZnJvbUpTID0gRG9jdW1lbnQuZnJvbUpTT05cblxuICAvKipcbiAgICogQ2hlY2sgaWYgYGFueWAgaXMgYSBgRG9jdW1lbnRgLlxuICAgKlxuICAgKiBAcGFyYW0ge0FueX0gYW55XG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqL1xuXG4gIHN0YXRpYyBpc0RvY3VtZW50KGFueSkge1xuICAgIHJldHVybiAhIShhbnkgJiYgYW55W01PREVMX1RZUEVTLkRPQ1VNRU5UXSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIG5vZGUncyBraW5kLlxuICAgKlxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqL1xuXG4gIGdldCBraW5kKCkge1xuICAgIHJldHVybiAnZG9jdW1lbnQnXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2sgaWYgdGhlIGRvY3VtZW50IGlzIGVtcHR5LlxuICAgKlxuICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgKi9cblxuICBnZXQgaXNFbXB0eSgpIHtcbiAgICByZXR1cm4gdGhpcy50ZXh0ID09ICcnXG4gIH1cblxuICAvKipcbiAgICogR2V0IHRoZSBjb25jYXRlbmF0ZWQgdGV4dCBvZiBhbGwgdGhlIGRvY3VtZW50J3MgY2hpbGRyZW4uXG4gICAqXG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICovXG5cbiAgZ2V0IHRleHQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0VGV4dCgpXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJuIGEgSlNPTiByZXByZXNlbnRhdGlvbiBvZiB0aGUgZG9jdW1lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAqIEByZXR1cm4ge09iamVjdH1cbiAgICovXG5cbiAgdG9KU09OKG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IG9iamVjdCA9IHtcbiAgICAgIGtpbmQ6IHRoaXMua2luZCxcbiAgICAgIGRhdGE6IHRoaXMuZGF0YS50b0pTT04oKSxcbiAgICAgIG5vZGVzOiB0aGlzLm5vZGVzLnRvQXJyYXkoKS5tYXAobiA9PiBuLnRvSlNPTihvcHRpb25zKSksXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucHJlc2VydmVLZXlzKSB7XG4gICAgICBvYmplY3Qua2V5ID0gdGhpcy5rZXlcbiAgICB9XG5cbiAgICByZXR1cm4gb2JqZWN0XG4gIH1cblxuICAvKipcbiAgICogQWxpYXMgYHRvSlNgLlxuICAgKi9cblxuICB0b0pTKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdGhpcy50b0pTT04ob3B0aW9ucylcbiAgfVxuXG59XG5cbi8qKlxuICogQXR0YWNoIGEgcHNldWRvLXN5bWJvbCBmb3IgdHlwZSBjaGVja2luZy5cbiAqL1xuXG5Eb2N1bWVudC5wcm90b3R5cGVbTU9ERUxfVFlQRVMuRE9DVU1FTlRdID0gdHJ1ZVxuXG4vKipcbiAqIE1peCBpbiBgTm9kZWAgbWV0aG9kcy5cbiAqL1xuXG5PYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhOb2RlLnByb3RvdHlwZSkuZm9yRWFjaCgobWV0aG9kKSA9PiB7XG4gIGlmIChtZXRob2QgPT0gJ2NvbnN0cnVjdG9yJykgcmV0dXJuXG4gIERvY3VtZW50LnByb3RvdHlwZVttZXRob2RdID0gTm9kZS5wcm90b3R5cGVbbWV0aG9kXVxufSlcblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge0RvY3VtZW50fVxuICovXG5cbmV4cG9ydCBkZWZhdWx0IERvY3VtZW50XG4iXX0=