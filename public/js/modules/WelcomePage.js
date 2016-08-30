
	"use strict";

	class WelcomePage extends Page {

		render () {
			return $(["div", { className: "welcome page" }, [
				["div", { className: "welcome-vp" }, [
					["img", { src: "./img/1x2.png" }],
					["div", { className: "welcome-conti" }, [
						["a", { id: "search", href: "/eas-ui/search/#search", style: "clip-path: url(#pone);" }, [
							["h2", { innerHTML: "SEARCH" }],
							["img", { src: "./img/1x2.png" }]
						]],
						["a", { id: "killboard", href: "/eas-ui/killboard/#killboard", style: "clip-path: url(#ptwo);" }, [
							["h2", { innerHTML: "KILLBOARD" }],
							["img", { src: "./img/1x2.png" }]
						]],
						["a", { id: "service", href: "/eas-ui/service/#service", style: "clip-path: url(#pthree);" }, [
							["h2", { innerHTML: "SERVICE" }],
							["img", { src: "./img/1x2.png" }]
						]]
					]]
				]]
			]]);
		}

	}
	