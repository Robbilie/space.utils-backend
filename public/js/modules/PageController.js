
	"use strict";

	class PageController extends Module {

		constructor (parent) {
			super(parent);

			this.pageStack = [];
			this.pageStackContainer = $(["div", { className: "pages" }]);

			if(history.state == null)
				history.replaceState(0, "", location.href);

			this.currentPage = history.state;

			console.log("current page on load", this.currentPage);
		}

		getPageStackContainer () {
			return this.pageStackContainer;
		}

		getPageStack () {
			return this.pageStack;
		}

		loadPage (page, ...args) {

			const d = Date.now();
			this.getApp().setLoadingState(true);

			let instance = new page(this.getApp(), ...args);
			$("title").innerHTML = instance.getTitle();

			this.getPageStack()[history.state] = instance;

			instance.isReady().then(() => {
				let element = instance.render();
				element.classList.add("intransition");
				this.getPageStackContainer().prepend(element);
				setTimeout(() => element.classList.remove("intransition") || this.getApp().setLoadingState(false) || console.log(Date.now() - d), 10);
			});

		}

		back () {
			/*
			if(this.getPageStackContainer().children.length > 1) {
				this.getPageStackContainer().children[0].classList.add("intransition");
				setTimeout(() => this.getPageStackContainer().children[0].destroy(), 300);
			}

			$("title").innerHTML = this.getCurrentPage().getTitle();
			*/
		}

		forward () {
			/*
			let page = this.getCurrentPage();
			let element = page.render();
			element.classList.add("intransition");
			this.getPageStackContainer().prepend(element);
			setTimeout(() => element.classList.remove("intransition"), 100);
			$("title").innerHTML = page.getTitle();
			*/
		}

		getCurrentPage () {
			return this.getPageStack()[this.currentPage || 0];
		}

		render () {
			return this.getPageStackContainer();
		}

	}
