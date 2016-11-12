
	"use strict";

	const { DBUtil } 			= require("util/");
	const { ObjectID } 			= require("mongodb");

	const storage = {
		requests: new Map(),
		requestCollection: null,
		stream: null,
		lastTS: undefined
	};

	class RequestUtil {

		static call (type, options) {
			if(!storage.stream)
				storage.stream = RequestUtil.stream();
			return storage.stream.then(stream => stream(type, options));
		}

		static stream () {
			return DBUtil.getCollection("requests")
				.then(requests => {
					storage.requestCollection = requests;
				})
				.then(() => RequestUtil.tail())
				.then(() =>
					(type, options) => new Promise(resolve => {
						let _id = new ObjectID();

						storage.requests.set(_id.toString(), resolve);

						storage.requestCollection.save({
							_id,
							type,
							options,
							timestamp: Date.now()
						});
					})
				);
		}

		static tail () {
			return DBUtil
				.getOplogCursor({ ns: "requests", op: "u" }, storage.lastTS)
				.then(cursor => cursor.each((err, data) => {
					if(err)
						return console.log(err, "restarting cursor…") || setImmediate(() => RequestUtil.tail());
					storage.lastTS = data.ts;
					try {
						if (data.o.$set.response && storage.requests.get(data.o2._id.toString())) {
							storage.requests.get(data.o2._id.toString())(data.o.$set.response);
							storage.requests.delete(data.o2._id.toString());
							storage.requestCollection.remove({_id: data.o2._id});
						}
					} catch(e) { console.log(e, new Error()); }
				}));
		}

	}

	module.exports = RequestUtil;
