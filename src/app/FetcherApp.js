
	"use strict";

	const { DBUtil } 				= require("util/");
	const { TokenBucket } 			= require("limiter");
	const rp 						= require("request-promise");
	const config 					= require("util/../../config/");

	class FetcherApp {

		constructor () {
			this.buckets = {
				XML: new TokenBucket(60, 30, "second", null),
				CREST: new TokenBucket(400, 150, "second", null)
			};

			try {
				this.init();
			} catch (e) {
				console.log(e);
			}
		}

		async init () {

			let db = await DBUtil.getDB();

			const requests = db.collection(config.database.prefix + "requests");
			const responses = db.collection(config.database.prefix + "responses");

			let cursor = await DBUtil.getOplogCursor({ ns: "requests" });
			let stream = cursor.stream();

			stream.on("data", data => {
				if(data.op == "i") {
					this.buckets[data.op.type].removeTokens(1, async () => {

						let response = {};
						try {
							response.data = await rp(data.o);
						} catch (e) {
							response.error = e.error;
						}

						responses.insert({ id: data.o._id, response });

					});
				} else if(data.op == "d") {
					// delete from queue, only relevant for multiple fetchers
				}
			});

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

	}

	module.exports = FetcherApp;
