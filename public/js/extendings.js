
	"use strict";

	Object.defineProperty(HTMLElement.prototype, 'append', {
		value: HTMLElement.prototype.appendChild
	});

	Object.defineProperty(HTMLElement.prototype, 'prepend', {
		value: function (el) {
			return this.children[0] ? this.insertBefore(el, this.children[0]) : this.append(el);
		}
	});

	Object.defineProperty(HTMLElement.prototype, 'before', {
		value: function (el) {
			return this.parentNode ? this.parentNode.insertBefore(el, this) : undefined;
		}
	});

	Object.defineProperty(HTMLElement.prototype, 'destroy', {
		value: function () {
			return this.parentNode.removeChild(this);
		}
	});

	Object.defineProperty(HTMLElement.prototype, 'on', {
		value: HTMLElement.prototype.addEventListener
	});

	Object.defineProperty(Window.prototype, 'on', {
		value: Window.prototype.addEventListener
	});

	Object.defineProperty(Object.prototype, 'entries', {
		value: function (obj) {
			return Object.keys(obj).map(k => [k, obj[k]]);
		}
	});

	window.$ = function (arg1, ...remains) {
		switch (arg1.constructor.name) {
			case "String":
				let elements = (remains[0] || document).querySelectorAll(arg1);
				return elements.length == 1 ? elements[0] : elements;
			case "Number":
				remains
					.reduce((p, c, i, a) => i % 2 ? p : p.concat([[Object.keys(c)[0], c[Object.keys(c)[0]], a[i + 1]]]), [])
					.forEach(v => {
						if(![v[1], typeof(v[1]), v[1] ? v[1].constructor.name : ""].some(e => e == v[2]))
							throw TypeError(`Parameter '${v[0]}' is of type '${v[1] && v[1].constructor ? v[1].constructor.name : typeof(v[1])}' but should be of type '${v[2]}'`);
					});
				return {};
			case "Array":
				let element 		= arg1[0] && arg1[0].constructor.name == "String" ? document.createElement(arg1[0]) : arg1[0];
				let properties 		= arg1[1] && arg1[1].constructor.name == "Object" ? arg1[1] : {};
				let children 		= arg1[1] && arg1[1].constructor.name == "Object" ? arg1[2] : arg1[1];
				children 			= children ? children : [];

				assignProperties(element, properties);

				children.map(e => e.constructor.name != "Array" ? (e instanceof Module ? e.render() : e) : $(e)).forEach(e => element.appendChild(e));

				return element;
		}
	};

	window.json = function (method, url, body) {
		return fetch(url, Object.assign({
			method,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		}, !body ? {} : { body: JSON.stringify(body) })).then(res => res.json());
	};

	function assignProperties (el, dat) {
		Object.entries(dat).forEach(([k, v]) => k != "dataset" && k != "style" ? el[k] = v : null);
		if(dat.style && dat.style.constructor.name != "String")
			Object.entries(dat.style).forEach(([k, v]) => el.style.setProperty(k, v));
		else if(dat.style && dat.style.constructor.name == "String")
			el.style = dat.style;
		if(dat.dataset)
			Object.entries(dat.dataset).forEach(([k, v]) => el.dataset[k] = v);
	}
