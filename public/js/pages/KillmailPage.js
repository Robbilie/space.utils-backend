
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
				this.camera.minDistance = 0.6;
				this.camera.maxDistance = 100000;
				this.camera.fov = 30;
				this.camera.distance = 100;
				this.camera.nearPlane = 10;
				this.camera.minPitch = -0.5;
				this.camera.maxPitch = 0.35;
				ccpwgl.setCamera(this.camera);

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
								this.scene = ccpwgl.loadScene(`res:/dx9/scene/universe/${dna.split(":").slice(-1)[0][0]}09_cube.red`);
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
				["div", { className: "fitting-conti" }, [
					this.getHeader(),
					["div", { className: "kill-img-conti" }, [
						["div", { className: "kill-img-wrap" }, [
							["img", { src: "/img/fitting/fittingbase.png" }]
						]],
						["div", { className: "kill-img-wrap" }, [
							["img", { src: "/img/fitting/fittingbase_dotproduct.png" }]
						]]
					]]
				]],
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-1", value: "1", className: "tabs-kill-1", checked: "true" }],
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-2", value: "2", className: "tabs-kill-2" }],
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-3", value: "3", className: "tabs-kill-3" }],
				["div", { className: "tabs-kill" }, [
					["div", { className: "tab-highlighter" }],
					["div", { className: "kill-tab-headline", innerHTML: "Items" }],
					["div", { className: "kill-tab-headline", innerHTML: "Attackers" }],
					["div", { className: "kill-tab-headline", innerHTML: "Stats" }],
					["div", { className: "kill-tab-headline", innerHTML: "Comments" }],
					["div", { className: "kill-label-wrapper" }, [
						["label", { htmlFor: "tabs-kill-" + this.getKillID() + "-1" }],
						["label", { htmlFor: "tabs-kill-" + this.getKillID() + "-2" }],
						["label", { htmlFor: "tabs-kill-" + this.getKillID() + "-3" }]
					]]
				]],
				["div", { className: "tabs-kill-conti" }, this.getTabs()]
			]]);
		}

	}
