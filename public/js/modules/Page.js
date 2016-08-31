
	"use strict";

	class Page extends Module {

		constructor (parent, title) {
			super(parent);
			this.title = title;
		}

		getTitle () {
			return this.title;
		}

		isReady () {
			return new Promise((resolve) => {
				if(this.onReady)
					resolve();
				else
					this.onReady = resolve;
			} )
		}

		ready () {
			if(this.onReady)
				this.onReady();
			else
				this.onReady = true;
		}

	}