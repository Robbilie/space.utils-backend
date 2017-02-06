
	"use strict";

	class PageTransition extends React.addons.CSSTransitionGroup {

		constructor (props) {
			super(props);
			window.transition = this;

			class PageTransitionChild extends this._wrapChild(null).type.prototype.constructor {

				constructor (...args) {
					super(...args);

					const _componentWillAppear = this.componentWillAppear;
					this.componentWillAppear = function (...args) {
						_componentWillAppear(...(console.log("will appear") || args));
					};

					const _componentWillEnter = this.componentWillEnter;
					this.componentWillEnter = function (...args) {
						_componentWillEnter(...(console.log("will enter") || args));
					};

					const _componentWillLeave = this.componentWillLeave;
					this.componentWillLeave = function (...args) {
						_componentWillLeave(...(console.log("will leave") || args));
					};

				}

				componentWillAppear (...args) {
					super.componentWillAppear(...(console.log("will appear") || args));
				}

				componentWillEnter (...args) {
					super.componentWillEnter(...(console.log("will enter") || args));
				}

				componentWillLeave (...args) {
					super.componentWillLeave(...(console.log("will leave") || args));
				}
			}

			this.childClass = PageTransitionChild;

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
