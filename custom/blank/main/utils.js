//= Utils

// BlankFlags: These are togglable flags used by BlankEditor.
export const BlankFlags = {
	/*
		IS_COMPOSING:
			- If true, disallow User Action and ignore Selection change.
			- Set by Complete Action Op.
	*/
	IS_COMPOSING: false,
	/*
		SELECTION_FROM_BS:
			- If true, there's no need to create a new BlankSelection in onSelectionChangeHandler().
			- Set by restoring native selection in setWindowSelectionFromPAS().
	*/
	SELECTION_FROM_BS: false,
	/*
		IS_DRAGGING_SELECTION:
			- If true, there's no need to create a new BlankSelection in onSelectionChangeHandler().
			- Set to true when user is dragging the selection.
	*/
	IS_DRAGGING_SELECTION: false,
	/*
		CONTINUOUS_ACTION:
			- If true, there's no need to call readyTempHistorySteps() in Complete Action Ops.
			- Set by Complete Action Op and onSelectionChangeHandler().
	*/
	CONTINUOUS_ACTION: false
};

/*
	instanceOf
	isBitSet
*/

/*
	instanceOf:
		- Used to replace instanceof, which is slow according to jsPerf: https://jsperf.com/instanceof-vs-undefined
		- It expects the variable v to have an "identity" attribute, and compares it against
		  its identity name.
		- Though not the fastest, this function exists for maintenance reason.
	@ params
		v: mixed
		k: String
	@ return
		bool: Boolean
*/
export function instanceOf(v: mixed, k: string): boolean {
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
