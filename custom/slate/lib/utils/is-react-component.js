"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

/**
 * Check if an `object` is a React component.
 *
 * @param {Object} object
 * @return {Boolean}
 */

function isReactComponent(object) {
  return object && object.prototype && object.prototype.isReactComponent;
}

/**
 * Export.
 *
 * @type {Function}
 */

exports.default = isReactComponent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9pcy1yZWFjdC1jb21wb25lbnQuanMiXSwibmFtZXMiOlsiaXNSZWFjdENvbXBvbmVudCIsIm9iamVjdCIsInByb3RvdHlwZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0E7Ozs7Ozs7QUFPQSxTQUFTQSxnQkFBVCxDQUEwQkMsTUFBMUIsRUFBa0M7QUFDaEMsU0FDRUEsVUFDQUEsT0FBT0MsU0FEUCxJQUVBRCxPQUFPQyxTQUFQLENBQWlCRixnQkFIbkI7QUFLRDs7QUFFRDs7Ozs7O2tCQU1lQSxnQiIsImZpbGUiOiJpcy1yZWFjdC1jb21wb25lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbi8qKlxuICogQ2hlY2sgaWYgYW4gYG9iamVjdGAgaXMgYSBSZWFjdCBjb21wb25lbnQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBpc1JlYWN0Q29tcG9uZW50KG9iamVjdCkge1xuICByZXR1cm4gKFxuICAgIG9iamVjdCAmJlxuICAgIG9iamVjdC5wcm90b3R5cGUgJiZcbiAgICBvYmplY3QucHJvdG90eXBlLmlzUmVhY3RDb21wb25lbnRcbiAgKVxufVxuXG4vKipcbiAqIEV4cG9ydC5cbiAqXG4gKiBAdHlwZSB7RnVuY3Rpb259XG4gKi9cblxuZXhwb3J0IGRlZmF1bHQgaXNSZWFjdENvbXBvbmVudFxuIl19