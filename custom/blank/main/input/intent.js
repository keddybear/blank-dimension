// @flow
/* eslint camelcase: 0 */
import { BlankIntents } from './utils';
import { BlankFlags } from '../utils';
import Keyboard from './keyboard';

// CAO
import {
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
	paste_plain_content, //TODO
	cut,
	bold,
	italic,
	underline,
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
			BlankFlags.RUNNING = false;
			// Fire paste event to native clipboard data.
			// Intent "paste_content" will handle actual pasting of data.
			if (document && document.execCommand) document.execCommand('paste');
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
			break;
		}
		case bold: {
			applyLeavesStyle$COMPLETE({ bold: true });
			break;
		}
		case italic: {
			applyLeavesStyle$COMPLETE({ italic: true });
			break;
		}
		case underline: {
			applyLeavesStyle$COMPLETE({ underline: true });
			break;
		}
		default: {
			defaultHandler();
			break;
		}
	}
}
