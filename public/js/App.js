
	"use strict";

	class App extends Component {

		constructor (props) {
			super(props);
			this.state = {
				isSearching: false,
				isLoading: false,
				isOpen: false,
				query: "",
				prev_click: false
			};
			if (this.props.location.pathname.indexOf("/search/") + 1 && this.props.location.pathname != "/search/") {
				this.state.isSearching = true;
				this.state.query = decodeURI(this.props.location.pathname.slice(8, -1));
			}
			console.log("App", this);
		}

		componentDidMount () {
			this.background = particleground(document.getElementById('particles-background'), {
				dotColor: 'rgba(255, 255, 255, 0.5)',
				lineColor: 'rgba(255, 255, 255, 0.05)',
				minSpeedX: 0.075,
				maxSpeedX: 0.15,
				minSpeedY: 0.075,
				maxSpeedY: 0.15,
				density: 30000, // One particle every n pixels
				curvedLines: false,
				proximity: 20, // How close two dots need to be before they join
				parallaxMultiplier: 20, // Lower the number is more extreme parallax
				particleRadius: 2, // Dot size
				parallax: false,
			});
			this.background.pause();
			this.foreground = particleground(document.getElementById('particles-foreground'), {
				dotColor: 'rgba(255, 255, 255, 1)',
				lineColor: 'rgba(255, 255, 255, 0.05)',
				minSpeedX: 0.3,
				maxSpeedX: 0.6,
				minSpeedY: 0.3,
				maxSpeedY: 0.6,
				density: 50000, // One particle every n pixels
				curvedLines: false,
				proximity: 250, // How close two dots need to be before they join
				parallaxMultiplier: 10, // Lower the number is more extreme parallax
				particleRadius: 4, // Dot size
				parallax: false,
			});
			this.foreground.pause();
			window.addEventListener("resize", this.resizeHandler.bind(this));
		}

		resizeHandler (e) {
			if(this.background) {
				this.background.start();
				this.background.pause();
			}
			if(this.foreground) {
				this.foreground.start();
				this.foreground.pause();
			}
		}

		searchBarHandler (name, value) {
			console.log(name, value, this.search_timeout);
			switch (name) {
				case "click":
					let prev = this.state.prev_click;
					this.setState({ prev_click: value });
					if (prev)
						return;
					if (this.search_timeout) {
						if (value)
							clearTimeout(this.search_timeout);
					} else {
						this.searchBarHandler("blur");
					}
					break;
				case "blur":
					this.search_timeout = setTimeout(() => (this.search_timeout = undefined) || this.setState({ isSearching: false }), 200);
					break;
				case "keyup":
				case "focus":
					if (value != "")
						this.setState({ isSearching: true });
					break;
			}
		}

		toggleSidebar () {
			this.setState({ isOpen: !this.state.isOpen });
		}

		render () {
			return E("div", { onClick: e => this.searchBarHandler("click", false), className: `ui ${this.state.isSearching ? "searching" : ""} ${this.state.isLoading ? "loading" : ""} ${this.state.isOpen ? "open" : "close"}` },
				E("div", { id: "particles-background", className: "vertical-centered-box"}),
				E("div", { id: "particles-foreground", className: "vertical-centered-box"}),
				E("div", { id: "sidebarButton", onClick: () => this.toggleSidebar() },
					E("span", { className: "sidebarOpen" }, "≡"),
					E("span", { className: "sidebarClose" }, "×")
				),
				E(SideBar, { isOpen: this.state.isOpen }),
				E("div", { className: "content" },
					E(React.addons.CSSTransitionGroup, {
						component: "div",
						className: "pages",
						transitionName: "example",
						transitionEnterTimeout: 300,
						transitionLeaveTimeout: 300
					}, cloneElement(this.props.children, {
						key: this.props.location.pathname
					}))
				),
				E("div", { className: "topbar" },
					E(SearchBar, { query: this.state.query, handler: (...args) => this.searchBarHandler(...args) }),
					E(Clock)
				),
				E(Loading, { isLoading: this.state.isLoading })
			);
		}

	}
