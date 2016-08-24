
	"use strict";

	class WelcomePage extends Page {

		render () {
			return $(["div", { className: "welcome page" }, [
				["div", { className: "welcome-vp" }, [
					["img", { src: "./img/1x2.png" }],
					["div", { className: "welcome-conti" }, [
						new Link(this, { id: "search", href: "/eas-ui/search/#search" }, [
							["h2", { innerHTML: "SEARCH" }],
							["img", { src: "./img/1x2.png" }]
						]),
						new Link(this, { id: "killboard", href: "/eas-ui/killboard/#killboard" }, [
							["h2", { innerHTML: "KILLBOARD" }],
							["img", { src: "./img/1x2.png" }]
						]),
						new Link(this, { id: "service", href: "/eas-ui/service/#service" }, [
							["h2", { innerHTML: "SERVICE" }],
							["img", { src: "./img/1x2.png" }]
						])
					]]
				]],
				["svg", { width: 0, height: 0, viewBox: "0 0 1 1" }, [
					["clippath", { id: "pone", clipPathUnits: "objectBoundingBox" }, [
						["polygon", { points: "0 0, 1 0, 0.75 1, 0 1" }]
					]],
					["clippath", { id: "ptwo", clipPathUnits: "objectBoundingBox" }, [
						["polygon", { points: "0.2 0, 1 0, 0.8 1, 0 1" }]
					]],
					["clippath", { id: "pthree", clipPathUnits: "objectBoundingBox" }, [
						["polygon", { points: "0.25 0, 1 0, 1 1, 0 1" }]
					]],
					["clippath", { id: "pfull", clipPathUnits: "objectBoundingBox" }, [
						["polygon", { points: "0 0, 1 0, 1 1, 0 1" }]
					]]
				]]
			]]);
		}

	}