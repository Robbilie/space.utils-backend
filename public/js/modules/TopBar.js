
	"use strict";

	class TopBar extends Module {

		constructor (parent) {
			super(parent);
			this.searchBar = new SearchBar(this);
			this.time = new Clock(this);
		}

		getSearchBar () {
			return this.searchBar;
		}

		getTime () {
			return this.time;
		}

		render () {
			return $(["div", { className: "topbar" }, [
				$(["div", { id: "clock" }, [
					this.getTime()
				]]),
				this.getSearchBar()
			]]);
		}

	}
	