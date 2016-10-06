
	"use strict";

	class KillmailPage extends Page {

		constructor (parent, killID) {
			super(parent, "Killmail");
			this.classList.push("page");

			this.killID = killID - 0;

			console.log("Kill", killID);

			if(true) { // desktop
				this.header = $(["canvas", { className: "kill-header-bg" }]);

				this.ccpwgl = ccpwgl(ccpwgl_int() || window);

				this.ccpwgl.initialize(this.header, {});

				this.camera = new TestCamera(this.header);
				this.camera.minDistance = 10;
				this.camera.maxDistance = 10000;
				this.camera.fov = 30;
				this.camera.distance = 5000;
				this.camera.nearPlane = 1;
				this.camera.minPitch = -0.5;
				this.camera.maxPitch = 0.65;
				this.ccpwgl.setCamera(this.camera);

			} else { // mobile

			}
			this.tabs = [
				$(["div", { className: "tab-kill" }]),
				$(["div", { className: "tab-kill" }]),
				$(["div", { className: "tab-kill" }]),
				$(["div", { className: "tab-kill" }])
			];
			this.fittingConti = null;

			this.loadInitial().then(() => this.ready());
		}

		getHeader () {
			return this.header;
		}

		getTabs () {
			return this.tabs;
		}

		getTab (key) {
			return this.getTabs()[({ "items": 0, "attackers": 1, "stats": 2, "comments": 3 })[key]];
		}

		loadInitial () {
			this.getApp().setLoadingState(true);
			return new Promise((resolve) => {
				json(`https://api.utils.space/killmails/${this.killID}/`).then(kill => {

					console.log(kill);

					//this.getFittingConti().children[1].style.display = kill.victim.items.length == 0 ? "none" : "block";

					kill.victim.items.forEach(item => this.getTab("items").append($(["div", { className: item.quantityDestroyed ? "destroyed" : "dropped" }, [
						["img", { src: `https://imageserver.eveonline.com/Type/${item.itemType.id}_64.png` }],
						["span", { innerHTML: item.itemType.name }],
						["span", { innerHTML: item.quantityDestroyed || item.quantityDropped }]
					]])));

					kill.attackers.forEach(attacker => this.getTab("attackers").append($(["div", { className: "" }, [
						["img", { src: `http://imageserver.eveonline.com/Type/${attacker.shipType.id}_64.png` }],
						["img", { src: `http://imageserver.eveonline.com/Type/${(attacker.weaponType || attacker.shipType).id}_64.png` }],
						["img", { src: `https://imageserver.eveonline.com/${(["character", "corporation", "alliance"].find(e => !!attacker[e]) || "alliance").capitalizeFirstLetter()}/${[attacker.character, attacker.corporation, attacker.alliance, attacker.faction].find(e => !!e).id}_64.${["character", "corporation", "alliance"].find(e => !!attacker[e]) == "character" ? "jpg" : "png"}` }],
						["span", { innerHTML: [attacker.character, attacker.corporation, attacker.alliance, attacker.faction].find(e => !!e).name }],
						["span", { innerHTML: attacker.damageDone }]
					]])));

					Helper.typeToGraphic(kill.victim.shipType.id).then(dna => {
						const page = this;
						this.scene = this.ccpwgl.loadScene(`res:/dx9/scene/universe/${((f) => ["a", "c", "g", "m"].find(c => c == f) || "c")(dna.split(":").slice(-1)[0][0])}09_cube.red`);

						function cameraLookAt(spaceObject, distanceScaler) {
							// The spaceObject must be loaded to get it's bounding sphere data
							if (!spaceObject.isLoaded())
							{
								throw new page.ccpwgl.IsStillLoadingError();
							}

							// Get the space Object's position
							let objectPosition = spaceObject.getTransform().slice(12, 15);

							// Set the camera's point of interest as the space object's position in world space
							vec3.set(objectPosition, page.camera.poi);

							// Get the radius of the space object
							let spaceObjectRadius = parseInt(spaceObject.getBoundingSphere()[1]);

							// Set the camera's minimum distance
							page.camera.minDistance = spaceObjectRadius * 0.8;

							// Set the camera's distance
							page.camera.distance = spaceObjectRadius * distanceScaler;
						}

						// A callback function that is run once the ship's base javascript object has loaded.
						function whenLoaded() {
							cameraLookAt(this, 5)
						}

						if (dna.split(":").length > 2) {
							this.ccpwgl.getSofHullConstructor(dna, (constructor) => {
								console.log(constructor);
								if (constructor) {
									var obj = this.scene[constructor](dna, whenLoaded);
									if ("setBoosterStrength" in obj) {
										obj.setBoosterStrength(1);
									}
								}
							});
						} else {
							this.scene.loadObject(dna, whenLoaded);
						}
						return resolve();
					});

				})
			});
		}

		getKillID () {
			return this.killID;
		}

		getFittingConti () {
			return this.fittingConti;
		}

		render () {
			return $(["div", { className: "killmail page" }, [
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-1", value: "1", className: "tabs-kill-1", checked: "true" }],
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-2", value: "2", className: "tabs-kill-2" }],
				["input", { type: "radio", name: "tabs-kill-" + this.getKillID(), id: "tabs-kill-" + this.getKillID() + "-3", value: "3", className: "tabs-kill-3" }],
				["div", { className: "fitting-conti" }, [
					this.getHeader(),
					["div", { className: "kill-img-conti" }, [
						["div", { className: "kill-img-wrap" }, [
							["img", { src: "/img/fitting/fittingbase.png" }]
						]],
						["div", { className: "kill-img-wrap" }, [
							["img", { src: "/img/fitting/fittingbase_dotproduct.png" }]
						]]
					]],
					["div", { className: "kill-header-infolay" }, [
						["div", { className: "kill-header-info" }],
						["img", { src: "/img/1x1.png" }],
						["div", { className: "kill-header-info" }]
					]],
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
					]]
				]],
				["div", { className: "tabs-kill-wrap" }, [
					["div", { className: "tabs-kill-conti" }, this.getTabs().map(tab => $(["div", { className: "tab-kill" }, [tab]]))]
				]]
			]]);
		}

	}
