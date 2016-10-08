
	"use strict";

	const { CRESTTask } 			= require("task/");
	const { DBUtil } 				= require("util/");

	class SystemJsonTask extends CRESTTask {

		async start () {

			let response;
			try {
				response = await this.getCREST(`/solarsystems/${(await this.getData()).systemID}/`);
			} catch (e) {
				console.log("CRESTERROR", e, new Error());
				return await this.update({ state: 0 });
			}

			if(response && !response.exceptionType) {

				try {

					/*
					 * Create basic system entry
					 */
					let systemStore = await DBUtil.getStore("System");
					await systemStore.update(
						{ id: response.id },
						{
							$set: {
								id: 			response.id,
								name: 			response.name,
								securityStatus: response.securityStatus
							}
						},
						{ upsert: true }
					);

				} catch(e) { console.log(e, new Error()); }

			} else {
				console.log("invalid system", (await this.getData()).systemID, response);
			}

			await this.destroy();
		}

	}

	module.exports = SystemJsonTask;
