
	"use strict";

	class NavigationController {

		constructor (app) {
			this.app = app;
			
			/*
			this.linkClicked = false;

			if(location.hash.slice(2) === "") {
				location.hash = "#!/";
				this.linkClicked = true;
			} else {
				this.routeChange();
			}
			
			document.body.on("click", (e) => {
				if(e.path.some(el => el.tagName == "A"))
					this.linkClicked = true;
			});
			window.on("hashchange", () => {
				if(this.linkClicked)
					this.routeChange();
				else
					this.back();
				this.linkClicked = false;
			});
			*/
			
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