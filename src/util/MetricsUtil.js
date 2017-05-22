
	"use strict";

	const os = require("os");
	const { GraphiteReporter, Report, Counter, Histogram, Timer } = require("metrics");

	const storage = {
		metrics: new Map(),
		report: undefined,
		reporter: undefined
	};

	class MetricsUtil {

		static init () {
			storage.report = new Report();
			storage.metrics.forEach((value, key) => storage.report.addMetric(key, value));

			storage.reporter = new GraphiteReporter(storage.report, `eas-kubes.pods.${os.hostname()}`, process.env.GRAPHITE_HOST);
			storage.reporter.on("log", (level, msg, exc) => {
				if(exc) {
					console.log(`${level} -- ${msg} (${exc})`);
				} else {
					console.log(`${level} -- ${msg}`);
				}
			});
			storage.reporter.start(10 * 1000);
		}

		static get (key, type) {
			if (storage.reporter === undefined)
				this.init();
			if (storage.metrics.has(key) === false) {
				let t = new type();
				storage.report.addMetric(key, t);
				storage.metrics.set(key, t);
			}
			return storage.metrics.get(key);
		}

		static inc (key, value = 1) {
			return this.get(key, Counter).inc(value);
		}

		static update (key, value) {
			return this.get(key, Timer).update(value);
		}

	}

	module.exports = MetricsUtil;
