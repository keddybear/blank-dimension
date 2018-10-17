import { combineReducers } from 'redux';

const initialState = 'test';

function test(state = initialState, action) {
	switch (action.type) {
		default:
			return state;
	}
}

const reducers = combineReducers({
	test
});

export default reducers;
