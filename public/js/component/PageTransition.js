
	"use strict";

	class PageTransition extends React.addons.CSSTransitionGroup {

		_customWrapChild (child) {
			console.log("hello wrap child");
			return React.createElement(
				ReactCSSTransitionGroupChild,
				{
					name: this.props.transitionName,
					appear: this.props.transitionAppear,
					enter: this.props.transitionEnter,
					leave: this.props.transitionLeave,
					appearTimeout: this.props.transitionAppearTimeout,
					enterTimeout: this.props.transitionEnterTimeout,
					leaveTimeout: this.props.transitionLeaveTimeout,
				},
				child
			);
		}

		render() {
			return E(
				React.addons.ReactTransitionGroup,
				Object.assign({}, this.props, { childFactory: this._customWrapChild })
			);
		}

	}
