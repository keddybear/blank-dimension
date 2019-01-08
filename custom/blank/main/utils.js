// @flow

//= Utils

// BlankFlags: These are togglable flags used by BlankEditor.
export const BlankFlags = {
	/*
		RUNNING:
			- If true, ignore all user interaction by disabling all event handlers. No more
			  than one task can be running at the same time.
			- Set to true in event handlers when an async is about to run.
			- Set to false at the end of that async task.
	*/
	RUNNING: false,
	/*
		SELECTION_FROM_BS:
			- Set to true at the end of setWindowSelectionFromPAS().
			- Set to false in selectionchange event handler. It prevents creating the same
			  BAS from the current window selection, because BAS is already set from PAS
			  before setWindowSelectionFromPAS().
				- Also retain CONTINUOUS_ACTION.
	*/
	SELECTION_FROM_BS: false,
	/*
		SELECTION_CLEARED_BY_BS:
			- removeAllRanges() also fires selectionchange.
	*/
	SELECTION_CLEARED_BY_BS: false,
	/*
		CONTINUOUS_ACTION:
			- If true, there's no need to call readyTempHistorySteps() in Complete Action Ops.
			- Set by Complete Action Op and onSelectionChangeHandler().
	*/
	CONTINUOUS_ACTION: false,
	/*
		DISABLE_RENDER:
			- Disable markBlankElementDirty in unchain() for testing.
	*/
	DISABLE_RENDER: false
};

/*
	instanceOf
	isBitSet
	debounce
	Semaphore
	Atomic
*/

/*
	instanceOf:
		- Used to replace instanceof, which is slow according to jsPerf: https://jsperf.com/instanceof-vs-undefined
		- It expects the variable v to have an "identity" attribute, and compares it against
		  its identity name.
		  	- If v is not an object, return false.
		- Though not the fastest, this function exists for maintenance reason.
	@ params
		v: mixed
		k: String
	@ return
		bool: Boolean
*/
export function instanceOf(v: mixed, k: string): boolean {
	if (typeof v !== 'object') return false;
	if (v === null) return false; // null is an object
	return v[k] !== undefined;
}

/*
	isBitSet:
		- Check if a single bit is set in a number.
	@ params
		num: number (the number to be checked)
		int: number (the decimal value of the bit)
	@ return
		set: boolean
*/
export function isBitSet(num: number, int: number): boolean {
	return num === (num | int); // eslint-disable-line no-bitwise
}

/*
	debounce:
		- Return a debounced function.
	@ params
		fn: function
		delay: number
	@ return
		func: function
*/
export function debounce(fn: () => void, delay: number): () => void {
	let debounced;
	return function (...args) {
		clearTimeout(debounced);
		debounced = setTimeout(() => fn.apply(this, args), delay);
	};
}

/*
	Semaphore
		- Create a semaphore to run a max number of async operations.
		- NOTE: semaphore will queue up operations.
	@ params
		max: number
	@ return
		result: async<function>
*/
export function Semaphore(max: number): (() => any) => Promise<*> {
	const tasks = [];
	let counter = max;

	const dispatch = () => {
		if (counter > 0 && tasks.length > 0) {
			counter -= 1;
			tasks.shift()();
		}
	};

	const release = () => {
		counter += 1;
		dispatch();
	};

	const acquire = () =>
		new Promise((resolve) => {
			tasks.push(resolve);
			setImmediate(dispatch);
		});

	return async (fn) => {
		await acquire();
		let result;
		try {
			result = await fn();
		} catch (e) {
			throw e;
		} finally {
			release();
		}
		return result;
	};
}

/*
	Atomic:
		- Return an atomic function using semaphore.
		- NOTE: atomic functions will be queued up if called successively. If subsequent
		  functions use data that will be modified by previous functions, the final
		  result may be confusing to users.
	@ params
		fn: function
	@ return
		result: async<>
*/
export function Atomic(fn: () => any): () => Promise<*> {
	const semaphore = Semaphore(1);
	return async () => {
		await semaphore(fn);
	};
}
