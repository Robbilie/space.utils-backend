
	"use strict";

	class NavigationController {

		constructor (app) {
			this.app = app;

			this.state = history.state;

			this.routeChange();

			window.on("popstate", e => {

				let newState = e.state;
				let oldState = this.getState();

				this.state = e.state;

				if(!this.getPageController().getCurrentPage()) {
					this.routeChange();
				} else {
					if(newState > oldState) {
						this.forward();
					} else {
						this.back();
					}
				}

			});

			this.getApp().getParent().on("click", (e) => {
				let link = e.path ? e.path.find(el => el.tagName == "A") : (e.target.tagName == "A" ? e.target : undefined);
				if(!e.button && !e.ctrlKey && link && link.getAttribute("href").split("://").length == 1) {
					e.stopPropagation();
					e.preventDefault();

					this.navigate(link.href);

				}
				return true;
			});

		}

		getState () {
			return this.state;
		}

		getApp () {
			return this.app;
		}

		back () {
			return this.getPageController().back();
		}

		forward () {
			return this.getPageController().forward();
		}

		getPageController () {
			return this.getApp().getPageController();
		}

		navigate (url, title) {
			this.pushState(history.state + 1, title || "", url);
			this.routeChange();
		}

		pushState (state, title, url) {
			this.state = state;
			history.pushState(state, title, url);
		}

		routeChange () {
			this.getApp().getRouter()(location.pathname.replace(new RegExp("eas-kubes/public/"), ""), this.getApp());
		}

	}
