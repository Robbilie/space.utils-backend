
	"use strict";

	ReactDOM.render(
		E(Router, { history: browserHistory },
			E(Route, { path: "/", component: App },
				E(IndexRoute, { component: HomePage }),
				E(Route, { path: "killboard/", component: KillboardPage }),
				E(Route, { path: "character/:id/", component: CharacterPage }),
				E(Route, { path: "corporation/:id/", component: CorporationPage }),
				E(Route, { path: "alliance/:id/", component: AlliancePage }),
				E(Route, { path: "type/:id/", component: TypePage }),
				E(Route, { path: "system/:id/", component: SystemPage })
			)
		),
		document.getElementById("viewport")
	);
