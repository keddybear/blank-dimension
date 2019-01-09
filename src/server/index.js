require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8000;

app.get('*.js', (req, res, next) => {
	req.url = `${req.url}.gz`;
	res.set('Content-Encoding', 'gzip');
	next();
});

app.use(express.static('dist'));

app.get('/*', (req, res) => {
	res.sendFile(path.resolve('dist/index.html'), (err) => {
		if (err) {
			res.status(500).send(err);
		}
	});
});

app.listen(port, () => console.log(`Listening on port ${port}!`));

process.on('SIGINT', () => {
	console.log('App terminated successfully');
});

// const create 	= require('./create');
// const db 		= require('./db/connect');

// const app = create();
// const port = process.env.PORT || 8080;

// app.listen(port, () => console.log(`Listening on port ${port}!`));

// process.on('SIGINT', () => {
// 	db.close(() => {
// 		console.log('MongoDB disconnected through app termination');
// 		process.exit(0);
// 	});
// });
