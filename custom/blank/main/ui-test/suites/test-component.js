/* eslint-disable */
import { Node, DocumentRoot, NodeTypes, NodeDataAttributes } from '../../node';
import { Leaf, LeafStyles, LeafTypes, LeafDataAttributes } from '../../leaf';
import {
	chainNode,
	chainLeaf,
	setParentLink
} from '../../integration';
import { expect } from 'chai';

// Enzyme
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { shallow } from 'enzyme';
import React from 'react';

Enzyme.configure({ adapter: new Adapter() });

// Components
import RootComponent from '../../react/root';
import ChainComponent from '../../react/chain';
import NodeComponent from '../../react/node';
import LeafComponent from '../../react/leaf';

describe('RootComponent - shallow', function() {

	it('Render a <div> wrapper and a <div> chain container, with no child', function(done) {
		const tree = shallow(<RootComponent />);
		expect(tree.find('div.blank-editor')).to.have.lengthOf(1);
		expect(tree.find('div.blank-container')).to.have.lengthOf(1);
		// DocumentRoot.firstChild is null
		expect(tree.contains(<div className='blank-container' />)).to.be.true;
		expect(tree.find(ChainComponent)).to.have.lengthOf(0);
		done();
	});

	it('Render a <div> wrapper and a <div> chain container, with children', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const l1 = new Leaf();

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<RootComponent />);
		expect(tree.find('div.blank-editor')).to.have.lengthOf(1);
		expect(tree.find('div.blank-container')).to.have.lengthOf(1);
		// DocumentRoot.firstChild is not null
		expect(tree.find(ChainComponent)).to.have.lengthOf(1);

		done();
	});

});

describe('ChainComponent - shallow', function() {

	it('Render three NodeComponents', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const n2 = new Node();
		const n3 = new Node();

		const l1 = new Leaf();
		const l2 = new Leaf();
		const l3 = new Leaf();

		setParentLink(n1, null);
		chainNode(n2, n1);
		chainNode(n3, n2);

		setParentLink(l1, n1);
		setParentLink(l2, n2);
		setParentLink(l3, n3);

		const chainRef = { current: null };

		const tree = shallow(<ChainComponent parent={DocumentRoot} chainRef={chainRef} />);
		expect(tree.find(NodeComponent)).to.have.lengthOf(3);

		done();
	});

	it('Render five LeafComponents', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();

		const l1 = new Leaf();
		const l2 = new Leaf();
		const l3 = new Leaf();
		const l4 = new Leaf();
		const l5 = new Leaf();

		setParentLink(n1, null);

		setParentLink(l1, n1);
		chainLeaf(l2, l1);
		chainLeaf(l3, l2);
		chainLeaf(l4, l3);
		chainLeaf(l5, l4);

		const chainRef = { current: null };

		const tree = shallow(<ChainComponent parent={n1} chainRef={chainRef} />);
		expect(tree.find(LeafComponent)).to.have.lengthOf(5);

		done();
	});

});

const { PARAGRAPH, ORDERED_LIST, UNORDERED_LIST, LIST_ITEM } = NodeTypes;
const { NODE_KEY_ATTR } = NodeDataAttributes;

describe('NodeComponent - shallow', function() {

	it('Render a PARAGRAPH Node', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node({ nodeType: PARAGRAPH });
		const l1 = new Leaf();

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<NodeComponent node={n1} />);
		expect(tree.find(`div[${NODE_KEY_ATTR}]`)).to.have.lengthOf(1);
		expect(tree.find(ChainComponent)).to.have.lengthOf(1);
		done();
	});

	it('Render an ORDERED_LIST Node', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node({ nodeType: ORDERED_LIST });
		const l1 = new Leaf();

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<NodeComponent node={n1} />);
		expect(tree.find(`ol[${NODE_KEY_ATTR}]`)).to.have.lengthOf(1);
		expect(tree.find(ChainComponent)).to.have.lengthOf(1);
		done();
	});

	it('Render an UNORDERED_LIST Node', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node({ nodeType: UNORDERED_LIST });
		const l1 = new Leaf();

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<NodeComponent node={n1} />);
		expect(tree.find(`ul[${NODE_KEY_ATTR}]`)).to.have.lengthOf(1);
		expect(tree.find(ChainComponent)).to.have.lengthOf(1);
		done();
	});

	it('Render a LIST_ITEM Node', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node({ nodeType: LIST_ITEM });
		const l1 = new Leaf();

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<NodeComponent node={n1} />);
		expect(tree.find(`li[${NODE_KEY_ATTR}]`)).to.have.lengthOf(1);
		expect(tree.find(ChainComponent)).to.have.lengthOf(1);
		done();
	});

});

const { IMAGE, TEXT } = LeafTypes;
const { LEAF_KEY_ATTR, LEAF_CONTENT_ATTR, LEAF_TEXT_ATTR } = LeafDataAttributes;

describe('LeafComponent - shallow', function() {

	it('Render a TEXT Leaf with no styles', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const l1 = new Leaf({ text: 'This is a test', type: TEXT });

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<LeafComponent leaf={l1} />);
		// console.log(tree.html());
		expect(tree.html()).to.equal(`<span ${LEAF_KEY_ATTR}="${l1.id}" ${LEAF_TEXT_ATTR}="">This is a test</span>`);
		expect(tree.find(ChainComponent)).to.have.lengthOf(0);

		done();
	});

	it('Render a zeroLeaf', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const l1 = new Leaf({ type: TEXT });

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<LeafComponent leaf={l1} />);
		// console.log(tree.html());
		expect(tree.html()).to.equal(`<span ${LEAF_KEY_ATTR}="${l1.id}" ${LEAF_TEXT_ATTR}="">${'\u200b'}</span>`);
		expect(tree.find(ChainComponent)).to.have.lengthOf(0);

		done();
	});

	it('Render a TEXT Leaf with bold set to true', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const l1 = new Leaf({
			text: 'This is a bold test',
			type: TEXT,
			styles: new LeafStyles({ bold: true })
		});

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<LeafComponent leaf={l1} />);
		const styles = `style="font-weight:bold"`;
		// console.log(tree.html());
		expect(tree.html()).to.equal(`<span ${LEAF_KEY_ATTR}="${l1.id}" ${LEAF_TEXT_ATTR}="" ${styles}>${l1.text}</span>`);
		expect(tree.find(ChainComponent)).to.have.lengthOf(0);

		done();
	});

	it('Render a TEXT Leaf with italic set to true', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const l1 = new Leaf({
			text: 'This is a italic test',
			type: TEXT,
			styles: new LeafStyles({ italic: true })
		});

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<LeafComponent leaf={l1} />);
		const styles = `style="font-style:italic"`;
		// console.log(tree.html());
		expect(tree.html()).to.equal(`<span ${LEAF_KEY_ATTR}="${l1.id}" ${LEAF_TEXT_ATTR}="" ${styles}>${l1.text}</span>`);
		expect(tree.find(ChainComponent)).to.have.lengthOf(0);

		done();
	});

	it('Render a TEXT Leaf with underline set to true', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const l1 = new Leaf({
			text: 'This is an underline test',
			type: TEXT,
			styles: new LeafStyles({ underline: true })
		});

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<LeafComponent leaf={l1} />);
		const styles = `style="text-decoration:underline"`;
		// console.log(tree.html());
		expect(tree.html()).to.equal(`<span ${LEAF_KEY_ATTR}="${l1.id}" ${LEAF_TEXT_ATTR}="" ${styles}>${l1.text}</span>`);
		expect(tree.find(ChainComponent)).to.have.lengthOf(0);

		done();
	});

	it('Render a TEXT Leaf with all styles set to true', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const l1 = new Leaf({
			text: 'This is a styled test',
			type: TEXT,
			styles: new LeafStyles({
				bold: true,
				italic: true,
				underline: true
			})
		});

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<LeafComponent leaf={l1} />);
		const styles = `style="font-weight:bold;font-style:italic;text-decoration:underline"`;
		// console.log(tree.html());
		expect(tree.html()).to.equal(`<span ${LEAF_KEY_ATTR}="${l1.id}" ${LEAF_TEXT_ATTR}="" ${styles}>${l1.text}</span>`);
		expect(tree.find(ChainComponent)).to.have.lengthOf(0);

		done();
	});

	it('Render a IMAGE Leaf', function(done) {
		DocumentRoot.firstChild = null;

		const n1 = new Node();
		const l1 = new Leaf({
			type: IMAGE,
			custom: { src: 'http://doanarae.com/doanarae/9646-long-wallpaper-for-2-monitors_35719.jpg' }
		});

		setParentLink(n1, null);
		setParentLink(l1, n1);

		const tree = shallow(<LeafComponent leaf={l1} />);
		// console.log(tree.html());
		const html = `` +
		`<div ${LEAF_KEY_ATTR}="${l1.id}" ${LEAF_CONTENT_ATTR}="">` +
			`<div contenteditable="false">` +
				`<img src="${l1.custom.src}" alt="Source not found"/>` +
			`</div>` +
			`<input readonly=""/>` +
		`</div>`;
		expect(tree.html()).to.equal(html);
		expect(tree.find(ChainComponent)).to.have.lengthOf(0);

		done();
	});

});
