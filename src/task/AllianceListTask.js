
	"use strict";

	const { XMLTask } 				= require("task/");
	const { DBUtil } 				= require("util/");

	class AllianceListTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("EVE/AllianceList");
			} catch (e) {
				return await this.update({ state: 0 });
			}

			if(response && response.eveapi && response.eveapi.result) {

				try {

					const alliStore = await DBUtil.getStore("Alliance");
					const corpStore = await DBUtil.getStore("Corporation");

					const cidArrays = [];
					let alliances = response.eveapi.result[0].rowset[0].row.map(alli => {

						cidArrays.push(alli.rowset[0].row.map(c => c.$.corporationID - 0));

						return {
							id: 			alli.$.allianceID - 0, 
							name: 			alli.$.name, 
							shortName: 		alli.$.shortName, 
							startDate: 		new Date(alli.$.startDate + "Z").getTime(), 
							memberCount: 	alli.$.memberCount - 0,
							executor: 		alli.$.executorCorpID - 0
						};
					});

					await Promise.all(alliances.map(alliance => alliStore.update({ id: alliance.id }, { $set: alliance }, { upsert: true })));

					await Promise.all([].concat(...cidArrays).map(corporationID => corpStore.findOrCreate(corporationID)));
					
				} catch(e) { console.log(e); }

				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });

			}

			await this.update({ state: 0 });

			console.log("done with alliance list");

		}

	}

	module.exports = AllianceListTask;
