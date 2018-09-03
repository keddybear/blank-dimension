const POST = (url, data, ops = {}) => {
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		credentials: 'same-origin',
		body: JSON.stringify(data)
	};

	return fetch(url, { ...ops, ...options });
};

const GET = (url, ops = {}) => {
	const options = {
		method: 'GET',
		credentials: 'same-origin'
	};

	return fetch(url, { ...ops, ...options });
};

module.exports = {
	POST,
	GET
};
