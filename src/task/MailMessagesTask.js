
	"use strict";

	const XMLTask 					= require("task/XMLTask");
	const DBUtil 					= require("util/DBUtil");

	class MailMessagesTask extends XMLTask {

		async start () {

			let response;
			try {
				response = await this.getXML("Char/MailMessages", this.dataToForm());
			} catch (e) {
				console.log("XMLERROR");
				return await this.update({ state: 0 });
			}


			if(response && response.eveapi && response.eveapi.result) {

				try {

					let mailheads = response.eveapi.result[0].rowset[0].row;

					let mailStore = await DBUtil.getStore("Mail");

					await Promise.all(mailheads
						.map(mailhead => ({
							messageId: 			mailhead.messageId - 0,
							senderId: 			mailhead.senderId - 0,
							senderName: 		mailhead.senderName,
							senderTypeId: 		mailhead.senderTypeID - 0,
							sentDate: 			new Date(mailhead.sentDate + "Z").getTime(),
							title: 				mailhead.title,
							toCorpOrAllianceId: mailhead.toCorpOrAllianceID ? mailhead.toCorpOrAllianceID : null,
							toListId: 			mailhead.toListID ? mailhead.toListID : null,
							toCharacterIds: 	mailhead.toCharacterIDs === "" ? [] : mailhead.toCharacterIDs.split(",").map(toInt)
						}))
						.map(msg => mailStore.update({ messageId: msg.messageId }, { $set: msg, $setOnInsert: { read: [] } }, { upsert: true }))
					);

				} catch (e) { console.log(e) }

				await this.update({ state: 2, timestamp: new Date(response.eveapi.cachedUntil[0] + "Z").getTime() });
				await this.update({ state: 0 });

			} else {
				await this.destroy();
			}

		}

	}

	module.exports = MailMessagesTask;