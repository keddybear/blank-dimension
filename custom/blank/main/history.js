// @flow
/*
	NOTE: Inline class doesn't exist yet.
		  Refactor BlankHistory & BlankHistoryStep to work with Inline.
*/
export class BlankHistoryStep {
	/*
		@ attributes
		stack: Array<mixed> - default: []
		past: Boolean - default: false
		future: Boolean - default: false
	*/
	stack: Array<mixed>;
	past: boolean;
	future: boolean;

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
			Empty the stack by setting its length to 0
	*/
	clear() {
		this.stack.length = 0;
	}

	/*
		detach:
			Declare an empty array for stack. Its old stack can be referenced for reuse.
	*/
	detach() {
		this.stack = [];
	}
}

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
			- Clear future stack if not redo().
			- Do nothing if step is empty. (readyHistoryStep() does the same thing.)
		@ params
			step: BlankHistoryStep
			redo: Boolean - default: false
	*/
	push(step: BlankHistoryStep, redo: boolean = false): void {
		if (step.stack.length === 0) return;
		if (step.past) {
			if (!redo) this.stackFuture.length = 0;
			this.stackPast.push(step);
		} else {
			this.stackFuture.push(step);
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
