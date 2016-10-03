
	"use strict";

	class NavigationController {

		constructor (app) {
			this.app = app;

			this.routeChange();

			window.on("popstate", e => {

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

		getApp () {
			return this.app;
		}

		back () {
			this.getApp().getPageController().back();
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
			//history.pushState(state, title, url);
			//this.routeChange();
		}

		routeChange () {
			this.getApp().getRouter()(location.pathname.replace(new RegExp("eas-kubes/public/"), ""), this.getApp());
		}

	}
