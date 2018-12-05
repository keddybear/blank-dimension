/* eslint-disable */
import { Node, DocumentRoot } from '../node';
import { Leaf, isZeroLeaf, LeafStyles, NullLeaf, LeafChain, ParentLink } from '../leaf';
import { History, BlankHistoryStep, copyHistoryStep } from '../history';
import {
	sameLeafStyles,
	setLeafStyles,
	copyLeafStyles,
	trimRange,
	destroyLeaf,
	unchainLeaf,
	setParentLink,
	_PAST_STACK_,
	_FUTURE_STACK_,
	TempHistoryPastStep,
	TempHistoryFutureStep,
	chainedLeaf,
	_NOT_CHAINED_,
	_CHAINED_AFTER_,
	_CHAINED_BEFORE_,
	chainLeaf,
	chainNode,
	_CHAIN_AFTER_,
	_CHAIN_BEFORE_,
	chainLeafChainBetween,
	rechainLeaf,
	consume,
	_TRAVERSE_UP_,
	_TRAVERSE_DOWN_,
	applyLeafStyle,
	applyLeavesStyle,
	DirtyNewLeaves,
	autoMergeLeaf,
	autoMergeDirtyLeaves,
	readyHistoryStep,
	readyTempHistorySteps,
	undo,
	redo
} from '../integration';

const { expect } = require('chai');

describe('Leaf', function() {
	
	describe('LeafStyles', function() {
		const l1 = new Leaf({
			text: 'Hello, World!'
		});

		const l2 = new Leaf({
			text: 'This is a test.'
		});
		
		it('sameLeafStyles: no styles, itself, null, new styles', function(done) {
			let result = sameLeafStyles(l1, l2);
			expect(result).to.be.true;

			result = sameLeafStyles(l1, l1);
			expect(result).to.be.true;

			result = sameLeafStyles(l1, null);
			expect(result).to.be.false;

			result = sameLeafStyles(null, l2);
			expect(result).to.be.false;

			result = sameLeafStyles(null, null);
			expect(result).to.be.false;

			const style1 = new LeafStyles({
				bold: true
			});

			setLeafStyles(l1, style1);

			result = sameLeafStyles(l1, l2);
			expect(result).to.be.false;

			done();
		});

		it('setLeafStyles: same styles but different objects', function(done) {
			const style1 = new LeafStyles({
				underline: true
			});

			setLeafStyles(l1, style1);
			setLeafStyles(l2, style1);
			
			let result = l1.styles.bold;
			expect(result).to.be.false;

			result = l1.styles.underline;
			expect(result).to.be.true;

			result = sameLeafStyles(l1, l2);
			expect(result).to.be.true;

			result = l1.styles === l2.styles;
			expect(result).to.be.false;

			done();
		});

		it('copyLeafStyles: same styles but different objects', function(done) {
			const style1 = new LeafStyles({
				italic: true
			});

			setLeafStyles(l1, style1);

			let result = l1.styles.italic;
			expect(result).to.be.true;

			result = sameLeafStyles(l1, l2);
			expect(result).to.be.false;

			copyLeafStyles(l2, l1);

			result = sameLeafStyles(l1, l2);
			expect(result).to.be.true;

			result = l1.styles === l2.styles;
			expect(result).to.be.false;

			done();
		});

		it('isZeroLeaf', function(done) {
			const zeroLeaf = new Leaf();

			let result = isZeroLeaf(zeroLeaf);
			expect(result).to.be.true;

			done();
		});

	});

	describe('trimRange', function() {
		const l1 = new Leaf({
			text: 'Hello, World!'
		});
		
		it('Pass []', function(done) {
			const r = trimRange(l1, []);
			expect(r).to.deep.equal([0, 0]);
			done();
		});

		it('Pass [0, 5]', function(done) {
			const r = trimRange(l1, [0, 5]);
			expect(r).to.deep.equal([0, 5]);
			done();
		});

		it('Pass [8, 3]', function(done) {
			const r = trimRange(l1, [8, 3]);
			expect(r).to.deep.equal([3, 8]);
			done();
		});

		it('Pass [9]', function(done) {
			const r = trimRange(l1, [9]);
			expect(r).to.deep.equal([0, 0]);
			done();
		});

		it('Pass [99, 2]', function(done) {
			const r = trimRange(l1, [99, 2]);
			expect(r).to.deep.equal([2, l1.text.length]);
			done();
		});

		it('Pass [2, 99, 35]', function(done) {
			const r = trimRange(l1, [2, 99, 35]);
			expect(r).to.deep.equal([2, l1.text.length]);
			done();
		});

		it('Pass [-1, 4]', function(done) {
			const r = trimRange(l1, [-1, 4]);
			expect(r).to.deep.equal([0, 4]);
			done();
		});

	});

	describe('destroyLeaf', function(done) {
		let l1 = new Leaf({
			text: 'Hello, World!'
		});

		let l2 = new Leaf({
			text: 'This is a test.'
		});

		let l3 = new Leaf({
			text: 'Third Leaf.'
		});

		it('l1 - l2 - l3: destroy l2', function(done) {
			l1.nextLeaf = l2;
			l2.prevLeaf = l1;

			l2.nextLeaf = l3;
			l3.prevLeaf = l2;

			l2 = destroyLeaf(l2);

			let result = l1.nextLeaf === l3;
			expect(result).to.be.true;

			result = l3.prevLeaf === l1;
			expect(result).to.be.true;

			expect(l2).to.equal(null);

			done();
		});

	});

});

describe('Leaf chaining & advanced operations', function() {

	describe('chained', function() {
		let l1 = new Leaf({
			text: 'Hello, World!'
		});

		let l2 = new Leaf({
			text: 'This is a test.'
		});

		let l3 = new Leaf({
			text: 'Third Leaf.'
		});

		l1.nextLeaf = l2;
		l2.prevLeaf = l1;

		l2.nextLeaf = l3;
		l3.prevLeaf = l2;

		it('l1 & l3: not chained', function(done) {
			let result = chainedLeaf(l1, l3);
			expect(result).to.equal(_NOT_CHAINED_);

			done();
		});

		it('l1 & l2: chained', function(done) {
			let result = chainedLeaf(l1, l2);
			expect(result).to.equal(_CHAINED_BEFORE_);

			result = chainedLeaf(l2, l1);
			expect(result).to.equal(_CHAINED_AFTER_);

			done();
		});

	});

	describe('chainLeaf', function() {
		let l1 = new Leaf({
			text: 'Hello, World!'
		});

		let l2 = new Leaf({
			text: 'This is a test.'
		});

		let l3 = new Leaf({
			text: 'Third Leaf.'
		});

		let l4 = new Leaf({
			text: 'An old leaf.'
		});

		l4.new = false;

		it('chain l2 after l1', function(done) {
			chainLeaf(l2, l1);

			let result = chainedLeaf(l1, l2);
			expect(result).to.equal(_CHAINED_BEFORE_);

			result = l1.prevLeaf === null;
			expect(result).to.be.true;

			result = l1.nextLeaf === l2;
			expect(result).to.be.true;

			result = l2.prevLeaf === l1;
			expect(result).to.be.true;

			result = l2.nextLeaf === null;
			expect(result).to.be.true;

			done();
		});

		it('chain l3 after l2', function(done) {
			chainLeaf(l3, l2);

			let result = chainedLeaf(l2, l3);
			expect(result).to.equal(_CHAINED_BEFORE_);

			result = l2.prevLeaf === l1;
			expect(result).to.be.true;

			result = l2.nextLeaf === l3;
			expect(result).to.be.true;

			result = l3.prevLeaf === l2;
			expect(result).to.be.true;

			result = l3.nextLeaf === null;
			expect(result).to.be.true;

			done();
		});

		it('Throw Error: chain l3 after l1', function(done) {
			let e;
			try {
				chainLeaf(l3, l1);
			} catch (error) {
				e = error;
			} finally {
				let result = e instanceof Error;
				expect(result).to.be.true;
				console.log(e.message);
				done();
			}
		});

		it('Throw Error: chain l2 after l3', function(done) {
			let e;
			try {
				chainLeaf(l2, l3);
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

	describe('chainLeafChainBetween', function() {
		let l1 = new Leaf({
			text: 'Hello, World!'
		});

		let l2 = new Leaf({
			text: 'This is a test.'
		});

		let l3 = new Leaf({
			text: 'Third Leaf.'
		});

		let l4 = new Leaf({
			text: 'An old leaf.'
		});

		let l5 = new Leaf({
			text: 'Goppity Gah Gah Gah Gee!'
		});

		it('chain l3 between l1 and l2, unchain NullLeaf', function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);

			chainLeaf(l2, l1);
			l1.new = false;
			l2.new = false;

			chainLeafChainBetween(l3, l3, l1, l2);
			
			expect(l1.prevLeaf).to.equal(null);
			expect(l1.nextLeaf).to.equal(l3);
			expect(l3.prevLeaf).to.equal(l1);
			expect(l3.nextLeaf).to.equal(l2);
			expect(l2.prevLeaf).to.equal(l3);
			expect(l2.nextLeaf).to.equal(null);

			const psStack = TempHistoryPastStep.stack;
			expect(psStack.length).to.equal(1);
			let result = psStack[0] instanceof NullLeaf;
			expect(result).to.be.true;
			expect(psStack[0].prevLeaf).to.equal(l1);
			expect(psStack[0].nextLeaf).to.equal(l2);

			l3.new = false;

			done();
		});

		it('chain l4-l5 between l1 and l3, unchain NullLeaf', function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			
			chainLeaf(l5, l4);

			chainLeafChainBetween(l4, l5, l1, l3);

			expect(l1.nextLeaf).to.equal(l4);
			expect(l4.prevLeaf).to.equal(l1);
			expect(l5.nextLeaf).to.equal(l3);
			expect(l3.prevLeaf).to.equal(l5);

			const psStack = TempHistoryPastStep.stack;
			expect(psStack.length).to.equal(1);
			let result = psStack[0] instanceof NullLeaf;
			expect(result).to.be.true;
			expect(psStack[0].prevLeaf).to.equal(l1);
			expect(psStack[0].nextLeaf).to.equal(l3);

			l4.new = false;
			l5.new = false;

			done();			
		});
	});

	describe('unchain', function() {
		let l1 = new Leaf({
			text: 'Hello, World!'
		});

		let l2 = new Leaf({
			text: 'This is a test.'
		});

		let l3 = new Leaf({
			text: 'Third Leaf.'
		});

		let l4 = new Leaf({
			text: 'An old leaf.'
		});

		let l5 = new Leaf({
			text: 'Goppity Gah Gah Gah Gee!'
		});

		it('Chain l1 (new) after l2 (old): unchain NullLeaf', function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);

			l2.new = false;

			chainLeaf(l1, l2);

			const pastStep = TempHistoryPastStep.stack;

			let result = pastStep.length;
			expect(result).to.equal(1);

			result = pastStep[0] instanceof NullLeaf;
			expect(result).to.be.true;

			expect(pastStep[0].prevLeaf).to.equal(l2);
			expect(l2.nextLeaf).to.equal(l1);

			done();
		});

		it('Chain l3-l4-l5 (new) after l2: unchain l1', function(done) {
			l1.new = false;

			chainLeaf(l4, l3);
			chainLeaf(l5, l4);

			chainLeaf(l3, l2);

			const pastStep = TempHistoryPastStep.stack;

			let result = pastStep.length;
			expect(result).to.equal(2);

			result = pastStep[1] instanceof Leaf;
			expect(result).to.be.true;
			expect(pastStep[1]).to.equal(l1);

			expect(pastStep[1].prevLeaf).to.equal(l2);
			expect(l2.nextLeaf).to.equal(l3);

			l3.new = false;
			l4.new = false;
			l5.new = false;

			done();
		});

	});

	describe('history', function() {

		it('copyHistoryStep', function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			
			const l0 = new Leaf({ text: 'Yololol' });
			TempHistoryPastStep.push(l0);

			History.push(copyHistoryStep(TempHistoryPastStep));

			expect(History.stackPast.length).to.equal(1);

			const step = History.stackPast[0];
			let result = step instanceof BlankHistoryStep;
			expect(result).to.be.true;

			result = step === TempHistoryPastStep;
			expect(result).to.be.false;

			expect(step.stack.length).to.equal(1);
			expect(TempHistoryPastStep.stack.length).to.equal(0);

			done();
		});

	});

	describe('rechainLeaf - chainLeafChainBetween, LeafChain, redo, undo', function() {
		let start = new Leaf({
			text: 'start '
		});

		let end = new Leaf({
			text: ' end'
		});

		let l1 = new Leaf({ text: 'l1' });
		let l2 = new Leaf({ text: 'l2' });
		let l3 = new Leaf({ text: 'l3' });

		it('Insert l1 between start and end, undo, redo', function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);

			chainLeaf(end, start);
			// Do not replace start or end
			start.new = false;
			end.new = false;

			// Insert
			chainLeafChainBetween(l1, l1, start, end);
			// start-l1-end
			expect(start.nextLeaf).to.equal(l1);
			expect(end.prevLeaf).to.equal(l1);
			// unchained: nl(start, end)
			l1.new = false;

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let nl = pastStep[0];
			let result = nl instanceof NullLeaf;
			expect(result).to.be.true;
			expect(nl.prevLeaf).to.equal(start);
			expect(nl.nextLeaf).to.equal(end);

			// Undo (ready history steps and immediately push future step after undo())
			readyTempHistorySteps();
			expect(History.stackPast.length).to.equal(1);
			undo();
			History.push(copyHistoryStep(TempHistoryFutureStep));

			// start-end
			expect(start.nextLeaf).to.equal(end);
			expect(end.prevLeaf).to.equal(start);
			// Unchained: lc(l1, l1, start, end);

			expect(History.stackPast.length).to.equal(0);
			expect(History.stackFuture.length).to.equal(1);
			let tempFutureStep = History.stackFuture[0];
			let futureStep = tempFutureStep.stack;
			expect(futureStep.length).to.equal(1);
			let lc = futureStep[0];
			result = lc instanceof LeafChain;
			expect(result).to.be.true;
			expect(lc.startLeaf).to.equal(l1);
			expect(lc.endLeaf).to.equal(l1);
			expect(lc.prevLeaf).to.equal(start);
			expect(lc.nextLeaf).to.equal(end);
			expect(History.stackPast.length).to.equal(0);
			expect(History.stackFuture.length).to.equal(1);

			// Redo (ready history steps and immediately push past step after redo())
			readyTempHistorySteps();
			redo();
			History.push(copyHistoryStep(TempHistoryPastStep), true);
			// start-l1-end
			expect(start.nextLeaf).to.equal(l1);
			expect(end.prevLeaf).to.equal(l1);
			// Unchained: nl(start, end);
			
			expect(History.stackPast.length).to.equal(1);
			expect(History.stackFuture.length).to.equal(0);
			let tempPastStep = History.stackPast[0];
			pastStep = tempPastStep.stack;
			expect(pastStep.length).to.equal(1);
			nl = pastStep[0];
			result = nl instanceof NullLeaf;
			expect(nl.prevLeaf).to.equal(start);
			expect(nl.nextLeaf).to.equal(end);
			
			done();
		});

		it('Replace l1 with l2-l3, undo, redo', function(done) {
			chainLeaf(l3, l2);

			// Replace l1
			start.nextLeaf = l2;
			l2.prevLeaf = start;
			end.prevLeaf = l3;
			l3.nextLeaf = end;
			unchainLeaf(l1, _PAST_STACK_);
			// start-l2-l3-end
			expect(start.nextLeaf).to.equal(l2);
			expect(end.prevLeaf).to.equal(l3);
			// Unchained: l1

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);

			// Undo (ready history steps and immediately push future step after undo())
			readyTempHistorySteps();
			expect(History.stackPast.length).to.equal(2);
			undo();
			History.push(copyHistoryStep(TempHistoryFutureStep));
			// start-l1-end
			expect(start.nextLeaf).to.equal(l1);
			expect(end.prevLeaf).to.equal(l1);
			// Unchained: lc(l2, l3, start, end)
			
			expect(History.stackPast.length).to.equal(1);
			expect(History.stackFuture.length).to.equal(1);			
			let tempFutureStep = History.stackFuture[0];
			let futureStep = tempFutureStep.stack;
			expect(futureStep.length).to.equal(1);
			let lc = futureStep[0];
			let result = lc instanceof LeafChain;
			expect(result).to.be.true;
			expect(lc.startLeaf).to.equal(l2);
			expect(lc.endLeaf).to.equal(l3);
			expect(lc.prevLeaf).to.equal(start);
			expect(lc.nextLeaf).to.equal(end);

			// Redo (ready history steps and immediately push past step after redo())
			readyTempHistorySteps();
			redo();
			History.push(copyHistoryStep(TempHistoryPastStep), true);
			// start-l2-l3-end
			expect(start.nextLeaf).to.equal(l2);
			expect(end.prevLeaf).to.equal(l3);
			// Unchained: lc(l1, l1, start, end)

			expect(History.stackPast.length).to.equal(2);
			expect(History.stackFuture.length).to.equal(0);
			let tempPastStep = History.stackPast[1];
			pastStep = tempPastStep.stack;
			expect(pastStep.length).to.equal(1);
			lc = pastStep[0];
			result = lc instanceof LeafChain;
			expect(result).to.be.true;
			expect(lc.startLeaf).to.equal(l1);
			expect(lc.endLeaf).to.equal(l1);
			expect(lc.prevLeaf).to.equal(start);
			expect(lc.nextLeaf).to.equal(end);

			done();
		});

	});

	describe('consume', function() {

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			done();
		});

		it('consume up: same style', function(done) {
			const l1 = new Leaf({
				text: 'l1',
				styles: new LeafStyles({
					bold: true
				})
			});

			const l2 = new Leaf({
				text: 'l2',
				styles: new LeafStyles({
					bold: true
				})
			});

			const n1 = new Node();

			setParentLink(l1, n1);
			chainLeaf(l2, l1);
			l1.new = false;
			n1.new = false;

			let result = consume(l2);
			expect(result).to.be.true;
			expect(l2.text).to.equal('l1l2');
			expect(l2.styles.bold).to.be.true;
			expect(l2.prevLeaf).to.equal(null);
			expect(l2.nextLeaf).to.equal(null);
			expect(n1.firstChild).to.equal(l2);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			expect(pastStep[0]).to.equal(l1);

			done();
		});

		it('consume up: different style', function(done) {
			let l1 = new Leaf({
				text: 'l1',
				styles: new LeafStyles({
					bold: true
				})
			});

			let l2 = new Leaf({
				text: 'l2',
				styles: new LeafStyles({
					italic: true
				})
			});

			chainLeaf(l2, l1);
			l1.new = false;

			let result = consume(l2);
			expect(result).to.be.false;
			expect(l2.text).to.equal('l2');
			expect(l2.styles.bold).to.be.false;
			expect(l2.prevLeaf).to.equal(l1);
			expect(l2.nextLeaf).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(0);

			done();
		});

		it('consume up: zero-width', function(done) {
			const l1 = new Leaf({
				text: 'l1',
				styles: new LeafStyles({
					bold: true
				})
			});

			const l2 = new Leaf();

			const n1 = new Node();

			setParentLink(l1, n1);
			chainLeaf(l2, l1);
			l1.new = false;

			let result = consume(l2);
			expect(result).to.be.true;
			expect(l2.text).to.equal('l1');
			expect(l2.styles.bold).to.be.true;
			expect(l2.prevLeaf).to.equal(null);
			expect(l2.nextLeaf).to.equal(null);
			expect(n1.firstChild).to.equal(l2);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			expect(pastStep[0]).to.equal(l1);

			done();
		});

		it('consume down: same style', function(done) {
			let l1 = new Leaf({
				text: 'l1'
			});

			let l2 = new Leaf({
				text: 'l2'
			});

			chainLeaf(l2, l1);
			l2.new = false;

			let result = consume(l1, _TRAVERSE_DOWN_);
			expect(result).to.be.true;
			expect(l1.text).to.equal('l1l2');
			expect(l1.styles.bold).to.be.false;
			expect(l1.prevLeaf).to.equal(null);
			expect(l1.nextLeaf).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			expect(pastStep[0]).to.equal(l2);

			done();
		});

		it('consume down: different style', function(done) {
			let l1 = new Leaf({
				text: 'l1'
			});

			let l2 = new Leaf({
				text: 'l2',
				styles: new LeafStyles({
					underline: true
				})
			});

			chainLeaf(l2, l1);
			l2.new = false;

			let result = consume(l1, _TRAVERSE_DOWN_);
			expect(result).to.be.false;
			expect(l1.text).to.equal('l1');
			expect(l1.styles.bold).to.be.false;
			expect(l1.prevLeaf).to.equal(null);
			expect(l1.nextLeaf).to.equal(l2);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(0);

			done();
		});

		it('consume down: zero-width', function(done) {
			let l1 = new Leaf();

			let l2 = new Leaf();

			chainLeaf(l2, l1);
			l2.new = false;

			let result = consume(l1, _TRAVERSE_DOWN_);
			expect(result).to.be.true;
			result = isZeroLeaf(l1);
			expect(result).to.be.true;
			expect(l1.styles.bold).to.be.false;
			expect(l1.prevLeaf).to.equal(null);
			expect(l1.nextLeaf).to.equal(null);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			expect(pastStep[0]).to.equal(l2);

			done();
		});

		it('consume all & undo & redo', function(done) {
			// Do not consume or replace start or end
			let start = new Leaf({
				text: 'start'
			});

			let end = new Leaf({
				text: 'end'
			});

			let l1 = new Leaf({
				text: 'l1',
				styles: new LeafStyles({
					bold: true
				})
			});

			let l2 = new Leaf({
				text: 'l2',
				styles: new LeafStyles({
					italic: true,
					bold: true
				})
			});

			let l3 = new Leaf({
				text: 'l3',
				styles: new LeafStyles({
					bold: true
				})
			});
			
			// Create a chain
			chainLeaf(l1, start);
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			chainLeaf(end, l3);
			start.new = false;
			l1.new = false;
			l2.new = false;
			l3.new = false;
			end.new = false;
			
			// Create a zero Leaf
			let z = new Leaf();

			// Replace l2 with zero Leaf
			chainLeafChainBetween(z, z, l1, l3);
			expect(l1.nextLeaf).to.equal(z);
			expect(z.prevLeaf).to.equal(l1);
			expect(z.nextLeaf).to.equal(l3);
			expect(l3.prevLeaf).to.equal(z);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let lc = pastStep[0];
			let result = lc instanceof LeafChain;
			expect(result).to.be.true;
			expect(lc.startLeaf).to.equal(l2);
			expect(lc.endLeaf).to.equal(l2);
			expect(lc.prevLeaf).to.equal(l1);
			expect(lc.nextLeaf).to.equal(l3);

			// Consume all
			result = consume(z);
			expect(result).to.be.true;
			result = consume(z);
			expect(result).to.be.false;
			result = consume(z, _TRAVERSE_DOWN_);
			expect(result).to.be.true;
			result = consume(z, _TRAVERSE_DOWN_);
			expect(result).to.be.false;
			
			expect(z.text).to.equal('l1l3');
			expect(z.styles.bold).to.be.true;
			z.new = false;
			
			expect(pastStep.length).to.equal(3);
			expect(pastStep[1]).to.equal(l1);
			expect(pastStep[2]).to.equal(l3);

			// Undo (ready history steps and immediately push future step after undo())
			readyTempHistorySteps();
			undo();
			History.push(copyHistoryStep(TempHistoryFutureStep));

			expect(start.nextLeaf).to.equal(l1);
			expect(l1.prevLeaf).to.equal(start);
			expect(l1.nextLeaf).to.equal(l2);
			expect(l2.prevLeaf).to.equal(l1);
			expect(l2.nextLeaf).to.equal(l3);
			expect(l3.prevLeaf).to.equal(l2);
			expect(l3.nextLeaf).to.equal(end);
			expect(end.prevLeaf).to.equal(l3);

			// Redo (ready history steps and immediately push past step after redo())
			readyTempHistorySteps();
			redo();
			History.push(copyHistoryStep(TempHistoryPastStep), true);

			expect(start.nextLeaf).to.equal(z);
			expect(z.prevLeaf).to.equal(start);
			expect(z.nextLeaf).to.equal(end);
			expect(end.prevLeaf).to.equal(z);

			done();
		});

		it('autoMergeLeaf', function(done) {
			let start = new Leaf({
				text: 'start'
			});

			let end = new Leaf({
				text: 'end'
			});

			let l1 = new Leaf({
				text: 'l1',
				styles: new LeafStyles({
					bold: true
				})
			});

			let l2 = new Leaf();

			let l3 = new Leaf({
				text: 'l3',
				styles: new LeafStyles({
					bold: true
				})
			});

			// Create a chain
			chainLeaf(l1, start);
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			chainLeaf(end, l3);
			start.new = false;
			l1.new = false;
			l3.new = false;
			end.new = false;

			// autoMergeLeaf on l2
			autoMergeLeaf(l2);

			expect(start.nextLeaf).to.equal(l2);
			expect(l2.prevLeaf).to.equal(start);
			expect(l2.nextLeaf).to.equal(end);
			expect(end.prevLeaf).to.equal(l2);

			done();
		})

	});
	
	describe('applyLeafStyle', function() {
		
		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			DirtyNewLeaves.length = 0;
			done();
		});

		describe('Range is within a single Leaf', function() {

			it('Hello, world! - make \'Hello\' bold', function(done) {
				const l1 = new Leaf({
					text: 'Hello, world!'
				});

				const n1 = new Node();

				setParentLink(l1, n1);

				n1.new = false;
				l1.new = false;

				const range = [0, 5];

				const newStyles = {
					bold: true
				};

				applyLeafStyle(l1, range, newStyles);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				let result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.parent).to.equal(n1);
				expect(step.child).to.equal(l1);

				expect(DirtyNewLeaves.length).to.equal(2);
				expect(DirtyNewLeaves[0].text).to.equal('Hello');
				expect(DirtyNewLeaves[0].styles.bold).to.be.true;
				expect(DirtyNewLeaves[1].text).to.equal(', world!');
				expect(DirtyNewLeaves[1].styles.bold).to.be.false;

				done();
			});

			it('Hello, world! - make \'rld!\' italic', function(done) {
				let l1 = new Leaf({
					text: 'Hello, world!'
				});
				const n1 = new Node();

				setParentLink(l1, n1);

				n1.new = false;
				l1.new = false;

				const range = [9, l1.text.length];

				const newStyles = {
					italic: true
				};

				applyLeafStyle(l1, range, newStyles);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				let result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.parent).to.equal(n1);
				expect(step.child).to.equal(l1);

				expect(DirtyNewLeaves.length).to.equal(2);
				expect(DirtyNewLeaves[0].text).to.equal('rld!');
				expect(DirtyNewLeaves[0].styles.italic).to.be.true;
				expect(DirtyNewLeaves[1].text).to.equal('Hello, wo');
				expect(DirtyNewLeaves[1].styles.italic).to.be.false;

				done();
			});

			it('Hello, world! - make \'o, wor\' underlined, bold, and italic', function(done) {
				let l1 = new Leaf({
					text: 'Hello, world!'
				});

				const n1 = new Node();

				setParentLink(l1, n1);

				n1.new = false;
				l1.new = false;

				const range = [4, 10];

				const newStyles = {
					underline: true,
					bold: true,
					italic: true
				};

				applyLeafStyle(l1, range, newStyles);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				let result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.parent).to.equal(n1);
				expect(step.child).to.equal(l1);

				expect(DirtyNewLeaves.length).to.equal(3);
				expect(DirtyNewLeaves[0].text).to.equal('o, wor');
				expect(DirtyNewLeaves[0].styles.italic).to.be.true;
				expect(DirtyNewLeaves[0].styles.bold).to.be.true;
				expect(DirtyNewLeaves[0].styles.underline).to.be.true;
				expect(DirtyNewLeaves[1].text).to.equal('Hell');
				expect(DirtyNewLeaves[2].text).to.equal('ld!');

				done();
			});

			it('Hello, world! - make \'Hello, world!\' bold', function(done) {
				let l1 = new Leaf({
					text: 'Hello, world!'
				});

				const n1 = new Node();

				setParentLink(l1, n1);

				n1.new = false;
				l1.new = false;

				const range = [0, 99];

				const newStyles = {
					bold: true
				};

				applyLeafStyle(l1, range, newStyles);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let step = pastStep[0];
				let result = step instanceof ParentLink;
				expect(result).to.be.true;
				expect(step.parent).to.equal(n1);
				expect(step.child).to.equal(l1);

				expect(DirtyNewLeaves.length).to.equal(1);
				expect(DirtyNewLeaves[0].text).to.equal('Hello, world!');
				expect(DirtyNewLeaves[0].styles.bold).to.be.true;

				done();
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
			const selections = [{
				leaf: l2,
				range: [2, l2.text.length]
			}, {
				leaf: l2,
				range: [2, l2.text.length]
			}];
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
			expect(lc.nextLeaf).to.equal(null);

			done();
		});

		it('startLeaf and endLeaf have the same parent', function(done) {
			readyTempHistorySteps();

			const newStyles = { bold: true };
			const selections = [{
				leaf: l4,
				range: [5, l4.text.length]
			}, {
				leaf: l5,
				range: [0, 4]
			}];
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
			lc.new = false;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('Leaf');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.false;
			expect(lc.new).to.be.true;
			lc.new = false;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal(' 5');
			expect(lc.styles.bold).to.be.false;
			expect(lc.styles.italic).to.be.false;
			expect(lc.new).to.be.true;
			lc.new = false;
			expect(lc.nextLeaf).to.equal(null);

			done();
		});

		it('startLeaf and endLeaf have different parents', function(done) {
			readyTempHistorySteps();

			const newStyles = { bold: true };
			const selections = [{
				leaf: l6,
				range: [0, 0]
			}, {
				leaf: l7,
				range: [0, l7.text.length]
			}];
			applyLeavesStyle(selections, newStyles);

			let cn = n4;
				let cl = cn.firstChild;
				let result = isZeroLeaf(cl);
				expect(result).to.be.true;
				expect(cl.styles.bold).to.be.true;
				expect(cl.new).to.be.true;
				cl.new = false;
				expect(cl.nextLeaf).to.equal(null);
			cn = cn.nextNode;
			expect(cn).to.equal(n5);
				cl = cn.firstChild;
				expect(cl.text).to.equal('Leaf 7');
				expect(cl.styles.bold).to.be.true;
				expect(cl.styles.underline).to.be.true;
				expect(cl.new).to.be.true;
				cl.new = false;
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
			lc = lc.nextLeaf;
			expect(lc.text).to.equal('Leaf');
			expect(lc.styles.bold).to.be.true;
			expect(lc.styles.italic).to.be.false;
			lc = lc.nextLeaf;
			expect(lc.text).to.equal(' 5');
			expect(lc.styles.bold).to.be.false;
			expect(lc.styles.italic).to.be.false;
			expect(lc.nextLeaf).to.equal(null);

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
			cn = cn.nextNode;
			expect(cn).to.equal(n5);
				cl = cn.firstChild;
				expect(cl.text).to.equal('Leaf 7');
				expect(cl.styles.bold).to.be.true;
				expect(cl.styles.underline).to.be.true;
				expect(cl.nextLeaf).to.equal(null);
			expect(cn.nextNode).to.equal(null);

			done();
		});

	});

});
