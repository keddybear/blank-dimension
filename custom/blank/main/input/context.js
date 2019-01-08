// @flow
import { BlankContexts } from './utils';
import ContextHandlers from './handler';

/*
	When using a Blank Editor, user input always has a context. For example, user can
	be composing, editing styles, using toolbars, viewing chapter list, or interacting
	with the main menu.

	Same input in different context leads to different actions.

	Generally, there are Keyboard input and Mouse input. Their respective listeners
	are attached to window/document, and they must have a definitive event target
	within their context that can be directly used to perform "intents".

	For example, a keydown event in the context of COMPOSITION will perform the TYPING
	intent.

	Each context is required to have an intent to switch context. For example, user
	can click a button in COMPOSITION context to enter MAIN_MENU context, and holding
	shift key in COMPOSITION context will enter BRANCH_SELECTION context.

	Sometimes, it may feel like a context exists within another context, but to make
	things simpler, treat them as parallel.

	Each context has their own event handlers. For exmaple, some contexts may handle
	"click" event while others do not.

	Lifecycle:

	Event -> Context -> Handler -> Intent -> Action
*/

const { NO_CONTEXT, COMPOSITION } = BlankContexts;

let BlankContextExists = false;
class BlankContext {
	/*
		BlankContext stores the current context and returns the InputProcessor for that
		context.

		Once Blank Editor is initialized, it will set focus on the contenteditable field
		and set Context to COMPOSITION.

		The InputProcessor for NO_CONTEXT is empty.
	*/

	/*
		@ attributes
		context: string
	*/
	context: string;

	/*
		@ methods
		handleEvent
		init
	*/

	/*
		constructor
	*/
	constructor() {
		if (BlankContextExists === true) {
			throw new Error('Only one instance of BlankContext can be created.');
		}
		BlankContextExists = true;

		this.context = NO_CONTEXT;
	}

	/*
		getHandler:
			- Return the EventHandler for the current context.
	*/
	handleEvent(
		eventName: string,
		event: KeyboardEvent | MouseEvent | ClipboardEvent | Event
	): void {
		ContextHandlers[this.context](eventName, event);
	}

	/*
		init:
			- Set context to COMPOSITION.
	*/
	init(): void {
		this.context = COMPOSITION;
	}
}

const Context = new BlankContext();

export { Context as default };
