
	"use strict";

	const { BaseTask } 				= require("task/");
	const { ESIUtil } 				= require("util/");

	class AlliancesTask extends BaseTask {

		async start () {

			let client = await ESIUtil.get_client();

			let alliances_response = await client.Alliance.get_alliances();

			await Promise.all(alliances_response.obj.map(alliance_id => this.create("Alliance", { alliance_id })));

			await this.update({
				state: 0,
				timestamp: new Date(alliances_response.headers.expires).getTime()
			});

		}

	}