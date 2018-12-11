// @flow
// React imports
import * as React from 'react';

// Blank Element imports
import { Node } from '../node';

// Blank Component imports (circular dependency)
import ChainComponent from './node';
import renderNode from './nodes/basic';

// Render & Mapping imports
import { ReactMap, RenderFlags } from '../render';
import { BlankMap } from '../selection';

type NodeProps = { node: Node };
type NodeState = { update: boolean };

class NodeComponent extends React.Component<NodeProps, NodeState> {
	/*
		@ attributes
		node: Node
		chainRef: { current: null | ChainComponent }
		selectRef: Object - default: { current: null }
		props: NodeProps
		state: NodeState
	*/

	node: Node; // eslint-disable-line
	chainRef: { current: null | ChainComponent };
	selectRef: { current: null | React.ElementRef<*> };

	constructor(props: NodeProps) {
		super(props);
		this.node = this.props.node;
		this.chainRef = { current: null };
		this.selectRef = React.createRef();
		this.state = { update: false };
	}

	componentDidMount() {
		// Set Node to old
		this.node.new = false;
		// Update BlankMap
		if (this.selectRef.current) {
			BlankMap.set(this.selectRef.current, this.node);
		}
		// Update ReactMap
		ReactMap.set(this.node, this);
	}

	shouldComponentUpdate(): boolean {
		if (this.state.update !== true) return false;
		this.state.update = false;
		if (this.node.dirty === RenderFlags.DIRTY_SELF) {
			this.node.dirty = RenderFlags.CLEAN;
			return true;
		} else if (this.node.dirty === RenderFlags.DIRTY) {
			this.node.dirty = RenderFlags.DIRTY_CHILDREN;
			return true;
		}
		return false;
	}

	componentWillUnmount() {
		// Update BlankMap
		if (this.selectRef.current) {
			BlankMap.delete(this.selectRef.current);
		}
		// Update ReactMap
		ReactMap.delete(this.node);
		// Set dirty to CLEAN
		this.node.dirty = RenderFlags.CLEAN;
	}

	render() {
		let chain = null;
		if (this.node.firstChild) { // $FlowFixMe
			chain = <ChainComponent firstChild={this.node.firstChild} chainRef={this.chainRef} />;
		}
		return (
			<React.Fragment>
				{ renderNode(this.node, this.selectRef, chain) }
			</React.Fragment>
		);
	}
}

export { NodeComponent as default };
