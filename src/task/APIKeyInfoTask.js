
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const DBUtil 					= require("util/DBUtil");
	const LoadUtil 					= require("util/LoadUtil");

	class APIKeyInfoTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("Account/APIKeyInfo", this.dataToForm());
			} catch (e) {
				console.log("XMLERROR");
				return await this.update({ state: 0 });
			}


			if(response && response.eveapi && response.eveapi.result) {

				try {

					let key = response.eveapi.result[0].key[0].$;

					let apikeyinfoStore = await DBUtil.getStore("APIKeyInfo");

					await apikeyinfoStore.update(
						{
							keyId: this.getData().keyID
						},
						{
							$set: {
								keyId: 			this.getData().keyID,
								vCode: 			this.getData().vCode,
								accessMask: 	key.accessMask - 0,
								type: 			key.type,
								expires: 		key.expires != "" ? new Date(key.expires + "Z").getTime() : null
							}
						},
						{ upsert: true, new: true }
					);

					// get all chars on that apikey
					let characters = response.eveapi.result[0].key[0].rowset[0].row;
					let charIDs = characters.map(m => m.$.characterID - 0);
					const characterStore = await DBUtil.getStore("Character");
					await Promise.all(charIDs.map(id => characterStore.getOrCreate(id)));

					// clear all tasks that are not associated with this account anymore
					let taskStore = await DBUtil.getStore("Task");
					charIDs.push(null);
					await taskStore.destroy({ "data.keyId": this.getData().keyID, "data.characterId": { $nin: charIDs } });
					charIDs.pop();

					// tasks that are no longer valid for the accessMask
					await taskStore.destroy({ "data.keyId": this.getData().keyID, "data.accessMask": { $bitsAllSet: key.accessMask - 0 } });

					// get tasks that are  within accessmask, get the total bitmask and get the missing ones
					let tasks = await taskStore.getAll({ "data.keyId": this.getData().keyId, "data.accessMask": { $bitsAnySet: key.accessMask - 0 } });
					let tasksMask = tasks.map(task => task.getData().accessMask).reduce((p, c) => p | c, 0);
					let missingTasks = XMLTask.getTasks().filter(task => task.type.indexOf(key.type) !== -1 && (tasksMask & task.accessMask) != task.accessMask);


					characters.forEach(char => {
						let character = char.$;
						missingTasks.forEach(task => {
							let taskClass = LoadUtil.task(task.name);

							taskClass.create(Object.assign({
								keyID: 	this.getData().keyID,
								vCode: 	this.getData().vCode,
								accessMask: task.accessMask
							}, key.type == "Corporation" ? {} : { characterID: character.characterID - 0 }));
						});
					});


				} catch (e) { console.log(e) }

				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				await this.update({ state: 0 });

			} else {
				await this.destroy();
			}

		}

	}

	module.exports = APIKeyInfoTask;