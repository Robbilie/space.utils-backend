
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
			return fetch(`https://api.utils.space/killmails/${this.killID}`, {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ "filter": { killID: this.killID } })
			}).then(res => res.json()).then(kill => {

				console.log(kill);

				return Promise.resolve();
			});
		}

	}
