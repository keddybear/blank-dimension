import { combineReducers } from 'redux';

const initialCSRF = ''; // csrf value is set on the server side
const initialServerError = {
	id: 0,
	response: '',
	name: '',
	url: '',
	type: '',
	msg: '',
	extra: null
};
const initialAuthStatus = {};

function csrfToken(state = initialCSRF, action) {
	switch (action.type) {
		case 'CSRF_FETCHED':
			return action.csrf;
		default:
			return state;
	}
}

function serverError(state = initialServerError, action) {
	switch (action.type) {
		case 'SERVER_ERROR':
		case 'CLIENT_FATAL':
			return {
				id: state.id + 1,
				...action.error
			};
		default:
			return state;
	}
}

function authStatus(state = initialAuthStatus, action) {
	switch (action.type) {
		case 'SET_AUTH':
			return action.user;
		default:
			return state;
	}
}

const reducers = combineReducers({
	csrf: csrfToken,
	serr: serverError,
	auth: authStatus
});

export default reducers;
