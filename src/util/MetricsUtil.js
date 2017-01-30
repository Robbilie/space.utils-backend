
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
			let report = new Report();
			storage.metrics.forEach((value, key) => report.addMetric(key, value));
			storage.report = report;

			let reporter = new GraphiteReporter(report, "eas-kubes", process.env.GRAPHITE_HOST);
			reporter.on("log", (level, msg, exc) => {
				if(exc) {
					console.log(`${level} -- ${msg} (${exc})`);
				} else {
					console.log(`${level} -- ${msg}`);
				}
			});
			reporter.start(10 * 1000);
			storage.reporter = reporter;
		}

		static get (key) {
			if (!storage.reporter)
				MetricsUtil.init();
			return storage.metrics.get(key);
		}

	}

	module.exports = MetricsUtil;
