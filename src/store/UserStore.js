
	"use strict";

	const PatchUtil 				= require("util/PatchUtil");
	const Store 					= require("store/Store");
	const Character 				= require("model/Character");

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
						$unwind: {
							path: "$characters",
							preserveNullAndEmptyArrays: true
						}
					},
					{
						$group: {
							_id: "$_id",
							name: { $first: "$name" },
							password: { $first: "$password" },
							characters: { $push: "$characters" }
						}
					}
				])
				.toArray()
				.then(docs => docs
					.map(doc => Object
						.assign(
							doc,
							{ characters: doc.characters.map(character => new Character(character)) }
						)
					)
				)
				.then(docs => docs.map(doc => new this.type(doc)));
		}

		getBy_id () {}

		getByName () {}

	}

	PatchUtil.store(UserStore, ["aggregate"]);

	module.exports = UserStore;