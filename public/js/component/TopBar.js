
	"use strict";

	class TopBar extends Component {

		render () {
			return E("div", { className: "topbar" },
				E(SearchBar, { searchBarHandler: this.props.searchBarHandler }),
				E(Clock)
			);
		}

	}
