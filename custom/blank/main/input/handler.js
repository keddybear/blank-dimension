// @flow
/* eslint camelcase: 0 */
import Keyboard from './keyboard';
import dispatchIntent from './intent';
import { BlankContexts, BlankIntents } from './utils';
import { COMPOSITION$keydown } from './helper';

import { onSelectionChangeHandler } from '../selection';
import { BlankFlags } from '../utils';

const { NO_CONTEXT, COMPOSITION } = BlankContexts;
const { replace_text, paste_content, _default } = BlankIntents;

// insertReplacementText hack
let replacement_text = '';

//= Declare Context handlers here
const defaultHandler = () => {};

const ContextHandlers = {
	// NO_CONTEXT
	[NO_CONTEXT]: defaultHandler,
	// COMPOSITION
	[COMPOSITION]: defaultHandler
};

//= Assign Context handlers here

// COMPOSITION
ContextHandlers[COMPOSITION] = function (
	eventName: string,
	e: Event | KeyboardEvent | MouseEvent | ClipboardEvent
): void {
	switch (eventName) {
		/*
			onKeyDown:
				- Perform action on keydown.
				- If intent is paste, do not call preventDefault().
		*/
		case 'keydown': {
			if (BlankFlags.RUNNING) return;
			BlankFlags.RUNNING = true;
			// $FlowFixMe
			Keyboard.press(e);
			const intent = COMPOSITION$keydown();
			if (intent === _default) {
				BlankFlags.RUNNING = false;
			} else {
				e.preventDefault();
				e.stopPropagation();
				dispatchIntent(intent);
			}
			break;
		}
		/*
			onKeyUp:
				- Perform action on keyup.
		*/
		case 'keyup': {
			e.preventDefault();
			e.stopPropagation();
			// $FlowFixMe
			Keyboard.release(e);
			break;
		}
		/*
			onClick:
				- If click target or its parent has "data-intent" attribute, dispatch
				  the intent.
		*/
		case 'click': {
			e.preventDefault();
			e.stopPropagation();

			if (BlankFlags.RUNNING) return;
			BlankFlags.RUNNING = true;

			const t = e.target;
			// $FlowFixMe
			if (t.dataset && t.dataset.intent) {
				dispatchIntent(t.dataset.intent); // $FlowFixMe
			} else if (t.parentNode && t.parentNode.dataset && t.parentNode.dataset.intent) {
				dispatchIntent(t.parentNode.dataset.intent);
			} else {
				BlankFlags.RUNNING = false;
			}
			break;
		}
		/*
			onSelectStart:
				- Disable user selection while running a task.
		*/
		case 'selectstart': {
			if (BlankFlags.RUNNING) {
				e.preventDefault();
				e.stopPropagation();
			}
			break;
		}
		/*
			onSelectionChange:
				- If selectionchange is trigged by setWindowSelectionFromPAS(),
				  SELECTION_FROM_BS should be true. Set it to false.
				- If not, debounce selection change handler.
				- NOTE: If setWindowSelectionFromPAS() is async, selectionchange
				  event fired by it is not necessarily run after it, but the flag
				  should be set before it. Any other selectionchange events will
				  not be handled because RUNNING is true.
				- NOTE: removeAllRanges() will also fire selectionchange, so there
				  are two events from setWindowSelectionFromPAS().
		*/
		case 'selectionchange': {
			e.preventDefault();
			e.stopPropagation();

			if (BlankFlags.SELECTION_CLEARED_BY_BS) {
				BlankFlags.SELECTION_CLEARED_BY_BS = false;
			} else if (BlankFlags.SELECTION_FROM_BS) {
				BlankFlags.SELECTION_FROM_BS = false;
			} else {
				if (BlankFlags.RUNNING) return;
				BlankFlags.RUNNING = true;

				onSelectionChangeHandler();
				BlankFlags.RUNNING = false;
			}
			break;
		}
		/*
			onBeforeInput:
				- Capture any non-keyboard initiated input event and perform action.
		*/
		case 'beforeinput': {
			e.preventDefault();
			e.stopPropagation();

			if (BlankFlags.RUNNING) return;
			BlankFlags.RUNNING = true;

			// $FlowFixMe
			if (e.inputType && e.inputType === 'insertReplacementText') {
				// This event is not cancelable, so the current hack is dispatching replace_text intent
				// in onInput handler. // $FlowFixMe
				const replacement = e.data === null ? e.dataTransfer.getData('text/plain') : e.data;
				if (replacement !== null) {
					replacement_text = replacement;
				} else {
					BlankFlags.RUNNING = false;
				}
			} else {
				BlankFlags.RUNNING = false;
			}
			break;
		}
		/*
			onInput:
				- Handle InputEvent not cancelled in onBeforeInput.
		*/
		case 'input': {
			e.preventDefault();
			e.stopPropagation();

			if (replacement_text) {
				const temp = replacement_text;
				replacement_text = '';
				dispatchIntent(replace_text, temp);
			} else {
				BlankFlags.RUNNING = false;
			}
			break;
		}
		/*
			onPaste:
				- Get data from ClipboardEvent and use it to perform paste_content intent.
				- onPaste is called by document.execCommand('paste').
		*/
		case 'paste': {
			e.preventDefault();
			e.stopPropagation();

			if (BlankFlags.RUNNING) return;
			BlankFlags.RUNNING = true;

			// Get pasted data via clipboard API
			const clipboardData = e.clipboardData || window.clipboardData; // $FlowFixMe
			const pastedData = clipboardData.getData('text/plain');
			dispatchIntent(paste_content, pastedData);
			break;
		}
		/*
			onCopy:
				- Clear ClipboardEvent.data.
				- onCopy is called by document.execCommand('copy') when copying or cutting
				  from Blank Editor.
		*/
		case 'copy': {
			e.preventDefault();
			e.stopPropagation();

			// Get pasted data via clipboard API
			const clipboardData = e.clipboardData || window.clipboardData; // $FlowFixMe
			clipboardData.setData('text/plain', '');
			break;
		}
		default: {
			break;
		}
	}
};

export { ContextHandlers as default };
