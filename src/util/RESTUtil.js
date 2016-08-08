
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const Base 						= require("model/Base");

	class RESTUtil {

		static dynamicRoute (req, res, next) {
			return new Promise (async (a, d) => {

				try {

					let store = await DBUtil.getStore(req.params.store.singularize().capitalizeFirstLetter());

					if(!store)
						throw Error("Invalid entity.");

					let entity;
					if(store.getOrCreate)
						entity = await store.getOrCreate(req.params.id - 0);
					else
						entity = await store.getById(req.params.id - 0);

					switch (req.method) {
						case "GET":
							if(req.params.field) {
								entity = Base.toJSON(req.params.store.singularize(), await entity[`get${req.params.field.capitalizeFirstLetter()}`]());
							}
							res.json(entity);
							break;
					}

				} catch (e) { 
					console.log(e);
					res.json({ error: e });
				}

			}).catch(e => console.log(e));
		}

	}

	module.exports = RESTUtil;
