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
import { expect } from 'chai';

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
		const l12 = new Leaf({ custom: { src: 'https://wallpapercave.com/wp/LHTNEGF.jpg' }, type: 1 });
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
		loadHTML('./custom/blank/main/ui-test/sample-2.html').then(() => {
			// Assign DocumentRoot's container
			DocumentRoot.container = document.querySelector('.blank-container');
			// Map Blank Element
			BlankMap.set(document.querySelector('[data-leaf-key="2"]'), l2);
			BlankMap.set(document.querySelector('[data-leaf-key="4"]'), l4);
			BlankMap.set(document.querySelector('[data-leaf-key="6"]'), l6);
			BlankMap.set(document.querySelector('[data-leaf-key="8"]'), l8);
			BlankMap.set(document.querySelector('[data-leaf-key="10"]'), l10);
			BlankMap.set(document.querySelector('[data-leaf-key="12"]'), l12);
			BlankMap.set(document.querySelector('[data-leaf-key="15"]'), l15);
			BlankMap.set(document.querySelector('[data-leaf-key="17"]'), l17);
			BlankMap.set(document.querySelector('[data-leaf-key="19"]'), l19);
			BlankMap.set(document.querySelector('[data-leaf-key="21"]'), l21);
			BlankMap.set(document.querySelector('[data-leaf-key="22"]'), l22);
			BlankMap.set(document.querySelector('[data-leaf-key="23"]'), l23);
			done();
		}).catch(err => {
			console.log(err);
			done();
		});
	});

	describe('BlankMap', function() {

		it('has', function(done) {
			let result = BlankMap.has(document.querySelector('[data-leaf-key="2"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="4"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="6"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="8"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="10"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="12"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="15"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="17"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="19"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="21"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="22"]'));
			expect(result).to.be.true;
			result = BlankMap.has(document.querySelector('[data-leaf-key="23"]'));
			expect(result).to.be.true;

			done();
		});

		it('delete', function(done) {
			BlankMap.delete(document.querySelector('[data-leaf-key="23"]'));
			let result = BlankMap.has(document.querySelector('[data-leaf-key="23"]'));
			expect(result).to.be.false;

			done();
		});

		it('get', function(done) {
			let be = BlankMap.get(document.querySelector('[data-leaf-key="2"]'));
			expect(be).to.equal(l2);
			be = BlankMap.get(document.querySelector('[data-leaf-key="4"]'));
			expect(be).to.equal(l4);
			be = BlankMap.get(document.querySelector('[data-leaf-key="6"]'));
			expect(be).to.equal(l6);
			be = BlankMap.get(document.querySelector('[data-leaf-key="8"]'));
			expect(be).to.equal(l8);
			be = BlankMap.get(document.querySelector('[data-leaf-key="10"]'));
			expect(be).to.equal(l10);
			be = BlankMap.get(document.querySelector('[data-leaf-key="12"]'));
			expect(be).to.equal(l12);
			be = BlankMap.get(document.querySelector('[data-leaf-key="15"]'));
			expect(be).to.equal(l15);
			be = BlankMap.get(document.querySelector('[data-leaf-key="17"]'));
			expect(be).to.equal(l17);
			be = BlankMap.get(document.querySelector('[data-leaf-key="19"]'));
			expect(be).to.equal(l19);
			be = BlankMap.get(document.querySelector('[data-leaf-key="21"]'));
			expect(be).to.equal(l21);
			be = BlankMap.get(document.querySelector('[data-leaf-key="22"]'));
			expect(be).to.equal(l22);
			be = BlankMap.get(document.querySelector('[data-leaf-key="23"]'));
			expect(be).to.equal(undefined);

			BlankMap.set(document.querySelector('[data-leaf-key="23"]'), l23);
			let result = BlankMap.has(document.querySelector('[data-leaf-key="23"]'));
			expect(result).to.be.true;
			done();
		});

	});

	describe('BlankSelection', function() {

		describe('Selection is collapsed', function() {

			it('Leaf is text', function(done) {
				const anchor = document.querySelector('[data-leaf-key="2"]');
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
				const anchor = document.querySelector('[data-leaf-key="17"]');
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
				const anchor = document.querySelector('[data-leaf-key="12"]');
				const focus = anchor;

				window.quickSelect(anchor, focus, anchor.children.length - 1, focus.children.length - 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l12);
				expect(bs.end.leaf).to.equal(l12);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				done();
			});

			it('Leaf contains multiple <div> and <span>', function(done) {
				// The weird Leaf
				const anchor = document.querySelector('[data-leaf-key="8"]');
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 111, 111);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l8);
				expect(bs.end.leaf).to.equal(l8);
				expect(bs.start.range[0]).to.equal(111);
				expect(bs.start.range[1]).to.equal(111);
				expect(bs.end.range[0]).to.equal(111);
				expect(bs.end.range[1]).to.equal(111);

				done();
			});

		});

		describe('Selection is in one Leaf', function() {
			
			it('Leaf is text', function(done) {
				const anchor = document.querySelector('[data-leaf-key="2"]');
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 0, 50);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l2);
				expect(bs.end.leaf).to.equal(l2);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(50);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(50);

				done();
			});

			it('Leaf is text and selection is backward', function(done) {
				const anchor = document.querySelector('[data-leaf-key="2"]');
				const focus = anchor;

				window.quickSelect(anchor.firstChild, focus.firstChild, 50, 0);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l2);
				expect(bs.end.leaf).to.equal(l2);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(50);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(50);

				done();
			});

		});

		describe('Selection spans multiple Nodes', function() {

			it('anchor and focus are text Leaves in the same Node', function(done) {
				const anchor = document.querySelector('[data-leaf-key="4"]');
				const focus = document.querySelector('[data-leaf-key="22"]');

				window.quickSelect(anchor.firstChild, focus.firstChild, 10, 10);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l4);
				expect(bs.end.leaf).to.equal(l22);
				expect(bs.start.range[0]).to.equal(10);
				expect(bs.start.range[1]).to.equal(l4.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(10);

				done();
			});

			it('anchor and focus are text Leaves in the same Node, and selection is backward', function(done) {
				const anchor = document.querySelector('[data-leaf-key="22"]');
				const focus = document.querySelector('[data-leaf-key="4"]');

				window.quickSelect(anchor.firstChild, focus.firstChild, 10, 10);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l4);
				expect(bs.end.leaf).to.equal(l22);
				expect(bs.start.range[0]).to.equal(10);
				expect(bs.start.range[1]).to.equal(l4.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(10);

				done();
			});

			it('anchor and focus are text Leaves at the same depth', function(done) {
				const anchor = document.querySelector('[data-leaf-key="4"]');
				const focus = document.querySelector('[data-leaf-key="21"]');

				window.quickSelect(anchor.firstChild, focus.firstChild, 2, 90);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l4);
				expect(bs.end.leaf).to.equal(l21);
				expect(bs.start.range[0]).to.equal(2);
				expect(bs.start.range[1]).to.equal(l4.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(90);

				done();
			});

			it('anchor and focus are text Leaves at the same depth, and selection is backward', function(done) {
				const anchor = document.querySelector('[data-leaf-key="21"]');
				const focus = document.querySelector('[data-leaf-key="4"]');

				window.quickSelect(anchor.firstChild, focus.firstChild, 90, 2);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l4);
				expect(bs.end.leaf).to.equal(l21);
				expect(bs.start.range[0]).to.equal(2);
				expect(bs.start.range[1]).to.equal(l4.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(90);

				done();
			});

			it('anchor and focus are text Leaves at different depths', function(done) {
				const anchor = document.querySelector('[data-leaf-key="10"]');
				const focus = document.querySelector('[data-leaf-key="19"]');

				window.quickSelect(anchor.firstChild, focus.firstChild, 1, 2);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l10);
				expect(bs.end.leaf).to.equal(l19);
				expect(bs.start.range[0]).to.equal(1);
				expect(bs.start.range[1]).to.equal(l10.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(2);

				done();
			});

			it('anchor and focus are text Leaves at different depths, and selection is backward', function(done) {
				const anchor = document.querySelector('[data-leaf-key="19"]');
				const focus = document.querySelector('[data-leaf-key="10"]');

				window.quickSelect(anchor.firstChild, focus.firstChild, 2, 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l10);
				expect(bs.end.leaf).to.equal(l19);
				expect(bs.start.range[0]).to.equal(1);
				expect(bs.start.range[1]).to.equal(l10.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(2);

				done();
			});

			it('anchor and focus are empty', function(done) {
				const anchor = document.querySelector('[data-leaf-key="6"]');
				const focus = document.querySelector('[data-leaf-key="17"]');

				window.quickSelect(anchor.firstChild, focus.firstChild, 1, 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l6);
				expect(bs.end.leaf).to.equal(l17);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				done();
			});

			it('anchor is non-text and focus is text', function(done) {
				const anchor = document.querySelector('[data-leaf-key="12"]');
				const focus = document.querySelector('[data-leaf-key="21"]');

				window.quickSelect(anchor, focus.firstChild, anchor.children.length - 1, 5);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l12);
				expect(bs.end.leaf).to.equal(l21);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(5);

				done();
			});

			it('anchor is non-text and focus is text, and selection is backward', function(done) {
				const anchor = document.querySelector('[data-leaf-key="21"]');
				const focus = document.querySelector('[data-leaf-key="12"]');

				window.quickSelect(anchor.firstChild, focus, 5, focus.children.length - 1);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l12);
				expect(bs.end.leaf).to.equal(l21);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(0);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(5);

				done();
			});

			it('anchor is non-text and focus is complex, and selection is backward', function(done) {
				const anchor = document.querySelector('[data-leaf-key="12"]');
				// Focus is weird leaf
				const focus = document.querySelector('[data-leaf-key="8"]');

				window.quickSelect(anchor, focus.firstChild, anchor.children.length - 1, 0);

				const bs = new BlankSelection();
				expect(bs.start.leaf).to.equal(l8);
				expect(bs.end.leaf).to.equal(l12);
				expect(bs.start.range[0]).to.equal(0);
				expect(bs.start.range[1]).to.equal(l8.text.length);
				expect(bs.end.range[0]).to.equal(0);
				expect(bs.end.range[1]).to.equal(0);

				done();
			});

		});

	});

/*
	isZeroWidth,
	clearBlankSelection,
	copySelectionObject,
	copyBlankSelection
*/

	describe('isZeroWidth', function() {

		it('Empty BlankSelection, expect false', function(done) {
			const bs = new BlankSelection(true);
			let result = isZeroWidth(bs);
			expect(result).to.be.false;
			done();
		});

		it('BlankSelection spans multiple leaves, expect false', function(done) {
			const anchor = document.querySelector('[data-leaf-key="12"]');
			const focus = document.querySelector('[data-leaf-key="21"]');

			window.quickSelect(anchor, focus, anchor.children.length - 1, 5);

			const bs = new BlankSelection();
			let result = isZeroWidth(bs);
			expect(result).to.be.false;
			done();
		});

		it('BlankSelection is in the same Leaf but has range, expect false', function(done) {
			const anchor = document.querySelector('[data-leaf-key="2"]');
			const focus = anchor;

			window.quickSelect(anchor, focus, 0, 50);

			const bs = new BlankSelection();
			let result = isZeroWidth(bs);
			expect(result).to.be.false;
			done();
		});

		it('BlankSelection is in the same Leaf and range is collapsed, expect true', function(done) {
			const anchor = document.querySelector('[data-leaf-key="2"]');
			const focus = anchor;

			window.quickSelect(anchor.firstChild, focus.firstChild, 5, 5);

			const bs = new BlankSelection();
			let result = isZeroWidth(bs);
			expect(result).to.be.true;
			done();
		});

	});

	describe('clearBlankSelection', function() {

		it('Clear a non-empty selection', function(done) {
			const anchor = document.querySelector('[data-leaf-key="2"]');
			const focus = anchor;

			window.quickSelect(anchor.firstChild, focus.firstChild, 5, 5);

			const bs = new BlankSelection();
			let result = bs.start === null;
			expect(result).to.be.false;
			result = bs.end === null;
			expect(result).to.be.false;

			clearBlankSelection(bs);
			result = bs.start === null;
			expect(result).to.be.true;
			result = bs.end === null;
			expect(result).to.be.true;

			done();
		});

	});

	describe('copySelectionObject', function() {

		it('Copy a valid SelectionObject', function(done) {
			const so = {
				leaf: l2,
				range: [5, 20]
			};

			const copy = copySelectionObject(so);

			expect(copy.leaf).to.equal(l2);
			expect(copy.range[0]).to.equal(5);
			expect(copy.range[1]).to.equal(20);

			let result = so === copy;
			expect(result).to.be.false;

			done();
		});

	});

	describe('copyBlankSelection', function() {

		it('Copy an empty BlankSelection to a non-empty BlankSelection', function(done) {
			const bs1 = new BlankSelection(true);

			const anchor = document.querySelector('[data-leaf-key="2"]');
			const focus = anchor;

			window.quickSelect(anchor.firstChild, focus.firstChild, 5, 5);

			const bs2 = new BlankSelection();

			let result = bs2.start === null;
			expect(result).to.be.false;
			result = bs2.end === null;
			expect(result).to.be.false;

			copyBlankSelection(bs2, bs1);

			result = bs2.start === null;
			expect(result).to.be.true;
			result = bs2.end === null;
			expect(result).to.be.true;

			done();
		});

		it('Copy a non-empty BlankSelection to an empty BlankSelection', function(done) {
			const bs1 = new BlankSelection(true);

			const anchor = document.querySelector('[data-leaf-key="21"]');
			const focus = document.querySelector('[data-leaf-key="12"]');

			window.quickSelect(anchor, focus, 5, focus.children.length - 1);

			const bs2 = new BlankSelection();

			let result = bs1.start === null;
			expect(result).to.be.true;
			result = bs1.end === null;
			expect(result).to.be.true;

			copyBlankSelection(bs1, bs2);

			expect(bs1.start.leaf).to.equal(bs2.start.leaf);
			expect(bs1.start.range[0]).to.equal(bs2.start.range[0]);
			expect(bs1.start.range[1]).to.equal(bs2.start.range[1]);

			expect(bs1.end.leaf).to.equal(bs2.end.leaf);
			expect(bs1.end.range[0]).to.equal(bs2.end.range[0]);
			expect(bs1.end.range[1]).to.equal(bs2.end.range[1]);

			done();
		});

		it('Copy a non-empty BlankSelection to a non-empty BlankSelection', function(done) {
			const anchor1 = document.querySelector('[data-leaf-key="2"]');
			const focus1 = anchor1;

			window.quickSelect(anchor1.firstChild, focus1.firstChild, 5, 5);

			const bs1 = new BlankSelection();

			const anchor = document.querySelector('[data-leaf-key="21"]');
			const focus = document.querySelector('[data-leaf-key="12"]');

			window.quickSelect(anchor, focus, 5, focus.children.length - 1);

			const bs2 = new BlankSelection();

			copyBlankSelection(bs1, bs2);

			expect(bs1.start.leaf).to.equal(bs2.start.leaf);
			expect(bs1.start.range[0]).to.equal(bs2.start.range[0]);
			expect(bs1.start.range[1]).to.equal(bs2.start.range[1]);

			expect(bs1.end.leaf).to.equal(bs2.end.leaf);
			expect(bs1.end.range[0]).to.equal(bs2.end.range[0]);
			expect(bs1.end.range[1]).to.equal(bs2.end.range[1]);

			done();
		});

	});

});
