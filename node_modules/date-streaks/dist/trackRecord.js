'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _start_of_day = require('date-fns/start_of_day');

var _start_of_day2 = _interopRequireDefault(_start_of_day);

var _sub_days = require('date-fns/sub_days');

var _sub_days2 = _interopRequireDefault(_sub_days);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var trackRecord = function trackRecord(_ref) {
  var _ref$dates = _ref.dates,
      dates = _ref$dates === undefined ? [] : _ref$dates,
      _ref$length = _ref.length,
      length = _ref$length === undefined ? 7 : _ref$length,
      _ref$endDate = _ref.endDate,
      endDate = _ref$endDate === undefined ? new Date() : _ref$endDate;

  var pastDates = [].concat(_toConsumableArray(Array(length))).map(function (_, i) {
    return (0, _start_of_day2.default)((0, _sub_days2.default)(endDate, i));
  });
  var sortedDates = (0, _helpers.sortDates)(dates).map(function (date) {
    return (0, _start_of_day2.default)(date).getTime();
  });

  var result = pastDates.reduce(function (acc, pastDate) {
    acc = _extends({}, acc, _defineProperty({}, pastDate, sortedDates.includes(pastDate.getTime())));
    return acc;
  }, {});

  return result;
};

exports.default = trackRecord;