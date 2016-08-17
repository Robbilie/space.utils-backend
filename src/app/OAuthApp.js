
	"use strict";

	const http 						= require("http");
	const express 					= require("express");
	const cookieParser 				= require("cookie-parser");
	const bodyParser 				= require("body-parser");
	const flash 					= require("connect-flash");
	const expressSession 			= require("express-session");
	const RedisStore 				= require("connect-redis")(expressSession);
	const DBUtil 					= require("util/DBUtil");
	const routes 					= require("util/../../routes/oauth");
	const config 					= require("util/../../config/");
	const bcrypt 					= require("bcrypt");

	const passport 					= require("passport");
	const LocalStrategy 			= require("passport-local").Strategy;
	const BasicStrategy 			= require("passport-http").BasicStrategy;
	const ClientPasswordStrategy 	= require("passport-oauth2-client-password").Strategy;
	const BearerStrategy 			= require("passport-http-bearer").Strategy;

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
				key: 		"oauth.sid"
			}));

			web.use(bodyParser.urlencoded({ extended: true }));
			web.use(bodyParser.json());
			web.use(flash());
			web.use(passport.initialize());
			web.use(passport.session());

			this.initPassport();

			web.use(routes);

			web.use(function (err, req, res, next) {
				if (err) {
					res.status(err.status);
					res.json(err);
				} else {
					next();
				}
			});

			web.set("json spaces", 2);
			web.enable("trust proxy");

			this.web 		= web;
			this.webServer 	= http.createServer(this.web).listen(3000);

			setInterval(async () => {

				let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

				await accessTokenStore.removeExpired();

			}, 1000 * 60 * 60);

			this.watchForTokens();

		}

		initPassport () {

			passport.use(new LocalStrategy(async (username, password, done) => {

				let userStore = await DBUtil.getStore("User");

				try {

					let user = await userStore.getByName(username);

					if(!user)
						return done(null, false);

					if(!bcrypt.compareSync(password, user.getPassword()))
						return done(null, false);

					return done(null, { user });

				} catch (e) {
					return done(e);
				}

			}));

			passport.use(new BasicStrategy(async (id, secret, done) => {

				let clientStore = await DBUtil.getStore("OAuthClient");

				try {

					let client = await clientStore.getBy_id(id);

					if(!client)
						return done(null, false);

					if(client.getSecret() != secret)
						return done(null, false);

					return done(null, client);

				} catch (e) {
					return done(e);
				}

			}));


			passport.use(new ClientPasswordStrategy(async (id, secret, done) => {

				let clientStore = await DBUtil.getStore("OAuthClient");

				try {

					let client = await clientStore.getBy_id(id);

					if(!client)
						return done(null, false);

					if(client.getSecret() != secret)
						return done(null, false);

					return done(null, client);

				} catch (e) {
					return done(e);
				}

			}));

			passport.use(new BearerStrategy(async (token, done) => {

				let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

				try {

					let accessToken = await accessTokenStore.getByToken(token);

					if(!accessToken)
						return done(null, false);

					if(Date.now() > accessToken.getExpirationDate()) {
						await accessToken.destroy();
						return done(null, false);
					}

					if(accessToken.getCharacterId() !== null) {

						let characterStore = await DBUtil.getStore("Character");

						let character = await characterStore.getBy_id(accessToken.getCharacterId());

						if(!character)
							return done(null, false);

						let info = { scope: "*" };

						return done(null, character, info);

					} else {

						let clientStore = await DBUtil.getStore("OAuthClient");

						let client = await clientStore.getBy_id(accessToken.getClientId());

						if(!client)
							return done(null, false);

						let info = { scope: "*" };

						return done(null, client, info);

					}

				} catch (e) {
					return done(e);
				}

			}));

			passport.serializeUser(({user, character}, done) => done(null, { user: user ? user.getName() : null, character: character ? character.getId() : null }));

			passport.deserializeUser(async ({user, character}, done) => {

				try {

					let userStore = await DBUtil.getStore("User");
					let characterStore = await DBUtil.getStore("Character");

					console.log(user, character);

					done(undefined, (user || character) ? {
						user: user ? await userStore.getByName(user) : null,
						character: character ? await characterStore.getById(character) : null
					} : undefined);

				} catch (e) {
					done(e);
				}

			});

		}

		async watchForTokens () {

			const registerTokenStore = await DBUtil.getStore("OAuthRegisterToken");
			const characterStore = await DBUtil.getStore("Character");
			const userStore = await DBUtil.getStore("User");

			let mailStore = await DBUtil.getStore("Mail");
			let mailCursor = await mailStore.getUpdates();
			let mailStream = mailCursor.stream();
			mailStream.on("data", async data => {

				try {

					if(data.op == "i") {

						let mail = data.o;

						if(mail.toCharacterIds.indexOf(92095466) !== -1) {

							let registerToken = await registerTokenStore.getByToken(mail.title);

							if(registerToken) {

								let character = await characterStore.getOrCreate(mail.senderId);

								let user = await userStore.getBy_id(registerToken.getUseId());

								await user.update({ $push: { characters: character.get_id() }});

							}

						}

					}

				} catch (e) {
					console.log(e);
				}

			});

		};

	}

	module.exports = OAuthApp;