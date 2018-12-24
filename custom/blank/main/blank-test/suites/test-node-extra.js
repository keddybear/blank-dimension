/* eslint-disable */
import { Node, NodeStyles, NullNode, NodeChain, NodeType, BranchType, PhantomNode, PhantomChain, DocumentRoot } from '../../node';
import { Leaf, isZeroLeaf, isTextLeaf, LeafStyles, CaretStyle, applyCaretStyle, NullLeaf, LeafChain, LeafText, ParentLink, Clipboard } from '../../leaf';
import { History, BlankHistoryStep } from '../../history';
import { BeforeActionSelection, PostActionSelection, clearBlankSelection, copyBlankSelection, toSelections } from '../../selection';
import { instanceOf } from '../../utils';
import {
	getPrevLeafChain,
	sameNodeStyles,
	chainNode,
	chainNodeChainBetween,
	rechainNode,
	createNewBranchAt,
	_PAST_STACK_,
	_FUTURE_STACK_,
	TempHistoryPastStep,
	TempHistoryFutureStep,
	_NOT_CHAINED_,
	_CHAINED_AFTER_,
	_CHAINED_BEFORE_,
	chainLeaf,
	readyHistoryStep,
	readyTempHistorySteps,
	setParentLink,
	autoMergeDirtyLeaves,
	undo,
	redo,
	copyLeaf,
	copyLeafChain,
	copyNode,
	_STOP_AT_NON_TEXT_,
	copyNodeChain,
	copyBranchText,
	copyFromClipboard,
	setLeafStyles,
	DirtyNewLeaves,
	applyLeafText,
	appendAndGrow,
	shatterAndInsert,
	removeAndAppend,
	_NEWLINE_,
	_DELETE_,
	_BACKSPACE_,
	applyBranchText
} from '../../integration';
import { expect } from 'chai';

/*
	copyNodeChain() with stopAtNonText set to true

	shatterAndInsert with non-text Leaves

	removeAndAppend with non-text Leaves
		- Also, empty DocumentRoot in removeAndAppend()

	applyBranchText with non-text Leaves
*/

describe('copyNodeChain() with stopAtNonText set to true', function() {

	const l1 = new Leaf({ text: 'Hello ' });
	const l2 = new Leaf({
		text: 'darkness, my',
		styles: new LeafStyles({ bold: true })
	});
	const l3 = new Leaf({ text: 'old friend.' });

	const l4 = new Leaf({
		text: 'This is a ',
		styles: new LeafStyles({ italic: true })
	});
	const l5 = new Leaf({ text: 'test.' });

	const l6 = new Leaf({ text: 'It has' });
	const l7 = new Leaf({
		text: ' three ',
		styles: new LeafStyles({ bold: true })
	});
	const l8 = new Leaf({ text: 'Leaves.' });

	const l9 = new Leaf({ type: 1, custom: { src: 'l9' } }); // l9 is image

	const l10 = new Leaf({ type: 1, custom: { src: 'l10' } }); // l10 is image

	const l11 = new Leaf({ text: 'Leaf 11' });

	const l12 = new Leaf({
		text: 'JoJo',
		styles: new LeafStyles({ bold: true })
	});
	const l13 = new Leaf({ text: ' is pretty good.' });

	const l14 = new Leaf({
		text: '1 ',
		styles: new LeafStyles({ bold: true })
	});
	const l15 = new Leaf({ text: '2 ' });
	const l16 = new Leaf({
		text: '3 ',
		styles: new LeafStyles({ bold: true })
	});
	const l17 = new Leaf({ text: '4' });

	const l18 = new Leaf({ type: 1, custom: { src: 'l18' } }); // l18 is image

	const n1 = new Node({ nodeType: 4 });
	const n2 = new Node({ nodeType: 1 });
		const n3 = new Node({ nodeType: 2 });
		const n4 = new Node({ nodeType: 3 });
	const n5 = new Node({ nodeType: 2 });
	const n8 = new Node({ nodeType: 3 });
	const n6 = new Node({ nodeType: 1 });
		const n7 = new Node({ nodeType: 2 });
			const n9 = new Node({ nodeType: 3 });
	const n10 = new Node({ nodeType: 4 });
	const n11 = new Node({ nodeType: 1 });
		const n12 = new Node({ nodeType: 2 });
	const n13 = new Node({ nodeType: 2 });

	let copy;

	/*
		(root)---(4)---<l1-l2-l3>
		         |
		         (1)---(2)---<l4-l5>
		         |     |
		         |     (3)---<l6-l7-l8>
		         |
		         (2)---<l9 - image>
		         |
		         (3)---<l10 - image>
		         |
		         (1)---(2)---(3)---<l11>
		         |
		         (4)---<l12-l13>
		         |
		         (1)---(2)---<l14-l15-l16-l17>
		         |
		         (2)---<l18 - image>
	*/
	before(function(done) {
		DocumentRoot.firstChild = null;
		History.clear(_PAST_STACK_);
		History.clear(_FUTURE_STACK_);
		TempHistoryPastStep.clear();
		TempHistoryFutureStep.clear();
		
		setParentLink(n1, null);
		chainNode(n2, n1);
		chainNode(n5, n2);
		chainNode(n8, n5);
		chainNode(n6, n8);
		chainNode(n10, n6);
		chainNode(n11, n10);
		chainNode(n13, n11);

		setParentLink(n3, n2);
		chainNode(n4, n3);

		setParentLink(n7, n6);
		setParentLink(n9, n7);

		setParentLink(n12, n11);

		chainLeaf(l2, l1);
		chainLeaf(l3, l2);

		chainLeaf(l5, l4);

		chainLeaf(l7, l6);
		chainLeaf(l8, l7);

		chainLeaf(l13, l12);

		chainLeaf(l15, l14);
		chainLeaf(l16, l15);
		chainLeaf(l17, l16);

		setParentLink(l1, n1);
		setParentLink(l4, n3);
		setParentLink(l6, n4);
		setParentLink(l9, n5);
		setParentLink(l10, n8);
		setParentLink(l11, n9);
		setParentLink(l12, n10);
		setParentLink(l14, n12);
		setParentLink(l18, n13);

		n1.new = false;
		n2.new = false;
		n3.new = false;
		n4.new = false;
		n5.new = false;
		n6.new = false;
		n7.new = false;
		n8.new = false;
		n9.new = false;
		n10.new = false;
		n11.new = false;
		n12.new = false;
		n13.new = false;

		l1.new = false;
		l2.new = false;
		l3.new = false;
		l4.new = false;
		l5.new = false;
		l6.new = false;
		l7.new = false;
		l8.new = false;
		l9.new = false;
		l10.new = false;
		l11.new = false;
		l12.new = false;
		l13.new = false;
		l14.new = false;
		l15.new = false;
		l16.new = false;
		l17.new = false;
		l18.new = false;

		done();
	});

	it('Copying should stop at l9', function(done) {
		copy = copyNodeChain(l1, l18, [5, l1.text.length], [0, l18.text.length], _STOP_AT_NON_TEXT_);

		const { startNode, endNode, firstLeaf: startLeaf, lastLeaf: endLeaf, stopLeaf } = copy;

		// startNode copies n1
		expect(startNode.nodeType).to.equal(n1.nodeType);
		expect(startNode.nextNode).to.equal(endNode);

		// endNode copies n2
		expect(endNode.nodeType).to.equal(n2.nodeType);
		expect(endNode.prevNode).to.equal(startNode);
		expect(endNode.nextNode).to.equal(null);

		// startLeaf copies l1
		expect(isTextLeaf(startLeaf)).to.be.true;
		expect(startLeaf.text).to.equal(' '); // range = [5, l1.text.length]

		// endleaf copies l8
		expect(isTextLeaf(endLeaf)).to.be.true;
		expect(endLeaf.text).to.equal(l8.text);
		expect(endLeaf.parent.nextNode).to.equal(null);

		// stopLeaf is l9
		let result = stopLeaf instanceof Leaf;
		expect(result).to.be.true;
		expect(isTextLeaf(stopLeaf)).to.be.false;
		expect(stopLeaf).to.equal(l9);

		done();
	});

	it('Copying starts at l9 and should stop at l10', function(done) {
		copy = copyNodeChain(l9, l18, [0, l9.text.length], [0, l18.text.length], _STOP_AT_NON_TEXT_);

		const { startNode, endNode, firstLeaf: startLeaf, lastLeaf: endLeaf, stopLeaf } = copy;

		// startNode copies n5
		expect(startNode.nodeType).to.equal(n5.nodeType);
		expect(startNode.nextNode).to.equal(null);

		// endNode is the same as startNode
		expect(endNode).to.equal(startNode);

		// startLeaf copies l9
		expect(isTextLeaf(startLeaf)).to.be.false;
		expect(startLeaf.type).to.equal(l9.type);
		expect(startLeaf.custom.src).to.equal(l9.custom.src);

		// endleaf is the same as l9
		expect(endLeaf).to.equal(startLeaf);

		// stopLeaf is l10
		let result = stopLeaf instanceof Leaf;
		expect(result).to.be.true;
		expect(isTextLeaf(stopLeaf)).to.be.false;
		expect(stopLeaf).to.equal(l10);

		done();
	});

	it('Copying starts at l10 and should stop at l18', function(done) {
		copy = copyNodeChain(l10, l18, [0, l10.text.length], [0, l18.text.length], _STOP_AT_NON_TEXT_);

		const { startNode, endNode, firstLeaf: startLeaf, lastLeaf: endLeaf, stopLeaf } = copy;

		// startNode copies n8
		expect(startNode.nodeType).to.equal(n8.nodeType);
		expect(startNode.prevNode).to.equal(null);

		// endNode copies n11
		expect(endNode.nodeType).to.equal(n11.nodeType);
		expect(endNode.nextNode).to.equal(null);

		// startLeaf copies l10
		expect(isTextLeaf(startLeaf)).to.be.false;
		expect(startLeaf.type).to.equal(l10.type);
		expect(startLeaf.custom.src).to.equal(l10.custom.src);

		// endleaf copies l17
		expect(isTextLeaf(endLeaf)).to.be.true;
		expect(endLeaf.text).to.equal(l17.text);
		expect(endLeaf.parent.nextNode).to.equal(null);

		// stopLeaf is l18
		let result = stopLeaf instanceof Leaf;
		expect(result).to.be.true;
		expect(isTextLeaf(stopLeaf)).to.be.false;
		expect(stopLeaf).to.equal(l18);

		done();
	});

	it('Copying starts at l18 and should finish with no stopLeaf', function(done) {
		copy = copyNodeChain(l18, l18, [0, l18.text.length], [0, l18.text.length], _STOP_AT_NON_TEXT_);

		const { startNode, endNode, firstLeaf: startLeaf, lastLeaf: endLeaf, stopLeaf } = copy;

		// startNode copies n13
		expect(startNode.nodeType).to.equal(n13.nodeType);
		expect(startNode.prevNode).to.equal(null);
		expect(startNode.nextNode).to.equal(null);

		// endNode is the same as startNode
		expect(endNode).to.equal(startNode);

		// startLeaf copies l18
		expect(isTextLeaf(startLeaf)).to.be.false;
		expect(startLeaf.type).to.equal(l18.type);
		expect(startLeaf.custom.src).to.equal(l18.custom.src);

		// endleaf is the same as startLeaf
		expect(endLeaf).to.equal(startLeaf);

		// stopLeaf is null
		expect(stopLeaf).to.equal(null);

		done();
	});

	it('Copy a NodeChain which only has one LeafChain', function(done) {
		copy = copyNodeChain(l2, l3, [10, l2.text.length], [0, l3.text.length], _STOP_AT_NON_TEXT_);

		const { startNode, endNode, firstLeaf: startLeaf, lastLeaf: endLeaf, stopLeaf } = copy;

		// startNode copies n4
		expect(startNode.nodeType).to.equal(n1.nodeType);
		expect(startNode.prevNode).to.equal(null);
		expect(startNode.nextNode).to.equal(null);

		// endNode is the same as startNode
		expect(endNode).to.equal(startNode);

		// startLeaf copies l2 [10, l2.text.length]
		expect(isTextLeaf(startLeaf)).to.be.true;
		expect(startLeaf.type).to.equal(l2.type);
		expect(startLeaf.text).to.equal('my');

		// endleaf copies l3
		expect(isTextLeaf(endLeaf)).to.be.true;
		expect(endLeaf.type).to.equal(l3.type);
		expect(endLeaf.text).to.equal(l3.text);

		// stopLeaf is null
		expect(stopLeaf).to.equal(null);

		done();
	});

});

describe('shatterAndInsert() with non-text Leaves', function(done) {

	describe('Selection is zero-width in a non-text Leaf', function(done) {

		const l1 = new Leaf({ type: 1, custom: { src: 'l1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 1 });
			const n2 = new Node({ nodeType: 2 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(1)---(2)---<l1 - image>
			         	   |
			               (2)---<l2>
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
			setParentLink(n2, n1);
			chainNode(n3, n2);

			// setParentLink(l1, n2);
			l1.parent = n2;
			n2.firstChild = l1;
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Replace l1 which is non-text', function(done) {
			/*
				replacement:

				(0)---<ll1>
				|
				(0)---<ll2 - image>
			*/
			const ll1 = new Leaf({ text: 'll1' });
			const ll2 = new Leaf({ type: 1, custom: { src: 'll2' } });

			const nn1 = new Node();
			const nn2 = new Node();

			chainNode(nn2, nn1);
			setParentLink(ll1, nn1);
			setParentLink(ll2, nn2);

			const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l1, range: [0, 0] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			shatterAndInsert(selections, replacement);

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(nn1);
			expect(cn.new).to.be.true;
			cn.new = false;
				let cl = cn.firstChild;
				expect(cl).to.equal(ll1);
				expect(cl.new).to.be.true;
				cl.new = false;
			cn = cn.nextNode;
			expect(cn).to.equal(nn2);
			expect(cn.new).to.be.true;
			cn.new = false;
				expect(cn.firstChild).to.equal(ll2);
				expect(cn.firstChild.new).to.be.true;
				cn.firstChild.new = false;
				const sl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn).to.equal(n1);
			expect(cn.nextNode).to.equal(null);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
				expect(cn.prevNode).to.equal(null);
				expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = n1;
				cn = cn.firstChild;
				expect(cn).to.equal(n2);
					expect(cn.firstChild).to.equal(l1);
				cn = cn.nextNode;
				expect(cn).to.equal(n3);
					expect(cn.firstChild).to.equal(l2);
				expect(cn.nextNode).to.equal(null);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l1);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
				let cl = cn.firstChild;
				expect(cl.text).to.equal('ll1');
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
				cl = cn.firstChild;
				expect(cl.type).to.equal(1);
				const sl = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n1);
			expect(cn.nextNode).to.equal(null);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
				expect(cn.prevNode).to.equal(null);
				expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

	describe('In selection, startLeaf is non-text but endLeaf is not', function(done) {

		const l1 = new Leaf({ type: 1, custom: { src: 'l1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 1 });
			const n2 = new Node({ nodeType: 2 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(1)---(2)---<l1 - image>
			         	   |
			               (2)---<l2>
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
			setParentLink(n2, n1);
			chainNode(n3, n2);

			// setParentLink(l1, n2);
			l1.parent = n2;
			n2.firstChild = l1;
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Replace l1 which is non-text', function(done) {
			/*
				replacement:

				(0)---<ll1>
				|
				(0)---<ll2 - image>
			*/
			const ll1 = new Leaf({ text: 'll1' });
			const ll2 = new Leaf({ type: 1, custom: { src: 'll2' } });

			const nn1 = new Node();
			const nn2 = new Node();

			chainNode(nn2, nn1);
			setParentLink(ll1, nn1);
			setParentLink(ll2, nn2);

			const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l2, range: [0, 5] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			shatterAndInsert(selections, replacement);

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(nn1);
			expect(cn.new).to.be.true;
			cn.new = false;
				let cl = cn.firstChild;
				expect(cl).to.equal(ll1);
				expect(cl.new).to.be.true;
				cl.new = false;
			cn = cn.nextNode;
			expect(cn).to.equal(nn2);
			expect(cn.new).to.be.true;
			cn.new = false;
				expect(cn.firstChild).to.equal(ll2);
				expect(cn.firstChild.new).to.be.true;
				cn.firstChild.new = false;
				const sl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn).to.equal(n1);
			expect(cn.nextNode).to.equal(null);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
				expect(cn.prevNode).to.equal(null);
				expect(cn.nextNode).to.equal(null);
					cl = cn.firstChild;
					expect(cl.text).to.equal('2');
					expect(cl.new).to.be.true;
					cl.new = false;

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = n1;
				cn = cn.firstChild;
				expect(cn).to.equal(n2);
					expect(cn.firstChild).to.equal(l1);
				cn = cn.nextNode;
				expect(cn).to.equal(n3);
					expect(cn.firstChild).to.equal(l2);
				expect(cn.nextNode).to.equal(null);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(5);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
				let cl = cn.firstChild;
				expect(cl.text).to.equal('ll1');
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
				cl = cn.firstChild;
				expect(cl.type).to.equal(1);
				const sl = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n1);
			expect(cn.nextNode).to.equal(null);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
				expect(cn.prevNode).to.equal(null);
				expect(cn.nextNode).to.equal(null);
					cl = cn.firstChild;
					expect(cl.text).to.equal('2');

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

	describe('In selection, startLeaf and endLeaf are non-text', function(done) {

		const l1 = new Leaf({ type: 1, custom: { src: 'l1' } });
		const l2 = new Leaf({ type: 1, custom: { src: 'l2' } });

		const n1 = new Node({ nodeType: 1 });
			const n2 = new Node({ nodeType: 2 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(1)---(2)---<l1 - image>
			         	   |
			               (2)---<l2 - image>
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
			setParentLink(n2, n1);
			chainNode(n3, n2);

			// setParentLink(l1, n2);
			l1.parent = n2;
			n2.firstChild = l1;
			// setParentLink(l2, n3);
			l2.parent = n3;
			n3.firstChild = l2;

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Replace l1 which is non-text', function(done) {
			/*
				replacement:

				(0)---<ll1>
				|
				(0)---<ll2 - image>
			*/
			const ll1 = new Leaf({ text: 'll1' });
			const ll2 = new Leaf({ type: 1, custom: { src: 'll2' } });

			const nn1 = new Node();
			const nn2 = new Node();

			chainNode(nn2, nn1);
			setParentLink(ll1, nn1);
			setParentLink(ll2, nn2);

			const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l2, range: [0, 0] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			shatterAndInsert(selections, replacement);

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(nn1);
			expect(cn.new).to.be.true;
			cn.new = false;
				let cl = cn.firstChild;
				expect(cl).to.equal(ll1);
				expect(cl.new).to.be.true;
				cl.new = false;
			cn = cn.nextNode;
			expect(cn).to.equal(nn2);
			expect(cn.new).to.be.true;
			cn.new = false;
				expect(cn.firstChild).to.equal(ll2);
				expect(cn.firstChild.new).to.be.true;
				cn.firstChild.new = false;
				const sl = cn.firstChild;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = n1;
				cn = cn.firstChild;
				expect(cn).to.equal(n2);
					expect(cn.firstChild).to.equal(l1);
				cn = cn.nextNode;
				expect(cn).to.equal(n3);
					expect(cn.firstChild).to.equal(l2);
				expect(cn.nextNode).to.equal(null);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
				let cl = cn.firstChild;
				expect(cl.text).to.equal('ll1');
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
				cl = cn.firstChild;
				expect(cl.type).to.equal(1);
				const sl = cl;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

	describe('The first Leaf in replacement is non-text', function(done) {

		const l1 = new Leaf({ text: 'Leaf 1' });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 1 });
			const n2 = new Node({ nodeType: 2 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(1)---(2)---<l1>
			         	   |
			               (2)---<l2>
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
			setParentLink(n2, n1);
			chainNode(n3, n2);

			setParentLink(l1, n2);
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Replace l1 which is non-text', function(done) {
			/*
				replacement:

				(0)---<ll1 - image>
				|
				(0)---<ll2 - image>
			*/
			const ll1 = new Leaf({ type: 1, custom: { src: 'll1' } });
			const ll2 = new Leaf({ type: 1, custom: { src: 'll2' } });

			const nn1 = new Node();
			const nn2 = new Node();

			chainNode(nn2, nn1);
			setParentLink(ll1, nn1);
			setParentLink(ll2, nn2);

			const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

			BeforeActionSelection.start = { leaf: l1, range: [5, l1.text.length] };
			BeforeActionSelection.end = { leaf: l2, range: [0, 5] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			shatterAndInsert(selections, replacement);

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				cn = cn.firstChild;
				expect(cn).to.equal(n2);
					let cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf ');
					expect(cl.new).to.be.true;
					cl.new = false;
				expect(cn.nextNode).to.equal(null);
			cn = cn.parent;
			cn = cn.nextNode;
			expect(cn).to.equal(nn1);
			expect(cn.new).to.be.true;
			cn.new = false;
				cl = cn.firstChild;
				expect(cl).to.equal(ll1);
				expect(cl.new).to.be.true;
				cl.new = false;
			cn = cn.nextNode;
			expect(cn).to.equal(nn2);
			expect(cn.new).to.be.true;
			cn.new = false;
				expect(cn.firstChild).to.equal(ll2);
				expect(cn.firstChild.new).to.be.true;
				cn.firstChild.new = false;
				const sl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(n1.nodeType);
			expect(cn.new).to.be.true;
			cn.new = false;
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl.text).to.equal('2');
					expect(cl.new).to.be.true;
					cl.new = false;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = n1;
				cn = cn.firstChild;
				expect(cn).to.equal(n2);
					expect(cn.firstChild).to.equal(l1);
				cn = cn.nextNode;
				expect(cn).to.equal(n3);
					expect(cn.firstChild).to.equal(l2);
				expect(cn.nextNode).to.equal(null);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(5);
			expect(PostActionSelection.start.range[1]).to.equal(l1.text.length);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(5);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				cn = cn.firstChild;
				expect(cn).to.equal(n2);
					let cl = cn.firstChild;
					expect(cl.text).to.equal('Leaf ');
				expect(cn.nextNode).to.equal(null);
			cn = cn.parent;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
				cl = cn.firstChild;
				expect(cl.type).to.equal(1);
				expect(cl.custom.src).to.equal('ll1');
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
				cl = cn.firstChild;
				expect(cl.type).to.equal(1);
				expect(cl.custom.src).to.equal('ll2');
				const sl = cl;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(n1.nodeType);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl.text).to.equal('2');
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

});

describe('removeAndAppend() with non-text Leaves', function() {

	describe('"Newline" in a non-text Leaf', function() {

		const l1 = new Leaf({ type: 1, custom: { src: 'll1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 5 });
		const n2 = new Node({ nodeType: 1 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(5)---<l1 - image>
			         |
			         (1)---(2)---<l2>
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
			chainNode(n2, n1);
			setParentLink(n3, n2);

			setParentLink(l1, n1);
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Newline', function(done) {
			const flag = _NEWLINE_;

			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l1, range: [0, 0] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			removeAndAppend(selections, flag);

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				let cl = cn.firstChild;
				expect(cl).to.equal(l1);
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
			expect(cn.new).to.be.true;
			cn.new = false;
				cl = cn.firstChild;
				expect(isZeroLeaf(cl)).to.equal(true);
				expect(cl.new).to.be.true;
				cl.new = false;
				const sl = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				let cl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l1);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				let cl = cn.firstChild;
				expect(cl).to.equal(l1);
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
				cl = cn.firstChild;
				expect(isZeroLeaf(cl)).to.equal(true);
				const sl = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

	describe('"Backspace" in a non-text Leaf', function() {

		const l1 = new Leaf({ type: 1, custom: { src: 'll1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 5 });
		const n2 = new Node({ nodeType: 1 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(5)---<l1 - image>
			         |
			         (1)---(2)---<l2>
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
			chainNode(n2, n1);
			setParentLink(n3, n2);

			setParentLink(l1, n1);
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Backspace', function(done) {
			const flag = _BACKSPACE_;

			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l1, range: [0, 0] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			removeAndAppend(selections, flag);

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
			expect(cn.new).to.be.true;
			cn.new = false;
				let cl = cn.firstChild;
				expect(isZeroLeaf(cl)).to.equal(true);
				expect(cl.new).to.be.true;
				cl.new = false;
				const sl = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				let cl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l1);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
				let cl = cn.firstChild;
				expect(isZeroLeaf(cl)).to.equal(true);
				const sl = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

	describe('"Delete" in a non-text Leaf', function() {

		const l1 = new Leaf({ type: 1, custom: { src: 'll1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 5 });
		const n2 = new Node({ nodeType: 1 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(5)---<l1 - image>
			         |
			         (1)---(2)---<l2>
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
			chainNode(n2, n1);
			setParentLink(n3, n2);

			setParentLink(l1, n1);
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Delete', function(done) {
			const flag = _DELETE_;

			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l1, range: [0, 0] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			removeAndAppend(selections, flag);

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
			expect(cn.new).to.be.true;
			cn.new = false;
				let cl = cn.firstChild;
				expect(isZeroLeaf(cl)).to.equal(true);
				expect(cl.new).to.be.true;
				cl.new = false;
				const sl = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				let cl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l1);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
				let cl = cn.firstChild;
				expect(isZeroLeaf(cl)).to.equal(true);
				const sl = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

	describe('"Backspace" in a text Leaf whose previous Leaf is non-text', function() {

		const l1 = new Leaf({ type: 1, custom: { src: 'll1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 5 });
		const n2 = new Node({ nodeType: 1 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(5)---<l1 - image>
			         |
			         (1)---(2)---<l2>
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
			chainNode(n2, n1);
			setParentLink(n3, n2);

			setParentLink(l1, n1);
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Backspace', function(done) {
			const flag = _BACKSPACE_;

			BeforeActionSelection.start = { leaf: l2, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l2, range: [0, 0] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			removeAndAppend(selections, flag);

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					let cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l2);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				let cl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l2);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					let cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l2);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

	describe('"Delete" in a text Leaf whose next Leaf is non-text', function() {

		const l1 = new Leaf({ type: 1, custom: { src: 'll1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n2 = new Node({ nodeType: 1 });
			const n3 = new Node({ nodeType: 2 });
		const n1 = new Node({ nodeType: 5 });

		/*
			(root)---(1)---(2)---<l2>
			         |
			         (5)---<l1 - image>
		*/
		before(function(done) {
			DocumentRoot.firstChild = null;
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			clearBlankSelection(BeforeActionSelection);
			clearBlankSelection(PostActionSelection);
			
			setParentLink(n2, null);
			setParentLink(n3, n2);
			chainNode(n1, n2);

			setParentLink(l1, n1);
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Delete', function(done) {
			const flag = _DELETE_;

			BeforeActionSelection.start = { leaf: l2, range: [l2.text.length, l2.text.length] };
			BeforeActionSelection.end = { leaf: l2, range: [l2.text.length, l2.text.length] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			removeAndAppend(selections, flag);

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					let cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l2);
			expect(PostActionSelection.start.range[0]).to.equal(l2.text.length);
			expect(PostActionSelection.start.range[1]).to.equal(l2.text.length);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(l2.text.length);
			expect(PostActionSelection.end.range[1]).to.equal(l2.text.length);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					let cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			cn = cn.nextNode;
			expect(cn).to.equal(n1);
				cl = cn.firstChild;
				expect(cl).to.equal(l1);
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l2);
			expect(PostActionSelection.start.range[0]).to.equal(l2.text.length);
			expect(PostActionSelection.start.range[1]).to.equal(l2.text.length);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(l2.text.length);
			expect(PostActionSelection.end.range[1]).to.equal(l2.text.length);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					let cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l2);
			expect(PostActionSelection.start.range[0]).to.equal(l2.text.length);
			expect(PostActionSelection.start.range[1]).to.equal(l2.text.length);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(l2.text.length);
			expect(PostActionSelection.end.range[1]).to.equal(l2.text.length);

			done();
		});

	});

	describe('"Newline" in a selection where startLeaf is non-text', function() {

		const l1 = new Leaf({ type: 1, custom: { src: 'll1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 5 });
		const n2 = new Node({ nodeType: 1 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(5)---<l1 - image>
			         |
			         (1)---(2)---<l2>
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
			chainNode(n2, n1);
			setParentLink(n3, n2);

			setParentLink(l1, n1);
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Newline in l1 and "Leaf " of l2', function(done) {
			const flag = _NEWLINE_;

			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l2, range: [0, 5] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			removeAndAppend(selections, flag);

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
			expect(cn.new).to.be.true;
			cn.new = false;
				let	cl = cn.firstChild;
				expect(isZeroLeaf(cl)).to.be.true;
				expect(cl.new).to.be.true;
				cn.new = false;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
			expect(cn.new).to.be.true;
			cn.new = false;
				cl = cn.firstChild;
				expect(cl.text).to.equal('2');
				expect(cl.new).to.be.true;
				cl.new = false;
				const sl = cl;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				let cl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(5);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
				let	cl = cn.firstChild;
				expect(isZeroLeaf(cl)).to.be.true;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(0);
				cl = cn.firstChild;
				expect(cl.text).to.equal('2');
				const sl = cl;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

	describe('"Delete" in a selection where startLeaf is non-text', function() {

		const l1 = new Leaf({ type: 1, custom: { src: 'll1' } });
		const l2 = new Leaf({ text: 'Leaf 2' });

		const n1 = new Node({ nodeType: 5 });
		const n2 = new Node({ nodeType: 1 });
			const n3 = new Node({ nodeType: 2 });

		/*
			(root)---(5)---<l1 - image>
			         |
			         (1)---(2)---<l2>
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
			chainNode(n2, n1);
			setParentLink(n3, n2);

			setParentLink(l1, n1);
			setParentLink(l2, n3);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			l1.new = false;
			l2.new = false;

			done();
		});

		it('Delete in l1 and "Leaf " of l2', function(done) {
			const flag = _DELETE_;

			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l2, range: [0, 5] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			removeAndAppend(selections, flag);

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
			expect(cn.new).to.be.true;
			cn.new = false;
				let	cl = cn.firstChild;
				expect(cl.text).to.equal('2');
				expect(cl.new).to.be.true;
				cl.new = false;
				const sl = cl;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = DocumentRoot.firstChild;
			expect(cn).to.equal(n1);
				let cl = cn.firstChild;
			cn = cn.nextNode;
			expect(cn).to.equal(n2);
				cn = cn.firstChild;
				expect(cn).to.equal(n3);
					cl = cn.firstChild;
					expect(cl).to.equal(l2);
			cn = cn.parent;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(5);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = DocumentRoot.firstChild;
			expect(cn.nodeType).to.equal(0);
				let	cl = cn.firstChild;
				expect(cl.text).to.equal('2');
				const sl = cl;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

	});

});
