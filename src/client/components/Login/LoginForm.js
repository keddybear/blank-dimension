import React, { Component } from 'react';
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

//= Helpers
const iconFor = (label) => {
	switch (label) {
		case 'Username or email':
			return 'account';
		case 'Password':
			return 'lock';
		default:
			return '';
	}
};

//= Components

// *** Debounce Example *** //
//
// To prevent double rendering because of debounce, use shouldComponentUpdate to check
// if current warning !== next warning
//
// class debounceInput extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = { value: props.input.value };

// 		this.debounceOnChange = _.debounce((event) => {
// 			props.input.onChange(event.target.value);
// 		}, 300);

// 		this.handleChange = (event) => {
// 			console.log('handleChange');
// 			event.persist();
// 			if (this.state.value !== event.target.value) {
// 				this.setState({ value: event.target.value });
// 			}
// 			this.debounceOnChange(event);
// 		};
// 	}

// 	render() {
// 		const {
// 			input: { value, onChange, ...input },
// 			label,
// 			type,
// 			meta: { active, touched, error, warning }
// 		} = this.props;

// 		let activeClass = '';
// 		let warnClass = '';
// 		let msg = '';

// 		if (active) {
// 			activeClass = 'active';
// 		}

// 		if (touched) {
// 			if (error || warning) {
// 				msg = error || warning;
// 				warnClass = 'warn';
// 			}
// 		}

// 		return (
// 			<div className={`input-box ${activeClass} ${warnClass}`}>
// 				<div className={`iblock input-label ${iconFor(label)}`} />
// 				<input
// 					{...input}
// 					value={this.state.value}
// 					onChange={this.handleChange}
// 					className='iblock input-field'
// 					type={type}
// 					placeholder={label}
// 					autoComplete='off'
// 				/>
// 				<div className='msg'>{ msg }</div>
// 			</div>
// 		);
// 	}
// }

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

const renderCheckbox = ({ input, type }) => {
	const textComp = <span>Remember me</span>;
	return (
		<div className='check-box'>
			<Checkbox input={input} textComp={textComp} type={type} />
		</div>
	);
};

class Form extends Component {
	constructor(props) {
		super(props);
		const { global } = this.props;

		this.submitHandler = values => new Promise((resolve, reject) => {
			POST('/api/user/auth', { ...values, _csrf: global.csrf })
				.then(response => response.json())
				.then((data) => {
					if (data.response === 'AuthenticationError') {
						const { extra } = data;
						reject(new SubmissionError({
							username: extra.username.message,
							password: extra.password.message
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
		const { handleSubmit, submitting, toRecover } = this.props;
		const { submitHandler } = this;
		return (
			<div className='rblock login-ui' ref={(node) => { this.root = node; }}>
				<form onSubmit={handleSubmit(values => submitHandler(values))} >
					<Field
						name='username'
						type='text'
						label='Username or email'
						component={renderField}
						validate={[required]}
					/>
					<Field
						name='password'
						type='password'
						label='Password'
						component={renderField}
						validate={[required]}
					/>
					<Field
						name='rememberMe'
						type='checkbox'
						label=''
						component={renderCheckbox}
					/>
					<button className='btn' type='submit' disabled={submitting}>
						<span>LOGIN</span>
						<Ripple />
					</button>
				</form>
				<div className='forgotpass'><span onClick={toRecover} onKeyPress={() => {}} role='button' tabIndex='-1'>Forgot your password?</span></div>
			</div>
		);
	}
}

const App = reduxForm({
	form: 'LoginForm'
})(Form);

const LoginForm = props => (
	<Provider store={store}>
		<App {...props} />
	</Provider>
);

export default LoginForm;
