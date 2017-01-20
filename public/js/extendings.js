
	"use strict";

	if(!Object.entries)
		Object.defineProperty(Object.prototype, 'entries', {
			value: obj => Object.keys(obj).map(k => [k, obj[k]])
		});
