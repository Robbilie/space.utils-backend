
	"use strict";

	class KillmailPage extends Page {

		constructor (parent, killID) {
			super(parent, "Killmail");
			this.classList.push("page");

			this.killID = killID - 0;

			console.log("Kill", killID);

			this.loadInitial().then(() => this.ready());
		}

		loadInitial () {
			return json("GET", `https://api.utils.space/killmails/${this.killID}`).then(kill => {

				console.log(kill);

				return Promise.resolve();
			});
		}

	}
