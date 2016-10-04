
	"use strict";

	class Page extends Module {

		constructor (parent, title) {
			super(parent);
			this.title = title;
			this.isready = false;
			this.onready = [];
		}

		getTitle () {
			return this.title;
		}

		onReady () {
			return new Promise((resolve) => {
				this.onready.push(resolve);
				this.isReady();
			});
		}

		isReady () {
			if(!this.isready)
				return false;
			while (this.onready.length > 0)
				(this.onready.pop())();
		}

		ready () {
			this.isready = true;
			this.isReady();
		}

	}