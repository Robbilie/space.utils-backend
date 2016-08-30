
	"use strict";

	const { ObjectId } = require("mongodb");

	module.exports = {
		types: {
			_id: 					ObjectId,
			name: 					String,
			secret: 				String,
			redirect: 				String,
			scope: 					Array,
			trusted: 				Boolean
		},
		aggregations: []
	};
