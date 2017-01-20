
	"use strict";

	class Clock extends Component {

		constructor (props) {
			super(props);
			this.state = {
				time: this.dateToStr(new Date())
			}
		}

		componentDidMount () {
			let d = new Date();
			this.setState({ time: this.dateToStr(d) });
			setTimeout(() =>
				this.updateTime() || (this.interval = setInterval(() => this.updateTime(), 1000 * 60)),
				(60 - d.getSeconds()) * 1000
			);
		}

		componentWillUnmount () {
			clearInterval(this.interval);
		}

		updateTime () {
			this.setState({ time: this.dateToStr(new Date()) });
		}

		dateToStr (d) {
			return (d.getUTCHours() < 10 ? "0" : "") + d.getUTCHours() + ":" + (d.getUTCMinutes() < 10 ? "0" : "") + d.getUTCMinutes();
		}

		render () {
			return E("div", { id: "clock" }, this.state.time);
		}

	}
