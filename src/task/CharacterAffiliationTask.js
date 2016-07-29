
	"use strict";

	const BaseTask 					= require("task/BaseTask");
	const rp 						= require("request-promise");
	const config 					= require("util/../../config/");
	const {parseString} 			= require("xml2js");
	const DBUtil 					= require("util/DBUtil");

	class CharacterAffiliationTask extends BaseTask {

		async start () {

			let query = {};
			for(let i in this.getData())
				query[i] = (this.getData()[i] && typeof this.getData()[i] == "object" ? this.getData()[i].join(",") : this.getData()[i]);

			// wait for a xml api queue spot
			await this.enqueue();

			let response = await rp({
				method: 		"POST",
				uri: 			`${config.ccp.api.url}/EVE/CharacterAffiliation.xml.aspx`,
				headers: 		{ "User-Agent": config.site.userAgent },
				form: 			query
			});

			let parsed = await new Promise(resolve => parseString(response, (e, r) => e ? reject(e) : resolve(r)));

			let characteritems = parsed.eveapi.result[0].rowset[0].row;

			const charStore = await DBUtil.getStore("Character");
			const corpStore = await DBUtil.getStore("Corporation");
			const alliStore = await DBUtil.getStore("Alliance");

			await Promise.all(characteritems.map(async characteritem => {

				// create alli obj and get alliance obj from db if alliance != 0
				let alliance = {
					id: 	characteritem.$.allianceID - 0,
					name: 	characteritem.$.allianceName
				};
				let alli;
				if(alliance.id)
					alli = await alliStore.findAndModify({ id: alliance.id }, [], { $set: alliance }, { upsert: true, new: true });

				// create corp obj and get corporation obj from db and assign alli ObjectId if exist
				let corporation = {
					id: 	characteritem.$.corporationID - 0,
					name: 	characteritem.$.corporationName
				};
				if(alli)
					corporation.alliance = alli.get_id();
				let corp = await corpStore.findAndModify({ id: corporation.id }, [], { $set: corporation }, { upsert: true, new: true });

				// create char obj and get character obj from db and assign corp ObjectId if exist
				let character = {
					id: 	characteritem.$.characterID - 0,
					name: 	characteritem.$.characterName
				};
				if(corp)
					character.corporation = corp.get_id();
				let char = await charStore.findAndModify({ id: character.id }, [], { $set: character }, { upsert: true, new: true });
			}));

			await this.update({ state: 0, timestamp: new Date(parsed.eveapi.cachedUntil[0] + "Z").getTime() });
		}

	};

	module.exports = CharacterAffiliationTask;