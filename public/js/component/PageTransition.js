
	"use strict";

	class PageTransition extends React.addons.CSSTransitionGroup {

		constructor (props) {
			super(props);
			window.transition = this;

			this.childClass = this._wrapChild(null).type.prototype.constructor;
			const willAppear = this.childClass.prototype.componentWillAppear;
			this.childClass.prototype.componentWillAppear = (...args) => console.log("will appear") || willAppear(...args);
			const willEnter = this.childClass.prototype.componentWillEnter;
			this.childClass.prototype.componentWillEnter = (...args) => console.log("will enter") || willEnter(...args);
			const willLeave = this.childClass.prototype.componentWillLeave;
			this.childClass.prototype.componentWillLeave = (...args) => console.log("will leave") || willLeave(...args);

		}

		_customWrapChild (child) {
			// We need to provide this childFactory so that
			// ReactCSSTransitionGroupChild can receive updates to name, enter, and
			// leave while it is leaving.
			return React.createElement(
				this.childClass,
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
			return React.createElement(
				React.addons.TransitionGroup,
				Object.assign({}, this.props, { childFactory: this._customWrapChild.bind(this) })
			);
		}

	}
