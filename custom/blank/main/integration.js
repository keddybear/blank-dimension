import { Node, NodeStyles, NullNode, NodeChain, NodeType, BranchType, PhantomNode, PhantomChain, DocumentRoot } from './node';
import { Leaf, LeafStyles, NullLeaf, LeafChain, LeafText, ParentLink } from './leaf';
import { History, BlankHistoryStep } from './history';

/*
	Before you begin writing functions, each function should be assigned a responsibility, and it
	should strictly adhere to the definition of that responsibility. Any violation of this will
	cause unforseeable bugs in the future.

	Responsibilities:

	History
		YES:
			- It stores history steps and push and pop them, and decides when to clear its history
			  stacks.
		NO:
			- It does not decide when to push or pop.

	Action
		YES:
			- It performs Node and Leaf changes, and makes sure TempHistoryPastStep and
			  TempHistoryFutureStep have elements that, when iterated through, can be used to undo
			  those changes.
		NO:
			- It does not decide when to push history steps into history stacks.

	User Action
		YES:
			- It comprises of the current user selection and an action command that triggers an
			  Action.
			- It decides when to push history steps into history stacks.
			- A User Action will produce a new user selection, after the action is done. The new
			  user selection can be the same as the previous one.
		NO:
			- It does not decide how an Action will be performed.
*/

/*
	INDEX

	- Utils
	- Basic Node Ops
	- Basic Leaf Ops
	- Basic History Ops
	- Basic Node Chaining Ops
	- Basic Leaf Chaining Ops
	- Advanced Node Chaining Ops
	- Advanced Leaf Chaining Ops
	- Node Action Ops
	- Leaf Action Helpers
	- Leaf Action Ops
	- History Action Ops
*/

//= Utils

/*
	instanceOf
*/

/*
	instanceOf:
		- Used to replace instanceof, which is slow according to jsPerf: https://jsperf.com/instanceof-vs-undefined
		- It expects the variable v to have an "identity" attribute, and compares it against
		  its identity name.
		- Though not the fastest, this function exists for maintenance reason.
	@ params
		v: mixed
		k: String
	@ return
		bool: Boolean
*/
export function instanceOf(v: mixed, k: string): boolean {
	return v[k] !== undefined;
}

//= Basic Node Ops

/*
	sameNodeStyles
	setNodeStyles
	copyNodeStyles
	getNextLeafChain
	findNextLeafChain
	getBranchType
	getBranchTypeFromArray
	compareBranchType
	setFirstChild
	printNodeTree (TODO)
*/

/*
	sameNodeStyles:
		- Compare the styles of two Nodes.
	@ params
		n1: Node object
		n2: Node object
	@ return
		Boolean
*/
export function sameNodeStyles(n1: Node, n2: Node): boolean {
	if (n1 === null || n2 === null) return false;
	if (n1 === n2) return true;
	return n1.styles.hash === n2.styles.hash;
}

/*
	setNodeStyles:
		- Create a new NodeStyles object for a Node from a NodeStyles object
	@ params
		node: Node object
		styles: NodeStyles object
*/
export function setNodeStyles(node: Node, styles: NodeStyles): void {
	const n = node;
	const { ...styleProps } = styles;
	n.styles = new NodeStyles({ ...styleProps });
}

/*
	copyNodeStyles:
		- Copy one Node's styles to another, by creating a new NodeStyles object
	@ params
		node: Node object
		nodeToCopy: Node object
*/
export function copyNodeStyles(node: Node, nodeToCopy: Node): void {
	const n = node;
	const { ...styleProps } = nodeToCopy.styles;
	n.styles = new NodeStyles({ ...styleProps });
}

/*
	getNextLeafChain:
		- Find the next LeafChain to the current one in the document tree, and return
		  the first Leaf of that chain.
		- The Leaf as the parameter does not have to be the first Leaf of the current
		  LeafChain.
	@ params
		leaf: Leaf object
	@ return
		lc: Leaf | null
*/
export function getNextLeafChain(leaf: Leaf): Leaf | null {
	// Go up the parent and find next Node
	let p = leaf.parent;
	if (p === null) return null;
	while (p.nextNode === null) {
		p = p.parent;
		// No more parent
		if (p === null) return null;
	}
	// Next Node found
	p = p.nextNode;
	// Go down the child and find the Leaf
	let c = p.firstChild;
	while (!instanceOf(c, 'Leaf')) {
		c = c.firstChild;
	}
	return c;
}

/*
	findNextLeafChain:
		- It finds the next LeafChain Like getNextLeafChain(), but it takes an additional
		  BranchType argument and modifies as it traverses the tree.
		  	- The BranchType must the Leaf's BranchType.
		- Modifies the "branch" and returns the first Leaf of the next LeafChain.
		  BranchType.
	@ params
		leaf: Leaf object
		branch: BranchType object
	@ return
		leaf: Leaf | null
*/
export function findNextLeafChain(leaf: Leaf, branch: BranchType): Leaf | null {
	const b = branch.branch;
	// Go up the parent and find next Node
	let p = leaf.parent;
	while (p.nextNode === null) {
		// No more parent
		if (p === null) return null;
		// Get parent
		p = p.parent;
		b.pop();
	}
	// Next Node found
	p = p.nextNode;
	b[b.length - 1] = new NodeType(p.nodeType, p);
	// Go down the child and find the Leaf
	let c = p.firstChild;
	while (!instanceOf(c, 'Leaf')) {
		b.push(new NodeType(c.nodeType, c));
		c = c.firstChild;
	}
	return c;
}

/*
	getBranchType:
		- Return a Leaf's BranchType, by traversing up its parents.
	@ params
		leaf: Leaf object
	@ return
		bt: BranchType object
*/
export function getBranchType(leaf: Leaf): BranchType {
	let p = leaf.parent;
	const bt = new BranchType();
	while (p !== null) {
		bt.branch.unshift(new NodeType(p.nodeType, p));
		p = p.parent;
	}
	return bt;
}

/*
	getBranchTypeFromArray:
		- Turn an array of numbers into a BranchType.
	@ params
		branch: Array<number>
	@ return
		bt: BranchType object
*/
export function getBranchTypeFromArray(branch: Array<number>): BranchType {
	const bt = new BranchType();
	for (const t of branch) {
		bt.branch.push(new NodeType(t, null));
	}
	return bt;
}

/*
	compareBranchType:
		- Compare BranchType A with BranchType B, and return the index of the first different
		  NodeType in BranchType A, or -1 if none.
		- There are two ways to compare BranchTypes:
			1. Shallow-compare only checks NodeType's type.
			2. Deep-compare checks both NodeType.type and its Node reference, except for the
			   last NodeType, whose Node ref is ignored.
			   - If Node reference is null, there's no need to check.
		- If BranchTypes have different lengths, return the smaller length - 1.
	@ params
		branchA: BranchType object
		branchB: BranchType object
		shallow: Boolean - default: true
	@ return
		index: Number
*/
export const _SHALLOW_ = true;
export const _DEEP_ = false;
export function compareBranchType(
	branchA: BranchType,
	branchB: BranchType,
	shallow: boolean = true
): number {
	const ba = branchA.branch;
	const bb = branchB.branch;
	if (ba.length !== bb.length) return Math.min(ba.length, bb.length) - 1;

	for (let i = 0; i < ba.length; i += 1) {
		if (ba[i].type !== bb[i].type) return i;
		if (!shallow && i < ba.length - 1) {
			if (ba[i].ref !== null && bb[i].ref !== null && ba[i].ref !== bb[i].ref) return i;
		}
	}

	return -1;
}

/*
	setFirstChild:
		- A simple method to set the first child of a parent, automatically handling Node and
		  DocumentRoot.
		- It does not set the parent of the child. To set parent, use setParentNode() instead.
		- It does not unchain anything or check if the parent already has a first child. It
		  will overwrite it. To unchain the parent link, use setParentLink() instead.
	@ params
		parent: Node | null
		child: Node | Leaf
*/
export function setFirstChild(parent: Node | null, child: Node | Leaf): void {
	const p = parent;
	if (p === null) {
		DocumentRoot.firstChild = child;
	} else {
		p.firstChild = child;
	}
}

/*
	printNodeTree:
		- Print the tree starting from a Node.
*/
export function printNodeTree(node: Node): void {
	// TODO
}

//= Basic Leaf Ops

/*
	sameLeafStylesOld
	sameLeafStyles
	setLeafStyles
	copyLeafStyles
	printLeafStyles
	printLeafChain
	isZeroLeaf
	trimRange
	destroyLeaf
*/

/*
	sameLeafStylesOld:
		- Compare the styles of two Leaves, return true if all styles are the same, else false.
		- There are better/faster ways to compare two LeafStyles (see sameLeafStyles)
	@ params
		l1: Leaf object
		l2: Leaf object
	@ return
		Boolean
*/
export function sameLeafStylesOld(l1: Leaf, l2: Leaf): boolean {
	if (l1 === null || l2 === null) return false;
	if (l1 === l2) return true;
	const props = Object.entries(l1.styles);
	for (const [key, value] of props) {
		if (value !== (l2.styles: Object)[key]) {
			return false;
		}
	}
	return true;
}

/*
	sameLeafStyles:
		- Compare the styles of two Leaves by comparing their hash value.
		- 30000% Faster! (https://jsperf.com/compare-objects-my-way)
	@ params
		l1: Leaf object
		l2: Leaf object
	@ return
		Boolean
*/
export function sameLeafStyles(l1: Leaf, l2: Leaf): boolean {
	if (l1 === null || l2 === null) return false;
	if (l1 === l2) return true;
	return l1.styles.hash === l2.styles.hash;
}

/*
	setLeafStyles:
		- Create a new LeafStyle object for Leaf from a LeafStyles object
	@ params
		leaf: Leaf object
		styles: LeafStyles
*/
export function setLeafStyles(leaf: Leaf, styles: LeafStyles): void {
	const l = leaf;
	const { ...styleProps } = styles;
	l.styles = new LeafStyles({ ...styleProps });
}

/*
	copyLeafStyles:
		- Copy one Leaf's styles to another, by creating a new LeafStyles object
	@ params
		leaf: Leaf object
		leafToCopy: Leaf object
*/
export function copyLeafStyles(leaf: Leaf, leafToCopy: Leaf): void {
	const l = leaf;
	const { ...styleProps } = leafToCopy.styles;
	l.styles = new LeafStyles({ ...styleProps });
}

/*
	printLeafStyles:
		- print the Leaf's styles in printLeafChain()
		- Only use for development
	@ params
		leaf: Leaf object
	@ return
		string: String
	@ output
		@-[leaf1.text] B
		|
		@-[leaf2.text] BI
*/
function printLeafStyles(leaf: Leaf): string {
	const { styles } = leaf;
	let result = '';
	for (const [key, value] of Object.entries(styles)) {
		if (value && key !== 'hash') {
			result = `${result}${key.charAt(0).toUpperCase()}`;
		}
	}
	return result;
}

/*
	printLeafChain:
		- print the Leaf chain, until prevLeaf and nextLeaf are null
		- Only use for development
	@ params
		leaf: Leaf object
		up: Boolean - default: true
	@ output
		@-[leaf1]
		|
		@-[leaf2]
		|
		@-[Leaf3]
*/
export function printLeafChain(leaf: Leaf): void {
	let l = leaf;
	while (l.prevLeaf !== null) {
		l = l.prevLeaf;
	}
	while (l !== null) {
		const styleStr = printLeafStyles(leaf);
		console.log(`@-[${leaf.text}] ${styleStr}`);
		l = l.nextLeaf;
	}
}

/*
	isZeroLeaf:
		- Check if a Leaf's text is only zero-width space.
	@ params
		leaf: Leaf object
	@ return
		Boolean
*/
export function isZeroLeaf(leaf: Leaf): boolean {
	return leaf.text === '\u200b';
}

/*
	trimRange:
		- Make sure the selection range argument passed to methods is an array of two numbers
		- The second number >= the first number
		- The second number <= Leaf.text.length
		- If range is outside Leaf.text (either end), trim the range
	@ params
		leaf: Leaf object
		range: Array<number> - default [0, 0]
	@ return
		Array<number> - default [0, 0]
*/
export function trimRange(leaf: Leaf, range: Array<number> = [0, 0]): Array<number> {
	const maxLen = leaf.text.length;
	let n1 = 0;
	let n2 = 0;

	if (typeof range[0] === 'number' && typeof range[1] === 'number') {
		[n1, n2] = range;
		if (n1 > maxLen) {
			n1 = maxLen;
		} else if (n1 < 0) {
			n1 = 0;
		}
		if (n2 > maxLen) {
			n2 = maxLen;
		} else if (n2 < 0) {
			n2 = 0;
		}
	}

	return n1 > n2 ? [n2, n1] : [n1, n2];
}

/*
	destroyLeaf:
		- Discard a new Leaf, chain its prevLeaf and nextLeaf together
		- Throw error if it's an old Leaf
		- Always return null
		- Example: leaf = destroyLeaf(leaf);
	@ params
		leaf: Leaf
	@ return
		null
*/
export function destroyLeaf(leaf: Leaf): null {
	if (!leaf.new) {
		throw new Error('Only new Leaf can be destroyed.');
	}

	const { prevLeaf, nextLeaf } = leaf;
	if (prevLeaf !== null) {
		prevLeaf.nextLeaf = nextLeaf;
	}
	if (nextLeaf !== null) {
		nextLeaf.prevLeaf = prevLeaf;
	}

	return null;
}

//= Basic History Ops

/*
	copyHistoryStep
	readyHistoryStep
	readyTempHistorySteps
*/

export const _PAST_STACK_ = true;
export const _FUTURE_STACK_ = false;
export const TempHistoryPastStep = new BlankHistoryStep(_PAST_STACK_);
export const TempHistoryFutureStep = new BlankHistoryStep(_FUTURE_STACK_);

/*
	copyHistoryStep:
		- Since TempHistoryStep will be cleared before any action is performed, its stack
		  needs to be copied before being put into the History stack.
		- Copy the reference of the old stack and declare [] for TempHistoryStep
		- past and future values are also copied.
		- Return the new Step
	@ params
		oldStep: BlankHistoryStep
	@ return
		newStep: BlankHistoryStep
*/
export function copyHistoryStep(oldStep: BlankHistoryStep): BlankHistoryStep {
	const newStep = new BlankHistoryStep(oldStep.past);
	newStep.stack = oldStep.stack;
	oldStep.detach();
	return newStep;
}

/*
	readyHistoryStep:
		- Copy & push a history step into history if not empty.
	@ params
		step: BlankHistoryStep Object
*/
export function readyHistoryStep(step: BlankHistoryStep): void {
	if (step.stack.length > 0) {
		History.push(copyHistoryStep(step));
	}
}

/*
	readyTempHistorySteps:
		- Ready TempHistoryPastStep & TempHistoryFutureStep.
		- Call this when there's a completely new Action.
	@ error
		throw if both TempHistoryPastStep and TempHistoryFutureStep are not empty
*/
export function readyTempHistorySteps(): void {
	if (TempHistoryPastStep.stack.length > 0 && TempHistoryFutureStep.stack.length > 0) {
		throw new Error('Both TempHistoryPastStep and TempHistoryFutureStep are not empty. Something is wrong!');
	}
	readyHistoryStep(TempHistoryPastStep);
	readyHistoryStep(TempHistoryFutureStep);
}

//= Basic Node Chaining Ops

/*
	unchainNode
	chainedNodes
	setParentLink
	setParentNode
*/

/*
	unchainNode:
		- Similar to unchain(), unchainNode works on Node-related objects.
	@ params
		node: Node | NullNode | NodeChain | NodeStyles | ParentLink | NodeType | PhantomNode
		past: Boolean
*/
export function unchainNode(
	node: Node | NullNode | NodeChain | NodeStyles | ParentLink | NodeType | PhantomNode,
	past: boolean
): void {
	if (past) {
		TempHistoryPastStep.push(node);
	} else {
		TempHistoryFutureStep.push(node);
	}
}

/*
	chainedNodes:
		- Like chained(), chainedNodes check if two Nodes are chained together.
	@ params
		node1: Node object
		node2: Node object
	@ return
		chained: Boolean
*/
export const _NOT_CHAINED_ = 0;
export const _CHAINED_AFTER_ = 1;
export const _CHAINED_BEFORE_ = 2;
export function chainedNodes(node1: Node, node2: Node): number {
	if (node1 === node2) {
		return _NOT_CHAINED_;
	} else if (node1.prevNode === node2 && node2.nextNode === node1) {
		return _CHAINED_AFTER_;
	} else if (node1.nextNode === node2 && node2.prevNode === node1) {
		return _CHAINED_BEFORE_;
	}
	return _NOT_CHAINED_;
}

/*
	setParentLink:
		- Set the parent of a Leaf or Node, updating the parent's firstChild value and the child's
		  parent, as well as all children in the chain.
		  	- The reason for this is that getBranchType() does not have to traverse the ENTIRE
		  	  document tree!!! (... if only the first leaf or node's parent in chain is updated.)
		- The child Leaf or Node must be the first Leaf of a LeafChain or the first Node of a
		  NodeChain.
		- setParentLink() does not unchain anything.
			- Thus, the parent's firstChild must be null.
		- setParentLink() does NOT handle detaching the existing parent from a child.
			- Thus, the child's parent must be null.
		- It assumes the current parent of the first child represents all children. Thus, if the
		  first child's parent is the same as the Node, do nothing.
	@ params
		child: Leaf | Node
		node: Node | null
*/
export function setParentLink(child: Leaf | Node, node: Node | null): void {
	const p = node || DocumentRoot;
	if (child.parent === node && p.firstChild === child) return;

	const leaf = instanceOf(child, 'Leaf');

	if (p.firstChild !== null) {
		throw new Error('The firstChild of parent Node must be null in setParentLink().');
	}
	if (child.parent !== null) {
		throw new Error('The parent of child must be null in setParentLink().');
	}
	if (leaf) {
		if (child.prevLeaf !== null) {
			throw new Error('The child Leaf in setParentLink() must be the first Leaf of a LeafChain.');
		}
	} else if (child.prevNode !== null) {
		throw new Error('The child Node in setParentLink() must be the first Node of a NodeChain.');
	}

	let c = child;
	p.firstChild = c;
	while (c !== null) {
		c.parent = node;
		c = leaf ? c.nextLeaf : c.nextNode;
	}
}

/*
	setParentNode:
		- Starting from a Leaf or Node, set its parent and the parent of all chained after it.
		- The Leaf or Node does not have to be the first Leaf or Node of a chain.
		- setParentNode() does not set the firstChild of the parent. It simply populates the
		  parent value of a LeafChain or NodeChain.
		- It assumes the current parent of the first child represents all children. Thus, if the
		  first child's parent is the same as the Node, do nothing.
	@ params
		start: Leaf | Node
		parent: Node object
*/
export function setParentNode(start: Leaf | Node, parent: Node): void {
	if (start.parent === parent) return;
	const leaf = instanceOf(start, 'Leaf');
	let c = start;
	while (c !== null) {
		c.parent = parent;
		c = leaf ? c.nextLeaf : c.nextNode;
	}
}

//= Basic Leaf Chaining Ops

/*
	unchainLeaf
	chainedLeaf
*/

/*
	unchainLeaf:
		- Push the unchained Leaf to the temporary history step
			- After pushing all unchained Leaves, this history step will be pushed into
			  either history's past stack or future stack, depending on the operation.
	@ params
		leaf: Leaf | NullLeaf | LeafChain | LeafText
		past: Boolean
*/
export function unchainLeaf(leaf: Leaf | NullLeaf | LeafChain | LeafText, past: boolean): void {
	if (past) {
		TempHistoryPastStep.push(leaf);
	} else {
		TempHistoryFutureStep.push(leaf);
	}
}

/*
	chainedLeaf:
		- Check if two Leaves are *directly* chained.
		- Return a number to indicate chained state.
		- Leaf is not chained if checked against itself.
	@ params
		leaf1: Leaf object
		leaf2: Leaf object
	@ return
		Number:
			- 0: not chained
			- 1: leaf1 is chained after leaf2
			- 2: leaf1 is chained before leaf2
*/
export function chainedLeaf(leaf1: Leaf, leaf2: Leaf): number {
	if (leaf1 === leaf2) {
		return _NOT_CHAINED_;
	} else if (leaf1.prevLeaf === leaf2 && leaf2.nextLeaf === leaf1) {
		return _CHAINED_AFTER_;
	} else if (leaf1.nextLeaf === leaf2 && leaf2.prevLeaf === leaf1) {
		return _CHAINED_BEFORE_;
	}
	return _NOT_CHAINED_;
}

//= Advanced Node Chaining Ops

/*
	removeNode
	detachFirstChild
	detachParentNode
	switchParentNode
	chainNode
	chainNodeChainBetween
	rechainNode
	createNewBranchAt
	shatter
*/

/*
	removeNode:
		- If the removed Node is the only child of its parent, remove parent
		  instead. If parent meets the same condition, keep going up the tree.
			- It will stop at a specified Node.
		- Remove a Node from its chain, and chain its prevNode and nextNode.
		- Update parent's firstChild if necessary.
		- Unchain the removed Node if old.
	@ params
		node: Node object
		stop: Node | null
*/
export function removeNode(
	node: Node,
	stop: Node | null = null,
	past: boolean = _PAST_STACK_
): void {
	if (node === stop) return;
	let n = node;
	let pn = n.prevNode;
	let nn = n.nextNode;
	let p = node.parent;

	while (pn === null && nn === null && p !== null) {
		if (stop !== null && p === stop) break;
		n = p;
		pn = n.prevNode;
		nn = n.nextNode;
		p = n.parent;
	}

	if (pn !== null) {
		pn.nextNode = nn;
	}
	if (nn !== null) {
		nn.prevNode = pn;
	}
	if (p !== null && p.firstChild === n) {
		p.firstChild = nn;
	} else if (p === null && DocumentRoot.firstChild === n) {
		DocumentRoot.firstChild = nn;
	}
	if (n.new === false) {
		unchainNode(n, past);
	}
}

/*
	detachFirstChild:
		- Remove the LeafChain/NodeChain from a Node, resulting in a Node with no first child
		  and a LeafChain/NodeChain with no parent.
		- Return the removed chain's first Leaf/Node.
		- If the target Node has no child, do nothing and return null.
		- If the target Node is old, create a ParentLink for unchain().
		- Expects parent and child, if exist, to be both new or old.
	@ params
		parent: Node | null
	@ return
		child: Leaf | Node | null
*/
export function detachFirstChild(
	parent: Node | null,
	past: boolean = _PAST_STACK_
): Leaf | Node | null {
	const p = parent || DocumentRoot;
	if (p.firstChild === null) return null;
	const c = p.firstChild;
	if (p.new !== c.new) {
		throw new Error('In detachfirstChild(), parent and child, if they exist, must be both new or old.');
	}
	if (p.new === false) {
		const pl = new ParentLink(c, parent);
		unchainNode(pl, past);
	}
	p.firstChild = null;
	c.parent = null;

	return c;
}

/*
	detachParentNode:
		- Same as detachFirstChild, except it takes the child as the paramenter.
		- The target child must be the first Node/Leaf of its chain
		- Expects parent and child, if exist, to be both new or old.
	@ params
		child: Leaf | Node
	@ return
		child: Leaf | Node
*/
export function detachParentNode(child: Leaf | Node, past: boolean = _PAST_STACK_): Leaf | Node {
	if (instanceOf(child, 'Leaf')) {
		if (child.prevLeaf !== null) {
			throw new Error('The Leaf in detachParentNode() must be the first Leaf of a LeafChain.');
		}
	} else if (child.prevNode !== null) {
		throw new Error('The Node in detachParentNode() must be the first Node of a NodeChain.');
	}

	const c = child;
	const p = child.parent || DocumentRoot;
	if (c.new !== p.new) {
		throw new Error('In detachParentNode(), parent and child, if they exist, must be both new or old.');
	}
	if (c.new === false) {
		const pl = new ParentLink(child, child.parent);
		unchainNode(pl, past);
	}
	c.parent = null;
	p.firstChild = null;

	return c;
}

/*
	switchParentNode:
		- Change the parent of a LeafChain to another by combining detachParentNode() and
		  setParentLink().
		- If the Leaf's parent is the same as the new Node, do nothing.
		- It does not check if the Leaf is the first Leaf of a LeafChain, because
		  detachParentNode checks it.
	@ params
		leaf: Leaf object
		node: Node object
*/
export function switchParentNode(leaf: Leaf, node: Node): void {
	if (leaf.parent === node) return;
	const l = detachParentNode(leaf);
	setParentLink(l, node);
}

/*
	chainNode:
		- Chain a new Node AFTER another Node.
			- The Node to be chained must be new. Otherwise, the operation should be
			  called "switchNode", which should handle moving a Node.
		- Always update parent.
		- Only chain Node AFTER another, never before, because this way won't mess up
		  the parent's firstChild.
		- Update the parent of the newNode and all Nodes after it.
	@ params
		newNode: Node object
		targetNode: Node object
*/
export function chainNode(newNode: Node, targetNode: Node): void {
	const n = newNode;

	if (!n.new) {
		throw new Error('newNode in chainNode() must be a NEW Node.');
	} else if (n.prevNode !== null) {
		throw new Error('newNode.prevNode must be null in chainNode().');
	}

	const t = targetNode;

	if (t.new === true) {
		if (n.prevNode !== null || n.nextNode !== null) {
			throw new Error('If targetNode is new, newNode must have no prevNode or nextNode to avoid circular chaining.');
		} else if (t.nextNode !== null) {
			throw new Error('If new, targetNode\'s nextNode must not be replaced if not null.');
		}
	}

	// If already chained after, do nothing
	if (chainedNodes(n, t) === _CHAINED_AFTER_) return;

	// Get target.nextNode
	let next = t.nextNode;
	// Update nextNode and prevNode
	t.nextNode = n;
	n.prevNode = t;
	// Push to stack only if target Node is old
	if (t.new === false) {
		if (next === null) {
			next = new NullNode({ prevNode: t });
		}
		unchainNode(next, _PAST_STACK_);
	}
	// Set parent
	setParentNode(n, t.parent);
}

/*
	chainNodeChainBetween:
		- Chain a NodeChain between two Nodes, one of which can be null.
		- It assumes the targetNode1 always come before targetNode2, if they are not null.
		- At least one targetNode must not be null.
			- If targetNode1 is null, update the parent's firstChild.
			- If one of the targetNodes is null, unchain a NullNode.
			- If both targetNodes are not null and not chained, unchain a NodeChain.
		- It's the user's responsibility to ensure the NodeChain is valid.
		- Always set parents for the chain.
	@ params
		startNode: Node object
		endNode: Node object
		targetNode1: Node | null
		targetNode2: Node | null
*/
export function chainNodeChainBetween(
	startNode: Node,
	endNode: Node,
	targetNode1: Node | null,
	targetNode2: Node | null
): void {
	// startNode and endNode do not have to be new. applyBranchType() has examples.

	if (endNode.nextNode !== null || startNode.prevNode !== null) {
		throw new Error('The two ends of the new chain must be null for chainNodeChainBetween().');
	}

	if (targetNode1 === null && targetNode2 === null) {
		throw new Error('targetNode1 and targetNode2 must not both be null for chainNodeChainBetween().');
	}

	if (targetNode1 !== null && targetNode2 !== null) {
		if (targetNode1.new !== targetNode2.new) {
			throw new Error('targetNode1 and targetNode2 must be both old or new for chainNodeChainBetween().');
		}
		if (targetNode1.parent !== targetNode2.parent) {
			throw new Error('targetNode1 and targetNode2 must have the same parent for chainNodeChainBetween().');
		}
	}

	if (startNode === targetNode1 || startNode === targetNode2) {
		throw new Error('startNode must not be the same as either targetNode for chainNodeChainBetween().');
	}

	if (endNode === targetNode1 || endNode === targetNode2) {
		throw new Error('endNode must not be the same as either targetNode for chainNodeChainBetween().');
	}

	if (targetNode1 !== null && targetNode1.nextNode === startNode) {
		throw new Error('startNode must not be already chained with targetNode1 for chainNodeChainBetween()');
	}

	if (targetNode2 !== null && targetNode2.prevNode === endNode) {
		throw new Error('endNode must not be already chained with targetNode2 for chainNodeChainBetween()');
	}

	const s = startNode;
	const e = endNode;
	const t1 = targetNode1;
	const t2 = targetNode2;
	let p = null;

	if (t1 === null) {
		// If targetNode1 is null
		// Get targetNode2's prevNode
		let prev = t2.prevNode;
		// Get parent
		p = t2.parent;
		// Unchain prev if targetNode2 is old
		if (t2.new === false) {
			if (prev === null) {
				// Unchain a NullNode if prev is null
				prev = new NullNode({ prevNode: null, nextNode: t2 });
			} else {
				// Unchain a NodeChain if prev is not null
				prev = new NodeChain({
					startNode: p ? p.firstChild : DocumentRoot.firstChild,
					endNode: prev
				});
			}
			unchainNode(prev, _PAST_STACK_);
		}
		// Chain before t2
		e.nextNode = t2;
		t2.prevNode = e;
		// Update parent's firstChild
		if (p !== null) {
			p.firstChild = s;
		} else {
			DocumentRoot.firstChild = s;
		}
	} else if (t2 === null) {
		// If targetNode2 is null
		// Get targetNode1's nextNode
		let next = t1.nextNode;
		// Get parent
		p = t1.parent;
		// Unchain if targetNode1 is old
		if (t1.new === false) {
			if (next === null) {
				// Unchain a NullNode if next is null
				next = new NullNode({ prevNode: t1, nextNode: null });
			}
			unchainNode(next, _PAST_STACK_);
		}
		// Chain after t1
		t1.nextNode = s;
		s.prevNode = t1;
	} else {
		// Both targetNodes are not null
		// Get parent
		p = t1.parent;
		// Unchain if targetNodes are old
		if (t1.new === false) {
			// If targetNodes are chained, unchain a NullNode
			if (chainedNodes(t1, t2) !== _NOT_CHAINED_) {
				const nn = new NullNode({ prevNode: t1, nextNode: t2 });
				unchainNode(nn, _PAST_STACK_);
			} else {
				const nc = new NodeChain({ startNode: t1.nextNode, endNode: t2.prevNode });
				unchainNode(nc, _PAST_STACK_);
			}
		}
		// Chain between t1 and t2
		t1.nextNode = s;
		s.prevNode = t1;
		e.nextNode = t2;
		t2.prevNode = e;
	}

	// Always set parents for the chain
	let node = startNode;
	while (node !== null) {
		node.parent = p;
		if (node === endNode) break;
		node = node.nextNode;
	}
}

/*
	rechainNode:
		- Rechain Node-related objects. For details, see comments for rechainLeaf().
	@ params
		leaf: mixed - Node | NullNode | NodeChain | NodeStyles | ParentLink |
			  NodeType | PhantomNode | PhantomChain
		fromPast: Boolean
*/
export const _FROM_PAST_ = true;
export const _FROM_FUTURE_ = false;
export function rechainNode(node: mixed, fromPast: boolean): void {
	const n = node;

	if (instanceOf(n, 'Node')) {
		// Check prevNode, nextNode, and parent
		const { prevNode, nextNode, parent } = n;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevNode
		if (prevNode !== null && prevNode.nextNode !== n) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextNode
		if (nextNode !== null && nextNode.prevNode !== n) {
			rechainNext = true;
		}

		if (rechainPrev && rechainNext) {
			// Need to rechain both ends
			// Check if prevNode and nextNode are chained
			if (chainedNodes(prevNode, nextNode) !== _NOT_CHAINED_) {
				// prevNode and nextNode are chained
				// Create a NullNode for unchainNode()
				const nn = new NullNode({ prevNode, nextNode });
				// Insert old Leaf between prevNode and nextNode
				prevNode.nextNode = n;
				nextNode.prevNode = n;
				// Unchain NullNode
				unchainNode(nn, !fromPast);
			} else {
				// prevNode and nextNode are not chained
				// Create a NodeChain for unchainNode()
				const nc = new NodeChain({
					startNode: prevNode.nextNode,
					endNode: nextNode.prevNode
				});
				// Insert old Leaf between prevNode and nextNode
				prevNode.nextNode = n;
				nextNode.prevNode = n;
				// Unchain NodeChain
				unchainNode(nc, !fromPast);
			}
		} else if (rechainPrev) {
			// Need to rechain prevNode
			// Get current prevNode's nextNode
			let next = prevNode.nextNode;
			// If prevNode's nextNode is null, create NullNode for unchainNode()
			if (next === null) {
				next = new NullNode({ prevNode });
			}
			// Update prevNode's nextNode
			prevNode.nextNode = n;
			// Unchain replaced Leaf
			unchainNode(next, !fromPast);
		} else if (rechainNext) {
			// Need to rechain nextNode
			// Get current nextNode's prevNode
			let prev = nextNode.prevNode;
			// If nextNode's prevNode is null, create NullNode for unchainNode()
			if (prev === null) {
				prev = new NullNode({ nextNode });
			}
			// Update nextNode's prevNode
			nextNode.prevNode = n;
			// Unchain replaced Leaf
			unchainNode(prev, !fromPast);
		}
		// Update parent firstChild if necessary (including DocumentRoot)
		if (prevNode === null) {
			if (parent !== null) {
				parent.firstChild = n;
			} else {
				DocumentRoot.firstChild = n;
			}
		}
	} else if (instanceOf(n, 'PhantomNode')) {
		const { ref, prevNode, nextNode, nodeType, parent } = n;

		if (ref.nextNode !== nextNode || (nextNode !== null && nextNode.prevNode !== ref)) {
			throw new Error(`When rechaining a PhantomNode, its nextNode is expected to stay the same.
				Somewhere the PhantomNode has been misused.`);
		}

		// Create a new PhantomNode for unchain
		const pn = new PhantomNode(ref);
		unchainNode(pn, !fromPast);

		// Modify current chain
		// Check if needed to remove current chain's parent
		if (ref.prevNode === null) {
			// Remove current parent Node
			removeNode(ref.parent, null, !fromPast);
		} else {
			// Cut the ref's prevNode
			// All Nodes after ref will go with it
			ref.prevNode.nextNode = null;
		}

		// Restore parent
		if (parent !== ref.parent) {
			setParentNode(ref, parent);
		}
		// Restore prevNode (nextNode is expected to stay the same)
		ref.prevNode = prevNode;
		// Update firstChild if necessary
		if (prevNode === null) {
			setFirstChild(parent, ref);
		}

		// Check if needed to rechain prevNode
		if (prevNode !== null && prevNode.nextNode !== ref) {
			if (prevNode.nextNode !== null) {
				throw new Error('When rechaining a PhantomNode, it should not replace any existing Node.');
			}
			// rechain prevNode
			prevNode.nextNode = ref;
			// No need to unchain a NullNode. Unchaining a PhantomNode handles it.
		}
		// Restore nodeType
		ref.nodeType = nodeType;
	} else if (instanceOf(n, 'PhantomChain')) {
		const { startNode, endNode, prevNode, nextNode } = n;
		const startRef = startNode.ref;
		const endRef = endNode.ref;
		// Create new PhantomChain for unchain
		const pc = new PhantomChain({
			startNode: new PhantomNode(startRef),
			endNode: new PhantomNode(endRef)
		});
		unchainNode(pc, !fromPast);

		// Modify current chain
		// Check if needed to remove current chain's parent
		if (startRef.prevNode === null && endRef.nextNode === null) {
			// Remove current parent node
			removeNode(startRef.parent, null, !fromPast);
		} else {
			if (startRef.prevNode === null) {
				setFirstChild(startRef.parent, endRef.nextNode);
			} else {
				startRef.prevNode.nextNode = endRef.nextNode;
			}
			if (endRef.nextNode !== null) {
				endRef.nextNode.prevNode = startRef.prevNode;
			}
		}

		// Restore parent
		if (startNode.parent !== startRef.parent) {
			let cn = startRef;
			while (cn !== null) {
				cn.parent = startNode.parent;
				if (cn === endRef) break;
				cn = cn.nextNode;
			}
		}
		// Restore prevNode and nextNode
		startRef.prevNode = prevNode;
		endRef.nextNode = nextNode;
		// Update parent firstChild if necessary
		if (prevNode === null) {
			setFirstChild(startNode.parent, startRef);
		}

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevNode
		if (prevNode !== null && prevNode.nextNode !== startRef) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextNode
		if (nextNode !== null && nextNode.prevNode !== endRef) {
			rechainNext = true;
		}

		if (rechainPrev && rechainNext) {
			if (chainedNodes(prevNode, nextNode) === _NOT_CHAINED_) {
				throw new Error('When rechaining a PhantomChain, it should not replace any existing chain.');
			}
			// Need to rechain both ends
			prevNode.nextNode = startRef;
			nextNode.prevNode = endRef;
			// There's no need to unchain a NullNode. Unchaining a PhantomChain handles it.
		} else if (rechainPrev) {
			if (prevNode.nextNode !== null) {
				throw new Error('When rechaining a PhantomChain, it should not replace any existing chain.');
			}
			// Need to rechain prevNode
			prevNode.nextNode = startRef;
			// There's no need to unchain a NullNode. Unchaining a PhantomChain handles it.
		} else if (rechainNext) {
			if (nextNode.prevNode !== null) {
				throw new Error('When rechaining a PhantomChain, it should not replace any existing chain.');
			}
			// Need to rechain nextNode
			nextNode.prevNode = endRef;
			// There's no need to unchain a NullNode. Unchaining a PhantomChain handles it.
		}
		// Restore nodeType
		startRef.nodeType = startNode.nodeType;
		endRef.nodeType = endNode.nodeType;
	} else if (instanceOf(n, 'NodeChain')) {
		const { prevNode, nextNode, startNode, endNode } = n;
		const { parent } = startNode;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevNode
		if (prevNode !== null && prevNode.nextNode !== startNode) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextNode
		if (nextNode !== null && nextNode.prevNode !== endNode) {
			rechainNext = true;
		}

		if (rechainPrev && rechainNext) {
			// Need to rechain both ends
			// Check if prevNode and nextNode are chained
			if (chainedNodes(prevNode, nextNode) !== _NOT_CHAINED_) {
				// prevNode and nextNode are chained
				// Create a NullNode for unchainNode()
				const nn = new NullNode({ prevNode, nextNode });
				// Update prevNode.nextNode and nextNode.prevNode
				prevNode.nextNode = startNode;
				nextNode.prevNode = endNode;
				// Unchain NullNode
				unchainNode(nn, !fromPast);
			} else {
				// prevNode and nextNode are not chained
				// Create a NodeChain for unchainNode()
				const nc = new NodeChain({
					startNode: prevNode.nextNode,
					endNode: nextNode.prevNode
				});
				// Update prevNode.nextNode and nextNode.prevNode
				prevNode.nextNode = startNode;
				nextNode.prevNode = endNode;
				// Unchain NodeChain
				unchainNode(nc, !fromPast);
			}
		} else if (rechainPrev) {
			// Need to rechain prevNode
			// Get current prevNode's nextNode
			let next = prevNode.nextNode;
			// If prevNode's nextNode is null, create NullNode for unchainNode()
			if (next === null) {
				next = new NullNode({ prevNode });
			}
			// Update prevNode's nextNode
			prevNode.nextNode = startNode;
			// Unchain replaced Leaf
			unchainNode(next, !fromPast);
		} else if (rechainNext) {
			// Need to rechain nextNode
			// Get current nextNode's prevNode
			let prev = nextNode.prevNode;
			// If nextNode's prevNode is null, create NullNode for unchainNode()
			if (prev === null) {
				prev = new NullNode({ nextNode });
			} else {
				// If prev is not null, create a NodeChain for unchainNode()
				prev = new NodeChain({
					startNode: parent ? parent.firstChild : DocumentRoot.firstChild,
					endNode: prev
				});
			}
			// Update nextNode's prevNode
			nextNode.prevNode = endNode;
			// Unchain replaced Leaf
			unchainNode(prev, !fromPast);
		}
		// Update parent firstChild if necessary (including DocumentRoot)
		if (prevNode === null) {
			if (parent !== null) {
				parent.firstChild = startNode;
			} else {
				DocumentRoot.firstChild = startNode;
			}
		}
	} else if (instanceOf(n, 'NullNode')) {
		const { prevNode, nextNode } = n;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevNode
		if (prevNode !== null && prevNode.nextNode !== null) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextNode
		if (nextNode !== null && nextNode.prevNode !== null) {
			rechainNext = true;
		}

		// If NullNode's prevNode and nextNode are not null, chain them together
		if (rechainPrev && rechainNext) {
			// Check if prevNode and nextNode are chained
			// If chained do nothing
			// If not chained, create a NodeChain for unchainNode()
			if (chainedNodes(prevNode, nextNode) === _NOT_CHAINED_) {
				const nc = new NodeChain({
					startNode: prevNode.nextNode,
					endNode: nextNode.prevNode
				});
				// Chain original Leaves back together
				prevNode.nextNode = nextNode;
				nextNode.prevNode = prevNode;
				// Unchain NodeChain
				unchainNode(nc, !fromPast);
			}
		} else if (rechainPrev) {
			// NullNode is after a Node
			// Get current prevNode's nextNode
			const next = prevNode.nextNode;
			// Replace it with null value because of NullNode
			prevNode.nextNode = null;
			// Push replaced Node to stack
			unchainNode(next, !fromPast);
		} else if (rechainNext) {
			// NullNode is before a Node
			// Get current nextNode's prevNode
			const prev = nextNode.prevNode;
			// Replace it with null value becase of NullNode
			nextNode.prevNode = null;
			// Unchain the NodeChain before the nextNode
			const nc = new NodeChain({
				startNode: nextNode.parent ? nextNode.parent.firstChild : DocumentRoot.firstChild,
				endNode: prev
			});
			unchainNode(nc, !fromPast);
		}
		// Update parent firstChild if necessary (including DocumentRoot)
		if (prevNode === null) {
			if (nextNode.parent !== null) {
				nextNode.parent.firstChild = nextNode;
			} else {
				DocumentRoot.firstChild = nextNode;
			}
		}
	} else if (instanceOf(n, 'ParentLink')) {
		const { child, parent } = n;
		const p = parent || DocumentRoot;
		if (p.firstChild !== child || child.parent !== parent) {
			// Ensure setParentLink is safe to use
			if (p.firstChild !== null) {
				// If parent's firstChild is not null, detach (unchain PL)
				detachFirstChild(p, !fromPast);
			}
			if (child.parent !== null) {
				// If child's parent is not null, detach (unchain PL)
				detachParentNode(child, !fromPast);
			}
			// Set ParentLink (safe to use)
			setParentLink(child, parent);
		}
	} else if (instanceOf(n, 'NodeType')) {
		const { type, ref } = n;
		// If ref is null, do nothing
		if (ref === null) return;
		// Unchain a new NodeType
		const nt = new NodeType(ref.nodeType, ref);
		unchainNode(nt, !fromPast);
		// Set Node's NodeType
		ref.nodeType = type;
	} else if (instanceOf(n, 'NodeStyles')) {
		const { ref } = n;
		// Unchain the current NodeStyles
		const ns = ref.styles;
		ns.ref = ref;
		unchainNode(ns, !fromPast);
		// Set NodeStyles
		n.ref = null;
		ref.styles = n;
	}
}

/*
	createNewBranchAt:
		- Create a brand new branch based on the new shallow BranchType, which is simply an
		  array of numbers. The "at" argument indicates where to start.
		  	- If "at" is not smaller than type's length, throw error.
		- Return the first Node and the last Node of the new branch.
	@ params
		type: Array<number>
		at: number
	@ return
		result: Object
			- first: Node object
			- last: Node object
*/
export function createNewBranchAt(type: Array<number>, at: number): Node {
	if (at >= type.length) {
		throw new Error('"at" must be smaller than the type\'s length for createNewBranchAt().');
	}
	const head = new Node({ nodeType: type[at] });
	let current = head;
	for (let i = at + 1; i < type.length; i += 1) {
		const newNode = new Node({ nodeType: type[i] });
		current.firstChild = newNode;
		newNode.parent = current;
		current = newNode;
	}
	return { first: head, last: current };
}

/*
	shatter:
		- Cut a tree in half at the depth of the stop Node, create new parent Nodes for the
		  second tree, and return the references to both trees in an object.
		- If there's nothing to be cut, return null for first tree and the stop Node as the
		  second tree.
		- User must ensure the stop Node is in the Leaf's BranchType.
	@ params
		leaf: Leaf object
		stop: Node object
	@ return
		result: Object
			- first: Node | null
			- second: Node | null
*/
export const _CUT_ABOVE_ = true; // Always cut above
export const _CUT_BELOW_ = true; // Unused
export function shatter(leaf: Leaf, stop: Node): Object {
	const result = {
		first: null,
		second: null
	};

	let above = true;
	let cutNode = leaf.parent;
	let lastNewParent = null;
	let nextCutNode = null;
	while (cutNode !== stop) {
		nextCutNode = cutNode.parent; // nextCutNode is never null, because cutNode !== stop
		if (above) {
			// Cut above
			if (cutNode.prevNode !== null) {
				// Save current Node attributes
				const phantom = new PhantomNode(cutNode);
				// Cut prevNode
				cutNode.prevNode.nextNode = null;
				cutNode.prevNode = null;
				// Give cutNode a new parent
				const newParent = new Node({
					nodeType: nextCutNode.nodeType
				});
				cutNode.parent = null;
				// Safe to use: cutNode remembered, and newParent is new
				setParentLink(cutNode, newParent);
				// Unchain PhantomNode
				unchainNode(phantom, _PAST_STACK_);
				// Change direction
				above = false;
				// Assign cut Node's new parent to lastNewParent
				lastNewParent = newParent;
			}
		} else {
			// Cut below
			if (cutNode.nextNode !== null) {
				const next = cutNode.nextNode;
				// Save nextNode attributes
				const phantom = new PhantomNode(next);
				// Cut nextNode
				next.prevNode = null;
				cutNode.nextNode = null;
				// Switch nextNode onto the lastNewParent
				lastNewParent.nextNode = next;
				next.prevNode = lastNewParent;
				// Unchain PhantomNode
				unchainNode(phantom, _PAST_STACK_);
			}
			// Give lastNewParent a new parent
			const newParent = new Node({
				nodeType: nextCutNode.nodeType
			});
			// Safe to use: lastNewParent and newParent are new and have no ParentLink
			setParentLink(lastNewParent, newParent);
			// Update lastNewParent
			lastNewParent = newParent;
		}
		// Get next Node to be cut
		cutNode = nextCutNode;
	}

	// Populate result
	if (lastNewParent === null) {
		// No shatter
		result.second = stop;
	} else {
		result.first = stop;
		result.second = lastNewParent;
	}
	return result;
}

//= Advanced Leaf Chaining Ops

/*
	chainLeaf
	chainLeafChainBetween
	rechainLeaf
	consume
*/

/*
	chainLeaf:
		- Chain a new Leaf AFTER another Leaf.
			- The Leaf to be chained must be new. Otherwise, the operation should be
			  called "switchLeaf", which should handle moving a Leaf.
		- Always update parent.
		- Only chain Leaf AFTER another, never before, because this way won't mess up
		  the parent's firstChild.
	@ params
		newLeaf: Leaf object
		targetLeaf: Leaf object
*/
export const _CHAIN_AFTER_ = true;
export const _CHAIN_BEFORE_ = false;
export function chainLeaf(newLeaf: Leaf, targetLeaf: Leaf): void {
	const n = newLeaf;

	if (!n.new) {
		throw new Error('newLeaf in chainLeaf() must be a NEW Leaf.');
	} else if (n.prevLeaf !== null) {
		throw new Error('newLeaf.prevLeaf must be null in chainLeaf().');
	}

	const t = targetLeaf;

	// If targetLeaf is new, chain one Leaf at a time to avoid circular referencing.
	// Also, its nextLeaf if not null, must not be replaced.
	if (t.new === true) {
		if (n.prevLeaf !== null || n.nextLeaf !== null) {
			throw new Error('If targetLeaf is new, newLeaf must have no prevLeaf or nextLeaf to avoid circular chaining.');
		} else if (t.nextLeaf !== null) {
			throw new Error('If new, targetLeaf\'s nextLeaf must not be replaced if not null.');
		}
	}

	// If already chained after, do nothing
	if (chainedLeaf(n, t) === _CHAINED_AFTER_) return;

	// Get target.nextLeaf
	let next = t.nextLeaf;
	// Update nextLeaf and prevLeaf
	t.nextLeaf = n;
	n.prevLeaf = t;
	// Push to stack only if target Leaf is old
	if (t.new === false) {
		if (next === null) {
			next = new NullLeaf({ prevLeaf: t });
		}
		unchainLeaf(next, _PAST_STACK_);
	}
	// Set parent
	setParentNode(n, t.parent);
}

/*
	chainLeafChainBetween:
		- The Leaf version of chainNodeChainBetween.
		- It's the user's responsibility to ensure the LeafChain is valid.
		- Always set parents for the chain.
	@ params
		startLeaf: Leaf object
		endLeaf: Leaf object
		targetLeaf1: Leaf | null
		targetLeaf2: Leaf | null
*/
export function chainLeafChainBetween(
	startLeaf: Leaf,
	endLeaf: Leaf,
	targetLeaf1: Leaf | null,
	targetLeaf2: Leaf | null
): void {
	if (!startLeaf.new || !endLeaf.new) {
		throw new Error('The new chain\'s startLeaf and endLeaf must be new for chainLeafChainBetween().');
	}

	if (endLeaf.nextLeaf !== null || startLeaf.prevLeaf !== null) {
		throw new Error('The two ends of the new chain must be null for chainLeafChainBetween().');
	}

	if (targetLeaf1 === null && targetLeaf2 === null) {
		throw new Error('targetLeaf1 and targetLeaf2 must not both be null for chainLeafChainBetween().');
	}

	if (targetLeaf1 !== null && targetLeaf2 !== null) {
		if (targetLeaf1.new !== targetLeaf2.new) {
			throw new Error('targetLeaf1 and targetLeaf2 must be both old or new for chainLeafChainBetween().');
		}
		if (targetLeaf1.parent !== targetLeaf2.parent) {
			throw new Error('targetLeaf1 and targetLeaf2 must have the same parent for chainLeafChainBetween().');
		}
	}

	if (startLeaf === targetLeaf1 || startLeaf === targetLeaf2) {
		throw new Error('startLeaf must not be the same as either targetLeaf for chainLeafChainBetween().');
	}

	if (endLeaf === targetLeaf1 || endLeaf === targetLeaf2) {
		throw new Error('endLeaf must not be the same as either targetLeaf for chainLeafChainBetween().');
	}

	if (targetLeaf1 !== null && targetLeaf1.nextLeaf === startLeaf) {
		throw new Error('startLeaf must not be already chained with targetLeaf1 for chainLeafChainBetween()');
	}

	if (targetLeaf2 !== null && targetLeaf2.prevLeaf === endLeaf) {
		throw new Error('endLeaf must not be already chained with targetLeaf2 for chainLeafChainBetween()');
	}

	const s = startLeaf;
	const e = endLeaf;
	const t1 = targetLeaf1;
	const t2 = targetLeaf2;
	let p = null;

	if (t1 === null) {
		// If targetLeaf1 is null
		// Get targetLeaf2's prevLeaf
		let prev = t2.prevLeaf;
		// Get parent
		p = t2.parent;
		// Unchain if targetLeaf2 is old
		if (t2.new === false) {
			if (prev === null) {
				// If prev is null, unchain a NullLeaf
				prev = new NullLeaf({ prevLeaf: null, nextLeaf: t2 });
			} else {
				// If prev is not null, unchain a LeafChain
				prev = new LeafChain({
					startLeaf: p.firstChild,
					endLeaf: prev
				});
			}
			unchainLeaf(prev, _PAST_STACK_);
		}
		// Chain before t2
		e.nextLeaf = t2;
		t2.prevLeaf = e;
		// Update parent's firstChild
		if (p !== null) {
			p.firstChild = s;
		}
	} else if (t2 === null) {
		// If targetLeaf2 is null
		// Get targetLeaf1's nextLeaf
		let next = t1.nextLeaf;
		// Get parent
		p = t1.parent;
		// Unchain if targetLeaf1 is old
		if (t1.new === false) {
			if (next === null) {
				// If next is null, unchain a NullLeaf
				next = new NullLeaf({ prevLeaf: t1, nextLeaf: null });
			}
			unchainLeaf(next, _PAST_STACK_);
		}
		// Chain after t1
		t1.nextLeaf = s;
		s.prevLeaf = t1;
	} else {
		// Both targetLeaves are not null
		// Get parent
		p = t1.parent;
		// Unchain if targetLeaves are old
		if (t1.new === false) {
			// If targetLeaves are chained, unchain a NullLeaf
			if (chainedNodes(t1, t2) !== _NOT_CHAINED_) {
				const nn = new NullLeaf({ prevLeaf: t1, nextLeaf: t2 });
				unchainLeaf(nn, _PAST_STACK_);
			} else {
				const nc = new LeafChain({ startLeaf: t1.nextLeaf, endLeaf: t2.prevLeaf });
				unchainLeaf(nc, _PAST_STACK_);
			}
		}
		// Chain between t1 and t2
		t1.nextLeaf = s;
		s.prevLeaf = t1;
		e.nextLeaf = t2;
		t2.prevLeaf = e;
	}

	// Always set parents for the chain
	let l = startLeaf;
	while (l !== null) {
		l.parent = p;
		if (l === endLeaf) break;
		l = l.nextLeaf;
	}
}

/*
	rechainLeaf:
		- Put Leaf from past or future history stack back into chain,
		  and push replaced Leaves to future or past history stack respectively.
		- Rechain is used for history redo() and undo().
		- Normally, removing a Leaf or Leaves means replacing them with one zero-width Leaf,
		  but during redo() and undo(), removing a Leaf or Leaves and re-inserting a Leaf or
		  Leaves back between two Leaves needs LeafChain object, which describes it
		  startLeaf.prevLeaf and endLeaf.nextLeaf.
	@ params
		leaf: mixed - Leaf | NullLeaf | LeafChain | LeafText
		fromPast: Boolean
*/
export function rechainLeaf(leaf: mixed, fromPast: boolean): void {
	const l = leaf;

	if (instanceOf(l, 'Leaf')) {
		// Check prevLeaf, nextLeaf, and parent
		const { prevLeaf, nextLeaf, parent } = l;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevLeaf
		if (prevLeaf !== null && prevLeaf.nextLeaf !== l) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextLeaf
		if (nextLeaf !== null && nextLeaf.prevLeaf !== l) {
			rechainNext = true;
		}

		if (rechainPrev && rechainNext) {
			// Need to rechain both ends
			// Check if prevLeaf and nextLeaf are chained
			if (chainedLeaf(prevLeaf, nextLeaf) !== 0) {
				// prevLeaf and nextLeaf are chained
				// Create a NullLeaf for unchain()
				const nl = new NullLeaf({ prevLeaf, nextLeaf });
				// Insert old Leaf between prevLeaf and nextLeaf
				prevLeaf.nextLeaf = l;
				nextLeaf.prevLeaf = l;
				// Unchain NullLeaf
				unchainLeaf(nl, !fromPast);
			} else {
				// prevLeaf and nextLeaf are not chained
				// Create a LeafChain for unchain()
				const lc = new LeafChain({
					startLeaf: prevLeaf.nextLeaf,
					endLeaf: nextLeaf.prevLeaf
				});
				// Insert old Leaf between prevLeaf and nextLeaf
				prevLeaf.nextLeaf = l;
				nextLeaf.prevLeaf = l;
				// Unchain LeafChain
				unchainLeaf(lc, !fromPast);
			}
		} else if (rechainPrev) {
			// Need to rechain prevLeaf
			// Get current prevLeaf's nextLeaf
			let next = prevLeaf.nextLeaf;
			// If prevLeaf's nextLeaf is null, create NullLeaf for unchain()
			if (next === null) {
				next = new NullLeaf({ prevLeaf });
			}
			// Update prevLeaf's nextLeaf
			prevLeaf.nextLeaf = l;
			// Unchain replaced Leaf
			unchainLeaf(next, !fromPast);
		} else if (rechainNext) {
			// Need to rechain nextLeaf
			// Get current nextLeaf's prevLeaf
			let prev = nextLeaf.prevLeaf;
			// If nextLeaf's prevLeaf is null, create NullLeaf for unchain()
			if (prev === null) {
				prev = new NullLeaf({ nextLeaf });
			}
			// Update nextLeaf's prevLeaf
			nextLeaf.prevLeaf = l;
			// Unchain replaced Leaf
			unchainLeaf(prev, !fromPast);
		}
		// Update parent firstChild if necessary
		if (parent !== null && prevLeaf === null) {
			parent.firstChild = l;
		}
	} else if (instanceOf(l, 'LeafChain')) {
		const { prevLeaf, nextLeaf, startLeaf, endLeaf } = l;
		const { parent } = startLeaf;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevLeaf
		if (prevLeaf !== null && prevLeaf.nextLeaf !== startLeaf) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextLeaf
		if (nextLeaf !== null && nextLeaf.prevLeaf !== endLeaf) {
			rechainNext = true;
		}

		if (rechainPrev && rechainNext) {
			// Need to rechain both ends
			// Check if prevLeaf and nextLeaf are chained
			if (chainedLeaf(prevLeaf, nextLeaf) !== 0) {
				// prevLeaf and nextLeaf are chained
				// Create a NullLeaf for unchain()
				const nl = new NullLeaf({ prevLeaf, nextLeaf });
				// Update prevLeaf.nextLeaf and nextLeaf.prevLeaf
				prevLeaf.nextLeaf = startLeaf;
				nextLeaf.prevLeaf = endLeaf;
				// Unchain NullLeaf
				unchainLeaf(nl, !fromPast);
			} else {
				// prevLeaf and nextLeaf are not chained
				// Create a LeafChain for unchain()
				const lc = new LeafChain({
					startLeaf: prevLeaf.nextLeaf,
					endLeaf: nextLeaf.prevLeaf
				});
				// Update prevLeaf.nextLeaf and nextLeaf.prevLeaf
				prevLeaf.nextLeaf = startLeaf;
				nextLeaf.prevLeaf = endLeaf;
				// Unchain LeafChain
				unchainLeaf(lc, !fromPast);
			}
		} else if (rechainPrev) {
			// Need to rechain prevLeaf
			// Get current prevLeaf's nextLeaf
			let next = prevLeaf.nextLeaf;
			// If prevLeaf's nextLeaf is null, create NullLeaf for unchain()
			if (next === null) {
				next = new NullLeaf({ prevLeaf });
			}
			// Update prevLeaf's nextLeaf
			prevLeaf.nextLeaf = startLeaf;
			// Unchain replaced Leaf
			unchainLeaf(next, !fromPast);
		} else if (rechainNext) {
			// Need to rechain nextLeaf
			// Get current nextLeaf's prevLeaf
			let prev = nextLeaf.prevLeaf;
			// If nextLeaf's prevLeaf is null, create NullLeaf for unchain()
			if (prev === null) {
				prev = new NullLeaf({ nextLeaf });
			} else {
				// If prev is not null, create LeafChain for unchain()
				prev = new LeafChain({
					startLeaf: parent.firstChild,
					endLeaf: prev
				});
			}
			// Update nextLeaf's prevLeaf
			nextLeaf.prevLeaf = endLeaf;
			// Unchain replaced Leaf
			unchainLeaf(prev, !fromPast);
		}
		// Update parent firstChild if necessary
		if (parent !== null && prevLeaf === null) {
			parent.firstChild = startLeaf;
		}
	} else if (instanceOf(l, 'NullLeaf')) {
		const { prevLeaf, nextLeaf } = l;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevLeaf
		if (prevLeaf !== null && prevLeaf.nextLeaf !== null) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextLeaf
		if (nextLeaf !== null && nextLeaf.prevLeaf !== null) {
			rechainNext = true;
		}

		// If NullLeaf's prevLeaf and nextLeaf are not null, chain them together
		if (rechainPrev && rechainNext) {
			// Check if prevLeaf and nextLeaf are chained
			// If chained do nothing
			// If not chained, create a LeafChain for unchain()
			if (chainedLeaf(prevLeaf, nextLeaf) === 0) {
				const lc = new LeafChain({
					startLeaf: prevLeaf.nextLeaf,
					endLeaf: nextLeaf.prevLeaf
				});
				// Chain original Leaves back together
				prevLeaf.nextLeaf = nextLeaf;
				nextLeaf.prevLeaf = prevLeaf;
				// Unchain LeafChain
				unchainLeaf(lc, !fromPast);
			}
		} else if (rechainPrev) {
			// NullLeaf is after a Leaf
			// Get current prevLeaf's nextLeaf
			const next = prevLeaf.nextLeaf;
			// Replace it with null value because of NullLeaf
			prevLeaf.nextLeaf = null;
			// Push replaced Leaf to stack
			unchainLeaf(next, !fromPast);
		} else if (rechainNext) {
			// NullLeaf is before a Leaf
			// Get current nextLeaf's prevLeaf
			const prev = nextLeaf.prevLeaf;
			// Replace it with null value becase of NullLeaf
			nextLeaf.prevLeaf = null;
			// Unchain the LeafChain before the nextLeaf
			const lc = new LeafChain({
				startLeaf: nextLeaf.parent.firstChild,
				endLeaf: prev
			});
			unchainLeaf(lc, !fromPast);
		}
		// Update parent firstChild if necessary (including DocumentRoot)
		if (prevLeaf === null) {
			if (nextLeaf.parent !== null) {
				nextLeaf.parent.firstChild = nextLeaf;
			}
		}
	} else if (instanceOf(l, 'LeafText')) {
		const { range, text } = l;

		const t1 = l.leaf.text.substring(0, range[0]);
		const t2 = l.leaf.text.substring(range[0], range[1]);
		const t3 = l.leaf.text.substring(range[1], l.leaf.text.length);
		// Re-apply text in LeafText.text
		l.leaf.text = `${t1}${text}${t3}`;
		// Create a new LeafText for history
		const lt = new LeafText({
			leaf: l.leaf,
			range: [range[0], range[0] + text.length],
			text: t2
		});
		// Unchain LeafText
		unchainLeaf(lt, !fromPast);
	}
}

/*
	consume:
		- Start from the current Leaf, remove its prevLeaf or nextLeaf,
		  concat removed Leaf's text before or after the current text respectivelly,
		- Consume zero-widths in text. If final Leaf is empty, make it zero-width.
		- Push the removed Leaf to history past stack, only if it's old.
		- Only new Leaf can consume other Leaves.
		- Only consume when two Leaves have the same styles, or at least one Leaf is zero-width.
		- consume() will mark a consumed dirty Leaf so that autoMergeLeaf won't be called on
		  Leaf.
		- consume() will not check if a Leaf has already been consumed or not. It's not its job.
	@ params
		leaf: Leaf object
		up: Boolean
	@ return
		continue: Boolean
			- true: successfully consumed
			- false: unable to consume
*/
export const _TRAVERSE_UP_ = true;
export const _TRAVERSE_DOWN_ = false;
export function consume(leaf: Leaf, up: boolean): boolean {
	if (leaf.new === false) {
		throw new Error('Only new Leaf can consume other Leaves.');
	}

	const l = leaf;

	if (up) {
		const { prevLeaf } = l;
		if (prevLeaf !== null) {
			// Check if consumable
			const consumable =
					sameLeafStyles(l, prevLeaf) ||
					isZeroLeaf(l) ||
					isZeroLeaf(prevLeaf);
			// Not consumable
			if (!consumable) return false;

			// Consumable
			if (isZeroLeaf(l)) {
				l.text = prevLeaf.text;
				// If current Leaf is zero-width, adopt consumed Leaf's styles
				copyLeafStyles(l, prevLeaf);
			} else if (!isZeroLeaf(prevLeaf)) {
				l.text = `${prevLeaf.text}${l.text}`;
			}
			// Get prevLeaf.prevLeaf
			const prevPrevLeaf = prevLeaf.prevLeaf;
			// Update current Leaf's prevLeaf to prevPrevLeaf
			l.prevLeaf = prevPrevLeaf;
			// If not null, update prevLeaf.prevLeaf.nextLeaf to current Leaf
			if (prevPrevLeaf !== null) {
				prevPrevLeaf.nextLeaf = l;
			} else {
				// If prevPrevLeaf is null, update parent's firstChild
				prevLeaf.parent.firstChild = l;
			}
			// If old, push prevLeaf to history past stack;
			if (prevLeaf.new === false) {
				unchainLeaf(prevLeaf, _PAST_STACK_);
			} else if (prevLeaf.consumed !== null) {
				// If not old, check if consumed attribute exists
				// It it does, mark consumed Leaf
				prevLeaf.consumed = true;
			}
			// Consumed successfully
			return true;
		}
		// prevLeaf is null, unable to consume, exit if block
	} else {
		const { nextLeaf } = l;
		if (nextLeaf !== null) {
			// Check if consumable
			const consumable =
					sameLeafStyles(l, nextLeaf) ||
					isZeroLeaf(l) ||
					isZeroLeaf(nextLeaf);
			// Not consumable
			if (!consumable) return false;

			// Consumable
			if (isZeroLeaf(l)) {
				l.text = nextLeaf.text;
				// If current Leaf is zero-width, adopt consumed Leaf's styles
				copyLeafStyles(l, nextLeaf);
			} else if (!isZeroLeaf(nextLeaf)) {
				l.text = `${l.text}${nextLeaf.text}`;
			}
			// Get nextLeaf.nextLeaf
			const nextNextLeaf = nextLeaf.nextLeaf;
			// Update current Leaf's nextLeaf to nextNextLeaf
			l.nextLeaf = nextNextLeaf;
			// If not null, update nextLeaf.nextLeaf.nextLeaf to current Leaf
			if (nextNextLeaf !== null) {
				nextNextLeaf.prevLeaf = l;
			}
			// If old, push nextLeaf to history past stack;
			if (nextLeaf.new === false) {
				unchainLeaf(nextLeaf, _PAST_STACK_);
			} else if (nextLeaf.consumed !== null) {
				// If not old, check if consumed attribute exists
				// It it does, mark consumed Leaf
				nextLeaf.consumed = true;
			}
			// Consumed successfully
			return true;
		}
		// nextLeaf is null, unable to consume, exit else block
	}
	return false;
}

//= Node Action Ops

/*
	applyBranchType
	applyNodeStyle
	applyNodesStyle
	applyBranchText (TODO)
*/

/*
	applyBranchType:
		1. Start iterating through selected LeafChains.
		2. Compare BranchTypes (shallow) and find the first LeafChain that has a different
		   BranchType.
		3. Set the Node at the index returned by the BranchType comparison as the EntryPoint.
		4. Shatter the LeafChain.
			- Save the first tree in shatter() result in a variable: "before".
			- If the first tree is not null:
				- Chain the second tree between the first and first's nextNode, using
				  chainNodeChainBetween().
			- Else:
				- Do nothing.
		5. Declare a "middle" variable to store new branches with the new BranchType.
			- Create a new Branch for "middle".
		6. Copy NodeStyles of the current LeafChain for the new Branch's last Node.
		7. Check if current LeafChain is the last in selections.
			- If not last, find the next LeafChain. Switch current LeafChain onto the new
			  Branch's last Node and set the Node as GrowPoint.
			- Else, done. Go to step 10.
		8. Starting from the new LeafChain's parent, check if its prevNode is the GrowPoint.
			- If it's the GrowPoint, no need to declare a new PhantomNode (no need to rechain).
			- If it's not, declare a new PhantomNode (no need to rechain).
		9. Check if the current Node is the last LeafChain.
			- If not last, find the next LeafChain.
				- If the next LeafChain is a sibling, switch current Node onto the GrowPoint
				  with nextNode unchanged.
					- If the NodeType changes, unchain a NodeType.
				- If not sibling, unchain a PhantomChain whose startNode is the last declared
				  PhantomNode and a new PhantomNode of the currentNode. Then switch current Node
				  onto the GrowPoint with nextNode as null.
					- NOTE: Need to check if its parent should be removed.
				- Set itself as the new GrowPoint.
				- Iterate to the next LeafChain, repeat step 8.
			- If last, switch onto the GrowPoint with nextNode as null. Unchain a PhantomChain.
			  Break out of the while loop. If growing on middle, set itself as the middleEnd,
			  and set its original nextNode as the middleNext. Done.
				- NOTE: Need to check if its parent should be removed.
		10. Replace the EntryPoint with "before" and "middle".
	@ params
		selections: Array<Leaf> - e.g. [first, last]
			- first and last are expected to be the first Leaves of their LeafChains.
		type: Array<number>
*/
export function applyBranchType(selections: Array<Leaf>, type: Array<number>): void {
	if (selections.length !== 2) return;

	const [firstLC, lastLC] = selections;
	let currentLC = firstLC;
	const targetBT = getBranchTypeFromArray(type);
	const currentBT = getBranchType(currentLC);
	let index = compareBranchType(currentBT, targetBT);
	// Step 1
	while (index < 0) {
		// Step 2
		if (currentLC === lastLC) break;
		currentLC = findNextLeafChain(currentLC, currentBT); // currentBT's branch will be modified
		index = compareBranchType(currentBT, targetBT);
	}
	// If no LeafChain with different BT is found, do nothing.
	if (index < 0) return;
	// Step 3
	const EntryPoint = currentBT.branch[index].ref;
	// Step 4 - shatter()
	const { first: before, second } = shatter(currentLC, EntryPoint);
	if (before !== null) {
		// If first tree is not null, first tree is the EntryPoint. Chain the second tree
		// between the first and first's nextNode, using chainNodeChainBetween().
		chainNodeChainBetween(second, second, before, before.nextNode);
	}
	// Step 5
	const { first: middle, last } = createNewBranchAt(type, index);
	const GrowType = last.nodeType;
	// Step 6
	copyNodeStyles(last, currentLC.parent);
	// Step 7
	let nextLC = null;
	let GrowPoint = null;
	// If growing on the "middle", middleEnd is the endNode of the "middle" chain, and
	// the middleNext is what it will be chained to.
	let middleEnd = middle;
	let middleNext = EntryPoint.nextNode;
	if (currentLC !== lastLC) {
		nextLC = getNextLeafChain(currentLC); // No need for findNextLeafChain()
		// Remeber current parent
		const currentParent = currentLC.parent;
		// Switch LeafChain
		// (setParentLink) Safe to use: last is new and has no child, currentLC detached
		switchParentNode(currentLC, last);
		// Remove old parent and stop at EntryPoint
		removeNode(currentParent, EntryPoint);
		// Set GrowPoint
		GrowPoint = last;
	}
	// Step 8
	currentLC = nextLC;
	let lastPhantom = null;
	while (currentLC !== null) {
		// Check if needed to unchain a PhantomNode
		const currentNode = currentLC.parent;
		if (currentNode.prevNode !== GrowPoint) {
			// lastPhantom here is never null because the first GrowPoint is always a
			// new Node
			lastPhantom = new PhantomNode(currentNode);
		}
		// Step 9
		if (currentLC !== lastLC) {
			// nextLC here is never null because lastLC exists
			nextLC = getNextLeafChain(currentLC);
			// Check if next LeafChain is a sibling
			if (currentNode.nextNode === nextLC.parent) {
				// Only update parent and nodeType if prevNode is already GrowPoint
				if (currentNode.prevNode !== GrowPoint) {
					// Switch current Node onto the GrowPoint with nextNode unchanged
					currentNode.prevNode = GrowPoint;
					GrowPoint.nextNode = currentNode;
				}
				// Set parent
				currentNode.parent = GrowPoint.parent;
				// If NodeType changes, unchain a NodeType
				if (currentNode.nodeType !== GrowType) {
					const nt = new NodeType(currentNode.nodeType, currentNode);
					unchainNode(nt, _PAST_STACK_);
					// Set NodeType
					currentNode.nodeType = GrowType;
				}
			} else {
				const tempPrev = lastPhantom.prevNode;
				const tempNext = currentNode.nextNode;
				const tempParent = currentNode.parent;
				// Unchain a PhantomChain using the last declared PhantomNode and the
				// PhantomNode of the currentNode
				const pc = new PhantomChain({
					startNode: lastPhantom,
					endNode: new PhantomNode(currentNode)
				});
				unchainNode(pc, _PAST_STACK_);
				// Check if needed to remove old parent
				if (tempPrev === null && tempNext === null) {
					removeNode(tempParent);
				} else {
					if (tempPrev === null) {
						setFirstChild(tempParent, tempNext);
					} else {
						tempPrev.nextNode = tempNext;
					}
					if (tempNext !== null) {
						tempNext.prevNode = tempPrev;
					}
				}
				// Switch current Node onto the GrowPoint with nextNode as null
				currentNode.prevNode = GrowPoint;
				GrowPoint.nextNode = currentNode;
				currentNode.parent = GrowPoint.parent;
				currentNode.nodeType = GrowType;
				currentNode.nextNode = null;
			}
			// Set current Node as the new GrowPoint
			GrowPoint = currentNode;
			// Iterate to the next LeafChain
			currentLC = nextLC;
		} else {
			const tempPrev = lastPhantom.prevNode;
			const tempNext = currentNode.nextNode;
			const tempParent = currentNode.parent;
			// Unchain a PhantomChain using the last declared PhantomNode and the
			// PhantomNode of the currentNode
			const pc = new PhantomChain({
				startNode: lastPhantom,
				endNode: new PhantomNode(currentNode)
			});
			unchainNode(pc, _PAST_STACK_);
			// Check if needed to remove old parent
			if (tempPrev === null && tempNext === null) {
				removeNode(tempParent);
			} else {
				if (tempPrev === null) {
					setFirstChild(tempParent, tempNext);
				} else {
					tempPrev.nextNode = tempNext;
				}
				if (tempNext !== null) {
					tempNext.prevNode = tempPrev;
				}
			}
			// Switch current Node onto the GrowPoint with nextNode as null
			currentNode.prevNode = GrowPoint;
			GrowPoint.nextNode = currentNode;
			currentNode.parent = GrowPoint.parent;
			currentNode.nodeType = GrowType;
			currentNode.nextNode = null;
			// If growing on the "middle", update middleEnd and middleNext.
			// middleNext is the last Node's original next Node, if its new parent
			// is the same as that next Node's parent. Otherwise, middleNext is null.
			if (middle === last) {
				middleEnd = currentNode;
				if (tempNext !== null && currentNode.parent === tempNext.parent) {
					middleNext = tempNext;
				} else {
					middleNext = null;
				}
			}
			// Done
			break;
		}
	}
	// Step 10
	if (EntryPoint.prevNode === null && middleNext === null) {
		// EntryPoint is the only Node -> unchain a ParentLink
		const p = EntryPoint.parent || DocumentRoot;
		const pl = new ParentLink(EntryPoint, EntryPoint.parent);
		unchainNode(pl, _PAST_STACK_);
		p.firstChild = null;
		// Safe to use: middle is new and has no parent, EntryPoint unchained.
		setParentLink(middle, EntryPoint.parent);
	} else {
		chainNodeChainBetween(middle, middleEnd, before || EntryPoint.prevNode, middleNext);
	}
}

/*
	applyNodeStyle:
		- Update old NodeStyles with new NodeStyles, not replace.
		- Only works on old Node.
		- Unchain old NodeStyles if different. Do nothing if same .
	@ param
		Node: Node object
		newStyles: Object
*/
export function applyNodeStyle(node: Node, newStyles: Object = {}): void {
	if (node.new === true) {
		throw new Error('applyNodeStyle() only works on old Nodes.');
	}

	const n = node;
	const { styles } = n;
	const { ...oldStyles } = styles;
	const newNodeStyles = new NodeStyles({ ...oldStyles, ...newStyles });
	// If applying same styles, do nothing.
	if (styles.hash === newNodeStyles.hash) return;

	// Assign new styles, unchain old NodeStyles, and make it reference current Node
	n.styles = newNodeStyles;
	styles.ref = node;
	unchainNode(styles, _PAST_STACK_);
}

/*
	applyNodesStyle:
		- Iterate though Nodes in selections and apply new NodeStyles.
	@ params
		selections: Array<Leaf>
		newStyles: Object
*/
export function applyNodesStyle(selections: Array<Leaf>, newStyles: Object = {}): void {
	if (selections.length !== 2) return;

	const [startLC, endLC] = selections;
	let currentLC = startLC;
	while (currentLC !== null) {
		applyNodeStyle(currentLC.parent, newStyles);
		if (currentLC === endLC) {
			break;
		} else {
			currentLC = getNextLeafChain(currentLC);
		}
	}
}

//= Leaf Action Helpers

/*
	autoMergeLeaf
	autoMergeDirtyLeaves
	mergeLeafTexts
*/

/*
	DirtyNewLeaves
		- This array stores references to newly created Leaves that should be called autoMergeLeaf
		- Don't iterate through this. Just pop and call autoMergeLeaf.
			- Do NOT call autoMergeLeaf on Leaves that have already been merged.
*/
export const DirtyNewLeaves = [];

/*
	autoMergeLeaf:
		- Consume adjacent leaves (use consume()), by first traversing up.
		- If unable to consume, traverse down.
		- If still unable to consume, stop.
		- Current Leaf must be new, or it will throw error.
		- Only call autoMergeLeaf after applyStyle is finished on all leaves
		- autoMergeLeaf is called on all new Leaves in DirtyNewLeaves
			- autoMergeLeaf should skip new Leaves that have already been merged.
	@ params
		leaf: Leaf object
*/
export function autoMergeLeaf(leaf: Leaf): void {
	if (leaf.new === false) {
		throw new Error('autoMergeLeaf must be called on a new Leaf.');
	}
	while (consume(leaf, true));
	while (consume(leaf, false));
}

/*
	autoMergeDirtyLeaves:
		- An abstraction for iterating through DirtyNewLeaves and call autoMergeLeaf()
		  on each.
*/
export function autoMergeDirtyLeaves(): void {
	while (DirtyNewLeaves.length > 0) {
		const dirtyLeaf = DirtyNewLeaves.pop();
		if (dirtyLeaf.consumed !== true) {
			autoMergeLeaf(dirtyLeaf);
		}
		dirtyLeaf.consumed = null;
	}
}

/*
	mergeLeafTexts:
		- Merge leafText into targetLeafText if:
			- leafText and targetLeafText reference the same Leaf.
			- leafText's range begins right after targetLeafText's range.
		- Merge consecutive "Delete" operations.
		- Merge consecutive "Backspace" operations.
		- Return true if merged successfully, else false.
	@ params
		leafText: LeafText object
		targetLeafText: LeafText object
	@ return
		success: Boolean
*/
export function mergeLeafTexts(leafText: LeafText, targetLeafText: LeafText): boolean {
	if (leafText.leaf !== targetLeafText.leaf) return false;

	const lt = leafText;
	const tlt = targetLeafText;

	// Merge "Backspace"
	// Dude + Backspace at 4,4 = Dud -> lt1: [3,3], 'e'
	// Dud + Backspace at 3,3 = Du -> lt2: [2,2], 'd'
	// lt2 * lt1 = [2,2], 'de'
	// Undo
	// Du + lt2 * lt1 = Dude -> lt3`: [2,4], ''
	// Redo
	// Dude + lt3` = Du -> l4: [2,2], 'de'
	if (targetLeafText.range[0] === targetLeafText.range[1] && targetLeafText.text.length === 1 &&
		leafText.range[0] === leafText.range[1] && leafText.text.length === 1 &&
		targetLeafText.range[0] - 1 === leafText.range[0]) {
		/* eslint-disable */
		tlt.range[0] = lt.range[0];
		tlt.range[1] = lt.range[1];
		/* eslint-enable */
		tlt.text = `${lt.text}${tlt.text}`;
		return true;
	}

	// Merge "Delete"
	// Dude + Delete at 0,0 = ude -> lt1: [0,0], 'D'
	// ude + Delete at 0,0 = de -> lt2: [0,0], 'u'
	// lt2 * lt1 = [0,0], 'Du'
	//
	// Normal merge and "Delete" merge work the same.
	if (leafText.range[0] !== targetLeafText.range[1]) return false;
	/* eslint-disable */
	tlt.range[1] = lt.range[1];
	/* eslint-enable */
	tlt.text = `${tlt.text}${lt.text}`;

	return true;
}

//= Leaf Action Ops

/*
	applyLeafStyle
	applyLeavesStyle $(arguments changed)
	applyLeafText (Incomplete)
	applyText (Incomplete) -> applyLeavesText
*/

/*
	applyLeafStyle:
		- Create three new Leaf objects with the middle one adopting new styles.
			- New styles update old styles, not replace. (e.g. bold -> italic = bold & italic)
		- Discard new Leaves that are zero-width
		- Replace the old Leaf in the chain with the new one(s)
		- Unchain the old leaf - it means putting it into the history
			- Old Leaf is pushed into a temporary history step object
		- Push new Leaf(s) into a dirty stack
			- Every new Leaf in the dirty stack will be called autoMergeLeaf
			- Give each dirty Leaf a consumed attribute, so that autoMergeLeaf will
			  skip already consumed dirty Leaves.
		- If range width is 0, do nothing. (This is handled by applyCaretStyle)
		- Applying the same style does nothing.
		- applyLeafStyle() only works on old Leaves.
	@ params
		leaf: Leaf object
		range: Array object - default: [0, 0]
		newStyles: Object - default: {}
			- bold: Boolean
			- italic: Boolean
			- underline: Boolean
*/
export function applyLeafStyle(
	leaf: Leaf,
	range: Array<number> = [0, 0],
	newStyles: Object = {}
): void {
	if (leaf.new === true) {
		throw new Error('applyLeafStyle() only works on old Leaves.');
	}

	const r = trimRange(leaf, range);
	// If range width is 0, do nothing. (This is handled by applyCaretStyle)
	if (r[0] === r[1]) return;

	const { text, styles, prevLeaf, nextLeaf, parent } = leaf;
	const { ...oldStyles } = styles;
	const newLeafStyles = new LeafStyles({ ...oldStyles, ...newStyles });
	// If applying same styles, do nothing.
	if (styles.hash === newLeafStyles.hash) return;

	const t1 = text.substring(0, r[0]);
	const t2 = text.substring(r[0], r[1]);
	const t3 = text.substring(r[1], text.length);

	let l1 = new Leaf({
		text: t1,
		styles: new LeafStyles({ ...oldStyles }),
		parent,
		prevLeaf
	});
	let l2 = new Leaf({
		text: t2,
		styles: newLeafStyles,
		prevLeaf: l1,
		parent
	});
	let l3 = new Leaf({
		text: t3,
		styles: new LeafStyles({ ...oldStyles }),
		prevLeaf: l2,
		nextLeaf,
		parent
	});

	// Replace leaf with l1-l2-l3, and check if needed to update its parent's firstChild
	l1.nextLeaf = l2;
	l2.nextLeaf = l3;
	let setFirstChild = false;
	if (prevLeaf !== null) {
		prevLeaf.nextLeaf = l1;
	} else {
		setFirstChild = true;
	}
	if (nextLeaf !== null) {
		nextLeaf.prevLeaf = l3;
	}

	// Discard zero-wdith new Leaves
	if (isZeroLeaf(l1)) {
		l1 = destroyLeaf(l1);
	}
	if (isZeroLeaf(l2)) {
		l2 = destroyLeaf(l2);
	}
	if (isZeroLeaf(l3)) {
		l3 = destroyLeaf(l3);
	}

	// Unchain(this) -> put this into history stack
	unchainLeaf(leaf, _PAST_STACK_);

	// Put newly created Leaves into dirty stack
	// Also, set the consumed attribute, which will be set to null after autoMergeLeaf
	// Update parent's fristChild if necessary
	if (l1 !== null) {
		l1.consumed = false;
		DirtyNewLeaves.push(l1);
		if (setFirstChild) {
			parent.firstChild = l1;
			setFirstChild = false;
		}
	}
	if (l2 !== null) {
		l2.consumed = false;
		DirtyNewLeaves.push(l2);
		if (setFirstChild) {
			parent.firstChild = l2;
			setFirstChild = false;
		}
	}
	if (l3 !== null) {
		l3.consumed = false;
		DirtyNewLeaves.push(l3);
		if (setFirstChild) {
			parent.firstChild = l3;
			setFirstChild = false;
		}
	}
}

/*
	applyLeavesStyle:
		- Apply new styles to a selection of Leaves.
		- Skip autoMergeLeaf() on dirty Leaves already consumed.
			- Delete consumed attribute on dirty Leaves after autoMergeLeaf().
	@ params
		selections: Array<Object>
			- leaf: leaf Object
			- range: Array<number>
		newStyles: Object (LeafStyles props)
*/
export function applyLeavesStyle(selections: Array<Object>, newStyles: Object): void {
	if (selections.length !== 2) return;
	// Iterate through Leaves in selections, and call applyLeafStyle on each.
	const [firstSelection, lastSelection] = selections;
	let currentL = firstSelection.leaf;
	let currentR = firstSelection.range;
	let last = currentL === lastSelection.leaf;
	while (currentL !== null) {
		applyLeafStyle(currentL, currentR, newStyles);
		if (last) {
			break;
		} else {
			// Get the next Leaf
			if (currentL.nextLeaf !== null) {
				currentL = currentL.nextLeaf;
			} else {
				// If next Leaf is null, get the first Leaf of the next LeafChain
				currentL = getNextLeafChain(currentL);
			}
			// Get range. If not the last Leaf in selections, use full range.
			if (currentL !== null) {
				last = currentL === lastSelection.leaf;
				if (last) {
					currentR = lastSelection.range;
				} else {
					currentR = [0, currentL.text.length];
				}
			}
		}
	}
	// autoMergeLeaf
	autoMergeDirtyLeaves();
}

/*
	applyLeafText:
		- Replace part of Leaf.text specified in range with the new text, even if
		  the resulting text is the same as the old one.
		- Create a new LeafText object to be pushed into history stack
		- If range covers the entire Leaf and the new text is empty, manually unchain and replace it
		  with a new zero-width Leaf.
		- If two adjacent LeafTexts in History Step can be merged, merge them.
			- There's no need to merge in rechain().
		- applyLeafText() only works on old Leaves.
		- Applying empty string '' to a zero-width range, such as [0,0], does nothing.
		- If leaf is zero-width and new text is not empty, make range cover the whole leaf.
		- Don't worry about zero-width characters in new text.
	@ params
		leaf: Leaf object
		range: Array<number> - default: [0, 0]
		text: String
		options: null or String or Object - default: null
*/
export function applyLeafText(
	leaf: Leaf,
	range: Array<number> = [0, 0],
	text: string
): void {
	if (leaf.new === true) {
		throw new Error('applyLeafText() only works on old Leaves.');
	}

	const r = trimRange(leaf, range);
	const l = leaf;

	// If leaf is zero-width and new text is empty, do nothing.
	// Else, force range to cover the whole leaf.
	// Deleting a lone and zero-width Leaf is handled by BlankNode (TODO)
	if (isZeroLeaf(l)) {
		if (text === '') return;
		r[0] = 0;
		r[1] = l.text.length;
	}

	// For "Backspace" at [5,5] for example, the range is changed to [4,5]
	// For "Delete" at [0,0] for example, the range is changed to [0,1]
	// Range change is not handled here.

	// Applying empty string '' to a zero-width range, such as [0,0], do nothing.
	if (text === '' && r[0] === r[1]) return;

	// If range covers the whole Leaf and new text is empty, unchain and replace it
	// with a new zero-width Leaf, then auto merge.
	if (r[1] - r[0] === l.text.length && text === '') {
		// If current Leaf is the only Leaf, BlankBlock is needed for the chaining to work (TODO)
		// Right now, don't worry about it.
		const zl = new Leaf();
		zl.prevLeaf = l.prevLeaf;
		zl.nextLeaf = l.nextLeaf;

		if (l.prevLeaf !== null) {
			l.prevLeaf.nextLeaf = zl;
		}
		if (l.nextLeaf !== null) {
			l.nextLeaf.prevLeaf = zl;
		}

		unchainLeaf(leaf, _PAST_STACK_);

		zl.consumed = false;
		DirtyNewLeaves.push(zl);
		autoMergeDirtyLeaves();
		return;
	}

	const t1 = l.text.substring(0, r[0]);
	const t2 = l.text.substring(r[0], r[1]);
	const t3 = l.text.substring(r[1], l.text.length);

	l.text = `${t1}${text}${t3}`;

	const lt = new LeafText({
		leaf,
		range: [r[0], r[0] + text.length],
		text: t2
	});

	// Check if LeafText can be merged with the latest unchained element
	const len = TempHistoryPastStep.stack.length;
	let merged = false;
	if (len > 0) {
		const e = TempHistoryPastStep.stack[len - 1];
		if (instanceOf(e, 'LeafText')) {
			merged = mergeLeafTexts(lt, e);
		}
	}

	if (!merged) unchainLeaf(lt, _PAST_STACK_);
}

/*
	NOTE: Need applyBranchText() to be implemented (TODO)

	NOTE 2: Need to handle newline character in string as replacement (TODO)

	applyText: (Action)
		- Replace the entire selections with either pure text or a LeafChain
		- There are four scenarios:
			1. selections only contain 1 element and replacement is string.
				- Simply change the text, and create LeafText for history
			2. selections have more than 1 element or replacement is a LeafChain, or both.
				- Unchain everything.
				- Turn first Leaf into a new "fist Leaf".
				- Turn last Leaf into a new "last Leaf".
					- First and last Leaves can be the same Leaf.
				- If replacement is a string, concat it after the new "first Leaf".
					- This means replacement is unstyled text, for example, copied & pasted from
					  Notepad or any unrecognized external source.
					- Copy & paste from BlankEditor should always use LeafChain.
						- Or don't. It depends on user experience.
				- If replacement is a LeafChain, manually chain it between first and last Leaf.
					- Assume LeafChain has been autoMergeLeaf().
				- Auto merge all dirty Leaves.
		- Note: new Leaves except for the first Leaf should not have parent.
	@ params
		selections: Array<Object>
			- leaf: Leaf object
			- range: Array<number>
		replacement: string | LeafChain
*/

export function applyText(selections: Array<Object>, replacement: string | LeafChain): void {
	if (selections.length === 0) return;

	const r = replacement;

	if (selections.length === 1 && (typeof r) === 'string') {
		const { leaf, range } = selections[0];
		applyLeafText(leaf, range, r);
	} else {
		const firstSelection = selections[0];
		const lastSelection = selections[selections.length - 1];

		const { leaf: firstLeaf, range: firstRange } = firstSelection;
		const { ...firstLeafStylesProps } = firstLeaf.styles;
		const { leaf: lastLeaf, range: lastRange } = lastSelection;
		const { ...lastLeafStylesProps } = lastLeaf.styles;

		// Create new first Leaf (omit nextLeaf for now)
		const l1 = new Leaf({
			text: firstLeaf.text.substring(0, firstRange[0]),
			styles: new LeafStyles({ ...firstLeafStylesProps }),
			prevLeaf: firstLeaf.prevLeaf
		});
		if (firstLeaf.prevLeaf !== null) {
			firstLeaf.prevLeaf.nextLeaf = l1;
		}
		// Create new last Leaf (omit prevLeaf for now)
		const l3 = new Leaf({
			text: lastLeaf.text.substring(lastRange[1], lastLeaf.text.length),
			styles: new LeafStyles({ ...lastLeafStylesProps }),
			nextLeaf: lastLeaf.nextLeaf
		});
		if (lastLeaf.nextLeaf !== null) {
			lastLeaf.nextLeaf.prevLeaf = l3;
		}

		// If replacement is a string, concat it after l1.text
		if ((typeof r) === 'string') {
			l1.text = `${l1.text}${r}`;
			// Chain l1 and l3 together
			l1.nextLeaf = l3;
			l3.prevLeaf = l1;
		} else {
			// Manually chain LeafChain between l1 and l3
			// Do not use ChainBetween or ChainBetweenDangerous, because l1 and l3
			// are not chained.
			l1.nextLeaf = r.startLeaf;
			r.startLeaf.prevLeaf = l1;
			r.endLeaf.nextLeaf = l3;
			l3.prevLeaf = r.endLeaf;
		}

		// Unchain everything in selections
		for (const selection of selections) {
			unchainLeaf(selection.leaf, _PAST_STACK_);
		}

		// Push new Leaves to dirty stack
		// Assume LeafChain is not dirty
		l1.consumed = false;
		DirtyNewLeaves.push(l1);
		l3.consumed = false;
		DirtyNewLeaves.push(l3);

		// autoMergeLeaf
		autoMergeDirtyLeaves();
	}
}

//= History Action Ops

/*
	undo
	redo
*/

/*
	undo:
		- If past stack is empty, do nothing
		- Else pop
		- Iterate
		- Rechain
*/
export function undo(): void {
	if (History.stackPast.length === 0) return;
	const pastStep = History.pop(_FROM_PAST_);
	// Iterate through pastStep
	while (pastStep.stack.length > 0) {
		const element = pastStep.pop();
		rechainLeaf(element, _FROM_PAST_);
		rechainNode(element, _FROM_PAST_);
	}
}

/*
	redo:
		- If future stack is empty, do nothing
		- Else pop
		- Iterate
		- Rechain
*/
export function redo(): void {
	if (History.stackFuture.length === 0) return;
	const futureStep = History.pop(_FROM_FUTURE_);
	// Iterate through futureStep
	while (futureStep.stack.length > 0) {
		const element = futureStep.pop();
		rechainLeaf(element, _FROM_FUTURE_);
		rechainNode(element, _FROM_FUTURE_);
	}
}
