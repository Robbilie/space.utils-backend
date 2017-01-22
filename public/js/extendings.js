
	"use strict";

	if(!Object.entries)
		Object.defineProperty(Object.prototype, 'entries', {
			value: obj => Object.keys(obj).map(k => [k, obj[k]])
		});

	Object.defineProperty(String.prototype, 'capitalizeFirstLetter', {
		value: function () {
			return this
					.charAt(0)
					.toUpperCase() + this.slice(1);
		}
	});
