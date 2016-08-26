
	"use strict";

	const CRESTTask 				= require("task/CRESTTask");
	const DBUtil 					= require("util/DBUtil");

	class KillmailJsonTask extends CRESTTask {

		async start () {

			let response;
			try {
				response = await this.getCREST(`/killmails/${this.getData().killID}/${this.getData().hash}/`);
			} catch (e) {
				console.log("CRESTERROR");
				return await this.update({ state: 0 });
			}

			if(response && !response.exceptionType) {

				try {

					// TODO : km store

				} catch(e) { console.log(e) }

			} else {
				console.log("invalid killmail", this.getData().killID);
			}

			await this.destroy();
		}

	}

	module.exports = KillmailJsonTask;