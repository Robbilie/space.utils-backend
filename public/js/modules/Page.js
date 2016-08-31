
	"use strict";

	class Page extends Module {

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