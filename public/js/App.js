
	"use strict";

	class App extends Component {

		render () {
			return E("div", { className: "ui" },
				E(TopBar),
				E(SideBar),
				E("div", { className: "content" },
					this.props.children
				)
			);
		}

	}
