/* eslint-disable */
import { Node, NodeStyles, NullNode, NodeChain, NodeType, BranchType, PhantomNode, PhantomChain, DocumentRoot } from '../node';
import { Leaf, isZeroLeaf, LeafStyles, CaretStyle, applyCaretStyle, NullLeaf, LeafChain, LeafText, ParentLink, Clipboard } from '../leaf';
import { History, BlankHistoryStep } from '../history';
import { instanceOf } from '../utils';
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
	applyBranchText
} from '../integration';

const { expect } = require('chai');

/*
	getPrevLeafChain
*/

describe('getPrevLeafChain', function() {

	/*
		(root)---(n1)---<l1>
                 |
                 (n2)---<l2>
	*/
	it('Find previous LeafChain (previous Node exists)', function(done) {
		DocumentRoot.firstChild = null;
		const l1 = new Leaf({ text: 'l1' });
		const l2 = new Leaf({ text: 'l2' });

		const n1 = new Node();
		const n2 = new Node();

		setParentLink(n1, null);
		chainNode(n2, n1);

		setParentLink(l1, n1);
		setParentLink(l2, n2);

		n1.new = false;
		n2.new = false;
		l1.new = false;
		l2.new = false;

		let prev = getPrevLeafChain(l2);
		expect(prev).to.equal(l1);
		prev = getPrevLeafChain(prev);
		expect(prev).to.equal(null);

		done();
	});

	/*
		(root)---(n1)---(n2)---<l1>
				 |	    |
				 |		(n3)---(n4)---<l2>
				 |
                 (n5)---<l3>
	*/
	it('Find previous LeafChain (pevious Node does not exist)', function(done) {
		DocumentRoot.firstChild = null;
		const l1 = new Leaf({ text: 'l1' });
		const l2 = new Leaf({ text: 'l2' });
		const l3 = new Leaf({ text: 'l3' });

		const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
				const n4 = new Node();
		const n5 = new Node();

		setParentLink(n1, null);
		chainNode(n5, n1);

		setParentLink(n2, n1);
		chainNode(n3, n2);

		setParentLink(n4, n3);

		setParentLink(l1, n2);
		setParentLink(l2, n4);
		setParentLink(l3, n5);

		n1.new = false;
		n2.new = false;
		n3.new = false;
		n4.new = false;
		n5.new = false;

		l1.new = false;
		l2.new = false;
		l3.new = false;

		let prev = getPrevLeafChain(l3);
		expect(prev).to.equal(l2);
		prev = getPrevLeafChain(prev);
		expect(prev).to.equal(l1);
		prev = getPrevLeafChain(prev);
		expect(prev).to.equal(null);

		done();
	});
});

/*
	copyLeaf
	copyLeafChain
	copyNode
	copyNodeChain
	copyBranchText /w copyFromClipboard
*/

describe('Copy Ops', function() {

	describe('copyLeaf', function() {
		
		it ('Copy a non-zero Leaf in a LeafChain, with no range specified', function(done) {
			DocumentRoot.firstChild = null;
			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({
				text: 'l2',
				styles: new LeafStyles({
					bold: true
				})
			});

			const n1 = new Node();

			setParentLink(n1, null);
			setParentLink(l1, n1);
			chainLeaf(l2, l1);

			n1.new = false;
			l1.new = false;
			l2.new = false;
			
			const copy = copyLeaf(l2);
			expect(copy.text).to.equal('l2');
			expect(copy.prevLeaf).to.equal(null);
			expect(copy.nextLeaf).to.equal(null);
			expect(copy.parent).to.equal(null);
			expect(copy.styles.bold).to.be.true;
			let result = copy.styles === l2.styles;
			expect(result).to.be.false;

			done();
		});

		it('Copy a non-zero Leaf in a LeafChain, with range specified', function(done) {
			DocumentRoot.firstChild = null;
			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({
				text: 'l2',
				styles: new LeafStyles({
					italic: true
				})
			});

			const n1 = new Node();

			setParentLink(n1, null);
			setParentLink(l1, n1);
			chainLeaf(l2, l1);

			n1.new = false;
			l1.new = false;
			l2.new = false;
			
			const copy = copyLeaf(l2, [0, 1]);
			expect(copy.text).to.equal('l');
			expect(copy.styles.italic).to.be.true;

			done();
		});

		it('Copy a zeroLeaf', function(done) {
			DocumentRoot.firstChild = null;
			const l1 = new Leaf();
			const n1 = new Node();

			setParentLink(n1, null);
			setParentLink(l1, n1);

			n1.new = false;
			l1.new = false;
			
			const copy = copyLeaf(l1);
			let result = isZeroLeaf(copy);
			expect(result).to.be.true;

			done();
		});

	});

	describe('copyLeafChain', function() {

		const l1 = new Leaf({
			text: 'Copy the middle part',
			styles: new LeafStyles({
				bold: true
			})
		});
		const l2 = new Leaf({ text: ' of a LeafChain' });
		const l3 = new Leaf({
			text: ', with range',
			styles: new LeafStyles({
				italic: true
			})
		});
		const l4 = new Leaf({ text: ' specified' });

		const n1 = new Node();

		before(function(done) {
			DocumentRoot.firstChild = null;
			setParentLink(n1, null);
			setParentLink(l1, n1);
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			chainLeaf(l4, l3);

			n1.new = false;
			l1.new = false;
			l2.new = false;
			l3.new = false;
			l4.new = false;

			done();
		});

		it('Copy the middle part of a LeafChain, with range specified', function(done) {
			// Copy l2 and l3
			const { startLeaf, endLeaf } = copyLeafChain(l2, l3, [7, 100], [0, 5]);
			expect(startLeaf.text).to.equal('eafChain');
			expect(startLeaf.prevLeaf).to.equal(null);
			expect(startLeaf.parent).to.equal(null);
			expect(startLeaf.nextLeaf).to.equal(endLeaf);

			expect(endLeaf.text).to.equal(', wit');
			expect(endLeaf.prevLeaf).to.equal(startLeaf);
			expect(endLeaf.parent).to.equal(null);
			expect(endLeaf.nextLeaf).to.equal(null);
			expect(endLeaf.styles.italic).to.be.true;

			done();
		});

		it('Copy the rest of a LeafChain, with no range specified', function(done) {
			// Copy l1
			const { startLeaf, endLeaf } = copyLeafChain(l1, null);

			let current = startLeaf;
			expect(current.text).to.equal('Copy the middle part');
			expect(current.styles.bold).to.be.true;
			expect(current.prevLeaf).to.equal(null);

			current = current.nextLeaf;
			expect(current.text).to.equal(' of a LeafChain');

			current = current.nextLeaf;
			expect(current.text).to.equal(', with range');
			expect(current.styles.italic).to.be.true;

			current = current.nextLeaf;
			expect(current.text).to.equal(' specified');
			expect(current.nextLeaf).to.equal(null);

			done();
		});

		it('Copy a LeafChain with startLeaf as null, expect error thrown', function(done) {
			let e;
			try {
				const copy = copyLeafChain(null, l3);
			} catch (error) {
				e = error;
			} finally {
				let result = e instanceof Error;
				expect(result).to.be.true;
				console.log(e.message);
				done();
			}
		});

	});

	describe('copyNode', function() {

		it('Copy a Node in a NodeChain', function(done) {
			DocumentRoot.firstChild = null;
			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({ text: 'l2' });

			const n1 = new Node({
				nodeType: 5,
				styles: new NodeStyles({
					textAlignment: 1
				})
			});
			const n2 = new Node();

			setParentLink(n1, null);
			chainNode(n2, n1);

			setParentLink(l1, n1);
			setParentLink(l2, n2);

			n1.new = false;
			n2.new = false;
			l1.new = false;
			l2.new = false;

			const copy = copyNode(n1);
			expect(copy.styles.textAlignment).to.equal(1);
			expect(copy.nodeType).to.equal(5);
			expect(copy.prevNode).to.equal(null);
			expect(copy.nextNode).to.equal(null);
			expect(copy.firstChild).to.equal(null);

			done();
		});
	});

	describe('copyNodeChain', function() {

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

		it('Copy the middle part of the tree, with range specified', function(done) {
			// l7 to l15
			copy = copyNodeChain(l7, l15, [6, 7], [0, 1]);
			const { startNode, endNode, firstLeaf, lastLeaf } = copy;
			
			let cn = startNode;
			expect(cn.nodeType).to.equal(1);
			expect(cn.prevNode).to.equal(null);
				cn = cn.firstChild;
				expect(cn.nodeType).to.equal(3);
					let cl = cn.firstChild;
					let result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					expect(cl.text).to.equal(' ');
					expect(cl.styles.bold).to.be.true;
					expect(cl.prevLeaf).to.equal(null);
					expect(cl.parent).to.equal(cn);
					expect(cl).to.equal(firstLeaf);
					cl = cl.nextLeaf;
					expect(cl.text).to.equal('Leaves.');
					expect(cl.parent).to.equal(cn);
				cn = cn.nextNode;
				expect(cn.nodeType).to.equal(2);
				expect(cn.nextNode).to.equal(null);
					cl = cn.firstChild;
					result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					result = isZeroLeaf(cl);
					expect(result).to.be.true;
			cn = cn.parent;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(1);
				cn = cn.firstChild;
				expect(cn.nodeType).to.equal(2);
					cn = cn.firstChild;
					expect(cn.nodeType).to.equal(3);
						cl = cn.firstChild;
						result = instanceOf(cl, 'Leaf');
						expect(result).to.be.true;
						expect(cl.text).to.equal('Leaf 10');
						expect(cl.parent).to.equal(cn);
						expect(cl.prevLeaf).to.equal(null);
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
						cl = cn.firstChild;
						result = instanceOf(cl, 'Leaf');
						expect(result).to.be.true;
						expect(cl.text).to.equal('Leaf 11');
						expect(cl.parent).to.equal(cn);
						expect(cl.prevLeaf).to.equal(null);
						expect(cl.nextLeaf).to.equal(null);
				cn = cn.parent;
			cn = cn.parent;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(4);
				cl = cn.firstChild;
				result = instanceOf(cl, 'Leaf');
				expect(result).to.be.true;
				expect(cl.text).to.equal('JoJo');
				expect(cl.styles.bold).to.be.true;
				expect(cl.parent).to.equal(cn);
				expect(cl.prevLeaf).to.equal(null);
				cl = cl.nextLeaf;
				result = instanceOf(cl, 'Leaf');
				expect(result).to.be.true;
				expect(cl.text).to.equal(' is pretty good.');
				expect(cl.parent).to.equal(cn);
				expect(cl.nextLeaf).to.equal(null);
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(1);
			expect(cn).to.equal(endNode);
				cn = cn.firstChild;
				expect(cn.nodeType).to.equal(2);
				expect(cn.nextNode).to.equal(null);
					cl = cn.firstChild;
					result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					expect(cl.text).to.equal('1 ');
					expect(cl.styles.bold).to.be.true;
					expect(cl.parent).to.equal(cn);
					expect(cl.prevLeaf).to.equal(null);
					cl = cl.nextLeaf;
					result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					expect(cl.text).to.equal('2');
					expect(cl.parent).to.equal(cn);
					expect(cl.nextLeaf).to.equal(null);
					expect(cl).to.equal(lastLeaf);

			done();
		});

		it('Copy the copy', function(done) {
			const { firstLeaf: fl, lastLeaf: ll } = copy;

			const cc = copyNodeChain(fl, ll);
			const { startNode, endNode, firstLeaf, lastLeaf } = cc;

			let cn = startNode;
			expect(cn.nodeType).to.equal(1);
			expect(cn.prevNode).to.equal(null);
				cn = cn.firstChild;
				expect(cn.nodeType).to.equal(3);
					let cl = cn.firstChild;
					let result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					expect(cl.text).to.equal(' ');
					expect(cl.styles.bold).to.be.true;
					expect(cl.prevLeaf).to.equal(null);
					expect(cl.parent).to.equal(cn);
					expect(cl).to.equal(firstLeaf);
					cl = cl.nextLeaf;
					expect(cl.text).to.equal('Leaves.');
					expect(cl.parent).to.equal(cn);
				cn = cn.nextNode;
				expect(cn.nodeType).to.equal(2);
				expect(cn.nextNode).to.equal(null);
					cl = cn.firstChild;
					result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					result = isZeroLeaf(cl);
					expect(result).to.be.true;
			cn = cn.parent;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(1);
				cn = cn.firstChild;
				expect(cn.nodeType).to.equal(2);
					cn = cn.firstChild;
					expect(cn.nodeType).to.equal(3);
						cl = cn.firstChild;
						result = instanceOf(cl, 'Leaf');
						expect(result).to.be.true;
						expect(cl.text).to.equal('Leaf 10');
						expect(cl.parent).to.equal(cn);
						expect(cl.prevLeaf).to.equal(null);
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
						cl = cn.firstChild;
						result = instanceOf(cl, 'Leaf');
						expect(result).to.be.true;
						expect(cl.text).to.equal('Leaf 11');
						expect(cl.parent).to.equal(cn);
						expect(cl.prevLeaf).to.equal(null);
						expect(cl.nextLeaf).to.equal(null);
				cn = cn.parent;
			cn = cn.parent;
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(4);
				cl = cn.firstChild;
				result = instanceOf(cl, 'Leaf');
				expect(result).to.be.true;
				expect(cl.text).to.equal('JoJo');
				expect(cl.styles.bold).to.be.true;
				expect(cl.parent).to.equal(cn);
				expect(cl.prevLeaf).to.equal(null);
				cl = cl.nextLeaf;
				result = instanceOf(cl, 'Leaf');
				expect(result).to.be.true;
				expect(cl.text).to.equal(' is pretty good.');
				expect(cl.parent).to.equal(cn);
				expect(cl.nextLeaf).to.equal(null);
			cn = cn.nextNode;
			expect(cn.nodeType).to.equal(1);
			expect(cn).to.equal(endNode);
				cn = cn.firstChild;
				expect(cn.nodeType).to.equal(2);
				expect(cn.nextNode).to.equal(null);
					cl = cn.firstChild;
					result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					expect(cl.text).to.equal('1 ');
					expect(cl.styles.bold).to.be.true;
					expect(cl.parent).to.equal(cn);
					expect(cl.prevLeaf).to.equal(null);
					cl = cl.nextLeaf;
					result = instanceOf(cl, 'Leaf');
					expect(result).to.be.true;
					expect(cl.text).to.equal('2');
					expect(cl.parent).to.equal(cn);
					expect(cl.nextLeaf).to.equal(null);
					expect(cl).to.equal(lastLeaf);

			done();
		});

	});

	describe('copyBranchText', function() {

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

		it('Copy a Leaf from a tree (Clipboard)', function(done) {
			// Copy l4 at [0, 4]
			const selections = [{
				leaf: l4,
				range: [0, 4]
			}, {
				leaf: l4,
				range: [0, 4]
			}];

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

			done();
		});

		it('Copy a LeafChain from a tree (Clipboard)', function(done) {
			// Copy l14 to l17
			const selections = [{
				leaf: l14,
				range: [0, l14.text.length]
			}, {
				leaf: l17,
				range: [0, l17.text.length]
			}];

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

			done();
		});

		it('Copy a part of the tree (Clipboard)', function(done) {
			// Copy l1 to l4 at [0, l1.text.length] to [0, 0]
			const selections = [{
				leaf: l1,
				range: [0, l1.text.length]
			}, {
				leaf: l4,
				range: [0, 0]
			}];
			
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

			done();
		});

		it('Copy from Clipboard using copyFromClipboard()', function(done) {
			const copy = copyFromClipboard();
			const { startNode, endNode, startLeaf, endLeaf } = copy;

			let result;

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

			done();
		});

	});

});

/*
	applyCaretStyle
*/

describe('applyCaretStyle', function() {

	it('Set CaretStyle to bold', function(done) {
		applyCaretStyle({
			bold: true
		});

		expect(CaretStyle.bold).to.be.true;
		done();
	});

	it('Then set CaretStyle to italic', function(done) {
		applyCaretStyle({
			italic: true
		});

		expect(CaretStyle.bold).to.be.true;
		expect(CaretStyle.italic).to.be.true;
		done();
	});

	it('Copy LeafStyles from a Leaf', function(done) {
		const l = new Leaf({
			styles: new LeafStyles({
				underline: true
			})
		});

		applyCaretStyle(l.styles);
		expect(CaretStyle.bold).to.be.false;
		expect(CaretStyle.italic).to.be.false;
		expect(CaretStyle.underline).to.be.true;
		done();
	});

	it('Set the LeafStyles for a Leaf from CaretStyle', function(done) {
		const l = new Leaf();

		setLeafStyles(l, CaretStyle);
		expect(l.styles.bold).to.be.false;
		expect(l.styles.italic).to.be.false;
		expect(l.styles.underline).to.be.true;
		done();
	});

});

/*
	applyLeafText
	appendAndGrow
	shatterAndInsert
	removeAndAppend
	applyBranchText
*/

describe('Node Action Ops w/ undo and redo', function() {

	describe('applyLeafText', function() {
		
		describe('Remove the entire Leaf (single child)', function() {

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

				setParentLink(n1, null);

				setParentLink(l1, n1);

				n1.new = false;

				l1.new = false;

				done();
			});
			
			it('Remove', function(done) {
				applyLeafText(l1, [0, l1.text.length], '');

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

				done();
			});

		});

		describe('Remove the entire Leaf (between two Leaves of same styles)', function() {

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
				applyLeafText(l2, [0, l2.text.length], '');
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

				done();
			});

		});

		describe('Type in a bold zeroLeaf', function() {

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

				setParentLink(n1, null);

				setParentLink(l1, n1);

				n1.new = false;

				l1.new = false;

				done();
			});

			it('Type "H"', function(done) {
				applyLeafText(l1, [0, 0], 'H');

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

				done();
			});

			it('Type "i" after "H"', function(done) {
				applyLeafText(l1, [1, 1], 'i');

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

				done();
			});

			it('Type "x" between "H" and "i"', function(done) {
				// Selection changed
				readyTempHistorySteps();

				applyLeafText(l1, [1, 1], 'x');

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

				done();
			});

			it('Undo two times', function(done) {
				// Undo
				readyTempHistorySteps();
				expect(History.stackPast.length).to.equal(2);
				expect(History.stackFuture.length).to.equal(0);
				undo();

				// Undo
				readyTempHistorySteps();
				expect(History.stackPast.length).to.equal(1);
				expect(History.stackFuture.length).to.equal(1);
				undo();

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

				done();
			});

		});

	});

	describe('appendAndGrow', function() {

		describe('Delegate function to applyLeafText()', function() {

			const l1 = new Leaf({ text: 'Hello world!' });

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
				
				setParentLink(n1, null);

				setParentLink(l1, n1);

				n1.new = false;

				l1.new = false;

				done();
			});

			it('Replace "world" with "darkness', function(done) {
				// Update CaretStyle
				applyCaretStyle(l1.styles);

				const selections = [{
					leaf: l1,
					range: [6, 11]
				}, {
					leaf: l1,
					range: [6, 11]
				}];
				const replacement = 'darkness';
				appendAndGrow(selections, replacement);

				expect(l1.text).to.equal('Hello darkness!');
				done();
			});

			it('Undo', function(done) {
				// Undo
				readyTempHistorySteps();
				undo();

				expect(l1.text).to.equal('Hello world!');
				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				expect(l1.text).to.equal('Hello darkness!');
				done();
			});

		});

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
				
				setParentLink(n1, null);

				setParentLink(l1, n1);

				n1.new = false;

				l1.new = false;

				done();
			});

			it('Insert bold "my " between "Hello " with "friend!"', function(done) {
				// Apply new CaretStyle
				applyCaretStyle({ bold: true });

				const selections = [{
					leaf: l1,
					range: [6, 6]
				}, {
					leaf: l1,
					range: [6, 6]
				}];
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
				cl = cl.nextLeaf;
				expect(cl.text).to.equal('friend!');
				expect(cl.new).to.be.true;
				expect(cl.styles.bold).to.be.false;
				cl.new = false;
				expect(cl.nextLeaf).to.equal(null);

				done();
			});

			it('Undo', function(done) {
				// Undo
				readyTempHistorySteps();
				undo();
				
				let cl = n1.firstChild;
				expect(cl).to.equal(l1);
				expect(cl.text).to.equal('Hello friend!');

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
				cl = cl.nextLeaf;
				expect(cl.text).to.equal('friend!');
				expect(cl.styles.bold).to.be.false;
				expect(cl.nextLeaf).to.equal(null);

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

			it('Replace "world!" and "Faster" with ""', function(done) {
				// Update CaretStyle
				applyCaretStyle(l1.styles);

				const selections = [{
					leaf: l1,
					range: [6, l1.text.length]
				}, {
					leaf: l2,
					range: [0, 6]
				}];
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
					cl.new = false;

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
				// Update CaretStyle
				applyCaretStyle(l1.styles);

				const selections = [{
					leaf: l1,
					range: [0, 5]
				}, {
					leaf: l1,
					range: [0, 5]
				}];
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
					cn = cn.nextNode;
					expect(cn).to.equal(n3);

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
					cn = cn.nextNode;
					expect(cn).to.equal(n3);

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
				const selections = [{
					leaf: l2,
					range: [1, l2.text.length]
				}, {
					leaf: l4,
					range: [0, l4.text.length]
				}];

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
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						cn = cn.firstChild;
						expect(cn).to.equal(n6);
						expect(cn.prevNode).to.equal(null);
						expect(cn.nextNode).to.equal(null);
							cl = cn.firstChild;
							expect(cl).to.equal(l5);

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
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						cn = cn.firstChild;
						expect(cn).to.equal(n6);
						expect(cn.prevNode).to.equal(null);
						expect(cn.nextNode).to.equal(null);
							cl = cn.firstChild;
							expect(cl).to.equal(l5);

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

				const selections = [{
					leaf: l2,
					range: [1, 3]
				}, {
					leaf: l2,
					range: [1, 3]
				}];

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
						cl.new = false;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild).to.equal(l3);

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
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild).to.equal(l3);

				done();
			});

		});

	});

	describe('shatterAndInsert', function() {

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

					const selections = [{
						leaf: l2,
						range: [0, l2.text.length]
					}, {
						leaf: l2,
						range: [0, l2.text.length]
					}];

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
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(null);

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

					const selections = [{
						leaf: l1,
						range: [0, 1]
					}, {
						leaf: l1,
						range: [0, 1]
					}];

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

					const selections = [{
						leaf: l1,
						range: [1, l1.text.length]
					}, {
						leaf: l2,
						range: [0, l2.text.length]
					}];

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
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						expect(cn.firstChild).to.equal(l3);

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
					cn = cn.nextNode;
					expect(cn).to.equal(n3);
						expect(cn.firstChild).to.equal(l3);

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

					const selections = [{
						leaf: l1,
						range: [2, 2]
					}, {
						leaf: l1,
						range: [2, 2]
					}];

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

					const selections = [{
						leaf: l1,
						range: [0, l1.text.length]
					}, {
						leaf: l3,
						range: [0, l3.text.length]
					}];

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
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild.text).to.equal('Leaf 4');
						expect(cn.firstChild.styles.bold).to.be.true;
						expect(cn.firstChild.new).to.be.true;
						cn.firstChild.new = false;
					expect(cn.nextNode).to.equal(null);

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
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						expect(cn.firstChild.text).to.equal('Leaf 4');
						expect(cn.firstChild.styles.bold).to.be.true;
					expect(cn.nextNode).to.equal(null);

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

					const selections = [{
						leaf: l2,
						range: [2, l2.text.length]
					}, {
						leaf: l4,
						range: [0, l4.text.length]
					}];

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
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(null);

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

					const selections = [{
						leaf: l1,
						range: [3, l1.text.length]
					}, {
						leaf: l2,
						range: [0, 4]
					}];

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

					const selections = [{
						leaf: l1,
						range: [0, l1.text.length]
					}, {
						leaf: l4,
						range: [0, l4.text.length]
					}];

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
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(null);

					done();
				});

			});

		});

	});

	describe('removeAndAppend', function() {

		describe('startLeaf and endLeaf are the same Leaf', function() {

			describe('Flag is "Newline"', function() {

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
					const selections = [{
						leaf: l1,
						range: [1, 3]
					}, {
						leaf: l1,
						range: [1, 3]
					}];
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
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							expect(cn.firstChild).to.equal(l2);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

					done();
				});

				it('"Newline" at the beginning of l2', function(done) {
					readyTempHistorySteps();

					const flag = _NEWLINE_;
					const selections = [{
						leaf: l2,
						range: [0, 0]
					}, {
						leaf: l2,
						range: [0, 0]
					}];
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
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

					done();
				});

				it('"Newline" at n3', function(done) {
					readyTempHistorySteps();

					const flag = _NEWLINE_;
					const selections = [{
						leaf: n3.firstChild,
						range: [0, 0]
					}, {
						leaf: n3.firstChild,
						range: [0, 0]
					}];
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
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('Leaf 2');
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('Leaf 2');
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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
							expect(cn.firstChild).to.equal(l2);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(n3.nodeType);
						result = sameNodeStyles(cn, n3);
						expect(result).to.be.true;
							expect(cn.firstChild.text).to.equal('Leaf 2');
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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

				it('"Backspace" in a Leaf', function(done) {
					const flag = _BACKSPACE_;
					const selections = [{
						leaf: l4,
						range: [1, 1]
					}, {
						leaf: l4,
						range: [1, 1]
					}];
					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);

					done();
				});

				it('"Backspace" at the beginning of a Leaf', function(done) {
					const flag = _BACKSPACE_;
					const selections = [{
						leaf: l4,
						range: [0, 0]
					}, {
						leaf: l4,
						range: [0, 0]
					}];
					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					done();
				});

				it('"Backspace" at the beginning of a LeafChain', function(done) {
					readyTempHistorySteps();

					const flag = _BACKSPACE_;
					const selections = [{
						leaf: l2,
						range: [0, 0]
					}, {
						leaf: l2,
						range: [0, 0]
					}];
					removeAndAppend(selections, flag);

					let cn = n2;
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 1Leaf 2');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(null);

					done();
				});

				it('"Backspace" in an empty Node', function(done) {
					readyTempHistorySteps();

					const flag = _BACKSPACE_;
					const selections = [{
						leaf: l5,
						range: [0, 0]
					}, {
						leaf: l5,
						range: [0, 0]
					}];
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
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(n5);

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
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(null);

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

				it('"Delete" in a Leaf', function(done) {
					const flag = _DELETE_;
					const selections = [{
						leaf: l3,
						range: [l3.text.length - 1, l3.text.length - 1]
					}, {
						leaf: l3,
						range: [l3.text.length - 1, l3.text.length - 1]
					}];
					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('Leaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					done();
				});

				it('"Delete" at the end of a Leaf', function(done) {
					const flag = _DELETE_;
					const selections = [{
						leaf: l3,
						range: [l3.text.length, l3.text.length]
					}, {
						leaf: l3,
						range: [l3.text.length, l3.text.length]
					}];
					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					done();
				});

				it('"Delete" at the end of a LeafChain', function(done) {
					readyTempHistorySteps();

					const flag = _DELETE_;
					const selections = [{
						leaf: l4,
						range: [l4.text.length, l4.text.length]
					}, {
						leaf: l4,
						range: [l4.text.length, l4.text.length]
					}];
					removeAndAppend(selections, flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 5');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(null);

					done();
				});

				it('"Delete" in an empty Node', function(done) {
					readyTempHistorySteps();

					const flag = _DELETE_;
					const selections = [{
						leaf: l2,
						range: [0, 0]
					}, {
						leaf: l2,
						range: [0, 0]
					}];
					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							expect(cn.firstChild).to.equal(l1);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(n5);

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
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('Leaf 5');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(null);

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
					const selections = [{
						leaf: l3,
						range: [2, l3.text.length]
					}, {
						leaf: l4,
						range: [0, 3]
					}];
					removeAndAppend(selections, flag);

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Le');
						expect(cl.new).to.be.true;
						cl.new = false;
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('f 4');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					done();
				});

				it('Backspace LeafChain in n4', function(done) {
					readyTempHistorySteps();

					const flag = _BACKSPACE_;
					const selections = [{
						leaf: n4.firstChild,
						range: [0, n4.firstChild.text.length]
					}, {
						leaf: n4.firstChild.nextLeaf,
						range: [0, n4.firstChild.nextLeaf.text.length]
					}];
					removeAndAppend(selections, flag);

					let cn = n1;
					cn = cn.nextNode;
					expect(cn).to.equal(n4);
						let cl = cn.firstChild;
						let result = isZeroLeaf(cl);
						expect(result).to.be.true;
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

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
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('f 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

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
					expect(cn.nextNode).to.equal(n5);

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
					const selections = [{
						leaf: l3,
						range: [2, l3.text.length]
					}, {
						leaf: l4,
						range: [0, l4.text.length]
					}];
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
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

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
					expect(cn.nextNode).to.equal(n5);

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
					const selections = [{
						leaf: l1,
						range: [5, l1.text.length]
					}, {
						leaf: l3,
						range: [0, 5]
					}];
					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('Leaf 3');
							expect(cl.new).to.be.true;
							cl.new = false;
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

					done();
				});

				it('Delete n2 to l5', function(done) {
					readyTempHistorySteps();

					const flag = _DELETE_;
					const selections = [{
						leaf: n2.firstChild,
						range: [0, n2.firstChild.text.length]
					}, {
						leaf: l5,
						range: [0, l5.text.length]
					}];
					removeAndAppend(selections, flag);

					let cn = n1;
						cn = cn.firstChild;
						expect(cn).to.equal(n2);
							let cl = cn.firstChild;
							let result = isZeroLeaf(cl);
							expect(result).to.be.true;
							expect(cl.new).to.be.true;
							cl.new = false;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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
							cl = cl.nextLeaf;
							expect(cl.text).to.equal('Leaf 4');
							expect(cl.styles.bold).to.be.true;
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

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
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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
					const selections = [{
						leaf: l2,
						range: [0, 0]
					}, {
						leaf: l4,
						range: [0, 4]
					}];
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
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

					done();
				});

				it('"Newline" from "4" in n3.nextNode.firstChild to n5', function(done) {
					readyTempHistorySteps();

					const flag = _NEWLINE_;
					const selections = [{
						leaf: n3.nextNode.firstChild,
						range: [1, 2]
					}, {
						leaf: l5,
						range: [0, l5.text.length]
					}];
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
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

					done();
				});

				it('"Newline" from n3 to the end of the NodeChain', function(done) {
					readyTempHistorySteps();

					const flag = _NEWLINE_;
					const selections = [{
						leaf: l2,
						range: [0, 0]
					}, {
						leaf: n3.nextNode.nextNode.firstChild,
						range: [0, 0]
					}];
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
							expect(cl.nextLeaf).to.equal(null);
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);

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
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

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
						expect(cn.nextNode).to.equal(null);
					cn = cn.parent;
					expect(cn.nextNode).to.equal(null);

					done();
				});

			});

		});

	});

	describe('applyBranchText', function() {

		describe('Append + Grow', function() {

			describe('Replacement is non-empty "pure string"', function() {

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

				it('Replace "world!" and "Faster" with ""', function(done) {
					// Update CaretStyle
					applyCaretStyle(l1.styles);

					const selections = [{
						leaf: l1,
						range: [6, l1.text.length]
					}, {
						leaf: l2,
						range: [0, 6]
					}];
					const replacement = ' ';
					applyBranchText(selections, replacement);

					let cn = n1;
						let cl = n1.firstChild;
						expect(cl.prevLeaf).to.equal(null);
						expect(cl.text).to.equal('Hello   than light.');
						expect(cl.new).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
						expect(cl.parent).to.equal(cn);
						cl.new = false;

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
						cl.new = false;

					done();
				});

			});

			describe('Replace is "LeafChain"', function() {

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
					const selections = [{
						leaf: l2,
						range: [1, l2.text.length]
					}, {
						leaf: l4,
						range: [0, l4.text.length]
					}];

					const nl1 = new Leaf({ text: 'no', styles: new LeafStyles({ bold: true }) });
					const nl2 = new Leaf({ text: ' man' });
					const nl3 = new Leaf({ text: ' sky', styles: new LeafStyles({ italic: true }) });
					chainLeaf(nl2, nl1);
					chainLeaf(nl3, nl2);
					const replacement = new LeafChain({ startLeaf: nl1, endLeaf: nl3 });
					applyBranchText(selections, replacement);

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
							expect(cl.nextLeaf).to.equal(null);
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cn = cn.firstChild;
							expect(cn).to.equal(n6);
							expect(cn.prevNode).to.equal(null);
							expect(cn.nextNode).to.equal(null);
								cl = cn.firstChild;
								expect(cl).to.equal(l5);

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
						cn = cn.nextNode;
						expect(cn).to.equal(n3);
							cn = cn.firstChild;
							expect(cn).to.equal(n6);
							expect(cn.prevNode).to.equal(null);
							expect(cn.nextNode).to.equal(null);
								cl = cn.firstChild;
								expect(cl).to.equal(l5);

					done();
				});

			});

			describe('startLeaf in selections is zero-leaf whose BT is not [0]', function() {

				const l1 = new Leaf();
				const l2 = new Leaf({ text: 'Leaf 2' });

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

				it('Replace empty Leaf whose branch type is [4]', function(done) {
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

					const selections = [{
						leaf: l1,
						range: [0, 0]
					}, {
						leaf: l1,
						range: [0, 0]
					}];

					applyBranchText(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('ll1');
						let result = cl === ll1;
						expect(result).to.be.false; // ll1 is merged with appendAfter which is zeroLeaf
						expect(cl.new).to.be.true;
						cl.new = false;
						cl = cl.nextLeaf;
						expect(cl).to.equal(ll2);
						expect(cl.text).to.equal('ll2');
						expect(cl.styles.bold).to.be.true;
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n1.nodeType);
					result = sameNodeStyles(cn, n1);
					expect(result).to.be.true;
					expect(cn.new).to.be.true;
					cn.new = false;
						cl = cn.firstChild;
						expect(cl).to.equal(ll3);
						result = isZeroLeaf(cl);
						expect(result).to.be.true;
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n1.nodeType);
					result = sameNodeStyles(cn, n1);
					expect(result).to.be.true;
					expect(cn.new).to.be.true;
					cn.new = false;
						cl = cn.firstChild;
						result = cl === ll4;
						expect(result).to.be.false; // ll4 is merged with appendAfter which is zeroLeaf
						expect(cl.text).to.equal('ll4');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n2);

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
						let result = isZeroLeaf(cl);
						expect(result).to.be.true;
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
							expect(cl.text).to.equal('Leaf 2');
							expect(cl.nextLeaf).to.equal(null);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
						let cl = cn.firstChild;
						expect(cl.text).to.equal('ll1');
						cl = cl.nextLeaf;
						expect(cl.text).to.equal('ll2');
						expect(cl.styles.bold).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n1.nodeType);
					let result = sameNodeStyles(cn, n1);
					expect(result).to.be.true;
						cl = cn.firstChild;
						result = isZeroLeaf(cl);
						expect(result).to.be.true;
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(n1.nodeType);
					result = sameNodeStyles(cn, n1);
					expect(result).to.be.true;
						cl = cn.firstChild;
						expect(cl.text).to.equal('ll4');
						expect(cl.nextLeaf).to.equal(null);
					cn = cn.nextNode;
					expect(cn).to.equal(n2);

					done();
				});

			});

			describe('Replacement is "NodeChain", and same first NodeType', function() {

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

					const selections = [{
						leaf: l2,
						range: [1, 3]
					}, {
						leaf: l2,
						range: [1, 3]
					}];

					applyBranchText(selections, replacement);

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
							cl.new = false;
						cn = cn.nextNode;
						expect(cn).to.equal(n4);
							expect(cn.firstChild).to.equal(l3);

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
						cn = cn.nextNode;
						expect(cn).to.equal(n4);
							expect(cn.firstChild).to.equal(l3);

					done();
				});

			});

		});

		describe('Shatter + Insert', function() {

			describe('startLeaf in selections is zero-leaf whose BT is [0]', function() {

				const l1 = new Leaf();
				const l2 = new Leaf({ text: 'Leaf 2' });

				const n1 = new Node({ nodeType: 0 });
				const n2 = new Node({ nodeType: 1 });
					const n3 = new Node({ nodeType: 2 });

				/*
					(root)---(0)---<l1>
							 |
							 (1)---(2)---<l2>
				*/
				before(function(done) {
					DocumentRoot.firstChild = null;
					History.clear(_PAST_STACK_);
					History.clear(_FUTURE_STACK_);
					TempHistoryPastStep.clear();
					TempHistoryFutureStep.clear();
					
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

				it('Replace in an empty [0] Leaf with a NodeChain', function(done) {
					const ll1 = new Leaf({ text: 'll1' });
					const ll2 = new Leaf({ text: 'll2' });

					const nn1 = new Node({ nodeType: 1 });
						const nn2 = new Node({ nodeType: 2 });
						const nn3 = new Node({ nodeType: 2 });

					setParentLink(nn2, nn1);
					chainNode(nn3, nn2);

					setParentLink(ll1, nn2);
					setParentLink(ll2, nn3);

					const replacement = new NodeChain({ startNode: nn1, endNode: nn1 });

					const selections = [{
						leaf: l1,
						range: [0, 0]
					}, {
						leaf: l1,
						range: [0, 0]
					}];

					applyBranchText(selections, replacement);

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(nn1);
					expect(cn.nodeType).to.equal(1);
					expect(cn.new).to.be.true;
					cn.new = false;
						cn = cn.firstChild;
						expect(cn).to.equal(nn2);
						expect(cn.nodeType).to.equal(2);
						expect(cn.new).to.be.true;
						cn.new = false;
							let cl = cn.firstChild;
							expect(cl).to.equal(ll1);
							expect(cl.text).to.equal('ll1');
							expect(cl.new).to.be.true;
							cl.new = false;
						cn = cn.nextNode;
						expect(cn).to.equal(nn3);
						expect(cn.nodeType).to.equal(2);
						expect(cn.new).to.be.true;
						cn.new = false;
							cl = cn.firstChild;
							expect(cl).to.equal(ll2);
							expect(cl.text).to.equal('ll2');
							expect(cl.new).to.be.true;
							cl.new = false;
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n2);

					done();
				});

				it('Undo', function(done) {
					// Undo
					readyTempHistorySteps();
					undo();

					let cn = DocumentRoot.firstChild;
					expect(cn).to.equal(n1);
					expect(cn.nodeType).to.equal(0);
						let cl = n1.firstChild;
						expect(cl.prevLeaf).to.equal(null);
						expect(cl).to.equal(l1);
						let result = isZeroLeaf(cl);
						expect(result).to.be.true;
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
							expect(cl.text).to.equal('Leaf 2');
							expect(cl.nextLeaf).to.equal(null);

					done();
				});

				it('Redo', function(done) {
					// Redo
					readyTempHistorySteps();
					redo();

					let cn = DocumentRoot.firstChild;
					expect(cn.nodeType).to.equal(1);
						cn = cn.firstChild;
						expect(cn.nodeType).to.equal(2);
							let cl = cn.firstChild;
							expect(cl.text).to.equal('ll1');
						cn = cn.nextNode;
						expect(cn.nodeType).to.equal(2);
							cl = cn.firstChild;
							expect(cl.text).to.equal('ll2');
					cn = cn.parent;
					cn = cn.nextNode;
					expect(cn).to.equal(n2);

					done();
				});

			});

			describe('startLeaf is not zero-leaf, and replacement is "NodeChain" with different first NodeType', function() {

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

					const selections = [{
						leaf: l2,
						range: [0, l2.text.length]
					}, {
						leaf: l2,
						range: [0, l2.text.length]
					}];

					applyBranchText(selections, replacement);

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
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(null);

					done();
				});

			});

		});

		describe('Remove + Append', function() {

			describe('Replacement is empty "pure string"', function() {

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

				it('"Backspace" in a Leaf', function(done) {
					const flag = _BACKSPACE_;
					const selections = [{
						leaf: l4,
						range: [1, 1]
					}, {
						leaf: l4,
						range: [1, 1]
					}];
					applyBranchText(selections, '', flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf 3');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);

					done();
				});

				it('"Backspace" at the beginning of a Leaf', function(done) {
					const flag = _BACKSPACE_;
					const selections = [{
						leaf: l4,
						range: [0, 0]
					}, {
						leaf: l4,
						range: [0, 0]
					}];
					applyBranchText(selections, '', flag);

					let cn = n4;
						let cl = cn.firstChild;
						expect(cl).to.equal(l3);
						expect(cl.text).to.equal('Leaf ');
						cl = cl.nextLeaf;
						expect(cl).to.equal(l4);
						expect(cl.text).to.equal('eaf 4');
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(n5);

					done();
				});

				it('"Backspace" at the beginning of a LeafChain', function(done) {
					readyTempHistorySteps();

					const flag = _BACKSPACE_;
					const selections = [{
						leaf: l2,
						range: [0, 0]
					}, {
						leaf: l2,
						range: [0, 0]
					}];
					applyBranchText(selections, '', flag);

					let cn = n2;
						let cl = cn.firstChild;
						expect(cl.text).to.equal('Leaf 1Leaf 2');
						expect(cl.new).to.be.true;
						cl.new = false;
						expect(cl.nextLeaf).to.equal(null);
					expect(cn.nextNode).to.equal(null);

					done();
				});

				it('"Backspace" in an empty Node', function(done) {
					readyTempHistorySteps();

					const flag = _BACKSPACE_;
					const selections = [{
						leaf: l5,
						range: [0, 0]
					}, {
						leaf: l5,
						range: [0, 0]
					}];
					applyBranchText(selections, '', flag);

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
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(n5);

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
					expect(cn.nextNode).to.equal(null);

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
					expect(cn.nextNode).to.equal(null);

					done();
				});
			});

		});

	});

});
