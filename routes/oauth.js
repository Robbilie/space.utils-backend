
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

		.get("/oauth/authorize", [
			login.ensureLoggedIn(),
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
			async (req, res, next) => {

				let clientStore = await DBUtil.getStore("OAuthClient");

				let client = await clientStore.getBy_id(req.query.client_id);

				if(client && client.getTrusted()) {
					OAuth2Util.decision({ loadTransaction: false }, (req, cb) => cb(null, { allow: true }))(req, res, next);
				} else {
					res.render("dialog", { transactionID: req.oauth2.transactionID, user: req.user.user, client: req.oauth2.client })
				}

			}
		])
		.post("/oauth/authorize/decision", [
			login.ensureLoggedIn(),
			async (req, res, next) => {

				if (req.body.character - 0 && req.user.user.getCharacters().some(char => char.id == req.body.character - 0)) {
					try {

						let characterStore = await DBUtil.getStore("Character");

						let character = await characterStore.getById(req.body.character - 0);

						req.user.character = character;
						req.session.passport.character = req.body.character - 0;

						next();

					} catch (e) {
						console.log(e);
					}
				} else {
					res.status(400);
					res.json({ error: "invalid_character" });
				}

			},
			OAuth2Util.decision()
		])
		.post("/oauth/token", [
			passport.authenticate(["basic", "oauth2-client-password"], { session: false }),
			OAuth2Util.token(),
			OAuth2Util.errorHandler()
		])

		.get("/oauth/verify",
			async (req, res) => {

				if (req.query.access_token) {

					try {

						let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

						let accessToken = await accessTokenStore.getByToken(req.query.access_token);

						if (Date.now() > accessToken.getExpirationDate()) {
							res.status(400);
							res.json({ error: "invalid_token" });
						} else {

							let characterStore = await DBUtil.getStore("Character");

							let character = await characterStore.getBy_id(accessToken.getCharacterId());

							res.json({ CharacterID: character.getId(), CharacterName: character.getName() });

						}

					} catch (e) {
						res.status(400);
						res.json({ error: "invalid_token" });
					}

				} else {
					res.status(400);
					res.json({ error: "invalid_token" });
				}

			})

		.get("/api/userinfo", () => {})
		.get("/api/clientinfo", () => {})
		.get("/api/tokeninfo", () => {});