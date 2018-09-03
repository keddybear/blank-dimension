const bcrypt 	= require('bcrypt');
const User		= require('../models/User');

//= Error Handlers

const handleDefaultError = (err, req, res) => {
	switch (err.name) {
		case 'MongoError':
			res.status(500).json({
				response: 'MongoError',
				name: `${err.name}/${err.code}`,
				url: req.url,
				type: '',
				msg: err.message,
				extra: null
			});
			break;
		default:
			res.status(500).json({
				response: 'error',
				name: '500/Internal Server Error',
				url: req.url,
				type: '',
				msg: err.message,
				extra: err.stack
			});
			break;
	}
};

//= User Controls

const createUser = async (req, res) => {
	const { username, email, password } = req.body;

	// Check for duplicates
	const countUsername = () => User.count({ username }).exec();
	const countEmail = () => User.count({ email }).exec();

	// hash password
	const genSalt = rounds => new Promise((resolve, reject) => {
		bcrypt.genSalt(rounds, (error, salt) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(salt);
		});
	});

	const hashPassword = (salt, plainPassword) => new Promise((resolve, reject) => {
		bcrypt.hash(plainPassword, salt, (error, hash) => {
			if (error) {
				reject(error);
				return;
			}
			resolve(hash);
		});
	});

	try {
		const nameCount = await countUsername();
		const emailCount = await countEmail();
		if (nameCount > 0 || emailCount > 0) {
			const taken = {
				name: 'ValidationError',
				errors: {
					username: {
						message: nameCount ? 'Taken' : null
					},
					email: {
						message: emailCount ? 'Taken' : null
					}
				}
			};
			throw taken;
		}

		const salt = await genSalt(10);
		const hpassword = await hashPassword(salt, password);

		const user = new User({
			username,
			email,
			password: hpassword
		});

		const newUser = await user.save();
		req.session.userId = newUser.id;
		res.status(201).json({
			response: 'success',
			name: '',
			url: req.url,
			type: '',
			msg: newUser.id,
			extra: {
				id: newUser.id,
				username: newUser.username,
				level: newUser.level
			}
		});
	} catch (err) {
		if (err.name === 'ValidationError') {
			res.status(400).json({
				response: 'ValidationError',
				name: '',
				url: '',
				msg: '',
				extra: err.errors
			});
		} else {
			handleDefaultError(err, req, res);
		}
	}
};

const authUser = async (req, res) => {
	const { username, password } = req.body;

	const isEmail = email => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
	const query = isEmail(username) ?
		User.findOne({ email: username }) :
		User.findOne({ username });

	const getUser = () => query.exec();
	const checkPass = (plainPassword, hpassword) => new Promise((resolve, reject) => {
		bcrypt.compare(plainPassword, hpassword, (err, match) => {
			if (err) {
				reject(err);
				return;
			}
			resolve(match);
		});
	});

	try {
		const myUser = await getUser(); // not found -> null
		let match = false;
		if (myUser) {
			match = await checkPass(password, myUser.password);
		}

		if (match) {
			req.session.user = {
				id: myUser.id,
				username: myUser.username
			};
			res.status(201).json({
				response: 'success',
				name: '',
				url: req.url,
				type: '',
				msg: myUser.id,
				extra: {
					id: myUser.id,
					username: myUser.username,
					level: myUser.level
				}
			});
		} else {
			res.status(400).json({
				response: 'AuthenticationError',
				name: '',
				url: '',
				msg: '',
				extra: {
					username: { message: 'Incorrect' },
					password: { message: 'Incorrect' }
				}
			});
		}
	} catch (err) {
		handleDefaultError(err, req, res);
	}
};

const needAuth = (req, res, next) => {
	if (req.session.user && req.session.user.level > 0) {
		next();
		return;
	}
	res.status(401).json({
		response: 'Unauthorized',
		name: '401/Unauthorized',
		url: req.url,
		msg: 'Authentication Required',
		extra: null
	});
};

const logout = async (req, res) => {
	try {
		req.session.user = {};
		res.status(201).json({
			response: 'success'
		});
	} catch (err) {
		handleDefaultError(err, req, res);
	}
};

module.exports = {
	createUser,
	authUser,
	needAuth,
	logout
};
