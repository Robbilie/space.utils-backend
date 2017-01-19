
	"use strict";

	class SideBar extends Component {

		render () {
			return E("div", { className: "sidebar" },
				E(ServerStatus),
				E(Link, { className: "homebtn closesb", to: "/" })
			);
		}

	}
