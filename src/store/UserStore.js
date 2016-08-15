
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");

	class UserStore extends Store {

		aggregate (data) {
			return this.collection
				.aggregate([
					{
						$match: data
					},
					{
						$unwind: {
							path: "$characters",
							preserveNullAndEmptyArrays: true
						}
					},
					{
						$lookup: {
							from: "characters",
							localField: "characters",
							foreignField: "_id",
							as: "characters"
						}
					},
					{
						$unwind: "$characters"
					},
					{
						$group: {
							_id: "$_id",
							name: "$name",
							password: "$password",
							characters: { $push: "$characters" }
						}
					}
				]);
		}

		getByName () {}

	}

	PatchUtil.store(UserStore, ["aggregate"]);

	module.exports = UserStore;