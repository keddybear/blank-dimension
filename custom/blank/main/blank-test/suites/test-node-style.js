/* eslint-disable */
import { Node, NodeStyles, NullNode, NodeChain, NodeType, BranchType, PhantomNode, PhantomChain, DocumentRoot } from '../../node';
import { Leaf, LeafStyles, NullLeaf, LeafChain, LeafText, ParentLink } from '../../leaf';
import { History, BlankHistoryStep } from '../../history';
import { instanceOf, BlankFlags } from '../../utils';
import {
	sameNodeStyles,
	setNodeStyles,
	copyNodeStyles,
	getNextLeafChain,
	findNextLeafChain,
	getBranchType,
	getBranchTypeFromArray,
	compareBranchType,
	unchainNode,
	chainedNodes,
	setParentLink,
	setParentNode,
	removeNode,
	detachFirstChild,
	detachParentNode,
	switchParentNode,
	chainNode,
	chainNodeChainBetween,
	rechainNode,
	createNewBranchAt,
	shatter,
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
	undo,
	redo,
	applyBranchType,
	applyNodeStyle,
	applyNodesStyle
} from '../../integration';
import { expect } from 'chai';

BlankFlags.DISABLE_RENDER = true;

describe('Basic Node Ops', function() {

/*
	sameNodeStyles
	setNodeStyles
	copyNodeStyles
	getNextLeafChain
	findNextLeafChain
	getBranchType
	getBranchTypeFromArray
	compareBranchType
*/
	
	describe('sameNodeStyles', function() {

		it('NodeStyle identity check', function(done) {
			const style = new NodeStyles();
			let result = instanceOf(style, 'NodeStyles');
			expect(result).to.be.true;
			done();
		});

		it('Two Nodes with same styles', function(done) {
			const style1 = new NodeStyles({
				fontFamily: 1,
				fontSize: '18px',
				lineHeight: '1.8em'
			});
			const style2 = new NodeStyles({
				fontFamily: 1,
				fontSize: '18px',
				lineHeight: '1.8em'
			});
			const n1 = new Node({
				styles: style1
			});
			const n2 = new Node({
				styles: style2
			});
			let result = sameNodeStyles(n1, n2);
			expect(result).to.be.true;
			done();
		});

		it('Two Nodes with different styles', function(done) {
			const style1 = new NodeStyles({
				fontFamily: 1,
				fontSize: '18px',
				lineHeight: '1.8em'
			});
			const style2 = new NodeStyles({
				fontFamily: 1,
				fontSize: '16px',
				lineHeight: '1.8em'
			});
			const n1 = new Node({
				styles: style1
			});
			const n2 = new Node({
				styles: style2
			});
			let result = sameNodeStyles(n1, n2);
			expect(result).to.be.false;
			done();
		});

		it('Compare the same Nodes', function(done) {
			const style1 = new NodeStyles({
				fontFamily: 1,
				fontSize: '18px',
				lineHeight: '1.8em'
			});
			const n1 = new Node({
				styles: style1
			});
			let result = sameNodeStyles(n1, n1);
			expect(result).to.be.true;
			done();
		});

	});

	describe('setNodeStyles', function() {

		const n1 = new Node();
		const n2 = new Node();

		it('Set n1 text alignment to 3', function(done) {
			expect(n1.styles).to.equal(null);
			const style1 = new NodeStyles({
				textAlignment: 3
			});
			setNodeStyles(n1, style1);
			const { styles } = n1;
			let result = instanceOf(styles, 'NodeStyles');
			expect(result).to.be.true;
			expect(styles.textAlignment).to.equal(3);
			expect(styles.fontSize).to.equal('16px');
			// setNodeStyles should create a new NodeStyles
			result = style1 === styles;
			expect(result).to.be.false;
			done();
		});

		it('Overwrite NodeStyles with fontSize 36px', function(done) {
			const style2 = new NodeStyles({
				fontSize: '36px'
			});
			setNodeStyles(n1, style2);
			const { styles } = n1;
			expect(styles.fontSize).to.equal('36px');
			expect(styles.textAlignment).to.equal(0);
			done();
		});

		it('Set n2 with fontSize 36px, and compare it with n1', function(done) {
			const style3 = new NodeStyles({
				fontSize: '36px'
			});
			setNodeStyles(n2, style3);
			let result = sameNodeStyles(n1, n2);
			expect(result).to.be.true;
			result = n1.styles === n2.styles;
			expect(result).to.be.false;
			done();
		});

	});

	describe('copyNodeStyles', function() {

		it('Set n1 with fontFamily 1, and copy it to n2', function(done) {
			const n1 = new Node({
				styles: new NodeStyles({
					fontFamily: 1
				})
			});
			const n2 = new Node();

			expect(n1.styles.fontFamily).to.equal(1);
			expect(n2.styles).to.equal(null);
			copyNodeStyles(n2, n1);
			expect(n2.styles.fontFamily).to.equal(1);
			done();
		});

		it('Compare n1 styles with n2 styles', function(done) {
			const n1 = new Node({
				styles: new NodeStyles({
					fontFamily: 1
				})
			});
			const n2 = new Node();

			copyNodeStyles(n2, n1);
			let result = sameNodeStyles(n1, n2);
			expect(result).to.be.true;
			result = n1.styles === n2.styles;
			expect(result).to.be.false;
			done();
		});

		it('Copy NodeStyles from a Node whose styles is null', function(done) {
			const n1 = new Node();
			const n2 = new Node({
				styles: new NodeStyles({
					fontFamily: 2
				})
			});

			copyNodeStyles(n2, n1);
			let result = sameNodeStyles(n1, n2);
			expect(result).to.be.true;
			expect(n2.styles).to.equal(null);
			done();
		});

	});

	describe('getNextLeafChain & findNextLeafChain & getBranchType', function() {

		const l1 = new Leaf({
			text: 'First item'
		});

		const l2 = new Leaf({
			text: 'Second item'
		});

		const l3 = new Leaf({
			text: 'First paragraph'
		});

		const n1 = new Node({
			nodeType: 1
		});

		const n2 = new Node({
			nodeType: 2
		})

		const n3 = new Node({
			nodeType: 2
		})

		const n4 = new Node();

		before(function(done) {
			/*
				(root)---(n1)---(n2)---<l1>
				         |      |
				         |      (n3)---<l2>
	                     |
	                     (n4)---<l3>
			*/
			const doc = DocumentRoot;
			// Manually chain
			doc.firstChild = n1;
			// n1 - n2
			n1.firstChild = n2;
			n2.parent = n1;
			// n2 - l1
			n2.firstChild = l1;
			l1.parent = n2;
			// n2 - n3
			n2.nextNode = n3;
			n3.prevNode = n2;
			// n3 - l2
			n3.firstChild = l2;
			l2.parent = n3
			// n1 - n3
			n3.parent = n1;
			// n1 - n4
			n1.nextNode = n4;
			n4.prevNode = n1;
			// n4 - l3
			n4.firstChild = l3;
			l3.parent = n4;

			done();
		});
		
		it('Keep GETTING next LeafChain, starting from l1', function(done) {
			let next = getNextLeafChain(l1);
			expect(next).to.equal(l2);
			next = getNextLeafChain(next);
			expect(next).to.equal(l3);
			next = getNextLeafChain(next);
			expect(next).to.equal(null);
			done();
		});

		it('Get l1 BranchType', function(done) {
			const bt = getBranchType(l1);
			expect(bt.branch.length).to.equal(2);
			expect(bt.branch[0].type).to.equal(1);
			expect(bt.branch[0].ref).to.equal(n1);
			expect(bt.branch[1].type).to.equal(2);
			expect(bt.branch[1].ref).to.equal(n2);
			done();
		});

		it('Keep FINDING next LeafChain, starting from 1l', function(done) {
			let bt = getBranchType(l1); // bt will be modified
			let next = findNextLeafChain(l1, bt);
			expect(next).to.equal(l2);
			expect(bt.branch.length).to.equal(2);
			expect(bt.branch[0].type).to.equal(1);
			expect(bt.branch[0].ref).to.equal(n1);
			expect(bt.branch[1].type).to.equal(2);
			expect(bt.branch[1].ref).to.equal(n3);

			next = findNextLeafChain(next, bt);
			expect(next).to.equal(l3);
			expect(bt.branch.length).to.equal(1);
			expect(bt.branch[0].type).to.equal(0);
			expect(bt.branch[0].ref).to.equal(n4);

			done();
		})

	});

	describe('getBranchTypeFromArray & compareBranchType', function() {
		
		it('Get BranchType from [1, 2, 3]', function(done) {
			const bt = getBranchTypeFromArray([1,2,3]);
			const b = bt.branch;
			expect(b.length).to.equal(3);
			expect(b[0].type).to.equal(1);
			expect(b[0].ref).to.equal(null);
			expect(b[1].type).to.equal(2);
			expect(b[2].type).to.equal(3);
			done();
		});

		it('Shallow compare BT [0, 1, 2] with [0, 2, 3], expect index 1', function(done) {
			const bt1 = getBranchTypeFromArray([0,1,2]);
			const bt2 = getBranchTypeFromArray([0,2,3]);
			let index = compareBranchType(bt1, bt2);
			expect(index).to.equal(1);
			done();
		});

		it('Shallow compare BT [0, 2, 3, 4] with [0, 2, 3], expect index 2', function(done) {
			const bt1 = getBranchTypeFromArray([0,2,3,4]);
			const bt2 = getBranchTypeFromArray([0,2,3]);
			let index = compareBranchType(bt1, bt2);
			expect(index).to.equal(2);
			done();
		});

		it('Shallow compare BT [0, 1, 2] with [0, 1, 2], expect index -1', function(done) {
			const bt1 = getBranchTypeFromArray([0,1,2]);
			const bt2 = getBranchTypeFromArray([0,1,2]);
			let index = compareBranchType(bt1, bt2);
			expect(index).to.equal(-1);
			done();
		});

	});

});

describe('Basic Node Chaining Ops', function() {

/*
	unchainNode
	chainedNodes
	setParentLink
	setParentNode
*/

	describe('unchainNode', function() {

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			done();
		})
		
		it('Unchain a Node into past', function(done) {
			const n = new Node();
			unchainNode(n, _PAST_STACK_);
			const pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			expect(pastStep[0]).to.equal(n);
			done();
		});

		it('Unchain a NodeStyles into future', function(done) {
			const s = new NodeStyles();
			unchainNode(s, _FUTURE_STACK_);
			const futureStep = TempHistoryFutureStep.stack;
			expect(futureStep.length).to.equal(1);
			expect(futureStep[0]).to.equal(s);
			done();
		});

	});

	describe('chainedNodes', function() {

		it('n1 is chained before n2', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			n1.nextNode = n2;
			n2.prevNode = n1;
			expect(chainedNodes(n1, n2)).to.equal(_CHAINED_BEFORE_);
			done();
		});

		it('n1 is chained after n2', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			n1.prevNode = n2;
			n2.nextNode = n1;
			expect(chainedNodes(n1, n2)).to.equal(_CHAINED_AFTER_);
			done();
		});

		it('n1 is not chained after or before n2', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			expect(chainedNodes(n1, n2)).to.equal(_NOT_CHAINED_);
			done();
		});

		it('n1 is the same as n2', function(done) {
			const n1 = new Node();
			const n2 = n1;
			expect(chainedNodes(n1, n2)).to.equal(_NOT_CHAINED_);
			done();
		});

	});

	describe('setParentLink & setParentNode', function() {
		
		it('Set the parent link of a LeafChain', function(done) {
			const l1 = new Leaf({
				text: 'A',
				styles: new LeafStyles({
					bold: true
				})
			});
			const l2 = new Leaf({
				text: 'B'
			});
			const l3 = new Leaf({
				text: 'C',
				styles: new LeafStyles({
					bold: true
				})
			});
			l1.nextLeaf = l2;
			l2.prevLeaf = l1;
			l2.nextLeaf = l3;
			l3.prevLeaf = l2;

			const n = new Node();

			setParentLink(l1, n);
			expect(n.firstChild).to.equal(l1);
			expect(l1.parent).to.equal(n);
			expect(l2.parent).to.equal(n);
			expect(l3.parent).to.equal(n);

			done();
		});

		it('Set the parent link of a NodeChain', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			n1.nextNode = n2;
			n2.prevNode = n1;
			n2.nextNode = n3;
			n3.prevNode = n2;
			const n = new Node();

			setParentLink(n1, n);
			expect(n.firstChild).to.equal(n1);
			expect(n1.parent).to.equal(n);
			expect(n2.parent).to.equal(n);
			expect(n3.parent).to.equal(n);

			done();
		});

		it('Set the parent link of a non-first Node in a NodeChain, expect error thrown', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			n1.nextNode = n2;
			n2.prevNode = n1;
			n2.nextNode = n3;
			n3.prevNode = n2;
			const n = new Node();

			let e;
			try {
				setParentLink(n2, n);
			} catch (error) {
				e = error;
			} finally {
				let result = e instanceof Error;
				expect(result).to.be.true;
				console.log(e.message);
				done();
			}
		});

		it('Set the parent node of a LeafChain', function(done) {
			const l1 = new Leaf({
				text: 'A',
				styles: new LeafStyles({
					bold: true
				})
			});
			const l2 = new Leaf({
				text: 'B'
			});
			const l3 = new Leaf({
				text: 'C',
				styles: new LeafStyles({
					bold: true
				})
			});
			l1.nextLeaf = l2;
			l2.prevLeaf = l1;
			l2.nextLeaf = l3;
			l3.prevLeaf = l2;

			const n = new Node();

			setParentNode(l1, n);
			expect(n.firstChild).to.equal(null);
			expect(l1.parent).to.equal(n);
			expect(l2.parent).to.equal(n);
			expect(l3.parent).to.equal(n);

			done();
		});

		it('Set the parent node of a NodeChain', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			n1.nextNode = n2;
			n2.prevNode = n1;
			n2.nextNode = n3;
			n3.prevNode = n2;
			const n = new Node();

			setParentNode(n1, n);
			expect(n.firstChild).to.equal(null);
			expect(n1.parent).to.equal(n);
			expect(n2.parent).to.equal(n);
			expect(n3.parent).to.equal(n);

			done();
		});

		it('Set the parent node of a non-first Node in a NodeChain', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			n1.nextNode = n2;
			n2.prevNode = n1;
			n2.nextNode = n3;
			n3.prevNode = n2;
			const n = new Node();

			setParentNode(n2, n);
			expect(n.firstChild).to.equal(null);
			expect(n1.parent).to.equal(null);
			expect(n2.parent).to.equal(n);
			expect(n3.parent).to.equal(n);

			done();
		});

	});

});

describe('Advanced Node Chaining Ops', function() {

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

	describe('chainNode', function() {

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			DocumentRoot.firstChild = null;
			done();
		});

		it('Chain n1 - n2 - n3 on DocumentRoot, set them old, then chain n4 after n1', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			DocumentRoot.firstChild = n1;

			chainNode(n2, n1);
			chainNode(n3, n2);

			expect(n1.nextNode).to.equal(n2);
			expect(n2.prevNode).to.equal(n1);
			expect(n2.nextNode).to.equal(n3);
			expect(n3.prevNode).to.equal(n2);

			expect(n1.parent).to.equal(null);
			expect(n2.parent).to.equal(null);
			expect(n3.parent).to.equal(null);

			n1.new = false;
			n2.new = false;
			n3.new = false;

			const n4 = new Node();
			chainNode(n4, n1);

			expect(n1.nextNode).to.equal(n4);
			expect(n4.prevNode).to.equal(n1);
			expect(n4.nextNode).to.equal(null);
			expect(n4.parent).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			expect(step).to.equal(n2);

			done();
		});

		it('Chain n1 - n2 - n3 on n4, set them old, then chain n5 after n3', function(done) {
			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			const n4 = new Node();
			n4.firstChild = n1;
			n1.parent = n4;

			chainNode(n2, n1);
			chainNode(n3, n2);

			expect(n1.nextNode).to.equal(n2);
			expect(n2.prevNode).to.equal(n1);
			expect(n2.nextNode).to.equal(n3);
			expect(n3.prevNode).to.equal(n2);

			expect(n1.parent).to.equal(n4);
			expect(n2.parent).to.equal(n4);
			expect(n3.parent).to.equal(n4);

			n1.new = false;
			n2.new = false;
			n3.new = false;
			n4.new = false;

			const n5 = new Node();
			chainNode(n5, n3);

			expect(n3.nextNode).to.equal(n5);
			expect(n5.prevNode).to.equal(n3);
			expect(n5.nextNode).to.equal(null);
			expect(n5.parent).to.equal(n4);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			let result = step instanceof NullNode;
			expect(result).to.be.true;
			expect(step.prevNode).to.equal(n3);
			expect(step.nextNode).to.equal(null);

			done();
		});

	});

	describe('chainNodeChainBetween', function() {
		
		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			DocumentRoot.firstChild = null;
			done();
		});

		it('Chain between two Nodes on a Node', function(done) {
			const n0 = new Node();
			const n1 = new Node();
			const n2 = new Node();
			n0.firstChild = n1;
			n1.parent = n0;
			chainNode(n2, n1);
			n0.new = false;
			n1.new = false;
			n2.new = false;

			const nn1 = new Node();
			const nn2 = new Node();
			chainNode(nn2, nn1);

			chainNodeChainBetween(nn1, nn2, n1, n2);
			expect(n1.nextNode).to.equal(nn1);
			expect(nn1.prevNode).to.equal(n1);
			expect(nn1.parent).to.equal(n0);
			expect(nn2.parent).to.equal(n0);
			expect(nn2.nextNode).to.equal(n2);
			expect(n2.prevNode).to.equal(nn2);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			let result = step instanceof NullNode;
			expect(result).to.be.true;
			expect(step.prevNode).to.equal(n1);
			expect(step.nextNode).to.equal(n2);

			done();
		});

		it('Chain between null and a Node on DocumentRoot', function(done) {
			const n1 = new Node();
			DocumentRoot.firstChild = n1;
			n1.new = false;

			const nn1 = new Node();

			chainNodeChainBetween(nn1, nn1, null, n1);
			expect(nn1.parent).to.equal(null);
			expect(DocumentRoot.firstChild).to.equal(nn1);
			expect(nn1.nextNode).to.equal(n1);
			expect(n1.prevNode).to.equal(nn1);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let result = pastStep[0] instanceof NullNode;
			expect(result).to.be.true;
			let step = pastStep[0];
			expect(step.prevNode).to.equal(null);
			expect(step.nextNode).to.equal(n1);

			done();
		});

		it('Chain between a Node and null on a Node', function(done) {
			const n0 = new Node();
			const n1 = new Node();
			const n2 = new Node();
			n0.firstChild = n1;
			n1.parent = n0;
			chainNode(n2, n1);
			n0.new = false;
			n1.new = false;
			n2.new = false;

			const nn1 = new Node();
			const nn2 = new Node();
			chainNode(nn2, nn1);

			chainNodeChainBetween(nn1, nn2, n2, null);
			expect(nn1.prevNode).to.equal(n2);
			expect(nn1.parent).to.equal(n0);
			expect(nn2.parent).to.equal(n0);
			expect(nn2.nextNode).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let result = pastStep[0] instanceof NullNode;
			expect(result).to.be.true;
			let step = pastStep[0];
			expect(step.prevNode).to.equal(n2);
			expect(step.nextNode).to.equal(null);

			done();
		});

		it('Chain between two null values, expect error thrown', function(done) {
			const nn1 = new Node();
			
			let e;
			try {
				chainNodeChainBetween(nn1, nn1, null, null);
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

	describe('removeNode', function() {
		
		const n1 = new Node(); // stop node
		const n2 = new Node();
		const n3 = new Node();
		const n4 = new Node();
		const n5 = new Node();
		const n6 = new Node();
		const n7 = new Node();

		/*
			(root)---(n1)---(n2)---(n3)
			                       |
			                       (n4)---(n7)
                                   |
                                   (n5)
                                   |
                                   (n6)
		*/

		before(function(done) {
			DocumentRoot.firstChild = n1;
			n1.firstChild = n2;
			n2.parent = n1;
			n2.firstChild = n3;
			n3.parent = n2;
			chainNode(n4, n3);
			chainNode(n5, n4);
			chainNode(n6, n5);
			n4.firstChild = n7;
			n7.parent = n4;

			n1.new = false;
			n2.new = false;
			n3.new = false;
			n4.new = false;
			n5.new = false;
			n6.new = false;
			n7.new = false;

			done();
		});

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			done();
		});

		it('Remove n7, expect n4 to be removed', function(done) {
			removeNode(n7);

			expect(n3.nextNode).to.equal(n5);
			expect(n5.prevNode).to.equal(n3);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			expect(step).to.equal(n4);

			done();
		});

		it('Remove n3', function(done) {
			removeNode(n3);

			expect(n5.prevNode).to.equal(null);
			expect(n2.firstChild).to.equal(n5);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			expect(step).to.equal(n3);

			done();
		});

		it('Remove n6', function(done) {
			removeNode(n6);

			expect(n5.nextNode).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			expect(step).to.equal(n6);

			done();
		});

		it('Remove n5, stop at n1', function(done) {
			removeNode(n5, n1);

			expect(n1.firstChild).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			let result = step instanceof ParentLink;
			expect(result).to.be.true;
			expect(step.child).to.equal(n2);
			expect(step.parent).to.equal(n1);

			done();
		});

		it('Set n1 first child to be n8, remove n8, expect empty DocumentRoot', function(done) {
			const n8 = new Node();
			n1.firstChild = n8;
			n8.parent = n1;
			n8.new = false;

			removeNode(n8);

			expect(DocumentRoot.firstChild).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			let result = step instanceof ParentLink;
			expect(result).to.be.true;
			expect(step.child).to.equal(n1);
			expect(step.parent).to.equal(null);

			done();
		});

	});

	describe('detachFirstChild', function() {

		const l1 = new Leaf({
			text: 'a'
		});
		const l2 = new Leaf({
			text: 'b',
			styles: new LeafStyles({
				bold: true
			})
		});
		const l3 = new Leaf({
			text: 'c'
		});
		const n = new Node();

		before(function(done) {
			DocumentRoot.firstChild = null;
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			l1.new = false;
			l2.new = false;
			l3.new = false;
			setParentLink(l1, n);
			setParentLink(n, null); // set DocumentRoot first child
			n.new = false;
			done();
		});

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			done();
		});

		it('Detach a LeafChain, unchain a ParentLink', function(done) {
			const l = detachFirstChild(n);

			expect(n.firstChild).to.equal(null);
			expect(l).to.equal(l1);
			expect(l.parent).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			let result = step instanceof ParentLink;
			expect(result).to.be.true;
			expect(step.parent).to.equal(n);
			expect(step.child).to.equal(l1);

			done();
		});

		it('Detach null from a Node', function(done) {
			const l = detachFirstChild(n);

			expect(l).to.equal(null);
			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(0);

			done();
		});

	});

	describe('detachParentNode', function() {

		const l1 = new Leaf({
			text: 'a'
		});
		const l2 = new Leaf({
			text: 'b',
			styles: new LeafStyles({
				bold: true
			})
		});
		const l3 = new Leaf({
			text: 'c'
		});
		const n = new Node();

		before(function(done) {
			DocumentRoot.firstChild = null;
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			l1.new = false;
			l2.new = false;
			l3.new = false;
			setParentLink(l1, n);
			setParentLink(n, null); // set DocumentRoot first child
			n.new = false;
			done();
		});

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			done();
		});

		it('Detach the parent Node, unchain a ParentLink', function(done) {
			const l = detachParentNode(l1);

			expect(n.firstChild).to.equal(null);
			expect(l).to.equal(l1);
			expect(l.parent).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			let result = step instanceof ParentLink;
			expect(result).to.be.true;
			expect(step.parent).to.equal(n);
			expect(step.child).to.equal(l1);

			done();
		});

		it('Detach the parent Node from the middle of a LeafChain, expect error thrown', function(done) {
			setParentLink(l1, n);
			let e;
			try {
				const l = detachParentNode(l2);
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

	describe('switchParentNode', function() {

		const l1 = new Leaf({
			text: 'a'
		});
		const l2 = new Leaf({
			text: 'b',
			styles: new LeafStyles({
				bold: true
			})
		});
		const l3 = new Leaf({
			text: 'c'
		});
		const n1 = new Node();
		const n2 = new Node();

		before(function(done) {
			DocumentRoot.firstChild = null;
			chainNode(n2, n1);
			n1.new = false;
			n2.new = false;
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			l1.new = false;
			l2.new = false;
			l3.new = false;
			setParentLink(l1, n1);
			setParentLink(n1, null); // set DocumentRoot first child
			done();
		});

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			done();
		});

		it('Switch l1 onto n2 from n1', function(done) {
			switchParentNode(l1, n2);

			expect(n1.firstChild).to.equal(null);
			expect(n2.firstChild).to.equal(l1);
			expect(l1.parent).to.equal(n2);
			expect(l2.parent).to.equal(n2);
			expect(l3.parent).to.equal(n2);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let step = pastStep[0];
			let result = step instanceof ParentLink;
			expect(result).to.be.true;
			expect(step.parent).to.equal(n1);
			expect(step.child).to.equal(l1);

			done();
		});

	});

	describe('createNewBranchAt', function() {

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			done();
		});

		it('Create a branch at index 1 of [0, 1, 2, 3]', function(done) {
			const { first, last } = createNewBranchAt([0, 1, 2, 3], 1);
			expect(first.parent).to.equal(null);
			expect(first.nodeType).to.equal(1);
			expect(first.firstChild.nodeType).to.equal(2);
			expect(last.firstChild).to.equal(null);
			expect(last.nodeType).to.equal(3);
			expect(last.parent.nodeType).to.equal(2);
			expect(first.firstChild).to.equal(last.parent);
			done();
		});

		it('Create a branch at index 2 of [0, 0], expect error thrown', function(done) {
			let e;
			try {
				const { first, last } = createNewBranchAt([0, 0], 2);
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

	describe('rechainNode (with undo and redo)', function() {

		// Node | NullNode | NodeChain | NodeStyles | ParentLink | NodeType | PhantomChain

		describe('Rechain a Node | NullNode | NodeChain', function() {

			beforeEach(function(done) {
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				done();
			});

			it('Chain n4 after n1 of n1-n2-n3, whose parent is n0, then undo and redo', function(done) {
				const n0 = new Node();
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();

				chainNode(n2, n1);
				chainNode(n3, n2);
				setParentLink(n1, n0);

				n0.new = false;
				n1.new = false;
				n2.new = false;
				n3.new = false;

				const n4 = new Node();
				chainNode(n4, n1);
				n4.new = false;
				expect(n1.nextNode).to.equal(n4);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				expect(step).to.equal(n2);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n1.nextNode).to.equal(n2);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				step = futureStep[0];
				expect(step).to.equal(n4);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n1.nextNode).to.equal(n4);
				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				expect(step).to.equal(n2);

				done();
			});

			it('Chain n4 as a chain before n1 of n1-n2-n3, then undo and redo', function(done) {
				const n0 = new Node();
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();

				chainNode(n2, n1);
				chainNode(n3, n2);
				setParentLink(n1, n0);

				n0.new = false;
				n1.new = false;
				n2.new = false;
				n3.new = false;

				const n4 = new Node();
				chainNodeChainBetween(n4, n4, null, n1);
				n4.new = false;
				expect(n4.nextNode).to.equal(n1);
				expect(n1.prevNode).to.equal(n4);
				expect(n4.parent).to.equal(n0);
				expect(n0.firstChild).to.equal(n4);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				let result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(null);
				expect(step.nextNode).to.equal(n1);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n1.prevNode).to.equal(null);
				expect(n0.firstChild).to.equal(n1);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				step = futureStep[0];
				result = step instanceof NodeChain;
				expect(result).to.be.true;
				expect(step.startNode).to.equal(n4);
				expect(step.endNode).to.equal(n4);
				expect(step.prevNode).to.equal(null);
				expect(step.nextNode).to.equal(n1);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n1.prevNode).to.equal(n4);
				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(null);
				expect(step.nextNode).to.equal(n1);

				done();
			});

			it('Chain n4-n5 after n3 of n1-n2-n3, then undo and redo', function(done) {
				const n0 = new Node();
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();

				chainNode(n2, n1);
				chainNode(n3, n2);
				setParentLink(n1, n0);

				n0.new = false;
				n1.new = false;
				n2.new = false;
				n3.new = false;

				const n4 = new Node();
				const n5 = new Node();
				chainNode(n5, n4);
				chainNode(n4, n3);
				n4.new = false;
				n5.new = false;
				expect(n3.nextNode).to.equal(n4);
				expect(n4.prevNode).to.equal(n3);
				expect(n4.parent).to.equal(n0);
				expect(n5.parent).to.equal(n0);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				let result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(n3);
				expect(step.nextNode).to.equal(null);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n3.nextNode).to.equal(null);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				step = futureStep[0];
				expect(step).to.equal(n4);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n3.nextNode).to.equal(n4);
				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(n3);
				expect(step.nextNode).to.equal(null);

				done();
			});

			it('Chain n4 as a chain between n1 and n2 of n1-n2-n3, then undo and redo', function(done) {
				const n0 = new Node();
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();

				chainNode(n2, n1);
				chainNode(n3, n2);
				setParentLink(n1, n0);

				n0.new = false;
				n1.new = false;
				n2.new = false;
				n3.new = false;

				const n4 = new Node();
				chainNodeChainBetween(n4, n4, n1, n2);
				n4.new = false;
				expect(n1.nextNode).to.equal(n4);
				expect(n4.prevNode).to.equal(n1);
				expect(n4.parent).to.equal(n0);
				expect(n4.nextNode).to.equal(n2);
				expect(n2.prevNode).to.equal(n4);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				let result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(n1);
				expect(step.nextNode).to.equal(n2);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n1.nextNode).to.equal(n2);
				expect(n2.prevNode).to.equal(n1);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				step = futureStep[0];
				result = step instanceof NodeChain;
				expect(result).to.be.true;
				expect(step.startNode).to.equal(n4);
				expect(step.endNode).to.equal(n4);
				expect(step.prevNode).to.equal(n1);
				expect(step.nextNode).to.equal(n2);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n2.prevNode).to.equal(n4);
				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(n1);
				expect(step.nextNode).to.equal(n2);

				done();
			});

			it('Remove n1 from n1-n2-n3, whose parent is n0, then undo and redo', function(done) {
				const n0 = new Node();
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();

				chainNode(n2, n1);
				chainNode(n3, n2);
				setParentLink(n1, n0);

				n0.new = false;
				n1.new = false;
				n2.new = false;
				n3.new = false;

				removeNode(n1);
				expect(n0.firstChild).to.equal(n2);
				expect(n2.prevNode).to.equal(null);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				expect(step).to.equal(n1);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n0.firstChild).to.equal(n1);
				expect(n2.prevNode).to.equal(n1);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				step = futureStep[0];
				let result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(null);
				expect(step.nextNode).to.equal(n2);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n0.firstChild).to.equal(n2);
				expect(n2.prevNode).to.equal(null);

				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof NodeChain;
				expect(result).to.be.true;
				expect(step.startNode).to.equal(n1);
				expect(step.endNode).to.equal(n1);
				expect(step.prevNode).to.equal(null);
				expect(step.nextNode).to.equal(n2);

				done();
			});

			it('Remove n2 from n1-n2-n3, whose parent is n0, then undo and redo', function(done) {
				const n0 = new Node();
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();

				chainNode(n2, n1);
				chainNode(n3, n2);
				setParentLink(n1, n0);

				n0.new = false;
				n1.new = false;
				n2.new = false;
				n3.new = false;

				removeNode(n2);
				expect(n0.firstChild).to.equal(n1);
				expect(n1.nextNode).to.equal(n3);
				expect(n3.prevNode).to.equal(n1);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				expect(step).to.equal(n2);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n0.firstChild).to.equal(n1);
				expect(n1.nextNode).to.equal(n2);
				expect(n3.prevNode).to.equal(n2);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				step = futureStep[0];
				let result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(n1);
				expect(step.nextNode).to.equal(n3);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n0.firstChild).to.equal(n1);
				expect(n1.nextNode).to.equal(n3);
				expect(n3.prevNode).to.equal(n1);

				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof NodeChain;
				expect(result).to.be.true;
				expect(step.startNode).to.equal(n2);
				expect(step.endNode).to.equal(n2);
				expect(step.prevNode).to.equal(n1);
				expect(step.nextNode).to.equal(n3);

				done();
			});

			it('Remove n3 from n1-n2-n3, whose parent is n0, then undo and redo', function(done) {
				const n0 = new Node();
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();

				chainNode(n2, n1);
				chainNode(n3, n2);
				setParentLink(n1, n0);

				n0.new = false;
				n1.new = false;
				n2.new = false;
				n3.new = false;

				removeNode(n3);
				expect(n0.firstChild).to.equal(n1);
				expect(n2.nextNode).to.equal(null);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				expect(step).to.equal(n3);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n0.firstChild).to.equal(n1);
				expect(n2.nextNode).to.equal(n3);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				step = futureStep[0];
				let result = step instanceof NullNode;
				expect(result).to.be.true;
				expect(step.prevNode).to.equal(n2);
				expect(step.nextNode).to.equal(null);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n0.firstChild).to.equal(n1);
				expect(n2.nextNode).to.equal(null);

				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				expect(step).to.equal(n3);

				done();
			});

		});

		describe('Rechain a NodeStyles | ParentLink | NodeType', function() {

			beforeEach(function(done) {
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				done();
			});

			it('Undo and redo a NodeStyles change', function(done) {
				const oldStyles = new NodeStyles({
					textAlignment: 1
				});

				const n = new Node({ styles: oldStyles });
				n.new = false;

				const newStyles = new NodeStyles({
					textAlignment: 2
				});
				
				n.styles = newStyles;
				oldStyles.ref = n;
				unchainNode(oldStyles, _PAST_STACK_);
				expect(n.styles.textAlignment).to.equal(2);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n.styles.textAlignment).to.equal(1);
				expect(oldStyles.ref).to.equal(null);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				let step = futureStep[0];
				let result = step instanceof NodeStyles;
				expect(result).to.be.true;
				expect(step.ref).to.equal(n);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n.styles.textAlignment).to.equal(2);
				expect(newStyles.ref).to.equal(null);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof NodeStyles;
				expect(result).to.be.true;
				expect(step.ref).to.equal(n);

				done();
			});

			it('Undo and redo a ParentLink change (switching child)', function(done) {
				const p1 = new Node();
				const n1 = new Node();
				const n2 = new Node();
				setParentLink(n1, p1);
				p1.new = false;
				n1.new = false;
				n2.new = false;
				
				// Switch n2 onto p1
				// Detach
				detachFirstChild(p1);
				expect(p1.firstChild).to.equal(null);
				expect(n1.parent).to.equal(null);
				// Set PL
				setParentLink(n2, p1);

				expect(p1.firstChild).to.equal(n2);
				expect(n2.parent).to.equal(p1);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(p1.firstChild).to.equal(n1);
				expect(n1.parent).to.equal(p1);
				expect(n2.parent).to.equal(null);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				let step = futureStep[0];
				let result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.child).to.equal(n2);
				expect(step.parent).to.equal(p1);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(p1.firstChild).to.equal(n2);
				expect(n2.parent).to.equal(p1);
				expect(n1.parent).to.equal(null);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.child).to.equal(n1);
				expect(step.parent).to.equal(p1);

				done();
			});

			it('Undo and redo a ParentLink change (switching parent)', function(done) {
				const p1 = new Node();
				const p2 = new Node();
				const n1 = new Node();
				chainNode(p2, p1);
				setParentLink(n1, p1);
				p1.new = false;
				p2.new = false;
				n1.new = false;
				
				// Switch n1 onto p2
				// Detach
				detachParentNode(n1);
				expect(n1.parent).to.equal(null);
				expect(p1.firstChild).to.equal(null);
				// Set PL
				setParentLink(n1, p2);
				expect(n1.parent).to.equal(p2);
				expect(p2.firstChild).to.equal(n1);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(p1.firstChild).to.equal(n1);
				expect(p2.firstChild).to.equal(null);
				expect(n1.parent).to.equal(p1);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				let step = futureStep[0];
				let result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.child).to.equal(n1);
				expect(step.parent).to.equal(p2);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(p1.firstChild).to.equal(null);
				expect(p2.firstChild).to.equal(n1);
				expect(n1.parent).to.equal(p2);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.child).to.equal(n1);
				expect(step.parent).to.equal(p1);

				done();
			});

			it('Undo and redo a NodeType change', function(done) {
				const n = new Node({
					nodeType: 1
				});

				const nt = new NodeType(n.nodeType, n);
				n.nodeType = 0;
				unchainNode(nt, _PAST_STACK_);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n.nodeType).to.equal(1);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(1);
				let step = futureStep[0];
				let result = step instanceof NodeType;
				expect(result).to.be.true;
				expect(step.type).to.equal(0);
				expect(step.ref).to.equal(n);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n.nodeType).to.equal(0);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				step = pastStep[0];
				result = step instanceof NodeType;
				expect(result).to.be.true;
				expect(step.type).to.equal(1);
				expect(step.ref).to.equal(n);

				done();
			});

		});

		describe('Rechain a PhantomChain', function() {
			
			beforeEach(function(done) {
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				done();
			});

			/*
				(n1)---(n5)---(n8)
			    |      |
			    (n2)   (n6)
			    |      |
			    (n3)   (n7)
			    |
			    (n4)
			*/
			it('Switch n6-n7 from n5 onto n8 of n1--n5--n8, then n2-n3 of n1-n2-n3-n4 onto n7', function(done) {
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();
				const n4 = new Node();
				chainNode(n2, n1);
				chainNode(n3, n2);
				chainNode(n4, n3);
				n1.new = false;
				n2.new = false;
				n3.new = false;
				n4.new = false;
				const n5 = new Node();
				const n6 = new Node();
				const n7 = new Node();
				chainNode(n6, n5);
				chainNode(n7, n6);
				setParentLink(n5, n1);
				n5.new = false;
				n6.new = false;
				n7.new = false;
				const n8 = new Node();
				setParentLink(n8, n5);
				n8.new = false;

				// Switch n6 onto n8
				let lastPhantom = new PhantomNode(n6);
				const pc1 = new PhantomChain({
					startNode: lastPhantom,
					endNode: new PhantomNode(n7)
				});
				unchainNode(pc1, _PAST_STACK_);
				n5.nextNode = null;
				n6.prevNode = n8;
				n8.nextNode = n6;
				setParentNode(n6, n8.parent);
				// Switch n2-n3 onto n7
				lastPhantom = new PhantomNode(n2);
				const pc2 = new PhantomChain({
					startNode: lastPhantom,
					endNode: new PhantomNode(n3)
				});
				unchainNode(pc2, _PAST_STACK_);
				n1.nextNode = n4;
				n4.prevNode = n1;
				n2.prevNode = n7;
				n3.nextNode = null;
				setParentNode(n2, n7.parent);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n1.nextNode).to.equal(n2);
				expect(n2.prevNode).to.equal(n1);
				expect(n3.nextNode).to.equal(n4);
				expect(n4.prevNode).to.equal(n3);
				expect(n2.parent).to.equal(null);

				expect(n5.nextNode).to.equal(n6);
				expect(n6.prevNode).to.equal(n5);
				expect(n7.nextNode).to.equal(null);
				expect(n6.parent).to.equal(n1);

				expect(n8.nextNode).to.equal(null);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(2);
				let step1 = futureStep[0];
				let step2 = futureStep[1];
				let result = step1 instanceof PhantomChain && step2 instanceof PhantomChain;
				expect(result).to.be.true;

				expect(step1.startNode.ref).to.equal(n2);
				expect(step1.endNode.ref).to.equal(n3);
				expect(step1.startNode.prevNode).to.equal(n7);
				expect(step1.endNode.nextNode).to.equal(null);
				expect(step1.startNode.parent).to.equal(n5);

				expect(step2.startNode.ref).to.equal(n6);
				expect(step2.endNode.ref).to.equal(n7);
				expect(step2.startNode.prevNode).to.equal(n8);
				expect(step2.endNode.nextNode).to.equal(null);
				expect(step2.startNode.parent).to.equal(n5);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n1.nextNode).to.equal(n4);
				expect(n5.nextNode).to.equal(null);
				expect(n8.nextNode).to.equal(n6);
				expect(n7.nextNode).to.equal(n2);
				expect(n6.parent).to.equal(n5);
				expect(n2.parent).to.equal(n5);

				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);
				step1 = pastStep[0];
				step2 = pastStep[1];
				result = step1 instanceof PhantomChain && step2 instanceof PhantomChain;
				expect(result).to.be.true;

				expect(step1.startNode.ref).to.equal(n6);
				expect(step1.endNode.ref).to.equal(n7);
				expect(step1.startNode.prevNode).to.equal(n5);
				expect(step1.endNode.nextNode).to.equal(null);
				expect(step1.startNode.parent).to.equal(n1);

				expect(step2.startNode.ref).to.equal(n2);
				expect(step2.endNode.ref).to.equal(n3);
				expect(step2.startNode.prevNode).to.equal(n1);
				expect(step2.endNode.nextNode).to.equal(n4);
				expect(step2.startNode.parent).to.equal(null);

				done();
			});

			/*
				(n1)---(n3)
			    |
			    (n2)---(n4)
			*/
			it('Switch n4 of n2--n4 onto n3 of n1--n3, where n1 and n2 are n1-n2', function(done) {
				const n1 = new Node();
				const n2 = new Node();
				const n3 = new Node();
				const n4 = new Node();
				chainNode(n2, n1);
				n1.new = false;
				n2.new = false;
				setParentLink(n3, n1);
				setParentLink(n4, n2);
				n3.new = false;
				n4.new = false;

				// Switch n4 onto n3
				const pc = new PhantomChain({
					startNode: new PhantomNode(n4),
					endNode: new PhantomNode(n4)
				});
				unchainNode(pc, _PAST_STACK_);
				removeNode(n2);
				n4.prevNode = n3;
				n3.nextNode = n4;
				setParentNode(n4, n3.parent);

				expect(n1.nextNode).to.equal(null);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);

				// Undo
				readyTempHistorySteps();
				undo();

				expect(n1.nextNode).to.equal(n2);
				expect(n3.nextNode).to.equal(null);
				expect(n4.parent).to.equal(n2);
				expect(n2.firstChild).to.equal(n4);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(2);
				let step1 = futureStep[0];
				let step2 = futureStep[1];
				let result = step1 instanceof NullNode;
				expect(result).to.be.true;
				result = step2 instanceof PhantomChain;
				expect(result).to.be.true;

				expect(step1.prevNode).to.equal(n1);
				expect(step1.nextNode).to.equal(null);

				expect(step2.startNode.ref).to.equal(n4);
				expect(step2.startNode.prevNode).to.equal(n3);
				expect(step2.startNode.parent).to.equal(n1);

				// Redo
				readyTempHistorySteps();
				redo();

				expect(n1.nextNode).to.equal(null);
				expect(n3.nextNode).to.equal(n4);
				expect(n4.parent).to.equal(n1);

				pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);
				step1 = pastStep[0];
				step2 = pastStep[1];
				result = step1 instanceof PhantomChain;
				expect(result).to.be.true;
				expect(step2).to.equal(n2);

				expect(step1.startNode.ref).to.equal(n4);
				expect(step1.startNode.prevNode).to.equal(null);
				expect(step1.startNode.parent).to.equal(n2);

				done();
			});

		});

	});

	describe('shatter', function() {
		
		describe('Shatter the entire tree (all the way to the left)', function() {

			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({ text: 'l2' });
			const l3 = new Leaf({ text: 'l3' });
			const l4 = new Leaf({ text: 'l4' });
			const l5 = new Leaf({ text: 'l5' });
			const l6 = new Leaf({ text: 'l6' });

			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			const n4 = new Node();
			const n5 = new Node();
			const n6 = new Node();
			const n7 = new Node();
			const n8 = new Node();

			/*
				(root)---(n1)---(n2)---<l1>
				         |      |
				         |      (n3)---(n4)---<l2>
				         |      |      |
				         |      |      (n5)---<l3>
				         |      |      |
				         |      |      (n6)---<l4>
				         |      |
				         |      (n7)---<l5>
				         |
	                     (n8)---<l6>
			*/
			before(function(done) {
				DocumentRoot.firstChild = null;
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();

				chainNode(n8, n1);
				chainNode(n3, n2);
				chainNode(n7, n3);
				chainNode(n5, n4);
				chainNode(n6, n5);

				setParentLink(n1, null);
				setParentLink(n2, n1);
				setParentLink(n4, n3);

				setParentLink(l1, n2);
				setParentLink(l2, n4);
				setParentLink(l3, n5);
				setParentLink(l4, n6);
				setParentLink(l5, n7);
				setParentLink(l6, n8);

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

				done();
			});

			it('Shatter', function(done) {
				// Shatter at l3, stop at n1
				const { first, second } = shatter(l3, n1);

				expect(first).to.equal(n1);
				expect(n3.nextNode).to.equal(null);
				expect(n4.nextNode).to.equal(null);

				expect(second.new).to.be.true;
				expect(second.firstChild.new).to.be.true;
				expect(second.firstChild.nextNode).to.equal(n7);
				expect(second.firstChild.firstChild).to.equal(n5);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);
				let step1 = pastStep[0];
				let step2 = pastStep[1];
				let result = step1 instanceof PhantomNode && step2 instanceof PhantomNode;
				expect(result).to.be.true;
				expect(step1.ref).to.equal(n5);
				expect(step1.prevNode).to.equal(n4);
				expect(step2.ref).to.equal(n7);
				expect(step2.prevNode).to.equal(n3);

				done();
			});

			it('Chain shattered results', function(done) {
				const second = n7.parent;
				chainNodeChainBetween(second, second, n1, n8);

				expect(n1.nextNode).to.equal(second);
				expect(n8.prevNode).to.equal(second);

				second.new = false;
				second.firstChild.new = false;

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(3);
				let step3 = pastStep[2];
				let result = step3 instanceof NullNode;
				expect(result).to.be.true;
				expect(step3.prevNode).to.equal(n1);
				expect(step3.nextNode).to.equal(n8);

				done();
			});

			it('Undo', function(done) {
				// Undo
				readyTempHistorySteps();
				undo();

				// 1. Should first rechain a NullNode -> unchain a NodeChain
				// 2. Then rechain n7 PhantomNode -> unchain a PhantomNode n7
				// 3. Then rechain n5 PhantomNode -> unchain a PhantomNode n5
				// 4. Then call removeNode at n5.parent -> unchain a Node (same as 1)

				expect(n1.nextNode).to.equal(n8);
				expect(n8.prevNode).to.equal(n1);
				expect(n3.nextNode).to.equal(n7);
				expect(n7.prevNode).to.equal(n3);
				expect(n7.parent).to.equal(n1);
				expect(n4.nextNode).to.equal(n5);
				expect(n5.prevNode).to.equal(n4);
				expect(n5.parent).to.equal(n3);
				expect(n6.parent).to.equal(n3);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(4);
				let step1 = futureStep[0];
				let step2 = futureStep[1];
				let step3 = futureStep[2];
				let step4 = futureStep[3];
				let result = step1 instanceof NodeChain;
				expect(result).to.be.true;
				result = step2 instanceof PhantomNode && step3 instanceof PhantomNode;
				expect(result).to.be.true;
				result = step4 instanceof Node;
				expect(result).to.be.true;

				expect(step1.prevNode).to.equal(n1);
				expect(step1.nextNode).to.equal(n8);

				expect(step2.ref).to.equal(n7);
				expect(step2.parent).to.equal(step1.startNode);
				expect(step2.prevNode).to.equal(step1.startNode.firstChild);

				expect(step3.ref).to.equal(n5);
				expect(step3.prevNode).to.equal(null);
				expect(step3.parent).to.equal(step2.prevNode);

				expect(step4).to.equal(step1.startNode);
				expect(step4.prevNode).to.equal(n1);
				expect(step4.nextNode).to.equal(n8);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				// 1. Rechain a Node (second) -> unchain a NullNode
				// 2. Then rechain n5 PhantomNode -> unchain a PhantomNode n5
				// 3. Then rechain n7 PhantomNode -> unchain a PhantomNode n7
				// 4. Rechain a NodeChain (second) -> do nothing

				const second = n1.nextNode;
				expect(second.nextNode).to.equal(n8);
				expect(n8.prevNode).to.equal(second);
				expect(second.firstChild.nextNode).to.equal(n7);
				expect(n7.parent).to.equal(second);
				expect(n7.prevNode).to.equal(second.firstChild);
				expect(n5.prevNode).to.equal(null);
				expect(n5.parent).to.equal(second.firstChild);
				expect(n3.nextNode).to.equal(null);
				expect(n4.nextNode).to.equal(null);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(3);
				let step1 = pastStep[0];
				let step2 = pastStep[1];
				let step3 = pastStep[2];
				let result = step1 instanceof NullNode;
				expect(result).to.be.true;
				result = step2 instanceof PhantomNode && step3 instanceof PhantomNode;
				expect(result).to.be.true;
				expect(step1.prevNode).to.equal(n1);
				expect(step1.nextNode).to.equal(n8);
				expect(step2.ref).to.equal(n5);
				expect(step2.parent).to.equal(n3);
				expect(step2.prevNode).to.equal(n4);
				expect(step3.ref).to.equal(n7);
				expect(step3.parent).to.equal(n1);
				expect(step3.prevNode).to.equal(n3);

				done();
			});

		});

		describe('Shatter a subtree (will stop at a certain node)', function() {
			
			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({ text: 'l2' });
			const l3 = new Leaf({ text: 'l3' });
			const l4 = new Leaf({ text: 'l4' });
			const l5 = new Leaf({ text: 'l5' });
			const l6 = new Leaf({ text: 'l6' });

			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			const n4 = new Node();
			const n5 = new Node();
			const n6 = new Node();
			const n7 = new Node();
			const n8 = new Node();

			/*
				(root)---(n1)---(n2)---<l1>
				         |      |
				         |      (n3)---(n4)---<l2>
				         |      |      |
				         |      |      (n5)---<l3>
				         |      |      |
				         |      |      (n6)---<l4>
				         |      |
				         |      (n7)---<l5>
				         |
	                     (n8)---<l6>
			*/
			before(function(done) {
				DocumentRoot.firstChild = null;
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();

				chainNode(n8, n1);
				chainNode(n3, n2);
				chainNode(n7, n3);
				chainNode(n5, n4);
				chainNode(n6, n5);

				setParentLink(n1, null);
				setParentLink(n2, n1);
				setParentLink(n4, n3);

				setParentLink(l1, n2);
				setParentLink(l2, n4);
				setParentLink(l3, n5);
				setParentLink(l4, n6);
				setParentLink(l5, n7);
				setParentLink(l6, n8);

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

				done();
			});

			it('Shatter', function(done) {
				// Shatter at l3, stop at n3
				const { first, second } = shatter(l3, n3);

				expect(first).to.equal(n3);
				expect(n4.nextNode).to.equal(null);

				expect(second.new).to.be.true;
				expect(second.firstChild).to.equal(n5);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step1 = pastStep[0];
				let result = step1 instanceof PhantomNode;
				expect(result).to.be.true;
				expect(step1.ref).to.equal(n5);
				expect(step1.prevNode).to.equal(n4);

				done();
			});

			it('Chain shattered results', function(done) {
				const second = n5.parent;
				chainNodeChainBetween(second, second, n3, n7);

				expect(n3.nextNode).to.equal(second);
				expect(n7.prevNode).to.equal(second);

				second.new = false;

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);
				let step2 = pastStep[1];
				let result = step2 instanceof NullNode;
				expect(result).to.be.true;
				expect(step2.prevNode).to.equal(n3);
				expect(step2.nextNode).to.equal(n7);

				done();
			});

			it('Undo', function(done) {
				// Undo
				readyTempHistorySteps();
				undo();

				// 1. Should first rechain a NullNode -> unchain a NodeChain
				// 2. Then rechain n5 PhantomNode -> unchain a PhantomNode n5
				// 3. Then call removeNode at n5.parent -> unchain a Node (same as 1)

				expect(n4.nextNode).to.equal(n5);
				expect(n5.prevNode).to.equal(n4);
				expect(n5.parent).to.equal(n3);
				expect(n6.parent).to.equal(n3);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(3);
				let step1 = futureStep[0];
				let step2 = futureStep[1];
				let step3 = futureStep[2];
				let result = step1 instanceof NodeChain;
				expect(result).to.be.true;
				result = step2 instanceof PhantomNode;
				expect(result).to.be.true;
				result = step3 instanceof Node;
				expect(result).to.be.true;

				expect(step1.prevNode).to.equal(n3);
				expect(step1.nextNode).to.equal(n7);

				expect(step2.ref).to.equal(n5);
				expect(step2.prevNode).to.equal(null);
				expect(step2.parent).to.equal(step1.startNode);

				expect(step3).to.equal(step1.startNode);
				expect(step3.prevNode).to.equal(n3);
				expect(step3.nextNode).to.equal(n7);

				done();
			});

			it('Redo', function(done) {
				// Redo
				readyTempHistorySteps();
				redo();

				// 1. Rechain a Node (second) -> unchain a NullNode
				// 2. Then rechain n5 PhantomNode -> unchain a PhantomNode n5
				// 3. Rechain a NodeChain (second) -> do nothing

				const second = n3.nextNode;
				expect(second.nextNode).to.equal(n7);
				expect(n7.prevNode).to.equal(second);
				expect(second.firstChild).to.equal(n5);
				expect(n4.nextNode).to.equal(null);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);
				let step1 = pastStep[0];
				let step2 = pastStep[1];
				let result = step1 instanceof NullNode;
				expect(result).to.be.true;
				result = step2 instanceof PhantomNode;
				expect(result).to.be.true;
				expect(step1.prevNode).to.equal(n3);
				expect(step1.nextNode).to.equal(n7);
				expect(step2.ref).to.equal(n5);
				expect(step2.parent).to.equal(n3);
				expect(step2.prevNode).to.equal(n4);

				done();
			});

		});

		describe('Shatter when there\'s nothing to shatter', function() {

			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({ text: 'l2' });

			const n1 = new Node();
			const n2 = new Node();
			const n3 = new Node();
			const n4 = new Node();

			/*
				(root)---(n1)---(n2)---<l1>
				                |
				                (n3)---(n4)---<l2>
			*/
			before(function(done) {
				DocumentRoot.firstChild = null;
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();

				chainNode(n3, n2);

				setParentLink(n1, null);
				setParentLink(n2, n1);
				setParentLink(n4, n3);

				setParentLink(l1, n2);
				setParentLink(l2, n4);

				n1.new = false;
				n2.new = false;
				n3.new = false;
				n4.new = false;

				l1.new = false;
				l2.new = false;

				done();
			});

			it('Shatter', function(done) {
				// Shatter at l2, stop at n3
				const { first, second } = shatter(l2, n3);

				expect(first).to.equal(null);
				expect(second).to.equal(n3);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(0);

				done();
			});

		});

	});

});

describe('Node Action Ops', function() {

/*
	applyBranchType
	applyNodeStyle
	applyNodesStyle
*/

	describe('applyBranchType', function() {

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
				const selections = [{ leaf: l3, range: [0, l3.text.length] }, { leaf: l8, range: [0, l8.text.length ] }];
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
				const selections = [{ leaf: l3, range: [0, l3.text.length] }, { leaf: l7, range: [0, l7.text.length] }];
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
				const selections = [{ leaf: l1, range: [0, l1.text.length] }, { leaf: l8, range: [0, l8.text.length] }];
				const newBT = [0];
				applyBranchType(selections, newBT);

				const middle = n3.nextNode;
				expect(middle.new).to.be.true;
				expect(middle.prevNode).to.equal(n3);
				expect(middle.nodeType).to.equal(0);
				expect(middle.nextNode).to.equal(n5);
				middle.new = false;

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

				done();
			});

		});

		describe('Last LeafChain\'s parent is removed with level 2 shatter', function() {

			const l1 = new Leaf({ text: 'l1' });
			const l2 = new Leaf({ text: 'l2' });
			const l3 = new Leaf({ text: 'l3' });
			const l4 = new Leaf({ text: 'l4' });
			const l5 = new Leaf({ text: 'l5' });
			const l6 = new Leaf({ text: 'l6' });

			const n1 = new Node({ nodeType: 2 });
			const n2 = new Node({ nodeType: 3 });
			const n3 = new Node({ nodeType: 3 });
			const n4 = new Node({ nodeType: 2 });
			const n5 = new Node({ nodeType: 3 });

			/*
				(2)---(3)---<l1>
		        |	  |
		        |	  (3)---<l2-l3>
		        |
		        (2)---(3)---<l4-l5-l6>
		    */
		    before(function(done) {
				DocumentRoot.firstChild = null;
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();
				
				setParentLink(n1, null);
					setParentLink(n2, n1);
						setParentLink(l1, n2);
					chainNode(n3, n2);
						setParentLink(l2, n3);
						chainLeaf(l3, l2);
				chainNode(n4, n1);
					setParentLink(n5, n4);
						setParentLink(l4, n5);
						chainLeaf(l5, l4);
						chainLeaf(l6, l5);

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

				done();
			});

			it('Apply [1, 3] to selections [l3, l5]', function(done) {
				const selections = [{ leaf: l3, range: [0, l3.text.length] }, { leaf: l5, range: [0, l5.text.length] }];
				const newBT = [1, 3];
				applyBranchType(selections, newBT);

				let cn = n1;
					cn = cn.firstChild;
					expect(cn).to.equal(n2);
					expect(cn.nextNode).to.equal(null);
				cn = cn.parent;
				cn = cn.nextNode;
				expect(cn.nodeType).to.equal(1);
				expect(cn.new).to.be.true;
				cn.new = false;
					cn = cn.firstChild;
					expect(cn.nodeType).to.equal(3);
					expect(cn.new).to.be.true;
					cn.new = false;
						let cl = cn.firstChild;
						expect(cl).to.equal(l2);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
					expect(cn).to.equal(n5);
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
					expect(cn.nextNode).to.equal(n3);
				cn = cn.parent;
				cn = cn.nextNode;
				expect(cn).to.equal(n4);
					cn = cn.firstChild;
					expect(cn).to.equal(n5);
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
				cn = cn.parent;
				cn = cn.nextNode;
				expect(cn.nodeType).to.equal(1);
					cn = cn.firstChild;
					expect(cn.nodeType).to.equal(3);
						let cl = cn.firstChild;
						expect(cl).to.equal(l2);
					cn = cn.nextNode;
					expect(cn.nodeType).to.equal(3);
					expect(cn).to.equal(n5);
					expect(cn.nextNode).to.equal(null);
				cn = cn.parent;
				expect(cn.nextNode).to.equal(null);

				done();
			});

		});

	});

	describe('applyNodeStyle & applyNodesStyle', function() {

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
			const newStyles = { fontFamily: 2 };
			const selections = [{ leaf: l1, range: [0, l1.text.length] }, { leaf: l4, range: [0, l4.text.length] }];
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

			done();
		});

	});

});
