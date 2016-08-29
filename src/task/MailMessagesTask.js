
	"use strict";

	const { XMLTask } 				= require("task");
	const { DBUtil } 				= require("util");

	class MailMessagesTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("Char/MailMessages", await this.dataToForm());
			} catch (e) {
				console.log("XMLERROR");
				return await this.update({ state: 0 });
			}

			if(response && response.eveapi && response.eveapi.result) {

				try {

					let mailheads = response.eveapi.result[0].rowset[0].row;

					let mailStore = await DBUtil.getStore("Mail");

					const toInt = i => i - 0;

					await Promise.all(mailheads
						.map(mailhead => ({
							messageID: 			mailhead.$.messageID - 0,
							senderID: 			mailhead.$.senderID - 0,
							senderName: 		mailhead.$.senderName,
							senderTypeID: 		mailhead.$.senderTypeID - 0,
							sentDate: 			new Date(mailhead.$.sentDate + "Z").getTime(),
							title: 				mailhead.$.title,
							toCorpOrAllianceID: mailhead.$.toCorpOrAllianceID ? mailhead.$.toCorpOrAllianceID : null,
							toListID: 			mailhead.$.toListID ? mailhead.$.toListID : null,
							toCharacterIDs: 	mailhead.$.toCharacterIDs === "" ? [] : mailhead.$.toCharacterIDs.split(",").map(toInt)
						}))
						.map(msg => mailStore.update({ messageID: msg.messageID }, { $set: msg, $setOnInsert: { read: [] } }, { upsert: true }))
					);

				} catch (e) { console.log(e) }

				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				await this.update({ state: 0 });

			} else {
				console.log(this.dataToForm(), JSON.stringify(response, null, 2));
				await this.destroy();
			}

		}

	}

	module.exports = MailMessagesTask;