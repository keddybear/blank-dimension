/* eslint-disable */
import { Node, DocumentRoot } from '../../node';
import { Leaf, LeafStyles } from '../../leaf';
import {
	chainNode,
	chainLeaf,
	setParentLink
} from '../../integration';
import {
	BlankMap,
	getNearestLeafSelection,
	BlankSelection,
	BeforeActionSelection,
	PostActionSelection,
	isZeroWidth,
	clearBlankSelection,
	copySelectionObject,
	copyBlankSelection
} from '../../selection';
import { loadHTML } from '../setup';

const { expect } = require('chai');

/*
	Selection ui tests, except for setWindowSelection() and onSelectionChangeHandler().
*/

describe('Selection UI Tests', function() {

	const n1 = new Node({ nodeType: 0 });
		const l2 = new Leaf({ text: 'Provident beatae deserunt aut soluta rerum aut voluptas perspiciatis. Exercitationem porro expedita dolorem. Sed dolores ut illum veritatis.' });
	const n3 = new Node({ nodeType: 0 });
		const l4 = new Leaf({ text: 'Consequuntur optio sit ' });
	const n5 = new Node({ nodeType: 0 });
		const l6 = new Leaf();
	// Weird Node
	const n7 = new Node({ nodeType: 3 });
		// Weird Leaf
		const l8 = new Leaf({ text: 'Sit pariatur molestias ut. Voluptatem modi sed est nihil ut. Nihil rerum sit velit ut asperiores deleniti quam.' });
	const n9 = new Node({ nodeType: 0 });
		const l10 = new Leaf({ text: 'Sit ea blanditiis consequuntur commodi. Aperiam necessitatibus eos. Occaecati asperiores sapiente omnis omnis quia dolores sint amet et. Minima repellat qui sed beatae dolorum dolorum accusamus voluptas amet. Non ut at quidem nesciunt.' });
	// Image Node
	const n11 = new Node({ nodeType: 1 });
		// Image Leaf
		const l12 = new Leaf({ text: 'https://wallpapercave.com/wp/LHTNEGF.jpg', type: 1 });
	// Unordered List Node
	const n13 = new Node({ nodeType: 1 });
		// List Item Node
		const n14 = new Node({ nodeType: 2 });
			const l15 = new Leaf({ text: 'Sit pariatur molestias ut.' });
		// List Item Node
		const n16 = new Node({ nodeType: 2 });
			const l17 = new Leaf();
		// List Item Node
		const n18 = new Node({ nodeType: 2 });
			const l19 = new Leaf({ text: 'Quas sint aliquid ipsam consequatur. Rerum doloremque nemo eum dolores qui non aliquam quis voluptas. Mollitia ipsum vel vero. Dolorem in nam praesentium. Veritatis quo eaque quas aut. Aliquam ipsam possimus fuga ipsa soluta commodi sint.' });
	const n20 = new Node({ nodeType: 0 });
		const l21 = new Leaf({ text: 'Et aut omnis soluta animi est. Exercitationem rerum impedit ullam dolore temporibus. Assumenda ut quo provident doloremque fugiat modi quia provident inventore. Animi consequatur aliquid ut nobis. Iusto accusantium sed repellat consectetur amet delectus voluptatem.' });

		// New Leaves after (l4)
		const l22 = new Leaf ({ text: 'dolore. Et maiores dignissimos', styles: new LeafStyles({ bold: true })});
		const l23 = new Leaf ({ text: ' similique fuga illo. Natus voluptatum aspernatur vitae est nihil ut illo. Velit dicta fuga aperiam rerum impedit exercitationem ea.' });	

	before(function(done) {
		// Build Blank Tree
		DocumentRoot.firstChild = null;

		setParentLink(n1, null);
		chainNode(n3, n1);
			setParentLink(l2, n1);
		chainNode(n5, n3);
			setParentLink(l4, n3);
			chainLeaf(l22, l4);
			chainLeaf(l23, l22);
		chainNode(n7, n5);
			setParentLink(l6, n5);
		chainNode(n9, n7);
			setParentLink(l8, n7);
		chainNode(n11, n9);
			setParentLink(l10, n9);
		chainNode(n13, n11);
			setParentLink(n14, n13);
				setParentLink(l15, n14);
			chainNode(n16, n14);
				setParentLink(l17, n16);
			chainNode(n18, n16);
				setParentLink(l19, n18);
		chainNode(n20, n13);
			setParentLink(l21, n20);
		// Load HTML
		loadHTML('./custom/blank/main/ui-test/sample.html').then(() => {
			// Map Blank Element
			BlankMap.set(document.querySelector('[data-leaf-key="2"'), l2);
			BlankMap.set(document.querySelector('[data-leaf-key="4"'), l4);
			BlankMap.set(document.querySelector('[data-leaf-key="6"'), l6);
			BlankMap.set(document.querySelector('[data-leaf-key="8"'), l8);
			BlankMap.set(document.querySelector('[data-leaf-key="10"'), l10);
			BlankMap.set(document.querySelector('[data-leaf-key="12"'), l12);
			BlankMap.set(document.querySelector('[data-leaf-key="15"'), l15);
			BlankMap.set(document.querySelector('[data-leaf-key="17"'), l17);
			BlankMap.set(document.querySelector('[data-leaf-key="19"'), l19);
			BlankMap.set(document.querySelector('[data-leaf-key="21"'), l21);
			BlankMap.set(document.querySelector('[data-leaf-key="22"'), l22);
			BlankMap.set(document.querySelector('[data-leaf-key="23"'), l23);
			done();
		}).catch(err => {
			console.log(err);
			done();
		});
	});

	describe('BlankMap', function() {

		it('has', function(done) {
			let result = BlankMap.has(document.querySelector('[data-leaf-key="2"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="4"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="6"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="8"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="10"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="12"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="15"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="17"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="19"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="21"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="22"'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="23"'));
			expect(result).to.be.true;

			done();
		});

		it('delete', function(done) {
			BlankMap.delete(document.querySelector('[data-leaf-key="23"'));
			let result = BlankMap.has(document.querySelector('[data-leaf-key="23"'));
			expect(result).to.be.false;

			done();
		});

		it('get', function(done) {
			let be = BlankMap.get(document.querySelector('[data-leaf-key="2"'));
			expect(be).to.equal(l2);
			be = BlankMap.get(document.querySelector('[data-leaf-key="4"'));
			expect(be).to.equal(l4);
			be = BlankMap.get(document.querySelector('[data-leaf-key="6"'));
			expect(be).to.equal(l6);
			be = BlankMap.get(document.querySelector('[data-leaf-key="8"'));
			expect(be).to.equal(l8);
			be = BlankMap.get(document.querySelector('[data-leaf-key="10"'));
			expect(be).to.equal(l10);
			be = BlankMap.get(document.querySelector('[data-leaf-key="12"'));
			expect(be).to.equal(l12);
			be = BlankMap.get(document.querySelector('[data-leaf-key="15"'));
			expect(be).to.equal(l15);
			be = BlankMap.get(document.querySelector('[data-leaf-key="17"'));
			expect(be).to.equal(l17);
			be = BlankMap.get(document.querySelector('[data-leaf-key="19"'));
			expect(be).to.equal(l19);
			be = BlankMap.get(document.querySelector('[data-leaf-key="21"'));
			expect(be).to.equal(l21);
			be = BlankMap.get(document.querySelector('[data-leaf-key="22"'));
			expect(be).to.equal(l22);
			be = BlankMap.get(document.querySelector('[data-leaf-key="23"'));
			expect(be).to.equal(undefined);

			BlankMap.set(document.querySelector('[data-leaf-key="23"'), l23);
			let result = BlankMap.has(document.querySelector('[data-leaf-key="23"'));
			expect(result).to.be.true;
			done();
		});

	});

	describe('BlankSelection', function() {

		describe('Selection is collapsed', function() {

			it('Leaf is text', function(done) {
				const anchor = document.querySelector('[data-leaf-key="2"');
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 5, 5);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l2);
				expect(bs.end.leaf).to.equal(l2);
				expect(bs.start.range[0]).to.equal(5);
				expect(bs.start.range[1]).to.equal(5);
				expect(bs.end.range[0]).to.equal(5);
				expect(bs.end.range[1]).to.equal(5);

				done();
			});

			it('Leaf is empty', function(done) {
				const anchor = document.querySelector('[data-leaf-key="17"');
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 0, 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l17);
				expect(bs.end.leaf).to.equal(l17);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				done();
			});

			it('Leaf is image', function(done) {

			});

			it('Leaf contains multiple <div> and <span>', function(done) {

			});

		});

		describe('Selection is in one Leaf', function() {
			
			it('Leaf is text', function(done) {

			});

			it('Leaf is text and selection is backward', function(done) {

			});

			it('Leaf is image', function(done) {

			});

			it('Leaf is image and selection is backward', function(done) {

			});

			it('Leaf contains multiple <div> and <span>', function(done) {

			});

			it('Leaf contains multiple <div> and <span> and selection is backward', function(done) {

			});

		});

		describe('Selection spans multiple Nodes', function() {

			it('anchor and focus are text Leaves in the same Node', function(done) {

			});

			it('anchor and focus are text Leaves in the same Node, and selection is backward', function(done) {

			});

			it('anchor and focus are text Leaves at the same depth', function(done) {

			});

			it('anchor and focus are text Leaves at the same depth, and selection is backward', function(done) {

			});

			it('anchor and focus are text Leaves at different depths', function(done) {

			});

			it('anchor and focus are text Leaves at different depths, and selection is backward', function(done) {

			});

			it('anchor and focus are empty', function(done) {

			});

			it('anchor is non-text and focus is text', function(done) {

			});

			it('anchor is non-text and focus is text, and selection is backward', function(done) {

			});

			it('anchor is non-text and focus is complex', function(done) {

			});

			it('anchor is non-text and focus is complex, and selection is backward', function(done) {

			});

		});

		describe('Arbitrary positions', function(done) {

		});

	});

});
