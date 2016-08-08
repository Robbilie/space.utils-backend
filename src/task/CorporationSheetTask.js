
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const DBUtil 					= require("util/DBUtil");

	class CorporationSheetTask extends XMLTask {

		async start () {

			let d = Date.now();

			let tss = []


			let response;
			try {
				response = await this.getXML("Corp/CorporationSheet", this.dataToForm());
			} catch (e) {
				console.log("XMLERROR");
				return await this.update({ state: 0 });
			}


			if(response && response.eveapi && response.eveapi.result) {

				try {

					let corp = response.eveapi.result[0];

					/*
					 * Create basic corp entry so char and alli tasks can get the corp
					 */
					let corpStore = await DBUtil.getStore("Corporation");


					const corporation = await corpStore.findAndModify(
						{ id: corp.corporationID[0] - 0 },
						[],
						{
							$set: {
								id: 			corp.corporationID[0] - 0,
								name: 			corp.corporationName[0],
								ticker: 		corp.ticker[0],
								taxRate: 		parseFloat(corp.taxRate[0]),
								memberCount: 	corp.memberCount[0] - 0,
								description: 	corp.description[0]
							}
						},
						{ upsert: true, new: true }
					);

					/*
					 * set the corp ceo unless EVE System
					 */
					if(corp.ceoID[0] - 0 != 1) {
						const ceoID = corp.ceoID[0] - 0;
						new Promise(async (a, d) => {
							let charStore = await DBUtil.getStore("Character");
							let ceo = await charStore.getOrCreate(ceoID);
							if(ceo) {
								await corporation.update({ $set: { ceo: ceo.get_id() } });
							}
							return a();
						});
					}

					/*
					 * if in alliance set alliance
					 */
					if(corp.allianceID[0] - 0) {
						let alliStore = await DBUtil.getStore("Alliance");
						let alliance = await alliStore.getOrCreate(corp.allianceID[0] - 0);
						corporation.update({ $set: { alliance: alliance.get_id() } });
					} else {
						corporation.update({ $unset: { alliance: "" } });
					}

				} catch (e) { console.log(e) }
				
				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				await this.update({ state: 0 });

			} else {
				console.log("invalid corp", this.getData().corporationID);
				await this.delete();
			}


			console.log("CorporationSheet", ...tss.map(t => t - d));
		}

	};

	module.exports = CorporationSheetTask;