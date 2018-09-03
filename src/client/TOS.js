import React from 'react';
import { Link } from 'react-router-dom';
import { smoothEnter } from 'helpers/animations';

class TOS extends React.Component {
	componentDidMount() {
		smoothEnter(this.root);
	}

	render() {
		return (
			<div ref={(node) => { this.root = node; }}>
				<div
					style={{
						color: '#9290ff',
						textAlign: 'center',
						margin: '50px'
					}}
				>
					<h1>Terms of Service</h1>
					<h3><i>Placeholder</i></h3>
				</div>
				<Link
					to='/'
					style={{
						display: 'block',
						color: 'white',
						backgroundColor: '#9290ff',
						width: '100px',
						textAlign: 'center',
						padding: '10px',
						borderRadius: '5px',
						margin: 'auto',
						textDecoration: 'none'
					}}
				>
					Home
				</Link>
			</div>
		);
	}
}

export default TOS;
