
	"use strict";

	class NavigationController {

		constructor (app) {
			this.app = app;

			this.state = history.state;

			this.routeChange();

			window.on("popstate", e => {

				let oldState = this.getState();
				let newState = e.state;

				if(!this.getPageController().getCurrentPage())
					this.routeChange();

				if(newState > oldState) {
					this.forward();
				} else {
					this.back();
				}

				/*
				let page = e.state;

				let currentPage = this.getApp().getPageController().currentPage;

				this.getApp().getPageController().currentPage = page || 0;

				if(!this.getApp().getPageController().getCurrentPage()) {
					console.log("missing history entry", page, "formerly", currentPage);
					this.navigate(location.href.split(location.hostname)[1], "", currentPage > page ? "back" : "forward");
				} else if (currentPage > page) {
					// back
					this.getApp().getPageController().back();
				} else if (currentPage < page) {
					// forward
					this.getApp().getPageController().forward();
				}

				*/

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

			/*if(direction == "forward") {
				let page = direction == "forward" ? ++this.getApp().getPageController().currentPage : --this.getApp().getPageController().currentPage;
				this.pushState(page, title || "", url);
			} else {
				this.routeChange();
			}
			*/
		}

		pushState (state, title, url) {
			this.state = state;
			history.pushState(state, title, url);
		}

		routeChange () {
			this.getApp().getRouter()(location.pathname.replace(new RegExp("eas-kubes/public/"), ""), this.getApp());
		}

	}
