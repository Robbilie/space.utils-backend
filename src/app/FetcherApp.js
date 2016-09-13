
	"use strict";

	const { DBUtil } 				= require("util/");
	const { TokenBucket } 			= require("limiter");
	const rp 						= require("request-promise-native");

	class FetcherApp {

		constructor () {
			this.buckets = {
				XML: 	new TokenBucket(60, 30, "second", null),
				CREST: 	new TokenBucket(400, 150, "second", null)
			};

			try {
				this.init();
			} catch (e) {
				console.log(e);
			}
		}

		async init () {

			const requests = await DBUtil.getCollection("requests");
			const responses = await DBUtil.getCollection("responses");

			const process = (doc) => {
				if(this.buckets[doc.type])
					this.buckets[doc.type].removeTokens(1, () => {
						try {
							const id = doc._id.toString();

							requests.remove({ _id: doc._id });

							rp(doc.options)
								.then(
									(data) =>
										responses.insert({ id, response: { data }, timestamp: Date.now() }),
									({ error }) =>
										responses.insert({ id, response: { error }, timestamp: Date.now() })
								)
								.catch(e =>
									console.log(e)
								);
						} catch (e) { console.log(e); }
					});
			};

			let cursor = await DBUtil.getOplogCursor({ ns: "requests", op: "i" });
				cursor.maxTimeMS(Number.MAX_VALUE);
			const startStream = () => {
				let stream = cursor.stream();
					stream.on("data", data => {
						if(data.op == "i") {
							process(data.o);
						} else if(data.op == "d") {
							// delete from queue, only relevant for multiple fetchers
						}
					});
					stream.on("error", e => {
						console.log("fetcher", e);
						stream.close();
						startStream();
					});
			};
			startStream();

			let oldrequests = await requests.find({}).toArray();
			oldrequests.forEach(data => process(data));

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
