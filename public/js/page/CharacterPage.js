
	"use strict";

	class CharacterPage extends Component {

		constructor (props) {
			super(props);
			this.state = {
				id: 0,
				name: "",
				corporation: {
					id: 0,
					name: ""
				}
			};
			this.load();
		}

		componentWillAppear (cb) {
			console.log("will appear");
			this.done = () => console.log("called") || cb();
		}

		componentWillEnter (cb) {
			console.log("will enter");
			this.done = () => console.log("called") || cb();
		}

		load () {
			EASClient
				.then(client => client.characters.CharacterHandler_get_by_id({ character_id: this.props.params.id }))
				.then(({ obj }) => {
					console.log(obj);
					this.setState(obj, this.done);
					console.log("set state");
				});
		}

		render () {
			return E("div", { className: "page two-col-page" },
				E("div", { className: "left-col" },
					E("img", { src: `https://imageserver.eveonline.com/Character/${this.state.id}_256.jpg` }),
					E("h2", { className: "mobile" },
						E("span", null, "Character"),
						E("br"),
						E("b", null, this.state.name)
					),
					E("div", { className: "info-list" },
						E("div", { className: "" },
							E("div", { className: "" },
								E("img", { src: `https://imageserver.eveonline.com/Corporation/${this.state.corporation.id}_32.png` })
							),
							E("div", { className: "" },
								E("span", null, "Corporation"),
								E("br"),
								E("b", null,
									E(Link, { to: `/corporations/${this.state.corporation.id}/` }, this.state.corporation.name)
								)
							)
						),
						this.state.corporation.alliance ? E("div", { className: "" },
							E("div", { className: "" },
								E("img", { src: `https://imageserver.eveonline.com/Alliance/${this.state.corporation.alliance.id}_32.png` })
							),
							E("div", { className: "" },
								E("span", null, "Alliance"),
								E("br"),
								E("b", null,
									E(Link, { to: `/alliances/${this.state.corporation.alliance.id}/` }, this.state.corporation.alliance.name)
								)
							)
						) : ""
					)
				),
				E("div", { className: "right-col" },
					E("h2", { className: "desktop" },
						E("span", null, "Character"),
						E("br"),
						E("b", null, this.state.name)
					)
				)
			);
		}

	}
