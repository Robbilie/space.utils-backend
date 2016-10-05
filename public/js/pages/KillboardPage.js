
	"use strict";

	class KillboardPage extends Page {

		constructor (parent) {
			super(parent, "Killboard");
			this.classList.push("page");

			this.list = $(["div", { className: "kill list" }]);

			this.getList().on("scroll", () => {
				if(!this.scrolling && this.getList().scrollHeight - (this.getList().clientHeight + this.getList().scrollTop) < 200)
					this.scrollDown();
			});

			this.loadInitial();
		}

		loadInitial () {
			this.getApp().setLoadingState(true);
			this.scrollDown().then(() => this.ready());
		}

		scrollDown () {
			this.scrolling = true;
			return json("https://api.utils.space/killmails/", "POST", {
				"filter": Object.assign({}, this.lowKillID ? { killID: { $lt: this.lowKillID } } : {}),
				"options": { "sort": { "killID": -1 }, "limit": 50 }
			}).then(data => {
				data.forEach(kill => {
					let victim = kill.victim;
					let attacker = kill.attackers.find(attacker => attacker.finalBlow);
					let time = new Date(kill.killTime + " GMT");
					this.getList().append($(["a", { className: "row", href: `/killmails/${kill.killID}/` }, [
						["div", { className: "column grad col-1" }, [
							["img", { src: `https://imageserver.eveonline.com/Type/${kill.victim.shipType.id}_64.png`, alt: kill.victim.shipType.name }],
							["span", { className: "vertmid", innerHTML: `<b>${Clock.getTimeStr(time)}</b><br>${kill.solarSystem.name}` }]
						]],
						["div", { className: "column grad col-2" }, [
							["img", { src: `https://imageserver.eveonline.com/${["alliance", "corporation", "character"].find(e => !!victim[e]).capitalizeFirstLetter()}/${[victim.alliance, victim.corporation, victim.character].find(e => !!e).id}_64.png`, alt: [victim.alliance, victim.corporation, victim.character].find(e => !!e).name }],
							["span", { className: "vertmid", innerHTML: `<b>${[victim.character, victim.corporation, victim.alliance, victim.faction].find(e => !!e).name}</b><br>${[victim.corporation.name, victim.alliance ? victim.alliance.name : null].filter(e => !!e).join(" | ")}` }]
						]],
						["div", { className: "column grad col-3 deso" }, [
							["img", { src: `https://imageserver.eveonline.com/${(["alliance", "corporation", "character"].find(e => !!attacker[e]) || "alliance").capitalizeFirstLetter()}/${[attacker.alliance, attacker.corporation, attacker.character, attacker.faction].find(e => !!e).id}_64.png`, alt: [attacker.alliance, attacker.corporation, attacker.character, attacker.faction].find(e => !!e).name }],
							["span", { className: "vertmid", innerHTML: `<b>${[attacker.character, attacker.corporation, attacker.alliance, attacker.faction].find(e => !!e).name + (kill.attackers.length > 1 ? " [+" + (kill.attackers.length - 1) + "]" : "")}</b><br>${[attacker.corporation ? attacker.corporation.name : null, attacker.alliance ? attacker.alliance.name : null, attacker.faction && !attacker.character ? attacker.faction.name : null].filter(e => !!e).join(" | ")}` }]
						]]
					]]));
					this.lowKillID = Math.min(this.lowKillID || Number.MAX_VALUE, kill.killID);
				});
				this.scrolling = false;
				return Promise.resolve();
			});
		}

		getList () {
			return this.list;
		}

		render () {
			return $(["div", { className: "killboard page" }, [
				this.getList()
			]]);
		}

	}
	