
	"use strict";

	class SearchBar extends Component {

		constructor (props) {
			super(props);
			this.state = {
				results: [["Start typing…", []]],
				limit: 20,
				query: this.props.query || ""
			};

			if (this.props.query)
				this.search(this.props.query, true);
		}

		handleChange (e) {
			this.setState({ query: e.target.value });
		}

		search (search, init) {
			if (!init)
				this.setState({ query: search });
			if (search.length < 3)
				return this.setState({ results: [["Start typing…", []]] });
			ESIClient
				.then(client => client.Search.get_search({ search, categories: ["alliance", "character", "corporation", "inventorytype", "solarsystem"/*, "region"*/] })
					.then(({ obj: { alliance, character, corporation, inventorytype, solarsystem } }) =>
						client.Universe.post_universe_names({ ids: { ids: [
							...(alliance || []).slice(0, this.state.limit),
							...(character || []).slice(0, this.state.limit),
							...(corporation || []).slice(0, this.state.limit),
							...(inventorytype || []).slice(0, this.state.limit),
							...(solarsystem || []).slice(0, this.state.limit)
						] } })
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
					if (this.state.query == search) {
						console.log(results);
						this.setState({ results });
					}
				})
				.catch(e => console.log("E", e));
		}

		resultToUrl (size, category, id) {
			return `https://imageserver.eveonline.com/${category.split("_").slice(-1)[0].capitalizeFirstLetter()}/${id}_${size}.${category == "character" ? "jpg" : "png"}`;
		}

		render () {
			return E("div", { className: "searchbar" },
				E("div", { className: "sbexpand" },
					E("input", {
						type: "text",
						value: this.state.query,
						onChange: e => this.handleChange(e),
						onBlur: e => this.props.handler("blur", e.target.value),
						onKeyUp: e => this.props.handler("keyup", e.target.value) || this.search(e.target.value),
						onFocus: e => this.props.handler("focus", e.target.value) || e.target.value == "" ? this.setState({ results: [["Start typing…", []]] }) : false
					})
				),
				E("div", { className: "searchres", onClick: e => this.props.handler("click", true) },
					...this.state.results.map(result =>
					[
						E(
							"h3",
							{
								key: result[0]
							},
							result[0]
						),
						...result[1].map(({ id, name }) =>
							E(Link, { key: id, to: `/${result[0].split("_").slice(-1)}s/${id}/` },
								E("img", { src: this.resultToUrl(64, result[0], id) }),
								E("span", null, name)
							)
						)
					])
				)
			);
		}

	}
