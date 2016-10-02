
	"use strict";

	class SearchBar extends Module {

		constructor (parent) {
			super(parent);

			this.input = $(["input", { type: "text" }]);
			this.bar = $(["div", { className: "searchbar" }, [
				["div", { className: "sbexpand" }, [
					this.getInput()
				]]
			]]);

			this.maxer = $(["input", { type: "checkbox", id: "searchbarMaxer" }]);

			this.getInput().on("keyup", () => {
				this.getMaxer().checked = this.getInput().value !== "";
			});

			this.getInput().on("blur", e => {
				this.getMaxer().checked = false;
			});
		}

		getMaxer () {
			return this.maxer;
		}

		getInput () {
			return this.input;
		}

		getBar () {
			return this.bar;
		}

		render () {
			return this.getBar();
		}

	}
	