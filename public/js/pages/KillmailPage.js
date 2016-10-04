
	"use strict";

	class KillmailPage extends Page {

		constructor (parent, killID) {
			super(parent, "Killmail");
			this.classList.push("page");

			this.killID = killID - 0;

			console.log("Kill", killID);

			if(true) { // desktop
				this.header = $(["canvas", { className: "kill-header-bg" }]);
				ccpwgl.initialize(this.header, {});
			} else { // mobile

			}
			this.tabs = [
				["div", { className: "tab-kill" }],
				["div", { className: "tab-kill" }],
				["div", { className: "tab-kill" }],
				["div", { className: "tab-kill" }]
			];

			this.loadInitial().then(() => this.ready());
		}

		getHeader () {
			return this.header;
		}

		getTabs () {
			return this.tabs;
		}

		loadInitial () {
			this.getApp().setLoadingState(true);
			return json(`https://api.utils.space/killmails/${this.killID}/`).then(kill => {

				console.log(kill);

				return Promise.resolve();
			});
		}

		getKillID () {
			return this.killID;
		}

		render () {
			return $(["div", { className: "killmail page" }, [
				this.getHeader(),
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-1", value: "1" }],
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-2", value: "2" }],
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-3", value: "3" }],
				["div", { className: "tab-highlighter" }],
				["div", { className: "tabs-kill" }, [
					["div"],
					["div"],
					["div"],
					["div"],
					["label", { htmlFor: "tabs-kill-" + this.getKillID() + "-1" }],
					["label", { htmlFor: "tabs-kill-" + this.getKillID() + "-2" }],
					["label", { htmlFor: "tabs-kill-" + this.getKillID() + "-3" }]
				]],
				["div", { className: "tabs-kill-conti" }, this.getTabs()]
			]]);
		}

	}
