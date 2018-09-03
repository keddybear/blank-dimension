import React from 'react';
import withAuth from 'components/HOC/Authentication';
import { POST } from 'helpers/ajax';
import { smoothEnter } from 'helpers/animations';

class Welcome extends React.Component {
	constructor(props) {
		super(props);
		const { global: { setAuth, fireSERR } } = this.props;
		this.handleClick = () => {
			POST('/api/user/logout', null)
				.then(response => response.json())
				.then((data) => {
					if (data.response === 'success') {
						setAuth({});
					} else {
						fireSERR(data);
					}
				})
				.catch(err => console.log(err));
		};
	}

	componentDidMount() {
		smoothEnter(this.root);
	}

	render() {
		return (
			<div ref={(node) => { this.root = node; }}>
				<h1
					style={{
						color: '#9290ff',
						textAlign: 'center',
						margin: '50px'
					}}
				>
					Welcome, {this.props.global.auth.username}
				</h1>
				<button
					style={{
						display: 'block',
						margin: 'auto',
						color: 'white',
						backgroundColor: '#9290ff',
						width: '100px',
						padding: '10px',
						borderRadius: '5px'
					}}
					onClick={this.handleClick}
				>
					Logout
				</button>
			</div>
		);
	}
}

export default withAuth(Welcome);
