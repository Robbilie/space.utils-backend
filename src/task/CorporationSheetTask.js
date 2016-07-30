
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const rp 						= require("request-promise");
	const config 					= require("util/../../config/");
	const {parseString} 			= require("xml2js");
	const DBUtil 					= require("util/DBUtil");

	class CorporationSheetTask extends XMLTask {

		async start () {

			let query = this.dataToForm();

			// wait for a xml api queue spot
			await this.enqueue();

			try {
				let response = await rp({
					method: 		"POST",
					uri: 			`${config.ccp.api.url}/Corp/CorporationSheet.xml.aspx`,
					headers: 		{ "User-Agent": config.site.userAgent },
					form: 			query
				});

				let parsed = await new Promise(resolve => parseString(response, (e, r) => e ? reject(e) : resolve(r)));

				if(parsed.eveapi.result) {
					let corporationitem = parsed.eveapi.result[0];

					const corpStore = await DBUtil.getStore("Corporation");
					const alliStore = await DBUtil.getStore("Alliance");

					// create alli obj and get alliance obj from db if alliance != null
					let alli;
					if(corporationitem.alliance) {
						let alliance = {
							id: 	corporationitem.allianceID[0] - 0,
							name: 	corporationitem.allianceName[0]
						};
						if(alliance.id)
							alli = await alliStore.findAndModify({ id: alliance.id }, [], { $set: alliance }, { upsert: true, new: true });
					}

					// create corp obj and get corporation obj from db and assign alli ObjectId if exist
					let corporation = {
						id: 	corporationitem.corporationID[0] - 0,
						name: 	corporationitem.corporationName[0]
					};
					if(alli)
						corporation.alliance = alli.get_id();
					let corp = await corpStore.findAndModify({ id: corporation.id }, [], { $set: corporation }, { upsert: true, new: true });

				} else {
					console.log("invalid corp ", id);
				}
			} catch (e) {
				console.log(e);
			}

			await this.update({ state: 0, timestamp: new Date(parsed.eveapi.cachedUntil[0] + "Z").getTime() });
		}

	};

	module.exports = CorporationSheetTask;