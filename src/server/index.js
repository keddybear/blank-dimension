require('dotenv').config();

const create 	= require('./create');
const db 		= require('./db/connect');

const app = create();
const port = process.env.PORT || 8080;

app.listen(port, () => console.log(`Listening on port ${port}!`));

process.on('SIGINT', () => {
	db.close(() => {
		console.log('MongoDB disconnected through app termination');
		process.exit(0);
	});
});
