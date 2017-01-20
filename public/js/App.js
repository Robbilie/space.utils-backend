
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

		componentDidUpdate () {
			this.setState({ isOpen: false });
		}

		searchBarHandler (e) {
			switch (e.type) {
				case "blur":
					this.setState({ isSearching: false });
					break;
				case "keyup":
				case "focus":
					if (e.target.value != "")
						this.setState({ isSearching: true });
					break;
			}
		}

		sideBarToggleHandler () {
			this.setState({ isOpen: !this.state.isOpen });
		}

		render () {
			return E("div", { className: `ui ${this.state.isSearching ? "searching" : ""} ${this.state.isLoading ? "loading" : ""} ${this.state.isOpen ? "open" : "close"}` },
				E(SideBarToggle, { sideBarToggleHandler: this.sideBarToggleHandler.bind(this) }),
				E(SideBar, { isOpen: this.state.isOpen }),
				E("div", { className: "content" },
					E("div", { className: "pages" },
						this.props.children
					)
				),
				E(TopBar, { searchBarHandler: this.searchBarHandler.bind(this) }),
				E(Loading, { isLoading: this.state.isLoading })
			);
		}

	}
