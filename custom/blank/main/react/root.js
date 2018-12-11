// @flow
// React imports
import * as React from 'react';

// Blank Element imports
import { RootNode, DocumentRoot } from '../node';

// Render & Mapping imports
import { ReactMap } from '../render';

// Blank Component imports (circular dependency)
import ChainComponent from './chain';

// Style imports // $FlowFixMe
import './styles/main.scss';

type RootProps = {};
type RootState = {};

class RootComponent extends React.Component<RootProps, RootState> {
	/*
		@ attributes
		root: RootNode
		chainRef: { current: null | ChainComponent }
		props: RootProps
		state: RootState
	*/

	node: RootNode; // eslint-disable-line
	chainRef: { current: null | ChainComponent };

	constructor(props: RootProps) {
		super(props);
		this.node = DocumentRoot;
		this.chainRef = { current: null };
	}

	componentDidMount(): void {
		// Only update ReactMap
		ReactMap.set(this.node, this);
	}

	shouldComponentUpdate(): boolean {
		// RootComponent will not render itself.
		return false;
	}

	componentWillUnmount(): void {
		// Update ReactMap
		ReactMap.delete(this.node);
	}

	render() {
		let chain = null;
		if (this.node.firstChild) {
			chain = <ChainComponent firstChild={this.node.firstChild} chainRef={this.chainRef} />;
		}
		return (
			<div
				className='blank-editor'
				contentEditable='true'
				role='textbox'
				spellCheck='true'
				autoCorrect='on'
				data-gramma='false'
			>
				<div className='blank-container'>
					{ chain }
				</div>
			</div>
		);
	}
}

export { RootComponent as default };
