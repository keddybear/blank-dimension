// @flow
import React from 'react';

import { Leaf } from './main/leaf';
import { Node, DocumentRoot } from './main/node';
import { BlankSelection, setWindowSelection, _MANUAL_ } from './main/selection';
import Context from './main/input/context';
import RootComponent from './main/react/root';
import {
	onKeyDown,
	onKeyUp,
	onClick,
	onSelectStart,
	onSelectionChange,
	onBeforeInput,
	onInput,
	onPaste,
	onCopy
} from './main/input/listener';

import Sidebar from './sidebar';

// Initialize DocumentRoot
const n = new Node();
const l = new Leaf({ text: 'Type something...' });
DocumentRoot.firstChild = n;
n.parent = null;
n.firstChild = l;
l.parent = n;
// Initialize BlankSelection
const initialSelection = new BlankSelection(_MANUAL_);
initialSelection.start = { leaf: l, range: [0, 0] };
initialSelection.end = { leaf: l, range: [0, 0] };

type EditorProps = {};
type EditorState = {};

class BlankEditor extends React.Component<EditorProps, EditorState> {
	componentDidMount(): void {
		// Initialize Context
		Context.init();
		// Add listeners
		document.addEventListener('keydown', onKeyDown, false);
		document.addEventListener('keyup', onKeyUp, false);
		document.addEventListener('click', onClick);
		document.addEventListener('selectstart', onSelectStart, false);
		document.addEventListener('selectionchange', onSelectionChange, false);
		document.addEventListener('beforeinput', onBeforeInput, false);
		document.addEventListener('input', onInput, false);
		document.addEventListener('paste', onPaste, false);
		document.addEventListener('copy', onCopy, false);
		// Focus by setting window selection
		setWindowSelection(initialSelection);
	}

	componentWillUnmount(): void {
		// Remove listeners
		document.removeEventListener('keydown', onKeyDown, false);
		document.removeEventListener('keyup', onKeyUp, false);
		document.removeEventListener('click', onClick, false);
		document.removeEventListener('selectstart', onSelectStart, false);
		document.removeEventListener('selectionchange', onSelectionChange, false);
		document.removeEventListener('beforeinput', onBeforeInput, false);
		document.removeEventListener('input', onInput, false);
		document.removeEventListener('paste', onPaste, false);
		document.removeEventListener('copy', onCopy, false);
	}

	render() {
		return (
			<React.Fragment>
				<Sidebar />
				<RootComponent />
			</React.Fragment>
		);
	}
}

export default BlankEditor;
