
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
					//let victim = (({ character, corporation, alliance, faction }, els = [character, corporation, alliance, faction]) => els.find(e => !!e))(kill.victim);
					//let attacker = (({ character, corporation, alliance, faction }, els = [character, corporation, alliance, faction]) => els.find(e => !!e))(kill.attackers.find(attacker => attacker.finalBlow));
					let victim = kill.victim;
					let attacker = kill.attackers.find(attacker => attacker.finalBlow);
					let time = new Date(kill.killTime + " GMT");
					this.getList().append($(["a", { href: `/killmails/${kill.killID}/` }, [
						["table", {}, [
							["tr", {}, [
								["td", { className: "deso" }, [
									["img", { src: `https://imageserver.eveonline.com/Type/${kill.victim.shipType.id}_64.png`, alt: kill.victim.shipType.name }]
								]],
								["td", {}, [
									["span", { innerHTML: Clock.getTimeStr(time) }],
									["br"],
									["span", { innerHTML: kill.solarSystem.name }]
								]],
								["td", { className: "deso" }, [
									["img", { src: `https://imageserver.eveonline.com/${["alliance", "corporation", "character"].find(e => !!victim[e]).capitalizeFirstLetter()}/${[victim.alliance, victim.corporation, victim.character].find(e => !!e).id}_64.png`, alt: [victim.alliance, victim.corporation, victim.character].find(e => !!e).name }]
								]],
								["td", {}, [
									["span", { innerHTML: [victim.character, victim.corporation, victim.alliance, victim.faction].find(e => !!e).name }],
									["br"],
									["span", { innerHTML: victim.corporation.name + (victim.alliance ? " | " + victim.alliance.name : "") }]
								]],
								["td", { className: "deso" }, [
									["img", { src: `https://imageserver.eveonline.com/${["alliance", "corporation", "character"].find(e => !!attacker[e]).capitalizeFirstLetter()}/${[attacker.alliance, attacker.corporation, attacker.character, attacker.faction].find(e => !!e).id}_64.png`, alt: [attacker.alliance, attacker.corporation, attacker.character, attacker.faction].find(e => !!e).name }]
								]],
							]]
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
	