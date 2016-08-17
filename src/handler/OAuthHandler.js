
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const OAuth2Util 				= require("util/OAuth2Util");
	const rp 						= require("request-promise");
	const bcrypt 					= require("bcrypt");
	const uuid 						= require("node-uuid");
	const config 					= require("util/../../config/");

	class OAuthHandler {

		static preauth () {
			return async (req, res, next) => {
				if (req.user.user.getCharacters().length == 0) {
					req.flash("error", "You need to add at least one character first.");
					res.redirect("/account");
				} else {
					next();
				}
			};
		}

		static authorize () {
			return async (req, res, next) => {

				let clientStore = await DBUtil.getStore("OAuthClient");

				let client = await clientStore.getBy_id(req.query.client_id);

				if(client && client.getTrusted()) {
					OAuth2Util.decision({ loadTransaction: false }, (req, cb) => cb(null, { allow: true }))(req, res, next);
				} else {
					res.render("dialog", { transactionID: req.oauth2.transactionID, user: req.user.user, client: req.oauth2.client })
				}

			}
		}

		static decision () {
			return async (req, res, next) => {

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

			};
		}

		static register () {
			return async (req, res, next) => {

				try {

					if(!req.body.username || !req.body.password || !req.body['g-recaptcha-response']) {
						req.flash("error", "Invalid form data.");
						res.redirect("/register");
						return;
					}

					let userStore = await DBUtil.getStore("User");

					let user = await userStore.getByName(req.body.username);

					if(user) {
						req.flash("error", "Name already taken.");
						res.redirect("/register");
						return;
					}

					const verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + config.captcha.secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

					let response = await rp(verificationUrl);
					let body = JSON.parse(response);

					if(body.success !== undefined && !body.success) {
						req.flash("error", "Invalid captcha.");
						res.redirect("/register");
						return;
					}

					let hash = bcrypt.hashSync(req.body.password, 10);

					await userStore.insert({
						name: req.body.username,
						password: hash,
						characters: []
					});

					if(!req.session.passport)
						req.session.passport = {};

					if(!req.session.passport.user)
						req.session.passport.user = {};

					req.session.passport.user.user = req.body.username;
					res.redirect("/account");

				} catch (e) {
					console.log(e);
				}

			};
		}

		static addToken () {
			return async (req, res, next) => {

				try {

					let registerTokenStore = await DBUtil.getStore("OAuthRegisterToken");

					let token = uuid.v4();

					await registerTokenStore.insert({
						token: 			token,
						userId: 		req.user.user.get_id().toString(),
						expirationDate: Date.now() + (1000 * 60 * 60),
					});

					req.flash("info", token);

				} catch (e) {
					console.log(e);
				}

				next();

			};
		}

		static logout () {
			return async (req, res, next) => {
				req.logout();
				res.redirect("/");
			};
		}

	}

	module.exports = OAuthHandler;