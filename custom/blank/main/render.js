/*
	~ How React works ~

	First and foremost, a virtual DOM node in React is super light, just an object with a bunch of
	attributes representing what a real DOM node looks like.

	render() will create a virtual subtree starting at the root component and renders its children
	recursively. If a child's shouldComponentUpdate() is false, the render stops and a new virtual
	node will not be created. In its place is the ref to the old node.

	When the new virtual tree is complete, diff it with the old tree:

		1. No key: Compare at the same index.
		2. Has key:
			- If new key, create (mount).
			- If key is gone, destroy (unmount).
			- If key exists, compare with node that has the same key.
		3. Different type (div -> span):
			- Destroy and create current node.
			- Destroy and create children recursively.
		4. If same type, then check attributes and update if different.
			- Repeat Step 1 on children recursively.
		5. If same node as the old node (shouldComponentUpdate() is false), do nothing.
		6. If key exists, move the current node to its new position if necessary.
		7. Done.

	After diffing is done, update the real DOM.

	In React, the real DOM updates the exact same way as the virtual DOM does. Every HTML element has
	a corresponding React object. If the object is removed (unmounted), created (mounted), updated,
	or moved to a different position in the tree, the HTML element in the real DOM will do the exact
	same thing.

	NOTE TO SELF:

	React only remembers the keys for a node's children. I want React to remember the keys for all
	nodes in the Editor so it can reuse them from anywhere, and it's safe to do because all nodes in
	BlankEditor are guaranteed to have unqiue ids as their keys. Just a thought.
*/

/*
	~ How to render Blank Components with React ~

	The following are Blank Components:

		NodeComponent
			- Render one of many node-specific components depending on nodeType.
			- Each component must render ChainComponent if firstChild is not null.
		ChainComponent
			- Render an array of NodeComponents or LeafComponents.
		LeafComponent
			- Render one of many leaf-specific components depending on type.

	Each Node is mapped to a NodeComponent, and each Leaf is mapped to a LeafComponent. Since all of
	them use their unique ids as the keys for their Blank Components, React will create if key is new,
	or destroy if key is gone, or update if key exists.

	Create (Mount):
		- Newly created Nodes and Leaves are new, and they are always created (mounted), because
		  they have new ids. Set them to old in componentDidMount().
		- Map Node or Leaf to the new component in componentDidMount().

	Destroy (Unmount):
		- Delete the mapping in componentWillUnmount().

	Update (Re-render): shouldComponentUpdate() will handle	this.
		- unchain() will mark a Node as DIRTY_SELF or DIRTY_CHILDREN or DIRTY, and Leaf as DIRTY_SELF.
			- Node with DIRTY_SELF will render() but its ChainComponent will not.
			- Node with DIRTY_CHILDREN will call render() on its ChainComponent while it will not
			  update itself.
			- Node with DIRTY will do both.
			- Since Leaf does not have children, it will only update itself.

	In the case of Update, the component's Node or Leaf should be old and should be the same Node or
	Leaf.
*/

/*
	~ How to mark Blank Element dirty ~

	unchainNode()

	Node: DIRTY_CHILDREN -> Node's parent
	NullNode: DIRTY_CHILDREN -> NullNode's prevNode or nextNode's parent
	NodeChain: DIRTY_CHILDREN -> NodeChain's startNode's parent
	NodeStyles: DIRTY_SELF -> Node
	ParentLink: DIRTY_CHILDREN -> ParentLink's parent
	NodeType: DIRTY_SELF -> Node
	PhantomNode: DIRTY_CHILDREN -> PhantomNode's parent, DIRTY_CHILDREN -> Node's parent
	PhantomChain: DIRTY_CHILDREN -> PhantomChain's parent, DIRTY_CHILDREN -> Node's parent

	unchainLeaf()

	Leaf: DIRTY_CHILDREN -> Leaf's parent
	NullLeaf: DIRTY_CHILDREN -> NullLeaf's prevLeaf or nextLeaf's parent
	LeafChain: DIRTY_CHILDREN -> LeafChain's startLeaf's parent
	LeafText: DIRTY_SELF -> Leaf

	In unchain(), mark target Blank Element as dirty, and push it into RenderStack. If its
	renderPos is not null, it means it's already in stack. Move it to the end by push and
	delete at its renderPos, unless it's already at the end. Update renderPos. (RenderStack
	will have "undefined" value, but much faster than using splice.)

	After an Action is complete, start rendering everything in RenderStack.
		- Pop Blank Element, and set its renderPos to null.
		- Get its React component through ReactMap.
		- If component exists:
			- If DIRTY_SELF or DIRTY, call setState({ update: true }).
			- If DIRTY_CHILDREN, get its chain component and call setState({ update: true }).
	React:
		- Component checks shouldComponentUpdate().
			- If component is NodeComponent and its Blank Element is either DIRTY_SELF or DIRTY,
			  return true and set its Blank Element dirty attribute to null.
			- If component is ChainComponent and its Blank Element is DIRTY_CHILDREN, return true
			  and set its Blank Element dirty attribute to null.
			- If component is LeafComponent and its Blank Element is DIRTY_SELF, return true and
			  set its Blank Element dirty attribute to null.

	Since only Blank Elements in the tree can be unchained, the order of Blank Elements in
	RenderStack should ensure that those updated first are higher in the Branch, and if some are
	not, it means they are separate subtrees. For example, a child can update before its parent,
	because once updated, the child will return false in shouldComponentUpdate(). There should
	not be a scenario where the updated child will be unmounted when the parent	updates, because
	it would mean the child was unchained after its parent was unchained.

	Mounting and unmounting happen in ChainComponent updates.

	In componentWillUnmount(), set dirty to CLEAN.
*/

/*
	~ Mapping between DOM and Blank Element ~

	There are two WeakMaps:
		1. BlankMap
		2. ReactMap

	BlankMap maps a HTMLElement to a Node or Leaf, used by selection.
	ReactMap maps a Node or Leaf to a Blank Component, used by render and selection.

	BlankMap:
		- Mapping is set in componentDidMount() of a LeafComponent or NodeComponent. The
		  HTMLElement is the one with the right data-attrbiute.
		- Mapping is cleared in componentWillUnmount().

	ReactMap:
		- Mapping is set in componentDidMount() of a LeafComponent, NodeComponent, or
		  RootComponent. It maps its node or leaf or root to itself.
		- Mapping is cleared in componentWillUnmount().

	Since each Blank Component, except for ChainComponent, will store a ref to the HTMLElement
	with the Node or Leaf-specific data-attribute, BlankMap and ReactMap effectively form a
	two-way map - they have defeated the purpose of being "weak", so deleting their records
	explicitly is required.
*/

/*
	~ Complete Render Cycle ~

	1. onSelectionChange:
		- If SELECTION_FROM_BS is true, BAS becomes PAS.
		- If not, BAS becomes the current BlankSelection.
			- CONTINUOUS_ACTION is set to false.
	2. Perform Actions on BAS.
		- Set IS_COMPOSING to true.
		- Actions will unchain Nodes and Leaves. In unchain(), markBlankElementDirty() will
		  push dirty Blank Elements into RenderStack.
	3. After all Actions are complete, render() will go through RenderStack and call
	   setState({ update: true }) on each dity Blank Element.
	   	- Actual rendering is handled by Blank Components.
	4. After rendering is done, set window selection and BAS from PAS.
*/

// @flow
import { Node, NullNode, NodeChain, NodeStyles, NodeType, PhantomNode, PhantomChain, RootNode, DocumentRoot } from './node';
import { Leaf, NullLeaf, LeafChain, ParentLink, LeafText } from './leaf';
import { instanceOf } from './utils';

// React typing imports
import * as React from 'react';

export const RenderFlags = {
	CLEAN: 0,
	DIRTY_SELF: 1,
	DIRTY_CHILDREN: 2,
	DIRTY: 3
};

let RenderStackExists = false;
class BlankRenderQueue {
	/*
		BlankRenderQueue is used to queue up Blank Element whose Blank Component needs to be
		rendered. Nodes and Leaves in the queue will have their renderPos and dirty updated.

		If a Node or Leaf is already in queue, pushing it will move it to the end of the
		queue.

		BlankRenderQueue's clear() method only clears the stack when there are only undefined
		values left, because it needs to set all elements' renderPos to null. render() should
		clear the queue.

		A low priority queue stores Blank Elements that are DIRTY_SELF. Its elements will be
		popped after the main queue is emptied.

		If a Blank Element is changed from DIRTY_SELF to DIRTY, it will be moved from the
		low priority to the main queue. Its original position will be replaced by undefined.
	*/

	/*
		@ attributes
		queue: Array<Node | RootNode | Leaf>
		queueLow: Array<Node | RootNode | Leaf>
		realMainSize: number
		realLowSize: number
		realSize: number
	*/
	queue: Array<?Node | ?RootNode | ?Leaf>;
	queueLow: Array<?Node | ?RootNode | ?Leaf>;
	realSize: { high: number, low: number };

	/*
		@ methods
		push
		pop
		length
		size
		clear
	/*
		constructor
	*/
	constructor() {
		if (RenderStackExists === true) {
			throw new Error('Only one instance of BlankRenderQueue can be created.');
		}
		RenderStackExists = true;

		this.queue = [];
		this.queueLow = [];
		this.realSize = { high: 0, low: 0 };
	}

	/*
		push:
			- Push a Node or Leaf into the queue, and update their renderPos.
			- If the Node or Leaf's renderPos is not null, delete the element at RenderPos,
			  push the Node or Leaf, and update their renderPos.
				- Do nothing if the Node or Leaf is already at the end of the queue.
			- If DIRTY_SELF, push it into the low queue. If DIRTY or DIRTY_CHILDREN, push
			  it in the main queue.
				- If DIRTY element exists in low queue, move it to the main queue and
				  replace its original position with undefined.
		@ params
			el: Node | Leaf
	*/
	push(el: Node | Leaf | RootNode): void {
		let q = this.queue;
		let oq = this.queueLow;
		let qc = 'high';
		let oqc = 'low';
		if (el.dirty === RenderFlags.DIRTY_SELF) {
			q = this.queueLow;
			oq = this.queue;
			qc = 'low';
			oqc = 'high';
		}

		// Check if el already exists in a queue
		if (el.renderPos !== null) {
			if (q.length === 0 || el.renderPos !== q.length - 1) {
				// Check if el is in a different queue
				if (q[el.renderPos] === el) {
					q[el.renderPos] = undefined;
				} else {
					if (oq[el.renderPos] !== el) {
						throw new Error('A Blank Element has renderPos but is not in any render queue.');
					}
					oq[el.renderPos] = undefined;
					this.realSize[qc] += 1;
					this.realSize[oqc] -= 1;
				}
				el.renderPos = q.length; // eslint-disable-line
				// $FlowFixMe
				q.push(el);
			}
		} else {
			el.renderPos = q.length; // eslint-disable-line
			// $FlowFixMe
			q.push(el);
			this.realSize[qc] += 1;
		}
	}

	/*
		pop:
			- Pop the next Node or Leaf, skipping undefined. And set their renderPos to
			  null.
			- Pop from the main queue, then the low priority queue.
		@ return
			el: Node | Leaf | RootNode | undefined
	*/
	pop(): ?Node | ?Leaf | ?RootNode {
		let el;
		// Pop from the main queue first
		while (!el && this.realSize.high > 0) {
			el = this.queue.pop();
			if (el !== undefined) {
				this.realSize.high -= 1;
			}
		}
		// Pop from the low priority queue
		while (!el && this.realSize.low > 0) {
			el = this.queueLow.pop();
			if (el !== undefined) {
				this.realSize.low -= 1;
			}
		}
		// Reduce size counter by 1
		if (el && typeof el === 'object' && el.renderPos !== undefined) {
			el.renderPos = null;
		}
		return el;
	}

	/*
		length:
			- Get the length of the queue, including undefined values.
		@ return
			len: number
	*/
	length(): number {
		return this.queue.length;
	}

	/*
		size:
			- Get the size of the queue, ignoring undefined values.
		@ return
			size: number
	*/
	size(): number {
		return this.realSize.high + this.realSize.low;
	}

	/*
		clear:
			- Clear the queue by setting its length to 0.
			- Do nothing if there's still Blank Elements in the queue.
	*/
	clear(): void {
		if (this.realSize.high === 0) this.queue.length = 0;
		if (this.realSize.low === 0) this.queueLow.length = 0;
	}
}

export const RenderStack = new BlankRenderQueue();

/*
	markDirtyForRender:
		- Mark a Blank Element as DIRTY_SELF, DIRTY_CHILDREN, or DIRTY.
		- If a Blank Element is already DIRTY_SELF or DIRTY_CHILDREN, marking with the
		  other flag will mark it as DIRTY.
		- Do nothing if applying the same flag, or already DIRTY, or flag is CLEAN.
	@ params
		el: Node | Leaf | RootNode
		flag: number
*/
export function markDirtyForRender(el: Node | Leaf | RootNode, flag: number): void {
	if (flag !== RenderFlags.CLEAN && el.dirty !== flag && el.dirty !== RenderFlags.DIRTY) {
		el.dirty += flag; // eslint-disable-line
	}
}

/*
	markBlankElementDirty:
		- Given a unchained entity, mark the target Blank Element dirty, and push it
		  into RenderStack.
	@ param
		el: Leaf | NullLeaf | LeafChain | LeafText
			Node | NullNode | NodeChain | NodeStyles | ParentLink | NodeType |
			PhantomNode | PhantomChain
*/
export function markBlankElementDirty( // eslint-disable-line
	el: Leaf | NullLeaf | LeafChain | LeafText | Node | NullNode | NodeChain |
	NodeStyles | ParentLink | NodeType | PhantomNode | PhantomChain
): void { // eslint-disable-line
	// Note to self: I probably should've used enum for identity check, so I can switch...
	const e = el;

	if (instanceOf(e, 'Leaf')) {
		// Leaf: DIRTY_CHILDREN -> Leaf's parent // $FlowFixMe
		const p = e.parent;
		if (p !== null) {
			markDirtyForRender(p, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(p);
		}
	} else if (instanceOf(e, 'NullLeaf')) {
		// NullLeaf: DIRTY_CHILDREN -> NullLeaf's prevLeaf or nextLeaf's parent // $FlowFixMe
		const l = e.prevLeaf || e.nextLeaf;
		if (l !== null && l.parent !== null) { // $FlowFixMe
			markDirtyForRender(l.parent, RenderFlags.DIRTY_CHILDREN); // $FlowFixMe
			RenderStack.push(l.parent);
		}
	} else if (instanceOf(e, 'LeafChain')) {
		// LeafChain: DIRTY_CHILDREN -> LeafChain's startLeaf's parent // $FlowFixMe
		const p = e.startLeaf.parent;
		if (p !== null) {
			markDirtyForRender(p, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(p);
		}
	} else if (instanceOf(e, 'LeafText')) {
		// LeafText: DIRTY_SELF -> Leaf // $FlowFixMe
		const l = e.leaf;
		if (l !== null) {
			markDirtyForRender(l, RenderFlags.DIRTY_SELF);
			RenderStack.push(l);
		}
	} else if (instanceOf(e, 'Node')) {
		// Node: DIRTY_CHILDREN -> Node's parent // $FlowFixMe
		const p = e.parent;
		if (p !== null) {
			markDirtyForRender(p, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(p);
		} else {
			markDirtyForRender(DocumentRoot, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(DocumentRoot);
		}
	} else if (instanceOf(e, 'NullNode')) {
		// NullNode: DIRTY_CHILDREN -> NullNode's prevNode or nextNode's parent // $FlowFixMe
		const n = e.prevNode || e.nextNode;
		if (n !== null) {
			if (n.parent !== null) { // $FlowFixMe
				markDirtyForRender(n.parent, RenderFlags.DIRTY_CHILDREN); // $FlowFixMe
				RenderStack.push(n.parent);
			} else {
				markDirtyForRender(DocumentRoot, RenderFlags.DIRTY_CHILDREN);
				RenderStack.push(DocumentRoot);
			}
		}
	} else if (instanceOf(e, 'NodeChain')) {
		// NodeChain: DIRTY_CHILDREN -> NodeChain's startNode's parent // $FlowFixMe
		const p = e.startNode.parent;
		if (p !== null) {
			markDirtyForRender(p, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(p);
		} else {
			markDirtyForRender(DocumentRoot, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(DocumentRoot);
		}
	} else if (instanceOf(e, 'NodeStyles')) {
		// NodeStyles: DIRTY_SELF -> Node // $FlowFixMe
		const n = e.ref;
		if (n !== null) {
			markDirtyForRender(n, RenderFlags.DIRTY_SELF);
			RenderStack.push(n);
		}
	} else if (instanceOf(e, 'ParentLink')) {
		// ParentLink: DIRTY_CHILDREN -> ParentLink's parent // $FlowFixMe
		const p = e.parent;
		if (p !== null) {
			markDirtyForRender(p, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(p);
		} else {
			markDirtyForRender(DocumentRoot, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(DocumentRoot);
		}
	} else if (instanceOf(e, 'NodeType')) {
		// NodeType: DIRTY_SELF -> Node // $FlowFixMe
		const n = e.ref;
		if (n !== null) {
			markDirtyForRender(n, RenderFlags.DIRTY_SELF);
			RenderStack.push(n);
		}
	} else if (instanceOf(e, 'PhantomNode')) {
		// PhantomNode: DIRTY_CHILDREN -> PhantomNode's parent, DIRTY_CHILDREN -> Node's parent
		// $FlowFixMe
		const n = e.ref; // n is the current Node, and e is the ghost.
		// Current parent // $FlowFixMe
		if (n.parent !== null) {
			markDirtyForRender(n.parent, RenderFlags.DIRTY_CHILDREN); // $FlowFixMe
			RenderStack.push(n.parent);
		} else {
			markDirtyForRender(DocumentRoot, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(DocumentRoot);
		}
		// Old parent
		if (e.parent !== null) { // $FlowFixMe
			markDirtyForRender(e.parent, RenderFlags.DIRTY_CHILDREN); // $FlowFixMe
			RenderStack.push(e.parent);
		} else {
			markDirtyForRender(DocumentRoot, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(DocumentRoot);
		}
	} else if (instanceOf(e, 'PhantomChain')) {
		// PhantomChain: DIRTY_CHILDREN -> PhantomChain's parent, DIRTY_CHILDREN -> Node's parent
		// $FlowFixMe
		const n = e.startNode.ref;
		// Current parent // $FlowFixMe
		if (n.parent !== null) {
			markDirtyForRender(n.parent, RenderFlags.DIRTY_CHILDREN); // $FlowFixMe
			RenderStack.push(n.parent);
		} else {
			markDirtyForRender(DocumentRoot, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(DocumentRoot);
		}
		// Old parent // $FlowFixMe
		if (e.startNode.parent !== null) { // $FlowFixMe
			markDirtyForRender(e.startNode.parent, RenderFlags.DIRTY_CHILDREN); // $FlowFixMe
			RenderStack.push(e.startNode.parent);
		} else {
			markDirtyForRender(DocumentRoot, RenderFlags.DIRTY_CHILDREN);
			RenderStack.push(DocumentRoot);
		}
	}
}

let BlankComponentMapExists = false;
class BlankComponentMap {
	/*
		BlankComponentMap is a WeakMap implementation that stores the mapping between
		Leaf/Node and a React Component.

		Only one such map can be created for one BlankEditor.

		IMPORTANT:
		BlankComponentMap and BlankElementMap form a two-way mapping. As a result,
		their records need to be deleted manually.
	*/

	/*
		@ attributes
		wm: WeakMap object
	*/
	wm: WeakMap<Node | Leaf | RootNode, React.Component<*>>;

	/*
		@ methods
		clear
		delete
		get
		has
		set
	*/

	/*
		constructor
	*/
	constructor() {
		if (BlankComponentMapExists === true) {
			throw new Error('Only one instance of BlankComponentMap can be created.');
		}
		BlankComponentMapExists = true;

		this.wm = new WeakMap();
	}

	clear() {
		this.wm = new WeakMap();
	}

	delete(k: Node | Leaf | RootNode) {
		return this.wm.delete(k);
	}

	get(k: Node | Leaf | RootNode) {
		return this.wm.get(k);
	}

	has(k: Node | Leaf | RootNode) {
		return this.wm.has(k);
	}

	set(k: Node | Leaf | RootNode, v: any) {
		this.wm.set(k, v);
		return this;
	}
}

export const ReactMap = new BlankComponentMap();

/*
	render:
		- Iterate through RenderStack and use ReactMap to find each Blank Element's React
		  Component, and call setState on the component depending on its Blank Element's
		  dirty attribute.
		  	- If DIRTY_SELF:
		  		- Node:
		  		- Leaf:
		  	- If DIRTY_CHILDREN:
		  		- Root:
		  		- Node:
		  	- If DIRTY:
				- Root:
				- Node:
			- If CLEAN, do nothing.
		- RenderStack must be cleared.
*/
export function render(): void {
	while (RenderStack.size() > 0) {
		const el = RenderStack.pop();
		// Check dirty
		if (el) {
			const comp = ReactMap.get(el);
			if (comp) {
				switch (el.dirty) {
					case RenderFlags.DIRTY_SELF: {
						if (instanceOf(el, 'Leaf')) {
							// $FlowFixMe
							comp.setState({ update: true });
						} else if (instanceOf(el, 'Node')) {
							// $FlowFixMe
							comp.setState({ update: true });
						} else {
							// Clean dirty just in case
							el.dirty = RenderFlags.CLEAN;
						}
						break;
					}
					case RenderFlags.DIRTY_CHILDREN: {
						if (instanceOf(el, 'RootNode')) { // $FlowFixMe
							if (comp.chainRef.current) { // $FlowFixMe
								comp.chainRef.current.setState({ update: true });
							}
						} else if (instanceOf(el, 'Node')) { // $FlowFixMe
							if (comp.chainRef.current) { // $FlowFixMe
								comp.chainRef.current.setState({ update: true });
							}
						} else {
							// Clean dirty just in case
							el.dirty = RenderFlags.CLEAN;
						}
						break;
					}
					case RenderFlags.DIRTY: {
						if (instanceOf(el, 'Node')) {
							// $FlowFixMe
							comp.setState({ update: true });
						} else {
							// Clean dirty just in case
							el.dirty = RenderFlags.CLEAN;
						}
						break;
					}
					default: {
						break;
					}
				}
			}
		}
	}
	// Cleanup - remaining values are undefined
	RenderStack.clear();
}
