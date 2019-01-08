// @flow
/* eslint camelcase: 0 */
import { BlankIntents } from './utils';
import { BlankFlags } from '../utils';
import Keyboard from './keyboard';

// CAO
import { NodeTypes } from '../node';
import {
	getLeafStylesState,
	undo$COMPLETE,
	redo$COMPLETE,
	applyLeavesStyle$COMPLETE,
	applyNodesStyle$COMPLETE,
	applyBranchType$COMPLETE,
	applyBranchText$COMPLETE,
	copyBranchText$COMPLETE,
	cut$COMPLETE,
	_DELETE_,
	_BACKSPACE_,
	_NEWLINE_,
	_PASTE_FROM_CLIPBOARD_
} from '../integration';

// Node Types
const { PARAGRAPH, ORDERED_LIST, UNORDERED_LIST, LIST_ITEM } = NodeTypes;

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
	paste,
	paste_content,
	paste_plain, // TODO
	paste_plain_content, // TODO
	cut,
	bold,
	italic,
	underline,
	select_all,
	bt_paragraph,
	bt_olist,
	bt_ulist,
	indent_list_item, // TODO
	unindent_list_item, // TODO
	cut_list // TODO
} = BlankIntents;

const defaultHandler = () => {
	BlankFlags.RUNNING = false;
};

/*
	dispatchIntent:
		- Perform actions given an intent.
		- The first argument is always the intent name. Caller can supply any number of
		  arguments after it.
	@ params
		intent: string
		...args: Array<any>
*/
export default function dispatchIntent(intent: string, ...args: Array<any>): void {
	switch (intent) {
		// Basic
		case insert_char: {
			applyBranchText$COMPLETE(Keyboard.character);
			break;
		}
		case replace_text: {
			applyBranchText$COMPLETE(args[0]);
			break;
		}
		case del: {
			applyBranchText$COMPLETE('', _DELETE_);
			break;
		}
		case backspace: {
			applyBranchText$COMPLETE('', _BACKSPACE_);
			break;
		}
		case newline: {
			applyBranchText$COMPLETE('', _NEWLINE_);
			break;
		}
		case undo: {
			undo$COMPLETE();
			break;
		}
		case redo: {
			redo$COMPLETE();
			break;
		}
		case copy: {
			copyBranchText$COMPLETE();
			// Clear native clipboard data
			if (document && document.execCommand) document.execCommand('copy');
			break;
		}
		case paste: {
			// For security reason, browsers won't allow us to trigger paste event
			// manually, so we do not call preventDefault() on keydown and let paste
			// event handle it.
			break;
		}
		case paste_content: {
			// If native clipboard data is not empty, paste it instead of the content
			// from Blank Clipboard.
			if (args[0]) {
				applyBranchText$COMPLETE(args[0]);
			} else {
				applyBranchText$COMPLETE('', _PASTE_FROM_CLIPBOARD_);
			}
			break;
		}
		case cut: {
			cut$COMPLETE();
			// Clear native clipboard data
			if (document && document.execCommand) document.execCommand('copy');
			break;
		}
		case select_all: {
			// Do not call preventDefault() on keydown.
			break;
		}
		// Leaf Style
		case bold: { // toggle bold
			const state = getLeafStylesState({ bold: true });
			if (state.leaf === null) {
				if (!state.disabled) {
					applyLeavesStyle$COMPLETE({ bold: false });
				}
			} else {
				applyLeavesStyle$COMPLETE({ bold: true });
			}
			break;
		}
		case italic: { // toggle italic
			const state = getLeafStylesState({ italic: true });
			if (state.leaf === null) {
				if (!state.disabled) {
					applyLeavesStyle$COMPLETE({ italic: false });
				}
			} else {
				applyLeavesStyle$COMPLETE({ italic: true });
			}
			break;
		}
		case underline: { // toggle underline
			const state = getLeafStylesState({ underline: true });
			if (state.leaf === null) {
				if (!state.disabled) {
					applyLeavesStyle$COMPLETE({ underline: false });
				}
			} else {
				applyLeavesStyle$COMPLETE({ underline: true });
			}
			break;
		}
		// Branch Type
		case bt_paragraph: {
			applyBranchType$COMPLETE([PARAGRAPH]);
			break;
		}
		case bt_olist: {
			applyBranchType$COMPLETE([ORDERED_LIST, LIST_ITEM]);
			break;
		}
		case bt_ulist: {
			applyBranchType$COMPLETE([UNORDERED_LIST, LIST_ITEM]);
			break;
		}
		// Lastly
		default: {
			defaultHandler();
			break;
		}
	}
}
