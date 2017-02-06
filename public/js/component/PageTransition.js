
	"use strict";

	class PageTransition extends React.addons.CSSTransitionGroup {

		constructor (props) {
			super(props);
			window.transition = this;

			let test_child = this._wrapChild(null);
			const willAppear = test_child.type.prototype.componentWillAppear;
			test_child.type.prototype.componentWillAppear = (...args) => console.log("will appear") || willAppear(...args);
			const willEnter = test_child.type.prototype.componentWillEnter;
			test_child.type.prototype.componentWillEnter = (...args) => console.log("will enter") || willEnter(...args);
			const willLeave = test_child.type.prototype.componentWillLeave;
			test_child.type.prototype.componentWillLeave = (...args) => console.log("will leave") || willLeave(...args);

		}

	}
