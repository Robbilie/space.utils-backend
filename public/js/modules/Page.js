
	"use strict";

	class Page extends Module {

		constructor (parent, title) {
			super(parent);
			this.title = title;

			this.isready = false;
			this.onready = [];

			this.isinserted = false;
			this.oninserted = [];
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

		onInserted () {
			return new Promise((resolve) => {
				this.oninserted.push(resolve);
				this.isInserted();
			});
		}

		isInserted () {
			if(!this.isinserted)
				return false;
			while (this.oninserted.length > 0)
				(this.oninserted.pop())();
		}

		inserted () {
			this.isinserted = true;
			this.isInserted();
		}

	}