import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

export default function withAuth(WrappedComponent) {
	return class extends Component {
		constructor(props) {
			super(props);
			this.appPath = this.props.location.pathname;
		}

		render() {
			console.log(this.props.global);
			if (!this.props.global.auth.level || this.props.global.auth.level < 1) {
				return <Redirect to={{ pathname: '/', state: { referrer: this.appPath } }} />;
			}
			return <WrappedComponent {...this.props} />;
		}
	};
}
