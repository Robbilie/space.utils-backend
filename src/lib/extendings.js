
	"use strict";

	module.exports = function () {

		Object.defineProperty(Error.prototype, 'toJSON', {
			value: function () {
				const alt = {};

				Object.getOwnPropertyNames(this).forEach(function (key) {
					alt[key] = this[key];
				}, this);

				return alt;
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(Object.prototype, 'run', {
			value: function (cb) {
				return cb(this);
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(Promise.prototype, 'wait', {
			value: function (time) {
				return new Promise((a,d) => setTimeout(() => this.then(data => a(data)), time));
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(String.prototype, 'capitalizeFirstLetter', {
			value: function () {
				return this
					.charAt(0)
					.toUpperCase() + this.slice(1);
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(String.prototype, 'lowercaseFirstLetter', {
			value: function () {
				return this
					.charAt(0)
					.toLowerCase() + this.slice(1);
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(String.prototype, 'escapeName', {
			value: function () {
				return this
					.toLowerCase()
					.replace(new RegExp(" ", "g"), "_")
					.replace(new RegExp("'", "g"), ".");
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(String.prototype, 'pluralize', {
			value: function () {
				return this + (this.slice(-1) == "s" ? "" : "s");
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(String.prototype, 'singularize', {
			value: function () {
				return this.slice(-1) == "s" ? this.slice(0, -1) : this;
			},
			configurable: true,
			writable: true
		});

		const map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		Object.defineProperty(String.prototype, 'escapeHTML', {
			value: function () {
				return this.replace(/[&<>"']/g, m => map[m]);
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(Array.prototype, 'chunk', {
			value: function(chunkSize) {
				let R = [];
				for (let i = 0; i < this.length; i += chunkSize)
					R.push(this.slice(i, i + chunkSize));
				return R;
			}
		});

		global.$ = function (num, ...params) {
			params
				.reduce((p, c, i, a) => i % 2 ? p : p.concat([[Object.keys(c)[0], c[Object.keys(c)[0]], a[i + 1]]]), [])
				.forEach(v => {
					if(![v[1], typeof(v[1]), v[1] !== undefined && v[1] !== null ? v[1].constructor.name : ""].some(e => e === v[2]))
						throw TypeError(`Parameter '${v[0]}' is of type '${v[1] && v[1].constructor ? v[1].constructor.name : typeof(v[1])}' but should be of type '${v[2]}'`);
				});
			return {};
		};

	};
