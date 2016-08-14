
	"use strict";

	const {Router} 					= require("express");
	const passport 					= require("passport");
	const login 					= require("connect-ensure-login");
	const DBUtil 					= require("util/DBUtil");
	const RESTUtil 					= require("util/RESTUtil");


	const OAuth2Util 				= require("util/OAuth2Util");



	const m 	= { mergeParams: true };

	module.exports = Router(m)

		.get("/",
			(req, res) => !req.query.code ? res.render("index") : res.render("index-with-code"))
		.get("/login",
			(req, res) => res.render("login"))
		.post("/login",
			[passport.authenticate("local", { successReturnToOrRedirect: "/", failureRedirect: "/login" })])
		.get("/logout",
			(req, res) => { req.logout(); req.redirect("/"); })
		.get("/account",
			[login.ensureLoggedIn(), (req, res) => res.render("account", { user: req.user })])

		.get("/dialog/authorize", [
			login.ensureLoggedIn(),
			OAuth2Util.authorization(async (clientID, redirectURI, scope, done) => {

				let clientStore = await DBUtil.getStore("OAuthClient");

				try {

					let client = await clientStore.getBy_id(clientID);

					if(client && client.getRedirect() != redirectURI)
						return done(new Error("Invalid Redirect URI"));

					// something something scope

					return done(null, client, redirectURI);

				} catch (e) {
					return done(e);
				}

			}),
			async (req, res, next) => {

				let clientStore = await DBUtil.getStore("OAuthClient");

				let client = await clientStore.getBy_id(req.query.client_id);

				if(client && client.getTrusted()) {
					OAuth2Util.decision({ loadTransaction: false }, (req, cb) => cb(null, { allow: true }))(req, res, next);
				} else {
					res.render("dialog", { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client })
				}

			}
		])
		.post("/dialog/authorize/decision", [
			login.ensureLoggedIn(),
			OAuth2Util.decision()
		])
		.post("/oauth/token", [
			passport.authenticate(["basic", "oauth2-client-password"], { session: false }),
			OAuth2Util.token(),
			OAuth2Util.errorHandler()
		])

		.get("/api/userinfo", () => {})
		.get("/api/clientinfo", () => {})
		.get("/api/tokeninfo", () => {});