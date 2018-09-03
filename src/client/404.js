import React from 'react';
import { Link } from 'react-router-dom';

const slat1 = {
	position: 'absolute',
	zIndex: '-1',
	top: '0',
	left: '20px',
	width: '100%',
	height: '50%'
};

const slat2 = {
	position: 'absolute',
	zIndex: '-1',
	top: '50%',
	right: '6px',
	width: '100%',
	height: '50%'
};

const slideInLeft = (el) => {
	TweenMax.fromTo(el, 0.5, {
		left: -80,
		opacity: 0
	}, {
		left: 20,
		opacity: 1,
		ease: Back.easeOut.config(1.4)
	});
};

const slideInRight = (el) => {
	TweenMax.fromTo(el, 0.5, {
		right: -94,
		opacity: 0
	}, {
		right: 6,
		opacity: 1,
		ease: Back.easeOut.config(1.4)
	});
};

class NoMatch extends React.Component {
	componentDidMount() {
		slideInLeft(this.slat1);
		slideInRight(this.slat2);
	}

	render() {
		return (
			<div>
				<div style={{ position: 'relative', width: '300px', margin: '0 auto 30px', textAlign: 'center' }}>
					<div style={{ color: 'white', fontSize: '64px' }}>404</div>
					<div className='slat' style={slat1} ref={(node) => { this.slat1 = node; }} />
					<div className='slat' style={slat2} ref={(node) => { this.slat2 = node; }} />
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

export default NoMatch;
