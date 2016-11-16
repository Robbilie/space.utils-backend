	
	"use strict";

	const path 						= require("path");

	class LoadUtil {

		static model (name) {
			return LoadUtil.file(`model/${name}`);
		}

		static task (name) {
			return LoadUtil.file(`task/${name}Task`);
		}

		static handler (name) {
			return LoadUtil.file(`handler/${name}Handler`);
		}

		static store (name = "") {
			return LoadUtil.file(`store/${name}Store`);
		}

		static app (name) {
			return LoadUtil.file(`app/${name}App`);
		}

		static file (name) {
			try {
				return require(name);
			} catch (e) {
				if(e.code != "MODULE_NOT_FOUND")
					console.log(e);
				return null;
			}
		}

		static reload (name) {
			return Object
				.keys(require.cache)
				.filter(key => key.indexOf(name) === 0)
				.map(key => delete require.cache[key]);
		}
	}

	module.exports = LoadUtil;
	