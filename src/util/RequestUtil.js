
	"use strict";

	const { DBUtil } 			= require("util/");
	const { ObjectId } 			= require("mongodb");

	const storage = {
		requests: new Map(),
		stream: null
	};

	class RequestUtil {

		static call (type, options) {
			if(!storage.stream)
				storage.stream = RequestUtil.stream();
			return storage.stream.then(stream => new Promise(resolve => stream(type, options, resolve)));
		}

		static stream () {
			return new Promise(async (resolve) => {

				const requests = await DBUtil.getCollection("requests");
				const responses = await DBUtil.getCollection("responses");

				let cursor = await DBUtil.getOplogCursor({ ns: "responses", op: "i" });
				let stream = cursor.stream();

				stream.on("data", data => {
					try {
						if(data.op == "i") {
							if(storage.requests.get(data.o.id)) {
								responses.remove({ _id: data.o._id });
								storage.requests.get(data.o.id)(data.o.response);
								storage.requests.delete(data.o.id);
							}
						}
					} catch (e) { console.log(e); }
				});

				stream.on("error", e => {
					console.log(e);
					if(50 == e.code) {
						stream.close();
						storage.stream = null;
					}
				});

				return resolve((type, options, fn) => {

					let _id = new ObjectId();

					storage.requests.set(_id.toString(), fn);

					requests.insert({
						_id,
						type,
						options,
						timestamp: Date.now()
					});

				});

			});
		}

	}

	module.exports = RequestUtil;
