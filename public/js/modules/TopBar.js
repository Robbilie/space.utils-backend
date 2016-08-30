
	"use strict";

	class TopBar extends Module {

		constructor (parent) {
			super(parent);
			this.searchBar = new SearchBar(this);
		}

		getSearchBar () {
			return this.searchBar;
		}

		render () {
			return $(["div", { className: "topbar" }, [
				this.getSearchBar()
			]]);
		}

	}
	