
	"use strict";

	const { DBUtil } 				= require("util/");
	const { TokenBucket } 			= require("limiter");
	const rp 						= require("request-promise");

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

			let cursor = await DBUtil.getOplogCursor({ ns: "requests", op: "i" });
			let stream = cursor.stream();

			const process = (data) => {
				this.buckets[data.type].removeTokens(1, () => {

					const id = data._id.toString();

					requests.remove({ _id: data._id });

					rp(data.options)
						.then(data =>
							responses.insert({ id, response: { data } })
						)
						.catch(({ error }) =>
							responses.insert({ id, response: { error } })
						);

				});
			};

			let oldrequests = await requests.find({}).toArray();
			oldrequests.forEach(data => process(data));

			stream.on("data", data => {
				if(data.op == "i") {
					process(data.o);
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
