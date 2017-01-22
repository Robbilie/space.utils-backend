
	"use strict";

	class CorporationPage extends Component {

		constructor (props) {
			super(props);
			this.state = {
				id: 0,
				name: "",
				ticker: "",
				ceo: {
					id: 0,
					name: ""
				},
				alliance: {
					id: 0,
					name: ""
				}
			};
			this.load();
		}

		load () {
			EASClient
				.then(client => client.corporations.CorporationHandler_get_by_id({ corporation_id: this.props.params.id }))
				.then(({ obj }) => console.log(obj) || this.setState(obj));
		}

		render () {
			return E("div", { className: "page two-col-page" },
				E("div", { className: "left-col" },
					E("img", { src: `https://imageserver.eveonline.com/Corporation/${this.state.id}_128.png` }),
					E("div", { className: "info-list" },
						E("div", { className: "" },
							E("span", null, "Ticker"),
							E("br"),
							E("b", null, this.state.ticker)
						),
						E("div", { className: "" },
							E("span", null, "CEO"),
							E("br"),
							E("b", null,
								E(Link, { to: `/characters/${this.state.alliance.id}/` }, this.state.ceo.name)
							)
						),
						this.state.alliance ? E("div", { className: "" },
							E("span", null, "Alliance"),
							E("br"),
							E("b", null,
								E(Link, { to: `/alliances/${this.state.alliance.id}/` }, this.state.alliance.name)
							)
						) : ""
					)
				),
				E("div", { className: "right-col" },
					E("h2", {},
						E("span", null, "Corporation"),
						E("br"),
						E("b", null, this.state.name)
					)
				)
			);
		}

	}
