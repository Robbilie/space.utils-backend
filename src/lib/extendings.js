
	"use strict";

	module.exports = function () {

		Object.defineProperty(Error.prototype, 'toJSON', {
			value: function () {
				var alt = {};

				Object.getOwnPropertyNames(this).forEach(function (key) {
					alt[key] = this[key];
				}, this);

				return alt;
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(Array.prototype, 'apply', {
			value: function (cb) {
				return cb(this);
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(Promise.prototype, 'wait', {
			value: function (time) {
				return new Promise(
					(a,d) => 
						setTimeout(
							() => 
								this.then(
									data => 
										a(data)
								), 
								time
						)
				);
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

		Object.defineProperty(String.prototype, 'escapeHTML', {
			value: function () {
				const map = {
					'&': '&amp;',
					'<': '&lt;',
					'>': '&gt;',
					'"': '&quot;',
					"'": '&#039;'
				};

				return this.replace(/[&<>"']/g, m => map[m]);
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(Array.prototype, 'chunk', {
			value: function(chunkSize) {
				var R = [];
				for (var i=0; i<this.length; i+=chunkSize)
					R.push(this.slice(i,i+chunkSize));
				return R;
			}
		});

		Object.defineProperty(Object.prototype, 'entries', {
			value: function (obj) {
				return Object.keys(obj).map(k => [k, obj[k]]);
			},
			configurable: true,
			writable: true
		});

		Object.defineProperty(require("mongodb").ObjectID.prototype, 'toJSON', {
			value: function () {
				return undefined;
			},
			configurable: true,
			writable: true
		});

		global.$ = function (num, ...params) {
			params
				.reduce((p, c, i, a) => i % 2 ? p : p.concat([[Object.keys(c)[0], c[Object.keys(c)[0]], a[i + 1]]]), [])
				.forEach(v => {
					if(![v[1], typeof(v[1]), v[1] ? v[1].constructor.name : ""].some(e => e == v[2]))
						throw TypeError(`Parameter '${v[0]}' is of type '${v[1] && v[1].constructor ? v[1].constructor.name : typeof(v[1])}' but should be of type '${v[2]}'`);
				});
			return {};
		};

	};