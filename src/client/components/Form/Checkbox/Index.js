import React from 'react';
import './styles.scss';

// This component is used with redux-form <Field />
// textComp is a component that defines text for the checkbox

const Checkbox = ({ input, type, textComp }) => (
	<div className='iblock'>
		<input type={type} id={input.name} className='inp-cbx' {...input} />
		<label htmlFor={input.name} className='cbx'>
			<span>
				<svg width='12px' height='10px'>
					<polyline points='1 6 4 9 10 1' />
				</svg>
			</span>
			{ textComp }
		</label>
	</div>
);

export default Checkbox;
