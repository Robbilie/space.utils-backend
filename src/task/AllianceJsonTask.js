
	"use strict";

	const { CRESTTask } 			= require("task");
	const { DBUtil } 				= require("util");

	class AllianceJsonTask extends CRESTTask {

		async start () {

			let response;
			try {
				response = await this.getCREST(`/alliances/${(await this.getData()).allianceID}/`);
			} catch (e) {
				console.log("CRESTERROR");
				return await this.update({ state: 0 });
			}

			if(response && !response.exceptionType) {

				try {

					/*
					 * Create basic alli entry
					 */
					let alliStore = await DBUtil.getStore("Alliance");
					let alliance = await alliStore.findAndModify(
						{ id: response.id },
						[],
						{
							$set: {
								id: 		response.id,
								name: 		response.name,
								shortName: 	response.shortName,
								startDate: 	new Date(response.startDate + "Z").getTime()
							}
						},
						{ upsert: true, new: true }
					);

					/*
					 * set exec corp
					 */
					let corpStore 		= await DBUtil.getStore("Corporation");
					let corporation 	= await corpStore.findOrCreate(response.executorCorporation.id);
					await alliance.update({ $set: { executorCorp: await corporation.getId() } });

				} catch(e) { console.log(e); }

			} else {
				console.log("invalid alli", (await this.getData()).allianceID);
			}

			await this.destroy();
		}

	}

	module.exports = AllianceJsonTask;
