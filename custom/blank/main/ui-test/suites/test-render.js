/* eslint-disable */
import { Node, DocumentRoot, NodeTypes, NodeDataAttributes, NodeChain, NodeStyles } from '../../node';
import { Leaf, isZeroLeaf, isTextLeaf, LeafStyles, LeafTypes, LeafDataAttributes, applyCaretStyle } from '../../leaf';
import { History, BlankHistoryStep } from '../../history';
import {
	BlankSelection,
	BeforeActionSelection,
	PostActionSelection,
	clearBlankSelection,
	copyBlankSelection,
	toSelections,
	BlankMap,
	setWindowSelection
} from '../../selection';
import { ReactMap, RenderFlags, RenderStack, render } from '../../render';
import { BlankFlags, instanceOf } from '../../utils';
import {
	chainNode,
	chainLeaf,
	setParentLink,
	readyTempHistorySteps,
	undo,
	redo,
	TempHistoryFutureStep,
	TempHistoryPastStep,
	_PAST_STACK_,
	_FUTURE_STACK_,
	applyLeavesStyle,
	applyNodesStyle,
	applyBranchType,
	applyBranchText,
	_BACKSPACE_
} from '../../integration';
import { loadHTML, SpyMaster } from '../setup';
import { expect } from 'chai';

// Enzyme
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { mount } from 'enzyme';
import React from 'react';

Enzyme.configure({ adapter: new Adapter() });

// Components
import RootComponent from '../../react/root';
import ChainComponent from '../../react/chain';
import NodeComponent from '../../react/node';
import LeafComponent from '../../react/leaf';

const { PARAGRAPH, ORDERED_LIST, UNORDERED_LIST, LIST_ITEM } = NodeTypes;
const { IMAGE, TEXT } = LeafTypes;
const { CLEAN, DIRTY_SELF, DIRTY_CHILDREN, DIRTY } = RenderFlags;

let tree;
const master = new SpyMaster();

// Observe lifecycle methods of a Blank Component
const observe = (component) => {
	master.spy(component, 'componentWillUnmount');
	master.spy(component, 'shouldComponentUpdate');
	master.spy(component, 'render');
	if (component.chainRef && component.chainRef.current) {
		master.spy(component.chainRef.current, 'componentWillUnmount');
		master.spy(component.chainRef.current, 'shouldComponentUpdate');
		master.spy(component.chainRef.current, 'render');
	}
};
// Unobserve lifecycle methods of a Blank Component
const unobserve = (component) => {
	master.unspy(component, 'componentWillUnmount');
	master.unspy(component, 'shouldComponentUpdate');
	master.unspy(component, 'render');
	if (component.chainRef && component.chainRef.current) {
		master.unspy(component.chainRef.current, 'componentWillUnmount');
		master.unspy(component.chainRef.current, 'shouldComponentUpdate');
		master.unspy(component.chainRef.current, 'render');
	}
};
// Expecting a Blank Element to be in a certain state
const [MOUNTED, UNMOUNTED, UPDATED, UNTOUCHED, NOT_UPDATED, REMOUNTED] = [1, 2, 3, 4, 5];
const expecting = (el = null, comp = null, state) => {
	if (state === MOUNTED) {
		if (el) {
			expect(el.new).to.be.false;
			expect(ReactMap.has(el)).to.be.true;
			if (instanceOf(el, 'Node')) {
				expect(BlankMap.has(document.querySelector(`[data-node-key="${el.id}"]`))).to.be.true;
			} else if (instanceOf(el, 'Leaf')) {
				expect(BlankMap.has(document.querySelector(`[data-leaf-key="${el.id}"]`))).to.be.true;
			}
			expect(el.dirty).to.equal(CLEAN);
		}
	} else if (state === UNMOUNTED) {
		if (comp) {
			if (master.get(comp, 'componentWillUnmount') !== null) {
				expect(master.get(comp, 'componentWillUnmount')).to.equal(1);
			}
			expect(master.get(comp, 'shouldComponentUpdate')).to.equal(0);
			expect(master.get(comp, 'render')).to.equal(0);
		}
		if (el) {
			expect(ReactMap.has(el)).to.be.false;
			if (instanceOf(el, 'Node')) {
				expect(document.querySelector(`[data-node-key="${el.id}"]`)).to.equal(null);
			} else if (instanceOf(el, 'Leaf')) {
				expect(document.querySelector(`[data-leaf-key="${el.id}"]`)).to.equal(null);
			}
			expect(el.dirty).to.equal(CLEAN);
		}
	} else if (state === UPDATED) {
		if (comp) {
			if (master.get(comp, 'componentWillUnmount') !== null) {
				expect(master.get(comp, 'componentWillUnmount')).to.equal(0);
			}
			expect(master.get(comp, 'shouldComponentUpdate')).to.equal(1);
			expect(master.get(comp, 'render')).to.equal(1);
		}
		if (el) {
			expect(el.dirty).to.equal(CLEAN);
		}
	} else if (state === UNTOUCHED) {
		if (comp) {
			if (master.get(comp, 'componentWillUnmount') !== null) {
				expect(master.get(comp, 'componentWillUnmount')).to.equal(0);
			}
			expect(master.get(comp, 'shouldComponentUpdate')).to.equal(0);
			expect(master.get(comp, 'render')).to.equal(0);
		}
		if (el) {
			expect(ReactMap.has(el)).to.be.true;
			if (instanceOf(el, 'Node')) {
				expect(BlankMap.has(document.querySelector(`[data-node-key="${el.id}"]`))).to.be.true;
			} else if (instanceOf(el, 'Leaf')) {
				expect(BlankMap.has(document.querySelector(`[data-leaf-key="${el.id}"]`))).to.be.true;
			}
			expect(el.dirty).to.equal(CLEAN);
		}
	} else if (state === NOT_UPDATED) {
		if (comp) {
			if (master.get(comp, 'componentWillUnmount') !== null) {
				expect(master.get(comp, 'componentWillUnmount')).to.equal(0);
			}
			expect(master.get(comp, 'shouldComponentUpdate')).to.equal(1);
			expect(master.get(comp, 'render')).to.equal(0);
		}
		if (el) {
			expect(ReactMap.has(el)).to.be.true;
			if (instanceOf(el, 'Node')) {
				expect(BlankMap.has(document.querySelector(`[data-node-key="${el.id}"]`))).to.be.true;
			} else if (instanceOf(el, 'Leaf')) {
				expect(BlankMap.has(document.querySelector(`[data-leaf-key="${el.id}"]`))).to.be.true;
			}
			expect(el.dirty).to.equal(CLEAN);
		}
	} else if (state === REMOUNTED) {
		if (comp) {
			if (master.get(comp, 'componentWillUnmount') !== null) {
				expect(master.get(comp, 'componentWillUnmount')).to.equal(1);
			}
			expect(master.get(comp, 'shouldComponentUpdate')).to.equal(0);
			expect(master.get(comp, 'render')).to.equal(0);
		}
		if (el) {
			expect(ReactMap.has(el)).to.be.true;
			const newComp = ReactMap.get(el);
			const result = newComp !== comp;
			expect(result).to.be.true;
			if (instanceOf(el, 'Node')) {
				expect(BlankMap.has(document.querySelector(`[data-node-key="${el.id}"]`))).to.be.true;
			} else if (instanceOf(el, 'Leaf')) {
				expect(BlankMap.has(document.querySelector(`[data-leaf-key="${el.id}"]`))).to.be.true;
			}
			expect(el.dirty).to.equal(CLEAN);
		}
	}
};
// Super quick select
const select = (el1, el2, o1, o2) => {
	const anchor = document.querySelector(`[data-leaf-key="${el1.id}"]`);
	const focus = el1 === el2 ? anchor : document.querySelector(`[data-leaf-key="${el2.id}"]`);
	window.quickSelect(
		isTextLeaf(el1) ? anchor.firstChild : anchor,
		isTextLeaf(el2) ? focus.firstChild : focus,
		isTextLeaf(el1) ? (isZeroLeaf(el1) ? 0 : Math.min(el1.text.length, o1)) : anchor.children.length - 1,
		isTextLeaf(el2) ? (isZeroLeaf(el2) ? 0 : Math.min(el2.text.length, o2)) : focus.children.length - 1
	);
	const s = new BlankSelection();
	copyBlankSelection(BeforeActionSelection, s);
	copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

	return toSelections(BeforeActionSelection);
};
// Expecting a current selection (also handling PAS)
const selecting = (el1, el2, o1, o2) => {
	copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);
	setWindowSelection(PostActionSelection);

	const anchor = document.querySelector(`[data-leaf-key="${el1.id}"]`);
	const focus = el1 === el2 ? anchor : document.querySelector(`[data-leaf-key="${el2.id}"]`);

	const sel = window.getSelection();
	if (isTextLeaf(el1)) {
		expect(sel.anchorNode).to.equal(anchor.firstChild);
		if (isZeroLeaf(el1)) {
			expect(sel.anchorOffset).to.equal(0);
		} else {
			expect(sel.anchorOffset).to.equal(o1);
		}
	} else {
		expect(sel.anchorNode).to.equal(anchor);
		expect(sel.anchorOffset).to.equal(anchor.children.length - 1);
	}
	if (isTextLeaf(el2)) {
		expect(sel.focusNode).to.equal(focus.firstChild);
		if (isZeroLeaf(el2)) {
			expect(sel.focusOffset).to.equal(0);
		} else {
			expect(sel.focusOffset).to.equal(o2);
		}
	} else {
		expect(sel.focusNode).to.equal(focus);
		expect(sel.focusOffset).to.equal(focus.children.length - 1);
	}

	copyBlankSelection(BeforeActionSelection, PostActionSelection);
};
// Expectation registrar
const expectation = new (function () {
	const expectations = [];
	const components = [];
	this.register = (el, dirty, state) => {
		const bc_el = ReactMap.get(el);
		observe(bc_el);
		components.push(bc_el);
		const fn = () => {
			if (dirty === DIRTY) {
				expecting(el, bc_el, state);
				expecting(null, bc_el.chainRef.current, state);
			} else if (dirty === DIRTY_CHILDREN) {
				expecting(null, bc_el.chainRef.current, state);
			} else if (dirty === DIRTY_SELF || dirty === CLEAN) {
				expecting(el, bc_el, state);
			}
		};
		expectations.push(fn);
	};
	this.run = () => {
		while (expectations.length > 0) {
			const fn = expectations.pop();
			fn.call();
		}
	}
	this.unbind = () => {
		while (components.length > 0) {
			const comp = components.pop();
			unobserve(comp);
		}
	};
})();
// Timer
const timer = new (function () {
	this.start = 0;
	this.name = '';
	this.start = (tag) => {
		this.name = tag;
		this.start = performance.now();	
	},
	this.stop = () => {
		console.log('Timer:', this.name, 'finished in', performance.now() - this.start, 'ms');
	}
})();

describe('Render', function() {

	const n1 = new Node({ nodeType: PARAGRAPH });
		const l1 = new Leaf({ text: 'Leaf 1' });
		const l2 = new Leaf({ text: 'Leaf 2', styles: new LeafStyles({ bold: true }) });
		const l3 = new Leaf({ text: 'Leaf 3' });
	const n2 = new Node({ nodeType: ORDERED_LIST });
		const n3 = new Node({ nodeType: LIST_ITEM, styles: new NodeStyles({ fontFamily: 1 }) });
			const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ italic: true }) });
			const l5 = new Leaf({ text: 'Leaf 5' });
		const n4 = new Node({ nodeType: LIST_ITEM, styles: new NodeStyles({ fontFamily: 1 }) });
			const l6 = new Leaf({ text: 'Leaf 6', styles: new LeafStyles({ bold: true, italic: true }) });
			const l7 = new Leaf({ text: 'Leaf 7', styles: new LeafStyles({ bold: true }) });
			const l8 = new Leaf({ text: 'Leaf 8', styles: new LeafStyles({ italic: true }) });
		const n5 = new Node({ nodeType: LIST_ITEM, styles: new NodeStyles({ fontFamily: 1 }) });
			const l9 = new Leaf();
	const n6 = new Node({ nodeType: PARAGRAPH });
		const l10 = new Leaf({ text: 'Leaf 10', styles: new LeafStyles({ underline: true }) });
	const n7 = new Node({ nodeType: PARAGRAPH });
		const l11 = new Leaf({ type: IMAGE, custom: { src: 'http://doanarae.com/doanarae/9646-long-wallpaper-for-2-monitors_35719.jpg' } });
	const n8 = new Node({ nodeType: UNORDERED_LIST });
		const n9 = new Node({ nodeType: LIST_ITEM });
			const l12 = new Leaf();
		const n10 = new Node({ nodeType: LIST_ITEM });
			const l13 = new Leaf({ text: 'Leaf 13' });
			const l14 = new Leaf({ text: 'Leaf 14', styles: new LeafStyles({ italic: true }) });
	const n11 = new Node({ nodeType: UNORDERED_LIST });
		const n12 = new Node({ nodeType: LIST_ITEM });
			const l15 = new Leaf({ text: 'Leaf 15', styles: new LeafStyles({ bold: true, italic: true }) });
			const l16 = new Leaf({ text: 'Leaf 16', styles: new LeafStyles({ bold: true }) });
			const l17 = new Leaf({ text: 'Leaf 17', styles: new LeafStyles({ italic: true, undnerline: true }) });
			const l18 = new Leaf({ text: 'Leaf 18', styles: new LeafStyles({ underline: true }) });
	const n13 = new Node({ nodeType: PARAGRAPH });
		const l19 = new Leaf({ type: IMAGE, custom: { src: 'http://doanarae.com/doanarae/9646-long-wallpaper-for-2-monitors_35719.jpg' } });

	/*
		(root)---(0)---<l1-l2-l3>
		         |
		         (1)---(3)---<l4-l5>
		         |     |
		         |     (3)---<l6-l7-l8>
		         |     |
		         |     (3)---<l9>
		         |
		         (0)---<l10>
		         |
		         (0)---<l11 - image>
		         |
		         (2)---(3)---<l12>
		         |	   |
		         |	   (3)---<l13-l14>
		         |
		         (2)---(3)---<l15-l16-l17-l18>
		         |
		         (0)---<l19 - image>
	*/
	before(function(done) {
		DocumentRoot.firstChild = null;
		History.clear(_PAST_STACK_);
		History.clear(_FUTURE_STACK_);
		TempHistoryPastStep.clear();
		TempHistoryFutureStep.clear();
		clearBlankSelection(BeforeActionSelection);
		clearBlankSelection(PostActionSelection);

		setParentLink(n1, null);
			setParentLink(l1, n1);
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
		chainNode(n2, n1);
			setParentLink(n3, n2);
				setParentLink(l4, n3);
				chainLeaf(l5, l4);
			chainNode(n4, n3);
				setParentLink(l6, n4);
				chainLeaf(l7, l6);
				chainLeaf(l8, l7);
			chainNode(n5, n4);
				setParentLink(l9, n5);
		chainNode(n6, n2);
			setParentLink(l10, n6);
		chainNode(n7, n6);
			setParentLink(l11, n7);
		chainNode(n8, n7);
			setParentLink(n9, n8);
				setParentLink(l12, n9);
			chainNode(n10, n9);
				setParentLink(l13, n10);
				chainLeaf(l14, l13);
		chainNode(n11, n8);
			setParentLink(n12, n11);
				setParentLink(l15, n12);
				chainLeaf(l16, l15);
				chainLeaf(l17, l16);
				chainLeaf(l18, l17);
		chainNode(n13, n11);
			setParentLink(l19, n13);

		// Load HTML
		loadHTML('./custom/blank/main/ui-test/sample-3.html').then(() => {
			// Render
			// https://airbnb.io/enzyme/docs/api/mount.html
			const options = { attachTo: document.getElementById('blank-editor-container') };
			tree = mount(<RootComponent />, options);
			done();
		}).catch(err => {
			console.log(err);
			done();
		});
	});

	it('Successfully Mounted: All Nodes and Leaves should be old', function(done) {
		expect(n1.new).to.be.false;
		expect(n2.new).to.be.false;
		expect(n3.new).to.be.false;
		expect(n4.new).to.be.false;
		expect(n5.new).to.be.false;
		expect(n6.new).to.be.false;
		expect(n7.new).to.be.false;
		expect(n8.new).to.be.false;
		expect(n9.new).to.be.false;
		expect(n10.new).to.be.false;
		expect(n11.new).to.be.false;
		expect(n12.new).to.be.false;
		expect(n13.new).to.be.false;

		expect(l1.new).to.be.false;
		expect(l2.new).to.be.false;
		expect(l3.new).to.be.false;
		expect(l4.new).to.be.false;
		expect(l5.new).to.be.false;
		expect(l6.new).to.be.false;
		expect(l7.new).to.be.false;
		expect(l8.new).to.be.false;
		expect(l9.new).to.be.false;
		expect(l10.new).to.be.false;
		expect(l11.new).to.be.false;
		expect(l12.new).to.be.false;
		expect(l13.new).to.be.false;
		expect(l14.new).to.be.false;
		expect(l15.new).to.be.false;
		expect(l16.new).to.be.false;
		expect(l17.new).to.be.false;
		expect(l18.new).to.be.false;
		expect(l19.new).to.be.false;

		done();
	});

	it('Successfully Mounted: All Nodes and Leaves are mapped in BlankMap', function(done) {
		let el = document.querySelector(`[data-node-key="${n1.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n2.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n3.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n4.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n5.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n6.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n7.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n8.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n9.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n10.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n11.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n12.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-node-key="${n13.id}"]`);
		expect(BlankMap.has(el)).to.be.true;

		el = document.querySelector(`[data-leaf-key="${l1.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l2.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l3.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l4.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l5.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l6.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l7.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l8.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l9.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l10.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l11.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l12.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l13.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l14.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l15.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l16.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l17.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l18.id}"]`);
		expect(BlankMap.has(el)).to.be.true;
		el = document.querySelector(`[data-leaf-key="${l19.id}"]`);
		expect(BlankMap.has(el)).to.be.true;

		done();
	});

	it('Successfully Mounted: All Nodes and Leaves are mapped in ReactMap', function(done) {
		expect(ReactMap.has(n1)).to.be.true;
		expect(ReactMap.has(n2)).to.be.true;
		expect(ReactMap.has(n3)).to.be.true;
		expect(ReactMap.has(n4)).to.be.true;
		expect(ReactMap.has(n5)).to.be.true;
		expect(ReactMap.has(n6)).to.be.true;
		expect(ReactMap.has(n7)).to.be.true;
		expect(ReactMap.has(n8)).to.be.true;
		expect(ReactMap.has(n9)).to.be.true;
		expect(ReactMap.has(n10)).to.be.true;
		expect(ReactMap.has(n11)).to.be.true;
		expect(ReactMap.has(n12)).to.be.true;
		expect(ReactMap.has(n13)).to.be.true;

		expect(ReactMap.has(l1)).to.be.true;
		expect(ReactMap.has(l2)).to.be.true;
		expect(ReactMap.has(l3)).to.be.true;
		expect(ReactMap.has(l4)).to.be.true;
		expect(ReactMap.has(l5)).to.be.true;
		expect(ReactMap.has(l6)).to.be.true;
		expect(ReactMap.has(l7)).to.be.true;
		expect(ReactMap.has(l8)).to.be.true;
		expect(ReactMap.has(l9)).to.be.true;
		expect(ReactMap.has(l10)).to.be.true;
		expect(ReactMap.has(l11)).to.be.true;
		expect(ReactMap.has(l12)).to.be.true;
		expect(ReactMap.has(l13)).to.be.true;
		expect(ReactMap.has(l14)).to.be.true;
		expect(ReactMap.has(l15)).to.be.true;
		expect(ReactMap.has(l16)).to.be.true;
		expect(ReactMap.has(l17)).to.be.true;
		expect(ReactMap.has(l18)).to.be.true;
		expect(ReactMap.has(l19)).to.be.true;

		done();
	});

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

	describe('BlankSelection with setWindowSelection()', function() {

		describe('Selection is collapsed', function() {

			it('Leaf is text', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l2.id}"]`);
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 2, 2);

				const bs = new BlankSelection();
				expect(bs.start.leaf.id).to.equal(l2.id);
				expect(bs.end.leaf).to.equal(l2);
				expect(bs.start.range[0]).to.equal(2);
				expect(bs.start.range[1]).to.equal(2);
				expect(bs.end.range[0]).to.equal(2);
				expect(bs.end.range[1]).to.equal(2);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor.firstChild);
				expect(sel.anchorOffset).to.equal(2);
				expect(sel.focusNode).to.equal(focus.firstChild);
				expect(sel.focusOffset).to.equal(2);

		
				done();
			});

			it('Leaf is empty', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l9.id}"]`);
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 0, 0);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l9);
				expect(bs.end.leaf).to.equal(l9);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor.firstChild);
				expect(sel.anchorOffset).to.equal(0);
				expect(sel.focusNode).to.equal(focus.firstChild);
				expect(sel.focusOffset).to.equal(0);

				done();
			});

			it('Leaf is image', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l11.id}"]`);
				const focus = anchor;

				window.quickSelect(anchor, focus, anchor.children.length - 1, focus.children.length - 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l11);
				expect(bs.end.leaf).to.equal(l11);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor);
				expect(sel.anchorOffset).to.equal(anchor.children.length - 1);
				expect(sel.focusNode).to.equal(focus);
				expect(sel.focusOffset).to.equal(focus.children.length - 1);

				done();
			});

		});

		describe('Selection is in one Leaf', function() {

			it('Leaf is text', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l6.id}"]`);
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 2, 6);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l6);
				expect(bs.end.leaf).to.equal(l6);
				expect(bs.start.range[0]).to.equal(2);
				expect(bs.start.range[1]).to.equal(6);
				expect(bs.end.range[0]).to.equal(2);
				expect(bs.end.range[1]).to.equal(6);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor.firstChild);
				expect(sel.anchorOffset).to.equal(2);
				expect(sel.focusNode).to.equal(focus.firstChild);
				expect(sel.focusOffset).to.equal(6);

				done();
			});

			it('Leaf is text and selection is backward', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l6.id}"]`);
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 6, 2);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l6);
				expect(bs.end.leaf).to.equal(l6);
				expect(bs.start.range[0]).to.equal(2);
				expect(bs.start.range[1]).to.equal(6);
				expect(bs.end.range[0]).to.equal(2);
				expect(bs.end.range[1]).to.equal(6);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(focus.firstChild);
				expect(sel.anchorOffset).to.equal(2);
				expect(sel.focusNode).to.equal(anchor.firstChild);
				expect(sel.focusOffset).to.equal(6);

				done();
			});

		});

		describe('Selection spans multiple Leaves in one Node', function() {

			it('Selection is forward', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l6.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l8.id}"]`);;

				window.quickSelect(anchor.firstChild, focus.firstChild, 5, 4);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l6);
				expect(bs.end.leaf).to.equal(l8);
				expect(bs.start.range[0]).to.equal(5);
				expect(bs.start.range[1]).to.equal(l6.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(4);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor.firstChild);
				expect(sel.anchorOffset).to.equal(5);
				expect(sel.focusNode).to.equal(focus.firstChild);
				expect(sel.focusOffset).to.equal(4);

				done();
			});

			it('Selection is backward', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l8.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l6.id}"]`);;

				window.quickSelect(anchor.firstChild, focus.firstChild, 4, 5);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l6);
				expect(bs.end.leaf).to.equal(l8);
				expect(bs.start.range[0]).to.equal(5);
				expect(bs.start.range[1]).to.equal(l6.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(4);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(focus.firstChild);
				expect(sel.anchorOffset).to.equal(5);
				expect(sel.focusNode).to.equal(anchor.firstChild);
				expect(sel.focusOffset).to.equal(4);

				done();
			});

		});

		describe('Selection spans multiple Nodes', function(done) {

			it('anchor and focus are text Leaves at the same depth', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l3.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l10.id}"]`);

				window.quickSelect(anchor.firstChild, focus.firstChild, 0, 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l3);
				expect(bs.end.leaf).to.equal(l10);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(l3.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(1);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor.firstChild);
				expect(sel.anchorOffset).to.equal(0);
				expect(sel.focusNode).to.equal(focus.firstChild);
				expect(sel.focusOffset).to.equal(1);

				done();
			});

			it('anchor and focus are text Leaves at the same depth, and selection is backward', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l10.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l3.id}"]`);

				window.quickSelect(anchor.firstChild, focus.firstChild, 1, 0);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l3);
				expect(bs.end.leaf).to.equal(l10);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(l3.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(1);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(focus.firstChild);
				expect(sel.anchorOffset).to.equal(0);
				expect(sel.focusNode).to.equal(anchor.firstChild);
				expect(sel.focusOffset).to.equal(1);

				done();
			});

			it('anchor and focus are text Leaves at different depths', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l10.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l13.id}"]`);

				window.quickSelect(anchor.firstChild, focus.firstChild, 4, 0);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l10);
				expect(bs.end.leaf).to.equal(l13);
				expect(bs.start.range[0]).to.equal(4);
				expect(bs.start.range[1]).to.equal(l10.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor.firstChild);
				expect(sel.anchorOffset).to.equal(4);
				expect(sel.focusNode).to.equal(focus.firstChild);
				expect(sel.focusOffset).to.equal(0);

				done();
			});

			it('anchor and focus are text Leaves at different depths, and selection is backward', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l13.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l10.id}"]`);

				window.quickSelect(anchor.firstChild, focus.firstChild, 0, 4);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l10);
				expect(bs.end.leaf).to.equal(l13);
				expect(bs.start.range[0]).to.equal(4);
				expect(bs.start.range[1]).to.equal(l10.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(focus.firstChild);
				expect(sel.anchorOffset).to.equal(4);
				expect(sel.focusNode).to.equal(anchor.firstChild);
				expect(sel.focusOffset).to.equal(0);

				done();
			});

			it('anchor and focus are empty', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l9.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l12.id}"]`);

				window.quickSelect(anchor.firstChild, focus.firstChild, 1, 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l9);
				expect(bs.end.leaf).to.equal(l12);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor.firstChild);
				expect(sel.anchorOffset).to.equal(0);
				expect(sel.focusNode).to.equal(focus.firstChild);
				expect(sel.focusOffset).to.equal(0);

				done();
			});

			it('anchor is non-text and focus is text', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l11.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l15.id}"]`);

				window.quickSelect(anchor, focus.firstChild, anchor.children.length - 1, 5);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l11);
				expect(bs.end.leaf).to.equal(l15);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(5);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor);
				expect(sel.anchorOffset).to.equal(anchor.children.length - 1);
				expect(sel.focusNode).to.equal(focus.firstChild);
				expect(sel.focusOffset).to.equal(5);

				done();
			});

			it('anchor is non-text and focus is text, and selection is backward', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l15.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l11.id}"]`);

				window.quickSelect(anchor.firstChild, focus, 5, focus.children.length - 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l11);
				expect(bs.end.leaf).to.equal(l15);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(5);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(focus);
				expect(sel.anchorOffset).to.equal(focus.children.length - 1);
				expect(sel.focusNode).to.equal(anchor.firstChild);
				expect(sel.focusOffset).to.equal(5);

				done();
			});

			it('anchor and focus are both non-text', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l11.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l19.id}"]`);

				window.quickSelect(anchor, focus, anchor.children.length - 1, focus.children.length - 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l11);
				expect(bs.end.leaf).to.equal(l19);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(anchor);
				expect(sel.anchorOffset).to.equal(anchor.children.length - 1);
				expect(sel.focusNode).to.equal(focus);
				expect(sel.focusOffset).to.equal(focus.children.length - 1);

				done();
			});

			it('anchor and focus are both non-text, and selection is backward', function(done) {
				const anchor = document.querySelector(`[data-leaf-key="${l19.id}"]`);
				const focus = document.querySelector(`[data-leaf-key="${l11.id}"]`);

				window.quickSelect(anchor, focus, anchor.children.length - 1, focus.children.length - 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l11);
				expect(bs.end.leaf).to.equal(l19);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				setWindowSelection(bs);

				const sel = window.getSelection();
				expect(sel.anchorNode).to.equal(focus);
				expect(sel.anchorOffset).to.equal(focus.children.length - 1);
				expect(sel.focusNode).to.equal(anchor);
				expect(sel.focusOffset).to.equal(anchor.children.length - 1);

				done();
			});

		});

	});

/*
	applyLeavesStyle
	applyBranchType
	applyNodesStyle
	applyBranchText
*/

/*
	We are going to test if Blank ELements are mounted, unmounted, or updated. As for how the
	html looks like, we trust the component unit test.

	Unmounted: No longer in ReactMap and BlankMap, called componentWillUnmount()
	Mounted: In ReactMap and BlankMap, called componentDidMount()
	Updated: Still in ReactMap and BlankMap, called shouldComponentUpdate() and render()
*/

	describe('applyLeavesStyle', function(done) {

		describe('Selection is in the same Leaf', function() {

			it('Make "Leaf " of "Leaf 10" not underlined', function(done) {
				// Entire l10 should be replaced by two new Leaves
				// l10 -> unmounted
				// two new Leaves -> mounted

				const bc10 = ReactMap.get(l10);
				expect(l10.parent).to.equal(n6);
				const bc6 = ReactMap.get(n6);
				
				// Observe
				observe(bc10);
				observe(bc6);

				// Select
				const selections = select(l10, l10, 0, 5);
				const newStyles = { underline: false };
				applyLeavesStyle(selections, newStyles);

				// n6 should be DIRTY_CHILDREN
				expect(n6.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(1);

				// render
				render();

				// l10 should be unmounted
				expecting(l10, bc10, UNMOUNTED);

				// two new Leaves should be mounted
				let cn = n6;
					let cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf ');
					expect(cl.styles.underline).to.be.false;
					expecting(cl, null, MOUNTED);
					const sl = cl;
					cl = cl.nextLeaf;
					expect(cl.text).to.equal('10');
					expect(cl.styles.underline).to.be.true;
					expecting(cl, null, MOUNTED);

				// n6 should be untouched
				expecting(n6, bc6, UNTOUCHED);
				// n6's chainRef should be updated
				expecting(null, bc6.chainRef.current, UPDATED);

				// Unobserve
				unobserve(bc10);
				unobserve(bc6);

				// PAS
				selecting(sl, sl, 0, sl.text.length);

				done();
			});

			it('Undo', function(done) {
				// n6 should be untouched
				// Its chain should be updated
				// Its LeafChain should be unmounted
				const bc6 = ReactMap.get(n6);
				const n6_l1 = n6.firstChild;
				const bc_n6_l1 = ReactMap.get(n6_l1);
				const n6_l2 = n6_l1.nextLeaf;
				const bc_n6_l2 = ReactMap.get(n6_l2);
				
				// Observe
				observe(bc6);
				observe(bc_n6_l1);
				observe(bc_n6_l2);

				// Undo
				readyTempHistorySteps();
				undo();

				// n6 should be DIRTY_CHILDREN
				expect(n6.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(1);

				render();

				// n6 should be untouched
				expecting(n6, bc6, UNTOUCHED);
				// Its chain should be updated
				expecting(null, bc6.chainRef.current, UPDATED);
				// Its LeafChain should be unmounted
				expecting(n6_l1, bc_n6_l1, UNMOUNTED);
				expecting(n6_l2, bc_n6_l2, UNMOUNTED);
				// l10 mounted
				expecting(l10, null, MOUNTED);

				// unobserve
				unobserve(bc6);
				unobserve(bc_n6_l1);
				unobserve(bc_n6_l2);

				// PAS
				selecting(l10, l10, 0, 5);

				done();
			});

			it('Redo', function(done) {
				// Entire l10 should be replaced by two new Leaves
				// l10 -> unmounted
				// two new Leaves -> mounted

				const bc10 = ReactMap.get(l10);
				expect(l10.parent).to.equal(n6);
				const bc6 = ReactMap.get(n6);
				
				// Observe
				observe(bc10);
				observe(bc6);

				// Redo
				readyTempHistorySteps();
				redo();

				// n6 should be DIRTY_CHILDREN
				expect(n6.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(1);

				// render
				render();

				// l10 should be unmounted
				expecting(l10, bc10, UNMOUNTED);

				// two new Leaves should be mounted
				let cn = n6;
					let cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf ');
					expect(cl.styles.underline).to.be.false;
					expecting(cl, null, MOUNTED);
					const sl = cl;
					cl = cl.nextLeaf;
					expect(cl.text).to.equal('10');
					expect(cl.styles.underline).to.be.true;
					expecting(cl, null, MOUNTED);

				// n6 should be untouched
				expecting(n6, bc6, UNTOUCHED);
				// n6's chainRef should be updated
				expecting(null, bc6.chainRef.current, UPDATED);

				// Unobserve
				unobserve(bc10);
				unobserve(bc6);

				// PAS
				selecting(sl, sl, 0, sl.text.length);

				// Undo for next test
				readyTempHistorySteps();
				undo();
				render();

				done();
			});

		});

		describe('Selection spans multiple Leaves in the same Node', function() {

			/*
				(0)---<l1-l2-l3>
			*/
			it('Make "1" of "Leaf 1" to "Leaf 2" to "Leaf" of "Leaf 3" bold', function(done) {
				readyTempHistorySteps();
				// n1 untouched
				// n1 chain updated
				// all Leaves unmounted
				const bc_n1 = ReactMap.get(n1);
				const bc_l1 = ReactMap.get(l1);
				const bc_l2 = ReactMap.get(l2);
				const bc_l3 = ReactMap.get(l3);

				// observe
				observe(bc_n1);
				observe(bc_l1);
				observe(bc_l2);
				observe(bc_l3);

				// select
				const selections = select(l1, l3, 5, 4);
				const newStyles = { bold: true };
				applyLeavesStyle(selections, newStyles);

				// n1 chain should be dirty
				expect(n1.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(1);

				// render
				render();

				// n1 untouched
				expecting(n1, bc_n1, UNTOUCHED);
				// n1 chain updated
				expecting(null, bc_n1.chainRef.current, UPDATED);
				// all Leaves unmounted
				expecting(l1, bc_l1, UNMOUNTED);
				expecting(l2, bc_l2, UNMOUNTED);
				expecting(l3, bc_l3, UNMOUNTED);

				// new Leaves mounted
				let cn = n1;
					let cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf ');
					expect(cl.styles.bold).to.be.false;
					expecting(cl, null, MOUNTED);
					cl = cl.nextLeaf;
					expect(cl.text).to.equal('1Leaf 2Leaf');
					expect(cl.styles.bold).to.be.true;
					expecting(cl, null, MOUNTED);
					const sl = cl;
					cl = cl.nextLeaf;
					expect(cl.text).to.equal(' 3');
					expect(cl.styles.bold).to.be.false;
					expecting(cl, null, MOUNTED);

				// unobserve
				unobserve(bc_n1);
				unobserve(bc_l1);
				unobserve(bc_l2);
				unobserve(bc_l3);

				// PAS
				selecting(sl, sl, 0, sl.text.length);

				done();
			});

			it('Undo', function(done) {
				// n1 untouched
				// n1 chain updated
				// all Leaves unmounted
				const bc_n1 = ReactMap.get(n1);
				const n1_l1 = n1.firstChild;
				const bc_n1_l1 = ReactMap.get(n1_l1);
				const n1_l2 = n1_l1.nextLeaf;
				const bc_n1_l2 = ReactMap.get(n1_l2);
				const n1_l3 = n1_l2.nextLeaf;
				const bc_n1_l3 = ReactMap.get(n1_l3);

				// observe
				observe(bc_n1);
				observe(bc_n1_l1);
				observe(bc_n1_l2);
				observe(bc_n1_l3);

				// Undo
				readyTempHistorySteps();
				undo();

				// n1 chain should be dirty
				expect(n1.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(1);

				// render
				render();

				// n1 untouched
				expecting(n1, bc_n1, UNTOUCHED);
				// n1 chain updated
				expecting(null, bc_n1.chainRef.current, UPDATED);
				// all Leaves unmounted
				expecting(n1_l1, bc_n1_l1, UNMOUNTED);
				expecting(n1_l2, bc_n1_l2, UNMOUNTED);
				expecting(n1_l3, bc_n1_l3, UNMOUNTED);

				// l1, l2, l3 mounted
				expecting(l1, null, MOUNTED);
				expecting(l2, null, MOUNTED);
				expecting(l3, null, MOUNTED);

				// unobserve
				unobserve(bc_n1);
				unobserve(bc_n1_l1);
				unobserve(bc_n1_l2);
				unobserve(bc_n1_l3);

				// PAS
				selecting(l1, l3, 5, 4);

				done();
			});

			it('Redo', function(done) {
				// n1 untouched
				// n1 chain updated
				// all Leaves unmounted
				const bc_n1 = ReactMap.get(n1);
				const bc_l1 = ReactMap.get(l1);
				const bc_l2 = ReactMap.get(l2);
				const bc_l3 = ReactMap.get(l3);

				// observe
				observe(bc_n1);
				observe(bc_l1);
				observe(bc_l2);
				observe(bc_l3);

				// Redo
				readyTempHistorySteps();
				redo();

				// n1 chain should be dirty
				expect(n1.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(1);

				// render
				render();

				// n1 untouched
				expecting(n1, bc_n1, UNTOUCHED);
				// n1 chain updated
				expecting(null, bc_n1.chainRef.current, UPDATED);
				// all Leaves unmounted
				expecting(l1, bc_l1, UNMOUNTED);
				expecting(l2, bc_l2, UNMOUNTED);
				expecting(l3, bc_l3, UNMOUNTED);

				// new Leaves mounted
				let cn = n1;
					let cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf ');
					expect(cl.styles.bold).to.be.false;
					expecting(cl, null, MOUNTED);
					cl = cl.nextLeaf;
					expect(cl.text).to.equal('1Leaf 2Leaf');
					expect(cl.styles.bold).to.be.true;
					expecting(cl, null, MOUNTED);
					const sl = cl;
					cl = cl.nextLeaf;
					expect(cl.text).to.equal(' 3');
					expect(cl.styles.bold).to.be.false;
					expecting(cl, null, MOUNTED);

				// unobserve
				unobserve(bc_n1);
				unobserve(bc_l1);
				unobserve(bc_l2);
				unobserve(bc_l3);

				// PAS
				selecting(sl, sl, 0, sl.text.length);

				// Undo for next test
				readyTempHistorySteps();
				undo();
				render();

				done();
			});

		});

		describe('Selection spans multiple Nodes', function() {

			/*
				(2)---(3)---<l12>
		        |	  |
		        |	  (3)---<l13-l14>
		        |
		        (2)---(3)---<l15-l16-l17-l18>
		    */
			it('Make "13" of "Leaf 13" to "Leaf" of "Leaf 16" italic', function(done) {
				readyTempHistorySteps();
				// n10 untouched
				// n10 chain updated
				expectation.register(n10, DIRTY_CHILDREN, UPDATED);
				// l13 unmounted (replaced)
				expectation.register(l13, CLEAN, UNMOUNTED);
				// l14 unmounted (merged)
				expectation.register(l14, CLEAN, UNMOUNTED);
				// n12 untouched
				// n12 chain updated
				expectation.register(n12, DIRTY_CHILDREN, UPDATED);
				// l15 unmounted (merged)
				expectation.register(l15, CLEAN, UNMOUNTED);
				// l16 unmounted (replaced)
				expectation.register(l16, CLEAN, UNMOUNTED);
				// l17 and l18 not updated
				expectation.register(l17, CLEAN, NOT_UPDATED);
				expectation.register(l18, CLEAN, NOT_UPDATED);

				// select
				const selections = select(l13, l16, 5, 4);
				const newStyles = { italic: true };
				applyLeavesStyle(selections, newStyles);

				// n1 chain should be dirty
				expect(n10.dirty).to.equal(DIRTY_CHILDREN);
				expect(n12.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(2);

				// render
				render();

				// Run expectations
				expectation.run();

				// new Leaves mounted
				let cn = n10;
					let cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf ');
					expect(cl.styles.italic).to.be.false;
					expecting(cl, null, MOUNTED);
					cl = cl.nextLeaf;
					expect(cl.text).to.equal('13Leaf 14');
					expect(cl.styles.italic).to.be.true;
					expecting(cl, null, MOUNTED);
					const sl1 = cl;
					expect(cl.nextLeaf).to.equal(null);
				cn = n12;
					cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf 15Leaf');
					expect(cl.styles.bold).to.be.true;
					expect(cl.styles.italic).to.be.true;
					expecting(cl, null, MOUNTED);
					const sl2 = cl;
					cl = cl.nextLeaf;
					expect(cl.text).to.equal(' 16');
					expect(cl.styles.bold).to.be.true;
					expect(cl.styles.italic).to.be.false;
					expecting(cl, null, MOUNTED);
					cl = cl.nextLeaf;
					expect(cl).to.equal(l17);
					cl = cl.nextLeaf;
					expect(cl).to.equal(l18);
					expect(cl.nextLeaf).to.equal(null);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(sl1, sl2, 0, sl2.text.length);

				done();
			});

			it('Undo', function(done) {
				// n10 untouched
				// n10 chain updated
				expectation.register(n10, DIRTY_CHILDREN, UPDATED);
				// n10's l1 unmounted
				expectation.register(n10.firstChild, CLEAN, UNMOUNTED);
				// n10's l2 unmounted
				expectation.register(n10.firstChild.nextLeaf, CLEAN, UNMOUNTED);
				// n12 untouched
				// n12 chain updated
				expectation.register(n12, DIRTY_CHILDREN, UPDATED);
				// n12's l1 unmounted
				expectation.register(n12.firstChild, CLEAN, UNMOUNTED);
				// n12's l2 unmounted
				expectation.register(n12.firstChild.nextLeaf, CLEAN, UNMOUNTED);
				// l17 and l18 not updated
				expectation.register(l17, CLEAN, NOT_UPDATED);
				expectation.register(l18, CLEAN, NOT_UPDATED);

				// Undo
				readyTempHistorySteps();
				undo();

				// n1 chain should be dirty
				expect(n10.dirty).to.equal(DIRTY_CHILDREN);
				expect(n12.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(2);

				// render
				render();

				// Run expectations
				expectation.run();
				expecting(l13, null, MOUNTED);
				expecting(l14, null, MOUNTED);
				expecting(l15, null, MOUNTED);
				expecting(l16, null, MOUNTED);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(l13, l16, 5, 4);

				done();
			});

			it('Redo', function(done) {
				// n10 untouched
				// n10 chain updated
				expectation.register(n10, DIRTY_CHILDREN, UPDATED);
				// l13 unmounted (replaced)
				expectation.register(l13, CLEAN, UNMOUNTED);
				// l14 unmounted (merged)
				expectation.register(l14, CLEAN, UNMOUNTED);
				// n12 untouched
				// n12 chain updated
				expectation.register(n12, DIRTY_CHILDREN, UPDATED);
				// l15 unmounted (merged)
				expectation.register(l15, CLEAN, UNMOUNTED);
				// l16 unmounted (replaced)
				expectation.register(l16, CLEAN, UNMOUNTED);
				// l17 and l18 not updated
				expectation.register(l17, CLEAN, NOT_UPDATED);
				expectation.register(l18, CLEAN, NOT_UPDATED);

				// Redo
				readyTempHistorySteps();
				redo();

				// n1 chain should be dirty
				expect(n10.dirty).to.equal(DIRTY_CHILDREN);
				expect(n12.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(2);

				// render
				render();

				// Run expectations
				expectation.run();

				// new Leaves mounted
				let cn = n10;
					let cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf ');
					expect(cl.styles.italic).to.be.false;
					expecting(cl, null, MOUNTED);
					cl = cl.nextLeaf;
					expect(cl.text).to.equal('13Leaf 14');
					expect(cl.styles.italic).to.be.true;
					expecting(cl, null, MOUNTED);
					const sl1 = cl;
					expect(cl.nextLeaf).to.equal(null);
				cn = n12;
					cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf 15Leaf');
					expect(cl.styles.bold).to.be.true;
					expect(cl.styles.italic).to.be.true;
					expecting(cl, null, MOUNTED);
					const sl2 = cl;
					cl = cl.nextLeaf;
					expect(cl.text).to.equal(' 16');
					expect(cl.styles.bold).to.be.true;
					expect(cl.styles.italic).to.be.false;
					expecting(cl, null, MOUNTED);
					cl = cl.nextLeaf;
					expect(cl).to.equal(l17);
					cl = cl.nextLeaf;
					expect(cl).to.equal(l18);
					expect(cl.nextLeaf).to.equal(null);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(sl1, sl2, 0, sl2.text.length);

				// Undo for next test
				readyTempHistorySteps();
				undo();
				render();

				done();
			});

		});

	});

	describe('applyBranchType', function() {

		describe('Root level and no shatter', function() {

			/*
				(0)---<l1-l2-l3>
		        |
		        (1)---(3)---<l4-l5>
		        |     |
		        |     (3)---<l6-l7-l8>
		        |     |
		        |     (3)---<l9>
		        |
		        (0)---<l10>
		    */
			it('Apply [0] to all LeafChains between n1 and n6', function(done) {
				readyTempHistorySteps();
				// n1 not updated
				expectation.register(n1, CLEAN, NOT_UPDATED);
				// n2 unmounted
				expectation.register(n2, CLEAN, UNMOUNTED);
				// n3 also unmounted
				expectation.register(n3, CLEAN, UNMOUNTED);
				// n4 and n5 remounted (unmounted and then mounted)
				expectation.register(n4, DIRTY_SELF, REMOUNTED);
				expectation.register(n5, DIRTY_SELF, REMOUNTED);
				// n6 not updated
				expectation.register(n6, CLEAN, NOT_UPDATED);
				// root chain updated
				expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);

				// select
				const selections = select(l2, l10, 2, 3);
				const type = [0];
				applyBranchType(selections, type);

				// DocumentRoot should be DIRTY_CHILDREN
				expect(DocumentRoot.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(4);

				// render
				render();

				// run expectations
				expectation.run();

				let cn = n1;
				cn = cn.nextNode;
				expect(cn.nodeType).to.equal(0);
				expecting(cn, null, MOUNTED);
					let cl = cn.firstChild;
					expect(cl).to.equal(l4);
				cn = cn.nextNode;
				expect(cn).to.equal(n4);
				expect(cn.nodeType).to.equal(0);
					cl = cn.firstChild;
					expect(cl).to.equal(l6);
				cn = cn.nextNode;
				expect(cn).to.equal(n5);
				expect(cn.nodeType).to.equal(0);
					cl = cn.firstChild;
					expect(cl).to.equal(l9);
				expect(cn.nextNode).to.equal(n6);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(l2, l10, 2, 3);

				done();
			});

			it('Undo', function(done) {
				// n1 not updated
				expectation.register(n1, CLEAN, NOT_UPDATED);
				// n1.nextNode unmounted
				expectation.register(n1.nextNode, CLEAN, UNMOUNTED);
				// n4 and n5 remounted
				expectation.register(n4, DIRTY_SELF, REMOUNTED);
				expectation.register(n5, DIRTY_SELF, REMOUNTED);
				// n6 not updated
				expectation.register(n6, CLEAN, NOT_UPDATED);
				// root chain updated
				expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);

				// Undo
				readyTempHistorySteps();
				undo();

				// DocumentRoot should be DIRTY_CHILDREN
				expect(DocumentRoot.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(4);

				// render
				render();

				// Run expectations
				expectation.run();
				expecting(n3, null, MOUNTED);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(l2, l10, 2, 3);

				done();
			});

			it('Redo', function(done) {
				// n1 not updated
				expectation.register(n1, CLEAN, NOT_UPDATED);
				// n2 unmounted
				expectation.register(n2, CLEAN, UNMOUNTED);
				// n3 also unmounted
				expectation.register(n3, CLEAN, UNMOUNTED);
				// n4 and n5 remounted
				expectation.register(n4, DIRTY_SELF, REMOUNTED);
				expectation.register(n5, DIRTY_SELF, REMOUNTED);
				// n6 not updated
				expectation.register(n6, CLEAN, NOT_UPDATED);
				// root chain updated
				expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);

				// Redo
				readyTempHistorySteps();
				redo();

				// DocumentRoot should be DIRTY_CHILDREN
				expect(DocumentRoot.dirty).to.equal(DIRTY_CHILDREN);
				expect(RenderStack.size()).to.equal(4);

				// render
				render();

				// run expectations
				expectation.run();

				let cn = n1;
				cn = cn.nextNode;
				expect(cn.nodeType).to.equal(0);
				expecting(cn, null, MOUNTED);
					let cl = cn.firstChild;
					expect(cl).to.equal(l4);
				cn = cn.nextNode;
				expect(cn).to.equal(n4);
				expect(cn.nodeType).to.equal(0);
					cl = cn.firstChild;
					expect(cl).to.equal(l6);
				cn = cn.nextNode;
				expect(cn).to.equal(n5);
				expect(cn.nodeType).to.equal(0);
					cl = cn.firstChild;
					expect(cl).to.equal(l9);
				expect(cn.nextNode).to.equal(n6);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(l2, l10, 2, 3);

				// Undo for next test
				readyTempHistorySteps();
				undo();
				render();

				done();
			});

		});

		describe('Second level and shatter', function() {

			/*
				(2)---(3)---<l12>
		        |	  |
		        |	  (3)---<l13-l14>
		        |
		        (2)---(3)---<l15-l16-l17-l18>
		    */

			it('Apply [1, 3] to all LeafChains between n10 and n12', function(done) {
				readyTempHistorySteps();
				// n8 chain updated
				expectation.register(n8, DIRTY_CHILDREN, UPDATED);
				// n10 unmounted
				expectation.register(n10, CLEAN, UNMOUNTED);
				// n11 unmounted
				expectation.register(n11, CLEAN, UNMOUNTED);
				// n12 remounted
				expectation.register(n12, CLEAN, REMOUNTED);
				// l13 and l16 remounted
				expectation.register(l13, CLEAN, REMOUNTED);
				expectation.register(l16, CLEAN, REMOUNTED);
				// n9 not updated
				expectation.register(n6, CLEAN, NOT_UPDATED);
				// root chain updated
				expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);

				// select
				const selections = select(l13, l16, 2, 3);
				const type = [1, 3];
				applyBranchType(selections, type);

				// DocumentRoot should be DIRTY_CHILDREN
				expect(DocumentRoot.dirty).to.equal(DIRTY_CHILDREN);
				expect(n8.dirty).to.equal(DIRTY_CHILDREN);

				// render
				render();

				// run expectations
				expectation.run();

				let cn = n8;
					cn = cn.firstChild;
					expect(cn).to.equal(n9);
					expect(cn.nextNode).to.equal(null);
				cn = cn.parent;
				cn = cn.nextNode;
				expect(cn.nodeType).to.equal(1);
				expecting(cn, null, MOUNTED);
					cn = cn.firstChild;
					expect(cn.nodeType).to.equal(3);
					expecting(cn, null, MOUNTED);
						let cl = cn.firstChild;
						expect(cl).to.equal(l13);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
					expect(cn).to.equal(n12);
						cl = cn.firstChild;
						expect(cl).to.equal(l15);
				cn = cn.parent;
				cn = cn.nextNode;
				expect(cn).to.equal(n13);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(l13, l16, 2, 3);

				done();
			});

			it('Undo', function(done) {
				// n8 chain updated
				expectation.register(n8, DIRTY_CHILDREN, UPDATED);
				// n8.nextNode unmounted
				expectation.register(n8.nextNode, CLEAN, UNMOUNTED);
				// n12 remounted
				expectation.register(n12, CLEAN, REMOUNTED);
				// n9 not updated
				expectation.register(n6, CLEAN, NOT_UPDATED);
				// root chain updated
				expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);

				// Undo
				readyTempHistorySteps();
				undo();

				// DocumentRoot should be DIRTY_CHILDREN
				expect(DocumentRoot.dirty).to.equal(DIRTY_CHILDREN);
				expect(n8.dirty).to.equal(DIRTY_CHILDREN);

				// render
				render();

				// Run expectations
				expectation.run();
				expecting(n10, null, MOUNTED);
				expecting(n11, null, MOUNTED);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(l13, l16, 2, 3);

				done();
			});

			it('Redo', function(done) {
				// n8 chain updated
				expectation.register(n8, DIRTY_CHILDREN, UPDATED);
				// n10 unmounted
				expectation.register(n10, CLEAN, UNMOUNTED);
				// n11 unmounted
				expectation.register(n11, CLEAN, UNMOUNTED);
				// n12 remounted
				expectation.register(n12, CLEAN, REMOUNTED);
				// n9 not updated
				expectation.register(n6, CLEAN, NOT_UPDATED);
				// root chain updated
				expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);

				// Redo
				readyTempHistorySteps();
				redo();

				// DocumentRoot should be DIRTY_CHILDREN
				expect(DocumentRoot.dirty).to.equal(DIRTY_CHILDREN);
				expect(n8.dirty).to.equal(DIRTY_CHILDREN);

				// render
				render();

				// run expectations
				expectation.run();

				let cn = n8;
					cn = cn.firstChild;
					expect(cn).to.equal(n9);
					expect(cn.nextNode).to.equal(null);
				cn = cn.parent;
				cn = cn.nextNode;
				expect(cn.nodeType).to.equal(1);
				expecting(cn, null, MOUNTED);
					cn = cn.firstChild;
					expect(cn.nodeType).to.equal(3);
					expecting(cn, null, MOUNTED);
						let cl = cn.firstChild;
						expect(cl).to.equal(l13);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
					expect(cn).to.equal(n12);
						cl = cn.firstChild;
						expect(cl).to.equal(l15);
				cn = cn.parent;
				cn = cn.nextNode;
				expect(cn).to.equal(n13);

				// Unbind expectation
				expectation.unbind();

				// PAS
				selecting(l13, l16, 2, 3);

				// Undo for next test
				readyTempHistorySteps();
				undo();
				render();

				done();
			});

		});

	});

	describe('applyBranchText', function() {

		/*
			(root)---(0)---<l1-l2-l3>
			         |
			         (1)---(3)---<l4-l5>
			         |     |
			         |     (3)---<l6-l7-l8>
			         |     |
			         |     (3)---<l9>
			         |
			         (0)---<l10>
			         |
			         (0)---<l11 - image>
			         |
			         (2)---(3)---<l12>
			         |	   |
			         |	   (3)---<l13-l14>
			         |
			         (2)---(3)---<l15-l16-l17-l18>
			         |
			         (0)---<l19 - image>
		*/
		describe('appendAndGrow', function() {

			describe('Pure string with newlines, and selection is multi-level', function() {

				it('Replace "eaf 2" in "Leaf 2" to "Leaf 6"', function(done) {
					readyTempHistorySteps();
					// Update CaretStyle
					applyCaretStyle(l2.styles);

					// DocumentRoot chain is updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n1 chain is updated
					expectation.register(n1, DIRTY_CHILDREN, UPDATED);
					// l2 is unmounted
					expectation.register(l2, CLEAN, UNMOUNTED);
					// l3 is unmounted
					expectation.register(l3, CLEAN, UNMOUNTED);
					// n2 chain is updated
					expectation.register(n2, DIRTY_CHILDREN, UPDATED);
					// n3 is unmounted
					expectation.register(n3, CLEAN, UNMOUNTED);
					// n4 is unmounted
					expectation.register(n4, CLEAN, UNMOUNTED);
					// l6 is unmounted
					expectation.register(l6, CLEAN, UNMOUNTED);
					// l7 is unmounted
					expectation.register(l7, CLEAN, UNMOUNTED);
					// l8 is unmounted
					expectation.register(l8, CLEAN, UNMOUNTED);

					// select
					const selections = select(l2, l6, 1, l6.text.length);
					const replacement = 'replacement 1\nreplacement 2';
					applyBranchText(selections, replacement);

					// render
					render();

					// run expectations
					expectation.run();

					// new tree
					let cn = n1;
						let cl = cn.firstChild;
						expect(cl).to.equal(l1);
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Lreplacement 1');
						expect(cl.styles.bold).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
						expecting(cl, null, MOUNTED);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						cl = cn.firstChild;
						expect(cl.text).to.equal('replacement 2Leaf 7');
						expect(cl.styles.bold).to.be.true;
						expecting(cl, null, MOUNTED);
						const sl = cl;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 8');
						expect(cl.styles.italic).to.be.true;
						expecting(cl, null, MOUNTED);
					cn = cn.nextNode;
					expect(cn).to.equal(n2);
						cn = cn.firstChild;
						expect(cn).to.equal(n5);
							cl = cn.firstChild;
							expect(cl).to.equal(l9);

					// unbind expectations
					expectation.unbind();

					// pas
					selecting(sl, sl, ('replacement 2').length, ('replacement 2').length);

					done();
				});

				it('Undo', function(done) {
					// DocumentRoot chain is updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n1 chain is updated
					expectation.register(n1, DIRTY_CHILDREN, UPDATED);
					// l1.nextLeaf is unmounted
					expectation.register(l1.nextLeaf, CLEAN, UNMOUNTED);
					// n1.nextNode is unmounted
					expectation.register(n1.nextNode, CLEAN, UNMOUNTED);
					// n2 chain is updated
					expectation.register(n2, DIRTY_CHILDREN, UPDATED);

					// Undo
					readyTempHistorySteps();
					undo();

					// render
					render();

					// run expectations
					expectation.run();

					// tree
					let cn = n1;
						let cl = cn.firstChild;
						expect(cl).to.equal(l1);
						cl = cl.nextLeaf;
						expect(cl).to.equal(l2);
						expecting(cl, null, MOUNTED);
						cl = cl.nextLeaf;
						expect(cl).to.equal(l3);
						expecting(cl, null, MOUNTED);
					cn = cn.nextNode;
					expect(cn).to.equal(n2);
						cn = cn.firstChild;
						expect(cn).to.equal(n3);
						expecting(n3, null, MOUNTED);
						cn = cn.nextNode;
						expect(cn).to.equal(n4);
							cl = cn.firstChild;
							expect(cl).to.equal(l6);
							expecting(cl, null, MOUNTED);
							cl = cl.nextLeaf;
							expect(cl).to.equal(l7);
							expecting(cl, null, MOUNTED);

					// unbind expectations
					expectation.unbind();

					// pas
					selecting(l2, l6, 1, l6.text.length);

					done();
				});

				it('Redo', function(done) {
					// DocumentRoot chain is updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n1 chain is updated
					expectation.register(n1, DIRTY_CHILDREN, UPDATED);
					// l2 is unmounted
					expectation.register(l2, CLEAN, UNMOUNTED);
					// l3 is unmounted
					expectation.register(l3, CLEAN, UNMOUNTED);
					// n2 chain is updated
					expectation.register(n2, DIRTY_CHILDREN, UPDATED);
					// n3 is unmounted
					expectation.register(n3, CLEAN, UNMOUNTED);
					// n4 is unmounted
					expectation.register(n4, CLEAN, UNMOUNTED);
					// l6 is unmounted
					expectation.register(l6, CLEAN, UNMOUNTED);
					// l7 is unmounted
					expectation.register(l7, CLEAN, UNMOUNTED);
					// l8 is unmounted
					expectation.register(l8, CLEAN, UNMOUNTED);

					// Redo
					readyTempHistorySteps();
					redo();

					// render
					render();

					// run expectations
					expectation.run();

					// new tree
					let cn = n1;
						let cl = cn.firstChild;
						expect(cl).to.equal(l1);
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Lreplacement 1');
						expect(cl.styles.bold).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
						expecting(cl, null, MOUNTED);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						cl = cn.firstChild;
						expect(cl.text).to.equal('replacement 2Leaf 7');
						expect(cl.styles.bold).to.be.true;
						expecting(cl, null, MOUNTED);
						const sl = cl;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 8');
						expect(cl.styles.italic).to.be.true;
						expecting(cl, null, MOUNTED);
					cn = cn.nextNode;
					expect(cn).to.equal(n2);
						cn = cn.firstChild;
						expect(cn).to.equal(n5);
							cl = cn.firstChild;
							expect(cl).to.equal(l9);

					// unbind expectations
					expectation.unbind();

					// pas
					selecting(sl, sl, ('replacement 2').length, ('replacement 2').length);

					// Undo for next test
					readyTempHistorySteps();
					undo();
					render();

					done();
				});

			});

			describe('NodeChain with the same NodeType', function() {

				/*
					(1)---(3)---<l4-l5>
			        |     |
			        |     (3)---<l6-l7-l8>
			        |     |
			        |     (3)---<l9>
			        |
			        (0)---<l10>
			    */

				/*
					(1)---(3)---<ll1>
					      |
					      (3)---<ll2>
				*/
				it('Replace l9 to "Leaf" of l10 with a NodeChain', function(done) {
					readyTempHistorySteps();

					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n6 unmounted
					expectation.register(n6, CLEAN, UNMOUNTED);
					// n5 chain updated
					expectation.register(n5, DIRTY_CHILDREN, UPDATED);
					// n2 chain updated
					expectation.register(n2, DIRTY_CHILDREN, UPDATED);

					// select
					const nn1 = new Node({ nodeType: 1 });
					const nn2 = new Node({ nodeType: 3 });
						const ll1 = new Leaf({ text: 'll1' });
					const nn3 = new Node({ nodeType: 3 });
						const ll2 = new Leaf({ text: 'll2', styles: new LeafStyles({ underline: true }) });

					setParentLink(nn2, nn1);
						setParentLink(ll1, nn2);
					chainNode(nn3, nn2);
						setParentLink(ll2, nn3);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn1 });
					const selections = select(l9, l10, 0, 4);
					applyBranchText(selections, replacement);

					// render
					render();

					// run expectations
					expectation.run();

					// new tree
					let cn = n2;
						cn = cn.firstChild;
						expect(cn).to.equal(n3);
						cn = cn.nextNode;
						expect(cn).to.equal(n4);
						cn = cn.nextNode;
						expect(cn).to.equal(n5);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('ll1');
							expecting(cl, null, MOUNTED);
						cn = cn.nextNode;
						expecting(cn, null, MOUNTED);
							cl = cn.firstChild;
							expect(cl.text).to.equal('ll2 10');
							expect(cl.styles.underline).to.be.true;
							expecting(cl, null, MOUNTED);
							const sl = cl;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n7);

					// unbind expectations
					expectation.unbind();

					// pas
					selecting(sl, sl, ('ll2').length, ('ll2').length);

					done();
				});

				it('Undo', function(done) {
					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n5 chain updated
					expectation.register(n5, DIRTY_CHILDREN, UPDATED);
					// n5.nextNode unmounted
					expectation.register(n5.nextNode, CLEAN, UNMOUNTED);
					// n2 chain updated
					expectation.register(n2, DIRTY_CHILDREN, UPDATED);

					// Undo
					readyTempHistorySteps();
					undo();

					// render
					render();

					// run expectations
					expectation.run();

					// tree
					let cn = n2;
					expect(cn.nextNode).to.equal(n6);
					expecting(cn.nextNode, null, MOUNTED);
						cn = cn.firstChild;
						expect(cn).to.equal(n3);
						cn = cn.nextNode;
						expect(cn).to.equal(n4);
						cn = cn.nextNode;
						expect(cn).to.equal(n5);
						expect(cn.nextNode).to.equal(null);

					// unbind expectations
					expectation.unbind();

					// pas
					selecting(l9, l10, 0, 4);

					done();
				});

				it('Redo', function(done) {
					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n6 unmounted
					expectation.register(n6, CLEAN, UNMOUNTED);
					// n5 chain updated
					expectation.register(n5, DIRTY_CHILDREN, UPDATED);
					// n2 chain updated
					expectation.register(n2, DIRTY_CHILDREN, UPDATED);

					// Redo
					readyTempHistorySteps();
					redo();

					// render
					render();

					// run expectations
					expectation.run();

					// new tree
					let cn = n2;
						cn = cn.firstChild;
						expect(cn).to.equal(n3);
						cn = cn.nextNode;
						expect(cn).to.equal(n4);
						cn = cn.nextNode;
						expect(cn).to.equal(n5);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('ll1');
							expecting(cl, null, MOUNTED);
						cn = cn.nextNode;
						expecting(cn, null, MOUNTED);
							cl = cn.firstChild;
							expect(cl.text).to.equal('ll2 10');
							expect(cl.styles.underline).to.be.true;
							expecting(cl, null, MOUNTED);
							const sl = cl;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n7);

					// unbind expectations
					expectation.unbind();

					// pas
					selecting(sl, sl, ('ll2').length, ('ll2').length);

					// Undo for next test
					readyTempHistorySteps();
					undo();
					render();

					done();
				});

			});

			describe('applyLeafText', function() {

				it('Change l9 text', function(done) {
					readyTempHistorySteps();
					// Update CaretStyle
					applyCaretStyle(l9.styles);

					// l9 updated
					expectation.register(l9, DIRTY_SELF, UPDATED);
					// n5 untouched
					expectation.register(n5, CLEAN, UNTOUCHED);

					// select
					const selections = select(l9, l9, 0, 0);
					applyBranchText(selections, 'Leaf 9');

					// render stack
					expect(RenderStack.size()).to.equal(1);
					expect(l9.dirty).to.equal(DIRTY_SELF);

					// render
					render();

					// run
					expectation.run();

					// new tree
					let cn = n5;
						let cl = cn.firstChild;
						expect(cl).to.equal(l9);
						expect(cl.text).to.equal('Leaf 9');
						const sl = cl;

					// unbind
					expectation.unbind();

					// pas
					selecting(l9, l9, ('Leaf 9').length, ('Leaf 9').length);

					done();
				});

				it('Enter 1 letter after l9 text', function(done) {
					// l9 updated
					expectation.register(l9, DIRTY_SELF, UPDATED);
					// n5 untouched
					expectation.register(n5, CLEAN, UNTOUCHED);

					// select
					const selections = toSelections(new BlankSelection());
					applyBranchText(selections, '0');

					// render stack
					expect(RenderStack.size()).to.equal(1);
					expect(l9.dirty).to.equal(DIRTY_SELF);

					// render
					render();

					// run
					expectation.run();

					// new tree
					let cn = n5;
						let cl = cn.firstChild;
						expect(cl).to.equal(l9);
						expect(cl.text).to.equal('Leaf 90');
						const sl = cl;

					// unbind
					expectation.unbind();

					// pas
					selecting(l9, l9, ('Leaf 90').length, ('Leaf 90').length);

					done();
				});

				it('Undo', function(done) {
					// l9 updated
					expectation.register(l9, DIRTY_SELF, UPDATED);
					// n5 untouched
					expectation.register(n5, CLEAN, UNTOUCHED);

					// Undo
					readyTempHistorySteps();
					undo();

					// render
					render();

					// run
					expectation.run();

					// tree
					let cn = n5;
						let cl = cn.firstChild;
						expect(cl).to.equal(l9);
						expect(isZeroLeaf(cl)).to.be.true;

					// unbind
					expectation.unbind();

					// pas
					selecting(l9, l9, 0, 0);

					done();
				});

				it('Redo', function(done) {
					readyTempHistorySteps();

					// l9 updated
					expectation.register(l9, DIRTY_SELF, UPDATED);
					// n5 untouched
					expectation.register(n5, CLEAN, UNTOUCHED);

					// Redo
					readyTempHistorySteps();
					redo();

					// render stack
					expect(RenderStack.size()).to.equal(1);
					expect(l9.dirty).to.equal(DIRTY_SELF);

					// render
					render();

					// run
					expectation.run();

					// new tree
					let cn = n5;
						let cl = cn.firstChild;
						expect(cl).to.equal(l9);
						expect(cl.text).to.equal('Leaf 90');
						const sl = cl;

					// unbind
					expectation.unbind();

					// pas
					selecting(l9, l9, ('Leaf 90').length, ('Leaf 90').length);

					// Undo for next test
					readyTempHistorySteps();
					undo();
					render();

					done();
				});
			});

		});

		/*
			(root)---(0)---<l1-l2-l3>
			         |
			         (1)---(3)---<l4-l5>
			         |     |
			         |     (3)---<l6-l7-l8>
			         |     |
			         |     (3)---<l9>
			         |
			         (0)---<l10>
			         |
			         (0)---<l11 - image>
			         |
			         (2)---(3)---<l12>
			         |	   |
			         |	   (3)---<l13-l14>
			         |
			         (2)---(3)---<l15-l16-l17-l18>
			         |
			         (0)---<l19 - image>
		*/
		describe('shatterAndInsert', function() {

			describe('Replace an image with another image', function() {

				it('Replace l19', function(done) {
					readyTempHistorySteps();

					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n13 unmounted
					expectation.register(n13, CLEAN, UNMOUNTED);

					// select
					const nn1 = new Node({ nodeType: 0 });
						const ll1 = new Leaf({ type: IMAGE, custom: { src: 'http://s1.1zoom.me/big0/697/Sea_Palma_Beach_440579.jpg' } });

					setParentLink(ll1, nn1);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn1 });
					const selections = select(l19, l19, 0, 0);
					applyBranchText(selections, replacement);

					// render
					render();

					// run expectations
					expectation.run();

					// new tree
					let cn = n11;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expecting(cn, null, MOUNTED);
						let cl = cn.firstChild;
						expect(cl.type).to.equal(IMAGE);
						expect(cl.custom.src).to.equal('http://s1.1zoom.me/big0/697/Sea_Palma_Beach_440579.jpg');
						const sl = cl;
					expect(cn.nextNode).to.equal(null);

					// unbind
					expectation.unbind();

					// pas
					selecting(sl, sl, 0, 0);

					done();
				});

				it('Undo', function(done) {
					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n11.nextNode unmounted
					expectation.register(n11.nextNode, CLEAN, UNMOUNTED);

					// Undo
					readyTempHistorySteps();
					undo();

					// render
					render();

					// run
					expectation.run();

					// tree
					let cn = n11;
					expect(cn.nextNode).to.equal(n13);

					// unbind
					expectation.unbind();

					// pas
					select(l19, l19, 0, 0);

					done();
				});

				it('Redo', function(done) {
					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n13 unmounted
					expectation.register(n13, CLEAN, UNMOUNTED);

					// Redo
					readyTempHistorySteps();
					redo();

					// render
					render();

					// run expectations
					expectation.run();

					// new tree
					let cn = n11;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expecting(cn, null, MOUNTED);
						let cl = cn.firstChild;
						expect(cl.type).to.equal(IMAGE);
						expect(cl.custom.src).to.equal('http://s1.1zoom.me/big0/697/Sea_Palma_Beach_440579.jpg');
						const sl = cl;
					expect(cn.nextNode).to.equal(null);

					// unbind
					expectation.unbind();

					// pas
					selecting(sl, sl, 0, 0);

					// Undo for next test
					readyTempHistorySteps();
					undo();
					render();

					done();
				});

			});

			describe('Insert an image in a list', function() {

				/*
					(2)---(3)---<l15-l16-l17-l18>
				*/
				it('Replace l16 and l17 with an image', function(done) {
					readyTempHistorySteps();

					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n12 chain updated
					expectation.register(n12, DIRTY_CHILDREN, UPDATED);
					// n11 chain updated (due to shatter)
					expectation.register(n11, DIRTY_CHILDREN, UPDATED);
					// l15 unmounted
					expectation.register(l15, CLEAN, UNMOUNTED);

					// select
					const nn1 = new Node({ nodeType: 0 });
						const ll1 = new Leaf({ type: IMAGE, custom: { src: 'http://s1.1zoom.me/big0/697/Sea_Palma_Beach_440579.jpg' } });

					setParentLink(ll1, nn1);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn1 });
					const selections = select(l16, l17, 0, l17.text.length);
					applyBranchText(selections, replacement);

					// render
					render();

					// run
					expectation.run();

					// new tree
					let cn = n11;
						cn = cn.firstChild;
						expect(cn).to.equal(n12);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('Leaf 15');
							expecting(cl, null, MOUNTED);
							expect(cl.nextLeaf).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						cl = cn.firstChild;
						expect(cl.type).to.equal(IMAGE);
						expect(cl.custom.src).to.equal('http://s1.1zoom.me/big0/697/Sea_Palma_Beach_440579.jpg');
						const sl = cl;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n11.nodeType);
					expecting(cn, null, MOUNTED);
						cn = cn.firstChild;
						expect(cn.nodeType).to.equal(n12.nodeType);
						expecting(cn, null, MOUNTED);
							cl = cn.firstChild;
							expect(cl.text).to.equal('Leaf 18');
							expecting(cl, null, MOUNTED);
							expect(cl.nextLeaf).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(n13);

					// unbind
					expectation.unbind();

					// pas
					selecting(sl, sl, 0, 0);

					done();
				});

				it('Undo', function(done) {
					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n12 chain updated
					expectation.register(n12, DIRTY_CHILDREN, UPDATED);
					// n11 chain updated (due to shatter)
					expectation.register(n11, DIRTY_CHILDREN, UPDATED);
					// n11.nextNode unmounted
					expectation.register(n11.nextNode, CLEAN, UNMOUNTED);
					// n11.nextNode.nextNode unmounted
					expectation.register(n11.nextNode.nextNode, CLEAN, UNMOUNTED);

					// Undo
					readyTempHistorySteps();
					undo();

					// render
					render();

					// run
					expectation.run();

					// tree
					let cn = n11;
						cn = cn.firstChild;
						expect(cn).to.equal(n12);
							let cl = cn.firstChild;
							expect(cl).to.equal(l15);
							expecting(cl, null, MOUNTED);
							cl = cl.nextLeaf;
							expect(cl).to.equal(l16);
							expecting(cl, null, MOUNTED);
							cl = cl.nextLeaf;
							expect(cl).to.equal(l17);
							expecting(cl, null, MOUNTED);
							cl = cl.nextLeaf;
							expect(cl).to.equal(l18);
							expecting(cl, null, MOUNTED);
							expect(cl.nextLeaf).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(n13);

					// unbind
					expectation.unbind();

					// pas
					selecting(l16, l17, 0, l17.text.length);

					done();
				});

				it('Redo', function(done) {
					// DocumentRoot chain updated
					expectation.register(DocumentRoot, DIRTY_CHILDREN, UPDATED);
					// n12 chain updated
					expectation.register(n12, DIRTY_CHILDREN, UPDATED);
					// n11 chain updated (due to shatter)
					expectation.register(n11, DIRTY_CHILDREN, UPDATED);
					// l15 unmounted
					expectation.register(l15, CLEAN, UNMOUNTED);

					// Redo
					readyTempHistorySteps();
					redo();

					// render
					render();

					// run
					expectation.run();

					// new tree
					let cn = n11;
						cn = cn.firstChild;
						expect(cn).to.equal(n12);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('Leaf 15');
							expecting(cl, null, MOUNTED);
							expect(cl.nextLeaf).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						cl = cn.firstChild;
						expect(cl.type).to.equal(IMAGE);
						expect(cl.custom.src).to.equal('http://s1.1zoom.me/big0/697/Sea_Palma_Beach_440579.jpg');
						const sl = cl;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n11.nodeType);
					expecting(cn, null, MOUNTED);
						cn = cn.firstChild;
						expect(cn.nodeType).to.equal(n12.nodeType);
						expecting(cn, null, MOUNTED);
							cl = cn.firstChild;
							expect(cl.text).to.equal('Leaf 18');
							expecting(cl, null, MOUNTED);
							expect(cl.nextLeaf).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(n13);

					// unbind
					expectation.unbind();

					// pas
					selecting(sl, sl, 0, 0);

					// Undo for next test
					readyTempHistorySteps();
					undo();
					render();

					done();
				});

			});

		});

		describe('removeAndAppend', function() {

			it('Backspace l1 text', function(done) {
				readyTempHistorySteps();

				// l1 updated
				expectation.register(l1, DIRTY_SELF, UPDATED);
				// n1 untouched
				expectation.register(n1, CLEAN, UNTOUCHED);

				// select
				const selections = select(l1, l1, l1.text.length, l1.text.length);
				applyBranchText(selections, '', _BACKSPACE_);

				// render stack
				expect(RenderStack.size()).to.equal(1);
				expect(l1.dirty).to.equal(DIRTY_SELF);

				// render
				render();

				// run
				expectation.run();

				// new tree
				let cn = n1;
					let cl = cn.firstChild;
					expect(cl).to.equal(l1);
					expect(cl.text).to.equal('Leaf ');
					expect(cl.nextLeaf).to.equal(l2);

				// unbind
				expectation.unbind();

				// pas
				selecting(l1, l1, l1.text.length, l1.text.length);

				done();
			});

			it('Backspace again', function(done) {
				// l1 updated
				expectation.register(l1, DIRTY_SELF, UPDATED);
				// n1 untouched
				expectation.register(n1, CLEAN, UNTOUCHED);

				// select
				const selections = toSelections(new BlankSelection());
				applyBranchText(selections, '', _BACKSPACE_);

				// render stack
				expect(RenderStack.size()).to.equal(1);
				expect(l1.dirty).to.equal(DIRTY_SELF);

				// render
				render();

				// run
				expectation.run();

				// new tree
				let cn = n1;
					let cl = cn.firstChild;
					expect(cl).to.equal(l1);
					expect(cl.text).to.equal('Leaf');
					expect(cl.nextLeaf).to.equal(l2);

				// unbind
				expectation.unbind();

				// pas
				selecting(l1, l1, l1.text.length, l1.text.length);

				done();
			});

			it('Undo', function(done) {
				// l1 updated
				expectation.register(l1, DIRTY_SELF, UPDATED);
				// n1 untouched
				expectation.register(n1, CLEAN, UNTOUCHED);

				// Undo
				readyTempHistorySteps();
				undo();

				// render
				render();

				// run
				expectation.run();

				// tree
				let cn = n1;
					let cl = cn.firstChild;
					expect(cl).to.equal(l1);
					expect(cl.text).to.equal('Leaf 1');

				// unbind
				expectation.unbind();

				// pas
				selecting(l1, l1, l1.text.length, l1.text.length);

				done();
			});

			it('Redo', function(done) {
				// l1 updated
				expectation.register(l1, DIRTY_SELF, UPDATED);
				// n1 untouched
				expectation.register(n1, CLEAN, UNTOUCHED);

				// Redo
				readyTempHistorySteps();
				redo();

				// render stack
				expect(RenderStack.size()).to.equal(1);
				expect(l1.dirty).to.equal(DIRTY_SELF);

				// render
				render();

				// run
				expectation.run();

				// new tree
				let cn = n1;
					let cl = cn.firstChild;
					expect(cl).to.equal(l1);
					expect(cl.text).to.equal('Leaf');
					expect(cl.nextLeaf).to.equal(l2);

				// unbind
				expectation.unbind();

				// pas
				selecting(l1, l1, l1.text.length, l1.text.length);

				// Undo for next test
				readyTempHistorySteps();
				undo();
				render();

				done();
			});

		});

	});

	describe('applyNodesStyle', function() {

		/*
			(1)---(3)---<l4-l5>
		          |
		          (3)---<l6-l7-l8>
		          |
		          (3)---<l9>
		*/
		it('Change NodeStyles from l5 to l9', function(done) {
			readyTempHistorySteps();

			// n3 updated
			expectation.register(n3, DIRTY_SELF, UPDATED);
			// n4 updated
			expectation.register(n4, DIRTY_SELF, UPDATED);
			// n5 updated
			expectation.register(n5, DIRTY_SELF, UPDATED);
			// n2 untouched
			expectation.register(n2, CLEAN, UNTOUCHED);

			// select
			const newNodeStyles = { fontFamily: 2 };
			const selections = select(l5, l9, 0, 0);
			applyNodesStyle(selections, newNodeStyles);

			// render stack
			expect(RenderStack.size()).to.equal(3);
			expect(n3.dirty).to.equal(DIRTY_SELF);
			expect(n4.dirty).to.equal(DIRTY_SELF);
			expect(n5.dirty).to.equal(DIRTY_SELF);

			// render
			render();

			// run
			expectation.run();

			// new tree
			let cn = n2;
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
				expect(cn.styles.fontFamily).to.equal(2);
				cn = cn.nextNode;
				expect(cn).to.equal(n4);
				expect(cn.styles.fontFamily).to.equal(2);
				cn = cn.nextNode;
				expect(cn).to.equal(n5);
				expect(cn.styles.fontFamily).to.equal(2);

			// unbind
			expectation.unbind();

			// pas
			selecting(l5, l9, 0, 0);

			done();
		});

		it('Undo', function(done) {
			// n3 updated
			expectation.register(n3, DIRTY_SELF, UPDATED);
			// n4 updated
			expectation.register(n4, DIRTY_SELF, UPDATED);
			// n5 updated
			expectation.register(n5, DIRTY_SELF, UPDATED);
			// n2 untouched
			expectation.register(n2, CLEAN, UNTOUCHED);

			// Undo
			readyTempHistorySteps();
			undo();

			// render stack
			expect(RenderStack.size()).to.equal(3);
			expect(n3.dirty).to.equal(DIRTY_SELF);
			expect(n4.dirty).to.equal(DIRTY_SELF);
			expect(n5.dirty).to.equal(DIRTY_SELF);

			// render
			render();

			// run
			expectation.run();

			// new tree
			let cn = n2;
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
				expect(cn.styles.fontFamily).to.equal(1);
				cn = cn.nextNode;
				expect(cn).to.equal(n4);
				expect(cn.styles.fontFamily).to.equal(1);
				cn = cn.nextNode;
				expect(cn).to.equal(n5);
				expect(cn.styles.fontFamily).to.equal(1);

			// unbind
			expectation.unbind();

			// pas
			selecting(l5, l9, 0, 0);

			done();
		});

		it('Redo', function(done) {
			// n3 updated
			expectation.register(n3, DIRTY_SELF, UPDATED);
			// n4 updated
			expectation.register(n4, DIRTY_SELF, UPDATED);
			// n5 updated
			expectation.register(n5, DIRTY_SELF, UPDATED);
			// n2 untouched
			expectation.register(n2, CLEAN, UNTOUCHED);

			// Redo
			readyTempHistorySteps();
			redo();

			// render stack
			expect(RenderStack.size()).to.equal(3);
			expect(n3.dirty).to.equal(DIRTY_SELF);
			expect(n4.dirty).to.equal(DIRTY_SELF);
			expect(n5.dirty).to.equal(DIRTY_SELF);

			// render
			render();

			// run
			expectation.run();

			// new tree
			let cn = n2;
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
				expect(cn.styles.fontFamily).to.equal(2);
				cn = cn.nextNode;
				expect(cn).to.equal(n4);
				expect(cn.styles.fontFamily).to.equal(2);
				cn = cn.nextNode;
				expect(cn).to.equal(n5);
				expect(cn.styles.fontFamily).to.equal(2);

			// unbind
			expectation.unbind();

			// pas
			selecting(l5, l9, 0, 0);

			// Undo for next test
			readyTempHistorySteps();
			undo();
			render();

			done();
		});

	})

});
