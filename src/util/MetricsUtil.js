
	"use strict";

	const { GraphiteReporter, Report, Counter } = require("metrics");

	const storage = {
		metrics: new Map([
			["esi.counter", new Counter()]
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
