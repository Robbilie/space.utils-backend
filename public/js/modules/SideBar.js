
	"use strict";

	class SideBar extends Module {

		constructor (parent) {
			super(parent);
			this.toggle = $(["input", { type: "checkbox", id: "sidebarToggle" }]);
			this.button = $(["label", { htmlFor: "sidebarToggle", id: "sidebarButton" }, [
				$(["span", { className: "sidebarOpen", innerHTML: "≡" }]),
				$(["span", { className: "sidebarClose", innerHTML: "&times;" }])
			]]);
		}

		getToggle () {
			return this.toggle;
		}

		getButton () {
			return this.button;
		}

		render () {
			return $(["div", { className: "sidebar" }]);
		}

	}