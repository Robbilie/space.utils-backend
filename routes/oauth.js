
	"use strict";

	const {Router} 					= require("express");
	const passport 					= require("passport");
	const login 					= require("connect-ensure-login");
	//const DBUtil 					= require("util/DBUtil");
	const RESTUtil 					= require("util/RESTUtil");

	const m 	= { mergeParams: true };

	module.exports = Router(m)
		.get("/", (req, res) => !req.query.code ? res.render("index") : res.render("index-with-code"))
		.get("/login", (req, res) => res.render("login"))
		.post("/login", [passport.authenticate("local", { successReturnToOrRedirect: "/", failureRedirect: "/login" })])
		.get("/logout", (req, res) => { req.logout(); req.redirect("/"); })
		.get("/account", [login.ensureLoggedIn(), (req, res) => res.render("account", { user: req.user })])
		.get("/dialog/authorize", () => {})
		.post("/dialog/authorize/decision", () => {})
		.post("/oauth/token", () => {})
		.get("/api/userinfo", () => {})
		.get("/api/clientinfo", () => {})
		.get("/api/tokeninfo", () => {});