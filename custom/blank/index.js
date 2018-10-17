import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';

import reducers from './reducers/reducers';
import App from './blank';

const store = createStore(
	reducers,
	applyMiddleware(thunk)
);

const BlankEditor = () => (
	<Provider store={store}>
		<App />
	</Provider>
);

export default BlankEditor;
