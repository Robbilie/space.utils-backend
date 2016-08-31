
	"use strict";

	class PageController extends Module {

		constructor (parent) {
			super(parent);
			this.pageStack = [];
			this.pageStackContainer = $(["div", { className: "pages" }]);
			this.currentPage = 0;
		}

		getPageStackContainer () {
			return this.pageStackContainer;
		}

		getPageStack () {
			return this.pageStack;
		}

		loadPage (page, args = {}) {
			let instance = new page(this.getApp(), args);
			$("title").innerHTML = instance.getTitle();
			this.pageStack = this.getPageStack().filter((e, i) => i <= this.currentPage);
			this.getPageStack().push(instance);
			instance.isReady().then(() => {
				let element = instance.render();
				element.classList.add("intransition");
				this.getPageStackContainer().prepend(element);
				setTimeout(() => element.classList.remove("intransition"), 100);
			});
		}

		back () {
			if(this.getPageStackContainer().children.length > 1)
				this.getPageStackContainer().children[0].destroy();
			$("title").innerHTML = this.getCurrentPage().getTitle();
		}

		forward () {
			let page = this.getCurrentPage();
			this.getPageStackContainer().prepend(page.render());
			$("title").innerHTML = page.getTitle();
		}

		getCurrentPage () {
			return this.getPageStack()[this.currentPage];
		}

		render () {
			return this.getPageStackContainer();
		}

	}
