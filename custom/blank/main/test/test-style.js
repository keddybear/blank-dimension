/* eslint-disable */
import { Leaf, LeafStyles, NullLeaf, LeafChain } from '../leaf';
import { History, BlankHistoryStep } from '../history';
import {
	sameLeafStyles,
	setLeafStyles,
	copyLeafStyles,
	printLeafChain,
	isZeroLeaf,
	trimRange,
	destroyLeaf,
	unchain,
	_PAST_STACK_,
	_FUTURE_STACK_,
	TempHistoryPastStep,
	TempHistoryFutureStep,
	chained,
	_NOT_CHAINED_,
	_CHAINED_AFTER_,
	_CHAINED_BEFORE_,
	chain,
	_CHAIN_AFTER_,
	_CHAIN_BEFORE_,
	chainBetween,
	chainBetweenDangerous,
	rechain,
	consume,
	_TRAVERSE_UP_,
	_TRAVERSE_DOWN_,
	applyLeafStyle,
	DirtyNewLeaves,
	autoMergeLeaf,
	autoMergeDirtyLeaves,
	copyHistoryStep,
	readyHistoryStep,
	readyTempHistorySteps,
	undo,
	redo
} from '../integration';

const { expect } = require('chai');

describe.skip('Leaf', function() {
	
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

			printLeafChain(l1);

			l2 = destroyLeaf(l2);

			printLeafChain(l1);

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

	describe.skip('chained', function() {
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
			let result = chained(l1, l3);
			expect(result).to.equal(_NOT_CHAINED_);

			done();
		});

		it('l1 & l2: chained', function(done) {
			let result = chained(l1, l2);
			expect(result).to.equal(_CHAINED_BEFORE_);

			result = chained(l2, l1);
			expect(result).to.equal(_CHAINED_AFTER_);

			done();
		});

	});

	describe.skip('chain', function() {
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
			chain(l2, l1, _CHAIN_AFTER_);

			let result = chained(l1, l2);
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

		it('Throw Error: chain l2 before l3 - circular chain warning', function(done) {
			let e;
			try {
				chain(l2, l3, _CHAIN_BEFORE_);
			} catch (error) {
				e = error;
			} finally {
				let result = e instanceof Error;
				expect(result).to.be.true;
				console.log(e.message);
				done();
			}
		});

		it('chain l3 after l2', function(done) {
			chain(l3, l2, _CHAIN_AFTER_);

			let result = chained(l2, l3);
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
				chain(l3, l1, _CHAIN_AFTER_);
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
				chain(l2, l3, _CHAIN_AFTER_);
			} catch (error) {
				e = error;
			} finally {
				let result = e instanceof Error;
				expect(result).to.be.true;
				console.log(e.message);
				done();
			}
		});

		it('Throw Error: chain l1 after l3', function(done) {
			let e;
			try {
				chain(l1, l3, _CHAIN_AFTER_);
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

	describe.skip('chainBetween', function() {
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

			chain(l2, l1, _CHAIN_AFTER_);
			l1.new = false;
			l2.new = false;

			printLeafChain(l1); console.log(' ');

			chainBetween(l3, l3, l1, l2);
			
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

			printLeafChain(l1); console.log(' ');

			done();
		});

		it('chain l4-l5 between l1 and l3, unchain NullLeaf', function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			
			chain(l5, l4, _CHAIN_AFTER_);

			chainBetween(l4, l5, l3, l1);

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

			printLeafChain(l1); console.log(' ');

			done();			
		});
	});

	describe.skip('unchain', function() {
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

			chain(l1, l2, _CHAIN_AFTER_);

			const pastStep = TempHistoryPastStep.stack;

			let result = pastStep.length;
			expect(result).to.equal(1);

			result = pastStep[0] instanceof NullLeaf;
			expect(result).to.be.true;

			expect(pastStep[0].prevLeaf).to.equal(l2);
			expect(l2.nextLeaf).to.equal(l1);

			printLeafChain(l2); console.log(' ');

			done();
		});

		it('Chain l3-l4-l5 (new) after l2: unchain l1', function(done) {
			l1.new = false;

			chain(l4, l3, _CHAIN_AFTER_);
			chain(l5, l4, _CHAIN_AFTER_);

			chain(l3, l2, _CHAIN_AFTER_);

			const pastStep = TempHistoryPastStep.stack;

			let result = pastStep.length;
			expect(result).to.equal(2);

			result = pastStep[1] instanceof Leaf;
			expect(result).to.be.true;
			expect(pastStep[1]).to.equal(l1);

			expect(pastStep[1].prevLeaf).to.equal(l2);
			expect(l2.nextLeaf).to.equal(l3);

			printLeafChain(l2); console.log(' ');

			l3.new = false;
			l4.new = false;
			l5.new = false;

			done();
		});

	});

	describe.skip('history', function() {

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

	describe('rechain - chainBetween, LeafChain, redo, undo', function() {
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

			chain(end, start, _CHAIN_AFTER_);
			// Do not replace start or end
			start.new = false;
			end.new = false;

			// Insert
			chainBetween(l1, l1, start, end);
			// start-l1-end
			expect(start.nextLeaf).to.equal(l1);
			expect(end.prevLeaf).to.equal(l1);
			// unchained: nl(start, end)
			l1.new = false;
			printLeafChain(start); console.log(' ');

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
			printLeafChain(start); console.log(' ');

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
			printLeafChain(start); console.log(' ');
			
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
			chain(l3, l2, _CHAIN_AFTER_);

			// Replace l1 (Do not use chainBetweenDangerous)
			start.nextLeaf = l2;
			l2.prevLeaf = start;
			end.prevLeaf = l3;
			l3.nextLeaf = end;
			unchain(l1, _PAST_STACK_);
			// start-l2-l3-end
			expect(start.nextLeaf).to.equal(l2);
			expect(end.prevLeaf).to.equal(l3);
			// Unchained: l1
			printLeafChain(start); console.log(' ');

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
			printLeafChain(start); console.log(' ');
			
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
			printLeafChain(start); console.log(' ');

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
			let l1 = new Leaf({
				text: 'l1',
				styles: new LeafStyles({
					bold: true
				})
			});

			let l2 = new Leaf({
				text: 'l2',
				styles: new LeafStyles({
					bold: true
				})
			});

			chain(l2, l1, _CHAIN_AFTER_);
			l1.new = false;

			let result = consume(l2, _TRAVERSE_UP_);
			expect(result).to.be.true;
			expect(l2.text).to.equal('l1l2');
			expect(l2.styles.bold).to.be.true;
			expect(l2.prevLeaf).to.equal(null);
			expect(l2.nextLeaf).to.equal(null);

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

			chain(l2, l1, _CHAIN_AFTER_);
			l1.new = false;

			let result = consume(l2, _TRAVERSE_UP_);
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
			let l1 = new Leaf({
				text: 'l1',
				styles: new LeafStyles({
					bold: true
				})
			});

			let l2 = new Leaf();

			chain(l2, l1, _CHAIN_AFTER_);
			l1.new = false;

			let result = consume(l2, _TRAVERSE_UP_);
			expect(result).to.be.true;
			expect(l2.text).to.equal('l1');
			expect(l2.styles.bold).to.be.true;
			expect(l2.prevLeaf).to.equal(null);
			expect(l2.nextLeaf).to.equal(null);

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

			chain(l2, l1, _CHAIN_AFTER_);
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

			chain(l2, l1, _CHAIN_AFTER_);
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

			chain(l2, l1, _CHAIN_AFTER_);
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
			chain(l1, start, _CHAIN_AFTER_);
			chain(l2, l1, _CHAIN_AFTER_);
			chain(l3, l2, _CHAIN_AFTER_);
			chain(end, l3, _CHAIN_AFTER_);
			start.new = false;
			l1.new = false;
			l2.new = false;
			l3.new = false;
			end.new = false;
			printLeafChain(start); console.log(' ');
			
			// Create a zero Leaf
			let z = new Leaf();

			// Replace l2 with zero Leaf
			chainBetweenDangerous(z, z, l1, l3);
			expect(l1.nextLeaf).to.equal(z);
			expect(z.prevLeaf).to.equal(l1);
			expect(z.nextLeaf).to.equal(l3);
			expect(l3.prevLeaf).to.equal(z);
			printLeafChain(start); console.log(' ');

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
			result = consume(z, _TRAVERSE_UP_);
			expect(result).to.be.true;
			result = consume(z, _TRAVERSE_UP_);
			expect(result).to.be.false;
			result = consume(z, _TRAVERSE_DOWN_);
			expect(result).to.be.true;
			result = consume(z, _TRAVERSE_DOWN_);
			expect(result).to.be.false;
			
			expect(z.text).to.equal('l1l3');
			expect(z.styles.bold).to.be.true;
			printLeafChain(start); console.log(' ');
			z.new = false;
			
			expect(pastStep.length).to.equal(3);
			expect(pastStep[1]).to.equal(l1);
			expect(pastStep[2]).to.equal(l3);

			// Undo (ready history steps and immediately push future step after undo())
			readyTempHistorySteps();
			undo();
			History.push(copyHistoryStep(TempHistoryFutureStep));
			printLeafChain(start); console.log(' ');

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
			printLeafChain(start); console.log(' ');

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
			chain(l1, start, _CHAIN_AFTER_);
			chain(l2, l1, _CHAIN_AFTER_);
			chain(l3, l2, _CHAIN_AFTER_);
			chain(end, l3, _CHAIN_AFTER_);
			start.new = false;
			l1.new = false;
			l3.new = false;
			end.new = false;
			printLeafChain(start); console.log(' ');

			// autoMergeLeaf on l2
			autoMergeLeaf(l2, _TRAVERSE_UP_);
			printLeafChain(start); console.log(' ');

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
				let l1 = new Leaf({
					text: 'Hello, world!'
				});
				l1.new = false;

				const range = [0, 5];

				const newStyles = {
					bold: true
				};

				applyLeafStyle(l1, range, newStyles);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				expect(pastStep[0]).to.equal(l1);

				expect(DirtyNewLeaves.length).to.equal(2);
				expect(DirtyNewLeaves[0].text).to.equal('Hello');
				expect(DirtyNewLeaves[0].styles.bold).to.be.true;
				expect(DirtyNewLeaves[1].text).to.equal(', world!');
				expect(DirtyNewLeaves[1].styles.bold).to.be.false;

				printLeafChain(DirtyNewLeaves[0]); console.log(' ');

				done();
			});

			it('Hello, world! - make \'rld!\' italic', function(done) {
				let l1 = new Leaf({
					text: 'Hello, world!'
				});
				l1.new = false;

				const range = [9, 99];

				const newStyles = {
					italic: true
				};

				applyLeafStyle(l1, range, newStyles);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				expect(pastStep[0]).to.equal(l1);

				expect(DirtyNewLeaves.length).to.equal(2);
				expect(DirtyNewLeaves[0].text).to.equal('Hello, wo');
				expect(DirtyNewLeaves[0].styles.italic).to.be.false;
				expect(DirtyNewLeaves[1].text).to.equal('rld!');
				expect(DirtyNewLeaves[1].styles.italic).to.be.true;

				printLeafChain(DirtyNewLeaves[0]); console.log(' ');

				done();
			});

			it('Hello, world! - make \'o, wor\' underlined, bold, and italic', function(done) {
				let l1 = new Leaf({
					text: 'Hello, world!'
				});
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
				expect(pastStep[0]).to.equal(l1);

				expect(DirtyNewLeaves.length).to.equal(3);
				expect(DirtyNewLeaves[0].text).to.equal('Hell');
				expect(DirtyNewLeaves[1].text).to.equal('o, wor');
				expect(DirtyNewLeaves[1].styles.italic).to.be.true;
				expect(DirtyNewLeaves[1].styles.bold).to.be.true;
				expect(DirtyNewLeaves[1].styles.underline).to.be.true;
				expect(DirtyNewLeaves[2].text).to.equal('ld!');

				printLeafChain(DirtyNewLeaves[0]); console.log(' ');

				done();
			});

			it('Hello, world! - make \'Hello, world!\' bold', function(done) {
				let l1 = new Leaf({
					text: 'Hello, world!'
				});
				l1.new = false;

				const range = [0, 99];

				const newStyles = {
					bold: true
				};

				applyLeafStyle(l1, range, newStyles);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				expect(pastStep[0]).to.equal(l1);

				expect(DirtyNewLeaves.length).to.equal(1);
				expect(DirtyNewLeaves[0].text).to.equal('Hello, world!');
				expect(DirtyNewLeaves[0].styles.bold).to.be.true;

				printLeafChain(DirtyNewLeaves[0]); console.log(' ');

				done();
			});

		});

		describe('Range spans across three Leaves', function() {
			
			it('[Rang spans]B-[ across ]I-[three Leaves] - make \'pans across thr\' bold', function(done) {
				let l1 = new Leaf({
					text: 'Range spans',
					styles: new LeafStyles({
						bold: true
					})
				});

				let l2 = new Leaf({
					text: ' across ',
					styles: new LeafStyles({
						italic: true
					})
				});

				let l3 = new Leaf({
					text: 'three Leaves'
				});

				chain(l2, l1, _CHAIN_AFTER_);
				chain(l3, l2, _CHAIN_AFTER_);

				l1.new = false;
				l2.new = false;
				l3.new = false;

				const selections = [{
					leaf: l1,
					range: [6, 10]
				}, {
					leaf: l2,
					range: [0, 50]
				}, {
					leaf: l3,
					range: [0, 3]
				}];

				const newStyles = {
					bold: true
				};

				for (const selection of selections) {
					applyLeafStyle(selection.leaf, selection.range, newStyles);
				}

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);
				expect(pastStep[0]).to.equal(l2);
				expect(pastStep[1]).to.equal(l3);

				expect(DirtyNewLeaves.length).to.equal(3);
				expect(DirtyNewLeaves[0].text).to.equal(' across ');
				expect(DirtyNewLeaves[0].styles.bold).to.be.true;
				expect(DirtyNewLeaves[0].styles.italic).to.be.true;

				expect(DirtyNewLeaves[1].text).to.equal('thr');
				expect(DirtyNewLeaves[1].styles.bold).to.be.true;
				
				expect(DirtyNewLeaves[2].text).to.equal('ee Leaves');
				expect(DirtyNewLeaves[2].styles.bold).to.be.false;

				printLeafChain(l1); console.log(' ');

				done();
			});

		});

		describe('autoMergeLeaf && undo && redo', function() {
			
			it ('[This ]-[is]B-[ the final test] - make \'is\' not bold', function(done) {
				let start = new Leaf({
					text: 'start|',
					styles: new LeafStyles({
						italic: true
					})
				})

				let l1 = new Leaf({
					text: 'This '
				});

				let l2 = new Leaf({
					text: 'is',
					styles: new LeafStyles({
						bold: true
					})
				});

				let l3 = new Leaf({
					text: ' the final test'
				});

				let end = new Leaf({
					text: '|end',
					styles: new LeafStyles({
						italic: true
					})
				})
				
				chain(l1, start, _CHAIN_AFTER_);
				chain(l2, l1, _CHAIN_AFTER_);
				chain(l3, l2, _CHAIN_AFTER_);
				chain(end, l3, _CHAIN_AFTER_);
				
				start.new = false;
				l1.new = false;
				l2.new = false;
				l3.new = false;
				end.new = false;
				printLeafChain(start); console.log(' ');

				const selections = [{
					leaf: l1,
					range: [0, 99]
				}, {
					leaf: l2,
					range: [0, 99]
				}, {
					leaf: l3,
					range: [0, 99]
				}];

				const newStyles = {
					bold: false
				};

				for (const selection of selections) {
					applyLeafStyle(selection.leaf, selection.range, newStyles);
				}

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				expect(pastStep[0]).to.equal(l2);

				expect(DirtyNewLeaves.length).to.equal(1);
				let l4 = DirtyNewLeaves[0];
				expect(l4.text).to.equal('is');
				expect(l4.styles.bold).to.be.false;

				// autoMergeLeaf
				autoMergeDirtyLeaves();

				expect(l4.text).to.equal('This is the final test');
				expect(l4.styles.bold).to.be.false;

				expect(pastStep.length).to.equal(3);
				expect(pastStep[1]).to.equal(l1);
				expect(pastStep[2]).to.equal(l3);

				expect(start.nextLeaf).to.equal(l4);
				expect(l4.prevLeaf).to.equal(start);
				expect(l4.nextLeaf).to.equal(end);
				expect(end.prevLeaf).to.equal(l4);

				l4.new = false;
				printLeafChain(start); console.log(' ');

				// Undo (ready history steps and immediately push future step after undo())
				readyTempHistorySteps();
				undo();
				History.push(copyHistoryStep(TempHistoryFutureStep));
				printLeafChain(start); console.log(' ');

				expect(start.nextLeaf).to.equal(l1);
				expect(l1.prevLeaf).to.equal(start);
				expect(l1.text).to.equal('This ');
				expect(l1.styles.bold).to.be.false;
				expect(l1.nextLeaf).to.equal(l2);
				expect(l2.prevLeaf).to.equal(l1);
				expect(l2.text).to.equal('is');
				expect(l2.styles.bold).to.be.true;
				expect(l2.nextLeaf).to.equal(l3);
				expect(l3.prevLeaf).to.equal(l2);
				expect(l3.text).to.equal(' the final test');
				expect(l3.styles.bold).to.be.false;
				expect(l3.nextLeaf).to.equal(end);
				expect(end.prevLeaf).to.equal(l3);

				// Redo (ready history steps and immediately push past step after redo())
				readyTempHistorySteps();
				redo();
				History.push(copyHistoryStep(TempHistoryPastStep), true);
				printLeafChain(start); console.log(' ');

				expect(start.nextLeaf).to.equal(l4);
				expect(l4.prevLeaf).to.equal(start);
				expect(l4.text).to.equal('This is the final test');
				expect(l4.styles.bold).to.be.false;
				expect(l4.nextLeaf).to.equal(end);
				expect(end.prevLeaf).to.equal(l4);

				done();
			});

		});

	});

});
