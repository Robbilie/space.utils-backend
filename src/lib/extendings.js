
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

	};
