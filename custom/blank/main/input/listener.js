// @flow
import Context from './context';

// keydown
export function onKeyDown(e: KeyboardEvent): void {
	Context.handleEvent('keydown', e);
}
// keyup
export function onKeyUp(e: KeyboardEvent): void {
	Context.handleEvent('keyup', e);
}
// click
export function onClick(e: MouseEvent): void {
	Context.handleEvent('click', e);
}
// selectstart
export function onSelectStart(e: Event): void {
	Context.handleEvent('selectstart', e);
}
// selectionchange
export function onSelectionChange(e: Event): void {
	Context.handleEvent('selectionchange', e);
}
// beforeinput
export function onBeforeInput(e: Event): void {
	Context.handleEvent('beforeinput', e);
}
// input
export function onInput(e: Event): void {
	Context.handleEvent('input', e);
}
// paste
export function onPaste(e: ClipboardEvent): void {
	Context.handleEvent('paste', e);
}
// copy
export function onCopy(e: ClipboardEvent): void {
	Context.handleEvent('copy', e);
}
