
	"use strict";

	class Clock extends Module {

		constructor (parent) {
			super(parent);
			this.clock = $(["div", { className: "clock", innerHTML: this.getTimeStr() }]);
			let d = new Date();
			setTimeout(() =>
				this.updateTime() || (this.interval = setInterval(() => this.updateTime(), 1000 * 60))
			, (60 - d.getSeconds()) * 1000)
		}

		getClock () {
			return this.clock;
		}

		getInterval () {
			return this.interval;
		}

		updateTime () {
			this.getClock().innerHTML = this.getTimeStr();
		}

		getTimeStr () {
			let d = new Date();
			return (d.getUTCHours() < 10 ? "0" : "") + d.getUTCHours() + ":" + (d.getUTCMinutes() < 10 ? "0" : "") + d.getUTCMinutes();
		}

		render () {
			return this.getClock();
		}

	}
