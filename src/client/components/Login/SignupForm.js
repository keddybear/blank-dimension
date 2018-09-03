import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import { Field, reduxForm, SubmissionError, reducer as formReducer } from 'redux-form';
// import _ from 'lodash';

import { POST } from 'helpers/ajax';
import { smoothEnter } from 'helpers/animations';

// Component
import Ripple from 'components/Effects/Ripple/Index';
import Checkbox from 'components/Form/Checkbox/Index';

//= Reducers & Store
const reducers = combineReducers({
	form: formReducer
});

const store = createStore(reducers);

//= Validation
const required = value => (value ? undefined : 'Required');
const email = value => (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
	'Invalid email address' : undefined);
const matchPass = (value, allValues) => (value === allValues.password ? undefined : 'Passwords don\'t match');
const tooShort = value => (value.length < 6 ? 'Password too short' : undefined);

//= Helpers
const iconFor = (label) => {
	switch (label) {
		case 'Username':
			return 'account';
		case 'Password':
		case 'Confirm Password':
			return 'lock';
		case 'Email':
			return 'email';
		default:
			return '';
	}
};

//= Components
const renderField = ({ input, label, type, meta: { active, touched, error, warning } }) => {
	let activeClass = '';
	let warnClass = '';
	let msg = '';

	if (active) {
		activeClass = 'active';
	}

	if (touched) {
		if (error || warning) {
			msg = error || warning;
			warnClass = 'warn';
		}
	}

	return (
		<div className={`input-box ${activeClass} ${warnClass}`}>
			<div className={`iblock input-label ${iconFor(label)}`} />
			<input {...input} className='iblock input-field' type={type} placeholder={label} autoComplete='off' />
			<div className='msg'>{ msg }</div>
		</div>
	);
};

const renderCheckbox = ({ input, type, meta: { dirty, touched, error, warning } }) => {
	let warnClass = '';
	let msg = '';

	if (dirty || touched) {
		if (error || warning) {
			msg = error || warning;
			warnClass = 'warn';
		}
	}

	const textComp = <span>I accept <Link to='/terms'>Terms of Service</Link>.</span>;

	return (
		<div className={`check-box ${warnClass}`}>
			<Checkbox input={input} textComp={textComp} type={type} />
			<div className='msg'>{ msg }</div>
		</div>
	);
};

class Form extends Component {
	constructor(props) {
		super(props);
		const { global } = this.props;

		this.submitHandler = values => new Promise((resolve, reject) => {
			POST('/api/user/new', { ...values, _csrf: global.csrf })
				.then(response => response.json())
				.then((data) => {
					if (data.response === 'ValidationError') {
						const { extra } = data;
						reject(new SubmissionError({
							username: extra.username ? extra.username.message : null,
							email: extra.email ? extra.email.message : null,
							password: extra.password ? extra.password.message : null
						}));
						return;
					} else if (data.response !== 'success') {
						global.fireSERR(data);
						reject();
						return;
					}
					resolve();
					global.setAuth(data.extra);
				});
		});
	}

	componentDidMount() {
		smoothEnter(this.root);
	}

	render() {
		const { handleSubmit, submitting } = this.props;
		const { submitHandler } = this;
		return (
			<div className='rblock login-ui' ref={(node) => { this.root = node; }}>
				<form onSubmit={handleSubmit(values => submitHandler(values))} >
					<Field
						name='username'
						type='text'
						label='Username'
						component={renderField}
						validate={[required]}
					/>
					<Field
						name='email'
						type='text'
						label='Email'
						component={renderField}
						validate={[required, email]}
					/>
					<Field
						name='password'
						type='password'
						label='Password'
						component={renderField}
						validate={[required, tooShort]}
					/>
					<Field
						name='rpassword'
						type='password'
						label='Confirm Password'
						component={renderField}
						validate={[required, matchPass]}
					/>
					<Field
						name='tos'
						type='checkbox'
						label=''
						component={renderCheckbox}
						validate={[required]}
					/>
					<button className='btn' type='submit' disabled={submitting}>
						<span>REGISTER</span>
						<Ripple />
					</button>
				</form>
			</div>
		);
	}
}

// Custom actions for redux form

// const mapDispatchToProps = dispatch => ({
// 	customAction: values => dispatch(customAction(values))
// });

// const App = connect(null, mapDispatchToProps)(reduxForm({
// 	form: 'yourFormName'
// })(Form));

const App = reduxForm({
	form: 'SignupForm'
})(Form);

const SignupForm = props => (
	<Provider store={store}>
		<App {...props} />
	</Provider>
);

export default SignupForm;
