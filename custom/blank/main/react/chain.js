// @flow
// React imports
import * as React from 'react';

// Blank Element imports
import { Node, DocumentRoot } from '../node';
import { Leaf } from '../leaf';
import { instanceOf } from '../utils';

// Blank Component imports (circular dependency)
import NodeComponent from './node';
import LeafComponent from './leaf';

// Render imports
import { RenderFlags } from '../render';

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

type ChainProps = {	firstChild: Node | Leaf, chainRef: Object };
type ChainState = { update: boolean };

class ChainComponent extends React.Component<ChainProps, ChainState> {
	/*
		@ attributes
		first: Node | Leaf
		props: ChainProps
		state: ChainState
	*/

	first: Node | Leaf; // eslint-disable-line

	constructor(props: ChainProps) {
		super(props);
		this.first = this.props.firstChild;
		this.state = { update: false };
		// Update parent's chainRef
		this.props.chainRef.current = this;
	}

	shouldComponentUpdate(): boolean {
		// ChainComponent setState is called by render(), not by its parent.
		// If its parent is DIRTY_CHILDREN, render() will call setState on
		// the ChainComponent directly.
		if (this.state.update !== true) return false;
		this.state.update = false;
		if (this.first.parent === null) {
			if (DocumentRoot.dirty === RenderFlags.DIRTY_CHILDREN) {
				DocumentRoot.dirty = RenderFlags.CLEAN;
				return true;
			}
		} else if (this.first.parent.dirty === RenderFlags.DIRTY_CHILDREN) {
			this.first.parent.dirty = RenderFlags.CLEAN;
			return true;
		}
		return false;
	}

	render() {
		return (
			<React.Fragment>
				{ renderChain(this.first) }
			</React.Fragment>
		);
	}
}

export { ChainComponent as default };
