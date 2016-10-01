
	"use strict";

	const { CRESTTask } 			= require("task/");
	const { DBUtil } 				= require("util/");

	class KillmailJsonTask extends CRESTTask {

		async start () {

			let response;
			try {
				response = await this.getCREST(`/killmails/${(await this.getData()).killID}/${(await this.getData()).hash}/`);
			} catch (e) {
				console.log("CRESTERROR", e, new Error());
				return await this.update({ state: 0 });
			}

			if(response && !response.exceptionType) {

				try {

					let killmailStore = await DBUtil.getStore("Killmail");
					await killmailStore.update(
						{ killID: response.killID },
						{
							$set: Object.assign(response, { hash: (await this.getData()).hash })
						},
						{ upsert: true }
					);

				} catch(e) { console.log(e, new Error()) }

			} else {
				console.log("invalid killmail", (await this.getData()).killID, (await this.getData()).hash, response);
				if(response && response.message != "Invalid killmail ID hash." && response.message != "The route /killmails/-1/Logibro Verified/ was not found")
					return await this.update({ state: 0 });
			}

			await this.destroy();
		}

	}

	module.exports = KillmailJsonTask;