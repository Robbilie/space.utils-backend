
	"use strict";

	const {Router} 					= require("express");
	//const DBUtil 					= require("util/DBUtil");
	const RESTUtil 					= require("util/RESTUtil");

	const m 	= { mergeParams: true };

	module.exports = Router(m)
		.get("/", () => {})
		.get("/login", () => {})
		.post("/login", () => {})
		.get("/logout", () => {})
		.get("/account", () => {})
		.get("/dialog/authorize", () => {})
		.post("/dialog/authorize/decision", () => {})
		.post("/oauth/token", () => {})
		.get("/api/userinfo", () => {})
		.get("/api/clientinfo", () => {})
		.get("/api/tokeninfo", () => {});