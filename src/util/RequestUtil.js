
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

				let cursor = await DBUtil.getOplogCursor({ ns: "requests", op: "u" });
					cursor.each((err, data) => {
						if(err)
							return console.log(err);
						if(storage.requests.get(data.o2._id)) {
							storage.requests.get(data.o2._id)(data.o.$set.response);
							storage.requests.delete(data.o2._id);
							requests.remove({ _id: data.o2._id });
						}
					});

				return resolve((type, options, fn) => {

					let _id = new ObjectId();

					storage.requests.set(_id, fn);

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
