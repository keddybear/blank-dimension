/* eslint-disable */
import Leaf from './leaf';

const { expect } = require('chai');

const leaf = new Leaf({
	text: 'Hello, World!'
});

describe('Leaf', function() {
	
	describe.skip('trimRange', function() {
		
		it('Pass []', function(done) {
			const r = leaf.trimRange([]);
			expect(r).to.deep.equal([0, 0]);
			done();
		});

		it('Pass [0, 5]', function(done) {
			const r = leaf.trimRange([0, 5]);
			expect(r).to.deep.equal([0, 5]);
			done();
		});

		it('Pass [8, 3]', function(done) {
			const r = leaf.trimRange([8, 3]);
			expect(r).to.deep.equal([3, 8]);
			done();
		});

		it('Pass [9]', function(done) {
			const r = leaf.trimRange([9]);
			expect(r).to.deep.equal([0, 0]);
			done();
		});

		it('Pass [99, 2]', function(done) {
			const r = leaf.trimRange([99, 2]);
			expect(r).to.deep.equal([2, leaf.text.length]);
			done();
		});

		it('Pass [2, 99, 35]', function(done) {
			const r = leaf.trimRange([2, 99, 35]);
			expect(r).to.deep.equal([2, leaf.text.length]);
			done();
		});

		it('Pass [-1, 4]', function(done) {
			const r = leaf.trimRange([-1, 4]);
			expect(r).to.deep.equal([0, 4]);
			done();
		});

	});

	describe('applyStyle', function() {
		
		it('Set Bold to \'Hello\'', function(done) {
			const l1 = leaf.applyStyle({ bold: true }, [0, 5]);
			const l2 = l1.nextLeaf;
			const l3 = l2.nextLeaf;

			expect(l1.text).to.equal('\u200b');
			expect(l1.bold).to.be.false;

			expect(l2.text).to.equal('Hello');
			expect(l2.bold).to.be.true;

			expect(l3.text).to.equal(', World!');
			expect(l3.bold).to.be.false;
			
			console.log(' ');
			l3.printChain();
			console.log(' ');

			done();
		});

		it('Set Italic to \'Wo\'', function(done) {
			const l1 = leaf.applyStyle({ italic: true }, [7, 9]);
			const l2 = l1.nextLeaf;
			const l3 = l2.nextLeaf;

			expect(l1.text).to.equal('Hello, ');
			expect(l1.italic).to.be.false;

			expect(l2.text).to.equal('Wo');
			expect(l2.italic).to.be.true;

			expect(l3.text).to.equal('rld!');
			expect(l3.italic).to.be.false;
			
			console.log(' ');
			l3.printChain();
			console.log(' ');
			
			done();
		});

		it('Set Underline to \'rld!\'', function(done) {
			const l1 = leaf.applyStyle({ underline: true }, [99, 9, 2]);
			const l2 = l1.nextLeaf;
			const l3 = l2.nextLeaf;

			expect(l1.text).to.equal('Hello, Wo');
			expect(l1.underline).to.be.false;

			expect(l2.text).to.equal('rld!');
			expect(l2.underline).to.be.true;

			expect(l3.text).to.equal('\u200b');
			expect(l3.underline).to.be.false;
			
			console.log(' ');
			l3.printChain();
			console.log(' ');
			
			done();
		});

	});

});
