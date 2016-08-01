
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const DBUtil 					= require("util/DBUtil");

	class CorporationSheetTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("Corp/CorporationSheet", this.dataToForm());
			} catch (e) {
				console.log(e);
				await this.update({ state: 0 });
			}

			if(response && response.eveapi && response.eveapi.result) {

				const charStore = await DBUtil.getStore("Character");
				const corpStore = await DBUtil.getStore("Corporation");
				const alliStore = await DBUtil.getStore("Alliance");

				let corporationitem = response.eveapi.result[0];

				let corporation = {
					id: 			corporationitem.corporationID[0] - 0,
					name: 			corporationitem.corporationName[0],
					ticker: 		corporationitem.ticker[0],
					taxRate: 		parseFloat(corporationitem.taxRate[0]),
					memberCount: 	corporationitem.memberCount[0] - 0,
					description: 	corporationitem.description[0]
				};

				// handle corp beeing in alliance
				if(corporationitem.allianceID[0] - 0 != 0) {

					let alliance = await alliStore.findAndModify(
						{ id: corporationitem.allianceID[0] - 0 }, 
						[], 
						{ 
							$set: {
								id: 	corporationitem.allianceID[0] - 0,
								name: 	corporationitem.allianceName[0]
							} 
						}, 
						{ upsert: true, new: true }
					);

					corporation.alliance = alliance.get_id();

				}

				await corpStore.findAndModify({ id: corporation.id }, [], { $set: corporation }, { upsert: true });

				// ceo is no the EVE System
				if(corporationitem.ceoID[0] - 0 != 1) {

					let ceo = await charStore.getOrCreate(corporationitem.ceoID[0] - 0);

					await corpStore.findAndModify({ id: corporation.id }, [], { $set: { ceo: ceo.get_id() } });

				}

				await this.update({ state: 0, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });

			} else {
				console.log("invalid corp", this.getData().corporationID);
				await this.delete();
			}
		}

	};

	module.exports = CorporationSheetTask;