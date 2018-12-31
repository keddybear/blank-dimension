// @flow
/*
	~ What can be selected ~

	There two types of selections: BlankSelection and BranchSelection.

	BlankSelection only selects texts, and all non-text Leaves are not selectable.

	BranchSelection, when its trigger key is pressed, will select the entire branch,
	allowing user to edit the style and content of all Nodes and Leaves in that branch. (TODO)
*/
import { Leaf, isZeroLeaf, isTextLeaf, LeafDataAttributes, applyCaretStyle } from './leaf';
import { Node as BlankNode, DocumentRoot } from './node';
import { ReactMap } from './render';
import { instanceOf, isBitSet, BlankFlags } from './utils';

let BlankElementMapExists = false;
class BlankElementMap {
	/*
		BlankElementMap is a WeakMap implementation that stores the mapping between
		DOM Node and Leaf/BlankNode.

		Only one map can be created for one BlankEditor.

		IMPORTANT:
		Since only the key is "weakly referenced", the value will not be garbage
		collected. If you use the value in another WeakMap as key, it defeats the
		purpose of "Weak".
	*/

	/*
		@ attributes
		wm: WeakMap object
	*/
	wm: WeakMap<Node, BlankNode | Leaf>;

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
		if (BlankElementMapExists === true) {
			throw new Error('Only one instance of BlankElementMap can be created.');
		}
		BlankElementMapExists = true;

		this.wm = new WeakMap();
	}

	clear() {
		this.wm = new WeakMap();
	}

	delete(k: Node) {
		return this.wm.delete(k);
	}

	get(k: Node) {
		return this.wm.get(k);
	}

	has(k: Node) {
		return this.wm.has(k);
	}

	set(k: Node, v: BlankNode | Leaf) {
		this.wm.set(k, v);
		return this;
	}
}

export const BlankMap = new BlankElementMap();

export type LeafSelection = {
	leaf: Leaf,
	offset: number
};

export type SelectionObject = {
	leaf: Leaf,
	range: Array<number>
};

/*
	getNearestLeafSelection:
		- What it intends to find is either "data-leaf-text".
			- If a "data-leaf-text" is found, and if it's the immediate parent of the starting
			  node, the offset stays the same. Otherwise, set the offset to either the
			  beginning or the end of its Leaf's text, depending on if the search is backward.
		- The search will only traverse up the parents. It won't traverse through silbings.
		- Return a LeafSelection object or null if no HTMLElement is found.
		- NOTE: Node in here is DOM Node object.
	@ params
		node: DOM Node
		offset: number
		backward: boolean - default: false
	@ return
		sel: LeafSelection | null
*/
function getNearestLeafSelection(node: Node, offset: number): LeafSelection | null {
	if (node === DocumentRoot.container) return null;
	const { LEAF_TEXT_CAMEL, LEAF_CONTENT_CAMEL } = LeafDataAttributes;
	let n = node;
	let os = offset;
	let el = null;
	// Find either Leaf text or Leaf content
	while (n) {
		if (n instanceof HTMLElement) {
			if (n.dataset[LEAF_TEXT_CAMEL] !== undefined) {
				el = n;
				break;
			} else if (n.dataset[LEAF_CONTENT_CAMEL] !== undefined) {
				el = n;
				break;
			}
		}
		// No break -> keep searching
		n = n.parentNode;
		if (n === DocumentRoot.container) break;
	}

	if (el === null) return null;

	// Leaf key found
	const leaf = BlankMap.get(el);
	if (leaf && instanceOf(leaf, 'Leaf')) {
		// $FlowFixMe
		if (isZeroLeaf(leaf) || !isTextLeaf(leaf)) {
			os = 0;
		}
		// $FlowFixMe
		return { leaf, offset: os };
	}

	return null;
}

export const _MANUAL_ = true; // eslint-disable-line
export class BlankSelection {
	/*
		A BlankSelection is created from the Selection object from window.getSelection().

		It finds the corresponding startLeaf, startRange, endLeaf and endRange, using
		BlankMap, and makes sure startLeaf always comes before endLeaf.

		It will trim startRange and endRange, and check if they are the same when startLeaf
		and endLeaf are the same Leaf.

		For zeroLeaves and non-text Leaves, range will be trimmed to [0, 0].

		BlankSelection can be stored in history for undo & redo.

		A BlankSelection is considered invalid if either its start or end is null.
	*/

	/*
		@ attributes
		start: SelectionObject | null
		end: SelectionObject | null
		BlankSelection: Boolean - default: true
	*/
	start: SelectionObject | null;
	end: SelectionObject | null;
	BlankSelection: boolean;

	/*
		constructor
		@ params
			manual: boolean
				- Manually assign start and end
	*/
	constructor(manual: boolean = false) {
		this.start = null;
		this.end = null;

		// Identity check
		this.BlankSelection = true;

		if (manual) return;
		// Get window selection
		if (typeof window === 'undefined') return;
		const sel = window.getSelection();
		// Selected Nodes must not be null
		if (sel.anchorNode === null || sel.focusNode === null) return;
		// Check if selection is inside BlankEditor
		const { container } = DocumentRoot;
		if (container &&
			container.contains(sel.anchorNode) &&
			container.contains(sel.focusNode)) {
			// Get selection direction
			const position = sel.anchorNode.compareDocumentPosition(sel.focusNode);
			let backward = false;
			// position is 0 if nodes are the same
			if ((position === 0 && sel.anchorOffset > sel.focusOffset) ||
				isBitSet(position, Node.DOCUMENT_POSITION_PRECEDING)) {
				backward = true;
			}

			// Find the nearest text Leaves from anchorNode and focusNode
			const startLS = getNearestLeafSelection(sel.anchorNode, sel.anchorOffset);
			if (startLS === null) return;
			const endLS = !sel.isCollapsed ?
				getNearestLeafSelection(sel.focusNode, sel.focusOffset) :
				startLS;
			if (endLS === null) return;

			// Create SelectionObjects for start and end
			let startLeaf = startLS.leaf;
			let endLeaf = endLS.leaf;
			let rangeStart = startLS.offset;
			let rangeEnd = endLS.offset;
			if (backward) {
				startLeaf = endLS.leaf;
				endLeaf = startLS.leaf;
				rangeStart = endLS.offset;
				rangeEnd = startLS.offset;
			}
			if (startLeaf === endLeaf) {
				this.start = { leaf: startLeaf, range: [rangeStart, rangeEnd] };
				this.end = { leaf: endLeaf, range: [rangeStart, rangeEnd] };
			} else {
				const startRangeEnd =
					(isZeroLeaf(startLeaf) || !isTextLeaf(startLeaf)) ? 0 : startLeaf.text.length;
				this.start = { leaf: startLeaf, range: [rangeStart, startRangeEnd] };
				this.end = { leaf: endLeaf, range: [0, rangeEnd] };
			}
		}
	}
}

// This is before-Action selection (BAS). All User Actions use it for selections.
// Its value is modifyed in onSelectionChangeHandler().
export const BeforeActionSelection = new BlankSelection(_MANUAL_);
// This is post-Action selection (PAS). All Action Ops will modify this.
export const PostActionSelection = new BlankSelection(_MANUAL_);

/*
	isZeroWidth:
		- Check if a BlankSelection is zero-width. It means start and end are the
		  same Leaf and the range width is 0.
	@ param
		selection: BlankSelection
	@ return
		zw: Boolean
*/
export function isZeroWidth(selection: BlankSelection): boolean {
	return selection.start !== null &&
		selection.end !== null &&
		selection.start.leaf === selection.end.leaf &&
		selection.start.range[0] === selection.start.range[1];
}

/*
	clearBlankSelection:
		- Simply set the start and end of a BlankSelection to null.
		- Call this on PostActionSelection before any Action Ops.
	@ params
		selection: BlankSelection object
*/
export function clearBlankSelection(selection: BlankSelection): void {
	const s = selection;
	s.start = null;
	s.end = null;
}

/*
	copySelectionObject:
		- Return the copy of a SelectionObject.
	@ params
		so: SelectionObject
	@ return
		copy: SelectionObject
*/
export function copySelectionObject(so: SelectionObject): SelectionObject {
	return {
		leaf: so.leaf,
		range: [so.range[0], so.range[1]]
	};
}

/*
	copyBlankSelection:
		- Copy the start and end attributes of a BlankSelection to another.
	@ params
		target: BlankSelection
		copyFrom: BlankSelection
*/
export function copyBlankSelection(target: BlankSelection, copyFrom: BlankSelection): void {
	const t = target;
	const { start, end } = copyFrom;
	if (start !== null) {
		t.start = copySelectionObject(start);
	} else {
		t.start = null;
	}
	if (end !== null) {
		t.end = copySelectionObject(end);
	} else {
		t.end = null;
	}
}

/*
	setBAS:
		- Set the start and end of BeforeActionSelection with two SelectionObjects.
	@ params
		start: SelectionObject
		end: SelectionObject
*/
export function setBAS(start: SelectionObject, end: SelectionObject): void {
	BeforeActionSelection.start = start;
	BeforeActionSelection.end = end;
}

/*
	setPAS:
		- Set the start and end of PostActionSelection with two SelectionObjects.
	@ params
		start: SelectionObject
		end: SelectionObject
*/
export function setPAS(start: SelectionObject, end: SelectionObject): void {
	PostActionSelection.start = start;
	PostActionSelection.end = end;
}

/*
	toSelections:
		- Simply return the array version of BlankSelection, needed for Action Ops.
		- Return [] if BlankSelection is invalid. All Action Ops will not run due to
		  selection's length not equal to 2.
	@ params
		selection: BlankSelection object
	@ return
		selections: Array<SelectionObject>[2]
*/
export function toSelections(selection: BlankSelection): Array<SelectionObject> {
	if (selection.start === null || selection.end === null) {
		return [];
	}
	const start = {
		leaf: selection.start.leaf,
		range: [selection.start.range[0], selection.start.range[1]]
	};
	const end = {
		leaf: selection.end.leaf,
		range: [selection.end.range[0], selection.end.range[1]]
	};
	return [start, end];
}

/*
	setWindowSelection:
		- Update native selection from BlankSelection.
		- Do nothing if BlankSelection is invalid or no corresponding DOM Element
		  is found.
		- Do nothing is either selected Leaf is non-text
		- Set SELECTION_FROM_BS to true, so onSelectionChangeHandler() won't create
		  a new BlankSelection.
	@ params
		selection: BlankSelection
*/
export function setWindowSelection(selection: BlankSelection) {
	// Check if window and window.document exist
	if (typeof window === 'undefined' || !window.document) return;
	// Check if BlankSelection is valid
	if (selection.start === null || selection.end === null) return;

	const { start, end } = selection;
	// Get startNode and endNode (DOM) using ReactMap // $FlowFixMe
	const sComp = ReactMap.get(start.leaf);
	if (!sComp) return; // $FlowFixMe
	if (!sComp.selectRef) return; // $FlowFixMe
	const eComp = ReactMap.get(end.leaf);
	if (!eComp) return; // $FlowFixMe
	if (!eComp.selectRef) return;

	// $FlowFixMe
	const s = sComp.selectRef.current;
	if (!s) return;
	// $FlowFixMe
	const e = eComp.selectRef.current;
	if (!e) return;

	let anchorNode = null;
	let anchorOffset = null;
	let focusNode = null;
	let focusOffset = null;

	// Get anchorNode and anchorOffset
	if (isTextLeaf(start.leaf)) {
		anchorNode = s.firstChild;
		anchorOffset = start.range[0]; // eslint-disable-line
	} else {
		anchorNode = s;
		anchorOffset = s.children.length - 1;
	}

	// Get focusNode and focusOffset
	if (isTextLeaf(end.leaf)) {
		focusNode = e.firstChild;
		focusOffset = end.range[1]; // eslint-disable-line
	} else {
		focusNode = e;
		focusOffset = e.children.length - 1;
	}

	if (anchorNode !== null && focusNode !== null) {
		// Get selection
		const sel = window.getSelection();
		// Clear selection
		if (sel) {
			if (sel.removeAllRanges) {
				sel.removeAllRanges();
			} else if (sel.empty) {
				sel.empty();
			}
		}
		// Create new range from BlankSelection
		const newRange = window.document.createRange();
		// $FlowFixMe
		newRange.setStart(anchorNode, anchorOffset);
		// $FlowFixMe
		newRange.setEnd(focusNode, focusOffset);
		sel.addRange(newRange);
	}
	// Set SELECTION_FROM_BS to true
	BlankFlags.SELECTION_FROM_BS = true;
}

/*
	onSelectionChangeHandler:
		- Called in "selectionchange" event, it will create a new BlankSelection object
		  to be copied to BeforeActionSelection (BAS).
		  	- If the selection change is from PAS (SELECTION_FROM_BS is true), BAS
		  	  will simply copy from PAS. Then set SELECTION_FROM_BS to false.
		- If BlankEditor is currently running a task (RUNNING is true), do nothing,
		  unless SELECTION_FROM_BS is true.
		- Set CONTINUOUS_ACTION to false, if native selection is not from PAS.
		- Update CaretStyle, if BAS is zero-width.
*/
export function onSelectionChangeHandler(): void {
	if (BlankFlags.SELECTION_FROM_BS) {
		copyBlankSelection(BeforeActionSelection, PostActionSelection);
		BlankFlags.SELECTION_FROM_BS = false;
	} else if (!BlankFlags.RUNNING) {
		const s = new BlankSelection();
		copyBlankSelection(BeforeActionSelection, s);
		BlankFlags.CONTINUOUS_ACTION = false;
		if (isZeroWidth(BeforeActionSelection)) {
			// $FlowFixMe
			applyCaretStyle(BeforeActionSelection.start.leaf.styles);
		}
	}
}
