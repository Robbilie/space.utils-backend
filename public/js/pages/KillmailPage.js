
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

				this.camera = new TestCamera(this.header);
				camera.minDistance = 0.6;
				camera.maxDistance = 100000;
				camera.fov = 30;
				camera.distance = 100;
				camera.nearPlane = 10;
				camera.minPitch = -0.5;
				camera.maxPitch = 0.35;
				ccpwgl.setCamera(camera);

				this.scene = ccpwgl.createScene([1,1,1,0]);


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
			return new Promise((resolve) => {
				json(`https://api.utils.space/killmails/${this.killID}/`).then(kill => {

					console.log(kill);

					json(`https://crest-tq.eveonline.com/inventory/types/${kill.victim.shipType.id}/`).then(ship => {
						if(ship.graphicID && ship.graphicID.sofDNA) {
							const dna = ship.graphicID.sofDNA;
							if (dna.split(":").length > 2) {
								ccpwgl.getSofHullConstructor(dna, (constructor) => {
									if (constructor) {
										var obj = this.scene[constructor](dna);
										if ("setBoosterStrength" in obj) {
											obj.setBoosterStrength(1);
										}
									}
								});
							} else {
								this.scene.loadObject(dna);
							}
						}
						return resolve();
					});
				})
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
