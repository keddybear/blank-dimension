export const CSRF_FETCHED 	= 'CSRF_FETCHED';
export const SERVER_ERROR 	= 'SERVER_ERROR';
// export const LOGOUT 		= 'LOGOUT'; --> setAuth({})
export const SET_AUTH 	 	= 'SET_AUTH';

export function fireServerError(error) {
	return {
		type: SERVER_ERROR,
		error
	};
}

export function setAuth(user) {
	return {
		type: SET_AUTH,
		user
	};
}

// Thunk actions
export function fetchCSRF() {
	return (dispatch, getState) => {
		const { csrf } = getState();
		if (!csrf) {
			fetch('/api/csrf', {
				method: 'GET',
				credentials: 'same-origin'
			})
				.then(response => response.json())
				.catch(error => dispatch(fireServerError(error)))
				.then(data => dispatch({ type: CSRF_FETCHED, csrf: data.csrfToken }));
		}
	};
}
