/**!
 * # tycal
 * Author: Tomas Green (http://www.github.com/tomasgreen)
 * License: MIT
 * Version: 0.1.0
 */

(function () {
	'use strict';

	var _monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	var _dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

	function _extend(sup, obj) {
		obj.prototype = Object.create(sup.prototype);
		obj.prototype.constructor = obj;
		return obj;
	}

	function _dateGetRealDay(date) {
		var a = [6, 0, 1, 2, 3, 4, 5];
		return a[date.getDay()];
	}

	function _dateReset(date) {
		var d = new Date(date);
		d.setHours(0);
		d.setMinutes(0);
		d.setSeconds(0);
		return d;
	}

	function _dateGetWeek(date) {
		var d = new Date(date);
		d.setHours(0, 0, 0);
		d.setDate(d.getDate() + 4 - (d.getDay() || 7));
		var yearStart = new Date(d.getFullYear(), 0, 1);
		return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
	}

	function _removeChildren(el) {
		if (!el || !el.firstChild) return;
		el.removeChild(el.firstChild);
		_removeChildren(el);
	}

	function _createElement(ns, type, attr, parent, html) {
		var el, cls, id, arr;
		if (!attr) attr = {};
		if (type.indexOf('.') !== -1) {
			arr = type.split('.');
			type = arr[0];
			arr.shift();
			attr.class = arr.join(' ');
		}
		if (type.indexOf('#') !== -1) {
			arr = type.split('#');
			type = arr[0];
			attr.id = arr[1];
		}
		if (ns == 'svg') el = document.createElementNS('http://www.w3.org/2000/svg', type);
		else el = document.createElement(type);
		for (var i in attr) el.setAttribute(i, attr[i]);
		if (parent) parent.appendChild(el);
		if (html) el.innerHTML = html;
		return el;
	}

	function _isTouch(e) {
		return (e.toString().toLowerCase() == '[object touchevent]');
	}

	function _toInt(n) {
		return parseInt(n, 10);
	}

	function _first(a) {
		return a[0];
	}

	function _last(a) {
		return a[a.length - 1];
	}

	function _each(o, func) {
		if (!o || (o.length === 0 && o != window)) return;
		if (!o.length) func(o);
		else Array.prototype.forEach.call(o, function (el, i) {
			func(el);
		});
	}

	function _on(els, events, func, useCapture) {
		_each(els, function (el) {
			var ev = events.split(' ');
			for (var e in ev) el.addEventListener(ev[e], func, useCapture);
		});
	}

	function _attr(els, attrib, value) {
		_each(els, function (el) {
			el.setAttribute(attrib, value);
		});
	}

	function _numColumnsWeek(el, padding, width) {
		/*
			-1 to ensure that we don't get weeks outside the container
		*/
		return _toInt((el.offsetWidth + padding) / width) - 1;
	}

	function _numColumnsMonth(el, padding, width) {
		/*
			-1 to ensure that we don't get months outside the container
		*/
		return _toInt((el.offsetWidth + padding + width) / (width * 8)) - 1;
	}

	function _setOptions(opt) {
		if (opt === undefined) opt = {};
		var o = {};
		for (var i in defaults) o[i] = (opt[i] !== undefined) ? opt[i] : defaults[i];
		return o;
	}

	function _getPosition(e) {
		var parentPosition = _getElemenntPosition(e.currentTarget);
		if (_isTouch(e)) {
			return {
				x: e.layerX,
				y: e.layerY
			};
		} else {
			return {
				x: e.pageX - parentPosition.x,
				y: e.pageY - parentPosition.y
			};
		}
	}

	function _getElemenntPosition(element) {
		var coord = {
			x: 0,
			y: 0
		};
		while (element) {
			coord.x += (element.offsetLeft - element.scrollLeft + element.clientLeft);
			coord.y += (element.offsetTop - element.scrollTop + element.clientTop);
			element = element.offsetParent;
		}
		return coord;
	}

	/* **************************************************** */

	var Renderer = function (ref) {
		this.ref = ref;
	};
	Renderer.prototype.drawDays = function (days) {
		for (var i in days) {
			this.drawDay(days[i]);
		}
	};
	Renderer.prototype.drawMonths = function (months) {
		for (var i in months) {
			this.drawMonth(months[i]);
		}
	};
	Renderer.prototype.createElement = function (type, attr, parent, html) {
		return _createElement(this.graphics, type, attr, parent, html);
	};


	var SVGRenderer = _extend(Renderer, function (ref) {
		this.graphics = 'svg';
		Renderer.call(this, ref);
	});
	SVGRenderer.prototype.drawDay = function (day) {
		var rect = this.ref.element.querySelector('[x="' + day.coord.x + '"][y="' + day.coord.y + '"]');
		if (!rect) {
			var attr = {
				'x': day.coord.x,
				'y': day.coord.y,
				'width': day.coord.w,
				'height': day.coord.h,
				'class': 'tycal-day'
			};
			rect = this.createElement('rect', attr, this.ref.dayGroup);
		}
		if (this.ref.opt.onSetDayColor) {
			rect.style.fill = this.ref.opt.onSetDayColor(day);
		}
		if (this.ref.opt.onDrawDay) {
			this.ref.opt.onDrawDay(day, rect);
		}
	};
	SVGRenderer.prototype.resetDays = function () {
		if (!this.ref.dayGroup) {
			this.ref.dayGroup = this.createElement('g', null, this.ref.element);
		}
		_removeChildren(this.ref.dayGroup);
	};
	SVGRenderer.prototype.drawHover = function (day) {
		var rect = this.ref.element.querySelector('[x="' + day.coord.x + '"][y="' + day.coord.y + '"]');
		if (rect) rect.style.fill = 'rgba(0,0,0,0.5)';
	};
	SVGRenderer.prototype.setDimensions = function (width, height) {
		_attr(this.ref.element, 'width', width);
		_attr(this.ref.element, 'height', height);
	};


	var CanvasRenderer = _extend(Renderer, function (ref) {
		Renderer.call(this, ref);
	});
	CanvasRenderer.prototype.drawDay = function (day) {
		if (this.ref.opt.onSetDayColor) {
			this.ref.context.fillStyle = this.ref.opt.onSetDayColor(day);
		}
		if (this.ref.opt.onDrawDay) {
			this.ref.opt.onDrawDay(day, this.ref.context);
		}
		this.ref.context.clearRect(
			day.coord.x - this.ref.opt.padding,
			day.coord.y - this.ref.opt.padding,
			day.coord.w + this.ref.opt.padding * 2,
			day.coord.h + this.ref.opt.padding * 2
		);
		this.ref.context.fillRect(day.coord.x, day.coord.y, day.coord.w, day.coord.h);
	};
	CanvasRenderer.prototype.drawHover = function (day) {
		this.ref.context.fillStyle = 'rgba(0,0,0,0.5)';
		this.ref.context.fillRect(day.coord.x, day.coord.y, day.coord.w, day.coord.h);
	};
	CanvasRenderer.prototype.resetDays = function () {
		this.ref.context.clearRect(0, 0, this.ref.element.width, this.ref.element.height);
	};
	CanvasRenderer.prototype.drawMonth = function (month) {
		if (this.ref.opt.onSetMonthColor) {
			this.ref.context.fillStyle = this.ref.opt.onSetMonthColor(month);
		}
		if (this.ref.opt.onDrawMonth) {
			this.ref.opt.onDrawMonth(month, this.ref.context);
		}
		this.ref.context.clearRect(
			month.coord.x - this.ref.opt.padding,
			month.coord.y - this.ref.opt.padding,
			month.coord.w + this.ref.opt.padding * 2,
			month.coord.h + this.ref.opt.padding * 2
		);
		this.ref.context.fillRect(month.coord.x, month.coord.y, month.coord.w, month.coord.h);
	};
	CanvasRenderer.prototype.setDimensions = function (width, height) {
		var r = window.devicePixelRatio || 1;
		_attr(this.ref.element, 'width', width * r);
		_attr(this.ref.element, 'height', height * r);
		this.ref.element.style.width = width + "px";
		this.ref.element.style.height = height + "px";
		this.ref.context.scale(r, r);
	};


	/* **************************************************** */

	var defaults = {
		container: null,
		startDate: null,
		stopDate: null,
		date: null,
		expandFrom: 'right',
		type: 'week',
		graphics: 'canvas',
		padding: 1,
		cellSize: 10,
		onSetDayColor: null,
		onSetDayTooltip: null,
		onDrawDay: null,
		onDrawMonthName: null,
		onDayHover: null,
		onPopulateDaysFinished: null
	};

	var Base = function (options) {
		if (!options.container) return;

		this.opt = _setOptions(options);
		this.opt.date = _dateReset(this.opt.date);

		if (this.opt.graphics == 'svg') {
			this.renderer = new SVGRenderer(this);
			this.element = this.renderer.createElement('svg', null, this.opt.container);
		} else {
			this.renderer = new CanvasRenderer(this);
			this.element = this.renderer.createElement('canvas', null, this.opt.container);
			this.context = this.element.getContext('2d');
		}

		this.tooltipElement = _createElement(null, 'div.tycal-tooltip', null, this.opt.container);

		var _this = this;
		_on(this.element, 'touchstart mouseenter', function (e) {
			_this.isPressing = true;
			_this.hoverTimeout = setTimeout(function () {
				if (!_this.isPressing) return;
				_this.isHovering = true;
				_this.move(e);
			}, _isTouch(e) ? 300 : 0);
		});

		_on(this.element, 'touchmove mousemove', function (e) {
			if (_this.isHovering) {
				if (_isTouch(e)) e.preventDefault();
				_this.move(e);
			}
		});

		_on(this.element, 'touchend mouseleave', function (e) {
			_this.isHovering = false;
			setTimeout(function () {
				_this.isPressing = false;
				if (_this.lastDayHovered) _this.renderer.drawDay(_this.lastDayHovered);
				_this.lastDayHovered = null;
				_this.tooltipElement.style.display = "none";
				if (_this.hoverTimeout) clearTimeout(_this.hoverTimeout);
			}, _isTouch(e) ? 10 : 0);
		});

		_on(window, 'resize orientationchange', function () {
			_this.draw();
		});

		this.draw();
	};
	Base.prototype.setDate = function (date) {
		this.opt.date = date;
		this.draw(true);
	};
	Base.prototype.getDate = function () {
		return this.opt.date;
	};
	Base.prototype.move = function (e) {
		var coord = _getPosition(e);
		if (isNaN(coord.x) || isNaN(coord.y)) return;
		for (var i in this.days) {
			var day = this.days[i];
			var isX = (coord.x >= day.coord.x && coord.x <= day.coord.x + this.opt.cellSize);
			var isY = (coord.y >= day.coord.y && coord.y <= day.coord.y + this.opt.cellSize);

			if (!isX || !isY) continue;
			if (this.lastDayHovered == day) break;
			if (this.lastDayHovered) this.renderer.drawDay(this.lastDayHovered);
			if (this.opt.onDayHover) this.opt.onDayHover(day, this.context);
			else this.renderer.drawHover(day);

			this.drawTooltip(day);
			this.lastDayHovered = day;

			break;
		}
	};
	Base.prototype.drawTooltip = function (day) {
		if (!this.isHovering) return;
		this.tooltipElement.style.display = "block";
		if (this.opt.onSetDayTooltip) {
			this.tooltipElement.innerHTML = this.opt.onSetDayTooltip(day);
		} else {
			this.tooltipElement.innerHTML = day.date;
		}
		this.tooltipElement.style.left = '0px';
		var h = this.tooltipElement.clientHeight;
		var w = this.tooltipElement.clientWidth;
		var x = day.coord.x + this.opt.cellSize * 2 - (this.tooltipElement.clientWidth / 2);

		if (x + this.tooltipElement.clientWidth > this.element.clientWidth) {
			this.tooltipElement.style.left = this.opt.cellSize + (this.element.clientWidth - w) + 'px';
		} else if (x < 0) {
			this.tooltipElement.style.left = this.opt.cellSize + 'px';
		} else {
			this.tooltipElement.style.left = x + 'px';
		}
		this.tooltipElement.style.top = day.coord.y - h + 'px';
	};
	Base.prototype.setDimensions = function () {
		this.elementWidth = this.containerWidth - this.opt.cellSize - this.opt.padding;
		this.elementHeight = (this.numRows * (this.opt.cellSize + this.opt.padding) - this.opt.padding);
		this.opt.container.style.height = ((this.numRows + 1) * (this.opt.cellSize + this.opt.padding) - this.opt.padding) + "px";
	};
	Base.prototype.draw = function (force) {
		var width = this.opt.container.clientWidth;
		if (!force && (this.containerWidth == width || isNaN(width) || width < 1)) {
			return false;
		}
		this.containerWidth = width;
		this.setDimensions();

		this.renderer.setDimensions(this.elementWidth, this.elementHeight);

		this.populateDays();

		if (this.opt.onPopulateDaysFinished) this.opt.onPopulateDaysFinished(this.days);
		if (this.drawDayNames) this.drawDayNames();
		if (this.drawMonthNames) this.drawMonthNames(this.days);

		this.renderer.resetDays();
		/*this.renderer.resetMonths();
		this.renderer.drawMonths(this.months);*/
		this.renderer.drawDays(this.days);
	};
	Base.prototype.populateDays = function () {};
	Base.prototype.drawDayNames = function (force) {};
	Base.prototype.drawMonthNames = function (days) {};



	var TycalWeek = _extend(Base, function (options) {
		this.numRows = 7;

		Base.call(this, options);
	});

	TycalWeek.prototype.populateDays = function () {
		var stopDate = new Date(this.opt.date),
			startDate = new Date(this.opt.date),
			w = 0,
			tw = (this.opt.cellSize + this.opt.padding),
			months = [],
			days = [],
			max = _numColumnsWeek(this.element, this.opt.padding, this.opt.cellSize + this.opt.padding);

		if (this.opt.expandFrom == 'right') {
			stopDate.setDate(stopDate.getDate() + max * 7);
		} else if (this.opt.expandFrom == 'left') {
			startDate.setDate(startDate.getDate() - max * 7);
		} else {
			max = max / 2;
			var before = max;
			var after = max;
			if ((max % 1 !== 0)) {
				before = max + 0.5;
				after = max - 0.5;
			}
			startDate.setDate(startDate.getDate() - before * 7);
			stopDate.setDate(stopDate.getDate() + after * 7);
		}
		startDate.setDate(startDate.getDate() - _dateGetRealDay(startDate));
		stopDate.setDate(stopDate.getDate() + (6 - _dateGetRealDay(stopDate)));
		var lastMonth = startDate.getMonth();
		while (startDate <= stopDate) {
			if (!(this.opt.startDate && date >= this.opt.startDate) || (this.opt.stopDate && date >= this.opt.stopDate)) {
				var d = new Date(startDate);
				days.push({
					date: d,
					coord: {
						x: w * tw,
						y: _dateGetRealDay(d) * tw,
						w: this.opt.cellSize,
						h: this.opt.cellSize
					},
					week: _dateGetWeek(d)
				});
			}
			startDate.setDate(startDate.getDate() + 1);
			w += (_dateGetRealDay(startDate) === 0) ? 1 : 0;
		}
		this.days = days;
		this.months = months;
	};
	TycalWeek.prototype.drawDayNames = function (force) {
		if (force || this.dayNamesElement) return;

		var dayNames = _createElement(null, 'div.day-names', null, this.opt.container);
		dayNames.style.top = this.opt.cellSize + this.opt.padding + 'px';
		dayNames.style.width = this.opt.cellSize + 'px';
		dayNames.style.height = this.elementHeight + 'px';
		var tw = (this.opt.cellSize + this.opt.padding);
		for (var d in _dayNames) {
			var text = _createElement(null, 'div.day-name', null, dayNames);
			text.innerHTML = d % 2 ? '&nbsp;' : _dayNames[d];
		}
		this.dayNamesElement = dayNames;
	};
	TycalWeek.prototype.drawMonthNames = function (days) {
		if (!this.monthNamesElement) {
			this.monthNamesElement = _createElement(null, 'div.month-names', null, this.opt.container);
			this.monthNamesElement.style.height = this.opt.cellSize + 'px';
		}
		this.monthNamesElement.style.width = this.elementWidth + 'px';
		_removeChildren(this.monthNamesElement);

		for (var i in days) {
			var day = days[i];
			if (day.date.getDate() !== 15) continue;
			var el = _createElement(null, 'div.month-name', null, this.monthNamesElement);
			if (this.opt.onDrawMonthName) {
				this.opt.onDrawMonthName(day.date, el);
			}
			el.style.left = day.coord.x + 'px';
			el.textContent = _monthNames[day.date.getMonth()];
			if (this.elementWidth - (day.coord.x + el.clientWidth) < this.opt.cellSize) {
				el.parentNode.removeChild(el);
			}
		}
	};

	var TycalMonth = _extend(Base, function (options) {
		this.numRows = 6;

		Base.call(this, options);
	});
	TycalMonth.prototype.populateDays = function () {
		var stopDate = new Date(this.opt.date),
			startDate = new Date(this.opt.date),
			x = 0,
			y = 0,
			months = [],
			days = [],
			tw = (this.opt.cellSize + this.opt.padding),
			max = _numColumnsMonth(this.element, this.opt.padding, this.opt.cellSize + this.opt.padding);

		if (this.opt.expandFrom == 'right') {
			stopDate.setMonth(stopDate.getMonth() + max);
		} else if (this.opt.expandFrom == 'left') {
			startDate.setMonth(startDate.getMonth() - max);
		} else {
			max = max / 2;
			var before = max;
			var after = max;
			if ((max % 1 !== 0)) {
				before = max + 0.5;
				after = max - 0.5;
			}
			startDate.setMonth(startDate.getMonth() - before);
			stopDate.setMonth(stopDate.getMonth() + after);
		}
		startDate.setDate(1);
		stopDate = new Date(stopDate.getFullYear(), stopDate.getMonth() + 1, 0);

		var lastMonth = startDate.getMonth();
		while (startDate <= stopDate) {
			if (lastMonth != startDate.getMonth()) {
				y = 0;
				x += tw * 7 + tw;
				lastMonth = startDate.getMonth();
			}
			if (!(this.opt.startDate && date >= this.opt.startDate) || (this.opt.stopDate && date >= this.opt.stopDate)) {

				var d = new Date(startDate);
				days.push({
					date: d,
					coord: {
						x: x + _dateGetRealDay(d) * tw,
						y: y * tw,
						w: this.opt.cellSize,
						h: this.opt.cellSize
					},
					week: _dateGetWeek(d)
				});
			}
			startDate.setDate(startDate.getDate() + 1);
			y += (_dateGetRealDay(startDate) === 0) ? 1 : 0;
		}
		this.days = days;
		this.months = months;
	};

	TycalMonth.prototype.drawMonthNames = function (days) {
		if (!this.monthNamesElement) {
			this.monthNamesElement = _createElement(null, 'div.month-names', null, this.opt.container);
			this.monthNamesElement.style.height = this.opt.cellSize + 'px';
		}
		this.monthNamesElement.style.width = this.elementWidth + 'px';
		_removeChildren(this.monthNamesElement);
		var m;
		for (var i in days) {
			var day = days[i];
			if (m == day.date.getMonth()) continue;
			m = day.date.getMonth();
			var el = _createElement(null, 'div.month-name', null, this.monthNamesElement);
			if (this.opt.onDrawMonthName) {
				this.opt.onDrawMonthName(day.date, el);
			}
			var x = day.coord.x - _dateGetRealDay(day.date) * (this.opt.cellSize + this.opt.padding);
			el.style.left = x + 'px';
			el.textContent = _monthNames[day.date.getMonth()] + " " + day.date.getFullYear();
			if (this.elementWidth - (day.coord.x + el.clientWidth) < this.opt.cellSize) {
				el.parentNode.removeChild(el);
			}
		}
	};

	this.Tycal = function (options) {
		if (!options.type || options.type == 'week') {
			var instance = new TycalWeek(options);
			return instance;
		} else if (options.type == 'month') {
			return new TycalMonth(options);
		}
	};

	this.Tycal.globals = defaults;

}).call(this);