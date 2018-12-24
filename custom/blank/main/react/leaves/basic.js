// @flow
/*
	This is where you render all Leaf types. Each Leaf type must comply with the
	following:

	1. If Leaf is a text Leaf, it must have a <span> that immediately contains
	   the Leaf's text. The <span> must have a "leaf-key" data attribute, a
	   "leaf-text" attribute and it must be stored in "selectRef".
	2. If Leaf is a non-text Leaf, its root element must have a "leaf-key" data
	   attribute, a "leaf-content" attribute, it must be stored in "selectRef",
	   and it must have a ready-only input field as the last child to capture
	   selection, alongside its leaf-content wrapper. The wrapper must have a
	   "contenteditable=false" attribute.
*/
import * as React from 'react';

// Blank Element imports
import { Leaf, LeafStyles, LeafTypes, LeafDataAttributes, isZeroLeaf } from '../../leaf';

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
				[LEAF_KEY_ATTR]: leaf.id.toString(),
				[LEAF_CONTENT_ATTR]: ''
			};
			const imgProps = {
				src: leaf.custom ? leaf.custom.src : ''
			};
			return (
				<div {...props} ref={selectRef}>
					<div contentEditable='false' suppressContentEditableWarning>
						<img {...imgProps} alt='Source not found' />
					</div>
					<input readOnly />
				</div>
			);
		}
		case TEXT:
		default: {
			const style = getStyleProp(leaf.styles);
			const props = {
				[LEAF_KEY_ATTR]: leaf.id.toString(),
				[LEAF_TEXT_ATTR]: ''
			};
			return (
				<span {...props} style={style} ref={selectRef}>
					{ isZeroLeaf(leaf) ? '\u200b' : leaf.text }
				</span>
			);
		}
	}
}

export default renderLeaf;
