
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

			this.getInput().on("keyup", e => {
				if(this.getInput().value !== "")
					this.getBar().classList.add("maxsb");
				else
					this.getBar().classList.remove("maxsb");
			});

			this.getInput().on("blur", e => {
				this.getBar().classList.remove("maxsb");
			});
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
	