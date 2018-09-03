import React from 'react';
import { Redirect } from 'react-router-dom';
import { shallowEqual } from 'helpers/shallowEqual';

import LoginButton from './LoginButton';
import SignupButton from './SignupButton';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import NotImplemented from './NotImplemented';

class App extends React.Component {
	constructor(props) {
		super(props);
		const { location, history } = this.props;

		this.appPath = location.pathname;
		this.unlisten = history.listen((currLocation, action) => {
			if (action === 'POP' && currLocation.pathname === this.appPath) {
				if (currLocation.state) {
					this.setState(currLocation.state);
				} else {
					this.setState({ display: 1 });
				}
			}
		});
		this.redirect = (location.state && location.state.referrer) || '/welcome';

		this.state = { display: 1 };
		if (history.action === 'POP' && location.pathname === this.appPath) {
			this.state = location.state || this.state;
		}

		this.setDisplay = (i) => {
			// 1: Login, 2: Signup, 3: Recovery
			if (this.state.display !== i) {
				history.push({
					pathname: '/',
					state: { display: i }
				});
				this.setState({ display: i });
			}
		};
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !(this.state === nextState) ||
		!shallowEqual(this.props, nextProps, ['location', 'history']);
	}

	componentWillUnmount() {
		this.unlisten();
	}

	render() {
		if (this.props.global.auth.level > 0) {
			return <Redirect to={this.redirect} />;
		}

		const { global } = this.props;
		let form;

		if (this.state.display === 1) {
			form = <LoginForm toRecover={() => this.setDisplay(3)} global={global} />;
		} else if (this.state.display === 2) {
			form = <SignupForm global={global} />;
		} else if (this.state.display === 3) {
			form = <NotImplemented />; // Should be password recovery form
		}

		return (
			<div>
				<div className='rblock login-ops'>
					<div className='col-abs-6'>
						<LoginButton showLogin={this.state.display} toLogin={() => this.setDisplay(1)} />
					</div>
					<div className='col-abs-6'>
						<SignupButton showLogin={this.state.display} toSignup={() => this.setDisplay(2)} />
					</div>
				</div>
				{ form }
			</div>
		);
	}
}

export default App;
