
	"use strict";
	
	const { ObjectId } = require("mongodb");

	module.exports = {
		types: {
			_id: 					ObjectId,
			info: 					Object,
			data: 					Object
		},
		aggregations: []
	};
