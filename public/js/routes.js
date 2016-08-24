
	"use strict";

	const routes = Router([
		Route("/", ({ app }) => app.loadPage(WelcomePage)),
		Route("/killboard/", ({ app }) => app.loadPage(KillboardPage))
	]);
