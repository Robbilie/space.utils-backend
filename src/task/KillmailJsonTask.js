
	"use strict";

	const { CRESTTask } 			= require("task/");
	const { DBUtil } 				= require("util/");

	class KillmailJsonTask extends CRESTTask {

		async start () {

			let response;
			try {
				response = await this.getCREST(`/killmails/${(await this.getData()).killID}/${(await this.getData()).hash}/`);
			} catch (e) {
				console.log("CRESTERROR");
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

				} catch(e) { console.log(e) }

			} else {
				console.log("invalid killmail", (await this.getData()).killID, response);
				if(response.message != "Invalid killmail ID hash.")
					return await this.update({ state: 0 });
			}

			await this.destroy();
		}

	}

	module.exports = KillmailJsonTask;