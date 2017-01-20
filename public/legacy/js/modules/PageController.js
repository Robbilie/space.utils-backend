
	"use strict";

	class PageController extends Module {

		constructor (parent) {
			super(parent);

			this.title = $("title");
			this.pageStack = [];
			this.pageStackContainer = $(["div", { className: "pages" }]);

			let observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					console.log(mutation);
					if(mutation.type == "childList") {
						Array.from(mutation.addedNodes).forEach(node => console.log(node.classList) || node.page.inserted());
					}
				});
			});
			observer.observe(this.pageStackContainer, { attributes: true, childList: true, characterData: true });

			if(history.state == null)
				history.replaceState(0, "", location.href);

			console.log("current page on load", history.state);
		}

		getPageStackContainer () {
			return this.pageStackContainer;
		}

		getPageStack () {
			return this.pageStack;
		}

		loadPage (page, ...args) {

			const d = Date.now();

			let instance = new page(this.getApp(), ...args);
			this.title.innerHTML = instance.getTitle();

			this.getPageStack()[history.state] = instance;

			const element = instance.render();
				element.page = instance;
				element.classList.add("intransition");

			this.getPageStackContainer().prepend(element);

			instance
				.onReady()
				.then(() => instance
					.onInserted()
					.wait(10)
					.then(() => element.classList.remove("intransition") || this.getApp().setLoadingState(false) || console.log(Date.now() - d))
				);

		}

		back () {
			if(this.getPageStackContainer().children.length > 1) {
				this.getPageStackContainer().children[0].classList.add("intransition");
				setTimeout(() => this.getPageStackContainer().children[0].destroy(), 300);
			}

			this.title.innerHTML = this.getCurrentPage().getTitle();

		}

		forward () {
			let page = this.getCurrentPage();
			let element = page.render();
			element.page = page;
			element.classList.add("intransition");
			this.getPageStackContainer().prepend(element);
			setTimeout(() => element.classList.remove("intransition"), 100);
			this.title.innerHTML = page.getTitle();
		}

		getCurrentPage () {
			return this.getPageStack()[history.state];
		}

		render () {
			return this.getPageStackContainer();
		}

	}