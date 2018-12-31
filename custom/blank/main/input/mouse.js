// @flow
import { KeyModifiers } from './utils';

const { SHIFT, CTRL, ALT, META } = KeyModifiers;

let BlankMouseExists = false;
class BlankMouse {
	/*
		BlankMouse stores the information of a MouseEvent.

		The current state of BlankMouse, in combination with the current state of
		BlankKeyboard, is used to switch Context OR perform an Intent. (Switching
		context is also an intent.)

		"click", "mousedown", "mouseup", "mouseover", and so forth, will modify
		BlankMouse accordingly.

		Events:

		Here are how events are fired. Events after arrows will not be fired if ones
		before arrows call preventDefault().

		1. mousedown -> mouseup -> click
	*/

	/*
		@ attributes
		target: EventTarget (target) - default: null
		x: number (clientX) - default: 0
		y: number (clientY) - default: 0
		shift: number - default: 0
		alt: number - default: 0
		ctrl: number - default: 0
		meta: number - default: 0
	*/
	target: EventTarget | null;
	x: number;
	y: number;
	shift: number;
	alt: number;
	ctrl: number;
	meta: number;

	/*
		@ methods
		click
	*/

	/*
		constructor
	*/
	constructor() {
		if (BlankMouseExists === true) {
			throw new Error('Only one instance of BlankMouse can be created.');
		}
		BlankMouseExists = true;

		this.target = null;
		this.x = 0;
		this.y = 0;
		this.shift = 0;
		this.alt = 0;
		this.ctrl = 0;
		this.meta = 0;
	}

	/*
		click:
			- Store the target that triggers the click event.
		@ params
			e: MouseEvent
	*/
	click(e: MouseEvent): void {
		this.target = e.target;
		this.shift = e.shiftKey ? SHIFT : 0;
		this.alt = e.altKey ? ALT : 0;
		this.ctrl = e.ctrlKey ? CTRL : 0;
		this.meta = e.metaKey ? META : 0;
	}
}

const Mouse = new BlankMouse();

export { Mouse as default };
