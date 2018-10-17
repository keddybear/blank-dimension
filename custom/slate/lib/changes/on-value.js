'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _value = require('../models/value');

var _value2 = _interopRequireDefault(_value);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Changes.
 *
 * @type {Object}
 */

var Changes = {};

/**
 * Set `properties` on the value.
 *
 * @param {Change} change
 * @param {Object|Value} properties
 */

Changes.setValue = function (change, properties) {
  properties = _value2.default.createProperties(properties);
  var value = change.value;


  change.applyOperation({
    type: 'set_value',
    properties: properties,
    value: value
  });
};

/**
 * Export.
 *
 * @type {Object}
 */

exports.default = Changes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jaGFuZ2VzL29uLXZhbHVlLmpzIl0sIm5hbWVzIjpbIkNoYW5nZXMiLCJzZXRWYWx1ZSIsImNoYW5nZSIsInByb3BlcnRpZXMiLCJjcmVhdGVQcm9wZXJ0aWVzIiwidmFsdWUiLCJhcHBseU9wZXJhdGlvbiIsInR5cGUiXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBOzs7Ozs7QUFFQTs7Ozs7O0FBTUEsSUFBTUEsVUFBVSxFQUFoQjs7QUFFQTs7Ozs7OztBQU9BQSxRQUFRQyxRQUFSLEdBQW1CLFVBQUNDLE1BQUQsRUFBU0MsVUFBVCxFQUF3QjtBQUN6Q0EsZUFBYSxnQkFBTUMsZ0JBQU4sQ0FBdUJELFVBQXZCLENBQWI7QUFEeUMsTUFFakNFLEtBRmlDLEdBRXZCSCxNQUZ1QixDQUVqQ0csS0FGaUM7OztBQUl6Q0gsU0FBT0ksY0FBUCxDQUFzQjtBQUNwQkMsVUFBTSxXQURjO0FBRXBCSiwwQkFGb0I7QUFHcEJFO0FBSG9CLEdBQXRCO0FBS0QsQ0FURDs7QUFXQTs7Ozs7O2tCQU1lTCxPIiwiZmlsZSI6Im9uLXZhbHVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgVmFsdWUgZnJvbSAnLi4vbW9kZWxzL3ZhbHVlJ1xuXG4vKipcbiAqIENoYW5nZXMuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5jb25zdCBDaGFuZ2VzID0ge31cblxuLyoqXG4gKiBTZXQgYHByb3BlcnRpZXNgIG9uIHRoZSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge0NoYW5nZX0gY2hhbmdlXG4gKiBAcGFyYW0ge09iamVjdHxWYWx1ZX0gcHJvcGVydGllc1xuICovXG5cbkNoYW5nZXMuc2V0VmFsdWUgPSAoY2hhbmdlLCBwcm9wZXJ0aWVzKSA9PiB7XG4gIHByb3BlcnRpZXMgPSBWYWx1ZS5jcmVhdGVQcm9wZXJ0aWVzKHByb3BlcnRpZXMpXG4gIGNvbnN0IHsgdmFsdWUgfSA9IGNoYW5nZVxuXG4gIGNoYW5nZS5hcHBseU9wZXJhdGlvbih7XG4gICAgdHlwZTogJ3NldF92YWx1ZScsXG4gICAgcHJvcGVydGllcyxcbiAgICB2YWx1ZSxcbiAgfSlcbn1cblxuLyoqXG4gKiBFeHBvcnQuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqL1xuXG5leHBvcnQgZGVmYXVsdCBDaGFuZ2VzXG4iXX0=