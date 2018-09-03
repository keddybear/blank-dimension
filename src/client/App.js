import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import { connect } from 'react-redux';
import { fetchCSRF, fireServerError, setAuth } from 'actions/Index/actions';

import Login from 'components/Login/Index';
import Welcome from './Welcome';
import ErrorConsole from './ErrorConsole';
import TOS from './TOS';
import NoMatch from './404';

import 'vendors/bootstrap-sass-3.3.7/stylesheets/bootstrap-custom.scss';
import 'assets/stylesheets/main.scss';

class App extends Component {
	constructor(props) {
		super(props);

		this.renderRoute = ({ path, exact, extraProps }, Target) => (
			<Route
				path={path}
				exact={exact}
				render={history => (
					<Target {...history} global={{ ...this.props }} {...extraProps} />
				)}
			/>
		);

		// Client-side Authentication Redirect
		/*
		this.renderRoute = ({
			path,
			exact,
			needAuth,
			isAuth,
			to,
			extraProps
		}, Target) => (
			<Route
				path={path}
				exact={exact}
				render={(history) => {
					if (needAuth) {
						return (
							this.props.auth > 0 ? (
								<Target {...history} global={{ ...this.props }} {...extraProps} />
							) : (
								<Redirect
									to={{
										pathname: '/',
										state: { referrer: path }
									}}
								/>
							)
						);
					} else if (isAuth) {
						return (
							this.props.auth > 0 ? (
								<Redirect to={(history.location.state && history.location.state.referrer) || to} />
							) : (
								<Target {...history} global={{ ...this.props }} {...extraProps} />
							)
						);
					}
					return <Target {...history} global={{ ...this.props }} {...extraProps} />;
				}}
			/>
		);
		// Usage
		// {renderRoute({ path: '/', exact: true, isAuth: true, to: '/welcome' }, Login)}
		// {renderRoute({ path: '/welcome', needAuth: true, extraProps: { test: 1 }	}, Welcome)}
		*/
	}

	// componentDidMount() {
	// 	this.props.fetchCSRF();
	// }

	render() {
		const { renderRoute } = this;

		return (
			<div>
				<BrowserRouter>
					<Switch>
						{renderRoute({ path: '/', exact: true }, Login)}
						{renderRoute({ path: '/welcome' }, Welcome)}
						{renderRoute({ path: '/terms' }, TOS)}
						<Route component={NoMatch} />
					</Switch>
				</BrowserRouter>
				<ErrorConsole />
			</div>
		);
	}
}

const mapStateToProps = state => ({
	csrf: state.csrf,
	auth: state.auth
});

const mapDispatchToProps = dispatch => ({
	fetchCSRF: () => dispatch(fetchCSRF()),
	fireSERR: error => dispatch(fireServerError(error)),
	setAuth: level => dispatch(setAuth(level))
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
