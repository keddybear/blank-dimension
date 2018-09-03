// Note: this db connection is only closed when server is turned off

const mongoose 	= require('mongoose');
const conf		= require('./config');

const { url } = conf;

mongoose.connect(url, { useNewUrlParser: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => { console.log('MongoDB connection suceeded.'); });
db.on('disconnected', () => { console.log('MongoDB diconnected successfully.'); });

module.exports = db;

// Alternative: we could manually open and close connection
/*
	const db = {
		connect: () => {
			mongoose.connect...
		},
		close: () => {
			...
		}
	}
*/
