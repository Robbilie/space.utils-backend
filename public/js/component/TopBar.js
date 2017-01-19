
	"use strict";

	class TopBar extends Component {

		render () {
			return E("div", { className: "topbar" },
				E(SearchBar),
				E(Clock)
			);
		}

	}
