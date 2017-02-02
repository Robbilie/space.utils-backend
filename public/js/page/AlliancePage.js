
	"use strict";

	class AlliancePage extends Component {

		constructor (props) {
			super(props);
			this.state = {
				id: 0,
				name: "",
				ticker: "",
				executor_corporation: {
					id: 0,
					name: ""
				}
			};
			this.load();
		}

		load () {
			EASClient
				.then(client => client.alliances.AllianceHandler_get_by_id({ alliance_id: this.props.params.id }))
				.then(({ obj }) => console.log(obj) || this.setState(obj));
		}

		render () {
			return E("div", { className: "page two-col-page" },
				E("div", { className: "left-col" },
					E("img", { style: { width: "256px" }, src: `https://imageserver.eveonline.com/Alliance/${this.state.id}_128.png` }),
					E("h2", { className: "mobile" },
						E("span", null, "Alliance"),
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
								E("img", { src: `https://imageserver.eveonline.com/Corporation/${this.state.executor_corporation.id}_32.png` })
							),
							E("div", { className: "" },
								E("span", null, "Executor"),
								E("br"),
								E("b", null,
									E(Link, { to: `/corporations/${this.state.executor_corporation.id}/` }, this.state.executor_corporation.name)
								)
							)
						)
					)
				),
				E("div", { className: "right-col" },
					E("h2", { className: "desktop" },
						E("span", null, "Alliance"),
						E("br"),
						E("b", null, this.state.name)
					)
				)
			);
		}

	}
