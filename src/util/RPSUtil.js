
	"use strict";

	class RPSUtil {

		static monotonic_loop (cb, interval = 60 * 1000) {
			const local_storage = { last_ts: process.hrtime() };
			return setInterval(() => {
				let [s, ns] = process.hrtime(local_storage.last_ts);
				cb(s + (ns / 1e9));
				local_storage.last_ts = process.hrtime();
			}, interval);
		}

	}

	module.exports = RPSUtil;
