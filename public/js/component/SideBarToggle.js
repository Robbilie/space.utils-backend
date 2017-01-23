
	"use strict";

	class SideBarToggle extends Component {

		render () {
			return E("div", { id: "sidebarButton", onClick: this.props.handler },
				E("span", { className: "sidebarOpen" }, "≡"),
				E("span", { className: "sidebarClose" }, "×")
			);
		}

	}
