
	"use strict";

	const { DBUtil } 				= require("util/");
	const { TokenBucket } 			= require("limiter");
	const request 					= require("request");
	const specialRequest 			= request.defaults({
		gzip: true,
		forever: true,
		//timeout: 1000 * 10,
		pool: {
			maxSockets: Infinity
		}
	});

	class FetcherApp {

		constructor () {
			this.buckets = {
				XML: 	new TokenBucket(60, 30, "second", null),
				CREST: 	new TokenBucket(400, 150, "second", null)
			};
			this.processing = 0;
			this.lastTS = undefined;

			try {
				this.init();
			} catch (e) {
				console.log(e, new Error());
			}
		}

		async init () {
			this.requests = await DBUtil.getCollection("requests");

			await this.startTail();

			await this.requests
				.find({ response: { $exists: false } })
				.toArray()
				.then(reqs =>
					reqs.forEach(data => this.process(data))
				);
		}

		sortQueue () {
			this.queue = this.queue.sort((a, b) => {

				if(a.priority == b.priority) {
					return a.timestamp > b.timestamp ? 1 : -1;
				} else {
					return a.priority > b.priority ? -1 : 1;
				}

			});
		}

		startTail () {
			return DBUtil
				.getOplogCursor({ ns: "requests", op: "i" }, this.lastTS)
				.then(cursor => cursor.each((err, data) => {
					if(err)
						return console.log(err, "restarting cursor…") || this.startTail();
					this.lastTS = data.ts;
					this.process(data.o);
				}));
		}

		process (doc) {
			if(this.buckets[doc.type]) {
				this.buckets[doc.type].removeTokens(1, e => {
					if (e)
						console.log(e);
					console.log("+", ++this.processing);
					specialRequest(doc.options,
						(err, response, body) => {
							console.log("-", --this.processing, response);
							//if (err && (err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT"))
							//	return this.process(doc);
							this.requests.update(
								{_id: doc._id},
								{
									$set: {
										response: { [err ? "error" : "data"]: err ? err : body },
										timestamp: Date.now()
									}
								}
							).catch(e => console.log(e, new Error()));
						}
					);
				});
			}
		}

	}

	module.exports = FetcherApp;
