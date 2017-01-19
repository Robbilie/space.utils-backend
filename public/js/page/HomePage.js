
	"use strict";

	class HomePage extends Component {

		render () {
			return E("div", { className: "welcome page" },
				E("div", { className: "welcome-vp" },
					E("img", { src: "/img/1x2.png" }),
					E("img", { src: "/img/1x2.png", className: "mobo" }),
					E("img", { src: "/img/1x2.png", className: "mobo" }),
					E("div", { className: "welcome-conti" },
						E(Link, { id: "search", to: "/search/#search", style: "clip-path: url(#pone);" },
							E("h2", null, "SEARCH"),
							E("img", { src: "/img/1x2.png" })
						),
						E(Link, { id: "killboard", to: "/killboard/#killboard", style: "clip-path: url(#ptwo);" },
							E("h2", null, "KILLBOARD"),
							E("img", { src: "/img/1x2.png" })
						),
						E("a", { id: "service", href: "https://service.eneticum.de/", target: "_blank", style: "clip-path: url(#pthree);" },
							E("h2",null, "SERVICE"),
							E("img", { src: "/img/1x2.png" })
						)
					)
				)
			);
		}

	}
