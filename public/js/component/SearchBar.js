
	"use strict";

	class SearchBar extends Component {

		render () {
			return E("div", { className: "searchbar" },
				E("div", { className: "sbexpand" },
					E("input", {
						type: "text",
						onBlur: this.props.searchBarHandler,
						onKeyUp: this.props.searchBarHandler,
						onFocus: this.props.searchBarHandler
					})
				)
			);
		}

	}
