// @flow
import Keyboard from './keyboard';
import Mouse from './mouse';
import Context from './context';
import dispatchIntent from './intent';

import { onSelectionChangeHandler } from '../selection';
import { BlankFlags, debounce } from '../utils';

function performAction() {
	const intent = Context.getProcessor().getIntent();
	dispatchIntent(intent);
}

const debouncedOnSelectionChange = debounce(onSelectionChangeHandler, 275);

// Event Handlers
/*
	onKeyDown:
		- Perform action on keydown.
	@ params
		e: KeyboardEvent
*/
export function onKeyDown(e: KeyboardEvent): void {
	e.preventDefault();
	e.stopPropagation();

	if (BlankFlags.RUNNING) return;
	BlankFlags.RUNNING = true;

	Keyboard.release(e);
	performAction();
}
/*
	onKeyUp:
		- Perform action on keyup.
	@ params
		e: KeyboardEvent
*/
export function onKeyUp(e: KeyboardEvent): void {
	e.preventDefault();
	e.stopPropagation();

	if (BlankFlags.RUNNING) return;
	BlankFlags.RUNNING = true;

	Keyboard.release(e);
	performAction();
}
/*
	onClick:
		- Perform action on click.
	@ params
		e: MouseEvent
*/
export function onClick(e: MouseEvent): void {
	e.preventDefault();
	e.stopPropagation();

	if (BlankFlags.RUNNING) return;
	BlankFlags.RUNNING = true;

	Mouse.click(e);
	performAction();
}
/*
	onSelectStart:
		- Disable user selection while running a task.
	@ params
		e: Event
*/
export function onSelectStart(e: Event): void {
	if (BlankFlags.RUNNING) {
		e.preventDefault();
		e.stopPropagation();
	}
}
/*
	onSelectionChange:
		- Update BAS on selection change.
	@ params
		e: Event
*/
export function onSelectionChange(e: Event): void {
	e.preventDefault();
	e.stopPropagation();

	if (BlankFlags.RUNNING) return;
	BlankFlags.RUNNING = true;

	debouncedOnSelectionChange();
	BlankFlags.RUNNING = false;
}
/*
	onBeforeInput:
		- Capture any non-keyboard initiated input event and perform action.
	@ params
		e: Event
*/
export function onBeforeInput(e: Event): void {
	e.preventDefault();
	e.stopPropagation();

	if (BlankFlags.RUNNING) return;
	BlankFlags.RUNNING = true;
	// $FlowFixMe
	if (e.inputType && e.inputType === 'insertReplacementText') {
		// $FlowFixMe
		const replacement = e.data === null ? e.dataTransfer.getData('text/plain') : e.data;
		if (replacement !== null) {
			const intent = Context.getProcessor().getIntent('replace_text');
			dispatchIntent(intent, replacement);
		} else {
			BlankFlags.RUNNING = false;
		}
	}
}
/*
	onPaste:
		- Get data from ClipboardEvent and use it to perform paste_content intent.
		- onPaste is called by document.execCommand('paste').
	@ params
		e: ClipboardEvent
*/
export function onPaste(e: ClipboardEvent): void {
	e.preventDefault();
	e.stopPropagation();

	if (BlankFlags.RUNNING) return;
	BlankFlags.RUNNING = true;

	// Get pasted data via clipboard API
	const clipboardData = e.clipboardData || window.clipboardData;
	const pastedData = clipboardData.getData('text/plain');

	const intent = Context.getProcessor().getIntent('paste_content');
	dispatchIntent(intent, pastedData);
}
/*
	onCopy:
		- Clear ClipboardEvent.data.
		- onCopy is called by document.execCommand('copy') when copying from Blank Editor.
	@ params
		e: ClipboardEvent
*/
export function onCopy(e: ClipboardEvent): void {
	e.preventDefault();
	e.stopPropagation();

	// Get pasted data via clipboard API
	const clipboardData = e.clipboardData || window.clipboardData;
	clipboardData.setData('text/plain', '');
}
