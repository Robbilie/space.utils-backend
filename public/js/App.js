
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
					this.setState({ isSearching: false });
					break;
				case "focus":
				case "keyup":
					this.setState({ isSearching: !!value });
					break;
			}
		}

		toggleSidebar () {
			this.setState({ isOpen: !this.state.isOpen });
		}

		render () {
			return E("div", { className: `ui ${this.state.isSearching ? "searching" : ""} ${this.state.isLoading ? "loading" : ""} ${this.state.isOpen ? "open" : "close"}` },
				E("div", { id: "particles-background", className: "vertical-centered-box"}),
				E("div", { id: "particles-foreground", className: "vertical-centered-box"}),
				E("div", { id: "sidebarButton", onClick: () => this.toggleSidebar() },/*
					E("span", { className: "sidebarOpen" }, "≡"),
					E("span", { className: "sidebarClose" }, "×")*/
					E("span"),
					E("span"),
					E("span"),
					E("span")
				),
				E(SideBar, { isOpen: this.state.isOpen }),
				E("div", { className: "content" },
					E(React.addons.CSSTransitionGroup, {
						component: "div",
						className: "pages",
						transitionName: "example",
						transitionEnterTimeout: 10000,
						transitionLeaveTimeout: 10000
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
