
	"use strict";

	const os = require("os");
	//const { Reporter, Counter, Timer } = require("metrics-influxdb");
	const { GraphiteReporter, Report, Counter, Timer } = require("metrics");

	class Metrics {

		constructor ({ host, hostname, app }) {
			this.report = new Report();
			this.fields = new Map();
			this.host = host;
			this.hostname = hostname;
			this.app = app;
		}

		initialize () {
			//let reporter = new Reporter({ host: this.host, protocol: "http", username: "root", password: "root", database: "k8s", precision: "ms", tags: { server: this.hostname, app: this.app }});
			let reporter = new GraphiteReporter(this.report, `eas-kubes.pods.${this.hostname}`, this.host);
			reporter.on("log", (level, msg, exc) => {
				if(exc) {
					console.log(`${level} -- ${msg} (${exc})`);
				} else {
					console.log(`${level} -- ${msg}`);
				}
			});
			//reporter.start(10 * 1000/*, true*/);
			this.reporter = reporter;
			return this;
		}

		get (key, type) {
			if (this.reporter === undefined)
				this.initialize();
			if (this.fields.has(key) === false) {
				let t = new type();
				this.report.addMetric(key, t);
				this.fields.set(key, t);
			}
			return this.fields.get(key);
		}

		inc (key, value = 1) {
			return this.get(key, Counter).inc(value);
		}

		update (key, value) {
			return this.get(key, Timer).update(value);
		}

	}

	module.exports = new Metrics({ host: process.env.GRAPHITE_HOST, hostname: os.hostname(), app: process.env.APP_NAME });
