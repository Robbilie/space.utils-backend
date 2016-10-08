
	"use strict";

	const { CRESTTask } 			= require("task/");
	const { DBUtil } 				= require("util/");

	class TypeJsonTask extends CRESTTask {

		async start () {

			let response;
			try {
				response = await this.getCREST(`/inventory/types/${(await this.getData()).typeID}/`);
			} catch (e) {
				console.log("CRESTERROR", e, new Error());
				return await this.update({ state: 0 });
			}

			if(response && !response.exceptionType) {

				try {

					/*
					 * Create basic type entry
					 */
					let typeStore = await DBUtil.getStore("Type");
					await typeStore.update(
						{ id: response.id },
						{
							$set: {
								id: 			response.id,
								name: 			response.name,
								description: 	response.description
							}
						},
						{ upsert: true }
					);

				} catch(e) { console.log(e, new Error()); }

			} else {
				console.log("invalid type", (await this.getData()).typeID, response);
			}

			await this.destroy();
		}

	}

	module.exports = TypeJsonTask;
