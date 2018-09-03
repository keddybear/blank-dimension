const express 		= require('express');
const session 		= require('express-session');
const RedisStore 	= require('connect-redis')(session);
const path 			= require('path');

const routes 		= require('./routes');
const conf 			= require('./config');

const create = () => {
	const app = express();

	// Middlewares
	app.use(session({
		store: new RedisStore(conf.redisOptions),
		secret: conf.sessionSecret,
		resave: false,
		saveUninitialized: true,
		cookie: {
			path: '/',
			httpOnly: true,
			secure: false, // Need HTTPS for true
			maxAge: null
		}
	}));

	app.use((req, res, next) => {
		if (!req.session) {
			res.status(500).json({
				response: 'RedisConnectionError',
				name: 'Redis Connection Error',
				url: req.url,
				type: '',
				msg: 'Unable to connect to Redis',
				extra: null
			});
			return;
		}
		next();
	});

	// Routing
	app.get('*.js', (req, res, next) => {
		req.url = `${req.url}.gz`;
		res.set('Content-Encoding', 'gzip');
		next();
	});

	app.use(express.static('dist'));

	app.use('/api', routes);

	app.get('/*', (req, res) => {
		res.sendFile(path.resolve('dist/index.html'), (err) => {
			if (err) {
				res.status(500).send(err);
			}
		});
	});

	return app;
};

module.exports = create;
