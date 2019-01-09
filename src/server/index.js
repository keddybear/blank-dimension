require('dotenv').config();

const express = require('express');

const app = express();
const port = process.env.PORT || 8000;

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
