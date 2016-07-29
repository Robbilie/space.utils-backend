
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const rp 						= require("request-promise");
	const config 					= require("util/../../config/");
	const {parseString} 			= require("xml2js");
	const DBUtil 					= require("util/DBUtil");

	class CharacterInfoTask extends XMLTask {

		async start () {

			let query = this.dataToForm();

			// wait for a xml api queue spot
			await this.enqueue();

			try {
				let response = await rp({
					method: 		"POST",
					uri: 			`${config.ccp.api.url}/EVE/CharacterInfo.xml.aspx`,
					headers: 		{ "User-Agent": config.site.userAgent },
					form: 			query
				});

				let parsed = await new Promise(resolve => parseString(response, (e, r) => e ? reject(e) : resolve(r)));

				if(parsed.eveapi.result) {
					let characteritem = parsed.eveapi.result[0];

					const charStore = await DBUtil.getStore("Character");
					const corpStore = await DBUtil.getStore("Corporation");
					const alliStore = await DBUtil.getStore("Alliance");

					// create alli obj and get alliance obj from db if alliance != null
					let alli;
					if(characteritem.alliance) {
						let alliance = {
							id: 	characteritem.allianceID[0] - 0,
							name: 	characteritem.alliance[0]
						};
						if(alliance.id)
							alli = await alliStore.findAndModify({ id: alliance.id }, [], { $set: alliance }, { upsert: true, new: true });
					}

					// create corp obj and get corporation obj from db and assign alli ObjectId if exist
					let corporation = {
						id: 	characteritem.corporationID[0] - 0,
						name: 	characteritem.corporation[0]
					};
					if(alli)
						corporation.alliance = alli.get_id();
					let corp = await corpStore.findAndModify({ id: corporation.id }, [], { $set: corporation }, { upsert: true, new: true });

					// create char obj and get character obj from db and assign corp ObjectId if exist
					let character = {
						id: 	characteritem.characterID[0] - 0,
						name: 	characteritem.characterName[0]
					};
					if(corp)
						character.corporation = corp.get_id();
					let char = await charStore.findAndModify({ id: character.id }, [], { $set: character }, { upsert: true, new: true });

				} else {
					console.log("invalid char");
				}
			} catch (e) {
				console.log(e);
			}

			await this.delete();
		}

	};

	module.exports = CharacterInfoTask;