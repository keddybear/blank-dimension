// @flow
// React imports
import * as React from 'react';

// Blank Element imports
import { Leaf } from '../leaf';

// Blank Component imports
import renderLeaf from './leaves/basic';

// Render & Mapping imports
import { ReactMap, RenderFlags, AsyncRenderManager } from '../render';
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
		dirty: boolean
	*/

	leaf: Leaf; // eslint-disable-line
	selectRef: { current: null | React.ElementRef<*> };
	dirty: boolean;

	constructor(props: LeafProps) {
		super(props);
		this.leaf = this.props.leaf;
		this.selectRef = React.createRef();
		this.state = { update: false };
		this.dirty = false;
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
		this.leaf.dirty = RenderFlags.CLEAN;
	}

	shouldComponentUpdate(nextProps: LeafProps, nextState: LeafState): boolean {
		if (!nextState.update || !this.dirty) return false;
		if (this.leaf.dirty === RenderFlags.DIRTY_SELF) {
			this.leaf.dirty = RenderFlags.CLEAN;
			return true;
		}
		// Will not update
		this.leaf.dirty = RenderFlags.CLEAN;
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
		// Update BlankMap
		if (this.selectRef.current) {
			BlankMap.delete(this.selectRef.current);
		}
		// Update ReactMap
		if (this === ReactMap.get(this.leaf)) ReactMap.delete(this.leaf);
		// Set dirty to CLEAN
		this.leaf.dirty = RenderFlags.CLEAN;
		// Decrease ARM totalUpdates by 1 if marked dirty by setState
		if (this.dirty) AsyncRenderManager.totalUpdates -= 1;
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
