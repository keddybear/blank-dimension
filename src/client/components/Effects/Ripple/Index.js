import React from 'react';
// import { TweenMax } from 'gsap/TweenMax';
import './style.scss';

export default class Ripple extends React.Component {
	constructor(props) {
		super(props);
		this.ref = null;
		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(e, extraHandler) {
		const el 	= this.ref;
		const left 	= e.clientX - e.currentTarget.getBoundingClientRect().left;
		const top 	= e.clientY - e.currentTarget.getBoundingClientRect().top;
		const w 	= e.currentTarget.offsetWidth;
		const h 	= e.currentTarget.offsetHeight;
		const x1 	= Math.abs((w / 2) - left);
		const y1 	= Math.abs((h / 2) - top);
		const x2 	= (w / 2) + x1;
		const y2 	= (h / 2) + y1;
		const ratio = Math.sqrt((x2 ** 2) + (y2 ** 2));

		TweenMax.fromTo(el, 0.5, {
			x: left,
			y: top,
			transformOrigin: '50% 50%',
			scale: 0,
			opacity: 1
		}, {
			scale: ratio,
			opacity: 0
		});

		if (extraHandler) extraHandler();
	}

	render() {
		return (
			<div className='ripple-container' onClick={e => this.handleClick(e, this.props.extraClickHandler)} onKeyPress={() => {}} tabIndex='-1' role='button'>
				<svg className='ripple'>
					<circle ref={(el) => { this.ref = el; }} cx='0' cy='0' r='1' />
				</svg>
			</div>
		);
	}
}
