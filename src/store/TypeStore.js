
	"use strict";

	const { EntityStore } 		= require("store/");
	const { TypeJsonTask } 		= require("task/");

	class TypeStore extends EntityStore {

		async findOrCreate (id, {} = $(1, { id }, "Number")) {

			try {

				let type = await this.findById(id);

				if(await type.isNull()) {
					await TypeJsonTask.create({ typeID: id });
					type = await this.findById(id);
					if(await type.isNull()) {
						console.log("MISSING TYPE", id);
					}
				}

				return type;

			} catch (e) { console.log(e, new Error()); }

		}

	}

	module.exports = TypeStore;
