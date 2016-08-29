
	"use strict";

	const { APIKeyInfoTask } 		= require("task/");
	const { DBUtil, OAuth2Util } 	= require("util/");
	const rp 						= require("request-promise");
	const bcrypt 					= require("bcrypt");
	const uuid 						= require("node-uuid");
	const config 					= require("util/../../config/");

	class OAuthHandler {

		static preauth () {
			return async (req, res, next) => {
				if ((await req.user.user.getCharacters()).length == 0) {
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

				let client = await clientStore.findBy_id(req.query.client_id);

				if(client && await client.getTrusted()) {
					OAuth2Util.decision({ loadTransaction: false }, (req, cb) => cb(null, { allow: true }))(req, res, next);
				} else {
					res.render("dialog", { transactionID: req.oauth2.transactionID, user: await req.user.user.toJSON(), client: await req.oauth2.client.toJSON(), scopes: !req.query.scope || req.query.scope == "" ? [] : req.query.scope.split(" ") })
				}

			}
		}

		static decision () {
			return async (req, res, next) => {

				let character = (await Promise.all((await req.user.user.getCharacters()).map(async (char) => (await char.getId()) == req.body.character - 0 ? char : null))).find(c => !!c);

				if (character) {
					try {

						req.user.character 	= character;
						req.user.scope 		= !req.body.scope || req.body.scope == "" ? [] : req.body.scope.split("+");
						req.session.passport.character = await character.getId();

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
			return async (req, res) => {

				try {

					if(!req.body.username || !req.body.password || !req.body['g-recaptcha-response']) {
						req.flash("error", "Invalid form data.");
						res.redirect("/register");
						return;
					}

					let userStore = await DBUtil.getStore("User");

					let user = await userStore.findByName(req.body.username);

					if(!await user.isNull()) {
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
						name: 			req.body.username,
						password: 		hash,
						characters: 	[]
					});

					if(!req.session.passport)
						req.session.passport = {};

					if(!req.session.passport.user)
						req.session.passport.user = {};

					req.session.passport.user.user = await user.getName();
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

					let token = uuid.v4().split("-").join("");

					await registerTokenStore.insert({
						token: 				token,
						user: 				await req.user.user.get_id(),
						expirationDate: 	Date.now() + (1000 * 60 * 60)
					});

					req.flash("info", token);

				} catch (e) {
					console.log(e);
				}

				next();

			};
		}

		static addAPI () {
			return async (req, res) => {

				try {

					await APIKeyInfoTask.create({ keyID: req.body.keyID - 0, vCode: req.body.vCode });

					res.redirect("/account");

				} catch (e) {
					console.log(e);
					res.json({ error: e });
				}

			};
		}

		static removeCharacter () {
			return async (req, res) => {

				let character = (await Promise.all((await req.user.user.getCharacters()).map(async (char) => (await char.getId()) == req.query.character - 0 ? char : null))).find(c => !!c);

				if (character) {
					try {

						await req.user.user.update({ $pull: { characters: await character.getId() } });

						res.redirect("/account");

					} catch (e) {
						console.log(e);
					}
				} else {
					res.status(400);
					res.json({ error: "invalid_character" });
				}

			};
		}

		static logout () {
			return async (req, res) => {
				req.logout();
				res.redirect("/");
			};
		}

	}

	module.exports = OAuthHandler;
