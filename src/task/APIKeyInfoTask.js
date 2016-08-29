
	"use strict";

	const { XMLTask } 				= require("task/");
	const { DBUtil, LoadUtil } 		= require("util/");

	class APIKeyInfoTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("Account/APIKeyInfo", await this.dataToForm());
			} catch (e) {
				console.log("XMLERROR");
				return await this.update({ state: 0 });
			}


			if(response && response.eveapi && response.eveapi.result) {

				try {

					let key = response.eveapi.result[0].key[0].$;

					let apikeyinfoStore = await DBUtil.getStore("APIKeyInfo");
					const characterStore = await DBUtil.getStore("Character");

					// get all chars on that apikey
					let characters 	= response.eveapi.result[0].key[0].rowset[0].row;
					let charIDs 	= characters.map(m => m.$.characterID - 0);
					let chars 		= await Promise.all(charIDs.map(id => characterStore.findOrCreate(id)));

					await apikeyinfoStore.update(
						{
							keyID: (await this.getData()).keyID
						},
						{
							$set: {
								keyID: 			(await this.getData()).keyID,
								vCode: 			(await this.getData()).vCode,
								accessMask: 	key.accessMask - 0,
								type: 			key.type,
								expires: 		key.expires != "" ? new Date(key.expires + "Z").getTime() : null,
								characters: 	await Promise.all(chars.map(char => char.getId()))
							}
						},
						{ upsert: true, new: true }
					);

					// clear all tasks that are not associated with this account anymore
					let taskStore = await DBUtil.getStore("Task");
					charIDs.push(null);
					await taskStore.destroy({ "data.keyID": (await this.getData()).keyID, "data.characterID": { $nin: charIDs } });
					charIDs.pop();

					// tasks that are no longer valid for the accessMask
					await taskStore.destroy({ "data.keyID": (await this.getData()).keyID, "data.accessMask": { $bitsAllClear: key.accessMask - 0 } });

					// get tasks that are  within accessmask, get the total bitmask and get the missing ones
					let tasks 			= await taskStore.find({ "data.keyID": (await this.getData()).keyID, "data.accessMask": { $bitsAnySet: key.accessMask - 0 } });
					let tasksMask 		= (await Promise.all(tasks.map(async (task) => (await task.getData()).accessMask))).reduce((p, c) => p | c, 0);
					let missingTasks 	= XMLTask.getTasks()
						.filter(task =>
							task.type.indexOf(key.type) !== -1 && 							// only use those of correct type
							(tasksMask & task.accessMask) != task.accessMask && 			// only use those who are not in the db yet
							(key.accessMask - 0 & task.accessMask) == task.accessMask		// only use those who are in the keys mask
						);


					characters.forEach(char => {
						let character = char.$;
						missingTasks.forEach(async (task) => {
							let taskClass = LoadUtil.task(task.name);

							taskClass.create(Object.assign({
								keyID: 	(await this.getData()).keyID,
								vCode: 	(await this.getData()).vCode,
								accessMask: task.accessMask
							}, key.type == "Corporation" ? {} : { characterID: character.characterID - 0 }));
						});
					});


				} catch (e) { console.log(e); }

				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				await this.update({ state: 0 });

			} else {
				console.log("APIKEYINFO", this.dataToForm(), JSON.stringify(response, null, 2));
				console.log("Retrying…");
				await this.update({ state: 0 });
			}

		}

	}

	module.exports = APIKeyInfoTask;
