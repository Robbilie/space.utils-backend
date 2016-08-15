
	"use strict";

	const DBUtil 					= require("util/DBUtil");
	const OAuth2Util 				= require("util/OAuth2Util");
	const rp 						= require("request-promise");
	const bcrypt 					= require("bcrypt");
	const config 					= require("util/../../config/");

	class OAuthHandler {

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

					user = await userStore.insert({
						name: req.body.username,
						password: hash,
						characters: []
					});

					req.session.passport = Object.assign(req.session.passport || {}, { user: user.get_id().toString() });
					res.redirect("/account");

				} catch (e) {
					console.log(e);
				}

			};
		}

	}

	module.exports = OAuthHandler;