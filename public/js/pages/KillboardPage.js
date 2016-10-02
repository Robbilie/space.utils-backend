
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
			this.scrollDown().then(() => this.ready());
		}

		scrollDown () {
			this.scrolling = true;
			return json("https://api.utils.space/killmails/", "POST", {
				"filter": Object.assign({}, this.lowKillID ? { killID: { $lt: this.lowKillID } } : {}),
				"options": { "sort": { "killID": -1 }, "limit": 50 }
			}).then(data => {
				data.forEach(kill => {
					this.getList().append($(["a", { href: `/killmails/${kill.killID}/` }, [
						["img", { src: `https://imageserver.eveonline.com/Type/${kill.victim.shipType.id}_64.png`, alt: kill.victim.shipType.name }],
						["span", { innerHTML: (({ character, corporation, alliance, faction }, els = [character, corporation, alliance, faction]) => els.find(e => !!e))(kill.victim).name }],
						["span", { innerHTML: (({ character, corporation, alliance, faction }, els = [character, corporation, alliance, faction]) => els.find(e => !!e))(kill.attackers.find(attacker => attacker.finalBlow)).name }]
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
	