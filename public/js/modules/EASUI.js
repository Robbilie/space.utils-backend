
	"use strict";

	class EASUI extends Module {

		constructor (parent, router) {
			super(parent);

			this.loadingstate = $(["input", { type: "checkbox", id: "loadingState" }]);

			this.router 				= router;
			this.sideBar 				= new SideBar(this);
			this.topBar 				= new TopBar(this);
			this.pageController 		= new PageController(this);
			this.navigationController 	= new NavigationController(this);
		}

		getApp () {
			return this;
		}

		getSideBar () {
			return this.sideBar;
		}

		getTopBar () {
			return this.topBar;
		}

		getPageController () {
			return this.pageController;
		}

		getRouter () {
			return this.router;
		}

		getNavigationController () {
			return this.navigationController;
		}

		loadPage (page, ...args) {
			this.getPageController().loadPage(page, ...args);
		}

		getLoadingState () {
			return this.loadingstate;
		}

		setLoadingState (state) {
			return this.getLoadingState().checked = state;
		}

		render () {
			return $(["div", { className: "ui" }, [
				this.getLoadingState(),
				this.getTopBar().getSearchBar().getMaxer(),
				this.getSideBar().getToggle(),
				this.getSideBar().getButton(),
				this.getSideBar(),
				["div", { className: "content" }, [
					this.getPageController()
				]],
				this.getTopBar()
			]]);
		}

	}
