
	"use strict";

	class NavigationController {

		constructor (app) {
			this.app = app;

			this.routeChange();

			window.on("popstate", e => {
				let page = e.state;
				let currentPage = this.getApp().getPageController().currentPage;
				if(currentPage > page) {
					// back
					this.getApp().getPageController().back();
				} else if (currentPage < page) {
					// forward
					this.routeChange();
				}
				this.getApp().getPageController().currentPage = page || 0;
			});

			this.getApp().getParent().on("click", (e) => {
				let link = e.path.find(el => el.tagName == "A");
				if(link) {
					e.stopPropagation();
					e.preventDefault();
					this.getApp().getNavigationController().navigate(link.href);
				}
				return true;
			});

		}

		getApp () {
			return this.app;
		}

		back () {
			this.getApp().getPageController().back();
		}

		navigate (url, title) {
			let page = ++this.getApp().getPageController().currentPage;
			this.pushState(page, title || "", url);
		}

		pushState (state, title, url) {
			history.pushState(state, title, url);
			this.routeChange();
		}

		routeChange () {
			console.log("trigger");
			this.getApp().getRouter()(location.pathname.slice(7), this.getApp());
		}

	}
	