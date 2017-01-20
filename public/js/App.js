
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

		render () {
			return E("div", { className: "ui" },
				E(SideBar, { isOpen: this.state.isOpen }),
				E("div", { className: "content" },
					this.props.children
				),
				E(TopBar, { isSearching: this.state.isSearching }),
				E(Loading, { isLoading: this.state.isLoading })
			);
		}

	}
