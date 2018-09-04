import React from 'react';
import Loadable from 'react-loadable';

const DynamicImport = Loadable({
	loader: () => import('./Index'),
	loading() {
		return <div>Loading...</div>;
	}
});

class DynamicComponent extends React.Component {
	render() {
		return <DynamicImport />;
	}
}

export default DynamicComponent;
