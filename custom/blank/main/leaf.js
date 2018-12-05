// @flow
import { Node, BlankCounter } from './node';

export class LeafStyles {
	/*
		NOTE: If you change LeafStyles attributes, you need to update setLeafStyles() and
		applyCaretStyle().

		Modifying old Leaves' LeafStyles without creating new Leaves is not allowed, because
		leaves with the same styles need to be merged and only new leaves can be merged.
	*/

	/*
		@ attributes
		bold: Boolean - default: false
		italic: Boolean - default: false
		underline: Boolean - default: false
		hash: Integer - calcuated from properties
		LeafStyles: Boolean - default: true
	*/
	bold: boolean;
	italic: boolean;
	underline: boolean;
	hash: number;
	LeafStyles: boolean;

	/*
		constructor
		@ params
			props: Object - default: {}
				- bold: Boolean (optional)
				- italic: Boolean (optional)
				- underline: Boolean (optional)
	*/
	constructor(props: Object = {}) {
		this.bold = props.bold || false;
		this.italic = props.italic || false;
		this.underline = props.underline || false;

		const b = this.bold ? 2 ** 1 : 0;
		const i = this.italic ? 2 ** 2 : 0;
		const u = this.underline ? 2 ** 3 : 0;

		// exmaple: 000 - false, false, false; 010 - false, true, false
		this.hash = b + i + u;

		// Identity check
		this.LeafStyles = true;
	}
}

// This is the current LeafStyles on Caret.
export const CaretStyle = new LeafStyles();

/*
	applyCaretStyle:
		- Simply update the attributes of CaretStyle, which is a LeafStyles object.
		- Do not create a new object, since CaretStyle is a constant.
	@ params
		props: LeafStyles | Object - default: {}
*/
export function applyCaretStyle(props: LeafStyles | Object = {}): void {
	const cs = CaretStyle;
	if (props.bold !== undefined) cs.bold = props.bold;
	if (props.italic !== undefined) cs.italic = props.italic;
	if (props.underline !== undefined) cs.underline = props.underline;
	// Update hash
	const b = cs.bold ? 2 ** 1 : 0;
	const i = cs.italic ? 2 ** 2 : 0;
	const u = cs.underline ? 2 ** 3 : 0;
	cs.hash = b + i + u;
}

// DOM Element attributes
export const LeafDataAttributes = {
	// LEAF_KEY_ATTR: Attached to the root Element when rendering a Leaf. Value: Leaf.id
	LEAF_KEY_ATTR: 'data-leaf-key',
	LEAF_KEY_CAMEL: 'leafKey',
	// LEAF_TEXT_ATTR: Attached to the span Element that renders a Leaf's text. Value: ''
	LEAF_TEXT_ATTR: 'data-leaf-text',
	LEAF_TEXT_CAMEL: 'leafText',
	// LEAF_CONTENT_ATTR: Attached to the root Element that wraps the content of a
	// non-text Leaf. Value: ''
	LEAF_CONTENT_ATTR: 'data-leaf-content',
	LEAF_CONTENT_CAMEL: 'leafContent'
};


export class Leaf {
	/*
		@ attributes
		text: String - default: '\u200b' (zero-width space)
		styles: LeafStyles object - default: new LeafStyles()
		type: number - default: 0 (Leaf is text)
		prevLeaf: Leaf object - default: null
		nextLeaf: Leaf object - default: null
		new: Boolean - default true
		consumed: Boolean | null - default: null
		parent: Node object - default: null
		Leaf: Boolean - default: true
		id: number
	*/
	text: string;
	styles: LeafStyles;
	type: number;
	prevLeaf: null | Leaf;
	nextLeaf: null | Leaf;
	new: boolean;
	consumed: boolean | null;
	parent: null | Node;
	Leaf: boolean;
	id: number; // unique id

	/*
		constructor
		@ params
			props: Object - default: {}
				- attributes (optional)
	*/
	constructor(props: Object = {}) {
		this.text = props.text || '\u200b'; // In HTML, zero-width char is &#65279;
		this.styles = props.styles || new LeafStyles();
		this.prevLeaf = props.prevLeaf || null;
		this.nextLeaf = props.nextLeaf || null;
		// By default, Leaf is a text Leaf.
		this.type = props.type || 0;
		// When created, Leaf's parent is always null. Manually assign this.
		// When assigned, every Leaf in the chain should have the same parent.
		this.parent = null;

		// Once created, Leaf is always new
		// Once chained, Leaf will become old - Inline.render will mark all new Leaves old
		// Old Leaf will be put into history stack if unchained
		this.new = true;

		// consumed is used for auto merge
		this.consumed = null;

		// Identity check
		this.Leaf = true;

		// Id
		this.id = BlankCounter.get();
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
	isTextLeaf:
		- Check if a Leaf is a text Leaf.
	@ params
		leaf: Leaf object
	@ return
		Boolean
*/
export function isTextLeaf(leaf: Leaf): boolean {
	return leaf.type === 0;
}

export class NullLeaf {
	/*
		A NullLeaf is used to rechain null value to a Leaf's prevLeaf or nextLeaf
		A NullLeaf is also used to describe which two Leaves are originally chained together

		For exmaple:
			1. If l1 is a Leaf with no nextLeaf, chaining a new Leaf after it will unchain its NullLeaf.
			   This way, history can handle null values of prevLeaf and nextLeaf.
			2. l1 and l2 are chained together. Inserting a l3 between them will unchain a NullLeaf with
			   l1 as its prevLeaf and l2 as its nextLeaf.
	*/

	/*
		@ attributes
		prevLeaf: Leaf object - default: null
		nextLeaf: Leaf object - default: null
		nullLeaf: Boolean - default: true
	*/
	prevLeaf: null | Leaf;
	nextLeaf: null | Leaf;
	NullLeaf: boolean;

	/*
		constructor
			- Either prevLeaf or nextLeaf or both can be a Leaf. They must not all be null.
		@ params
			props: Object - default: {}
				- prevLeaf: Leaf object (optional)
				- nextLeaf: Leaf object (optional)
	*/
	constructor(props: Object = {}) {
		this.prevLeaf = props.prevLeaf || null;
		this.nextLeaf = props.nextLeaf || null;

		if (this.prevLeaf === null && this.nextLeaf === null) {
			throw new Error('A NullLeaf with no Leaves is useless.');
		}

		if (this.prevLeaf === this.nextLeaf) {
			throw new Error('A NullLeaf\'s nextLeaf and prevLeaf must not be the same Leaf.');
		}

		// Identity check
		this.NullLeaf = true;
	}
}

export class LeafChain {
	/*
		LeafChain describes the startLeaf and endLeaf of a chain, and their respective prevLeaf
		and nextLeaf. It's used in rechain() for re-inserting a Leaf or a Leaf chain between two
		Leaves.

		startLeaf and endLeaf can be the same Leaf.

		IMPORTANT:
		When creating a LeafChain, you must be confident that the following is true, because
		LeafChain does not and will not check them.
			1. The startLeaf comes before the endLeaf in the chain.
			2. Every Leaf in the chain has the same parent.
			3. Every Leaf in the chain is new or old.
	*/

	/*
		@ attributes
		startLeaf: Leaf object - default: null
		endLeaf: Leaf object - default: null
		prevLeaf: Leaf object - default: null
		nextLeaf: Leaf object - default: null
		LeafChain: Boolean - default: true
	*/
	startLeaf: Leaf | null;
	endLeaf: Leaf | null;
	prevLeaf: Leaf | null;
	nextLeaf: Leaf | null;
	LeafChain: boolean;

	/*
		constructor
		@ params
			props: Object - default: {}
				- startLeaf: Leaf object
				- endLeaf: Leaf object
	*/
	constructor(props: Object = {}) {
		this.startLeaf = props.startLeaf || null;
		this.endLeaf = props.endLeaf || null;

		if (this.startLeaf === null || this.endLeaf === null) {
			throw new Error('The startLeaf and endLeaf of a LeafChain must not be null.');
		}

		if (this.startLeaf !== this.endLeaf) {
			if (this.startLeaf.nextLeaf === null) {
				throw new Error('In a LeafChain, if not same as endLeaf, startLeaf.nextLeaf must not be null.');
			}
			if (this.endLeaf.prevLeaf === null) {
				throw new Error('In a LeafChain, if not same as startLeaf, endLeaf.prevLeaf must not be null.');
			}
		}

		this.prevLeaf = this.startLeaf.prevLeaf;
		this.nextLeaf = this.endLeaf.nextLeaf;

		// Identity check
		this.LeafChain = true;
	}
}

export class LeafText {
	/*
		LeafText stores the text change in a Leaf for history undo() and redo().
	*/

	/*
		@ attributes
		leaf: Leaf object - default: null
		range: Array<number> - default: []
		text: String - default: ''
		LeafText: Boolean - default: true
	*/
	leaf: Leaf | null;
	range: Array<number>;
	text: string;
	LeafText: boolean;

	/*
		constructor
		@ params
			props: Object - default {}
				- leaf: Leaf object
				- range: Array<number>
				- text: String
	*/
	constructor(props: Object = {}) {
		this.leaf = props.leaf || null;
		this.range = props.range || [];
		this.text = props.text || '';

		// Identity check
		this.LeafText = true;
	}
}

export class ParentLink {
	/*
		ParentLink stores the link between a Node's firstChild and a Node/Leaf's parent
		for history undo() and redo().

		The child must originally be the firstChild of the parent.

		In setParentLink(), the target child's parent and the target parent's firstChild
		must be null, because setParentLink() does not handle unchaining any ParentLink.

		ParentLink can be used to handle switching child of the same parent or switching
		parent of the same child.
	*/

	/*
		@ attributes
		child: Leaf | Node
		parent: Node object
		ParentLink: Boolean - default: true
	*/
	child: Leaf | Node;
	parent: Node | null;
	ParentLink: boolean;

	/*
		constructor
		@ params
			child: Leaf | Node
			parent: Node object
	*/
	constructor(child: Leaf | Node, parent: Node | null) {
		this.child = child;
		this.parent = parent;

		// Identity check
		this.ParentLink = true;
	}
}

class ClipboardNode {
	/*
		Clipboard functions like a RootNode but it accepts Leaf as its firstChild. It
		also does not have a "new attribute".

		If its firstChild is a Leaf, its startLeaf and endLeaf indicate the start and
		the end of the LeafChain.

		If its firstChild is a Node, its startNode and endNode indicate the start and
		the end of the NodeChain, while its startLeaf and endLeaf indicates the very
		first Leaf and the very last Leaf in the copied tree for easy future copying,
		since copyNodeChain() takes Leaves as parameters.
	*/

	/*
		@ attributes
		firstChild: Node | Leaf | null
		startNode: Node | null
		endNode: Node | null
		startLeaf: Leaf | null
		endLeaf: Leaf | null
		Clipboard: Boolean
	*/
	firstChild: Node | Leaf | null;
	startNode: Node | null;
	endNode: Node | null;
	startLeaf: Leaf | null;
	endLeaf: Leaf | null;
	ClipboardNode: boolean;

	/*
		constructor
	*/
	constructor() {
		this.firstChild = null;
		this.startNode = null;
		this.endNode = null;
		this.startLeaf = null;
		this.endLeaf = null;
		// Identity check
		this.ClipboardNode = true;
	}
}

export const Clipboard = new ClipboardNode();
