// @flow
import * as React from 'react';

// Blank Element imports
import { Leaf, LeafStyles, LeafTypes, LeafDataAttributes } from '../../leaf';

// Style imports // $FlowFixMe
import './styles/basic.scss';

const { IMAGE, TEXT } = LeafTypes;
const { LEAF_KEY_ATTR, LEAF_CONTENT_ATTR, LEAF_TEXT_ATTR } = LeafDataAttributes;

/*
	getStyleProp:
		- Turn LeafStyles into an object for React style prop.
	@ params
		styles: LeafStyles
	@ return
		style: Object
*/
function getStyleProp(styles: LeafStyles): Object {
	const style = {};
	if (styles.bold) style.fontWeight = 'bold';
	if (styles.italic) style.fontStyle = 'italic';
	if (styles.underline) style.textDecoration = 'underline';
	return style;
}

/*
	renderLeaf:
		- Render a Node depending on its type and styles.
	@ params
		node: Leaf
		selectRef: { current: null }
*/
function renderLeaf(leaf: Leaf, selectRef: Object) {
	const { type } = leaf;
	switch (type) {
		case IMAGE: {
			const props = {
				[LEAF_KEY_ATTR]: leaf.id.toString()
			};
			const props2 = {
				[LEAF_CONTENT_ATTR]: '',
				src: leaf.text
			};
			return <div {...props}><img {...props2} alt='' /></div>;
		}
		case TEXT:
		default: {
			const style = getStyleProp(leaf.styles);
			const props = {
				[LEAF_KEY_ATTR]: leaf.id.toString(),
				[LEAF_TEXT_ATTR]: ''
			};
			return <span {...props} style={style} ref={selectRef}>{ leaf.text }</span>;
		}
	}
}

export default renderLeaf;
