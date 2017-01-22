
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
				.then(client => client.alliances.AllianceHandler_get_by_id({ alliance_id: this.props.id }))
				.then(({ obj }) => this.setState(obj));
		}

		render () {
			return E("div", { className: "page" },
				E("div", { className: "left-col" },
					E("img", { src: `https://imageserver.eveonline.com/Alliance/${this.state.id}_128.png` }),
					E("div", {},
						E("div", { className: "row" }, "Ticker", this.state.ticker),
						E("div", { className: "row" }, "Executor", this.state.executor_corporation.name)
					)
				),
				E("div", { className: "right-col" },
					E("h2", {}, "Alliance", this.state.name)
				)
			);
		}

	}
