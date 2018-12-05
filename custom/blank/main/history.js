// @flow
import { BlankSelection, _MANUAL_ } from './selection';

export class BlankHistoryStep {
	/*
		@ attributes
		stack: Array<mixed> - default: []
		past: Boolean - default: false
		future: Boolean - default: false
		redo: Boolean - default: false
		bas: BlankSelection - default: null
		pas: BlankSelection - default: null
	*/
	stack: Array<mixed>;
	past: boolean;
	future: boolean;
	redo: boolean;
	bas: BlankSelection | null;
	pas: BlankSelection | null;

	/*
		@ methods
		push
		pop
		clear
		detach
	/*
		constructor
	*/
	constructor(past: boolean) {
		this.stack = [];
		this.redo = false;
		this.bas = new BlankSelection(_MANUAL_);
		this.pas = new BlankSelection(_MANUAL_);

		// past and future cannot be mutated
		this.past = past;
		this.future = !this.future;
	}

	/*
		push:
			Same as Array.push
	*/
	push(e: mixed): number {
		return this.stack.push(e);
	}

	/*
		pop:
			Same as Array.pop
	*/
	pop(): mixed {
		return this.stack.pop();
	}

	/*
		clear:
			- Empty the stack by setting its length to 0.
			- Reset everything else to default value.
	*/
	clear() {
		this.stack.length = 0;
		this.redo = false;
		this.bas = new BlankSelection(_MANUAL_);
		this.pas = new BlankSelection(_MANUAL_);
	}

	/*
		detach:
			- Declare an empty array for stack. Its old stack can be referenced for reuse.
	*/
	detach() {
		this.stack = [];
	}
}

/*
	copyHistoryStep:
		- Since TempHistoryStep will be cleared before any action is performed, its stack
		  needs to be copied before being put into the History stack.
		- Copy the reference of the old stack and declare [] for TempHistoryStep
		- past and future values are also copied.
		- Return the new Step
	@ params
		oldStep: BlankHistoryStep
	@ return
		newStep: BlankHistoryStep
*/
export function copyHistoryStep(oldStep: BlankHistoryStep): BlankHistoryStep {
	const newStep = new BlankHistoryStep(oldStep.past);
	newStep.stack = oldStep.stack;
	newStep.redo = oldStep.redo;
	newStep.bas = oldStep.bas;
	newStep.pas = oldStep.pas;
	oldStep.detach();
	return newStep;
}

const MAX_HISTORY_SIZE = 100;

let BlankHistoryExist = false;
class BlankHistory {
	/*
		Only one BlankHistory instance is allowed.

		@ attributes
		stackPast: Array<BlankHistoryStep> - default: []
		stackFuture: Array<BlankHistoryStep> - default: []
	*/
	stackPast: Array<BlankHistoryStep>;
	stackFuture: Array<BlankHistoryStep>;

	/*
		@ methods
		pop
		push
		clear
	/*
		constructor
	*/
	constructor() {
		if (BlankHistoryExist === true) {
			throw new Error('Only one instance of BlankHistory can be created.');
		}
		BlankHistoryExist = true;

		this.stackPast = [];
		this.stackFuture = [];
	}

	/*
		pop:
			pop from past or future stack
		@ params
			past: Boolean
		@ return
			Same as pop()
	*/
	pop(past: boolean): BlankHistoryStep {
		if (past) {
			return this.stackPast.pop();
		}
		return this.stackFuture.pop();
	}

	/*
		push:
			- Push a BlankHistoryStep into either past or future stack, depending
			  on its past value.
			- Do not clear future stack if the pushed step is from redo().
			- Do nothing if step is empty. (readyHistoryStep() does the same thing.)
			- shift() if exceeding max size.
		@ params
			step: BlankHistoryStep
	*/
	push(step: BlankHistoryStep): void {
		if (step.stack.length === 0) return;
		if (step.past) {
			if (!step.redo) this.stackFuture.length = 0;
			this.stackPast.push(step);
			if (this.stackPast.length > MAX_HISTORY_SIZE) {
				this.stackPast.shift();
			}
		} else {
			this.stackFuture.push(step);
			if (this.stackFuture.length > MAX_HISTORY_SIZE) {
				this.stackFuture.shift();
			}
		}
	}

	/*
		clear:
			- Clear either stackPast or stackFuture by setting its length to 0
		@ params
			past: Boolean
	*/
	clear(past: boolean): void {
		if (past) {
			this.stackPast.length = 0;
		} else {
			this.stackFuture.length = 0;
		}
	}
}

export const History = new BlankHistory();

/* eslint-disable */
/*
	EXAMPLES

	Perform action:

	1. Create a new HistoryStep object set to past (It means HistoryStep will be pushed into History.stackPast)
		- Also clear History.stackFuture

	2. Perform actions on all selected Leaves
	3. Put new Leaves into dirty stack
	4. Once done, call autoMerge on all Leaves in dirty stack
	5. During the entire process, put unchained Leaves into HistoryStep

	6. After autoMerge, put HistoryStep into History.stackPast
	7. Re-render


	Undo:

	1. Create a new HistoryStep object set to future (It means HistoryStep will be pushed into History.stackFuture

	2. Pop a Step from History.stackPast
	3. Iterate through elements in Step and perform rechain()
	4. During the entire process, put unchained Leaves into HistoryStep
		- (Not sure if autoMerge should be called)

	5. Once done, put HistoryStep into History.stackFuture
	6. Re-render
*/
