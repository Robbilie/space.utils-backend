
	"use strict";

	class Page extends Component {

		constructor (props) {
			super(props);
			this.done = () => {};
		}

		componentWillAppear (cb) {
			this.done = cb;
		}

		componentWillEnter (cb) {
			this.done = cb;
		}

	}
