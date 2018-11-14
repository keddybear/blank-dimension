/* eslint-disable */
import { Leaf, LeafStyles, NullLeaf, LeafChain, LeafText } from '../leaf';
import { History, BlankHistoryStep } from '../history';
import {
	isZeroLeaf,
	printLeafChain,
	_PAST_STACK_,
	_FUTURE_STACK_,
	TempHistoryPastStep,
	TempHistoryFutureStep,
	_NOT_CHAINED_,
	_CHAINED_AFTER_,
	_CHAINED_BEFORE_,
	chainLeaf,
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
	readyHistoryStep,
	readyTempHistorySteps,
	copyHistoryStep,
	undo,
	redo,
	mergeLeafTexts,
	applyLeafText,
	applyText
} from '../integration';

const { expect } = require('chai');

describe('Leaf - Apply Text', function() {
	
	// Test if new Leaves created by applyLeafStyles have their own LeafStyles objects.
	describe.skip('applyLeafStyles - new Leaves have their own LeafStyles objects', function() {

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			DirtyNewLeaves.length = 0;
			done();
		});

		it('Hello - make \'ell\' bold', function(done) {
			const start = new Leaf({
				text: 'start|',
				styles: new LeafStyles({
					italic: true
				})
			});

			const l1 = new Leaf({
				text: 'Hello'
			});

			const end = new Leaf({
				text: '|end',
				styles: new LeafStyles({
					italic: true
				})
			});

			chainLeaf(l1, start);
			chainLeaf(end, l1);

			start.new = false;
			l1.new = false;
			end.new = false;

			const range = [1,4];

			const newStyles = {
				bold: true
			};

			applyLeafStyle(l1, range, newStyles);

			const newLeaf1 = start.nextLeaf;
			const newLeaf2 = newLeaf1.nextLeaf;
			const newLeaf3 = newLeaf2.nextLeaf;

			expect(newLeaf1.text).to.equal('H');
			expect(newLeaf2.text).to.equal('ell');
			expect(newLeaf3.text).to.equal('o');

			// Compare LeafStyles of newLeaf1 and newLeaf3
			let result = newLeaf1.styles !== newLeaf3.styles;
			expect(result).to.be.true;

			done();
		});

	});

	// Test if autoMergeLeaf will skip new Leaves that have been merged.
	describe.skip('autoMergeLeaf - consumed dirty Leaves should be skipped', function() {

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			DirtyNewLeaves.length = 0;
			done();
		});

		it('autoMergeLeaf() on [Hello ]-[darkness, my]-[ old friend.]', function(done) {
			const start = new Leaf({
				text: 'start|',
				styles: new LeafStyles({
					italic: true
				})
			});

			const l1 = new Leaf({
				text: 'Hello '
			});

			const l2 = new Leaf({
				text: 'darkness, my'
			});

			const l3 = new Leaf({
				text: ' old friend.'
			});

			const end = new Leaf({
				text: '|end',
				styles: new LeafStyles({
					italic: true
				})
			});

			chainLeaf(l1, start);
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			chainLeaf(end, l3);

			start.new = false;
			end.new = false;
			
			l1.consumed = false;
			DirtyNewLeaves.push(l1);
			l2.consumed = false;
			DirtyNewLeaves.push(l2);
			l3.consumed = false;
			DirtyNewLeaves.push(l3);

			expect(DirtyNewLeaves.length).to.equal(3);

			// autoMergeLeaf
			let called = 0;
			while (DirtyNewLeaves.length > 0) {
				const dirtyLeaf = DirtyNewLeaves.pop();
				if (!dirtyLeaf.consumed) {
					autoMergeLeaf(dirtyLeaf);
					called += 1;
				}
				delete dirtyLeaf.consumed;
			}

			expect(called).to.equal(1);
			expect(l3.text).to.equal('Hello darkness, my old friend.');
			printLeafChain(start); console.log(' ');

			// Show what happens if consumed Leaves are not skipped.
			autoMergeLeaf(l2);
			autoMergeLeaf(l1);
			printLeafChain(start); console.log(' ');

			done();
		});

	});

	describe.skip('mergeLeafTexts', function() {

		beforeEach(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			DirtyNewLeaves.length = 0;
			done();
		});

		it('Merge [0,1] with [1,2] - should succeed', function(done) {
			const l1 = new Leaf({
				text: 'Dude'
			});
			l1.new = false;

			const lt1 = new LeafText({
				leaf: l1,
				text: 'abc',
				range: [0,1]
			});

			const lt2 = new LeafText({
				leaf: l1,
				text: 'def',
				range: [1,2]
			});

			let success = mergeLeafTexts(lt2, lt1);
			expect(success).to.be.true;
			expect(lt1.text).to.equal('abcdef');
			expect(lt1.range[0]).to.equal(0);
			expect(lt1.range[1]).to.equal(2);

			done();
		});

		it('Merge [1,2] with [0,1] - should fail', function(done) {
			const l1 = new Leaf({
				text: 'Dude'
			});
			l1.new = false;

			const lt1 = new LeafText({
				leaf: l1,
				text: 'abc',
				range: [0,1]
			});

			const lt2 = new LeafText({
				leaf: l1,
				text: 'def',
				range: [1,2]
			});

			let success = mergeLeafTexts(lt1, lt2);
			expect(success).to.be.false;

			done();
		});

		it('Delete - Merge [0,0] with [0,0] - should succeed', function(done) {
			const l1 = new Leaf({
				text: 'de'
			});
			l1.new = false;

			const lt1 = new LeafText({
				leaf: l1,
				text: 'D',
				range: [0,0]
			});

			const lt2 = new LeafText({
				leaf: l1,
				text: 'u',
				range: [0,0]
			});
			
			// Undo
			// Dude + lt2 = iDude -> lt2` = [0,1], ''
			// iDude + lt1 = hiDude -> lt1` = [0,1], ''
			// Redo
			// hiDude + lt1` = iDude
			// iDude + l2` = Dude
			//
			// This is Delete

			let success = mergeLeafTexts(lt2, lt1);
			expect(success).to.be.true;
			expect(lt1.text).to.equal('Du');
			expect(lt1.range[0]).to.equal(0);
			expect(lt1.range[1]).to.equal(0);

			done();
		});

		it('Backspace - Merge [3,3], e with [2,2], d - should succeed', function(done) {
			const l1 = new Leaf({
				text: 'Du'
			});
			l1.new = false;

			const lt1 = new LeafText({
				leaf: l1,
				text: 'e',
				range: [3,3]
			});

			const lt2 = new LeafText({
				leaf: l1,
				text: 'd',
				range: [2,2]
			});

			let success = mergeLeafTexts(lt2, lt1);
			expect(success).to.be.true;
			expect(lt1.text).to.equal('de');
			expect(lt1.range[0]).to.equal(2);
			expect(lt1.range[1]).to.equal(2);

			done();
		});

	});

	describe('applyLeafText', function() {

		describe('Hello', function() {

			const l1 = new Leaf({
				text: 'Hello'
			});

			before(function(done) {
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				DirtyNewLeaves.length = 0;
				done();
			});

			it('Add x at 0,0', function(done) {
				l1.new = false;

				applyLeafText(l1, [0,0], 'x');

				expect(l1.text).to.equal('xHello');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let lt = pastStep[0];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('');
				expect(lt.range[0]).to.equal(0);
				expect(lt.range[1]).to.equal(1);

				done();
			});

			it('Add 180 at 2,6', function(done) {
				applyLeafText(l1, [2,6], '180');

				// Should readyTempHistorySteps() here because selection changed, but
				// it's testing, so no need, as long as you know what you're doing.

				expect(l1.text).to.equal('xH180');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);
				let lt = pastStep[1];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('ello');
				expect(lt.range[0]).to.equal(2);
				expect(lt.range[1]).to.equal(5);

				done();
			});

			it('Add 0 at 4,4', function(done) {
				applyLeafText(l1, [4,4], '0');

				expect(l1.text).to.equal('xH1800');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(3);
				let lt = pastStep[2];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('');
				expect(lt.range[0]).to.equal(4);
				expect(lt.range[1]).to.equal(5);

				done();
			});

		});

		describe('Consecutive typing & backspace & delete', function() {

			const l1 = new Leaf({
				text: ''
			});

			before(function(done) {
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				DirtyNewLeaves.length = 0;
				done();
			});

			it('Type D', function(done) {
				l1.new = false;
				applyLeafText(l1, [0,0], 'D');

				expect(l1.text).to.equal('D');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let lt = pastStep[0];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('\u200b');
				expect(lt.range[0]).to.equal(0);
				expect(lt.range[1]).to.equal(1);

				done();
			});

			it('Type u', function(done) {
				applyLeafText(l1, [1,1], 'u');

				expect(l1.text).to.equal('Du');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let lt = pastStep[0];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('\u200b');
				expect(lt.range[0]).to.equal(0);
				expect(lt.range[1]).to.equal(2);

				done();
			});

			it('Type d', function(done) {
				applyLeafText(l1, [2,2], 'd');

				expect(l1.text).to.equal('Dud');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let lt = pastStep[0];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('\u200b');
				expect(lt.range[0]).to.equal(0);
				expect(lt.range[1]).to.equal(3);

				done();
			});

			it('Type e', function(done) {
				applyLeafText(l1, [3,3], 'e');

				expect(l1.text).to.equal('Dude');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let lt = pastStep[0];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('\u200b');
				expect(lt.range[0]).to.equal(0);
				expect(lt.range[1]).to.equal(4);

				done();
			});

			it('Backspace at [4,4]', function(done) {
				// Ready history step because action changed
				readyTempHistorySteps();

				applyLeafText(l1, [3,4], '', 'backspace');

				expect(l1.text).to.equal('Dud');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let pastStack = History.stackPast;
				expect(pastStack.length).to.equal(1);

				let lt = pastStep[0];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('e');
				expect(lt.range[0]).to.equal(3);
				expect(lt.range[1]).to.equal(3);

				done();
			});

			it('Backspace at [3,3]', function(done) {
				applyLeafText(l1, [2,3], '', 'backspace');

				expect(l1.text).to.equal('Du');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let pastStack = History.stackPast;
				expect(pastStack.length).to.equal(1);

				let lt = pastStep[0];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('de');
				expect(lt.range[0]).to.equal(2);
				expect(lt.range[1]).to.equal(2);

				done();
			});

			it('Delete at [0,0]', function(done) {
				// Ready history step because selection changed
				readyTempHistorySteps();

				applyLeafText(l1, [0,1], '', 'delete');

				expect(l1.text).to.equal('u');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(1);
				let pastStack = History.stackPast;
				expect(pastStack.length).to.equal(2);

				let lt = pastStep[0];
				let result = lt instanceof LeafText;
				expect(result).to.be.true;
				expect(lt.text).to.equal('D');
				expect(lt.range[0]).to.equal(0);
				expect(lt.range[1]).to.equal(0);

				done();
			});

			it('Delete at [0,0]', function(done) {
				applyLeafText(l1, [0,1], '', 'delete');

				expect(l1.text).to.equal('u');
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(2);
				let pastStack = History.stackPast;
				expect(pastStack.length).to.equal(2);

				let l = pastStep[1];
				let result = l instanceof Leaf;
				expect(result).to.be.true;
				result = l === l1;
				expect(l.text).to.equal('u');

				done();
			});

		});

		describe('applyLeafText & undo & redo', function() {
			
			const start = new Leaf({
				text: 'start|',
				styles: new LeafStyles({
					italic: true
				})
			});

			const end = new Leaf({
				text: '|end',
				styles: new LeafStyles({
					italic: true
				})
			});

			const l1 = new Leaf({
				text: 'Daft Punk'
			});

			before(function(done) {
				TempHistoryPastStep.clear();
				TempHistoryFutureStep.clear();
				History.clear(_PAST_STACK_);
				History.clear(_FUTURE_STACK_);
				DirtyNewLeaves.length = 0;
				done();
			});

			it('Delete a Leaf between start and end', function(done) {
				chainLeaf(l1, start);
				chainLeaf(end, l1);
				start.new = false;
				end.new = false;
				l1.new = false;

				// Delete l1
				applyLeafText(l1, [0,99], '');

				// zero-width Leaf will merge with start and end
				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(3);
				let leaf0 = pastStep[0];
				let leaf1 = pastStep[1];
				let leaf2 = pastStep[2];

				let result = leaf0 === l1;
				expect(result).to.be.true;
				expect(leaf0.prevLeaf).to.equal(start);
				expect(leaf0.nextLeaf).to.equal(end);

				result = leaf1 === start;
				expect(result).to.be.true;
				result = leaf2 === end;
				expect(result).to.be.true;

				let zl = leaf1.nextLeaf;
				expect(leaf2.prevLeaf).to.equal(zl);
				expect(zl.text).to.equal('start||end');
				expect(zl.styles.italic).to.be.true;

				done();
			});

			it('Undo the deletion', function(done) {
				readyTempHistorySteps();
				undo();
				// This is a test, no need to push, for now.
				// History.push(copyHistoryStep(TempHistoryFutureStep));

				expect(start.nextLeaf).to.equal(l1);
				expect(end.prevLeaf).to.equal(l1);

				let futureStep = TempHistoryFutureStep.stack;
				expect(futureStep.length).to.equal(3);
				let leaf0 = futureStep[0];
				let leaf1 = futureStep[1];
				let leaf2 = futureStep[2];

				let result = leaf0 instanceof NullLeaf;
				expect(result).to.be.true;
				result = leaf1 instanceof NullLeaf;
				expect(result).to.be.true;
				result = leaf2 instanceof LeafChain;
				expect(result).to.be.true;

				let zl = leaf2.startLeaf;
				expect(leaf2.endLeaf).to.equal(zl);
				expect(leaf2.prevLeaf).to.equal(start);
				expect(leaf2.nextLeaf).to.equal(end);

				// Push history step now
				History.push(copyHistoryStep(TempHistoryFutureStep));
				done();
			});

			it('Redo the deletion', function(done) {
				readyTempHistorySteps();
				redo();
				// This is a test, no need to push, for now.
				// History.push(copyHistoryStep(TempHistoryPastStep), true);

				let pastStep = TempHistoryPastStep.stack;
				expect(pastStep.length).to.equal(3);
				let leaf0 = pastStep[0];
				let leaf1 = pastStep[1];
				let leaf2 = pastStep[2];

				let result = leaf0 instanceof LeafChain;
				expect(result).to.be.true;
				expect(leaf0.startLeaf).to.equal(l1);
				expect(leaf0.endLeaf).to.equal(l1);
				expect(leaf0.prevLeaf).to.equal(start);
				expect(leaf0.nextLeaf).to.equal(end);

				result = leaf1 === start;
				expect(result).to.be.true;
				result = leaf2 === end;
				expect(result).to.be.true;

				let zl = leaf1.nextLeaf;
				expect(leaf2.prevLeaf).to.equal(zl);
				expect(zl.text).to.equal('start||end');
				expect(zl.styles.italic).to.be.true;

				done();
			});

		});

	});

	describe('applyText & undo & redo', function() {
		
		const start = new Leaf({
			text: 'start|',
			styles: new LeafStyles({
				italic: true
			})
		});

		const end = new Leaf({
			text: '|end',
			styles: new LeafStyles({
				italic: true
			})
		});

		const l1 = new Leaf({
			text: 'Hi ',
			styles: new LeafStyles({
				bold: true
			})
		});

		const l2 = new Leaf({
			text: 'darkness, my'
		});

		const l3 = new Leaf({
			text: ' old friend.',
			styles: new LeafStyles({
				bold: true
			})
		});

		before(function(done) {
			TempHistoryPastStep.clear();
			TempHistoryFutureStep.clear();
			History.clear(_PAST_STACK_);
			History.clear(_FUTURE_STACK_);
			DirtyNewLeaves.length = 0;
			done();
		});
		
		it('[Hi ]B-[darkness, my]-[ old friend.]B - delete \'dark\'', function(done) {
			chainLeaf(l1, start);
			chainLeaf(l2, l1);
			chainLeaf(l3, l2);
			chainLeaf(end, l3);
			start.new = false;
			l1.new = false;
			l2.new = false;
			l3.new = false;
			end.new = false;

			// Define selections
			const selections = [{
				leaf: l2,
				range: [0,4]
			}];

			const replacement = '';

			// Apply text
			applyText(selections, replacement);

			// Should use applyLeafText
			expect(l2.text).to.equal('ness, my');
			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(1);
			let lt = pastStep[0];
			let result = lt instanceof LeafText;
			expect(result).to.be.true;
			expect(lt.leaf).to.equal(l2);
			expect(lt.text).to.equal('dark');
			expect(lt.range[0]).to.equal(0);
			expect(lt.range[1]).to.equal(0);

			done();
		})

		it('Undo', function(done) {
			readyTempHistorySteps();
			undo();
			History.push(copyHistoryStep(TempHistoryFutureStep));
			expect(History.stackFuture.length).to.equal(1);

			expect(l2.text).to.equal('darkness, my');
			done();
		});

		it('Select \'i darkness, my\' and replace it with \'ello,\'', function(done) {
			const selections = [{
				leaf: l1,
				range: [1,2]
			}, {
				leaf: l2,
				range: [0,99]
			}];

			const replacement = 'ello,';

			readyTempHistorySteps(); // Should do nothing
			applyText(selections, replacement);

			const l4 = start.nextLeaf;
			expect(l4.text).to.equal('Hello, old friend.');
			expect(l4.styles.bold).to.be.true;
			expect(l4.nextLeaf).to.equal(end);

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(3);
			let leaf0 = pastStep[0];
			let leaf1 = pastStep[1];
			let leaf2 = pastStep[2];

			expect(leaf0).to.equal(l1);
			expect(leaf1).to.equal(l2);
			expect(leaf2).to.equal(l3);
			
			expect(leaf0.prevLeaf).to.equal(start);
			expect(leaf0.nextLeaf).to.equal(l2);
			expect(leaf1.prevLeaf).to.equal(l1);
			expect(leaf1.nextLeaf).to.equal(l3);
			expect(leaf2.prevLeaf).to.equal(l4);
			expect(leaf2.nextLeaf).to.equal(end);

			done();
		});

		it('Undo', function(done) {	
			// Undo
			readyTempHistorySteps(); // Should clear history future stack
			expect(History.stackFuture.length).to.equal(0);
			undo();
			// History.push(copyHistoryStep(TempHistoryFutureStep));
			// expect(History.stackFuture.length).to.equal(1);

			expect(start.nextLeaf).to.equal(l1);
			expect(l1.nextLeaf).to.equal(l2);
			expect(l2.nextLeaf).to.equal(l3);
			expect(l3.nextLeaf).to.equal(end);

			let futureStep = TempHistoryFutureStep.stack;
			expect(futureStep.length).to.equal(3);
			let leaf0 = futureStep[0];
			let leaf1 = futureStep[1];
			let leaf2 = futureStep[2];

			let result = leaf0 instanceof NullLeaf;
			expect(result).to.be.true;
			expect(leaf1).to.equal(leaf2);
			expect(leaf1.prevLeaf).to.equal(start);
			expect(leaf1.nextLeaf).to.equal(l3);

			History.push(copyHistoryStep(TempHistoryFutureStep));
			expect(History.stackFuture.length).to.equal(1);

			done();
		});

		it('Redo', function(done) {
			readyTempHistorySteps();
			redo();

			const l4 = start.nextLeaf;
			expect(l4.text).to.equal('Hello, old friend.');

			let pastStep = TempHistoryPastStep.stack;
			expect(pastStep.length).to.equal(2);
			let leaf0 = pastStep[0];
			let leaf1 = pastStep[1];

			let result = leaf0 instanceof LeafChain;
			expect(result).to.be.true;
			expect(leaf0.startLeaf).to.equal(l1);
			expect(leaf0.endLeaf).to.equal(l2);

			result = leaf1 instanceof LeafChain;
			expect(result).to.be.true;
			expect(leaf1.startLeaf).to.equal(l3);
			expect(leaf1.endLeaf).to.equal(l3);

			done();
		});

	});

});
