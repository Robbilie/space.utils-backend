
	"use strict";

	const { DBUtil } 	= require("util/");
	const config 		= require("util/../../config/");

	class BaseHandler {

		static getStore () {
			if(this.name != "BaseHandler")
				return DBUtil.getStore(this.name.slice(0, -7));
		}

		static sanitize (data = {}) {
			return Object.entries(data).filter(([key, value]) => ["$where", "$regex", "lookup"].indexOf(key) === -1).reduce((p, [key, value]) => !(p[key] = value || true) || p, {})
		}

		static limit (data = {}) {
			return Object.assign(data, { limit: data.limit ? Math.min(data.limit, 250) : 250 })
		}
		
		static filter () {
			return async (req, res) => {
				let d = Date.now();
				console.log(req.body);
				let store 			= await this.getStore();
				console.log(Date.now() - d);
				let list 			= await store.find(
					this.sanitize(req.body.filter),
					this.limit(req.body.options)
				);
				console.log(Date.now() - d);
				res.json({ items: await Promise.all(list.map(listItem => listItem.toJSON())) });
				console.log(Date.now() - d);
			};
		}

		static getById () {
			return async (req, res) => {
				let store 		= await this.getStore();
				let type 		= await store.findOrCreate(req.swagger.params[this.name.slice(0, -7).toLowerCase() + "ID"].value);
				res.json(await type.toJSON());
			};
		}

		static getMethods () {
			return (Object.getPrototypeOf(this).name == "" ?
				[] : Object.getOwnPropertyNames(Object.getPrototypeOf(this)).slice(3)
			).concat(Object.getOwnPropertyNames(this).slice(3));
		}

	}

	module.exports = BaseHandler;
