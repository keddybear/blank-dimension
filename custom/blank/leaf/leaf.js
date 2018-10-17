/*
	Block-style
		- Independent, no auto merge

	Inline-style
		- Auto merge if same styles


	User event -> Get selection -> Apply user action

	*example*
	At the selection, are you modifying text or are you applying styles?

	Modifying text:
	Todo

	Applying styles:
		- Applying block-style
			- Re-render block
				- Get block id, setState
		- Applying inline-style
			- Re-render leaf
				- Get leaf id, setState

	<div data-block-key='1'>
		<span data-inline-key='1-1'>
			<span data-leaf-key='1-1-1'>Hello world!</span>
			<span data-leaf-key='1-1-2'>
				<strong data-leaf='true'> This is a bold test.</strong>
			</span>
		</span>
	</div>

	[{
		type: 'div',
		nodes: [{
			styles: [false, false, false],
			text: 'Hello world!'
		}, {
			styles: [true, false, false],
			text: ' This is a bold test.'
		}]
	}]

	' This' -> -bold

	styles: [true, false, false],
	text: '' (no zero-width)

	styles: [false, false, false],
	text: ' This'

	styles: [true, false, false],
	text: ' is a bold test.'

	=>

	[{
		type: 'div',
		nodes: [{
			styles: [false, false, false],
			text: 'Hello world!'
			preSib: ...,
			nextSib: ...
		}, {
			styles: [true, false, false],
			text: '' (no zero-width)
			dirty: true,
			preSib: ...,
			nextSib: ...
		}, {
			styles: [false, false, false],
			text: ' This'
			dirty: true,
			preSib: ...,
			nextSib: ...
		}, {
			styles: [true, false, false],
			text: ' is a bold test.',
			dirty: true,
			preSib: ...,
			nextSib: ...
		}]
	}]

*/

// @flow

//= BlankEditor
// class BlankEditor {
// 	constructor() {}
// }

/*
	DirtyNewLeaves
		- This array stores references to newly created Leaves that should be called autoMergeLeaf
		- Don't iterate through this. Just pop and call autoMergeLeaf.
*/
const DirtyNewLeaves = [];

//= Leaf
class LeafStyles {
	/*
		@ attributes
		bold: Boolean - default: false
		italic: Boolean - default: false
		underline: Boolean - default: false;
	*/
	bold: boolean;
	italic: boolean;
	underline: boolean;

	/*
		constructor
		@ params
			props: Object - default: {}
				- bold: Boolean (optional)
				- italic: Boolean (optional)
				- underline: Boolean (optional)
	*/
	constructor(styleProps: Object = {}) {
		this.bold = styleProps.bold || false;
		this.italic = styleProps.italic || false;
		this.underline = styleProps.underline || false;
	}
}

/*
	sameLeafStyles:
		- Compare the styles of two LeafStyles, return true if all styles are the same,
		  else false
	@ params
		s1: LeafStyles object
		s2: LeafStyles object
	@ return
		Boolean
*/
function sameLeafStyles(s1: LeafStyles, s2: LeafStyles): boolean {
	if (s1 === s2) return true;
	const props = Object.entries(s1);
	for (const [key, value] of props) {
		if (value !== (s2: Object)[key]) {
			return false;
		}
	}
	return true;
}

class Leaf {
	/*
		@ attributes
		text: String - default: '\u200b' (zero-width space)
		styles: LeafStyles object - default: new LeafStyles()
		prevLeaf: Leaf object - default: null
		nextLeaf: Leaf object - default: null
		new: Boolean - default true;
	*/
	text: string;
	styles: LeafStyles;
	prevLeaf: null | Leaf;
	nextLeaf: null | Leaf;
	new: boolean;

	/*
		@ methods
		applyStyle
		autoMerge

		@ util
		trimRange
	*/

	/*
		constructor
		@ params
			props: Object - default: {}
				- text: String (optional)
				- styles: LeafStyles object (optional)
				- prevLeaf: Leaf object (optional)
				- nextLeaf: Leaf object (optional)
	*/
	constructor(props: Object = {}) {
		this.text = props.text || '\u200b';
		this.styles = props.styles || new LeafStyles();
		this.prevLeaf = props.prevLeaf || null;
		this.nextLeaf = props.nextLeaf || null;

		// Once created, Leaf is always new
		// Once chained, Leaf will become old - Inline.render will mark all new Leaves old
		// Old Leaf will be put into history stack if unchained
		this.new = true;
	}
}

/*
	copyLeafStyles:
		- Copy one Leaf's styles to another, by creating a new LeafStyles object
	@ params
		leaf: Leaf object
		leafToCopy: Leaf object
*/
function copyLeafStyles(leaf: Leaf, leafToCopy: Leaf): void {
	const l = leaf;
	const { ...styleProps } = leafToCopy.styles;
	l.styles = new LeafStyles({ ...styleProps });
}

/*
	printLeafChain:
		- print the Leaf chain, until prevLeaf and nextLeaf are null
	@ params
		up: Boolean - default: true
	@ output
	@-[leaf1]
	|
	@-[leaf2]
	|
	@-[Leaf3]
*/
function printLeafChain(leaf: Leaf, up: boolean = true): void {
	if (up) {
		if (leaf.prevLeaf instanceof Leaf) {
			printLeafChain(leaf, true);
		} else {
			printLeafChain(leaf, false);
		}
	} else {
		console.log(`@-[${leaf.text}]`);
		if (leaf.nextLeaf instanceof Leaf) {
			console.log('|');
			printLeafChain(leaf, false);
		}
	}
}

class NullLeaf {
	/*
		A NullLeaf is used to rechain null value to a Leaf's prevLeaf or nextLeaf
		For exmaple:
			If l1 is a Leaf with no nextLeaf, chaining a new Leaf after it will unchain its NullLeaf.
			This way, history can handle null values of prevLeaf and nextLeaf.
	*/

	/*
		@ attributes
		prevLeaf: Leaf object - default: null
		nextLeaf: Leaf object - default: null
	*/
	prevLeaf: null | Leaf;
	nextLeaf: null | Leaf;

	/*
		constructor
			- Either prevLeaf or nextLeaf must not be null, and the other must be null.
		@ params
		props: Object - default: {}
			- prevLeaf: Leaf object (optional)
			- nextLeaf: Leaf object (optional)
	*/
	constructor(props: Object = {}) {
		this.prevLeaf = props.prevLeaf || null;
		this.nextLeaf = props.nextLeaf || null;

		if (this.prevLeaf instanceof Leaf && this.nextLeaf instanceof Leaf) {
			throw new Error('A NullLeaf must have one and only one Leaf.');
		} else if (this.prevLeaf === null && this.nextLeaf === null) {
			throw new Error('A NullLeaf with no Leaves is useless.');
		}
	}
}

//= Blank History
let BlankHistoryExist = false;
/*
	NOTE: Inline class doesn't exist yet.
		  Refactor BlankHistory & BlankHistoryStep to work with Inline.
*/
class BlankHistoryStep {
	/*
		@ attributes
		stack: Array<mixed> - default: []
		past: Boolean - default: true
	*/
	stack: Array<mixed>;
	past: boolean;

	/*
		@ methods
		push
		pop
		clear

	/*
		constructor
	*/
	constructor() {
		this.stack = [];
		this.past = true;
	}

	push(e: mixed): number {
		return this.stack.push(e);
	}

	pop(): mixed {
		return this.stack.pop();
	}

	clear() {
		this.stack.length = 0;
	}
}

class BlankHistory {
	/*
		Only one BlankHistory instance is allowed.

		@ attributes
		stackPast: Array<BlankHistoryStep> - default: []
		stackFuture: Array<BlankHistoryStep> - default: []
		tempStep: BlankHistoryStep
	*/
	stackPast: Array<BlankHistoryStep>;
	stackFuture: Array<BlankHistoryStep>;
	tempStep: BlankHistoryStep;

	/*
		constructor
	*/
	constructor() {
		if (BlankHistoryExist === true) {
			throw new Error('Only one instance of BlankHistory can be created.');
		}
		BlankHistoryExist = true;

		this.stackPast = [];
		this.stackFuture = [];
		this.tempStep = new BlankHistoryStep();
	}
}

const History = new BlankHistory();

//= Leaf functions

/*
	isZeroLeaf:
		- Check if a Leaf's text is only zero-width space.
	@ params
		leaf: Leaf object
	@ return
		Boolean
*/
function isZeroLeaf(leaf: Leaf): boolean {
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
function trimRange(leaf: Leaf, range: Array<number> = [0, 0]): Array<number> {
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
	applyCaretStyle
	applyLeafStyle
	applyInlineStyle

*/

/*
	applyLeafStyle:
		- Create three new Leaf objects with the middle one adopting new styles.
		- Discard new Leaves that are zero-width
		- Replace the old Leaf in the chain with the new one(s)
		- Unchain the old leaf - it means putting it into the history
			- Old Leaf is pushed into a temporary history step object
		- Push new Leaf(s) into a dirty stack
			- Every new Leaf in the dirty stack will be called autoMergeLeaf
		- If range width is 0, do nothing. (This is handled by applyCaretStyle)
	@ params
		leaf: Leaf object (required)
		newStyles: Object - default: {}
			- bold: Boolean (optional)
			- italic: Boolean (optional)
			- underline: Boolean (optional)
		range: Array object - default: [0, 0]
*/
function applyLeafStyle(leaf: Leaf, newStyles: Object = {}, range: Array<number> = [0, 0]): void {
	const r = trimRange(leaf, range);
	const { text, styles, prevLeaf, nextLeaf } = leaf;
	const newLeafStyles = new LeafStyles(newStyles);

	const t1 = text.substring(0, r[0]);
	const t2 = text.substring(r[0], r[1]);
	const t3 = text.substring(r[1], text.length);

	const l1 = new Leaf({
		text: t1,
		styles,
		prevLeaf
	});
	const l2 = new Leaf({
		text: t2,
		styles: newLeafStyles,
		prevLeaf: l1
	});
	const l3 = new Leaf({
		text: t3,
		styles,
		prevLeaf: l2,
		nextLeaf
	});

	// Re-chain
	l1.nextLeaf = l2;
	l2.nextLeaf = l3;
	if (prevLeaf) {
		prevLeaf.nextLeaf = l1;
	}
	if (nextLeaf) {
		nextLeaf.prevLeaf = l3;
	}

	// Discard zero-wdith new Leaves (TODO)

	// Unchain(this) -> put this into history stack (TODO)

	// Put newly created Leaves into dirty stack (TODO)
}

/*
	unchain (done)
	chained (done)
	chain (done)
	rechain (done)
	consume (done)
*/

/*
	NOTE: Currently, Inline class does not exist, so chain/unchain only works on Leaves
		  Refactor the code for Inline chaining (TODO)

	unchain:
		- Push the unchained Leaf to the temporary history step
			- After pushing all unchained Leaves, this history step will be pushed into
			  either history's past stack or future stack, depending on the operation.
	@ params
		leaf: Leaf object
		past: Boolean
*/
const _PAST_STACK_ = true;
const _FUTURE_STACK_ = false;
function unchain(leaf: Leaf | NullLeaf, past: boolean): void {
	if (past) {
		History.tempStep.push(leaf);
	} else {
		History.tempStep.push(leaf);
	}
}

/*
	chained:
		- Check if two Leaves are *directly* chained.
		- Return a number to indicate chained state.
	@ params
		leaf1: Leaf object (required)
		leaf2: Leaf object (required)
	@ return
		Number:
			- 0: not chained
			- 1: leaf1 is chained after leaf2
			- 2: leaf1 is chained before leaf2
*/
const _NOT_CHAINED_ = 0;
const _CHAINED_AFTER_ = 1;
const _CHAINED_BEFORE_ = 2;
function chained(leaf1: Leaf, leaf2: Leaf): number {
	if (leaf1.prevLeaf === leaf2 && leaf2.nextLeaf === leaf1) {
		return _CHAINED_AFTER_;
	} else if (leaf1.nextLeaf === leaf2 && leaf2.prevLeaf === leaf1) {
		return _CHAINED_BEFORE_;
	}
	return _NOT_CHAINED_;
}

/*
	NOTE: Currently, Inline class does not exist, so chain/unchain only works on Leaves
		  Refactor the code for Inline chaining (TODO)

	chain:
		- Check if prevLeaf.nextLeaf matches currentLeaf.prevLeaf. If not, make it match.
		- Call unchain on original prevLeaf.nextLeaf
		- Same goes for nextLeaf.prevLeaf
		- Only NEW Leaf can be chained. In other words, chain() is used on new Leaves.
			- rechain() is used for old Leaves.
		- New Leaf's prevLeaf and nextLeaf must not be replaced if not null
		- If target Leaf is also new, newLeaf's prevLeaf and nextLeaf must be null.
		  (To avoid circular chain)
		- Also, new Leaf's prevLeaf must be null if chained after,
		  or nextLeaf must be null if chained before.
		- Target Leaf can be either new or old.
		- Only push target Leaf to history stack if it's old.
	@ params
		newLeaf: Leaf object
		targetLeaf: Leaf object
		after: Boolean
*/
const _CHAIN_AFTER_ = true;
const _CHAIN_BEFORE_ = false;
function chain(newLeaf: Leaf, targetLeaf: Leaf, after: boolean): void {
	const n = newLeaf;

	if (!(n instanceof Leaf)) {
		throw new Error('newLeaf in chain() must be a Leaf.');
	} else if (!n.new) {
		throw new Error('newLeaf in chain() must be a NEW Leaf.');
	} else if (after && n.prevLeaf !== null) {
		throw new Error('newLeaf.prevLeaf must be null if chained after.');
	} else if (!after && n.nextLeaf !== null) {
		throw new Error('newLeaf.afterLeaf must be null if chained before.');
	}

	const t = targetLeaf;

	if (!(t instanceof Leaf)) {
		throw new Error('targetLeaf in chain() must be a Leaf');
	}

	// If targetLeaf is new, chain one Leaf at a time to avoid circular referencing.
	if (t.new === true && n.prevLeaf !== null && n.nextLeaf !== null) {
		throw new Error('If targetLeaf is new, newLeaf must have no prevLeaf or nextLeaf.');
	}

	// If Leaf is new, its prevLeaf or nextLeaf, if not null, must not be replaced.
	// (To avoid circular chain)
	if ((after && n.prevLeaf !== null) || (!after && n.nextLeaf !== null)) {
		throw new Error('If Leaf is new, its prevLeaf and nextLeaf, if not null, must not be replaced.');
	}
	if (t.new === true) {
		if ((after && t.nextLeaf !== null) || (!after && t.prevLeaf !== null)) {
			throw new Error('If Leaf is new, its prevLeaf and nextLeaf, if not null, must not be replaced.');
		}
	}

	// If already chained, do nothing
	if (after && chained(n, t) === _CHAINED_AFTER_) return;
	if (!after && chained(n, t) === _CHAINED_BEFORE_) return;

	if (after) {
		// Get target.nextLeaf
		let next2 = t.nextLeaf;
		// Update nextLeaf and prevLeaf
		t.nextLeaf = n;
		n.prevLeaf = t;
		// Push to stack only if target Leaf is old
		if (t.new === false) {
			if (next2 === null) {
				next2 = new NullLeaf({ prevLeaf: t });
			}
			unchain(next2, _PAST_STACK_);
		}
	} else {
		// Get target.prevLeaf
		let prev2 = t.prevLeaf;
		// Update nextLeaf and prevLeaf
		t.prevLeaf = n;
		n.nextLeaf = t;
		// Push to stack only if target Leaf is old
		if (t.new === false) {
			if (prev2 === null) {
				prev2 = new NullLeaf({ nextLeaf: t });
			}
			unchain(prev2, _PAST_STACK_);
		}
	}
}

/*
	NOTE: Currently, Inline class does not exist, so chain/unchain only works on Leaves
		  Refactor the code for Inline chaining (TODO)

	rechain:
		- Put Leaf from past or future history stack back into chain,
		  and push replaced Leaves to future or past history stack respectively.
		- Rechain is used for history redo() and undo().
	@ params
		leaf: Leaf object
		fromPast: Boolean
*/
const _FROM_PAST_ = true;
const _FROM_FUTURE_ = false;
function rechain(leaf: Leaf | NullLeaf, fromPast: boolean): void {
	const l = leaf;
	const { prevLeaf, nextLeaf } = l;

	if (l instanceof NullLeaf) {
		// Check if NullLeaf is before or after a Leaf
		if (prevLeaf !== null) {
			// NullLeaf is after a Leaf
			if (prevLeaf.nextLeaf !== null) {
				// Get current prevLeaf's nextLeaf
				const next2 = prevLeaf.nextLeaf;
				// Replace it with null value because of NullLeaf
				prevLeaf.nextLeaf = null;
				// Push replaced Leaf to stack
				unchain(next2, !fromPast);
			}
		} else if (nextLeaf !== null) {
			// NullLeaf is before a Leaf
			if (nextLeaf.prevLeaf !== null) {
				// Get current nextLeaf's prevLeaf
				const prev2 = nextLeaf.prevLeaf;
				// Replace it with null value becase of NullLeaf
				nextLeaf.prevLeaf = null;
				// Push replaced Leaf to stack
				unchain(prev2, !fromPast);
			}
		}
	} else if (l instanceof Leaf) {
		// Rechain current Leaf's prevLeaf
		if (prevLeaf !== null) {
			// Get current prevLeaf's nextLeaf
			let next2 = prevLeaf.nextLeaf;
			// If prevLeaf's nextLeaf is current Leaf, do nothing
			if (next2 === l) return;
			// Update prevLeaf's nextLeaf
			prevLeaf.nextLeaf = l;
			// Push replaced Leaf to history stack
			if (next2 === null) {
				// If prevLeaf's nextLeaf is null, push NullLeaf
				next2 = new NullLeaf({ prevLeaf });
			}
			unchain(next2, !fromPast);
		}
		// Rechain current Leaf's nextLeaf
		if (nextLeaf !== null) {
			// Get current nextLeaf's prevLeaf
			let prev2 = nextLeaf.prevLeaf;
			// If nextLeaf's prevLeaf is current Leaf, do nothing
			if (prev2 === l) return;
			// Update nextLeaf's prevLeaf
			nextLeaf.prevLeaf = l;
			// Push replaced Leaf to history stack
			if (prev2 === null) {
				// If nextLeaf's prevLeaf is null, push NullLeaf
				prev2 = new NullLeaf({ nextLeaf });
			}
			unchain(prev2, !fromPast);
		}
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
	@ params
		leaf: Leaf object
		up: Boolean
	@ return
		continue: Boolean
			- true: successfully consumed
			- false: unable to consume
*/
const _TRAVERSE_UP_ = true;
const _TRAVERSE_DOWN_ = false;
function consume(leaf: Leaf, up: boolean): boolean {
	if (leaf.new === false) {
		throw new Error('Only new Leaf can consume other Leaves.');
	}

	const l = leaf;

	if (up) {
		const { prevLeaf } = l;
		if (prevLeaf !== null) {
			// Check if consumable
			const consumable =
					sameLeafStyles(l.styles, prevLeaf.styles) ||
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
			}
			// If old, push prevLeaf to history past stack;
			if (prevLeaf.new === false) {
				unchain(prevLeaf, _PAST_STACK_);
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
					sameLeafStyles(l.styles, nextLeaf.styles) ||
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
				unchain(nextLeaf, _PAST_STACK_);
			}
			// Consumed successfully
			return true;
		}
		// nextLeaf is null, unable to consume, exit else block
	}
	return false;
}

/*
	autoMergeLeaf:
		- Consume adjacent leaves (use consume()), by first traversing up.
		- If unable to consume, traverse down.
		- If still unable to consume, stop.
		- Current Leaf must be new, or it will throw error.
		- Only call autoMergeLeaf after applyStyle is finished on all leaves
		- autoMergeLeaf is called on all new Leaves in DirtyNewLeaves
	@ params
		leaf: Leaf object
		up: Boolean
*/
function autoMergeLeaf(leaf: Leaf, up: boolean): void {
	if (leaf.new === false) {
		throw new Error('autoMergeLeaf must be called on a new Leaf.');
	}

	if (up) {
		if (consume(leaf, true)) {
			autoMergeLeaf(leaf, true);
		} else {
			autoMergeLeaf(leaf, false);
		}
	} else if (consume(leaf, false)) {
		autoMergeLeaf(leaf, false);
	}
}

/*
	selection -> [...leaf]

	applyStyle
		- apply styles to [...leaf]
		- auto merge

	applyText
		- turn [...leaf] to [beforeLeaf, middleLeaf, afterLeaf]
		- auto merge

	<applyStyle>
	eachLeaf.applyStyle(range, newStyle);
		- applyStyle turns eachLeaf to [beforeLeaf, middleLeaf, afterLeaf]
		- auto merge

		old Inline = [{
			styles: [false, false, false],
			text: 'Hello world!'
			preSib: ...,
			nextSib: ...
		}, {
			styles: [true, false, false],
			text: ' This is a bold test'
			preSib: ...,
			nextSib: ...
		}]

		new Inline = [{
			styles: [false, false, false],
			text: 'Hello world! This'
			preSib: ...,
			nextSib: ...
		}, {
			styles: [true, false, false],
			text: ' is a bold test.',
			preSib: ...,
			nextSib: ...
		}]

	<applyText>
	TODO

*/


/*
	Inline = {
		startLeaf: Leaf
	}

	const leaves = [];
	recursiveRender(leaves, this.startLeaf);

	// Dangerous
	function recursiveRender(components, leaf) {
		const component = leaf.render();
		components.push(component);
		if (leaf.nextLeaf) {
			recursiveRender(components, leaf.nextLeaf);
		}
		return components;
	}

	render() {
		return (
			<span>
				{leaves}
			</span>
		);
	}


	=Virtual DOM Update=

	State and/or Props change -> shouldComponentUpdate -> render

	=Real DOM Update=

	if: Same tag
		-> same key (if exists)
		-> same value
		-> same order (or same position if no key)
		-> Do not create new element

	else: delete old, create new

	[{
		tag: 'li',
		key: '1',
		value: 1,
	}, {
		tag: 'li',
		key: '2',
		value: 2,
	}, {
		tag: 'li',
		key: '3',
		value: 3,
	}, {
		tag: 'li',
		key: '4',
		value: 4,
	}]

	[{
		tag: 'li',
		key: '5',
		value: 5,
	}, {
		tag: 'li',
		key: '3',
		value: 3,
	}, {
		tag: 'li',
		key: '6',
		value: 6,
	}, {
		tag: 'li',
		key: '4',
		value: 4,
	}, {
		tag: 'li',
		key: '2',
		value: 2,
	}]


*/

/*
	[ref1, ref2, ref3, ref4, ref5]

	->

	[ref6, ref7, ref3, ref9, ref10, ref11, ref12]

	Rebuild nodes array


	History

	[action, action, action, action, currentState]

	->

	[action, currentState, action, action, action]

	action = [[myRef, prevRef, nextRef, type], [myRef, prevRef, nextRef, type]]

*/

/*
	Mutate

	Leaf1 -> Mutate -> Leaf2

	Leaf1 <- Mutate <- Leaf2


*/

/*
	Unchain(Leaf)
	[] -> [ Step{ L1, L2, L3, L4 } ]

	BlankEditor.history.redo();
	BLankEditor.history.undo();

	history.add(step);


*/

export default { LeafStyles, Leaf, BlankHistoryStep, BlankHistory };
