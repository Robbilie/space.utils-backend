
	"use strict";

	const helperStorage = {};

	class Helper {

		static typeToGraphic (typeID) {
			return Helper.getGraphicIDs().then(([typeids, graphicids]) => graphicids[typeids[typeID].graphicID].graphicFile);
		}

		static getGraphicIDs () {
			if(!helperStorage.graphicIDs) {
				let cgl = ccpwgl_int();
				helperStorage.graphicIDs = Promise.all([
					fetch(cgl.resMan.BuildUrl("res:/staticdata/typeids.json")).then(res => res.json()),
					fetch(cgl.resMan.BuildUrl("res:/staticdata/graphicids.json")).then(res => res.json())
				]);
			}
			return helperStorage.graphicIDs;
		}

		static createTransform (rotation, position, scale) {
			let transform = mat4.identity(mat4.create());
			mat4.translate(transform, position);
			mat4.rotate(transform, rotation[0] * ( Math.PI / 180 ), [1, 0, 0]);
			mat4.rotate(transform, rotation[1] * ( Math.PI / 180 ), [0, 1, 0]);
			mat4.rotate(transform, rotation[2] * ( Math.PI / 180 ), [0, 0, 1]);
			mat4.scale(transform, scale);
			return transform;
		}

	}
