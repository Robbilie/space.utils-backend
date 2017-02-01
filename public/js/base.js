
	"use strict";

	const { createElement, cloneElement, Component } = React;
	const { Router, browserHistory, Route, IndexRoute, Link } = ReactRouter;
	const E = createElement;

	const ESIClient = new SwaggerClient({
		url: "https://esi.tech.ccp.is/latest/swagger.json",
		usePromise: true
	}).then(client => {
		client.clientAuthorizations.add("ua", new SwaggerClient.ApiKeyAuthorization("X-User-Agent", "https://utils.space/", "header"));
		return client;
	});
	const EASClient = new SwaggerClient({
		url: "https://api.utils.space/api-docs",
		usePromise: true
	}).then(client => {
		client.clientAuthorizations.add("ua", new SwaggerClient.ApiKeyAuthorization("X-User-Agent", "https://utils.space/", "header"));
		return client;
	});
