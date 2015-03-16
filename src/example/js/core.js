(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {
var ph;
	var span = [];

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	function _dateFormat(date) {
		var string = date.getFullYear() + "-";
		string += (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-";
		string += (date.getDate() < 9 ? "0" + date.getDate() : date.getDate());
		return string;
	}

	function _compare(date, today) {
		return (date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate());
	}

	function getPh(days) {
		var start = days[0].date.getFullYear();
		var stop = days[days.length - 1].date.getFullYear();
		if (span[0] <= start && span[1] >= stop) return;
		if (!span[0] || start < span[0]) span[0] = start;
		if (!span[1] || stop > span[1]) span[1] = stop;
		ph = publicHolidays.getAll(span[0], span[1]);
	}
	var today = new Date();
	var rgbaRedEven = 'rgba(255,65,54,1)';
	var rgbaRedOdd = 'rgba(255,65,54,0.8)';
	var rgbaDefaultEven = 'rgba(241,241,241,1)';
	var rgbaDefaultOdd = 'rgba(241,241,241,0.8)';
	var rgbaToday = 'blue';
	var rgbaRef = 'purple';
	var ref = new Date('2015-03-08');
	var hover = document.getElementById('hover');

	function getColor(day) {
		if (_compare(day.date, ref)) return rgbaRef;
		if (_compare(day.date, today)) return rgbaToday;
		if (day.date.getDay() == 6 || day.date.getDay() === 0) {
			return day.week % 2 ? rgbaRedEven : rgbaRedOdd;
		} else {
			var d = ph[publicHolidays.format(day.date)];
			if (d && d.reduction >= 4) {
				return day.week % 2 ? rgbaRedEven : rgbaRedOdd;
			}
		}
		return day.week % 2 ? rgbaDefaultEven : rgbaDefaultOdd;
	}
	var bla = ['left', 'right', 'center'];
	var bla2 = ['month', 'week'];
	for (var i = 0; i < 4; i++) {
		new Tycal({
			container: document.getElementById('calendar-' + i),
			expandFrom: bla[i % 3],
			type: bla2[i % 2],
			date: ref,
			onSetDayTooltip: function (day) {
				var d = ph[publicHolidays.format(day.date)];
				if (d) return _dateFormat(day.date) + ' (' + d.title + ')';
				return _dateFormat(day.date);
			},
			onSetDayColor: function (day) {
				return getColor(day, hover);
			},
			onPopulateDaysFinished: function (days) {
				getPh(days);
			},
			onDrawMonthName: function (date, el) {
				if (date.getMonth() == ref.getMonth() && date.getFullYear() == ref.getFullYear()) {
					el.classList.add('month-name-today');
				}
			}
		});
	}
	});

}).call(this); /* not added */