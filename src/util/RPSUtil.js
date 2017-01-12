
	"use strict";

	class RPSUtil {

		static monotonic_loop (cb, interval = 60000) {
			const storage = { last_ts: process.hrtime() };
			return setInterval(() => {
				let { difference, new_ts } = RPSUtil.monotonic_diff(storage.last_ts);
				cb(difference);
				storage.last_ts = new_ts;
			}, interval);
		}

		static monotonic_diff (old_ts, new_ts = process.hrtime()) {
			return {
				new_ts,
				difference: (new_ts[0] - old_ts[0]) + (new_ts[1] > old_ts[1] ? 0 : 1) + ((new_ts[1] - old_ts[1] + 1000000000) / 1000000000 % 1)
			}
		}

	}

	module.exports = RPSUtil;
