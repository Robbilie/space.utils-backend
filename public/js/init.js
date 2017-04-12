
	"use strict";

	import { render } from 'react-dom'

	import App from './App.js'
	import { HomePage, KillboardPage, SearchPage, CharacterPage, CorporationPage, AlliancePage, TypePage, SystemPage, AboutPage, NoMatch } from './page'

	render(
		E(Router, { history: browserHistory },
			E(Route, { path: "/", component: App },
				E(IndexRoute, { component: HomePage }),
				E(Route, { path: "killboard/", component: KillboardPage }),
				E(Route, { path: "search/(:query/)", component: SearchPage }),
				E(Route, { path: "characters/:id/", component: CharacterPage }),
				E(Route, { path: "corporations/:id/", component: CorporationPage }),
				E(Route, { path: "alliances/:id/", component: AlliancePage }),
				E(Route, { path: "types/:id/", component: TypePage }),
				E(Route, { path: "systems/:id/", component: SystemPage }),
				E(Route, { path: "about/", component: AboutPage }),
				E(Route, { path: "*", component: NoMatch })
			)
		),
		document.getElementById("viewport")
	);
