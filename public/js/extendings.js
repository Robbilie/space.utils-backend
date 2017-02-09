
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

	const debounce = function debounce (func, wait, immediate) {
		const local_storage = { timeout: undefined };
		return function (...args) {
			const context = this;
			let later = function () {
				local_storage.timeout = null;
				if (!immediate) func.apply(context, args);
			};
			let callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};
