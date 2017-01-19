
	"use strict";

	ReactDOM.render(
		E(Router, { history: browserHistory },
			E(Route, { path: "/", component: App },
				E(IndexRoute, { component: HomePage })
			)
		),
		document.getElementById("viewport")
	);
