const config = {
	sessionSecret: process.env.SESSION_SECRET,
	redisOptions: {
		url: process.env.REDIS_URL,
		pass: process.env.REDIS_PASS
	}
};

module.exports = config;
