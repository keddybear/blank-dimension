// @flow
/*
	This file contains functions that handle certain input for a context. They will
	return either an intent or an empty string, which will be dispatched by the
	IntentDispatcher.

	Their naming convention is {CONTEXT}${anyName}.
*/
import { KeyTypes, KeyModifiers, BlankIntents } from './utils';
import Keyboard from './keyboard';

import { BeforeActionSelection, isZeroWidth } from '../selection';
import { NodeTypes } from '../node';
import { isZeroLeaf } from '../leaf';

const { CHARACTER } = KeyTypes;
const { SHIFT, CTRL } = KeyModifiers;
const { LIST_ITEM } = NodeTypes;

// Intents
/* eslint camelcase: 0 */
const {
	_default,
	insert_char,
	del,
	backspace,
	newline,
	undo,
	redo,
	copy,
	cut,
	paste,
	bold,
	italic,
	underline,
	select_all,
	indent_list_item,
	unindent_list_item,
	cut_list
} = BlankIntents;

//= COMPOSITION
/*
	keydown for COMPOSITION:
		- Return an intent given the current Keyboard state.
	@ return
		intent: string
*/
export function COMPOSITION$keydown(): string {
	// Basic
	// Insert a character
	if (Keyboard.pressed(CHARACTER) || Keyboard.pressed(CHARACTER, SHIFT)) {
		return insert_char;
	}
	// Delete
	if (Keyboard.pressed('Delete')) {
		return del;
	}
	// Backspace
	if (Keyboard.pressed('Backspace')) {
		return backspace;
	}
	// Newline
	if (Keyboard.pressed('Enter')) {
		return newline;
	}
	// Undo
	if (Keyboard.pressed('KeyZ', CTRL)) {
		return undo;
	}
	// Redo
	if (Keyboard.pressed('KeyY', CTRL)) {
		return redo;
	}
	// Copy
	if (Keyboard.pressed('KeyC', CTRL)) {
		return copy;
	}
	// Cut
	if (Keyboard.pressed('KeyX', CTRL)) {
		return cut;
	}
	// Paste
	if (Keyboard.pressed('KeyV', CTRL)) {
		return _default;
	}
	// Bold
	if (Keyboard.pressed('KeyB', CTRL)) {
		return bold;
	}
	// Italic
	if (Keyboard.pressed('KeyI', CTRL)) {
		return italic;
	}
	// Underline
	if (Keyboard.pressed('KeyU', CTRL)) {
		return underline;
	}
	// Select All
	if (Keyboard.pressed('KeyA', CTRL)) {
		return _default;
	}

	// Arrow Keys
	if (Keyboard.pressed('ArrowUp') || Keyboard.pressed('ArrowDown') ||
		Keyboard.pressed('ArrowLeft') || Keyboard.pressed('ArrowRight')) {
		return _default;
	}

	// Advanced (More conditions than just keyboard & mouse)
	// Indent list item
	if (Keyboard.pressed('Tab') &&
		isZeroWidth(BeforeActionSelection) && // $FlowFixMe
		BeforeActionSelection.start.leaf.parent.nodeType === LIST_ITEM) {
		return indent_list_item;
	}
	// Unindent list item
	if (Keyboard.pressed('Tab', SHIFT) &&
		isZeroWidth(BeforeActionSelection) && // $FlowFixMe
		BeforeActionSelection.start.leaf.parent.nodeType === LIST_ITEM) {
		return unindent_list_item;
	}
	// Cut list
	if (Keyboard.pressed('Backspace', SHIFT)) {
		if (isZeroWidth(BeforeActionSelection) && // $FlowFixMe
			BeforeActionSelection.start.leaf.parent.nodeType === LIST_ITEM && // $FlowFixMe
			isZeroLeaf(BeforeActionSelection.start.leaf)) {
			return cut_list;
		}
		return backspace;
	}

	return '';
}
/*
	click for COMPOSITION:
		- Handle button clicking that modifies, for example, BranchType.
*/
export function COMPOSITION$click() {
	// TODO
}
