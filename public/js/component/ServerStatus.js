
	"use strict";

	class ServerStatus extends Component {

		constructor (props) {
			super(props);
			this.state = {
				status: true,
				online: 0
			};
		}

		componentDidMount () {
			this.updateUserCounter();
		}

		componentWillUnmount () {
			clearTimeout(this.timeout);
		}

		updateUserCounter () {
			let x = new XMLHttpRequest();
			x.onload = e => {
				try {
					let status = e.target.responseXML.getElementsByTagName("serverOpen")[0].innerHTML == "True";
					let online = e.target.responseXML.getElementsByTagName("onlinePlayers")[0].innerHTML - 0;
					let current = new Date(e.target.responseXML.getElementsByTagName("currentTime")[0].innerHTML + " GMT").getTime();
					let cached = new Date(e.target.responseXML.getElementsByTagName("cachedUntil")[0].innerHTML + " GMT").getTime();

					this.setState({
						status,
						online
					});

					this.timeout = setTimeout(() => this.updateUserCounter(), cached - current);
				} catch (e) {
					console.log("Server Status:", e);
					setTimeout(() => this.updateUserCounter(), 1000);
				}
			};
			x.onerror = e => setTimeout(() => this.updateUserCounter(), 1000);
			x.open("GET", "https://api.eveonline.com/Server/ServerStatus.xml.aspx");
			x.send();
		}

		render () {
			return E("div", { className: `usercount ${this.state.status ? "online" : ""}` }, E("span", null, "TQ"), " ", this.state.online.toLocaleString());
		}

	}
