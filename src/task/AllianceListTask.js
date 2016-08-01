
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

					await Promise.all(response.eveapi.result[0].rowset[0].row
						.map(item => ({ 
							id: 			item.$.allianceID - 0, 
							name: 			item.$.name, 
							shortName: 		item.$.shortName, 
							startDate: 		new Date(item.$.startDate + "Z").getTime(), 
							memberCount: 	item.$.memberCount - 0,
							executorCorp: 	item.$.executorCorpID - 0
						}))
						.map(item => corpStore
							.getOrCreate(item.executorCorp)
							.then(corp => Object.assign(item, { executorCorp: corp.get_id() }))
							.then(alli => alliStore.findAndModify({ id: alli.id }, [], { $set: alli }, { upsert: true, new: true })).catch(e => console.log("alli err", item))
						)
					);

					const corpids = [].concat(...response.eveapi.result[0].rowset[0].row
						.map(item => item.rowset[0].row) // get corplists
						.map(item => item.map(c => c.$.corporationID - 0)));

					const dbids = (await corpStore.getList(corpids)).map(corp => corp.getId());

					const filtered = corpids.filter(cid => !dbids.some(did => did == cid)).chunk(300);

					console.log("CHUNK COUNT", filtered.length)

					for(let i in filtered) {
						console.log("chunk", i);
						await Promise.all(filtered[i].map(id => corpStore.getOrCreate(id)));
					}
				} catch(e) { console.log(e) }

				await this.update({ state: 0, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
			} else {
				await this.update({ state: 0 });
			}

			console.log("done with alliance list");

		}

	};

	module.exports = AllianceListTask;