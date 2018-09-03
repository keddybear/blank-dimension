const getCSRF = (req, res) => {
	if (!req.session.csrfSecret) {
		req.session.csrfSecret = req.csrfToken();
	}
	res.json({ csrfToken: req.session.csrfSecret });
};

const csrfCheck = (req, res, next) => {
	const { _csrf } = req.body;
	if (_csrf && _csrf === req.session.csrfSecret) {
		next();
		return;
	}
	res.status(403).json({
		response: 'error',
		name: '403/Forbidden',
		url: req.url,
		type: '',
		msg: 'Invalid CSRF token',
		extra: null
	});
};

const getSession = (req, res) => {
	const state = { csrf: '', auth: {} };

	if (!req.session.csrfSecret) {
		req.session.csrfSecret = req.csrfToken();
	}
	state.csrf = req.session.csrfSecret;

	if (req.session.user) {
		state.auth = req.session.user;
	}
	res.status(200).json({ response: 'success',	state });
};

module.exports = {
	getCSRF,
	csrfCheck,
	getSession
};
