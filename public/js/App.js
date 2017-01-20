
	"use strict";

	class App extends Component {

		constructor (props) {
			super(props);
			this.state = {
				isSearching: false,
				isLoading: false,
				isOpen: false
			};
		}

		searchBarHandler (e) {
			switch (e.type) {
				case "blur":
					this.setState({ isSearching: false });
					break;
				case "keyup":
					if (e.target.value != "")
						this.setState({ isSearching: true });
					break;
			}
		}

		render () {
			return E("div", { className: `ui ${this.state.isSearching ? "searching" : ""}` },
				E(SideBar, { isOpen: this.state.isOpen }),
				E("div", { className: "content" },
					this.props.children
				),
				E(TopBar, { searchBarHandler: this.searchBarHandler }),
				E(Loading, { isLoading: this.state.isLoading })
			);
		}

	}
