
	"use strict";

	class Page extends Component {

		constructor (props) {
			super(props);
		}

		componentWillMount () {
			this.props.setLoading(false);
		}

		setLoading (isLoading) {
			return this.props.setLoading(isLoading);
		}

	}
