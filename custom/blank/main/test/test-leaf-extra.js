/* eslint-disable */
import { Leaf, LeafStyles, NullLeaf, LeafChain, LeafText } from '../leaf';
import { History, BlankHistoryStep } from '../history';
import {
	isZeroLeaf,
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
	mergeLeafTexts
} from '../integration';

const { expect } = require('chai');

describe('Leaf Action Helpers', function() {
	
	// Test if new Leaves created by applyLeafStyles have their own LeafStyles objects.
	describe('applyLeafStyles - new Leaves have their own LeafStyles objects', function() {

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
	describe('autoMergeLeaf - consumed dirty Leaves should be skipped', function() {

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

			// Show what happens if consumed Leaves are not skipped.
			autoMergeLeaf(l2);
			autoMergeLeaf(l1);

			done();
		});

	});

	describe('mergeLeafTexts', function() {

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

});
