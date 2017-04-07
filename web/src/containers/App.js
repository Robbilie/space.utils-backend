
	"use strict";

	import { Component } from 'react'

	class App extends Component {

		constructor (props) {
			super(props);
		}

		render () {
			return (
				<div className={`ui ${this.state.isSearching ? "searching" : ""} ${this.state.isLoading ? "loading" : ""} ${this.state.isOpen ? "open" : "close"}`}>
					<div id={"particles-background"} className={"vertical-centered-box"}></div>
					<div id={"particles-foreground"} className={"vertical-centered-box"}></div>
					<div>
						<span></span>
						<span></span>
						<span></span>
						<span></span>
					</div>
					<SideBar />
					<div className={"content"}>
						<PageTransition>
							{ cloneElement(this.props.children, {
								key: this.props.location.pathname,
								setLoading: (isLoading) => this.setLoading(isLoading)
							}) }
						</PageTransition>
					</div>
					<div className={"topbar"}>
						<SearchBar></SearchBar>
						<Clock></Clock>
					</div>
					{ this.state.isLoading ?
						<div>
							<div></div>
							<div>
								<div></div>
							</div>
						</div> :
						null
					}
				</div>
			);
			/*

			E("div", { className: `ui ${this.state.isSearching ? "searching" : ""} ${this.state.isLoading ? "loading" : ""} ${this.state.isOpen ? "open" : "close"}` },
				E("div", { id: "particles-background", className: "vertical-centered-box"}),
				E("div", { id: "particles-foreground", className: "vertical-centered-box"}),
				E("div", { id: "sidebarButton", onClick: () => this.toggleSidebar() },
					E("span"),
					E("span"),
					E("span"),
					E("span")
				),
				E(SideBar, { isOpen: this.state.isOpen }),
				E("div", { className: "content" },
					E(PageTransition, {
						component: DummyTransitionComponent,
						transitionName: "example",
						appear: true,
						transitionAppearTimeout: 500,
						transitionEnterTimeout: 500,
						transitionLeaveTimeout: 500,
						awaitLoading: (cb) => this.awaitLoading(cb)
					}, cloneElement(this.props.children, {
						key: this.props.location.pathname,
						setLoading: (isLoading) => this.setLoading(isLoading)
					}))
				),
				E("div", { className: "topbar" },
					E(SearchBar, { query: this.state.query, handler: (...args) => this.searchBarHandler(...args) }),
					E(Clock)
				),
				this.state.isLoading ? E("div", { className: "loader" },
					E("div", { className: "loader-circle" }),
					E("div", { className: "loader-line-mask" },
						E("div", { className: "loader-line" })
					)
				) : null
			);*/
		}

	}

	export default App
