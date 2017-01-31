
	"use strict";

	const { GraphiteReporter, Report, Counter, Histogram } = require("metrics");

	const storage = {
		metrics: new Map([
			["esi.completed", new Counter()],
			["esi.errors", new Counter()],
			["esi.duration", new Histogram()],
			["tasks.completed", new Counter()],
			["tasks.errors", new Counter()],
			["tasks.duration", new Histogram()]
		]),
		report: undefined,
		reporter: undefined
	};

	class MetricsUtil {

		static init () {
			storage.report = new Report();
			storage.metrics.forEach((value, key) => storage.report.addMetric(key, value));

			storage.reporter = new GraphiteReporter(storage.report, (`eas-kubes.pods.${process.env.HOSTNAME}`).replace(/-/g, "_"), process.env.GRAPHITE_HOST);
			storage.reporter.on("log", (level, msg, exc) => {
				if(exc) {
					console.log(`${level} -- ${msg} (${exc})`);
				} else {
					console.log(`${level} -- ${msg}`);
				}
			});
			storage.reporter.start(10 * 1000);
		}

		static get (key) {
			if (!storage.reporter)
				MetricsUtil.init();
			return storage.metrics.get(key);
		}

	}

	module.exports = MetricsUtil;
