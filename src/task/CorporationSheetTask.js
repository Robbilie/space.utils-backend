
	"use strict";

	const { XMLTask } 				= require("task/");
	const { DBUtil } 				= require("util/");

	class CorporationSheetTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("Corp/CorporationSheet", await this.dataToForm());
			} catch (e) {
				console.log("XMLERROR", e);
				return await this.update({ state: 0 });
			}


			if(response && response.eveapi && response.eveapi.result) {

				try {

					let corp = response.eveapi.result[0];

					/*
					 * Create basic corp entry so char and alli tasks can get the corp
					 */
					let corpStore = await DBUtil.getStore("Corporation");

					let data = {};
					let setData = {
						id: 			corp.corporationID[0] - 0,
						name: 			corp.corporationName[0],
						ticker: 		corp.ticker[0],
						taxRate: 		parseFloat(corp.taxRate[0]),
						memberCount: 	corp.memberCount[0] - 0,
						description: 	corp.description[0],
						updated: 		new Date(response.eveapi.currentTime[0] + "Z").getTime()
					};
					let unsetData = {};

					if(corp.ceoID[0] - 0 != 1)
						setData.ceo = corp.ceoID[0] - 0;

					if(corp.allianceID[0] - 0)
						setData.alliance = corp.allianceID[0] - 0;
					else
						unsetData.alliance = "";

					if(Object.keys(setData).length > 0)
						data.$set = setData;

					if(Object.keys(unsetData).length > 0)
						data.$unset = unsetData;

					await corpStore.update(
						{ id: setData.id },
						data,
						{ upsert: true }
					);

					/*
					 * set the corp ceo unless EVE System
					 */
					if(corp.ceoID[0] - 0 != 1) {
						let charStore = await DBUtil.getStore("Character");
						await charStore.findOrCreate(corp.ceoID[0] - 0);
					}

					/*
					 * if in alliance set alliance
					 */
					if(corp.allianceID[0] - 0) {
						let alliStore = await DBUtil.getStore("Alliance");
						await alliStore.findOrCreate(corp.allianceID[0] - 0);
					}

				} catch (e) { console.log(e); }
				
				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				await this.update({ state: 0 });

			} else {
				console.log("invalid corp", (await this.getData()).corporationID, response ? response.eveapi.result || response.eveapi.error : response);
				await this.destroy();
			}

		}

	}

	module.exports = CorporationSheetTask;
