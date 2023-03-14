'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _difference_in_days = require('date-fns/difference_in_days');

var _difference_in_days2 = _interopRequireDefault(_difference_in_days);

var _helpers = require('./helpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function summary() {
  var datesParam = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var dates = (0, _helpers.getDatesParameter)(datesParam);

  var _relativeDates = (0, _helpers.relativeDates)(),
      today = _relativeDates.today,
      yesterday = _relativeDates.yesterday;

  var allDates = (0, _helpers.filterInvalidDates)(dates);
  var sortedDates = (0, _helpers.sortDates)(allDates);

  var result = sortedDates.reduce(function (acc, date, index) {
    var first = new Date(date);
    var second = sortedDates[index + 1] ? new Date(sortedDates[index + 1]) : first;
    var diff = (0, _difference_in_days2.default)(second, first);
    var isToday = acc.isToday || (0, _difference_in_days2.default)(date, today) === 0;
    var isYesterday = acc.isYesterday || (0, _difference_in_days2.default)(date, yesterday) === 0;
    var isInFuture = acc.isInFuture || (0, _difference_in_days2.default)(today, date) < 0;

    if (diff === 0) {
      if (isToday) {
        acc.todayInStreak = true;
      }
    } else {
      diff === 1 ? ++acc.streaks[acc.streaks.length - 1] : acc.streaks.push(1);
    }

    return _extends({}, acc, {
      longestStreak: Math.max.apply(Math, _toConsumableArray(acc.streaks)),
      withinCurrentStreak: acc.isToday || acc.isYesterday || acc.isInFuture || isToday || isYesterday || isInFuture,
      currentStreak: isToday || isYesterday || isInFuture ? acc.streaks[acc.streaks.length - 1] : 0,
      isInFuture: isInFuture,
      isYesterday: isYesterday,
      isToday: isToday
    });
  }, {
    currentStreak: 0,
    longestStreak: 0,
    streaks: [1],
    todayInStreak: false,
    withinCurrentStreak: false,
    isInFuture: false,
    isToday: false,
    isYesterday: false
  });

  var isToday = result.isToday,
      isYesterday = result.isYesterday,
      isInFuture = result.isInFuture,
      rest = _objectWithoutProperties(result, ['isToday', 'isYesterday', 'isInFuture']);

  return rest;
}

exports.default = summary;