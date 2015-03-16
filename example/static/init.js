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
(function () {
	'use strict';
	var publicHolidays = {};
	publicHolidays.getEaster = function (year) {
		var base = 10,
			a = parseInt(year % 19, base),
			b = parseInt(year / 100, base),
			c = parseInt(year % 100, base),
			d = parseInt(b / 4, base),
			e = parseInt(b % 4, base),
			f = parseInt((b + 8) / 25, base),
			g = parseInt((b - f + 1) / 3, base),
			h = parseInt((19 * a + b - d - g + 15) % 30, base),
			i = parseInt(c / 4, base),
			k = parseInt(c % 4, base),
			l = parseInt((32 + 2 * e + 2 * i - h - k) % 7, base),
			m = parseInt((a + 11 * h + 22 * l) / 451, base),
			n = parseInt((h + l - 7 * m + 114) / 31, base),
			p = parseInt((h + l - 7 * m + 114) % 31, base),
			sun = new Date(year, n - 1, p + 1);

		var thu = new Date(sun);
		thu.setDate(thu.getDate() - 3);
		var fri = new Date(sun);
		fri.setDate(fri.getDate() - 2);
		var sat = new Date(sun);
		sat.setDate(sat.getDate() - 1);
		var mon = new Date(sun);
		mon.setDate(mon.getDate() + 1);
		var hev = new Date(sun);
		hev.setDate(hev.getDate() + 4 + 5 * 7);
		var pind = new Date(sun);
		pind.setDate(pind.getDate() + 7 * 7);
		var pina = new Date(pind);
		pina.setDate(pina.getDate() - 1);
		return [{
			title: 'Skärtorsdag',
			key: 'easter_thursday',
			lang: 'sv',
			reduction: 4,
			date: thu
		}, {
			title: 'Långredag',
			key: 'easter_friday',
			lang: 'sv',
			reduction: 8,
			date: fri
		}, {
			title: 'Påskafton',
			key: 'easter_saturday',
			lang: 'sv',
			reduction: 8,
			date: sat
		}, {
			title: 'Påskdagen',
			key: 'easter_sunday',
			lang: 'sv',
			reduction: 8,
			date: sun
		}, {
			title: 'Annandag påsk',
			key: 'easter_monday',
			lang: 'sv',
			reduction: 8,
			date: mon
		}, {
			title: 'Kristi himmelsfärdsdag',
			key: '?',
			lang: 'sv',
			reduction: 8,
			date: hev
		}, {
			title: 'Pingstafton',
			key: '?',
			lang: 'sv',
			reduction: 8,
			date: pina
		}, {
			title: 'Pingstdagen',
			key: '?',
			lang: 'sv',
			reduction: 8,
			date: pind
		}];
	};
	publicHolidays.getHallowSaints = function (year) {
		function getDay(from, to, day) {
			if (from.getDay() == day) {
				return new Date(from);
			} else if (to.getDay() == day) {
				return new Date(to);
			} else {
				while (from < to) {
					from.setDate(from.getDate() + 1);
					if (from.getDay() == day) return new Date(from);
				}
			}
		}
		var dayFrom = new Date(year, 9, 31);
		var dayTo = new Date(year, 10, 6);

		var eveFrom = new Date(year, 9, 30);
		var eveTo = new Date(year, 10, 5);

		return [{
			title: 'Alla helgons afton',
			key: 'all_saints_eve',
			lang: 'sv',
			reduction: 4,
			date: getDay(eveFrom, eveTo, 5)
		}, {
			title: 'Alla helgons dag',
			key: 'all_saints_day',
			lang: 'sv',
			reduction: 8,
			date: getDay(dayFrom, dayTo, 6)
		}];
	};
	publicHolidays.getMidsummer = function (year) {
		var fri = new Date(year, 5, 19);
		fri.setDate(fri.getDate() + (5 - fri.getDay()));
		var sat = new Date(fri);
		sat.setDate(sat.getDate() + 1);
		return [{
			title: 'Midsommarafton',
			key: 'midsummer_eve',
			lang: 'sv',
			reduction: 8,
			date: fri
		}, {
			title: 'Midsommardagen',
			key: 'midsummer_day',
			lang: 'sv',
			reduction: 8,
			date: sat
		}];
	};
	publicHolidays.getStaticDates = function (year) {
		var staticHolidays = [];
		staticHolidays.push({
			title: 'Nyårsdagen',
			key: 'new_years_day',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 0, 1)
		});
		staticHolidays.push({
			title: 'Trettondagsafton',
			key: 'thirteen_days_eve',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 0, 5)
		});
		staticHolidays.push({
			title: 'Trettondagsafton',
			key: '?',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 0, 5)
		});
		staticHolidays.push({
			title: 'Trettondedag jul',
			key: '?',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 0, 6)
		});
		staticHolidays.push({
			title: 'Valborgsmässoafton',
			key: '?',
			lang: 'sv',
			reduction: 4,
			date: new Date(year, 3, 30)
		});
		staticHolidays.push({
			title: 'Första maj',
			key: 'first_of_may',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 4, 1)
		});
		staticHolidays.push({
			title: 'Sveriges nationaldag',
			key: 'sweden_national_holiday',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 5, 6)
		});
		staticHolidays.push({
			title: 'Halloween',
			key: 'halloween',
			lang: 'sv',
			reduction: 0,
			date: new Date(year, 9, 31)
		});
		staticHolidays.push({
			title: 'Nyårsafton',
			key: 'new_years_eve',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 11, 31)
		});
		staticHolidays.push({
			title: 'Julafton',
			key: 'christmas_eve',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 11, 24)
		});
		staticHolidays.push({
			title: 'Juldagen',
			key: 'christmas_day',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 11, 25)
		});
		staticHolidays.push({
			title: 'Annandag jul',
			key: 'boxing_day',
			lang: 'sv',
			reduction: 8,
			date: new Date(year, 11, 26)
		});

		return staticHolidays;
	};
	publicHolidays.getAll = function (yearFrom, yearTo) {
		var arr = [];
		for (var year = yearFrom; year <= yearTo; year++) {
			var yr = publicHolidays.getAllByYear(year);
			arr = arr.concat(yr);
		}
		arr.sort(function (a, b) {
			if (a.date > b.date) return 1;
			if (a.date < b.date) return -1;
			return 0;
		});
		var obj = {};
		for (var i in arr) {
			var d = arr[i];
			obj[publicHolidays.format(d.date)] = d;
		}
		return obj;
	};
	publicHolidays.getAllByYear = function (year) {
		if (year === undefined) {
			var now = new Date();
			year = now.getFullYear();
		}
		var a = publicHolidays.getEaster(year);
		var b = publicHolidays.getMidsummer(year);
		var c = publicHolidays.getHallowSaints(year);
		var d = publicHolidays.getStaticDates(year);
		return a.concat(b, c, d);
	};
	publicHolidays.format = function (date) {
		var string = date.getFullYear() + "-";
		string += (date.getMonth() < 9 ? "0" + (date.getMonth() + 1) : (date.getMonth() + 1)) + "-";
		string += (date.getDate() < 9 ? "0" + date.getDate() : date.getDate());
		return string;
	};
	this.publicHolidays = publicHolidays;
}).call(this);
