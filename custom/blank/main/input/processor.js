// @flow
/* eslint camelcase: 0 */
import { BlankContexts, KeyTypes, KeyModifiers, BlankIntents } from './utils';
import Keyboard from './keyboard';
import Mouse from './mouse';

import { BeforeActionSelection, isZeroWidth } from '../selection';
import { NodeTypes } from '../node';
import { isZeroLeaf } from '../leaf';

const { CHARACTER } = KeyTypes;
const { SHIFT, CTRL, ALT, META } = KeyModifiers;
const { NO_CONTEXT, COMPOSITION } = BlankContexts;
const { LIST_ITEM } = NodeTypes;

// Intents
const {
	insert_char,
	replace_text,
	del,
	backspace,
	newline,
	undo,
	redo,
	copy,
	cut,
	paste,
	paste_content,
	bold,
	italic,
	underline,
	indent_list_item,
	unindent_list_item,
	cut_list
} = BlankIntents;

const defaultHandler = () => '';
export class InputProcessor {
	/*
		Each InputProcessor cooresponds to a Context. It processes user input (Keyboard
		& Mouse) and returns an intent which performs a Complete Action.

		Conditions for each intent must be exclusive.
	*/

	/*
		@ attributes
		core: function - default: () => '';
	*/
	core: (string) => string;

	/*
		@ methods
		register
		getIntent
	*/

	/*
		constructor
	*/
	constructor() {
		this.core = defaultHandler;
	}

	/*
		register:
			- Register a function that returns an intent's name, based on current user
			  input.
		@ params
			fn: function
	*/
	register(fn: (string) => string): void {
		this.core = fn;
	}

	/*
		getIntent:
			- Run the registered function and get the intent's name, based on current
			  user input or command.
			  	- Command takes priority over user input.
		@ params
			command: string
		@ return
			intent: string
	*/
	getIntent(command: string = ''): string {
		return this.core(command);
	}
}

//= Declare InputProcessor for each Context here

const ContextProcessors: Object = {
	// NO_CONTEXT
	[NO_CONTEXT]: new InputProcessor(),
	// COMPOSITION
	[COMPOSITION]: new InputProcessor()
};

//= Register input handler for each InputProcessor here

// NO_CONTEXT - empty

// COMPOSITION
ContextProcessors.COMPOSITION.register((command: string = '') => {
	// Command has priority over user input
	// If no intent is found for the command, return ''
	if (command) {
		switch (command) {
			case 'replace_text': {
				return replace_text;
			}
			case 'paste_content': {
				return paste_content;
			}
			default: {
				return '';
			}
		}
	}
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
		return paste;
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
});

export { ContextProcessors };
