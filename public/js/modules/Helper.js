
	"use strict";

	const helperStorage = {

	};

	class Helper {

		static typeToGraphic (typeID) {
			return Helper.getGraphicIDs().then(data => data[typeID]);
		}

		static getGraphicIDs () {
			if(!helperStorage.graphicIDs)
				helperStorage.graphicIDs = json(ccpwgl_int().resMan.BuildUrl("res:/staticdata/graphicids.json"));
			return helperStorage.graphicIDs;
		}

	}
