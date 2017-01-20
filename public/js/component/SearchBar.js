
	"use strict";

	class SearchBar extends Component {

		search (search) {
			ESIClient
				.then(client => client.Search.get_search({ search, categories: ["alliance", "character", "corporation", "inventorytype", "solarsystem"/*, "region"*/] }))
				.then(({ obj }) => console.log(obj))
				.catch(e => console.log("E", e));
			/*
			fetch(`https://esi.tech.ccp.is/latest/search/?search=${query}&categories=agent%2Calliance%2Ccharacter%2Cconstellation%2Ccorporation%2Cfaction%2Cinventorytype%2Cregion%2Csolarsystem%2Cstation%2Cwormhole&language=en-us&strict=false&datasource=tranquility`)
				.then(res => res.json())
				.then(data => console.log(data));
			*/
		}

		render () {
			return E("div", { className: "searchbar" },
				E("div", { className: "sbexpand" },
					E("input", {
						type: "text",
						onBlur: this.props.searchBarHandler,
						onKeyUp: e => this.props.searchBarHandler(e) || this.search(e.target.value),
						onFocus: this.props.searchBarHandler
					})
				)
			);
		}

	}
