
	"use strict";

	class Clock extends Module {

		constructor (parent) {
			super(parent);
			this.clock = $(["div", { className: "clock", innerHTML: this.getTimeStr() }]);
			this.interval = setInterval(() => this.getClock().innerHTML = this.getTimeStr(), 1000 * 60);
		}

		getClock () {
			return this.clock;
		}

		getInterval () {
			return this.interval;
		}

		getTimeStr () {
			let d = new Date();
			return (d.getUTCHours() < 10 ? "0" : "") + d.getUTCHours() + ":" + (d.getUTCMinutes() < 10 ? "0" : "") + d.getUTCMinutes();
		}

		render () {
			return this.getClock();
		}

	}
