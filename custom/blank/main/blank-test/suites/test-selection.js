/* eslint-disable */
import { Node, NodeStyles, NullNode, NodeChain, NodeType, BranchType, PhantomNode, PhantomChain, DocumentRoot } from '../../node';
import { Leaf, isZeroLeaf, LeafStyles, CaretStyle, applyCaretStyle, NullLeaf, LeafChain, LeafText, ParentLink, Clipboard } from '../../leaf';
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
	applyBranchText,
	applyBranchType,
	applyNodeStyle,
	applyNodesStyle,
	applyLeavesStyle
} from '../../integration';
import { expect } from 'chai';

/*
	copyBranchText
	applyBranchType
	applyNodesStyle
	applyLeafText
	appendAndGrow
	shatterAndInsert
	removeAndAppend
	applyLeavesStyle
	autoMergeLeaves
	undo
	redo
*/

describe('PAS - Post-Action Selection', function() {

	describe('copyBranchText - PAS: Do nothing', function() {

		const l1 = new Leaf({ text: 'Hello ' });
		const l2 = new Leaf({
			text: 'darkness, my ',
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

		const l9 = new Leaf(); // l9 is zeroLeaf

		const l10 = new Leaf({ text: 'Leaf 10' });

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

		const l18 = new Leaf(); // l18 is zeroLeaf

		const n1 = new Node({ nodeType: 4 });
		const n2 = new Node({ nodeType: 1 });
			const n3 = new Node({ nodeType: 2 });
			const n4 = new Node({ nodeType: 3 });
			const n5 = new Node({ nodeType: 2 });
		const n6 = new Node({ nodeType: 1 });
			const n7 = new Node({ nodeType: 2 });
				const n8 = new Node({ nodeType: 3 });
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
			         |     |
			         |     (2)---<l9>
			         |
			         (1)---(2)---(3)---<l10>
			         |           |
			         |           (3)---<l11>
			         |
			         (4)---<l12-l13>
			         |
			         (1)---(2)---<l14-l15-l16-l17>
			               |
			               (2)---<l18>
		*/
		before(function(done) {
			DocumentRoot.firstChild = null;
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			
			setParentLink(n1, null);
			chainNode(n2, n1);
			chainNode(n6, n2);
			chainNode(n10, n6);
			chainNode(n11, n10);

			setParentLink(n3, n2);
			chainNode(n4, n3);
			chainNode(n5, n4);

			setParentLink(n7, n6);
			setParentLink(n8, n7);
			chainNode(n9, n8);

			setParentLink(n12, n11);
			chainNode(n13, n12);

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

		beforeEach(function(done) {
			clearBlankSelection(BeforeActionSelection);
			clearBlankSelection(PostActionSelection);
			done();
		});

		it('Copy a Leaf from a tree (Clipboard)', function(done) {
			BeforeActionSelection.start = {
				leaf: l4,
				range: [0, 4]
			};
			BeforeActionSelection.end = {
				leaf: l4,
				range: [0, 4]
			};

			// Copy l4 at [0, 4]
			const selections = toSelections(BeforeActionSelection);

			copyBranchText(selections);

			const { firstChild, startLeaf, endLeaf, startNode, endNode } = Clipboard;

			let result = firstChild !== null;
			expect(result).to.be.true;
			expect(firstChild).to.equal(startLeaf);
			expect(startLeaf).to.equal(endLeaf);
			expect(startNode).to.equal(null);
			expect(endNode).to.equal(null);

			let cl = startLeaf;
			expect(cl.text).to.equal('This');
			expect(cl.styles.italic).to.be.true;
			expect(cl.nextLeaf).to.equal(null);
			expect(cl.prevLeaf).to.equal(null);
			expect(cl.parent).to.equal(null);

			// PAS
			expect(PostActionSelection.start).to.equal(null);
			expect(PostActionSelection.end).to.equal(null);

			done();
		});

		it('Copy a LeafChain from a tree (Clipboard)', function(done) {
			BeforeActionSelection.start = {
				leaf: l14,
				range: [0, l14.text.length]
			};
			BeforeActionSelection.end = {
				leaf: l17,
				range: [0, l17.text.length]
			};
			// Copy l14 to l17
			const selections = toSelections(BeforeActionSelection);

			copyBranchText(selections);

			const { firstChild, startLeaf, endLeaf, startNode, endNode } = Clipboard;

			let result = firstChild !== null;
			expect(result).to.be.true;
			expect(firstChild).to.equal(startLeaf);
			expect(startNode).to.equal(null);
			expect(endNode).to.equal(null);

			let cl = startLeaf;
			expect(cl.text).to.equal('1 ');
			expect(cl.styles.bold).to.be.true;
			expect(cl.prevLeaf).to.equal(null);
			expect(cl.parent).to.equal(null);
			cl = cl.nextLeaf;
			expect(cl.text).to.equal('2 ');
			expect(cl.parent).to.equal(null);
			cl = cl.nextLeaf;
			expect(cl.text).to.equal('3 ');
			expect(cl.styles.bold).to.be.true;
			expect(cl.parent).to.equal(null);
			cl = cl.nextLeaf;
			expect(cl).to.equal(endLeaf);
			expect(cl.text).to.equal('4');
			expect(cl.nextLeaf).to.equal(null);
			expect(cl.parent).to.equal(null);

			// PAS
			expect(PostActionSelection.start).to.equal(null);
			expect(PostActionSelection.end).to.equal(null);

			done();
		});

		it('Copy a part of the tree (Clipboard)', function(done) {
			BeforeActionSelection.start = {
				leaf: l1,
				range: [0, l1.text.length]
			};
			BeforeActionSelection.end = {
				leaf: l4,
				range: [0, 0]
			};
			// Copy l1 to l4 at [0, l1.text.length] to [0, 0]
			const selections = toSelections(BeforeActionSelection);
			
			copyBranchText(selections);

			const { firstChild, startLeaf, endLeaf, startNode, endNode } = Clipboard;

			let result = firstChild !== null;
			expect(result).to.be.true;
			result = instanceOf(firstChild, 'Node');
			expect(result).to.be.true;
			expect(firstChild).to.equal(startNode);

			let cn = startNode;
			expect(cn.nodeType).to.equal(4);
			expect(cn.prevNode).to.equal(null);
			expect(cn.parent).to.equal(null);
				let cl = cn.firstChild;
				result = instanceOf(cl, 'Leaf');
				expect(result).to.be.true;
				expect(cl.text).to.equal('Hello ');
				expect(cl.prevLeaf).to.equal(null);
				expect(cl.parent).to.equal(cn);
				expect(cl).to.equal(startLeaf);
				cl = cl.nextLeaf;
				expect(cl.text).to.equal('darkness, my ');
				expect(cl.styles.bold).to.be.true;
				expect(cl.parent).to.equal(cn);
				cl = cl.nextLeaf;
				expect(cl.text).to.equal('old friend.');
				expect(cl.nextLeaf).to.equal(null);
				expect(cl.parent).to.equal(cn);
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(1);
			expect(cn.nextNode).to.equal(null);
			expect(cn.parent).to.equal(null);
			expect(cn).to.equal(endNode);
				cn = cn.firstChild;
				result = instanceOf(cn, 'Node');
				expect(result).to.be.true;
				expect(cn.nodeType).to.equal(2);
				expect(cn.prevNode).to.equal(null);
				expect(cn.nextNode).to.equal(null);
					cl = cn.firstChild;
					result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					result = isZeroLeaf(cl);
					expect(result).to.be.true;
					expect(cl.prevLeaf).to.equal(null);
					expect(cl.nextLeaf).to.equal(null);
					expect(cl.parent).to.equal(cn);
					expect(cl).to.equal(endLeaf);

			// PAS
			expect(PostActionSelection.start).to.equal(null);
			expect(PostActionSelection.end).to.equal(null);

			done();
		});

	});

	describe('applyBranchType - PAS: Same as selections', function() {

		describe('Apply [1, 2] type to middle part of the tree (no shatter)', function() {

			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({ text: 'l2' });
			const l3 = new Leaf({ text: 'l3' });
			const l4 = new Leaf({ text: 'l4' });
			const l5 = new Leaf({ text: 'l5' });
			const l6 = new Leaf({ text: 'l6' });
			const l7 = new Leaf({ text: 'l7' });
			const l8 = new Leaf({ text: 'l8' });
			const l9 = new Leaf({ text: 'l9' });

			const n1 = new Node({ nodeType: 4 });
			const n2 = new Node({ nodeType: 1 });
				const n3 = new Node({ nodeType: 2 });
				const n4 = new Node({ nodeType: 3 });
				const n5 = new Node({ nodeType: 2 });
			const n6 = new Node({ nodeType: 1 });
				const n7 = new Node({ nodeType: 2 });
					const n8 = new Node({ nodeType: 3 });
					const n9 = new Node({ nodeType: 3 });
			const n10 = new Node({ nodeType: 4 });
			const n11 = new Node({ nodeType: 1 });
				const n12 = new Node({ nodeType: 2 });
				const n13 = new Node({ nodeType: 2 });

			/*
				(root)---(4)---<l1>
				         |
				         (1)---(2)---<l2>
				         |     |
				         |     (3)---<l3>
				         |     |
				         |     (2)---<l4>
				         |
				         (1)---(2)---(3)---<l5>
				         |           |
				         |           (3)---<l6>
				         |
				         (4)---<l7>
				         |
				         (1)---(2)---<l8>
				               |
				               (2)---<l9>
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
				chainNode(n6, n2);
				chainNode(n10, n6);
				chainNode(n11, n10);

				setParentLink(n3, n2);
				chainNode(n4, n3);
				chainNode(n5, n4);

				setParentLink(n7, n6);
				setParentLink(n8, n7);
				chainNode(n9, n8);

				setParentLink(n12, n11);
				chainNode(n13, n12);

				setParentLink(l1, n1);
				setParentLink(l2, n3);
				setParentLink(l3, n4);
				setParentLink(l4, n5);
				setParentLink(l5, n8);
				setParentLink(l6, n9);
				setParentLink(l7, n10);
				setParentLink(l8, n12);
				setParentLink(l9, n13);

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

				done();
			});

			/*
				(root)---(4)---<l1>
				         |
				         (1)---(2)---<l2>
				         |     |
				         |     (2)---<l3>
				         |     |
				         |     (2)---<l4>
				         |     |
				         |     (2)---<l5>
				         |     |
				         |     (2)---<l6>
				         |     |
				         |     (2)---<l7>
				         |     |
				         |     (2)---<l8>
				         |
				         (1)---(2)---<l9>
			*/
			it('Apply [1, 2] to selections [l3, l8]', function(done) {
				BeforeActionSelection.start = { leaf: l3, range: [0, 0] };
				BeforeActionSelection.end = { leaf: l8, range: [0, 0] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);
				const newBT = [1, 2];
				applyBranchType(selections, newBT);

				// n1
				expect(n1.nextNode).to.equal(n2);
				// n2
				expect(n2.prevNode).to.equal(n1);
				expect(n2.nextNode).to.equal(n11);
					// n3
					expect(n2.firstChild).to.equal(n3);
					expect(n3.parent).to.equal(n2);
					// middle
					const middle = n3.nextNode;
					let result = middle === n4;
					expect(result).to.be.false; // n4 is the entry point, replaced by middle
					expect(middle.new).to.be.true;
					middle.new = false;
					expect(middle.prevNode).to.equal(n3);
					expect(middle.nodeType).to.equal(2);
					expect(middle.firstChild).to.equal(l3);
					expect(middle.parent).to.equal(n2);
					expect(middle.nextNode).to.equal(n5);
					// n5
					expect(n5.prevNode).to.equal(middle);
					expect(n5.nextNode).to.equal(n8); // n8 is switched onto n5
					// n8
					expect(n8.prevNode).to.equal(n5);
					expect(n8.nodeType).to.equal(2);
					expect(n8.parent).to.equal(n2);
					expect(n8.nextNode).to.equal(n9);
					// n9
					expect(n9.prevNode).to.equal(n8);
					expect(n9.nodeType).to.equal(2);
					expect(n9.parent).to.equal(n2);
					expect(n9.nextNode).to.equal(n10); // n10 is switched onto n9
					// n10
					expect(n10.prevNode).to.equal(n9);
					expect(n10.nodeType).to.equal(2);
					expect(n10.parent).to.equal(n2);
					expect(n10.nextNode).to.equal(n12); // n12 is switched onto n10
					// n12
					expect(n12.prevNode).to.equal(n10);
					expect(n12.parent).to.equal(n2);
					expect(n12.nextNode).to.equal(null);
				// n11
				expect(n11.prevNode).to.equal(n2);
				expect(n11.nextNode).to.equal(null);
					// n13
					expect(n11.firstChild).to.equal(n13);
					expect(n13.parent).to.equal(n11);
					expect(n13.prevNode).to.equal(null);
					expect(n13.nextNode).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l3);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l8);
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

				// n1
				expect(n1.nextNode).to.equal(n2);
				// n2
				expect(n2.prevNode).to.equal(n1);
				expect(n2.nextNode).to.equal(n6);
					// n3
					expect(n2.firstChild).to.equal(n3);
					expect(n3.nextNode).to.equal(n4);
					// n4
					expect(n4.prevNode).to.equal(n3);
					expect(n4.nodeType).to.equal(3);
					expect(n4.firstChild).to.equal(l3);
					expect(n4.nextNode).to.equal(n5);
					// n5
					expect(n5.prevNode).to.equal(n4);
					expect(n5.nextNode).to.equal(null);
				// n6
				expect(n6.prevNode).to.equal(n2);
				expect(n6.nextNode).to.equal(n10);
					// n7
					expect(n6.firstChild).to.equal(n7);
					expect(n7.parent).to.equal(n6);
						// n8
						expect(n7.firstChild).to.equal(n8);
						expect(n8.parent).to.equal(n7);
						expect(n8.nodeType).to.equal(3);
						expect(n8.prevNode).to.equal(null);
						expect(n8.nextNode).to.equal(n9);
						// n9
						expect(n9.prevNode).to.equal(n8);
						expect(n9.nodeType).to.equal(3);
						expect(n9.nextNode).to.equal(null);
				// n10
				expect(n10.prevNode).to.equal(n6);
				expect(n10.nodeType).to.equal(4);
				expect(n10.nextNode).to.equal(n11);
				// n11
				expect(n11.prevNode).to.equal(n10);
				expect(n11.nextNode).to.equal(null);
					// n12
					expect(n11.firstChild).to.equal(n12);
					expect(n12.parent).to.equal(n11);
					expect(n12.prevNode).to.equal(null);
					expect(n12.nextNode).to.equal(n13);
					// n13
					expect(n13.prevNode).to.equal(n12);
					expect(n13.nextNode).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l3);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l8);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(0);

				done();
			});

			it('Redo', function(done) {
				// Undo
				readyTempHistorySteps();
				redo();

				// n1
				expect(n1.nextNode).to.equal(n2);
				expect(n2.prevNode).to.equal(n1);
				expect(n2.nextNode).to.equal(n11);
					// n2
					expect(n2.firstChild).to.equal(n3);
					expect(n3.parent).to.equal(n2);
					// middle
					const middle = n3.nextNode;
					let result = middle === n4;
					expect(result).to.be.false; // n4 is the entry point, replaced by middle
					expect(middle.prevNode).to.equal(n3);
					expect(middle.nodeType).to.equal(2);
					expect(middle.parent).to.equal(n2);
					expect(middle.nextNode).to.equal(n5);
					// n5
					expect(n5.prevNode).to.equal(middle);
					expect(n5.nextNode).to.equal(n8); // n8 is switched onto n5
					// n8
					expect(n8.prevNode).to.equal(n5);
					expect(n8.nodeType).to.equal(2);
					expect(n8.parent).to.equal(n2);
					expect(n8.nextNode).to.equal(n9);
					// n9
					expect(n9.prevNode).to.equal(n8);
					expect(n9.nodeType).to.equal(2);
					expect(n9.parent).to.equal(n2);
					expect(n9.nextNode).to.equal(n10); // n10 is switched onto n9
					// n10
					expect(n10.prevNode).to.equal(n9);
					expect(n10.nodeType).to.equal(2);
					expect(n10.parent).to.equal(n2);
					expect(n10.nextNode).to.equal(n12); // n12 is switched onto n10
					// n12
					expect(n12.prevNode).to.equal(n10);
					expect(n12.parent).to.equal(n2);
					expect(n12.nextNode).to.equal(null);
				// n11
				expect(n11.prevNode).to.equal(n2);
				expect(n11.nextNode).to.equal(null);
					// n13
					expect(n11.firstChild).to.equal(n13);
					expect(n13.parent).to.equal(n11);
					expect(n13.prevNode).to.equal(null);
					expect(n13.nextNode).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l3);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l8);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(0);

				done();
			});

		});

		describe('Apply [1, 2] type to a part of the tree, including last LC (shatter)', function() {

			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({ text: 'l2' });
			const l3 = new Leaf({ text: 'l3' });
			const l4 = new Leaf({ text: 'l4' });
			const l5 = new Leaf({ text: 'l5' });
			const l6 = new Leaf({ text: 'l6' });
			const l7 = new Leaf({ text: 'l7' });

			const n1 = new Node({ nodeType: 1 });
				const n2 = new Node({ nodeType: 2 });
				const n3 = new Node({ nodeType: 2 });
					const n4 = new Node({ nodeType: 4 });
					const n5 = new Node({ nodeType: 3 });
					const n6 = new Node({ nodeType: 4 });
				const n7 = new Node({ nodeType: 2 });
					const n8 = new Node({ nodeType: 3 });
					const n9 = new Node({ nodeType: 3 });
			const n10 = new Node({ nodeType: 4 });

			/*
				(root)---(1)---(2)---<l1>
				         |     |
				         |     (2)---(4)---<l2>
				         |     |     |
				         |     |     (3)---<l3>
				         |     |     |
				         |     |     (4)---<l4>
				         |     |
				         |     (2)---(3)---<l5>
				         |           |
				         |           (3)---<l6>
				         |
				         (4)---<l7>
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
				chainNode(n10, n1);

				setParentLink(n2, n1);
				chainNode(n3, n2);
				chainNode(n7, n3);

				setParentLink(n4, n3);
				chainNode(n5, n4);
				chainNode(n6, n5);

				setParentLink(n8, n7);
				chainNode(n9, n8);

				setParentLink(l1, n2);
				setParentLink(l2, n4);
				setParentLink(l3, n5);
				setParentLink(l4, n6);
				setParentLink(l5, n8);
				setParentLink(l6, n9);
				setParentLink(l7, n10);

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

				l1.new = false;
				l2.new = false;
				l3.new = false;
				l4.new = false;
				l5.new = false;
				l6.new = false;
				l7.new = false;

				done();
			});

			/*
				(root)---(1)---(2)---<l1>
				               |
				               (2)---(4)---<l2>
				               |
				               (2)---<l3>
				               |
				               (2)---<l4>
				               |
				               (2)---<l5>
				               |
				               (2)---<l6>
				               |
				               (2)---<l7>
			*/
			it('Apply [1, 2] to selections [l3, l7]', function(done) {
				BeforeActionSelection.start = { leaf: l3, range: [0, 0] };
				BeforeActionSelection.end = { leaf: l7, range: [0, 0] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);
				const newBT = [1, 2];
				applyBranchType(selections, newBT);

				// n1
				expect(n1.nextNode).to.equal(null);
					// n2
					expect(n1.firstChild).to.equal(n2);
					expect(n2.parent).to.equal(n1);
					expect(n2.prevNode).to.equal(null);
					expect(n2.nextNode).to.equal(n3);
					// n3
					expect(n3.prevNode).to.equal(n2);
					const middle = n3.nextNode;
						// n4
						expect(n3.firstChild).to.equal(n4);
						expect(n4.parent).to.equal(n3);
						expect(n4.nextNode).to.equal(null);
					// middle
					expect(middle.prevNode).to.equal(n3);
					expect(middle.new).to.be.true;
					expect(middle.parent).to.equal(n1);
					expect(middle.nodeType).to.equal(2);
					expect(middle.nextNode).to.equal(n6);
					middle.new = false;
					// n6
					expect(n6.prevNode).to.equal(middle);
					expect(n6.parent).to.equal(n1);
					expect(n6.nodeType).to.equal(2);
					expect(n6.nextNode).to.equal(n8);
					// n8
					expect(n8.prevNode).to.equal(n6);
					expect(n8.parent).to.equal(n1);
					expect(n8.nodeType).to.equal(2);
					expect(n8.nextNode).to.equal(n9);
					// n9
					expect(n9.prevNode).to.equal(n8);
					expect(n9.parent).to.equal(n1);
					expect(n9.nodeType).to.equal(2);
					expect(n9.nextNode).to.equal(n10);
					// n10
					expect(n10.prevNode).to.equal(n9);
					expect(n10.parent).to.equal(n1);
					expect(n10.nodeType).to.equal(2);
					expect(n10.nextNode).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l3);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l7);
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

				// n1
				expect(n1.prevNode).to.equal(null);
				expect(n1.nextNode).to.equal(n10);
					// n2
					expect(n1.firstChild).to.equal(n2);
					expect(n2.parent).to.equal(n1);
					expect(n2.prevNode).to.equal(null);
					expect(n2.nextNode).to.equal(n3);
					// n3
					expect(n3.prevNode).to.equal(n2);
					expect(n3.nextNode).to.equal(n7);
						// n4
						expect(n3.firstChild).to.equal(n4);
						expect(n4.parent).to.equal(n3);
						expect(n4.nextNode).to.equal(n5);
						// n5
						expect(n5.prevNode).to.equal(n4);
						expect(n5.parent).to.equal(n3);
						expect(n5.nodeType).to.equal(3);
						expect(n5.nextNode).to.equal(n6);
						// n6
						expect(n6.prevNode).to.equal(n5);
						expect(n6.parent).to.equal(n3);
						expect(n6.nodeType).to.equal(4);
						expect(n6.nextNode).to.equal(null);
					// n7
					expect(n7.prevNode).to.equal(n3);
					expect(n7.nextNode).to.equal(null);
						// n8
						expect(n7.firstChild).to.equal(n8);
						expect(n8.parent).to.equal(n7);
						expect(n8.nodeType).to.equal(3);
						expect(n8.prevNode).to.equal(null);
						expect(n8.nextNode).to.equal(n9);
						// n9
						expect(n9.prevNode).to.equal(n8);
						expect(n9.parent).to.equal(n7);
						expect(n9.nodeType).to.equal(3);
						expect(n9.nextNode).to.equal(null);
				// n10
				expect(n10.prevNode).to.equal(n1);
				expect(n10.parent).to.equal(null);
				expect(n10.nodeType).to.equal(4);
				expect(n10.nextNode).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l3);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l7);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(0);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				// n1
				expect(n1.nextNode).to.equal(null);
					// n2
					expect(n1.firstChild).to.equal(n2);
					expect(n2.parent).to.equal(n1);
					expect(n2.prevNode).to.equal(null);
					expect(n2.nextNode).to.equal(n3);
					// n3
					expect(n3.prevNode).to.equal(n2);
					const middle = n3.nextNode;
						// n4
						expect(n3.firstChild).to.equal(n4);
						expect(n4.parent).to.equal(n3);
						expect(n4.nextNode).to.equal(null);
					// middle
					expect(middle.prevNode).to.equal(n3);
					expect(middle.new).to.be.false;
					expect(middle.parent).to.equal(n1);
					expect(middle.nodeType).to.equal(2);
					expect(middle.nextNode).to.equal(n6);
					// n6
					expect(n6.prevNode).to.equal(middle);
					expect(n6.parent).to.equal(n1);
					expect(n6.nodeType).to.equal(2);
					expect(n6.nextNode).to.equal(n8);
					// n8
					expect(n8.prevNode).to.equal(n6);
					expect(n8.parent).to.equal(n1);
					expect(n8.nodeType).to.equal(2);
					expect(n8.nextNode).to.equal(n9);
					// n9
					expect(n9.prevNode).to.equal(n8);
					expect(n9.parent).to.equal(n1);
					expect(n9.nodeType).to.equal(2);
					expect(n9.nextNode).to.equal(n10);
					// n10
					expect(n10.prevNode).to.equal(n9);
					expect(n10.parent).to.equal(n1);
					expect(n10.nodeType).to.equal(2);
					expect(n10.nextNode).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l3);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l7);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(0);

				done();
			});
		});

		describe('Apply [0] type to the entire tree, whose branch has only 1 level', function() {

			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({ text: 'l2' });
			const l3 = new Leaf({ text: 'l3' });
			const l4 = new Leaf({ text: 'l4' });
			const l5 = new Leaf({ text: 'l5' });
			const l6 = new Leaf({ text: 'l6' });
			const l7 = new Leaf({ text: 'l7' });
			const l8 = new Leaf({ text: 'l8' });

			const n1 = new Node({ nodeType: 0 });
			const n2 = new Node({ nodeType: 0 });
			const n3 = new Node({ nodeType: 0 });
			const n4 = new Node({ nodeType: 1 });
			const n5 = new Node({ nodeType: 0 });
			const n6 = new Node({ nodeType: 0 });
			const n7 = new Node({ nodeType: 0 });
			const n8 = new Node({ nodeType: 0 });

			/*
				(root)---(0)---<l1>
				         |
				         (0)---<l2>
				         |
				         (0)---<l3>
				         |
				         (1)---<l4>
				         |
				         (0)---<l5>
				         |
				         (0)---<l6>
				         |
				         (0)---<l7>
				         |
				         (0)---<l8>
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
				chainNode(n3, n2);
				chainNode(n4, n3);
				chainNode(n5, n4);
				chainNode(n6, n5);
				chainNode(n7, n6);
				chainNode(n8, n7);

				setParentLink(l1, n1);
				setParentLink(l2, n2);
				setParentLink(l3, n3);
				setParentLink(l4, n4);
				setParentLink(l5, n5);
				setParentLink(l6, n6);
				setParentLink(l7, n7);
				setParentLink(l8, n8);

				n1.new = false;
				n2.new = false;
				n3.new = false;
				n4.new = false;
				n5.new = false;
				n6.new = false;
				n7.new = false;
				n8.new = false;

				l1.new = false;
				l2.new = false;
				l3.new = false;
				l4.new = false;
				l5.new = false;
				l6.new = false;
				l7.new = false;
				l8.new = false;

				done();
			});

			it('Apply [0] to selections [l1, l8]', function(done) {
				BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
				BeforeActionSelection.end = { leaf: l8, range: [0, 0] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);
				const newBT = [0];
				applyBranchType(selections, newBT);

				const middle = n3.nextNode;
				expect(middle.new).to.be.true;
				expect(middle.prevNode).to.equal(n3);
				expect(middle.nodeType).to.equal(0);
				expect(middle.nextNode).to.equal(n5);
				middle.new = false;

				console.log('TempHistoryPastStep.length: ' + TempHistoryPastStep.stack.length);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l8);
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

				expect(n3.nextNode).to.equal(n4);
				expect(n4.prevNode).to.equal(n3);
				expect(n4.nextNode).to.equal(n5);
				expect(n5.prevNode).to.equal(n4);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l8);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(0);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				const middle = n3.nextNode;
				expect(middle.new).to.be.false;
				expect(middle.prevNode).to.equal(n3);
				expect(middle.nodeType).to.equal(0);
				expect(middle.nextNode).to.equal(n5);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l8);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(0);

				done();
			});

		});

	});

	describe('applyNodesStyle - PAS: Same as selections', function() {

		const l1 = new Leaf({ text: 'l1' });
		const l2 = new Leaf({ text: 'l2' });
		const l3 = new Leaf({ text: 'l3' });
		const l4 = new Leaf({ text: 'l4' });

		const n1 = new Node({
			nodeType: 0,
			styles: new NodeStyles()
		});
		const n2 = new Node({ nodeType: 0 });
		const n3 = new Node({
			nodeType: 1,
			styles: new NodeStyles({
				fontFamily: 2,
				textAlignment: 2
			})
		});
		const n4 = new Node({
			nodeType: 1,
			styles: new NodeStyles()
		});
		const n5 = new Node({
			nodeType: 5,
			styles: new NodeStyles()
		});

		/*
			(root)---(0)---<l1>
			         |
			         (0)---(1)---<l2>
			         |     |
			         |     (1)---<l3>
			         |
			         (5)---<l4>
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
			chainNode(n5, n2);

			setParentLink(n3, n2);
			chainNode(n4, n3);

			setParentLink(l1, n1);
			setParentLink(l2, n3);
			setParentLink(l3, n4);
			setParentLink(l4, n5);

			n1.new = false;
			n2.new = false;
			n3.new = false;
			n4.new = false;
			n5.new = false;

			l1.new = false;
			l2.new = false;
			l3.new = false;
			l4.new = false;

			done();
		});

		it('Apply { fontFamily: 2 } to selections [l1, l4]', function(done) {
			BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l4, range: [0, 0] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const newStyles = { fontFamily: 2 };
			const selections = toSelections(BeforeActionSelection);
			applyNodesStyle(selections, newStyles);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(3);
			let step1 = pastStep[0];
			let step2 = pastStep[1];
			let step3 = pastStep[2];
			let result = 
				step1 instanceof NodeStyles &&
				step2 instanceof NodeStyles &&
				step3 instanceof NodeStyles;
			expect(result).to.be.true;
			expect(step1.ref).to.equal(n1);
			expect(step2.ref).to.equal(n4);
			expect(step3.ref).to.equal(n5);
			expect(n1.styles.fontFamily).to.equal(2);
			expect(n4.styles.fontFamily).to.equal(2);
			expect(n5.styles.fontFamily).to.equal(2);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l4);
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

			let futureStep = TempHistoryFutureStep.stack;
			expect(futureStep.length).to.equal(3);
			let step1 = futureStep[0];
			let step2 = futureStep[1];
			let step3 = futureStep[2];
			let result = 
				step1 instanceof NodeStyles &&
				step2 instanceof NodeStyles &&
				step3 instanceof NodeStyles;
			expect(result).to.be.true;
			expect(step1.ref).to.equal(n5);
			expect(step2.ref).to.equal(n4);
			expect(step3.ref).to.equal(n1);
			expect(step1.fontFamily).to.equal(2);
			expect(step2.fontFamily).to.equal(2);
			expect(step3.fontFamily).to.equal(2);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l4);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(3);
			let step1 = pastStep[0];
			let step2 = pastStep[1];
			let step3 = pastStep[2];
			let result = 
				step1 instanceof NodeStyles &&
				step2 instanceof NodeStyles &&
				step3 instanceof NodeStyles;
			expect(result).to.be.true;
			expect(step1.ref).to.equal(n1);
			expect(step2.ref).to.equal(n4);
			expect(step3.ref).to.equal(n5);
			expect(n1.styles.fontFamily).to.equal(2);
			expect(n4.styles.fontFamily).to.equal(2);
			expect(n5.styles.fontFamily).to.equal(2);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l4);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(0);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

	});

	describe('applyLeafText', function() {
		
		describe('Remove the entire Leaf (single child) - PAS: In new zeroLeaf', function() {

			const l1 = new Leaf({
				text: 'l1',
				styles: new LeafStyles({
					bold: true
				})
			});

			const n1 = new Node();
			/*
				(root)---(n1)---<l1>
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

				n1.new = false;

				l1.new = false;

				done();
			});
			
			it('Remove', function(done) {
				BeforeActionSelection.start = { leaf: l1, range: [0, l1.text.length] };
				BeforeActionSelection.end = { leaf: l1, range: [0, l1.text.length] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);

				applyLeafText(l1, selections[0].range, '');

				const zl = n1.firstChild;
				let result = isZeroLeaf(zl);
				expect(result).to.be.true;
				expect(zl.new).to.be.true;
				expect(zl.styles.bold).to.be.true;

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.child).to.equal(l1);
				expect(step.parent).to.equal(n1);

				autoMergeDirtyLeaves();
				expect(pastStep.length).to.equal(1);
				zl.new = false;

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(zl);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(zl);
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

				expect(n1.firstChild).to.equal(l1);
				expect(l1.parent).to.equal(n1);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				let step = futureStep[0];
				let result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.parent).to.equal(n1);

				const zl = step.child;
				result = isZeroLeaf(zl);
				expect(result).to.be.true;
				expect(zl.styles.bold).to.be.true;

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(l1.text.length);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(l1.text.length);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				const zl = n1.firstChild;
				let result = isZeroLeaf(zl);
				expect(result).to.be.true;
				expect(zl.styles.bold).to.be.true;

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.child).to.equal(l1);
				expect(step.parent).to.equal(n1);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(zl);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(zl);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(0);

				done();
			});

		});

		describe('Remove the entire Leaf (between two Leaves of same styles) - PAS: In new Leaf', function() {

			const l1 = new Leaf({ text: 'This is a ' });
			const l2 = new Leaf({
				text: 'bold ',
				styles: new LeafStyles({
					bold: true
				})
			});
			const l3 = new Leaf({ text: 'Leaf.' });

			const n1 = new Node();
			/*
				(root)---(n1)---<l1-l2-l3>
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

				n1.new = false;

				l1.new = false;
				l2.new = false;
				l3.new = false;

				done();
			});

			it('Remove', function(done) {
				BeforeActionSelection.start = { leaf: l2, range: [0, l2.text.length] };
				BeforeActionSelection.end = { leaf: l2, range: [0, l2.text.length] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);

				applyLeafText(l2, selections[0].range, '');
				autoMergeDirtyLeaves();

				let result;

				const l = n1.firstChild;
				expect(l.new).to.be.true;
				l.new = false;
				expect(l.text).to.equal('This is a Leaf.');
				expect(l.styles.bold).to.be.false;
				expect(l.prevLeaf).to.equal(null);
				expect(l.nextLeaf).to.equal(null);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(3);
				let step1 = pastStep[0];
				let step2 = pastStep[1];
				let step3 = pastStep[2];
				result = step1 instanceof LeafChain;
				expect(result).to.be.true;
				expect(step1.startLeaf).to.equal(l2);
				expect(step1.endLeaf).to.equal(l2);
				expect(step1.prevLeaf).to.equal(l1);
				expect(step1.nextLeaf).to.equal(l3);

				result = step2 instanceof Leaf;
				expect(result).to.be.true;
				expect(step2).to.equal(l1);

				result = step3 instanceof Leaf;
				expect(result).to.be.true;
				expect(step3).to.equal(l3);

				l.new = false;

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l);
				expect(PostActionSelection.start.range[0]).to.equal(10);
				expect(PostActionSelection.start.range[1]).to.equal(10);
				expect(PostActionSelection.end.leaf).to.equal(l);
				expect(PostActionSelection.end.range[0]).to.equal(10);
				expect(PostActionSelection.end.range[1]).to.equal(10);

				// Save PAS
				copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

				done();
			});

			it('Undo', function(done) {
				// Undo
				readyTempHistorySteps();
				undo();

				let result;

				expect(n1.firstChild).to.equal(l1);
				expect(l1.parent).to.equal(n1);
				expect(l1.prevLeaf).to.equal(null);
				expect(l1.nextLeaf).to.equal(l2);
				expect(l2.prevLeaf).to.equal(l1);
				expect(l2.styles.bold).to.be.true;
				expect(l2.nextLeaf).to.equal(l3);
				expect(l3.prevLeaf).to.equal(l2);
				expect(l3.nextLeaf).to.equal(null);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(3);
				let step1 = futureStep[0];
				let step2 = futureStep[1];
				let step3 = futureStep[2];
				result = step1 instanceof NullLeaf;
				expect(result).to.be.true;
				result = step2 instanceof NullLeaf;
				expect(result).to.be.true;
				result = step3 instanceof LeafChain;
				expect(result).to.be.true;

				const l = step3.startLeaf;
				expect(l).to.equal(step3.endLeaf);
				expect(step3.prevLeaf).to.equal(l1);
				expect(step3.nextLeaf).to.equal(l3);
				
				expect(step1.prevLeaf).to.equal(l);
				expect(step1.nextLeaf).to.equal(null);
				expect(step2.prevLeaf).to.equal(null);
				expect(step2.nextLeaf).to.equal(l);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l2);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(l2.text.length);
				expect(PostActionSelection.end.leaf).to.equal(l2);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(l2.text.length);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				let result;

				const l = n1.firstChild;
				expect(l.text).to.equal('This is a Leaf.');
				expect(l.styles.bold).to.be.false;

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(3);
				let step1 = pastStep[0];
				let step2 = pastStep[1];
				let step3 = pastStep[2];
				result = step1 instanceof LeafChain;
				expect(result).to.be.true;
				expect(step1.startLeaf).to.equal(l2);
				expect(step1.endLeaf).to.equal(l2);
				expect(step1.prevLeaf).to.equal(l1);
				expect(step1.nextLeaf).to.equal(l3);

				result = step2 instanceof LeafChain;
				expect(result).to.be.true;
				expect(step2.startLeaf).to.equal(l1);
				expect(step2.endLeaf).to.equal(l1);
				expect(step2.prevLeaf).to.equal(null);
				expect(step2.nextLeaf).to.equal(l);

				result = step3 instanceof Leaf;
				expect(result).to.be.true;
				expect(step3).to.equal(l3);
				expect(step3.prevLeaf).to.equal(l);
				expect(step3.nextLeaf).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l);
				expect(PostActionSelection.start.range[0]).to.equal(10);
				expect(PostActionSelection.start.range[1]).to.equal(10);
				expect(PostActionSelection.end.leaf).to.equal(l);
				expect(PostActionSelection.end.range[0]).to.equal(10);
				expect(PostActionSelection.end.range[1]).to.equal(10);

				done();
			});

		});

		describe('Type in a bold zeroLeaf - PAS: In modified Leaf', function() {

			const l1 = new Leaf({
				styles: new LeafStyles({
					bold: true
				})
			});

			const n1 = new Node();
			/*
				(root)---(n1)---<l1>
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

				n1.new = false;

				l1.new = false;

				done();
			});

			it('Type "H"', function(done) {
				BeforeActionSelection.start = { leaf: l1, range: [0, 0] };
				BeforeActionSelection.end = { leaf: l1, range: [0, 0] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);

				applyLeafText(l1, selections[0].range, 'H');

				expect(l1.text).to.equal('H');
				expect(l1.styles.bold).to.be.true;

				let result;

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				result = step instanceof LeafText;
				expect(result).to.be.true;
				expect(step.leaf).to.equal(l1);
				expect(step.range[0]).to.equal(0);
				expect(step.range[1]).to.equal(1);
				expect(step.text).to.equal('\u200b');

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(1);
				expect(PostActionSelection.start.range[1]).to.equal(1);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(1);
				expect(PostActionSelection.end.range[1]).to.equal(1);

				// Save PAS
				copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

				done();
			});

			it('Type "i" after "H"', function(done) {
				copyBlankSelection(BeforeActionSelection, PostActionSelection);
				const selections = toSelections(BeforeActionSelection);

				applyLeafText(l1, selections[0].range, 'i');

				expect(l1.text).to.equal('Hi');

				let result;

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				result = step instanceof LeafText;
				expect(result).to.be.true;
				expect(step.leaf).to.equal(l1);
				expect(step.range[0]).to.equal(0);
				expect(step.range[1]).to.equal(2);
				expect(step.text).to.equal('\u200b');

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(2);
				expect(PostActionSelection.start.range[1]).to.equal(2);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(2);
				expect(PostActionSelection.end.range[1]).to.equal(2);

				// Save PAS
				copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

				done();
			});

			it('Type "x" between "H" and "i"', function(done) {
				// Selection changed
				readyTempHistorySteps();

				BeforeActionSelection.start = { leaf: l1, range: [1, 1] };
				BeforeActionSelection.end = { leaf: l1, range: [1, 1] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);

				applyLeafText(l1, selections[0].range, 'x');

				expect(l1.text).to.equal('Hxi');

				let result;

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				result = step instanceof LeafText;
				expect(result).to.be.true;
				expect(step.leaf).to.equal(l1);
				expect(step.range[0]).to.equal(1);
				expect(step.range[1]).to.equal(2);
				expect(step.text).to.equal('');

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(2);
				expect(PostActionSelection.start.range[1]).to.equal(2);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(2);
				expect(PostActionSelection.end.range[1]).to.equal(2);

				// Save PAS
				copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

				done();
			});

			it('Undo two times', function(done) {
				// Undo
				readyTempHistorySteps();
				expect(History.stackPast.length).to.equal(2);
				expect(History.stackFuture.length).to.equal(0);
				undo();

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(1);
				expect(PostActionSelection.start.range[1]).to.equal(1);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(1);
				expect(PostActionSelection.end.range[1]).to.equal(1);

				// Undo
				readyTempHistorySteps();
				expect(History.stackPast.length).to.equal(1);
				expect(History.stackFuture.length).to.equal(1);
				undo();

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(0);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(0);

				let result = isZeroLeaf(l1);
				expect(result).to.be.true;

				done();
			});

			it('Redo once', function(done) {
				// Redo
				expect(History.stackPast.length).to.equal(0);
				expect(History.stackFuture.length).to.equal(1);
				readyTempHistorySteps();
				expect(History.stackPast.length).to.equal(0);
				expect(History.stackFuture.length).to.equal(2);
				redo();

				expect(l1.text).to.equal('Hi');

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(2);
				expect(PostActionSelection.start.range[1]).to.equal(2);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(2);
				expect(PostActionSelection.end.range[1]).to.equal(2);

				done();
			});

			it('Redo again', function(done) {
				// Redo
				expect(History.stackPast.length).to.equal(0);
				expect(History.stackFuture.length).to.equal(1);
				readyTempHistorySteps();
				expect(History.stackPast.length).to.equal(1);
				expect(History.stackFuture.length).to.equal(1);
				redo();

				expect(l1.text).to.equal('Hxi');

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(2);
				expect(PostActionSelection.start.range[1]).to.equal(2);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(2);
				expect(PostActionSelection.end.range[1]).to.equal(2);

				done();
			});

		});

	});

	describe('appendAndGrow - PAS: End of the AppendPoint', function() {

		describe('Replacement is pure string with no newline characters. Selection is in one Leaf but with different CaretStyle.', function() {

			const l1 = new Leaf({ text: 'Hello friend!' });

			const n1 = new Node({ nodeType: 4 });

			/*
				(root)---(4)---<l1>
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

				n1.new = false;

				l1.new = false;

				done();
			});

			it('Insert bold "my " between "Hello " with "friend!"', function(done) {
				BeforeActionSelection.start = { leaf: l1, range: [6, 6] };
				BeforeActionSelection.end = { leaf: l1, range: [6, 6] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);

				// Apply new CaretStyle
				applyCaretStyle({ bold: true });

				const replacement = 'my ';
				appendAndGrow(selections, replacement);

				let cl = n1.firstChild;
				expect(cl.prevLeaf).to.equal(null);
				expect(cl.text).to.equal('Hello ');
				expect(cl.new).to.be.true;
				expect(cl.styles.bold).to.be.false;
				let result = cl === l1;
				expect(result).to.be.false;
				cl.new = false;
				cl = cl.nextLeaf;
				expect(cl.text).to.equal('my ');
				expect(cl.styles.bold).to.be.true;
				cl.new = false;
				const sl = cl;
				cl = cl.nextLeaf;
				expect(cl.text).to.equal('friend!');
				expect(cl.new).to.be.true;
				expect(cl.styles.bold).to.be.false;
				cl.new = false;
				expect(cl.nextLeaf).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(sl);
				expect(PostActionSelection.start.range[0]).to.equal(3);
				expect(PostActionSelection.start.range[1]).to.equal(3);
				expect(PostActionSelection.end.leaf).to.equal(sl);
				expect(PostActionSelection.end.range[0]).to.equal(3);
				expect(PostActionSelection.end.range[1]).to.equal(3);

				// Save PAS
				copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

				done();
			});

			it('Undo', function(done) {
				// Undo
				readyTempHistorySteps();
				undo();
				
				let cl = n1.firstChild;
				expect(cl).to.equal(l1);
				expect(cl.text).to.equal('Hello friend!');

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(6);
				expect(PostActionSelection.start.range[1]).to.equal(6);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(6);
				expect(PostActionSelection.end.range[1]).to.equal(6);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				let cl = n1.firstChild;
				expect(cl.prevLeaf).to.equal(null);
				expect(cl.text).to.equal('Hello ');
				expect(cl.styles.bold).to.be.false;
				let result = cl === l1;
				expect(result).to.be.false;
				cl = cl.nextLeaf;
				expect(cl.text).to.equal('my ');
				expect(cl.styles.bold).to.be.true;
				const sl = cl;
				cl = cl.nextLeaf;
				expect(cl.text).to.equal('friend!');
				expect(cl.styles.bold).to.be.false;
				expect(cl.nextLeaf).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(sl);
				expect(PostActionSelection.start.range[0]).to.equal(3);
				expect(PostActionSelection.start.range[1]).to.equal(3);
				expect(PostActionSelection.end.leaf).to.equal(sl);
				expect(PostActionSelection.end.range[0]).to.equal(3);
				expect(PostActionSelection.end.range[1]).to.equal(3);

				done();
			});

		});

		describe('Replacement is pure string with no newline characters. Selection spans two Nodes.', function() {

			const l1 = new Leaf({ text: 'Hello world!' });
			const l2 = new Leaf({ text: 'Faster than light.' });

			const n1 = new Node({ nodeType: 4 });
			const n2 = new Node({ nodeType: 1 });
				const n3 = new Node({ nodeType: 2 });

			/*
				(root)---(4)---<l1>
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

			it('Replace "world!" and "Faster" with " "', function(done) {
				BeforeActionSelection.start = { leaf: l1, range: [6, l1.text.length] };
				BeforeActionSelection.end = { leaf: l2, range: [0, 6] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);
				// Update CaretStyle
				applyCaretStyle(l1.styles);

				const replacement = ' ';
				appendAndGrow(selections, replacement);

				let cn = n1;
					let cl = n1.firstChild;
					expect(cl.prevLeaf).to.equal(null);
					expect(cl.text).to.equal('Hello   than light.');
					expect(cl.new).to.be.true;
					expect(cl.nextLeaf).to.equal(null);
					expect(cl.parent).to.equal(cn);
					cl.new = false;

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(cl);
				expect(PostActionSelection.start.range[0]).to.equal(7);
				expect(PostActionSelection.start.range[1]).to.equal(7);
				expect(PostActionSelection.end.leaf).to.equal(cl);
				expect(PostActionSelection.end.range[0]).to.equal(7);
				expect(PostActionSelection.end.range[1]).to.equal(7);

				// Save PAS
				copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

				done();
			});

			it('Undo', function(done) {
				// Undo
				readyTempHistorySteps();
				undo();

				let cn = n1;
					let cl = n1.firstChild;
					expect(cl.prevLeaf).to.equal(null);
					expect(cl).to.equal(l1);
					expect(cl.text).to.equal('Hello world!');
					expect(cl.nextLeaf).to.equal(null);
				cn = cn.nextNode;
				expect(cn).to.equal(n2);
				expect(cn.nextNode).to.equal(null);
					cn = cn.firstChild;
					expect(cn).to.equal(n3);
					expect(cn.nextNode).to.equal(null);
					expect(cn.prevNode).to.equal(null);
						cl = cn.firstChild;
						expect(cl.prevLeaf).to.equal(null);
						expect(cl).to.equal(l2);
						expect(cl.text).to.equal('Faster than light.');
						expect(cl.nextLeaf).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(6);
				expect(PostActionSelection.start.range[1]).to.equal(l1.text.length);
				expect(PostActionSelection.end.leaf).to.equal(l2);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(6);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				let cn = n1;
					let cl = n1.firstChild;
					expect(cl.prevLeaf).to.equal(null);
					expect(cl.text).to.equal('Hello   than light.');
					expect(cl.nextLeaf).to.equal(null);
					expect(cl.parent).to.equal(cn);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(cl);
				expect(PostActionSelection.start.range[0]).to.equal(7);
				expect(PostActionSelection.start.range[1]).to.equal(7);
				expect(PostActionSelection.end.leaf).to.equal(cl);
				expect(PostActionSelection.end.range[0]).to.equal(7);
				expect(PostActionSelection.end.range[1]).to.equal(7);

				done();
			});

		});

		describe('Replacement is pure string with newline characters. Selection is in one Node.', function() {

			const l1 = new Leaf({
				text: 'Hello world!',
				styles: new LeafStyles({ bold: true	})
			});
			const l2 = new Leaf({ text: 'Faster than light.' });

			const n1 = new Node({ nodeType: 1 });
				const n2 = new Node({
					nodeType: 2,
					styles: new NodeStyles({
						textAlignment: 2
					})
				});
				const n3 = new Node({ nodeType: 3 });

			/*
				(root)---(1)---(2)---<l1>
						 	   |
							   (3)---<l2>
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

			it('Replace "Hello" with "Leaf 1"-"Leaf 2"-"Leaf 3"', function(done) {
				BeforeActionSelection.start = { leaf: l1, range: [0, 5] };
				BeforeActionSelection.end = { leaf: l1, range: [0, 5] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);

				// Update CaretStyle
				applyCaretStyle(l1.styles);

				const replacement = 'Leaf 1\nLeaf 2\nLeaf 3';
				appendAndGrow(selections, replacement);

				let cn = n1;
					cn = n1.firstChild;
					expect(cn).to.equal(n2);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 1');
						expect(cl.styles.bold).to.be.true;
						expect(cl.new).to.be.true;
						expect(cl.parent).to.equal(cn);
						cl.new = false;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(2);
					expect(cn.styles.textAlignment).to.equal(2);
					expect(cn.prevNode).to.equal(n2);
					expect(cn.parent).to.equal(n1);
					expect(cn.new).to.be.true;
					cn.new = false;
						cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 2');
						expect(cl.styles.bold).to.be.true;
						expect(cl.new).to.be.true;
						expect(cl.parent).to.equal(cn);
						cl.new = false;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(2);
					expect(cn.styles.textAlignment).to.equal(2);
					expect(cn.parent).to.equal(n1);
					expect(cn.new).to.be.true;
					cn.new = false;
						cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 3 world!');
						expect(cl.styles.bold).to.be.true;
						expect(cl.new).to.be.true;
						expect(cl.parent).to.equal(cn);
						cl.new = false;
						const sl = cl;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(sl);
				expect(PostActionSelection.start.range[0]).to.equal(6);
				expect(PostActionSelection.start.range[1]).to.equal(6);
				expect(PostActionSelection.end.leaf).to.equal(sl);
				expect(PostActionSelection.end.range[0]).to.equal(6);
				expect(PostActionSelection.end.range[1]).to.equal(6);

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
						let cl = cn.firstChild;
						expect(cl).to.equal(l1);
						expect(cl.text).to.equal('Hello world!');
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
					expect(cn.nextNode).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l1);
				expect(PostActionSelection.start.range[0]).to.equal(0);
				expect(PostActionSelection.start.range[1]).to.equal(5);
				expect(PostActionSelection.end.leaf).to.equal(l1);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(5);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				let cn = n1;
					cn = n1.firstChild;
					expect(cn).to.equal(n2);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 1');
						expect(cl.styles.bold).to.be.true;
						expect(cl.parent).to.equal(cn);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(2);
					expect(cn.styles.textAlignment).to.equal(2);
					expect(cn.prevNode).to.equal(n2);
					expect(cn.parent).to.equal(n1);
						cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 2');
						expect(cl.styles.bold).to.be.true;
						expect(cl.parent).to.equal(cn);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(2);
					expect(cn.styles.textAlignment).to.equal(2);
					expect(cn.parent).to.equal(n1);
						cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 3 world!');
						expect(cl.styles.bold).to.be.true;
						expect(cl.parent).to.equal(cn);
						const sl = cl;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(sl);
				expect(PostActionSelection.start.range[0]).to.equal(6);
				expect(PostActionSelection.start.range[1]).to.equal(6);
				expect(PostActionSelection.end.leaf).to.equal(sl);
				expect(PostActionSelection.end.range[0]).to.equal(6);
				expect(PostActionSelection.end.range[1]).to.equal(6);

				done();
			});

		});

		describe('Replacement is a LeafChain. Selection spans multiple Nodes (Deep).', function() {

			const l1 = new Leaf({ text: 'Leaf 1' });
			const l2 = new Leaf({ text: 'Leaf 2', styles: new LeafStyles({ bold: true }) });
			const l3 = new Leaf({ text: 'Leaf 3' });
			const l4 = new Leaf({ text: 'Leaf 4' });
			const l5 = new Leaf({ text: 'Leaf 5' });

			const n1 = new Node({ nodeType: 1 });
				const n2 = new Node({ nodeType: 2 });
				const n3 = new Node({ nodeType: 2 });
					const n4 = new Node({ nodeType: 4 });
					const n5 = new Node({ nodeType: 3 });
					const n6 = new Node({ nodeType: 4 });
			/*
				(root)---(1)---(2)---<l1-l2>
				               |
				               (2)---(4)---<l3>
				         			 |
				                     (3)---<l4>
				         			 |
				                     (4)---<l5>
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
				setParentLink(n4, n3);
				chainNode(n5, n4);
				chainNode(n6, n5);

				setParentLink(l1, n2);
				chainLeaf(l2, l1);
				setParentLink(l3, n4);
				setParentLink(l4, n5);
				setParentLink(l5, n6);

				n1.new = false;
				n2.new = false;
				n3.new = false;
				n4.new = false;
				n5.new = false;
				n6.new = false;

				l1.new = false;
				l2.new = false;
				l3.new = false;
				l4.new = false;
				l5.new = false;

				done();
			});

			it('Replace "eaf 2" to "Leaf 4" with [no]b-[ man]-[ sky]i', function(done) {
				BeforeActionSelection.start = { leaf: l2, range: [1, l2.text.length] };
				BeforeActionSelection.end = { leaf: l4, range: [0, l4.text.length] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);

				const nl1 = new Leaf({ text: 'no', styles: new LeafStyles({ bold: true }) });
				const nl2 = new Leaf({ text: ' man' });
				const nl3 = new Leaf({ text: ' sky', styles: new LeafStyles({ italic: true }) });
				chainLeaf(nl2, nl1);
				chainLeaf(nl3, nl2);
				const replacement = new LeafChain({ startLeaf: nl1, endLeaf: nl3 });
				appendAndGrow(selections, replacement);

				let cn = n1;
					cn = cn.firstChild;
					expect(cn).to.equal(n2);
						let cl = cn.firstChild;
						expect(cl).to.equal(l1);
						expect(cl.text).to.equal('Leaf 1');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Lno');
						expect(cl.styles.bold).to.be.true;
						expect(cl.parent).to.equal(cn);
						expect(cl.new).to.be.true;
						cl.new = false;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal(' man');
						expect(cl.styles.bold).to.be.false;
						expect(cl.parent).to.equal(cn);
						expect(cl.new).to.be.true;
						cl.new = false;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal(' sky');
						expect(cl.styles.italic).to.be.true;
						expect(cl.parent).to.equal(cn);
						expect(cl.new).to.be.true;
						cl.new = false;
						const sl = cl;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						cn = cn.firstChild;
						expect(cn).to.equal(n6);
						expect(cn.prevNode).to.equal(null);
						expect(cn.nextNode).to.equal(null);
							cl = cn.firstChild;
							expect(cl).to.equal(l5);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(sl);
				expect(PostActionSelection.start.range[0]).to.equal(4);
				expect(PostActionSelection.start.range[1]).to.equal(4);
				expect(PostActionSelection.end.leaf).to.equal(sl);
				expect(PostActionSelection.end.range[0]).to.equal(4);
				expect(PostActionSelection.end.range[1]).to.equal(4);

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
						let cl = cn.firstChild;
						expect(cl).to.equal(l1);
						cl = cl.nextLeaf;
						expect(cl).to.equal(l2);
						expect(cl.text).to.equal('Leaf 2');
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						cn = cn.firstChild;
						expect(cn).to.equal(n4);
						expect(cn.firstChild).to.equal(l3);
						cn = cn.nextNode;
						expect(cn).to.equal(n5);
						expect(cn.firstChild).to.equal(l4);
						cn = cn.nextNode;
						expect(cn).to.equal(n6);
						expect(cn.firstChild).to.equal(l5);
						expect(cn.nextNode).to.equal(null);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l2);
				expect(PostActionSelection.start.range[0]).to.equal(1);
				expect(PostActionSelection.start.range[1]).to.equal(l2.text.length);
				expect(PostActionSelection.end.leaf).to.equal(l4);
				expect(PostActionSelection.end.range[0]).to.equal(0);
				expect(PostActionSelection.end.range[1]).to.equal(l4.text.length);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				let cn = n1;
					cn = cn.firstChild;
					expect(cn).to.equal(n2);
						let cl = cn.firstChild;
						expect(cl).to.equal(l1);
						expect(cl.text).to.equal('Leaf 1');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Lno');
						expect(cl.styles.bold).to.be.true;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal(' man');
						expect(cl.styles.bold).to.be.false;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal(' sky');
						expect(cl.styles.italic).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						cn = cn.firstChild;
						expect(cn).to.equal(n6);
						expect(cn.prevNode).to.equal(null);
						expect(cn.nextNode).to.equal(null);
							cl = cn.firstChild;
							expect(cl).to.equal(l5);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(sl);
				expect(PostActionSelection.start.range[0]).to.equal(4);
				expect(PostActionSelection.start.range[1]).to.equal(4);
				expect(PostActionSelection.end.leaf).to.equal(sl);
				expect(PostActionSelection.end.range[0]).to.equal(4);
				expect(PostActionSelection.end.range[1]).to.equal(4);

				done();
			});

		});

		describe('Replacement is a NodeChain. Selection is in one Node (Deep).', function() {

			const l1 = new Leaf({ text: 'Leaf 1' });
			const l2 = new Leaf({ text: 'Leaf 2' });
			const l3 = new Leaf({ text: 'Leaf 3' });

			const n1 = new Node({ nodeType: 1 });
				const n2 = new Node({ nodeType: 4 });
				const n3 = new Node({ nodeType: 3, styles: new NodeStyles({ fontFamily: 2 }) });
				const n4 = new Node({ nodeType: 4 });

			/*
				(root)---(1)---(4)---<l1>
				         	   |
				               (3)---<l2>
				         	   |
				               (4)---<l3>
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
				chainNode(n4, n3);

				setParentLink(l1, n2);
				setParentLink(l2, n3);
				setParentLink(l3, n4);

				n1.new = false;
				n2.new = false;
				n3.new = false;
				n4.new = false;

				l1.new = false;
				l2.new = false;
				l3.new = false;

				done();
			});

			it('Replace "ea" in "Leaf 2" with a NodeChain', function(done) {
				/*
					(0)---(1)---(3)---<l1-l2>
					      |		|
					      |		(2)---<l3>
					      |
					      (1)---<l4>
				*/
				const nn1 = new Node({ nodeType: 0 });
					const nn2 = new Node({ nodeType: 1 });
						const nn3 = new Node({ nodeType: 3 });
						const nn4 = new Node({ nodeType: 2 });
					const nn5 = new Node({ nodeType: 1 });

				const ll1 = new Leaf({ text: 'll1' });
				const ll2 = new Leaf({ text: 'll2', styles: new LeafStyles({ bold: true }) });
				const ll3 = new Leaf();
				const ll4 = new Leaf({ text: 'll4' });

				setParentLink(nn2, nn1);
				chainNode(nn5, nn2);

				setParentLink(nn3, nn2);
				chainNode(nn4, nn3);

				setParentLink(ll1, nn3);
				chainLeaf(ll2, ll1);
				setParentLink(ll3, nn4);
				setParentLink(ll4, nn5);

				const replacement = new NodeChain({ startNode: nn1, endNode: nn1 });

				BeforeActionSelection.start = { leaf: l2, range: [1, 3] };
				BeforeActionSelection.end = { leaf: l2, range: [1, 3] };
				copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

				const selections = toSelections(BeforeActionSelection);

				appendAndGrow(selections, replacement);

				let cn = n1;
					cn = cn.firstChild;
					expect(cn).to.equal(n2);
						expect(cn.firstChild).to.equal(l1);
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Lll1');
						expect(cl.new).to.be.true;
						cl.new = false;
						cl = cl.nextLeaf;
						expect(cl).to.equal(ll2);
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
					expect(cn.styles.fontFamily).to.equal(2);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild).to.equal(ll3);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
					expect(cn.styles.fontFamily).to.equal(2);
					expect(cn.new).to.be.true;
					cn.new = false;
						cl = cn.firstChild;
						expect(cl.text).to.equal('ll4f 2');
						expect(cl.new).to.be.true;
						const sl = cl;
						cl.new = false;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild).to.equal(l3);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(sl);
				expect(PostActionSelection.start.range[0]).to.equal(3);
				expect(PostActionSelection.start.range[1]).to.equal(3);
				expect(PostActionSelection.end.leaf).to.equal(sl);
				expect(PostActionSelection.end.range[0]).to.equal(3);
				expect(PostActionSelection.end.range[1]).to.equal(3);

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
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild).to.equal(l3);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(l2);
				expect(PostActionSelection.start.range[0]).to.equal(1);
				expect(PostActionSelection.start.range[1]).to.equal(3);
				expect(PostActionSelection.end.leaf).to.equal(l2);
				expect(PostActionSelection.end.range[0]).to.equal(1);
				expect(PostActionSelection.end.range[1]).to.equal(3);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				let cn = n1;
					cn = cn.firstChild;
					expect(cn).to.equal(n2);
						expect(cn.firstChild).to.equal(l1);
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Lll1');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('ll2');
						expect(cl.styles.bold).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
					expect(cn.styles.fontFamily).to.equal(2);
						cl = cn.firstChild;
						let result = isZeroLeaf(cl);
						expect(result).to.be.true;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
					expect(cn.styles.fontFamily).to.equal(2);
						cl = cn.firstChild;
						expect(cl.text).to.equal('ll4f 2');
						const sl = cl;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild).to.equal(l3);

				// PAS
				expect(PostActionSelection.start.leaf).to.equal(sl);
				expect(PostActionSelection.start.range[0]).to.equal(3);
				expect(PostActionSelection.start.range[1]).to.equal(3);
				expect(PostActionSelection.end.leaf).to.equal(sl);
				expect(PostActionSelection.end.range[0]).to.equal(3);
				expect(PostActionSelection.end.range[1]).to.equal(3);

				done();
			});

		});

	});

	describe('shatterAndInsert - PAS: Last Leaf in replacement', function() {

		describe('startLeaf and endLeaf have the same parent', function() {

			describe('appendBefore and appendAfter are both single zeroLeaves, and startLeaf is the first Leaf', function() {

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

				it('Replace the last LeafChain with NodeChain', function(done) {
					/*
						replacement:

						(0)---<ll1>
						|
						(0)---<ll2>
					*/
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node();
					const nn2 = new Node();

					chainNode(nn2, nn1);
					setParentLink(ll1, nn1);
					setParentLink(ll2, nn2);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

					BeforeActionSelection.start = { leaf: l2, range: [0, l2.text.length] };
					BeforeActionSelection.end = { leaf: l2, range: [0, l2.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					shatterAndInsert(selections, replacement);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
						expect(cn.nextNode).to.equal(null);
							expect(cn.firstChild).to.equal(l1);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(nn1);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild).to.equal(ll1);
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
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
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
							let cl = cn.firstChild;
							expect(cl).to.equal(l2);
							expect(cl.text).to.equal('Leaf 2');
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l2);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(l2.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l2);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(l2.text.length);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
						expect(cn.nextNode).to.equal(null);
							expect(cn.firstChild).to.equal(l1);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('ll1');
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						cl = cn.firstChild;
						expect(cl.text).to.equal('ll2');
						const sl = cl;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

					done();
				});

			});

			describe('appendBefore is zeroLeaf and startLeaf is the first Leaf', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2', styles: new LeafStyles({ bold: true }) });
				const l3 = new Leaf({ text: 'Leaf 3' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2 });
				const n3 = new Node({ nodeType: 0 });

				/*
					(root)---(1)---(2)---<l1-l2>
					         |
					         (0)---<l3>
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
					chainNode(n3, n1);
					setParentLink(n2, n1);

					setParentLink(l1, n2);
					chainLeaf(l2, l1);
					setParentLink(l3, n3);

					n1.new = false;
					n2.new = false;
					n3.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;

					done();
				});

				it('Replace "L" in "Leaf 1" with NodeChain', function(done) {
					/*
						replacement:

						(0)---<ll1>
						|
						(0)---<ll2>
					*/
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node();
					const nn2 = new Node();

					chainNode(nn2, nn1);
					setParentLink(ll1, nn1);
					setParentLink(ll2, nn2);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

					BeforeActionSelection.start = { leaf: l1, range: [0, 1] };
					BeforeActionSelection.end = { leaf: l1, range: [0, 1] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					shatterAndInsert(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(nn1);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild).to.equal(ll1);
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('eaf 1');
							expect(cl.new).to.be.true;
							cl.new = false;
							cl = cl.nextLeaf;
							expect(cl.text).to.equal('Leaf 2');
							expect(cl.styles.bold).to.be.true;
							expect(cl.new).to.be.true;
							cl.new = false;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						expect(cn.firstChild).to.equal(l3);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.text).to.equal('Leaf 1');
							cl = cl.nextLeaf;
							expect(cl).to.equal(l2);
							expect(cl.text).to.equal('Leaf 2');
							expect(cl.styles.bold).to.be.true;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
					expect(cn.nextNode).to.equal(null);
						expect(cn.firstChild).to.equal(l3);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l1);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(1);
					expect(PostActionSelection.end.leaf).to.equal(l1);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(1);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = DocumentRoot.firstChild;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll1');
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll2');
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('eaf 1');
							cl = cl.nextLeaf;
							expect(cl.text).to.equal('Leaf 2');
							expect(cl.styles.bold).to.be.true;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						expect(cn.firstChild).to.equal(l3);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

					done();
				});

			});

			describe('appendAfter is one single zeroLeaf', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2', styles: new LeafStyles({ bold: true }) });
				const l3 = new Leaf({ text: 'Leaf 3' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2 });
				const n3 = new Node({ nodeType: 0 });

				/*
					(root)---(1)---(2)---<l1-l2>
					         |
					         (0)---<l3>
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
					chainNode(n3, n1);
					setParentLink(n2, n1);

					setParentLink(l1, n2);
					chainLeaf(l2, l1);
					setParentLink(l3, n3);

					n1.new = false;
					n2.new = false;
					n3.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;

					done();
				});

				it('Replace "eaf 1" in l1 and l2 with NodeChain', function(done) {
					/*
						replacement:

						(0)---<ll1>
						|
						(0)---<ll2>
					*/
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node();
					const nn2 = new Node();

					chainNode(nn2, nn1);
					setParentLink(ll1, nn1);
					setParentLink(ll2, nn2);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

					BeforeActionSelection.start = { leaf: l1, range: [1, l1.text.length] };
					BeforeActionSelection.end = { leaf: l2, range: [0, l2.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					shatterAndInsert(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let lc = cn.firstChild;
							expect(lc.text).to.equal('L');
							expect(lc.new).to.be.true;
							lc.new = false;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll1');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll2');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						expect(cn.firstChild).to.equal(l3);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.text).to.equal('Leaf 1');
							cl = cl.nextLeaf;
							expect(cl).to.equal(l2);
							expect(cl.text).to.equal('Leaf 2');
							expect(cl.styles.bold).to.be.true;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
					expect(cn.nextNode).to.equal(null);
						expect(cn.firstChild).to.equal(l3);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l1);
					expect(PostActionSelection.start.range[0]).to.equal(1);
					expect(PostActionSelection.start.range[1]).to.equal(l1.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l2);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(l2.text.length);

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
							let lc = cn.firstChild;
							expect(lc.text).to.equal('L');
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll1');
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll2');
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						expect(cn.firstChild).to.equal(l3);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

					done();
				});

			});

			describe('Else', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
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

				it('Insert NodeChain in "Leaf 1"', function(done) {
					/*
						replacement:

						(0)---<ll1>
						|
						(0)---<ll2>
					*/
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node();
					const nn2 = new Node();

					chainNode(nn2, nn1);
					setParentLink(ll1, nn1);
					setParentLink(ll2, nn2);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

					BeforeActionSelection.start = { leaf: l1, range: [2, 2] };
					BeforeActionSelection.end = { leaf: l1, range: [2, 2] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					shatterAndInsert(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let lc = cn.firstChild;
							expect(lc.text).to.equal('Le');
							expect(lc.new).to.be.true;
							lc.new = false;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll1');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll2');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n1.nodeType);
					expect(cn.new).to.be.true;
					cn.new = false;
					expect(cn.nextNode).to.equal(null);
						cn = cn.firstChild;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
						expect(cn.new).to.be.false;
							expect(cn.firstChild.text).to.equal('af 1');
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
						expect(cn.nextNode).to.equal(null);
							expect(cn.firstChild).to.equal(l2);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l1);
					expect(PostActionSelection.start.range[0]).to.equal(2);
					expect(PostActionSelection.start.range[1]).to.equal(2);
					expect(PostActionSelection.end.leaf).to.equal(l1);
					expect(PostActionSelection.end.range[0]).to.equal(2);
					expect(PostActionSelection.end.range[1]).to.equal(2);

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
							let lc = cn.firstChild;
							expect(lc.text).to.equal('Le');
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll1');
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll2');
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n1.nodeType);
					expect(cn.nextNode).to.equal(null);
						cn = cn.firstChild;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
						expect(cn.new).to.be.false;
							expect(cn.firstChild.text).to.equal('af 1');
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

					done();
				});

			});

		});

		describe('startLeaf and endLeaf have different parents', function() {
			
			describe('appendBefore is zeroLeaf and startLeaf is the first leaf', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2' });
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
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
					chainNode(n4, n1);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;

					done();
				});

				it('Replace l1 to l3 with NodeChain', function(done) {
					/*
						replacement:

						(0)---<ll1>
						|
						(0)---<ll2>
					*/
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node();
					const nn2 = new Node();

					chainNode(nn2, nn1);
					setParentLink(ll1, nn1);
					setParentLink(ll2, nn2);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

					BeforeActionSelection.start = { leaf: l1, range: [0, l1.text.length] };
					BeforeActionSelection.end = { leaf: l3, range: [0, l3.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					shatterAndInsert(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll1');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll2');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild.text).to.equal('Leaf 4');
						expect(cn.firstChild.styles.bold).to.be.true;
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.styles.bold).to.be.true;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l1);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(l1.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l3);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(l3.text.length);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = DocumentRoot.firstChild;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll1');
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll2');
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild.text).to.equal('Leaf 4');
						expect(cn.firstChild.styles.bold).to.be.true;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

					done();
				});

			});

			describe('appendAfter is one single zeroLeaf', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2' });
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
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
					chainNode(n4, n1);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;

					done();
				});

				it('Replace "af 2" in "Leaf 2" to l4 with NodeChain', function(done) {
					/*
						replacement:

						(0)---<ll1>
						|
						(0)---<ll2>
					*/
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node();
					const nn2 = new Node();

					chainNode(nn2, nn1);
					setParentLink(ll1, nn1);
					setParentLink(ll2, nn2);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

					BeforeActionSelection.start = { leaf: l2, range: [2, l2.text.length] };
					BeforeActionSelection.end = { leaf: l4, range: [0, l4.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					shatterAndInsert(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild.text).to.equal('Le');
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll1');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll2');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
						const sl = cn.firstChild;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.styles.bold).to.be.true;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l2);
					expect(PostActionSelection.start.range[0]).to.equal(2);
					expect(PostActionSelection.start.range[1]).to.equal(l2.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l4);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(l4.text.length);

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
							expect(cn.firstChild).to.equal(l1);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild.text).to.equal('Le');
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll1');
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll2');
						const sl = cn.firstChild;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);


					done();
				});

			});

			describe('Else', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2' });
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
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
					chainNode(n4, n1);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;

					done();
				});

				it('Replace "f 1" in "Leaf 1" to "Leaf" in "Leaf 2" with NodeChain', function(done) {
					/*
						replacement:

						(0)---<ll1>
						|
						(0)---<ll2>
					*/
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node();
					const nn2 = new Node();

					chainNode(nn2, nn1);
					setParentLink(ll1, nn1);
					setParentLink(ll2, nn2);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

					BeforeActionSelection.start = { leaf: l1, range: [3, l1.text.length] };
					BeforeActionSelection.end = { leaf: l2, range: [0, 4] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					shatterAndInsert(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild.text).to.equal('Lea');
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll1');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll2');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n1.nodeType);
					let result = sameNodeStyles(cn, n1);
					expect(result).to.be.true;
					expect(cn.new).to.be.true;
					cn.new = false;
						cn = cn.firstChild;
						expect(cn).to.equal(n3);
							expect(cn.firstChild.text).to.equal(' 2');
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild).to.equal(l3);
						expect(cn.firstChild.nextLeaf).to.equal(l4);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.styles.bold).to.be.true;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l1);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(l1.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l2);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(4);

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
							expect(cn.firstChild.text).to.equal('Lea');
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll1');
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll2');
						const sl = cn.firstChild;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n1.nodeType);
					let result = sameNodeStyles(cn, n1);
					expect(result).to.be.true;
						cn = cn.firstChild;
						expect(cn).to.equal(n3);
							expect(cn.firstChild.text).to.equal(' 2');
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild).to.equal(l3);
						expect(cn.firstChild.nextLeaf).to.equal(l4);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

					done();
				});

			});

			describe('Selection is the entire tree', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2' });
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
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
					chainNode(n4, n1);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;

					done();
				});

				it('Replace l1 to l4 with NodeChain', function(done) {
					/*
						replacement:

						(0)---<ll1>
						|
						(0)---<ll2>
					*/
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node();
					const nn2 = new Node();

					chainNode(nn2, nn1);
					setParentLink(ll1, nn1);
					setParentLink(ll2, nn2);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn2 });

					BeforeActionSelection.start = { leaf: l1, range: [0, l1.text.length] };
					BeforeActionSelection.end = { leaf: l4, range: [0, l4.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					shatterAndInsert(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll1');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
					expect(cn.new).to.be.true;
					cn.new = false;
						expect(cn.firstChild.text).to.equal('ll2');
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
						const sl = cn.firstChild;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.styles.bold).to.be.true;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l1);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(l1.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l4);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(l4.text.length);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = DocumentRoot.firstChild;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll1');
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(0);
						expect(cn.firstChild.text).to.equal('ll2');
						const sl = cn.firstChild;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(3);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(3);
					expect(PostActionSelection.end.range[1]).to.equal(3);

					done();
				});

			});

		});

	});

	describe('removeAndAppend - PAS: Various', function() {

		describe('startLeaf and endLeaf are the same Leaf', function() {

			describe('Flag is "Newline" - PAS: Beginning of appendAfter', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
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

				it('Replace "ea" in "Leaf 1" with a "Newline"', function(done) {
					const flag = _NEWLINE_;

					BeforeActionSelection.start = { leaf: l1, range: [1, 3] };
					BeforeActionSelection.end = { leaf: l1, range: [1, 3] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild.text).to.equal('L');
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
						expect(cn.new).to.be.true;
						cn.new = false;
							expect(cn.firstChild.text).to.equal('f 1');
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
							const sl = cn.firstChild;
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
						expect(cn.nextNode).to.equal(null);
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

				it('"Newline" at the beginning of l2 - PAS: Beginning of appendAfter', function(done) {
					readyTempHistorySteps();

					const flag = _NEWLINE_;

					BeforeActionSelection.start = { leaf: l2, range: [0, 0] };
					BeforeActionSelection.end = { leaf: l2, range: [0, 0] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild.text).to.equal('L');
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('f 1');
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							result = isZeroLeaf(cn.firstChild);
							expect(result).to.be.true;
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
						expect(cn.new).to.be.true;
						cn.new = false;
							expect(cn.firstChild.text).to.equal('Leaf 2');
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
							const sl = cn.firstChild;
						expect(cn.nextNode).to.equal(null);
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

				it('"Newline" at n3 - PAS: Beginning of appendAfter', function(done) {
					readyTempHistorySteps();

					const flag = _NEWLINE_;

					BeforeActionSelection.start = { leaf: n3.firstChild, range: [0, 0] };
					BeforeActionSelection.end = { leaf: n3.firstChild, range: [0, 0] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild.text).to.equal('L');
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('f 1');
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							result = isZeroLeaf(cn.firstChild);
							expect(result).to.be.true;
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
						expect(cn.new).to.be.true;
						cn.new = false;
							result = isZeroLeaf(cn.firstChild);
							expect(result).to.be.true;
							expect(cn.firstChild.new).to.be.true;
							cn.firstChild.new = false;
							const sl = cn.firstChild;
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('Leaf 2');
						expect(cn.nextNode).to.equal(null);
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
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild.text).to.equal('L');
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('f 1');
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							result = isZeroLeaf(cn.firstChild);
							expect(result).to.be.true;
							const sl = cn.firstChild;
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('Leaf 2');
						expect(cn.nextNode).to.equal(null);
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

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild.text).to.equal('L');
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('f 1');
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
						expect(cn.nextNode).to.equal(null);
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

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
							expect(cn.firstChild.text).to.equal('Leaf 1');
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l1);
					expect(PostActionSelection.start.range[0]).to.equal(1);
					expect(PostActionSelection.start.range[1]).to.equal(3);
					expect(PostActionSelection.end.leaf).to.equal(l1);
					expect(PostActionSelection.end.range[0]).to.equal(1);
					expect(PostActionSelection.end.range[1]).to.equal(3);

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
							expect(cn.firstChild.text).to.equal('L');
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('f 1');
							const sl = cn.firstChild;
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
						expect(cn.nextNode).to.equal(null);
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

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild.text).to.equal('L');
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('f 1');
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							result = isZeroLeaf(cn.firstChild);
							expect(result).to.be.true;
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('Leaf 2');
							const sl = cn.firstChild;
						expect(cn.nextNode).to.equal(null);
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

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild.text).to.equal('L');
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n2.nodeType);
						let result = sameNodeStyles(cn, n2);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('f 1');
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							result = isZeroLeaf(cn.firstChild);
							expect(result).to.be.true;
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							result = isZeroLeaf(cn.firstChild);
							expect(result).to.be.true;
							const sl = cn.firstChild;
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('Leaf 2');
						expect(cn.nextNode).to.equal(null);
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

			describe('Selection is zero-width with "Backspace"', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf({ text: 'Leaf 2' });
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });
				const l5 = new Leaf();

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();
				const n5 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
					         |
					         (0)---<l5>
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
					chainNode(n4, n1);
					chainNode(n5, n4);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);
					setParentLink(l5, n5);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;
					n5.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;
					l5.new = false;

					done();
				});

				it('"Backspace" in a Leaf - PAS: Handled by applyLeafText', function(done) {
					const flag = _BACKSPACE_;

					BeforeActionSelection.start = { leaf: l4, range: [1, 1] };
					BeforeActionSelection.end = { leaf: l4, range: [1, 1] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;

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

				it('"Backspace" at the beginning of a Leaf - PAS: Handled by applyLeafText', function(done) {
					const flag = _BACKSPACE_;

					BeforeActionSelection.start = { leaf: l4, range: [0, 0] };
					BeforeActionSelection.end = { leaf: l4, range: [0, 0] };
					// Continous Action - no need to copy bas

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						const sl = cl;
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					// Save PAS
					copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

					done();
				});

				it('"Backspace" at the beginning of a LeafChain - PAS: End of Leaf before appendAfter', function(done) {
					readyTempHistorySteps();

					const flag = _BACKSPACE_;

					BeforeActionSelection.start = { leaf: l2, range: [0, 0] };
					BeforeActionSelection.end = { leaf: l2, range: [0, 0] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n2;
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 1Leaf 2');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(6);
					expect(PostActionSelection.start.range[1]).to.equal(6);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(6);
					expect(PostActionSelection.end.range[1]).to.equal(6);

					// Save PAS
					copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

					done();
				});

				it('"Backspace" in an empty Node - PAS: End of Leaf before appendAfter', function(done) {
					readyTempHistorySteps();

					const flag = _BACKSPACE_;

					BeforeActionSelection.start = { leaf: l5, range: [0, 0] };
					BeforeActionSelection.end = { leaf: l5, range: [0, 0] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					// Save PAS
					copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

					done();
				});

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);
						expect(n5.firstChild).to.equal(l5);
						let result = isZeroLeaf(l5);
						expect(result).to.be.true;

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l5);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(0);
					expect(PostActionSelection.end.leaf).to.equal(l5);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(0);

					done();
				});

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n2;
						let cl = cn.firstChild;
						expect(cl).to.equal(l1);
						expect(cl.text).to.equal('Leaf 1');
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						cl = cn.firstChild;
						expect(cl).to.equal(l2);
						expect(cl.text).to.equal('Leaf 2');
						expect(cl.nextLeaf).to.equal(null);
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

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l4);
					expect(PostActionSelection.start.range[0]).to.equal(1);
					expect(PostActionSelection.start.range[1]).to.equal(1);
					expect(PostActionSelection.end.leaf).to.equal(l4);
					expect(PostActionSelection.end.range[0]).to.equal(1);
					expect(PostActionSelection.end.range[1]).to.equal(1);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						const sl = cl;
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n2;
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 1Leaf 2');
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(6);
					expect(PostActionSelection.start.range[1]).to.equal(6);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(6);
					expect(PostActionSelection.end.range[1]).to.equal(6);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					done();
				});

			});

			describe('Selection is zero-width with "Delete"', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf();
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });
				const l5 = new Leaf({ text: 'Leaf 5' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();
				const n5 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
					         |
					         (0)---<l5>
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
					chainNode(n4, n1);
					chainNode(n5, n4);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);
					setParentLink(l5, n5);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;
					n5.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;
					l5.new = false;

					done();
				});

				it('"Delete" in a Leaf - PAS: Handled by applyLeafText', function(done) {
					const flag = _DELETE_;

					BeforeActionSelection.start = { leaf: l3, range: [l3.text.length - 1, l3.text.length - 1] };
					BeforeActionSelection.end = { leaf: l3, range: [l3.text.length - 1, l3.text.length - 1] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						const sl = cl;
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					// Save PAS
					copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

					done();
				});

				it('"Delete" at the end of a Leaf - PAS: Handled by applyLeafText', function(done) {
					const flag = _DELETE_;

					BeforeActionSelection.start = { leaf: l3, range: [l3.text.length, l3.text.length] };
					BeforeActionSelection.end = { leaf: l3, range: [l3.text.length, l3.text.length] };
					// Continous Action - no need to copy bas

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					expect(cn.nextNode).to.equal(n5);

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

				it('"Delete" at the end of a LeafChain', function(done) {
					readyTempHistorySteps();

					const flag = _DELETE_;

					BeforeActionSelection.start = { leaf: l4, range: [l4.text.length, l4.text.length] };
					BeforeActionSelection.end = { leaf: l4, range: [l4.text.length, l4.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						const sl = cl;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 5');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					// Save PAS
					copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

					done();
				});

				it('"Delete" in an empty Node', function(done) {
					readyTempHistorySteps();

					const flag = _DELETE_;

					BeforeActionSelection.start = { leaf: l2, range: [0, 0] };
					BeforeActionSelection.end = { leaf: l2, range: [0, 0] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
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
							let result = isZeroLeaf(l2);
							expect(result).to.be.true;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 5');
						expect(cl.nextLeaf).to.equal(null);
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

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
						expect(cn.firstChild).to.equal(l5);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l4);
					expect(PostActionSelection.start.range[0]).to.equal(l4.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(l4.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l4);
					expect(PostActionSelection.end.range[0]).to.equal(l4.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(l4.text.length);

					done();
				});

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
						expect(cn.firstChild).to.equal(l5);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l3);
					expect(PostActionSelection.start.range[0]).to.equal(l3.text.length - 1);
					expect(PostActionSelection.start.range[1]).to.equal(l3.text.length - 1);
					expect(PostActionSelection.end.leaf).to.equal(l3);
					expect(PostActionSelection.end.range[0]).to.equal(l3.text.length - 1);
					expect(PostActionSelection.end.range[1]).to.equal(l3.text.length - 1);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(0);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(0);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						const sl = cl;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 5');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
					const sl = cn.firstChild;
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

		describe('startLeaf and endLeaf have the same parent', function() {

			describe('Flag is either "Delete" or "Backspace"', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf();
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });
				const l5 = new Leaf({ text: 'Leaf 5' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();
				const n5 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
					         |
					         (0)---<l5>
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
					chainNode(n4, n1);
					chainNode(n5, n4);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);
					setParentLink(l5, n5);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;
					n5.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;
					l5.new = false;

					done();
				});

				it('Delete "af 3" in "Leaf 3" to "Lea" in "Leaf 4"', function(done) {
					const flag = _DELETE_;

					BeforeActionSelection.start = { leaf: l3, range: [2, l3.text.length] };
					BeforeActionSelection.end = { leaf: l4, range: [0, 3] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Le');
						expect(cl.new).to.be.true;
						const sl = cl;
						cl.new = false;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('f 4');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					// Save PAS
					copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

					done();
				});

				it('Backspace LeafChain in n4', function(done) {
					readyTempHistorySteps();

					const flag = _BACKSPACE_;

					BeforeActionSelection.start = { leaf: n4.firstChild, range: [0, n4.firstChild.text.length] };
					BeforeActionSelection.end = { leaf: n4.firstChild.nextLeaf, range: [0, n4.firstChild.nextLeaf.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						let result = isZeroLeaf(cl);
						expect(result).to.be.true;
						expect(cl.new).to.be.true;
						cl.new = false;
						const sl = cl;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

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
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Le');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('f 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(n4.firstChild);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(n4.firstChild.text.length);
					expect(PostActionSelection.end.leaf).to.equal(n4.firstChild.nextLeaf);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(n4.firstChild.nextLeaf.text.length);

					done();
				});

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					expect(PostActionSelection.start.leaf).to.equal(l3);
					expect(PostActionSelection.start.range[0]).to.equal(2);
					expect(PostActionSelection.start.range[1]).to.equal(l3.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l4);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(3);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Le');
						const sl = cl;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('f 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.start.range[1]).to.equal(sl.text.length);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(sl.text.length);
					expect(PostActionSelection.end.range[1]).to.equal(sl.text.length);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						let result = isZeroLeaf(cl);
						expect(result).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					expect(cn.nextNode).to.equal(n5);

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

			describe('Flag is "Newline"', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf();
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });
				const l5 = new Leaf({ text: 'Leaf 5' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();
				const n5 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
					         |
					         (0)---<l5>
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
					chainNode(n4, n1);
					chainNode(n5, n4);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);
					setParentLink(l5, n5);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;
					n5.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;
					l5.new = false;

					done();
				});

				it('Replace "af 3" in "Leaf 3" to l4 with "Newline"', function(done) {
					const flag = _NEWLINE_;

					BeforeActionSelection.start = { leaf: l3, range: [2, l3.text.length] };
					BeforeActionSelection.end = { leaf: l4, range: [0, l4.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Le');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n4.nodeType);
					let result = sameNodeStyles(cn, n4);
					expect(result).to.be.true;
					expect(cn.new).to.be.true;
					cn.new = false;
						cl = cn.firstChild;
						result = isZeroLeaf(cl);
						expect(result).to.be.true;
						expect(cl.new).to.be.true;
						cl.new = false;
						const sl = cl;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

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
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l3);
					expect(PostActionSelection.start.range[0]).to.equal(2);
					expect(PostActionSelection.start.range[1]).to.equal(l3.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l4);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(l4.text.length);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Le');
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n4.nodeType);
					let result = sameNodeStyles(cn, n4);
					expect(result).to.be.true;
						cl = cn.firstChild;
						result = isZeroLeaf(cl);
						expect(result).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
						const sl = cl;
					expect(cn.nextNode).to.equal(n5);

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

		describe('startLeaf and endLeaf have different parents', function() {

			describe('Flag is either "Delete" or "Backspace"', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf();
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });
				const l5 = new Leaf({ text: 'Leaf 5' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();
				const n5 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
					         |
					         (0)---<l5>
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
					chainNode(n4, n1);
					chainNode(n5, n4);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);
					setParentLink(l5, n5);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;
					n5.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;
					l5.new = false;

					done();
				});

				it('Backspace "1" in "Leaf 1" to "Leaf " in "Leaf 3"', function(done) {
					const flag = _BACKSPACE_;

					BeforeActionSelection.start = { leaf: l1, range: [5, l1.text.length] };
					BeforeActionSelection.end = { leaf: l3, range: [0, 5] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('Leaf 3');
							expect(cl.new).to.be.true;
							cl.new = false;
							const sl = cl;
							cl = cl.nextLeaf;
							expect(cl.text).to.equal('Leaf 4');
							expect(cl.styles.bold).to.be.true;
							expect(cl.new).to.be.true;
							cl.new = false;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(5);
					expect(PostActionSelection.start.range[1]).to.equal(5);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(5);
					expect(PostActionSelection.end.range[1]).to.equal(5);

					// Save PAS
					copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

					done();
				});

				it('Delete n2 to l5', function(done) {
					readyTempHistorySteps();

					const flag = _DELETE_;

					BeforeActionSelection.start = { leaf: n2.firstChild, range: [0, n2.firstChild.text.length] };
					BeforeActionSelection.end = { leaf: l5, range: [0, l5.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.new).to.be.true;
							cl.new = false;
							const sl = cl;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
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

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('Leaf 3');
							cl = cl.nextLeaf;
							expect(cl.text).to.equal('Leaf 4');
							expect(cl.styles.bold).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(n2.firstChild);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(n2.firstChild.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l5);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(l5.text.length);

					done();
				});

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.text).to.equal('Leaf 1');
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
							cl = cn.firstChild;
							let result = isZeroLeaf(l2);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.styles.bold).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l1);
					expect(PostActionSelection.start.range[0]).to.equal(5);
					expect(PostActionSelection.start.range[1]).to.equal(l1.text.length);
					expect(PostActionSelection.end.leaf).to.equal(l3);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(5);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('Leaf 3');
							const sl = cl;
							cl = cl.nextLeaf;
							expect(cl.text).to.equal('Leaf 4');
							expect(cl.styles.bold).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(sl);
					expect(PostActionSelection.start.range[0]).to.equal(5);
					expect(PostActionSelection.start.range[1]).to.equal(5);
					expect(PostActionSelection.end.leaf).to.equal(sl);
					expect(PostActionSelection.end.range[0]).to.equal(5);
					expect(PostActionSelection.end.range[1]).to.equal(5);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
							const sl = cl;
						expect(cn.nextNode).to.equal(null);
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

			describe('Flag is "Newline"', function() {

				const l1 = new Leaf({ text: 'Leaf 1' });
				const l2 = new Leaf();
				const l3 = new Leaf({ text: 'Leaf 3' });
				const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ bold: true }) });
				const l5 = new Leaf({ text: 'Leaf 5' });

				const n1 = new Node({ nodeType: 1 });
					const n2 = new Node({ nodeType: 2, styles: new NodeStyles({ fontFamily: 2 }) });
					const n3 = new Node({ nodeType: 2 });
				const n4 = new Node();
				const n5 = new Node();

				/*
					(root)---(1)---(2)---<l1>
					         |	   |
					         |     (2)---<l2>
					         |
					         (0)---<l3-l4>
					         |
					         (0)---<l5>
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
					chainNode(n4, n1);
					chainNode(n5, n4);

					setParentLink(n2, n1);
					chainNode(n3, n2);

					setParentLink(l1, n2);
					setParentLink(l2, n3);
					setParentLink(l3, n4);
					chainLeaf(l4, l3);
					setParentLink(l5, n5);

					n1.new = false;
					n2.new = false;
					n3.new = false;
					n4.new = false;
					n5.new = false;

					l1.new = false;
					l2.new = false;
					l3.new = false;
					l4.new = false;
					l5.new = false;

					done();
				});

				it('"Newline" from l2 to "Leaf " in "Leaf 4', function(done) {
					const flag = _NEWLINE_;

					BeforeActionSelection.start = { leaf: l2, range: [0, 0] };
					BeforeActionSelection.end = { leaf: l4, range: [0, 4] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cl = cn.firstChild;
							expect(cl).to.equal(l2);
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
						expect(cn.new).to.be.true;
						cn.new = false;
							cl = cn.firstChild;
							expect(cl.text).to.equal(' 4');
							expect(cl.styles.bold).to.be.true;
							expect(cl.new).to.be.true;
							cl.new = false;
							const sl = cl;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
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

				it('"Newline" from "4" in n3.nextNode.firstChild to n5', function(done) {
					readyTempHistorySteps();

					const flag = _NEWLINE_;

					BeforeActionSelection.start = { leaf: n3.nextNode.firstChild, range: [1, 2] };
					BeforeActionSelection.end = { leaf: l5, range: [0, l5.text.length] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cl = cn.firstChild;
							expect(cl).to.equal(l2);
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							cl = cn.firstChild;
							expect(cl.text).to.equal(' ');
							expect(cl.styles.bold).to.be.true;
							expect(cl.new).to.be.true;
							cl.new = false;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
						expect(cn.new).to.be.true;
						cn.new = false;
							cl = cn.firstChild;
							result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.new).to.be.true;
							cl.new = false;
							const sl = cl;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
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

				it('"Newline" from n3 to the end of the NodeChain', function(done) {
					readyTempHistorySteps();

					const flag = _NEWLINE_;

					BeforeActionSelection.start = { leaf: l2, range: [0, 0] };
					BeforeActionSelection.end = { leaf: n3.nextNode.nextNode.firstChild, range: [0, 0] };
					copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

					const selections = toSelections(BeforeActionSelection);

					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cl = cn.firstChild;
							expect(cl).to.equal(l2);
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
						expect(cn.new).to.be.true;
						cn.new = false;
							cl = cn.firstChild;
							result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.new).to.be.true;
							cl.new = false;
							const sl = cl;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
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

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cl = cn.firstChild;
							expect(cl).to.equal(l2);
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							cl = cn.firstChild;
							expect(cl.text).to.equal(' ');
							expect(cl.styles.bold).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							cl = cn.firstChild;
							result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l2);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(0);
					expect(PostActionSelection.end.leaf).to.equal(n3.nextNode.nextNode.firstChild);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(0);

					done();
				});

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cl = cn.firstChild;
							expect(cl).to.equal(l2);
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							cl = cn.firstChild;
							expect(cl.text).to.equal(' 4');
							expect(cl.styles.bold).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(n3.nextNode.firstChild);
					expect(PostActionSelection.start.range[0]).to.equal(1);
					expect(PostActionSelection.start.range[1]).to.equal(2);
					expect(PostActionSelection.end.leaf).to.equal(l5);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(l5.text.length);

					done();
				});

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.text).to.equal('Leaf 1');
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
							cl = cn.firstChild;
							let result = isZeroLeaf(l2);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.styles.bold).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

					// PAS
					expect(PostActionSelection.start.leaf).to.equal(l2);
					expect(PostActionSelection.start.range[0]).to.equal(0);
					expect(PostActionSelection.start.range[1]).to.equal(0);
					expect(PostActionSelection.end.leaf).to.equal(l4);
					expect(PostActionSelection.end.range[0]).to.equal(0);
					expect(PostActionSelection.end.range[1]).to.equal(4);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cl = cn.firstChild;
							expect(cl).to.equal(l2);
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							cl = cn.firstChild;
							expect(cl.text).to.equal(' 4');
							expect(cl.styles.bold).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
							const sl = cl;
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
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

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cl = cn.firstChild;
							expect(cl).to.equal(l2);
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							cl = cn.firstChild;
							expect(cl.text).to.equal(' ');
							expect(cl.styles.bold).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							cl = cn.firstChild;
							result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
							const sl = cl;
						expect(cn.nextNode).to.equal(null);
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

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl).to.equal(l1);
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cl = cn.firstChild;
							expect(cl).to.equal(l2);
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							cl = cn.firstChild;
							result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
							const sl = cl;
						expect(cn.nextNode).to.equal(null);
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

		});

	});

	describe('applyLeavesStyle with Node', function() {

		const l1 = new Leaf({ text: 'Leaf 1' });
		const l2 = new Leaf({ text: 'Leaf 2', styles: new LeafStyles({ bold: true, italic: true }) });
		const l3 = new Leaf({ text: 'Leaf 3', styles: new LeafStyles({ bold: true }) });
		const l4 = new Leaf({ text: 'Leaf 4', styles: new LeafStyles({ italic: true }) });
		const l5 = new Leaf({ text: 'Leaf 5' });
		const l6 = new Leaf();
		const l7 = new Leaf({ text: 'Leaf 7', styles: new LeafStyles({ underline: true }) });

		const n1 = new Node({ nodeType: 1 });
			const n2 = new Node({ nodeType: 2 });
			const n3 = new Node({ nodeType: 2 });
		const n4 = new Node();
		const n5 = new Node();

		/*
			(root)---(1)---(2)---<l1-l2-l3>
			         |	   |
			         |     (2)---<l4-l5>
			         |
			         (0)---<l6>
			         |
			         (0)---<l7>
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
			chainNode(n4, n1);
			chainNode(n5, n4);

			setParentLink(n2, n1);
			chainNode(n3, n2);

			setParentLink(l1, n2);
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			setParentLink(l4, n3);
			chainLeaf(l5, l4);
			setParentLink(l6, n4);
			setParentLink(l7, n5);

			n1.new = false;
			n2.new = false;
			n3.new = false;
			n4.new = false;
			n5.new = false;

			l1.new = false;
			l2.new = false;
			l3.new = false;
			l4.new = false;
			l5.new = false;
			l6.new = false;
			l7.new = false;

			done();
		});

		it('startLeaf and endLeaf are the same Leaf', function(done) {
			const newStyles = { italic: false };

			BeforeActionSelection.start = { leaf: l2, range: [2, l2.text.length] };
			BeforeActionSelection.end = { leaf: l2, range: [2, l2.text.length] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			applyLeavesStyle(selections, newStyles);

			let lc = n2.firstChild;
			expect(lc).to.equal(l1);
			expect(lc.text).to.equal('Leaf 1');
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('Le');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.true;
			expect(lc.new).to.be.true;
			lc.new = false;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('af 2Leaf 3');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.false;
			expect(lc.new).to.be.true;
			lc.new = false;
			const sl = lc;
			expect(lc.nextLeaf).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(4);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(4);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('startLeaf and endLeaf have the same parent', function(done) {
			readyTempHistorySteps();

			const newStyles = { bold: true };

			BeforeActionSelection.start = { leaf: l4, range: [5, l4.text.length] };
			BeforeActionSelection.end = { leaf: l5, range: [0, 4] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			applyLeavesStyle(selections, newStyles);

			let lc = n3.firstChild;
			expect(lc.text).to.equal('Leaf ');
			expect(lc.styles.italic).to.be.true;
			expect(lc.styles.bold).to.be.false;
			expect(lc.new).to.be.true;
			lc.new = false;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('4');
			expect(lc.styles.italic).to.be.true;
			expect(lc.styles.bold).to.be.true;
			expect(lc.new).to.be.true;
			const sl1 = lc;
			lc.new = false;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('Leaf');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.false;
			expect(lc.new).to.be.true;
			const sl2 = lc;
			lc.new = false;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal(' 5');
			expect(lc.styles.bold).to.be.false;
			expect(lc.styles.italic).to.be.false;
			expect(lc.new).to.be.true;
			lc.new = false;
			expect(lc.nextLeaf).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(sl1.text.length);
			expect(PostActionSelection.end.leaf).to.equal(sl2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(sl2.text.length);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('startLeaf and endLeaf have different parents', function(done) {
			readyTempHistorySteps();

			const newStyles = { bold: true };

			BeforeActionSelection.start = { leaf: l6, range: [0, 0] };
			BeforeActionSelection.end = { leaf: l7, range: [0, l7.text.length] };
			copyBlankSelection(TempHistoryPastStep.bas, BeforeActionSelection);

			const selections = toSelections(BeforeActionSelection);

			applyLeavesStyle(selections, newStyles);

			let cn = n4;
				let cl = cn.firstChild;
				let result = isZeroLeaf(cl);
				expect(result).to.be.true;
				expect(cl.styles.bold).to.be.true;
				expect(cl.new).to.be.true;
				cl.new = false;
				const sl1 = cl;
				expect(cl.nextLeaf).to.equal(null);
			cn = cn.nextNode;
			expect(cn).to.equal(n5);
				cl = cn.firstChild;
				expect(cl.text).to.equal('Leaf 7');
				expect(cl.styles.bold).to.be.true;
				expect(cl.styles.underline).to.be.true;
				expect(cl.new).to.be.true;
				cl.new = false;
				const sl2 = cl;
				expect(cl.nextLeaf).to.equal(null);
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(sl2.text.length);

			// Save PAS
			copyBlankSelection(TempHistoryPastStep.pas, PostActionSelection);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let cn = n4;
				let cl = cn.firstChild;
				expect(cl).to.equal(l6);
				let result = isZeroLeaf(cl);
				expect(result).to.be.true;
				expect(cl.styles.bold).to.be.false;
				expect(cl.nextLeaf).to.equal(null);
			cn = cn.nextNode;
			expect(cn).to.equal(n5);
				cl = cn.firstChild;
				expect(cl).to.equal(l7);
				expect(cl.text).to.equal('Leaf 7');
				expect(cl.styles.bold).to.be.false;
				expect(cl.styles.underline).to.be.true;
				expect(cl.nextLeaf).to.equal(null);
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l6);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(l7);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(l7.text.length);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let lc = n3.firstChild;
			expect(lc).to.equal(l4);
			expect(lc.text).to.equal('Leaf 4');
			expect(lc.styles.italic).to.be.true;
			expect(lc.styles.bold).to.be.false;
			lc = lc.nextLeaf;
			expect(lc).to.equal(l5);
			expect(lc.text).to.equal('Leaf 5');
			expect(lc.styles.italic).to.be.false;
			expect(lc.styles.bold).to.be.false;
			expect(lc.nextLeaf).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l4);
			expect(PostActionSelection.start.range[0]).to.equal(5);
			expect(PostActionSelection.start.range[1]).to.equal(l4.text.length);
			expect(PostActionSelection.end.leaf).to.equal(l5);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(4);

			done();
		});

		it('Undo', function(done) {
			// Undo
			readyTempHistorySteps();
			undo();

			let lc = n2.firstChild;
			expect(lc).to.equal(l1);
			expect(lc.text).to.equal('Leaf 1');
			lc = lc.nextLeaf;
			expect(lc).to.equal(l2);
			expect(lc.text).to.equal('Leaf 2');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.true;
			lc = lc.nextLeaf;
			expect(lc).to.equal(l3);
			expect(lc.text).to.equal('Leaf 3');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.false;
			expect(lc.nextLeaf).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(l2);
			expect(PostActionSelection.start.range[0]).to.equal(2);
			expect(PostActionSelection.start.range[1]).to.equal(l2.text.length);
			expect(PostActionSelection.end.leaf).to.equal(l2);
			expect(PostActionSelection.end.range[0]).to.equal(2);
			expect(PostActionSelection.end.range[1]).to.equal(l2.text.length);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let lc = n2.firstChild;
			expect(lc).to.equal(l1);
			expect(lc.text).to.equal('Leaf 1');
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('Le');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.true;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('af 2Leaf 3');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.false;
			expect(lc.nextLeaf).to.equal(null);
			const sl = lc;

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(4);
			expect(PostActionSelection.end.leaf).to.equal(sl);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(4);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let lc = n3.firstChild;
			expect(lc.text).to.equal('Leaf ');
			expect(lc.styles.italic).to.be.true;
			expect(lc.styles.bold).to.be.false;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('4');
			expect(lc.styles.italic).to.be.true;
			expect(lc.styles.bold).to.be.true;
			const sl1 = lc;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('Leaf');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.false;
			const sl2 = lc;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal(' 5');
			expect(lc.styles.bold).to.be.false;
			expect(lc.styles.italic).to.be.false;
			expect(lc.nextLeaf).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(sl1.text.length);
			expect(PostActionSelection.end.leaf).to.equal(sl2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(sl2.text.length);

			done();
		});

		it('Redo', function(done) {
			// Redo
			readyTempHistorySteps();
			redo();

			let cn = n4;
				let cl = cn.firstChild;
				let result = isZeroLeaf(cl);
				expect(result).to.be.true;
				expect(cl.styles.bold).to.be.true;
				expect(cl.nextLeaf).to.equal(null);
				const sl1 = cl;
			cn = cn.nextNode;
			expect(cn).to.equal(n5);
				cl = cn.firstChild;
				expect(cl.text).to.equal('Leaf 7');
				expect(cl.styles.bold).to.be.true;
				expect(cl.styles.underline).to.be.true;
				expect(cl.nextLeaf).to.equal(null);
				const sl2 = cl;
			expect(cn.nextNode).to.equal(null);

			// PAS
			expect(PostActionSelection.start.leaf).to.equal(sl1);
			expect(PostActionSelection.start.range[0]).to.equal(0);
			expect(PostActionSelection.start.range[1]).to.equal(0);
			expect(PostActionSelection.end.leaf).to.equal(sl2);
			expect(PostActionSelection.end.range[0]).to.equal(0);
			expect(PostActionSelection.end.range[1]).to.equal(sl2.text.length);

			done();
		});

	});

});
