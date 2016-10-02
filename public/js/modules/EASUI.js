
	"use strict";

	class EASUI extends Module {

		constructor (parent, router) {
			super(parent);
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

		loadPage (page) {
			this.getPageController().loadPage(page);
		}

		render () {
			return $(["div", { className: "ui" }, [
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
