
	"use strict";

	class KillboardPage extends Page {

		constructor (parent) {
			super(parent, "Killboard");
			this.classList.push("page");

			this.list = $(["div", { className: "kill list" }]);

			this.getList().on("scroll", () => {
				if((this.getList().clientHeight + this.getList().scrollTop) / this.getList().scrollHeight * 100 > 80)
					this.scrollDown();
			});

			this.loadInitial();
		}

		loadInitial () {
			this.scrollDown().then(() => this.ready());
		}

		scrollDown () {
			return fetch("https://api.utils.space/killmails/", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					"filter": Object.assign({}, this.lowKillID ? { killID: { $lt: this.lowKillID } } : {}),
					"options": { "sort": { "killID": -1 }, "limit": 50 }
				})
			}).then(res => res.json()).then(data => {
				data.forEach(kill => {
					this.getList().append($(["a", { href: `/killmails/${kill.killID}/` }, [
						$(["img", { src: `https://imageserver.eveonline.com/Type/${kill.victim.shipType.id}_64.png`, alt: kill.victim.shipType.name }]),
						$(["span", { innerHTML: kill.victim.character.name }]),
						$(["span", { innerHTML: (({ character, corporation, alliance, faction }, els = [character, corporation, alliance, faction]) => els.find(e => !!e))(kill.attackers.find(attacker => attacker.finalBlow)).name }])
					]]));
					this.lowKillID = Math.min(this.lowKillID || Number.MAX_VALUE, kill.killID);
				});
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
	