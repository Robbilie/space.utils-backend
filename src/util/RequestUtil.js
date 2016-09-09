
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

					if(data.op == "i") {
						if(storage.requests.get(data.o.id)) {
							responses.remove({ _id: data.o._id });
							storage.requests.get(data.o.id)(data.o.response);
							storage.requests.delete(data.o.id);
						}
					}

				});

				return resolve((type, options, fn) => {

					let _id = new ObjectId();

					storage.requests.set(_id.toString(), fn);

					requests.insert({
						_id,
						type,
						options
					});

				});

			});
		}

	}

	module.exports = RequestUtil;
