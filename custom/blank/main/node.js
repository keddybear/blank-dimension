// @flow

// Node type enum
export const NodeTypes = {
	PARAGRAPH: 0
};

let BlankCounterExists = false;
export class BlankElementCounter {
	/*
		A simple class to generate unique id for Node and Leaf. Only one instance can
		be created.

		NOTE: When the document is saved, ids are not saved, because the document tree
		will be rebuilt when it's loaded and new ids will be generated, starting from
		1.
	*/

	/*
		@ attributes
		value: number
	*/
	value: number;

	/*
		@ methods
		get
	*/

	/*
		constructor
	*/
	constructor() {
		if (BlankCounterExists === true) {
			throw new Error('Only one instance of BlankElementCounter can be created.');
		}
		BlankCounterExists = true;

		this.value = 0;
	}

	/*
		get:
			- Increase counter by 1 and return the new value.
		@ return
			value: number
	*/
	get(): number {
		this.value += 1;
		return this.value;
	}
}

export const BlankCounter = new BlankElementCounter();

// Authors and readers are allowed to customize their own default styles.
export const DefaultNodeStyles = {};
export class NodeStyles {
	/*
		NodeStyles are for Nodes whose children are Leaves.

		NOTE: If you change NodeStyles attributes, you need to update setNodeStyles().
	*/

	/*
		@ attributes
		fontFamily: number - default: 0 (Use number for presets)
		fontSize: string - default: 16px
		textAlignment: number - default: 0
			- 0: Left
			- 1: Center
			- 2: Right
		lineHeight: string - 1.6em
		hash: string - calculated from attributes
		ref: Node | null - default: null
		NodeStyles: Boolean - default: true
	*/
	fontFamily: number;
	fontSize: string;
	textAlignment: number;
	lineHeight: string;
	hash: string;
	ref: Node | null;
	NodeStyles: boolean;

	/*
		constructor
		@ params
			props: Object - default: {}
				- attributes (optional)
	*/
	constructor(styleProps: Object = {}) {
		const defaultProps = DefaultNodeStyles || {};

		this.fontFamily = styleProps.fontFamily || defaultProps.fontFamily || 0;
		this.fontSize = styleProps.fontSize || defaultProps.fontSize || '16px';
		this.textAlignment = styleProps.textAlignment || defaultProps.textAlignment || 0;
		this.lineHeight = styleProps.lineHeight || defaultProps.lineHeight || '1.6em';

		// Get hash
		this.hash = `${this.fontSize}-${this.lineHeight}-${this.fontFamily}-${this.textAlignment}`;

		// ref is used in rechainNode()
		this.ref = null;

		// Identity check
		this.NodeStyles = true;
	}
}

// DOM Element attributes
export const NodeDataAttributes = {
	// NODE_KEY_ATTR: Attached to the root Element when rendering a Node. Value: Node.id
	NODE_KEY_ATTR: 'data-node-key',
	NODE_KEY_ATTR_CAMEL: 'nodeKey'
};

export class Node {
	/*
		Nodes can be recursively nested.
		NodeType is a separate style from NodeStyles.
		NodeStyles of Nodes whose children are Nodes should be null.
	*/

	/*
		@ attributes
		styles: NodeStyles object - default: new NodeStyles()
		nodeType: number - default: 0
			- 0: Paragraph
			- 1: Quote
			- 2: Ordered List
			- 3: Unordered List
		branchType: Array<number> - default: null;
		prevNode: Node object - default: null
		nextNode: Node object - default: null
		firstChild: any - default: null
			- Node
			- Leaf
			- ...
		new: Boolean - default true
		Node: Boolean - default true
		id: number
		renderPos: number | null - default: null
		dirty: number - default: 0
	*/
	styles: NodeStyles | null;
	nodeType: number;
	prevNode: Node | null;
	nextNode: Node | null;
	firstChild: any | null;
	parent: Node | null;
	new: boolean;
	Node: boolean;
	id: number; // unique id
	renderPos: number | null;
	dirty: number;

	/*
		constructor
		@ params
			props: Object - default: {}
				- attributes (optional)
	*/
	constructor(props: Object = {}) {
		this.styles = props.styles || null;
		this.prevNode = props.prevNode || null;
		this.nextNode = props.nextNode || null;
		this.nodeType = props.nodeType || NodeTypes.PARAGRAPH;
		// When created, firstChild is always null. Manually assign this.
		this.firstChild = null;
		// When created, parent is always null. Manually assign this.
		this.parent = null;

		// Once created, Node is always new
		this.new = true;

		// Identity check
		this.Node = true;

		// Id
		this.id = BlankCounter.get();

		// Render attributes
		this.renderPos = null;
		this.dirty = 0;
	}
}

export class NullNode {
	/*
		Similar to NullLeaf
	*/

	/*
		@ attributes
		prevNode: Node object - default: null
		nextNode: Node object - default: null
		NullNode: Boolean - default: true
	*/
	prevNode: Node | null;
	nextNode: Node | null;
	NullNode: boolean;

	/*
		constructor
			- Either prevNode or nextNode or both can be a Node. They must not all be null.
		@ params
			props: Object - default: {}
				- prevNode: Node object (optional)
				- nextNode: Node object (optional)
	*/
	constructor(props: Object = {}) {
		this.prevNode = props.prevNode || null;
		this.nextNode = props.nextNode || null;

		if (this.prevNode === null && this.nextNode === null) {
			throw new Error('A NullNode with no Nodes is useless.');
		}

		if (this.prevNode === this.nextNode) {
			throw new Error('A NullLeaf\'s nextNode and prevNode must not be the same Node.');
		}

		// Identity check
		this.NullNode = true;
	}
}

export class NodeChain {
	/*
		Similar to LeafChain
	*/

	/*
		@ attributes
		startNode: Node object - default: null
		endNode: Node object - default: null
		prevNode: Node object - default: null
		nextNode: Node object - default: null
		NodeChain: Boolean - default: true
	*/
	startNode: Node | null;
	endNode: Node | null;
	prevNode: Node | null;
	nextNode: Node | null;
	NodeChain: boolean;

	/*
		constructor
		@ params
			props: Object - default: {}
				- startNode: Node object
				- endNode: Node object
	*/
	constructor(props: Object = {}) {
		this.startNode = props.startNode || null;
		this.endNode = props.endNode || null;

		if (this.startNode === null || this.endNode === null) {
			throw new Error('The startNode and endNode of a NodeChain must not be null.');
		}

		if (this.startNode !== this.endNode) {
			if (this.startNode.nextNode === null) {
				throw new Error('In a NodeChain, if not same as endNode, startNode.nextNode must not be null.');
			}
			if (this.endNode.prevNode === null) {
				throw new Error('In a NodeChain, if not same as startNode, endNode.prevNode must not be null.');
			}
		}

		this.prevNode = this.startNode.prevNode;
		this.nextNode = this.endNode.nextNode;

		// Identity check
		this.NodeChain = true;
	}
}

export class NodeType {
	/*
		A value pair: type - Node.NodeStyles.nodeType, ref: Node, where ref can be null.

		NodeType is the nodeType of a Node's NodeStyles. It decides the branch structre of
		a Node, while other attributes in NodeStyles only affect the styles of a Leaf's
		immediate parent.
	*/

	/*
		@ attributes
		type: number
		ref: Node object - default: null
		NodeType: Boolean - default: true
	*/
	type: number;
	ref: Node | null;
	NodeType: boolean;

	/*
		constructor
		@ params
			type: number
			ref: Node object - default: null
	*/
	constructor(type: number, ref: Node | null = null) {
		this.type = type;
		this.ref = ref;

		// Identity check
		this.NodeType = true;
	}
}

export class BranchType {
	/*
		BranchType is an array of NodeTypes, describing all nodes before a LeafChain.
		They can be shallow-compared or deep-compared with each other:
			- Shallow-compare only checks NodeType.type.
			- Deep-compare checks both NodeType.type and ref.
	*/

	/*
		@ attributes
		branch: Array<NodeType>
		BranchType: Boolean - default: true
	*/
	branch: Array<NodeType>;
	BranchType: boolean;

	/*
		constructor
		@ params
			branch: Array<NodeType> - default: []
	*/
	constructor(branch: Array<NodeType> = []) {
		this.branch = branch;

		// Identity check
		this.BranchType = true;
	}
}

export class PhantomNode {
	/*
		PhantomNode stores a Node's original attributes before the Node is moved to a
		different position in the tree (different parent).

		Using PhantomNode means switching the original Node onto a different chain or
		parent in the tree, so you must manually ensure it's SAFE to do so.

		The definition of "not safe" is: you switch the Node onto a chain that will be
		modified later.

		PhantomNode is used in shatter() and PhantomChain for rechain().

		PhantomNode remembers prevNode, nextNode, parent, and NodeType. It does not
		remember firstChild or nodeStyles.
	*/

	/*
		@ attributes
		ref: Node object
		prevNode: Node object
		nextNode: Node object
		nodeType: Number
		parent: Node object
		PhantomNode: Boolean
	*/
	ref: Node;
	prevNode: Node | null;
	nextNode: Node | null;
	nodeType: number;
	parent: Node | null;
	PhantomNode: boolean;

	/*
		constructor
		@ params
			node: Node object
	*/
	constructor(node: Node) {
		this.ref = node;
		this.prevNode = node.prevNode;
		this.nextNode = node.nextNode;
		this.nodeType = node.nodeType;
		this.parent = node.parent;

		// Identity check
		this.PhantomNode = true;
	}
}

export class PhantomChain {
	/*
		PhantomChain use PhantomNodes as its startNode and endNode.

		Rechain a PhantomChain will unchain another PhantomChain. If parent is different,
		it will set the parent values of all its Nodes.
	*/

	/*
		@ attributes
		startNode: PhantomNode - default: null
		endNode: PhantomNode - default: null
		prevNode: Node - default: null
		nextNode: NOde - default: null
		PhantomNode: Boolean
	*/
	startNode: PhantomNode | null;
	endNode: PhantomNode | null;
	prevNode: Node | null;
	nextNode: Node | null;
	PhantomChain: boolean;

	/*
		constructor
		@ params
			props: Object - default: {}
				- startNode: PhantomNode object
				- endNode: PhantomNode object
	*/
	constructor(props: Object = {}) {
		this.startNode = props.startNode || null;
		this.endNode = props.endNode || null;

		if (this.startNode === null || this.endNode === null) {
			throw new Error('The startNode and endNode of a PhantomChain must not be null.');
		}

		if (this.startNode.ref !== this.endNode.ref) {
			if (this.startNode.nextNode === null) {
				throw new Error('In a PhantomChain, if not referencing the same Node, startNode must have a nextNode.');
			}
			if (this.endNode.prevNode === null) {
				throw new Error('In a PhantomChain, if not referencing the same Node, endNode must have a prevNode.');
			}
		}

		this.prevNode = this.startNode.prevNode;
		this.nextNode = this.endNode.nextNode;

		// Identity check
		this.PhantomChain = true;
	}
}

export const BLANK_EDITOR_ID = 'blank-editor';
export class RootNode {
	/*
		RootNode is the document root of BlankEditor.

		Nodes whose parents are RootNode have null as parent.

		Its "container" stores the reference to the root HTMLElement for BlankEditor. (TODO)
	*/

	/*
		@ attributes
		firstChild: Node object
		new: boolean
		container: HTMLElement | null
		RootNode: Boolean
		renderPos: number | null - default: null
		dirty: number - default: 0
	*/
	firstChild: Node | null;
	new: boolean;
	container: HTMLElement | null; // TODO (Should not be null)
	RootNode: boolean;
	renderPos: number | null;
	dirty: number;

	/*
		constructor
	*/
	constructor() {
		this.firstChild = null;
		// RootNode is always old
		this.new = false;

		// Temporary (TODO)
		this.container = (typeof window !== 'undefined' && window.document) ?
			window.document.getElementById(`${BLANK_EDITOR_ID}`) : null;

		// Identity check
		this.RootNode = true;

		// Render attributes
		this.renderPos = null;
		this.dirty = 0;
	}
}

export const DocumentRoot = new RootNode();
