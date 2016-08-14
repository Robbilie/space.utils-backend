
	"use strict";

	const uuid 						= require("node-uuid");
	const oauth2orize 				= require("oauth2orize");
	const server 					= oauth2orize.createServer();

	/*
	 * < SERVER SETUP >
	 */

	server.grant(oauth2orize.grant.code(async (client, redirectURI, user, ares, done) => {

		let code = uuid.v4();

		let authorizationCodeStore = await DBUtil.getStore("OAuthAuthorizationCode");

		try {
			await authorizationCodeStore.insert({
				token: 		code,
				clientId: 	client ? client.get_id() : undefined,
				userId: 	user ? user.get_id() : undefined,
				redirect: 	redirectURI,
				scope: 		client ? client.getScope() : undefined
			});
		} catch (e) {
			return done(e);
		}

		return done(null, code);

	}));

	server.grant(oauth2orize.grant.token(async (client, user, ares, done) => {

		let token = uuid.v4();

		let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

		try {
			await accessTokenStore.insert({
				token: 			token,
				userId: 		user ? user.get_id() : undefined,
				clientId: 		client ? client.get_id() : undefined,
				expirationDate: Date.now() + (1000 * 60 * 60),
				scope: 			client ? client.getScope() : undefined
			});
		} catch (e) {
			return done(e);
		}

		return done(null, token, { expires_in: 1000 * 60 * 60 });

	}));

	server.exchange(oauth2orize.exchange.code(async (client, code, redirectURI, done) => {

		let authorizationCodeStore = await DBUtil.getStore("OAuthAuthorizationCode");

		try {

			let authorizationCode = await authorizationCodeStore.getByToken(code);

			if(!authorizationCode)
				return done(null, false);

			if(client.get_id().toString() != authorizationCode.getClientId().toString())
				return done(null, false);

			if(redirectURI != authorizationCode.getRedirect())
				return done(null, false);

			await authorizationCode.destroy();

			let token = uuid.v4();

			let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

			await accessTokenStore.insert({
				token: 			token,
				userId: 		authorizationCode.getUserId(),
				clientId: 		authorizationCode.getClientId(),
				expirationDate: Date.now() + (1000 * 60 * 60),
				scope: 			authorizationCode.getScope()
			});

			if(authorizationCode.getScope() && authorizationCode.getScope().indexOf("offline_access") === 0) {

				let refreshToken = uuid.v4();

				let refreshTokenStore = await DBUtil.getStore("OAuthRefreshToken");

				await refreshTokenStore.insert({
					token: 		refreshToken,
					userId: 	authorizationCode.getUserId(),
					clientId: 	authorizationCode.getClientId(),
					scope: 		authorizationCode.getScope()
				});

				return done(null, token, refreshToken, { expires_in: 1000 * 60 * 60 });

			} else {
				return done(null, token, null, { expires_in: 1000 * 60 * 60 })
			}

		} catch (e) {
			return done(e);
		}

	}));

	server.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {

		let userStore = await DBUtil.getStore("User");

		try {

			let user = await userStore.getByName(username);

			if(!user)
				return done(null, false);

			if(user.getPassword() !== password)
				return done(null, false);

			let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

			let token = uuid.v4();

			await accessTokenStore.insert({
				token: 			token,
				userId: 		user.get_id(),
				clientId: 		client ? client.get_id() : undefined,
				expirationDate: Date.now() + (1000 * 60 * 60),
				scope: 			scope
			});

			if(scope && scope.indexOf("offline_access") === 0) {

				let refreshToken = uuid.v4();

				let refreshTokenStore = await DBUtil.getStore("OAuthRefreshToken");

				await refreshTokenStore.insert({
					token: 		refreshToken,
					userId: 	user.get_id(),
					clientId: 	client ? client.get_id() : undefined,
					scope: 		scope
				});

				return done(null, token, refreshToken, { expires_in: 1000 * 60 * 60 });

			} else {
				return done(null, token, null, { expires_in: 1000 * 60 * 60 })
			}

		} catch (e) {
			return done(e);
		}

	}));

	server.exchange(oauth2orize.exchange.clientCredentials(async (client, scope, done) => {

		try {

			let token = uuid.v4();

			let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

			await accessTokenStore.insert({
				token: 			token,
				userId: 		null,
				clientId: 		client ? client.get_id() : undefined,
				expirationDate: Date.now() + (1000 * 60 * 60),
				scope: 			scope
			});

			return done(null, token, null, { expires_in: 1000 * 60 * 60 });

		} catch (e) {
			return done(e);
		}

	}));

	server.exchange(oauth2orize.exchange.refreshToken(async (client, rftoken, scope, done) => {

		try {

			let refreshTokenStore = await DBUtil.getStore("OAuthRefreshToken");

			let refreshToken = await refreshTokenStore.getByToken(rftoken);

			if(!refreshToken)
				return done(null, false);

			if(client.get_id().toString() != refreshToken.getClientId().toString())
				return done(null, false);

			let token = uuid.v4();

			let accessTokenStore = await DBUtil.getStore("OAuthAccessToken");

			await accessTokenStore.insert({
				token: 			token,
				userId: 		refreshToken.getUserId(),
				clientId: 		refreshToken.getClientId(),
				expirationDate: Date.now() + (1000 * 60 * 60),
				scope: 			refreshToken.getScope()
			});

			return done(null, token, null, { expires_in: 1000 * 60 * 60 });

		} catch (e) {
			return done(e);
		}

	}));

	server.serializeClient((client, done) => done(null, client.get_id()));

	server.deserializeClient(async (_id, done) => {

		let clientStore = await DBUtil.getStore("OAuthClient");

		try {
			let client = await clientStore.getBy_id(_id);
			done(null, client);
		} catch (e) {
			done(e);
		}

	});

	/*
	 * </ SERVER SETUP >
	 */

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

	}

	module.exports = OAuth2Util;
