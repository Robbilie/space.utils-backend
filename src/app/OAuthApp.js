
	"use strict";

	const http 						= require("http");
	const express 					= require("express");
	const cookieParser 				= require("cookie-parser");
	const bodyParser 				= require("body-parser");
	const flash 					= require("connect-flash");
	const expressSession 			= require("express-session");
	const RedisStore 				= require("connect-redis")(expressSession);
	const routes 					= require("util/../../routes/oauth");
	const config 					= require("util/../../config/");
	const passport 					= require("passport");

	const { DBUtil, OAuth2Util } 	= require("util/");

	class OAuthApp {

		constructor () {
			try {
				this.init();
			} catch (e) {
				console.log(e);
			}
		}

		async init () {

			const web = express();

			web.use("/static", express.static(process.env.NODE_PATH + "/../public"));

			web.set('view engine', 'ejs');
			web.use(cookieParser());

			web.use(expressSession({
				store: 		new RedisStore({
					host: 	config.redis.host,
					port: 	config.redis.port,
					ttl: 	config.cookies.time
				}),
				cookie: 	{ maxAge: config.cookies.time },
				secret: 	config.cookies.secret,
				resave: 	true,
				saveUninitialized: true,
				key: 		config.cookies.name
			}));

			web.use(bodyParser.urlencoded({ extended: true }));
			web.use(bodyParser.json());
			web.use(flash());
			web.use(passport.initialize());
			web.use(passport.session());

			OAuth2Util.setupPassport();

			web.use(routes);

			web.use(function (err, req, res, next) {
				if (err) {
					res.status(err.status || 400); // when unknown, its the clients fault :D
					res.json(err);
				} else {
					next();
				}
			});

			web.set("json spaces", 2);
			web.enable("trust proxy");

			this.web 		= web;
			this.webServer 	= http.createServer(this.web).listen(config.site.oauthport);

			setInterval(async () => {

				let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

				await accessTokenStore.removeExpired();

			}, 1000 * 60 * 60);

			setInterval(async () => {

				let registerTokenStore = await DBUtil.getStore("OAuthRegisterToken");

				await registerTokenStore.removeExpired();

			}, 1000 * 60 * 60);

			this.watchForTokens();

		}

		async watchForTokens () {

			const registerTokenStore 	= await DBUtil.getStore("OAuthRegisterToken");
			const characterStore 		= await DBUtil.getStore("Character");

			let mailStore 				= await DBUtil.getStore("Mail");
			let mailCursor 				= await mailStore.getUpdates();
			const startMailStream 		= () => {
				let mailStream = mailCursor.stream();
					mailStream.on("data", async data => {

						try {

							if (data.op == "i") {

								let mail = data.o;

								if (mail.toCharacterIDs.indexOf(92095466) !== -1) {

									let registerToken = await registerTokenStore.findByToken(mail.title);

									if (!await registerToken.isNull()) {

										if (Date.now() > await registerToken.getExpirationDate()) {
											return await registerToken.destroy();
										}

										let character = await characterStore.findOrCreate(mail.senderID);

										await registerToken.getUser().update({$addToSet: {characters: character.getId()}});

										await registerToken.destroy();

									}

								}

							}

						} catch (e) {
							console.log(e);
						}

					});
					mailStream.on("error", e => {
						console.log(e);
						mailStream.close();
						startMailStream();
					});
			};
			startMailStream();

			let apikeyinfoStore 		= await DBUtil.getStore("APIKeyInfo");
			let apikeyinfoCursor 		= await apikeyinfoStore.getUpdates();
			const startAPIStream 		= () => {
				let apikeyinfoStream 		= apikeyinfoCursor.stream();
					apikeyinfoStream.on("data", async data => {

						try {

							if(data.op == "i") {

								let apikey = data.o;

								let registerToken = await registerTokenStore.findByToken(apikey.vCode);

								if(!await registerToken.isNull()) {

									if(Date.now() > await registerToken.getExpirationDate()) {
										return await registerToken.destroy();
									}

									await registerToken.getUser().update({ $addToSet: { characters: { $each: apikey.characters } } });

									await registerToken.destroy();

								}

							}

						} catch (e) {
							console.log(e);
						}

					});
					apikeyinfoStream.on("error", e => {
						console.log(e);
						apikeyinfoStream.close();
						startAPIStream();
					});
			};
			startAPIStream();

		};

	}

	module.exports = OAuthApp;
