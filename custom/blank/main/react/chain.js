// @flow
// React imports
import * as React from 'react';

// Blank Element imports
import { Node, RootNode } from '../node';
import { Leaf } from '../leaf';
import { instanceOf } from '../utils';

// Blank Component imports (circular dependency)
import NodeComponent from './node';
import LeafComponent from './leaf';

// Render imports
import { RenderFlags, AsyncRenderManager } from '../render';

/*
	renderChain:
		- Return an array of NodeComponents or LeafComponents.
		- Each component will use Node or Leaf's id as key.
	@ params
		node: Node | Leaf | null
	@ return
		result: Array<NodeComponent | LeafComponent>
*/
function renderChain( // eslint-disable-line
	first: Node | Leaf | null
): Array<NodeComponent | LeafComponent> { // eslint-disable-line
	const result = [];
	if (instanceOf(first, 'Leaf')) {
		let l = first;
		while (l !== null) { // $FlowFixMe
			result.push(<LeafComponent key={l.id.toString()} leaf={l} />); // $FlowFixMe
			l = l.nextLeaf;
		}
	} else if (instanceOf(first, 'Node')) {
		let n = first;
		while (n !== null) { // $FlowFixMe
			result.push(<NodeComponent key={n.id.toString()} node={n} />); // $FlowFixMe
			n = n.nextNode;
		}
	}
	return result;
}

type ChainProps = {	parent: Node | RootNode, chainRef: Object };
type ChainState = { update: boolean };

class ChainComponent extends React.Component<ChainProps, ChainState> {
	/*
		@ attributes
		first: Node | Leaf
		parent: Node | null
		props: ChainProps
		state: ChainState
		dirty: boolean
	*/

	parent: Node | RootNode; // eslint-disable-line
	dirty: boolean;

	constructor(props: ChainProps) {
		super(props);
		this.parent = this.props.parent;
		this.state = { update: false };
		this.dirty = false;
		// Update parent's chainRef
		this.props.chainRef.current = this;
	}

	shouldComponentUpdate(nextProps: ChainProps, nextState: ChainState): boolean {
		// ChainComponent setState is called by render(), not by its parent.
		// If its parent is DIRTY_CHILDREN, render() will call setState on
		// the ChainComponent directly.
		if (!nextState.update || !this.dirty) return false;
		if (this.parent.dirty === RenderFlags.DIRTY) {
			this.parent.dirty = RenderFlags.DIRTY_SELF;
			return true;
		} else if (this.parent.dirty === RenderFlags.DIRTY_CHILDREN) {
			this.parent.dirty = RenderFlags.CLEAN;
			return true;
		}
		// Will not update
		this.dirty = false;
		AsyncRenderManager.totalUpdates -= 1;
		AsyncRenderManager.fire();
		return false;
	}

	componentDidUpdate() {
		this.state.update = false;
		this.dirty = false;
		AsyncRenderManager.totalUpdates -= 1;
		AsyncRenderManager.fire();
	}

	componentWillUnmount() {
		// Decrease ARM totalUpdates by 1 if marked dirty by setState
		if (this.dirty) AsyncRenderManager.totalUpdates -= 1;
	}

	render() {
		return (
			<React.Fragment>
				{ renderChain(this.parent.firstChild) }
			</React.Fragment>
		);
	}
}

export { ChainComponent as default };
