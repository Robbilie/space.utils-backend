
	"use strict";

	class CorporationPage extends Page {

		constructor (props) {
			super(props);
			this.state = {
				id: 0,
				name: "",
				ticker: "",
				ceo: {
					id: 0,
					name: ""
				}
			};
		}

		componentWillMount () {
			console.log("will mount");
			this.setLoading(true);
			EASClient
				.then(client => client.corporations.CorporationHandler_get_by_id({ corporation_id: this.props.params.id }))
				.then(({ obj }) => {
					console.log(obj);
					this.setState(obj, () => setTimeout(() => this.setLoading(false)));
					console.log("set state");
				});
		}

		render () {
			return E("div", { className: "page corporation-page two-col-page" },
				E("div", { className: "left-col" },
					E("img", { src: `https://imageserver.eveonline.com/Corporation/${this.state.id}_256.png` }),
					E("h2", { className: "mobile" },
						E("span", null, "Corporation"),
						E("br"),
						E("b", null, this.state.name)
					),
					E("div", { className: "info-list" },
						E("div", { className: "" },
							E("div", { className: "" }),
							E("div", { className: "" },
								E("span", null, "Ticker"),
								E("br"),
								E("b", null, this.state.ticker)
							)
						),
						E("div", { className: "" },
							E("div", { className: "" },
								E("img", { src: `https://imageserver.eveonline.com/Character/${this.state.ceo.id}_32.jpg` })
							),
							E("div", { className: "" },
								E("span", null, "CEO"),
								E("br"),
								E("b", null,
									E(Link, { to: `/characters/${this.state.ceo.id}/` }, this.state.ceo.name)
								)
							)
						),
						this.state.alliance ? E("div", { className: "" },
							E("div", { className: "" },
								E("img", { src: `https://imageserver.eveonline.com/Alliance/${this.state.alliance.id}_32.png` })
							),
							E("div", { className: "" },
								E("span", null, "Alliance"),
								E("br"),
								E("b", null,
									E(Link, { to: `/alliances/${this.state.alliance.id}/` }, this.state.alliance.name)
								)
							)
						) : ""
					)
				),
				E("div", { className: "right-col" },
					E("h2", { className: "desktop" },
						E("span", null, "Corporation"),
						E("br"),
						E("b", null, this.state.name)
					)
				)
			);
		}

	}
