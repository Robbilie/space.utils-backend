
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

			const process = (doc) => {
				if(this.buckets[doc.type])
					this.buckets[doc.type].removeTokens(1, () => {
						rp(doc.options)
							.then(
								(data) =>
									requests.update({ _id: doc._id }, { $set: { response: { data }, timestamp: Date.now() } }),
								({ error }) =>
									requests.update({ _id: doc._id }, { $set: { response: { error }, timestamp: Date.now() } }),
							)
							.catch(e =>
								console.log(e)
							);
					});
			};

			let cursor = await DBUtil.getOplogCursor({ ns: "requests", op: "i" });
				cursor.each((err, data) => {
					if(err)
						return console.log(err);
					process(data.o);
				});

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
