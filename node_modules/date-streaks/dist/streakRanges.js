'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _helpers = require('./helpers');

var _summary2 = require('./summary');

var _summary3 = _interopRequireDefault(_summary2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function streakRanges() {
  var datesParam = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  var dates = (0, _helpers.getDatesParameter)(datesParam);
  if (dates.length === 0) {
    return [];
  }

  var _summary = (0, _summary3.default)({ dates: dates }),
      _summary$streaks = _summary.streaks,
      streaks = _summary$streaks === undefined ? [] : _summary$streaks;

  var allDates = [].concat(_toConsumableArray((0, _helpers.sortDates)(dates)));

  return streaks.reduce(function (acc, streak) {
    var start = void 0,
        end = void 0;
    var days = allDates.slice(0, streak);
    allDates.splice(0, streak);

    if (days && days.length > 1) {
      start = new Date(days[0]);
      end = new Date(days[days.length - 1]);
    } else {
      start = new Date(days[0]);
      end = null;
    }

    return [].concat(_toConsumableArray(acc), [{
      start: start,
      end: end,
      duration: streak
    }]);
  }, []).reverse();
}

exports.default = streakRanges;