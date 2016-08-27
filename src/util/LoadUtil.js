	
	"use strict";

	const path 						= require("path");

	class LoadUtil {

		static model (name) {
			return LoadUtil.file(`model/${name}`);
		}

		static task (name) {
			return LoadUtil.file(`task/${name}`);
		}

		static scheme (name) {
			return LoadUtil.file(`scheme/${name}Scheme`);
		}

		static handler (name) {
			return LoadUtil.file(`handler/${name}Handler`);
		}

		static store (name) {
			return LoadUtil.file(`store/${name}Store`);
		}

		static app (name) {
			return LoadUtil.file(`app/${name}App`);
		}

		static file (name) {
			try {
				return require(name);
			} catch (e) {
				//if(e.constructor.name == "SyntaxError")
				if(e.code != "MODULE_NOT_FOUND")
					console.log(e);
				return null;
			}
		}

		static reloadClass (className) {
			return LoadUtil.reload(require.resolve(className));
		}

		static reloadFolder (folderName) {
			return LoadUtil.reload(path.dirname(require.resolve(folderName || "")));
		}

		static reloadAll () {
			return LoadUtil.reloadFolder();
		}

		static reload (name) {
			return Object
				.keys(require.cache)
				.filter(key => key.indexOf(name) === 0)
				.map(key => delete require.cache[key]);
		}
	}

	module.exports = LoadUtil;