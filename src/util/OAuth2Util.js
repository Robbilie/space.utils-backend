
	"use strict";

	const uuid 						= require("node-uuid");
	const oauth2orize 				= require("oauth2orize");
	const server 					= oauth2orize.createServer();
	const bcrypt 					= require("bcrypt");

	const passport 					= require("passport");
	const LocalStrategy 			= require("passport-local").Strategy;
	const BasicStrategy 			= require("passport-http").BasicStrategy;
	const ClientPasswordStrategy 	= require("passport-oauth2-client-password").Strategy;
	const BearerStrategy 			= require("passport-http-bearer").Strategy;

	const { DBUtil } 				= require("util/");

	/*
	 * < SERVER SETUP >
	 */

	server.grant(oauth2orize.grant.code(async (client, redirectURI, { character, scope }, ares, done) => {

		try {

			let code = uuid.v4();

			let authorizationCodeStore = await DBUtil.getStore("OAuthAuthorizationCode");

			await authorizationCodeStore.insert({
				token: 			code,
				client: 		await client.get_id(),
				character: 		await character.getId(),
				redirect: 		redirectURI,
				scope: 			scope
			});

			return done(null, code);

		} catch (e) {
			return done(e);
		}

	}));

	server.grant(oauth2orize.grant.token(async (client, { character }, ares, done) => {

		try {

			let token = uuid.v4();

			let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

			await accessTokenStore.insert({
				token: 			token,
				character: 		await character.getId(),
				client: 		await client.get_id(),
				expirationDate: Date.now() + (1000 * 60 * 60),
				scope: 			await client.getScope()
			});

			return done(null, token, { expires_in: 1000 * 60 * 60 });

		} catch (e) {
			return done(e);
		}

	}));

	server.exchange(oauth2orize.exchange.code(async (client, code, redirectURI, done) => {

		try {

			let authorizationCodeStore = await DBUtil.getStore("OAuthAuthorizationCode");

			let authorizationCode = await authorizationCodeStore.findByToken(code);

			if(await authorizationCode.isNull())
				return done(null, false);

			if(!(await client.get_id()).equals(await authorizationCode.getClient().get_id()))
				return done(null, false);

			if(redirectURI != await authorizationCode.getRedirect())
				return done(null, false);

			await authorizationCode.destroy();

			let token = uuid.v4();

			let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

			await accessTokenStore.insert({
				token: 			token,
				character: 		await authorizationCode.getCharacter().getId(),
				client: 		await authorizationCode.getClient().get_id(),
				expirationDate: Date.now() + (1000 * 60 * 60),
				scope: 			await authorizationCode.getScope()
			});

			let scope = await authorizationCode.getScope();
			if(scope && scope.indexOf && scope.indexOf("offline_access") === 0) {

				let refreshToken = uuid.v4();

				let refreshTokenStore = await DBUtil.getStore("OAuthRefreshToken");

				await refreshTokenStore.insert({
					token: 			refreshToken,
					character: 		await authorizationCode.getCharacter().getId(),
					client: 		await authorizationCode.getClient().get_id(),
					scope: 			await authorizationCode.getScope()
				});

				return done(null, token, refreshToken, { expires_in: 1000 * 60 * 60 });

			} else {
				return done(null, token, null, { expires_in: 1000 * 60 * 60 })
			}

		} catch (e) {
			return done(e);
		}

	}));

	server.exchange(oauth2orize.exchange.refreshToken(async (client, rftoken, scope, done) => {

		try {

			let refreshTokenStore = await DBUtil.getStore("OAuthRefreshToken");

			let refreshToken = await refreshTokenStore.findByToken(rftoken);

			if(await refreshToken.isNull())
				return done(null, false);

			if(!(await client.get_id()).equals(await refreshToken.getClient().get_id()))
				return done(null, false);

			let token = uuid.v4();

			let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

			await accessTokenStore.insert({
				token: 			token,
				character: 		await refreshToken.getCharacter().getId(),
				client: 		await refreshToken.getClient().get_id(),
				expirationDate: Date.now() + (1000 * 60 * 60),
				scope: 			await refreshToken.getScope()
			});

			return done(null, token, null, { expires_in: 1000 * 60 * 60 });

		} catch (e) {
			return done(e);
		}

	}));

	server.serializeClient(async (client, done) => done(null, await client.get_id()));

	server.deserializeClient(async (_id, done) => {

		let clientStore = await DBUtil.getStore("OAuthClient");

		try {
			let client = await clientStore.findBy_id(_id);
			done(null, client);
		} catch (e) {
			done(e);
		}

	});

	/*
	 * </ SERVER SETUP >
	 */

	var passportSetup = false;

	class OAuth2Util {

		static decision (...args) {
			return server.decision(...args);
		}

		static errorHandler (...args) {
			return server.errorHandler(...args);
		}

		static token (...args) {
			return server.token(...args);
		}

		static authorization (...args) {
			return server.authorization(...args);
		}

		static setupPassport () {

			if(passportSetup)
				return;

			passportSetup = true;

			passport.use(new LocalStrategy(async (username, password, done) => {

				let userStore = await DBUtil.getStore("User");

				try {

					let user = await userStore.findByName(username);

					if(await user.isNull())
						return done(null, false);

					if(!bcrypt.compareSync(password, await user.getPassword()))
						return done(null, false);

					return done(null, { user });

				} catch (e) {
					return done(e);
				}

			}));

			passport.use(new BasicStrategy(async (id, secret, done) => {

				let clientStore = await DBUtil.getStore("OAuthClient");

				try {

					let client = await clientStore.findBy_id(id);

					if(await client.isNull())
						return done(null, false);

					if(await client.getSecret() != secret)
						return done(null, false);

					return done(null, client);

				} catch (e) {
					return done(e);
				}

			}));


			passport.use(new ClientPasswordStrategy(async (id, secret, done) => {

				let clientStore = await DBUtil.getStore("OAuthClient");

				try {

					let client = await clientStore.findBy_id(id);

					if(await client.isNull())
						return done(null, false);

					if(await client.getSecret() != secret)
						return done(null, false);

					return done(null, client);

				} catch (e) {
					return done(e);
				}

			}));

			passport.use(new BearerStrategy(async (token, done) => {

				let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

				try {

					let accessToken = await accessTokenStore.findByToken(token);

					if(await accessToken.isNull())
						return done(null, false);

					if(Date.now() > await accessToken.getExpirationDate()) {
						await accessToken.destroy();
						return done(null, false);
					}

					if(await accessToken.getCharacter()) {

						let info = { scope: "*" };

						return done(null, await accessToken.getCharacter(), info);

					} else if(await accessToken.getClient()) {

						let info = { scope: "*" };

						return done(null, await accessToken.getClient(), info);

					}

				} catch (e) {
					return done(e);
				}

				return done(null, false);

			}));

			passport.serializeUser(async ({ user, character }, done) => done(null, { user: user ? await user.getName() : null, character: character ? await character.getId() : null }));

			passport.deserializeUser(async ({ user, character }, done) => {

				try {

					let userStore 			= await DBUtil.getStore("User");
					let characterStore 		= await DBUtil.getStore("Character");

					console.log(user, character);

					done(undefined, (user || character) ? {
						user: user ? await userStore.findByName(user) : null,
						character: character ? await characterStore.findById(character) : null
					} : undefined);

				} catch (e) {
					done(e);
				}

			});

		}

	}

	module.exports = OAuth2Util;
