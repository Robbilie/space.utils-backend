
	"use strict";

	class SearchBar extends Component {

		constructor (props) {
			super(props);
			this.state = { results: [] };
		}

		search (search) {
			ESIClient
				.then(client => client.Search.get_search({ search, categories: ["alliance", "character", "corporation", "inventorytype", "solarsystem"/*, "region"*/] })
					.then(({ obj: { alliance = [], character = [], corporation = [], inventorytype = [], solarsystem = [] } }) =>
						client.Universe.post_universe_names({ ids: { ids: [...alliance, ...character, ...corporation, ...inventorytype, ...solarsystem] } })
					)
					.then(({ obj }) => Object
						.entries(obj
							.reduce((p, { category, id, name }) => {
								p[category] = { id, name }; return p;
							}, {})
						)
						.sort(([a], [b]) => a > b ? 1 : -1)
					)
				)
				.then(results => {
					this.setState({ results });
					console.log(results);
				})
				.catch(e => console.log("E", e));
		}

		resultToUrl (size, category, id) {
			let url = "https://imageserver.eveonline.com";
			let type;
			let extension;
			switch (category) {
				case "alliance":
					type = "Alliances";
					extension = "png";
					break;
				case "corporation":
					type = "Corporations";
					extension = "png";
					break;
				case "character":
					type = "Characters";
					extension = "jpg";
					break;
				case "inventory_type":
					type = "Types";
					extension = "png";
					break;
			}
			return `${url}/${type}/${id}_${size}.${extension}`;
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
				),
				E("div", { className: "searchres" },
					...this.state.results.map(([headline, results]) => [
						E("h3", null, headline), ...results.map(({ id, name }) =>
						E("div", null,
							E("img", { src: this.resultToUrl(64, headline, id) }),
							E("span", null, name)
						))
					])
				)
			);
		}

	}
