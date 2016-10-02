
	"use strict";

	class KillboardPage extends Page {

		constructor (parent) {
			super(parent, "Killboard");
			this.classList.push("page");

			this.list = $(["div", { className: "killlist" }]);

			this.loadInitial();
		}

		loadInitial () {
			fetch("https://api.utils.space/killmails/", {
				method: "POST",
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					"filter": { },
					"options": { "sort": { "killID": -1 }, "limit": 50 }
				})
			}).then(res => res.json()).then(data => {
				data.forEach(kill => this.getList().append($(["a", { href: `/killmails/${kill.killID}` }, [
					$(["img", { src: `https://imageserver.eveonline.com/Type/${kill.victim.shipType.id}_64.png`, alt: kill.victim.shipType.name }]),
					$(["span", { innerHTML: kill.victim.character.name }]),
					$(["span", { innerHTML: kill.attackers.find(attacker => attacker.finalBlow).character.name }])
				]])));
				this.ready();
			});
		}

		getList () {
			return this.list;
		}

		render () {
			return this.getList();
		}

	}
	