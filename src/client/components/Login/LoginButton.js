import React from 'react';
import { shallowEqual } from 'helpers/shallowEqual';

class LoginButton extends React.Component {
	shouldComponentUpdate(nextProps) {
		return !shallowEqual(this.props, nextProps);
	}

	render() {
		const { showLogin, toLogin } = this.props;
		let button;

		if (showLogin === 1) {
			button = (
				<div className='de-btn-active'>
					<span>Log In</span>
				</div>
			);
		} else {
			button = (
				<div className='de-btn' onClick={toLogin} onKeyPress={() => {}} tabIndex='-1' role='button'>
					<span>Log In</span>
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

export default LoginButton;
