
	"use strict";

	class SideBar extends Module {

		constructor (parent) {
			super(parent);

			this.toggle = $(["input", { type: "checkbox", id: "sidebarToggle" }]);
			this.button = $(["label", { htmlFor: "sidebarToggle", id: "sidebarButton" }, [
				$(["span", { className: "sidebarOpen", innerHTML: "≡" }]),
				$(["span", { className: "sidebarClose", innerHTML: "&times;" }])
			]]);
			this.usercounter = $(["div", { className: "usercount" }]);

			this.updateUserCounter();
		}

		getToggle () {
			return this.toggle;
		}

		getButton () {
			return this.button;
		}

		getUserCounter () {
			return this.usercounter;
		}

		updateUserCounter () {
			let x = new XMLHttpRequest()
				x.onload = e => {
					let status = e.target.responseXML.getElementsByTagName("serverOpen")[0].innerHTML == "True";
					let online = e.target.responseXML.getElementsByTagName("onlinePlayers")[0].innerHTML - 0;
					let current = new Date(e.target.responseXML.getElementsByTagName("currentTime")[0].innerHTML + " GMT").getTime();
					let cached = new Date(e.target.responseXML.getElementsByTagName("cachedUntil")[0].innerHTML + " GMT").getTime();

					this.getUserCounter().innerHTML = "<span>TQ</span> " + online;
					if(status)
						this.getUserCounter().classList.add("online");
					else
						this.getUserCounter().classList.remove("online");

					setTimeout(() => this.updateUserCounter(), cached - current);
				};
				x.open("GET", "https://api.eveonline.com/Server/ServerStatus.xml.aspx");
				x.send();
		}

		render () {
			return $(["div", { className: "sidebar" }, [
				this.getUserCounter(),
				["a", { className: "homebtn", href: "/" }]
			]]);
		}

	}