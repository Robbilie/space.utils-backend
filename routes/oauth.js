
	"use strict";

	const {Router} 					= require("express");
	const passport 					= require("passport");
	const login 					= require("connect-ensure-login");
	const DBUtil 					= require("util/DBUtil");
	const RESTUtil 					= require("util/RESTUtil");
	const config 					= require("util/../../config/");
	const OAuth2Util 				= require("util/OAuth2Util");
	const OAuthHandler 				= require("handler/OAuthHandler");



	const m 	= { mergeParams: true };

	module.exports = Router(m)

		.get("/",
			(req, res) => !req.query.code ? res.render("index") : res.render("index-with-code"))
		.get("/login",
			(req, res) => res.render("login", { error: req.flash("error") || "" }))
		.post("/login",
			[passport.authenticate("local", { successReturnToOrRedirect: "/", failureRedirect: "/login", failureFlash: 'Invalid username or password.' })])
		.get("/logout",
			OAuthHandler.logout())
		.get("/account",
			[login.ensureLoggedIn(), (req, res) => res.render("account", { user: req.user.user, error: req.flash("error") || "" })])
		.get("/register",
			(req, res) => res.render("register", { siteKey: config.captcha.siteKey, error: req.flash("error") || "" }))
		.post("/register",
			OAuthHandler.register())

		.get("/oauth/authorize", [
			login.ensureLoggedIn(),
			OAuthHandler.preauth(),
			OAuth2Util.authorization(async (clientID, redirectURI, scope, done) => {

				if(clientID.length != 24)
					return done(new Error("Invalid ClientID length"));

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
			OAuthHandler.authorize()
		])
		.post("/oauth/authorize/decision", [
			login.ensureLoggedIn(),
			OAuthHandler.decision(),
			OAuth2Util.decision()
		])
		.post("/oauth/token", [
			passport.authenticate(["basic", "oauth2-client-password"], { session: false }),
			OAuth2Util.token(),
			OAuth2Util.errorHandler()
		])

		.get("/oauth/verify", [
			passport.authenticate('bearer', { session: false }),
			(req, res) => res.json({ CharacterID: req.user.getId(), CharacterName: req.user.getName() })
		])

		.get("/api/userinfo", () => {})
		.get("/api/clientinfo", () => {})
		.get("/api/tokeninfo", () => {});