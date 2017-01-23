
	"use strict";

	class CharacterPage extends Component {

		constructor (props) {
			super(props);
			this.state = {
				id: 0,
				name: "",
				corporation: {
					id: 0,
					name: "",
					alliance: {
						id: 0,
						name: ""
					}
				}
			};
			this.load();
		}

		load () {
			EASClient
				.then(client => client.characters.CharacterHandler_get_by_id({ character_id: this.props.params.id }))
				.then(({ obj }) => console.log(obj) || this.setState(obj));
		}

		render () {
			return E("div", { className: "page two-col-page" },
				E("div", { className: "left-col" },
					E("img", { src: `https://imageserver.eveonline.com/Character/${this.state.id}_128.jpg` }),
					E("div", { className: "info-list" },
						E("div", { className: "" },
							E("span", null, "Corporation"),
							E("br"),
							E("b", null,
								E(Link, { to: `/corporations/${this.state.corporation.id}/` }, this.state.corporation.name)
							)
						),
						this.state.corporation.alliance.id ? E("div", { className: "" },
							E("span", null, "Alliance"),
							E("br"),
							E("b", null,
								E(Link, { to: `/alliances/${this.state.corporation.alliance.id}/` }, this.state.corporation.alliance.name)
							)
						) : ""
					)
				),
				E("div", { className: "right-col" },
					E("h2", {},
						E("span", null, "Character"),
						E("br"),
						E("b", null, this.state.name)
					)
				)
			);
		}

	}
