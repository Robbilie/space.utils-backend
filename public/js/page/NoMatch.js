
	"use strict";

	class NoMatch extends Component {

		render () {
			return E("div", { className: "page" },
				E("h1", null, "404 - not found")
			);
		}

	}
