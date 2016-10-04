
	"use strict";

	const helperStorage = {

	};

	class Helper {

		static typeToGraphic (typeID) {
			return Helper.getGraphicIDs().then(data => data[typeID]);
		}

		static getGraphicIDs () {
			if(!helperStorage.graphicIDs)
				helperStorage.graphicIDs = fetch(ccpwgl_int().resMan.BuildUrl("res:/staticdata/graphicids.json")).then(res => res.json());
			return helperStorage.graphicIDs;
		}

	}
