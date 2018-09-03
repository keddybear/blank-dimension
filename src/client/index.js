import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import App from './App';
import reducers from 'reducers/Index/reducers';

const initApp = async () => {
	try {
		const response = await fetch('/api/session', {
			method: 'GET',
			credentials: 'same-origin'
		});
		const data = await response.json();

		let initialState;
		if (data.response === 'success') {
			initialState = data.state;
		}

		const store = createStore(
			reducers,
			initialState,
			applyMiddleware(thunk)
		);

		ReactDOM.render(
			<Provider store={store}>
				<App />
			</Provider>,
			document.getElementById('root')
		);
	} catch (err) {
		ReactDOM.render(
			<p>{JSON.stringify(err)}</p>,
			document.getElementById('root')
		);
	}
};

initApp();
