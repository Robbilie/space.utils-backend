
	"use strict";

	const { createElement, Component } = React;
	const { Router, browserHistory, Route, IndexRoute, Link } = ReactRouter;
	const E = createElement;

	const ESIClient = new SwaggerClient({
		url: "https://esi.tech.ccp.is/latest/swagger.json",
		usePromise: true,
		authorizations: {
			someHeaderAuth: new Swagger.ApiKeyAuthorization("User-Agent", "https://utils.space/", "header")
		}
	});
	const EASClient = new SwaggerClient({
		url: "https://api.utils.space/api-docs",
		usePromise: true
	});
