
	"use strict";

	const { PatchUtil, DBUtil } = require("util");

	class _Base {

		constructor (data) {
			this.future = (data.constructor.name == "Promise" ? data : Promise.resolve(data))
				.then(res =>
					res && res.constructor.name != "Object" && res.constructor.name != "Array" ?
						this.getStore().getById(res) :
						res
				);
		}

		getStore () {
			return DBUtil.getStore(this.constructor.name);
		}

		getFuture () {
			return this.future;
		}

		valueOf () {
			return this;
		}

		isNull () {
			return this.getFuture().then(data => !data);
		}

		get_id () {}

	}

	PatchUtil._model(_Base);

	module.exports = _Base;
