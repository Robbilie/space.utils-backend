
	"use strict";

	class PageController extends Module {

		constructor (parent) {
			super(parent);
			this.pageStack = [];
			this.pageStackContainer = $(["div", { className: "pages" }]);
			this.currentPage = 0;
			this.maxPage = 0;
		}

		getPageStackContainer () {
			return this.pageStackContainer;
		}

		getPageStack () {
			return this.pageStack;
		}

		loadPage (page, args = {}) {
			let instance = new page(this.getApp(), args);
			this.getPageStack().push(instance);
			let element = instance.render();
			element.classList.add("intransition");
			this.getPageStackContainer().prepend(element);
			setTimeout(() => element.classList.remove("intransition"), 100);
		}

		back () {
			if(this.getPageStackContainer().children.length > 1)
				this.getPageStackContainer().children[0].destroy();
		}

		render () {
			return this.getPageStackContainer();
		}

	}
