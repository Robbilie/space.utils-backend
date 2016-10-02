
	"use strict";

	class KillmailPage extends Page {

		constructor (parent, killID) {
			super(parent, "Killmail");
			this.classList.push("page");

			console.log("Kill", killID);

			this.ready();
		}

	}
