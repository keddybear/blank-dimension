import React from 'react';
import { shallowEqual } from 'helpers/shallowEqual';

class SignupButton extends React.Component {
	shouldComponentUpdate(nextProps) {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { showLogin, toSignup } = this.props;
		let button;

		if (showLogin === 2) {
			button = (
				<div className='de-btn-active'>
					<span>Sign Up</span>
				</div>
			);
		} else {
			button = (
				<div className='de-btn' onClick={toSignup} onKeyPress={() => {}} tabIndex='-1' role='button'>
					<span>Sign Up</span>
				</div>
			);
		}

		return (
			<div>
				{button}
			</div>
		);
	}
}

export default SignupButton;
