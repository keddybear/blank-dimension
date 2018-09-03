import React from 'react';
import { slideIn } from 'helpers/animations';

class NotImplemented extends React.Component {
	componentDidMount() {
		slideIn(this.node1);
	}

	render() {
		return (
			<div>
				<div style={{ position: 'relative', width: '300px', margin: 'auto', textAlign: 'center' }}>
					<div
						style={{ position: 'relative', display: 'inline-block', color: 'white' }}
						ref={(node) => { this.node1 = node; }}
					>
						<div
							className='slat'
							style={{
								position: 'absolute',
								zIndex: '-1',
								top: '0',
								left: '0',
								width: '100%',
								height: '100%'
							}}
						/>
						<div style={{ padding: '5px 25px', fontSize: '20px' }}>Page Unavailable</div>
					</div>
				</div>
			</div>
		);
	}
}

export default NotImplemented;
