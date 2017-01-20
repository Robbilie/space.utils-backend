
	"use strict";

	class SearchBar extends Component {

		constructor (props) {
			super(props);
			this.state = { results: [["Start typing…", []]] };
		}

		search (search) {
			if (search.length < 3)
				return;
			ESIClient
				.then(client => client.Search.get_search({ search, categories: ["alliance", "character", "corporation", "inventorytype", "solarsystem"/*, "region"*/] })
					.then(({ obj: { alliance = [], character = [], corporation = [], inventorytype = [], solarsystem = [] } }) =>
						client.Universe.post_universe_names({ ids: { ids: [...alliance, ...character, ...corporation, ...inventorytype, ...solarsystem] } })
					)
					.then(({ obj }) => Object
						.entries(obj
							.reduce((p, { category, id, name }) => {
								if (p[category])
									p[category].push({ id, name });
								else
									p[category] = [{ id, name }];
								return p;
							}, {})
						)
						.sort(([a], [b]) => a > b ? 1 : -1)
					)
				)
				.then(results => {
					console.log(results);
					this.setState({ results });
				})
				.catch(e => console.log("E", e));
		}

		resultToUrl (size, category, id) {
			let url = "https://imageserver.eveonline.com";
			let type;
			let extension;
			switch (category) {
				case "alliance":
					type = "Alliance";
					extension = "png";
					break;
				case "corporation":
					type = "Corporation";
					extension = "png";
					break;
				case "character":
					type = "Character";
					extension = "jpg";
					break;
				case "inventory_type":
					type = "Type";
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
						onBlur: e => this.props.searchBarHandler(e),
						onKeyUp: e => this.props.searchBarHandler(e) || this.search(e.target.value),
						onFocus: e => this.props.searchBarHandler(e) || e.target.value == "" ? this.setState({ results: [["Start typing…", []]] }) : false
					})
				),
				E("div", { className: "searchres" },
					...this.state.results.map(([headline, results]) =>
					[
						E("h3", { key: headline }, headline),
						...results.map(({ id, name }) =>
							E("div", { key: id },
								E("img", { src: this.resultToUrl(64, headline, id) }),
								E("span", null, name)
							)
						)
					])
				)
			);
		}

	}
