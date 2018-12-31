// @flow
// KeyboardEvent.code: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
import { KeyTypes, KeyModifiers } from './utils';

const { CHARACTER } = KeyTypes;
const { SHIFT, CTRL, ALT, META, ANY } = KeyModifiers;

// This is the normalized key mappings, in case different browsers have different
// names for the same key.
const NormalizedKeyMapping = new Map([
	['OSLeft', 'MetaLeft'], // Chrome
	['OSRight', 'MetaRight'] // Chrome
]);

let BlankKeyboardExists = false;
class BlankKeyboard {
	/*
		BlankKeyboard stores the information of a KeyboardEvent.

		The current state of BlankKeyboard, in combination with the current state of
		BlankMouse, is used to switch Context OR perform an Intent. (Switching context
		is also an intent.)

		Pressing a key will store its keyboard event. Releasing a key will change
		the stored state accordingly.

		It does not care if a key is pressed and not released. It only cares if a
		KeyboardEvent has fired.

		Events:

		Here are how events are fired. Events after arrows will not be fired if ones
		before arrows call preventDefault().

		1. keydown -> keypress
		2. keyup
	*/

	/*
		@ attributes
		current: string - default: ''
		character: string - default: ''
		shift: number - default: 0
		alt: number - default: 0
		ctrl: number - default: 0
		meta: number - default: 0
		repeat: boolean - default: false
		qwertz: boolean - default: false
	*/
	current: string;
	character: string;
	shift: number;
	alt: number;
	ctrl: number;
	meta: number;
	repeat: boolean;
	qwertz: boolean;

	/*
		@ methods
		press
		release
		pressed
	*/

	/*
		constructor
	*/
	constructor() {
		if (BlankKeyboardExists === true) {
			throw new Error('Only one instance of BlankKeyboard can be created.');
		}
		BlankKeyboardExists = true;

		this.current = '';
		this.character = '';
		this.shift = 0;
		this.alt = 0;
		this.ctrl = 0;
		this.meta = 0;
		this.repeat = false;
		// Whether the keyboard is QWERTY or QWERTZ (TODO)
		this.qwertz = false;
	}

	/*
		press:
			- Store the key that triggers the keydown event.
		@ params
			e: KeyboardEvent
	*/
	press(e: KeyboardEvent): void {
		this.current = NormalizedKeyMapping.get(e.code) || e.code;
		this.character = e.key.length === 1 ? e.key : '';
		this.shift = e.shiftKey ? SHIFT : 0;
		this.alt = e.altKey ? ALT : 0;
		this.ctrl = e.ctrlKey ? CTRL : 0;
		this.meta = e.metaKey ? META : 0;
		this.repeat = e.repeat;
	}

	/*
		release:
			- Update modifiers.
		@ params
			e: KeyboardEvent
	*/
	release(e: KeyboardEvent): void {
		this.shift = e.shiftKey ? SHIFT : 0;
		this.alt = e.altKey ? ALT : 0;
		this.ctrl = e.ctrlKey ? CTRL : 0;
		this.meta = e.metaKey ? META : 0;
	}

	/*
		pressed:
			- If "key" is a string, check it against this.current. If it's CHARACTER (=1),
			  check if this.character is empty.
			  	- If "key" is null, skip it.
			- The rest of arguments are modifiers, represented by numbers. Specified
			  modifiers must be pressed, and non-specified ones must not be pressed.
		@ params
			name: number | string
		@ return
			bool: boolean
	*/
	pressed(key: number | string | null, ...modifiers: Array<number>): boolean {
		if (key !== null) {
			if (typeof key === 'string' && key !== this.current) return false;
			if (key === CHARACTER && this.character === '') return false;
		}

		if (modifiers.length === 1 && modifiers[0] === ANY) return true;

		// Check modifiers by using hash
		let hash = 0;
		for (let i = 0; i < modifiers.length; i += 1) {
			hash += modifiers[i];
		}
		if (hash !== this.shift + this.alt + this.ctrl + this.meta) return false;

		return true;
	}
}

const Keyboard = new BlankKeyboard();

export { Keyboard as default };
