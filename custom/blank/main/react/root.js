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
		containerRef: { current: null | React.ElementRef<*> }
		props: RootProps
		state: RootState
	*/

	node: RootNode; // eslint-disable-line
	chainRef: { current: null | ChainComponent };
	containerRef: { current: null | React.ElementRef<*> };

	constructor(props: RootProps) {
		super(props);
		this.node = DocumentRoot;
		this.chainRef = { current: null };
		this.containerRef = React.createRef();
	}

	componentDidMount(): void {
		// Only update ReactMap
		ReactMap.set(this.node, this);
		// Assign DocumentRoot.container
		DocumentRoot.container = this.containerRef.current;
	}

	shouldComponentUpdate(): boolean {
		// RootComponent will not render itself.
		return false;
	}

	componentDidCatch(error: any) { // eslint-disable-line
		console.log(error);
	}

	componentWillUnmount(): void {
		// Update ReactMap
		ReactMap.delete(this.node);
	}

	render() {
		let chain = null;
		if (this.node.firstChild) {
			chain = <ChainComponent parent={this.node} chainRef={this.chainRef} />;
		}
		return (
			<div
				className='blank-editor'
				contentEditable='true'
				role='textbox'
				spellCheck='true'
				autoCorrect='on'
				data-gramma='false'
				suppressContentEditableWarning
			>
				<div className='blank-container' ref={this.containerRef}>
					{ chain }
				</div>
			</div>
		);
	}
}

export { RootComponent as default };
