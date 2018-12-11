// @flow
// React imports
import * as React from 'react';

// Blank Element imports
import { Leaf } from '../leaf';

// Blank Component imports
import renderLeaf from './leaves/basic';

// Render & Mapping imports
import { ReactMap, RenderFlags } from '../render';
import { BlankMap } from '../selection';

type LeafProps = { leaf: Leaf };
type LeafState = { update: boolean };

class LeafComponent extends React.Component<LeafProps, LeafState> {
	/*
		@ attributes
		leaf: Leaf
		selectRef: Object - { current: null }
		props: LeafProps
		state: LeafState
	*/

	leaf: Leaf; // eslint-disable-line
	selectRef: { current: null | React.ElementRef<*> };

	constructor(props: LeafProps) {
		super(props);
		this.leaf = this.props.leaf;
		this.selectRef = React.createRef();
		this.state = { update: false };
	}

	componentDidMount() {
		// Set Leaf to old
		this.leaf.new = false;
		// Update BlankMap
		if (this.selectRef.current) {
			BlankMap.set(this.selectRef.current, this.leaf);
		}
		// Update ReactMap
		ReactMap.set(this.leaf, this);
	}

	shouldComponentUpdate(): boolean {
		if (this.state.update !== true) return false;
		this.state.update = false;
		if (this.leaf.dirty === RenderFlags.DIRTY_SELF) {
			this.leaf.dirty = RenderFlags.CLEAN;
			return true;
		}
		this.leaf.dirty = RenderFlags.CLEAN;
		return false;
	}

	componentWillUnmount() {
		// Update BlankMap
		if (this.selectRef.current) {
			BlankMap.delete(this.selectRef.current);
		}
		// Update ReactMap
		ReactMap.delete(this.leaf);
		// Set dirty to CLEAN
		this.leaf.dirty = RenderFlags.CLEAN;
	}

	render() {
		return (
			<React.Fragment>
				{ renderLeaf(this.leaf, this.selectRef) }
			</React.Fragment>
		);
	}
}

export { LeafComponent as default };
