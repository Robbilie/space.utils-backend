
	"use strict";

	module.exports = {
		site: {
			url: 		"<theUrlYouAreServing>",
			apiport: 	4001,
			oauthport: 	4002,
			debug: 		true,
			userAgent: 	"<theUserAgentForTheApiAndSuch>",
			localIP: 	"<yourLocalAddressSetUndefinedIfDefault>"
		},
		ccp: {
			api: {
				url: 	"https://api.eveonline.com"
			},
			image: {
				url: 	"https://imageserver.eveonline.com"
			}
		},
		crest: {
			clientID: 	'<yourCrestClientId>',
			secretKey: 	'<yourCrestSecretKey>',
			callBack: 	'<yourCrestCallbackUrl>',
			login: {
				url: 	"https://login.eveonline.com"
			},
			api: {
				url: 	"https://crest.eveonline.com"
			}
		},
		sentry: {
			dsn: "<yourSentryDSN>"
		},
		captcha: {
			secretKey: 	"",
			siteKey: 	""
		},
		database: {
			host: 		'127.0.0.1',
			port: 		27017,
			name: 		'<yourMongoDbName>',
			prefix: 	"<yourMongoTablePrefix>"
		},
		redis: {
			host: 		'127.0.0.1',
			port: 		6379
		},
		cookies: {
			name: 		'<aCookieName>',
			ssl: 		false,
			time: 		(1000 * 60 * 60 * 24 * 30),
			secret: 	'<aCookieSecret>'
		},
		secrets: {
			fleetsalt: 	"<saltForFleetConfirmHashes>"
		},
		ldap: {
			port: 		389,
			server: 	"ldap://localhost",
			admin: 		"cn=admin,dc=eneticum",
			password: 	"<ldapAdminPw>",
			basedn: 	"dc=eneticum",
			memberdn: 	"ou=Character,dc=eneticum",
			easkeydn: 	"ou=EASKey,dc=eneticum",
			fails: 		5,
			decay: 		1000 * 60 * 3
		},
		xmpp: {
			host: 		"<yourXmppHostName>",
			bosh: 		"<yourFullBoshUrl>",
			jid: 		"<botJIDwithResource>",
			password: 	"<botPW>"
		}
	};