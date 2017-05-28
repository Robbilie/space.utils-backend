
	"use strict";

	const os = require("os");
	const { Reporter, Counter, Timer } = require("metrics-influxdb");

	class Metrics {

		constructor ({ host, hostname, app }) {
			this.fields = new Map();
			this.host = host;
			this.hostname = hostname;
			this.app = app;
		}

		initialize () {
			let reporter = new Reporter({
				host: this.host,
				protocol: "http",
				username: "root",
				password: "root",
				database: "k8s",
				precision: "ms",
				tags: { server: this.hostname, app: this.app }
			});
			reporter.start(10 * 1000, true);
			this.reporter = reporter;
			return this;
		}

		get (key, type) {
			if (this.fields.has(key) === false) {
				let t = new type();
				this.reporter.addMetric(key, t);
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

	module.exports = new Metrics({ host: process.env.INFLUXDB_HOST, hostname: os.hostname(), app: process.env.APP_NAME }).initialize();
