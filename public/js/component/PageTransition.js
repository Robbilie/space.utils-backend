
	"use strict";

	class PageTransition extends React.addons.CSSTransitionGroup {

		constructor (props) {
			super(props);
			window.transition = this;
		}

	}
