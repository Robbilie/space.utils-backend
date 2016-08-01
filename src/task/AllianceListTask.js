
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const DBUtil 					= require("util/DBUtil");

	class AllianceListTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("EVE/AllianceList");
			} catch (e) {
				await this.update({ state: 0 });
			}

			console.log(response);

			if(response && response.eveapi && response.eveapi.result) {

				try {
					const alliStore = await DBUtil.getStore("Alliance");
					const corpStore = await DBUtil.getStore("Corporation");

					await Promise.all(response.eveapi.result[0].rowset[0].row.map(async alli => {
						
						let alliance = await alliStore.findAndModify(
							{ id: alli.$.allianceID - 0 },
							[],
							{
								$set: {
									id: 			alli.$.allianceID - 0, 
									name: 			alli.$.name, 
									shortName: 		alli.$.shortName, 
									startDate: 		new Date(alli.$.startDate + "Z").getTime(), 
									memberCount: 	alli.$.memberCount - 0
								}
							},
							{ upsert: true, new: true }
						);

						let corporation = await corpStore.getOrCreate(alli.$.executorCorpID - 0);
						await alliance.modify([], { $set: { executorCorp: corporation.get_id() } });

					}));

					let corpids = [].concat(...response.eveapi.result[0].rowset[0].row
						.map(item => item.rowset[0].row) // get corplists
						.map(item => item.map(c => c.$.corporationID - 0)));

					let dbids = (await corpStore.getList(corpids)).map(corp => corp.getId());

					let filtered = corpids.filter(cid => !dbids.some(did => did == cid));

					await Promise.all(filtered.map(id => corpStore.getOrCreate(id)));


					/*
					const filtered = corpids.filter(cid => !dbids.some(did => did == cid)).chunk(300);

					console.log("CHUNK COUNT", filtered.length)

					for(let i in filtered) {
						console.log("chunk", i);
						await Promise.all(filtered[i].map(id => corpStore.getOrCreate(id)));
					}*/
				} catch(e) { console.log(e) }

				await this.update({ state: 0, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
			} else {
				await this.update({ state: 0 });
			}

			console.log("done with alliance list");

		}

	};

	module.exports = AllianceListTask;