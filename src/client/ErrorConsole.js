import React from 'react';
import { connect } from 'react-redux';

import 'assets/stylesheets/error.scss';

const ErrorComponent = ({ error }) => (
	<div className='error'>
		<p><b>{ error.name }</b><br />{ error.url }</p>
		<p>{ error.type ? `${error.type}: ${error.msg}` : error.msg }</p>
		{ error.extra ? <p>{ JSON.stringify(error.extra) }</p> : null }
	</div>
);

class ErrorConsole extends React.Component {
	constructor(props) {
		super(props);
		this.state = { show: false }; // state.show is controlled internally

		this.showConsole = () => {
			if (!this.state.show) {
				this.setState({ show: true });
			}
		};

		this.closeConsole = () => {
			if (this.state.show) {
				this.setState({ show: false });
			}
		};
	}

	shouldComponentUpdate(nextProps, nextState) {
		// this.props.id determins whether the error is a new one, even if its content is the same.
		if ((this.state.show !== nextState.show) || (this.props.error.id !== nextProps.error.id)) {
			this.state.show = true; // Do not use setState to prevent re-render
			return true;
		}
		return false;
	}

	render() {
		const show = this.state.show ? 'show' : '';
		return (
			<div className={`server-error-console ${show}`}>
				<div>
					<div className='console-panel'>
						<div className='console-log'>
							<ErrorComponent error={this.props.error} />
						</div>
						<div className='console-close' onClick={this.closeConsole} role='button' onKeyPress={() => {}} tabIndex='-1'>
							<svg viewBox='0 0 36 36'>
								<circle fill='#ff5555' cx='18' cy='18' r='18' />
								<path stroke='#333333' d='M 9.52 9.52 L 26.48 26.48 M 26.48 9.52 L 9.52 26.48' />
							</svg>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = state => ({
	error: state.serr
});

export default connect(mapStateToProps, null)(ErrorConsole);
