// @flow
/*
	This is where you render all Node types. Each Node type must comply with the
	following:

	1. The root element must have a "node-key" data attribute.
	2. The root element must be stored in "selectRef".
	3. The component must render "chain".
*/
import * as React from 'react';

// Blank Element imports
import { Node, NodeTypes, NodeDataAttributes } from '../../node';

// Style imports // $FlowFixMe
import './styles/basic.scss';

const { PARAGRAPH, ORDERED_LIST, UNORDERED_LIST, LIST_ITEM } = NodeTypes;
const { NODE_KEY_ATTR } = NodeDataAttributes;

/*
	renderNode:
		- Render a Node depending on its nodeType and styles (TODO).
	@ params
		node: Node
		selectRef: { current: null }
		chain: React.Element<*>
*/
function renderNode(node: Node, selectRef: Object, chain: React.Element<*> | null) {
	const type = node.nodeType;
	switch (type) {
		case ORDERED_LIST: {
			const props = {
				[NODE_KEY_ATTR]: node.id.toString()
			};
			return <ol {...props} ref={selectRef}>{ chain }</ol>;
		}
		case UNORDERED_LIST: {
			const props = {
				[NODE_KEY_ATTR]: node.id.toString()
			};
			return <ul {...props} ref={selectRef}>{ chain }</ul>;
		}
		case LIST_ITEM: {
			const props = {
				[NODE_KEY_ATTR]: node.id.toString()
			};
			return <li {...props} ref={selectRef}>{ chain }</li>;
		}
		case PARAGRAPH:
		default: {
			const props = {
				className: 'p',
				[NODE_KEY_ATTR]: node.id.toString()
			};
			return <div {...props} ref={selectRef}>{ chain }</div>;
		}
	}
}

export default renderNode;
