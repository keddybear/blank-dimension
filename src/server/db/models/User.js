const mongoose = require('mongoose');

const { Schema } = mongoose;

// Schema
const UserSchema = new Schema({
	// Username
	username: {
		type: String,
		unique: true,
		trim: true,
		required: [true, 'Required']
	},
	// Email
	email: {
		type: String,
		unique: true,
		trim: true,
		required: [true, 'Required'],
		validate: {
			validator: email => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email),
			message: 'Invalid email address'
		}
	},
	// Password
	password: {
		type: String,
		required: [true, 'Required'],
		validate: {
			validator: pw => pw.length >= 6,
			message: 'Password too short'
		}
	},
	// Level
	level: { type: Number, default: 1 }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
