module.exports = (function () {
	switch (process.env.NODE_ENV) {
		// Development
		case 'development':
		default:
			return {
				url: process.env.DB_DEV_URL
			};
		// Production
		case 'production':
			return {
				url: process.env.MONGODB_URI
			};
		// Test
		case 'test':
			return {
				url: process.env.DB_TEST_URL
			};
		// ...
	}
}());
