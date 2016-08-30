	
	"use strict";
	
	class Link extends Module {
	
		constructor (parent, options, children) {
			super(parent);
	
			this.link = $(["a", options, children]);
			this.link.on("click", (e) => {
				//e.stopPropagation();
				//e.preventDefault();
				//this.getApp().getNavigationController().navigate(this.link.href, this.constructor.name);
			});
	
		}
	
		getLink () {
			return this.link;
		}
	
		render () {
			return this.getLink();
		}
	
	}
	