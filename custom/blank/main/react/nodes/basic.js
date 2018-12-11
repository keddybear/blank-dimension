// @flow
import * as React from 'react';

// Blank Element imports
import { Node, NodeTypes, NodeDataAttributes } from '../../node';

// Style imports // $FlowFixMe
import './styles/basic.scss';

const { PARAGRAPH } = NodeTypes;
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
