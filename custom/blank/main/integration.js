import { Leaf, LeafStyles, NullLeaf, LeafChain, LeafText } from './leaf';
import { History, BlankHistoryStep } from './history';

/*
	Before you begin writing functions, each function should be assigned a responsibility, and it
	should strictly adhere to the definition of that responsibility. Any violation of this will
	cause unforseeable bugs in the future.

	Responsibilities:

	History
		YES:
			- It stores history steps and push and pop them, and decides when to clear its history
			  stacks.
		NO:
			- It does not decide when to push or pop.

	Action
		YES:
			- It performs Node and Leaf changes, and makes sure TempHistoryPastStep and
			  TempHistoryFutureStep have elements that, when iterated through, can be used to undo
			  those changes.
		NO:
			- It does not decide when to push history steps into history stacks.

	User Action
		YES:
			- It comprises of the current user selection and an action command that triggers an
			  Action.
			- It decides when to push history steps into history stacks.
			- A User Action will produce a new user selection, after the action is done. The new
			  user selection can be the same as the previous one.
		NO:
			- It does not decide how an Action will be performed.
*/

//= Leaf basic functions

/*
	sameLeafStylesOld
	sameLeafStyles
	setLeafStyles
	copyLeafStyles
	printLeafStyles
	printLeafChain
	isZeroLeaf
	trimRange
	destroyLeaf
*/

/*
	sameLeafStylesOld:
		- Compare the styles of two Leaves, return true if all styles are the same, else false.
		- There are better/faster ways to compare two LeafStyles (see sameLeafStyles)
	@ params
		s1: Leaf object
		s2: Leaf object
	@ return
		Boolean
*/
export function sameLeafStylesOld(l1: Leaf, l2: Leaf): boolean {
	if (l1 === null || l2 === null) return false;
	if (l1 === l2) return true;
	const props = Object.entries(l1.styles);
	for (const [key, value] of props) {
		if (value !== (l2.styles: Object)[key]) {
			return false;
		}
	}
	return true;
}

/*
	sameLeafStyles:
		- Compare the styles of two Leaves by comparing their hash value.
	@ params
		s1: Leaf object
		s2: Leaf object
	@ return
		Boolean
*/
export function sameLeafStyles(l1: Leaf, l2: Leaf): boolean {
	if (l1 === null || l2 === null) return false;
	if (l1 === l2) return true;
	return l1.styles.hash === l2.styles.hash;
}

/*
	setLeafStyles:
		- Create a new LeafStyle object for Leaf from a LeafStyles object
	@ params
		leaf: Leaf object
		styles: LeafStyles
*/
export function setLeafStyles(leaf: Leaf, styles: LeafStyles): void {
	const l = leaf;
	const { ...styleProps } = styles;
	l.styles = new LeafStyles({ ...styleProps });
}

/*
	copyLeafStyles:
		- Copy one Leaf's styles to another, by creating a new LeafStyles object
	@ params
		leaf: Leaf object
		leafToCopy: Leaf object
*/
export function copyLeafStyles(leaf: Leaf, leafToCopy: Leaf): void {
	const l = leaf;
	const { ...styleProps } = leafToCopy.styles;
	l.styles = new LeafStyles({ ...styleProps });
}

/*
	printLeafStyles:
		- print the Leaf's styles in printLeafChain()
		- Only use for development
	@ params
		leaf: Leaf object
	@ return
		string: String
	@ output
		@-[leaf1.text] B
		|
		@-[leaf2.text] BI
*/
function printLeafStyles(leaf: Leaf): string {
	const { styles } = leaf;
	let result = '';
	for (const [key, value] of Object.entries(styles)) {
		if (value && key !== 'hash') {
			result = `${result}${key.charAt(0).toUpperCase()}`;
		}
	}
	return result;
}

/*
	printLeafChain:
		- print the Leaf chain, until prevLeaf and nextLeaf are null
		- Only use for development
	@ params
		leaf: Leaf object
		up: Boolean - default: true
	@ output
		@-[leaf1]
		|
		@-[leaf2]
		|
		@-[Leaf3]
*/
export function printLeafChain(leaf: Leaf, up: boolean = true): void {
	if (up) {
		if (leaf.prevLeaf instanceof Leaf) {
			printLeafChain(leaf, true);
		} else {
			printLeafChain(leaf, false);
		}
	} else {
		const styleStr = printLeafStyles(leaf);
		console.log(`@-[${leaf.text}] ${styleStr}`);
		if (leaf.nextLeaf instanceof Leaf) {
			console.log('|');
			printLeafChain(leaf.nextLeaf, false);
		}
	}
}

/*
	isZeroLeaf:
		- Check if a Leaf's text is only zero-width space.
	@ params
		leaf: Leaf object
	@ return
		Boolean
*/
export function isZeroLeaf(leaf: Leaf): boolean {
	return leaf.text === '\u200b';
}

/*
	trimRange:
		- Make sure the selection range argument passed to methods is an array of two numbers
		- The second number >= the first number
		- The second number <= Leaf.text.length
		- If range is outside Leaf.text (either end), trim the range
	@ params
		leaf: Leaf object
		range: Array<number> - default [0, 0]
	@ return
		Array<number> - default [0, 0]
*/
export function trimRange(leaf: Leaf, range: Array<number> = [0, 0]): Array<number> {
	const maxLen = leaf.text.length;
	let n1 = 0;
	let n2 = 0;

	if (typeof range[0] === 'number' && typeof range[1] === 'number') {
		[n1, n2] = range;
		if (n1 > maxLen) {
			n1 = maxLen;
		} else if (n1 < 0) {
			n1 = 0;
		}
		if (n2 > maxLen) {
			n2 = maxLen;
		} else if (n2 < 0) {
			n2 = 0;
		}
	}

	return n1 > n2 ? [n2, n1] : [n1, n2];
}

/*
	destroyLeaf:
		- Discard a new Leaf, chain its prevLeaf and nextLeaf together
		- Throw error if it's an old Leaf
		- Always return null
		- Example: leaf = destroyLeaf(leaf);
	@ params
		leaf: Leaf
	@ return
		null
*/
export function destroyLeaf(leaf: Leaf): null {
	if (!leaf.new) {
		throw new Error('Only new Leaf can be destroyed.');
	}

	const l = leaf;
	const { prevLeaf, nextLeaf } = l;
	if (prevLeaf instanceof Leaf) {
		prevLeaf.nextLeaf = nextLeaf;
	}
	if (nextLeaf instanceof Leaf) {
		nextLeaf.prevLeaf = prevLeaf;
	}

	return null;
}

//= Leaf chaining & advanced operations

/*
	unchain
	chained
	chain
	chainBetween
	chainBetweenDangerous
	rechain
	consume
	applyLeafStyle
	autoMergeLeaf
	autoMergeDirtyLeaves
*/

/*
	NOTE: Currently, Inline class does not exist, so chain/unchain only works on Leaves
		  Refactor the code for Inline chaining (TODO)

	unchain:
		- Push the unchained Leaf to the temporary history step
			- After pushing all unchained Leaves, this history step will be pushed into
			  either history's past stack or future stack, depending on the operation.
	@ params
		leaf: Leaf object
		past: Boolean
*/
export const _PAST_STACK_ = true;
export const _FUTURE_STACK_ = false;
export const TempHistoryPastStep = new BlankHistoryStep(_PAST_STACK_);
export const TempHistoryFutureStep = new BlankHistoryStep(_FUTURE_STACK_);
export function unchain(leaf: Leaf | NullLeaf | LeafChain | LeafText, past: boolean): void {
	if (past) {
		TempHistoryPastStep.push(leaf);
	} else {
		TempHistoryFutureStep.push(leaf);
	}
}

/*
	chained:
		- Check if two Leaves are *directly* chained.
		- Return a number to indicate chained state.
		- Leaf is not chained if checked against itself.
	@ params
		leaf1: Leaf object (required)
		leaf2: Leaf object (required)
	@ return
		Number:
			- 0: not chained
			- 1: leaf1 is chained after leaf2
			- 2: leaf1 is chained before leaf2
*/
export const _NOT_CHAINED_ = 0;
export const _CHAINED_AFTER_ = 1;
export const _CHAINED_BEFORE_ = 2;
export function chained(leaf1: Leaf, leaf2: Leaf): number {
	if (leaf1 === leaf2) {
		return _NOT_CHAINED_;
	} else if (leaf1.prevLeaf === leaf2 && leaf2.nextLeaf === leaf1) {
		return _CHAINED_AFTER_;
	} else if (leaf1.nextLeaf === leaf2 && leaf2.prevLeaf === leaf1) {
		return _CHAINED_BEFORE_;
	}
	return _NOT_CHAINED_;
}

/*
	NOTE: Currently, Inline class does not exist, so chain/unchain only works on Leaves
		  Refactor the code for Inline chaining (TODO)

	chain:
		- Check if prevLeaf.nextLeaf matches currentLeaf.prevLeaf. If not, make it match.
		- Same goes for nextLeaf.prevLeaf
		- Only NEW Leaf can be chained. In other words, chain() is used on new Leaves.
			- rechain() is used for old Leaves.
		- New Leaf's prevLeaf and nextLeaf must not be replaced if not null
		- If target Leaf is also new, newLeaf's prevLeaf and nextLeaf must be null.
		  (To avoid circular chain)
		- Also, new Leaf's prevLeaf must be null if chained after,
		  or nextLeaf must be null if chained before.
		- Target Leaf can be either new or old.
		- Only push target Leaf to history stack if it's old.
		- IMPORTANT! Chaining after or before an old Leaf means replacing its original
		  prevLeaf or nextLeaf.
			- You cannot insert a Leaf by chaining the replaced Leaf back, because it has
			  already being unchained(). This will completely wreck the chain, and undo() will
			  stop working.
			- Insert is handled by chainBetween(). After insertion, a NullLeaf is unchained,
			  describing which two Leaves are originally chained together.
	@ params
		newLeaf: Leaf object
		targetLeaf: Leaf object
		after: Boolean
*/
export const _CHAIN_AFTER_ = true;
export const _CHAIN_BEFORE_ = false;
export function chain(newLeaf: Leaf, targetLeaf: Leaf, after: boolean): void {
	const n = newLeaf;

	if (!(n instanceof Leaf)) {
		throw new Error('newLeaf in chain() must be a Leaf.');
	} else if (!n.new) {
		throw new Error('newLeaf in chain() must be a NEW Leaf.');
	} else if (after && n.prevLeaf !== null) {
		throw new Error('newLeaf.prevLeaf must be null if chained after.');
	} else if (!after && n.nextLeaf !== null) {
		throw new Error('newLeaf.afterLeaf must be null if chained before.');
	}

	const t = targetLeaf;

	if (!(t instanceof Leaf)) {
		throw new Error('targetLeaf in chain() must be a Leaf');
	}

	// If targetLeaf is new, chain one Leaf at a time to avoid circular referencing.
	if (t.new === true && (n.prevLeaf !== null || n.nextLeaf !== null)) {
		throw new Error('If targetLeaf is new, newLeaf must have no prevLeaf or nextLeaf to avoid circular chaining.');
	}

	// If Leaf is new, its prevLeaf or nextLeaf, if not null, must not be replaced.
	// (To avoid circular chain)
	if ((after && n.prevLeaf !== null) || (!after && n.nextLeaf !== null)) {
		throw new Error('newLeaf\'s prevLeaf and nextLeaf must not be replaced if not null.');
	}
	if (t.new === true) {
		if ((after && t.nextLeaf !== null) || (!after && t.prevLeaf !== null)) {
			throw new Error('If new, targetLeaf\'s prevLeaf and nextLeaf must not be replaced if not null.');
		}
	}

	// If already chained, do nothing
	if (after && chained(n, t) === _CHAINED_AFTER_) return;
	if (!after && chained(n, t) === _CHAINED_BEFORE_) return;

	if (after) {
		// Get target.nextLeaf
		let next2 = t.nextLeaf;
		// Update nextLeaf and prevLeaf
		t.nextLeaf = n;
		n.prevLeaf = t;
		// Push to stack only if target Leaf is old
		if (t.new === false) {
			if (next2 === null) {
				next2 = new NullLeaf({ prevLeaf: t });
			}
			unchain(next2, _PAST_STACK_);
		}
	} else {
		// Get target.prevLeaf
		let prev2 = t.prevLeaf;
		// Update nextLeaf and prevLeaf
		t.prevLeaf = n;
		n.nextLeaf = t;
		// Push to stack only if target Leaf is old
		if (t.new === false) {
			if (prev2 === null) {
				prev2 = new NullLeaf({ nextLeaf: t });
			}
			unchain(prev2, _PAST_STACK_);
		}
	}
}

/*
	chainBetween:
		- Insert a new chain between two Leaves.
			- You can assume every Leaf in the new chain is new, if its startLeaf
			  and endLeaf are new.
			- You can also assume startLeaf and endLeaf are from the same chain.
		- startLeaf's prevLeaf must be null.
		- endLeaf's nextLeaf must be null.
		- startLeaf and endLeaf can be the same Leaf.
		- targetLeaf1 and targetLeaf2 must be both old or new.
		- targetLeaf1 and targetLeaf2 must be chained together. (To avoid circular referencing)
			- targetLeaf1 can be after or before targetLeaf2.
		- Unchain a NullLeaf if targetLeaf1 and targetLeaf2 are old.
		- Inserting back an old Leaf is handled by rechain().
	@ params
		startLeaf: Leaf object
		endLeaf: Leaf object
		targetLeaf1: Leaf object
		targetLeaf2: Leaf object
*/
export function chainBetween(
	startLeaf: Leaf,
	endLeaf: Leaf,
	targetLeaf1: Leaf,
	targetLeaf2: Leaf
): void {
	if (!startLeaf.new || !endLeaf.new) {
		throw new Error('The new chain\'s startLeaf and endLeaf must be new for chainBetweem().');
	}

	if (endLeaf.nextLeaf !== null || startLeaf.prevLeaf !== null) {
		throw new Error('The two ends of the new chain must be null for chainBetween().');
	}

	if (targetLeaf1.new !== targetLeaf2.new) {
		throw new Error('targetLeaf1 and targetLeaf2 must be both old or new for chainBetween().');
	}

	const state = chained(targetLeaf1, targetLeaf2);
	if (state === 0) {
		throw new Error('targetleaf1 and targetLeaf2 must be chained together for chainBetween().');
	}

	if (startLeaf === targetLeaf1 || startLeaf === targetLeaf2) {
		throw new Error('startLeaf must not be the same as either targetLeaf for chainBetween().');
	}

	if (endLeaf === targetLeaf1 || endLeaf === targetLeaf2) {
		throw new Error('endLeaf must not be the same as either targetLeaf for chainBetween().');
	}

	const s = startLeaf;
	const e = endLeaf;
	const t1 = state === 1 ? targetLeaf2 : targetLeaf1;
	const t2 = state === 1 ? targetLeaf1 : targetLeaf2;

	t1.nextLeaf = s;
	s.prevLeaf = t1;
	e.nextLeaf = t2;
	t2.prevLeaf = e;

	// Unchain a NullLeaf if targetLeaves are old
	if (!t1.new) {
		const nl = new NullLeaf({ prevLeaf: t1, nextLeaf: t2 });
		unchain(nl, _PAST_STACK_);
	}
}

/*
	chainBetweenDangerous:
		- same as chainBetween but it's not protected from circular referencing.
		  Use this only when you are sure targetLeaf1 is before targetLeaf2.
		- When targetLeaves are not chained, unchain a LeafChain.
	@ params
		same as chainBetween
*/
export function chainBetweenDangerous(
	startLeaf: Leaf,
	endLeaf: Leaf,
	targetLeaf1: Leaf,
	targetLeaf2: Leaf
): void {
	if (!startLeaf.new || !endLeaf.new) {
		throw new Error('The new chain\'s startLeaf and endLeaf must be new for chainBetweenDangerous().');
	}

	if (endLeaf.nextLeaf !== null || startLeaf.prevLeaf !== null) {
		throw new Error('The two ends of the new chain must be null for chainBetweenDangerous().');
	}

	if (targetLeaf1.new !== targetLeaf2.new) {
		throw new Error('targetLeaf1 and targetLeaf2 must be both old or new for chainBetweenDangerous().');
	}

	if (startLeaf === targetLeaf1 || startLeaf === targetLeaf2) {
		throw new Error('startLeaf must not be the same as either targetLeaf for chainBetweenDangerous().');
	}

	if (endLeaf === targetLeaf1 || endLeaf === targetLeaf2) {
		throw new Error('endLeaf must not be the same as either targetLeaf for chainBetweenDangerous().');
	}

	if (targetLeaf1.nextLeaf === startLeaf || targetLeaf2.prevLeaf === endLeaf) {
		throw new Error('startLeaf or endLeaf must not be already chained with either targetLeaf for chainBetweenDangerous()');
	}

	const s = startLeaf;
	const e = endLeaf;
	const t1 = targetLeaf1;
	const t2 = targetLeaf2;
	const n = t1.nextLeaf;
	const p = t2.prevLeaf;

	t1.nextLeaf = s;
	s.prevLeaf = t1;
	e.nextLeaf = t2;
	t2.prevLeaf = e;

	// Unchain if targetLeaves are old
	if (!t1.new) {
		// If targetLeaves are chained, unchain a NullLeaf
		if (chained(t1, t2) !== 0) {
			const nl = new NullLeaf({ prevLeaf: t1, nextLeaf: t2 });
			unchain(nl, _PAST_STACK_);
		} else {
			const lc = new LeafChain({ startLeaf: n, endLeaf: p });
			unchain(lc, _PAST_STACK_);
		}
	}
}

/*
	NOTE: Currently, Inline class does not exist, so chain/unchain only works on Leaves
		  Refactor the code for Inline chaining (TODO)
		  For example, each Leaf should have a parent, and if a Leaf.prevLeaf is null, it's
		  the parent's first Leaf.

	rechain:
		- Put Leaf from past or future history stack back into chain,
		  and push replaced Leaves to future or past history stack respectively.
		- Rechain is used for history redo() and undo().
		- Normally, removing a Leaf or Leaves means replacing them with one zero-width Leaf,
		  but during redo() and undo(), removing a Leaf or Leaves and re-inserting a Leaf or
		  Leaves back between two Leaves needs LeafChain object, which describes it
		  startLeaf.prevLeaf and endLeaf.nextLeaf.
		- NOTE: the two ends of LeafChain can be null. It needs to be handled by BlankBlock (TODO)
	@ params
		leaf: Leaf object
		fromPast: Boolean
*/
export const _FROM_PAST_ = true;
export const _FROM_FUTURE_ = false;
export function rechain(leaf: Leaf | NullLeaf | LeafChain | LeafText, fromPast: boolean): void {
	const l = leaf;

	if (l instanceof LeafChain) {
		const { prevLeaf, nextLeaf, startLeaf, endLeaf } = l;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevLeaf
		if (prevLeaf !== null && prevLeaf.nextLeaf !== l) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextLeaf
		if (nextLeaf !== null && nextLeaf.prevLeaf !== l) {
			rechainNext = true;
		}

		if (rechainPrev && rechainNext) {
			// Need to rechain both ends
			// Check if prevLeaf and nextLeaf are chained
			if (chained(prevLeaf, nextLeaf) !== 0) {
				// prevLeaf and nextLeaf are chained
				// Create a NullLeaf for unchain()
				const nl = new NullLeaf({ prevLeaf, nextLeaf });
				// Update prevLeaf.nextLeaf and nextLeaf.prevLeaf
				prevLeaf.nextLeaf = startLeaf;
				nextLeaf.prevLeaf = endLeaf;
				// Unchain NullLeaf
				unchain(nl, !fromPast);
			} else {
				// prevLeaf and nextLeaf are not chained
				// Create a LeafChain for unchain()
				const lc = new LeafChain({
					startLeaf: prevLeaf.nextLeaf,
					endLeaf: nextLeaf.prevLeaf
				});
				// Update prevLeaf.nextLeaf and nextLeaf.prevLeaf
				prevLeaf.nextLeaf = startLeaf;
				nextLeaf.prevLeaf = endLeaf;
				// Unchain LeafChain
				unchain(lc, !fromPast);
			}
		} else if (rechainPrev) {
			// Need to rechain prevLeaf
			// Get current prevLeaf's nextLeaf
			let next = prevLeaf.nextLeaf;
			// If prevLeaf's nextLeaf is null, create NullLeaf for unchain()
			if (next === null) {
				next = new NullLeaf({ prevLeaf });
			}
			// Update prevLeaf's nextLeaf
			prevLeaf.nextLeaf = startLeaf;
			// Unchain replaced Leaf
			unchain(next, !fromPast);
		} else if (rechainNext) {
			// Need to rechain nextLeaf
			// Get current nextLeaf's prevLeaf
			let prev = nextLeaf.prevLeaf;
			// If nextLeaf's prevLeaf is null, create NullLeaf for unchain()
			if (prev === null) {
				prev = new NullLeaf({ nextLeaf });
			}
			// Update nextLeaf's prevLeaf
			nextLeaf.prevLeaf = endLeaf;
			// Unchain replaced Leaf
			unchain(prev, !fromPast);
		}
	} else if (l instanceof NullLeaf) {
		const { prevLeaf, nextLeaf } = l;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevLeaf
		if (prevLeaf !== null && prevLeaf.nextLeaf !== null) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextLeaf
		if (nextLeaf !== null && nextLeaf.prevLeaf !== null) {
			rechainNext = true;
		}

		// If NullLeaf's prevLeaf and nextLeaf are not null, chain them together
		if (rechainPrev && rechainNext) {
			// Check if prevLeaf and nextLeaf are chained
			// If chained do nothing
			// If not chained, create a LeafChain for unchain()
			if (chained(prevLeaf, nextLeaf) === 0) {
				const lc = new LeafChain({
					startLeaf: prevLeaf.nextLeaf,
					endLeaf: nextLeaf.prevLeaf
				});
				// Chain original Leaves back together
				prevLeaf.nextLeaf = nextLeaf;
				nextLeaf.prevLeaf = prevLeaf;
				// Unchain LeafChain
				unchain(lc, !fromPast);
			}
		} else if (rechainPrev) {
			// NullLeaf is after a Leaf
			// Get current prevLeaf's nextLeaf
			const next = prevLeaf.nextLeaf;
			// Replace it with null value because of NullLeaf
			prevLeaf.nextLeaf = null;
			// Push replaced Leaf to stack
			unchain(next, !fromPast);
		} else if (rechainNext) {
			// NullLeaf is before a Leaf
			// Get current nextLeaf's prevLeaf
			const prev = nextLeaf.prevLeaf;
			// Replace it with null value becase of NullLeaf
			nextLeaf.prevLeaf = null;
			// Push replaced Leaf to stack
			unchain(prev, !fromPast);
		}
	} else if (l instanceof Leaf) {
		const { prevLeaf, nextLeaf } = l;

		let rechainPrev = false;
		let rechainNext = false;
		// Check if needed to rechain prevLeaf
		if (prevLeaf !== null && prevLeaf.nextLeaf !== l) {
			rechainPrev = true;
		}
		// Check if needed to rechain nextLeaf
		if (nextLeaf !== null && nextLeaf.prevLeaf !== l) {
			rechainNext = true;
		}

		if (rechainPrev && rechainNext) {
			// Need to rechain both ends
			// Check if prevLeaf and nextLeaf are chained
			if (chained(prevLeaf, nextLeaf) !== 0) {
				// prevLeaf and nextLeaf are chained
				// Create a NullLeaf for unchain()
				const nl = new NullLeaf({ prevLeaf, nextLeaf });
				// Insert old Leaf between prevLeaf and nextLeaf
				prevLeaf.nextLeaf = l;
				nextLeaf.prevLeaf = l;
				// Unchain NullLeaf
				unchain(nl, !fromPast);
			} else {
				// prevLeaf and nextLeaf are not chained
				// Create a LeafChain for unchain()
				const lc = new LeafChain({
					startLeaf: prevLeaf.nextLeaf,
					endLeaf: nextLeaf.prevLeaf
				});
				// Insert old Leaf between prevLeaf and nextLeaf
				prevLeaf.nextLeaf = l;
				nextLeaf.prevLeaf = l;
				// Unchain LeafChain
				unchain(lc, !fromPast);
			}
		} else if (rechainPrev) {
			// Need to rechain prevLeaf
			// Get current prevLeaf's nextLeaf
			let next = prevLeaf.nextLeaf;
			// If prevLeaf's nextLeaf is null, create NullLeaf for unchain()
			if (next === null) {
				next = new NullLeaf({ prevLeaf });
			}
			// Update prevLeaf's nextLeaf
			prevLeaf.nextLeaf = l;
			// Unchain replaced Leaf
			unchain(next, !fromPast);
		} else if (rechainNext) {
			// Need to rechain nextLeaf
			// Get current nextLeaf's prevLeaf
			let prev = nextLeaf.prevLeaf;
			// If nextLeaf's prevLeaf is null, create NullLeaf for unchain()
			if (prev === null) {
				prev = new NullLeaf({ nextLeaf });
			}
			// Update nextLeaf's prevLeaf
			nextLeaf.prevLeaf = l;
			// Unchain replaced Leaf
			unchain(prev, !fromPast);
		}
	} else if (l instanceof LeafText) {
		const { range, text } = l;

		const t1 = l.leaf.text.substring(0, range[0]);
		const t2 = l.leaf.text.substring(range[0], range[1]);
		const t3 = l.leaf.text.substring(range[1], l.leaf.text.length);
		// Re-apply text in LeafText.text
		l.leaf.text = `${t1}${text}${t3}`;
		// Create a new LeafText for history
		const lt = new LeafText({
			leaf: l.leaf,
			range: [range[0], range[0] + text.length],
			text: t2
		});
		// Unchain LeafText
		unchain(lt, !fromPast);
	}
}

/*
	consume:
		- Start from the current Leaf, remove its prevLeaf or nextLeaf,
		  concat removed Leaf's text before or after the current text respectivelly,
		- Consume zero-widths in text. If final Leaf is empty, make it zero-width.
		- Push the removed Leaf to history past stack, only if it's old.
		- Only new Leaf can consume other Leaves.
		- Only consume when two Leaves have the same styles, or at least one Leaf is zero-width.
		- consume() will mark a consumed dirty Leaf so that autoMergeLeaf won't be called on
		  Leaf.
		- consume() will not check if a Leaf has already been consumed or not. It's not its job.
	@ params
		leaf: Leaf object
		up: Boolean
	@ return
		continue: Boolean
			- true: successfully consumed
			- false: unable to consume
*/
export const _TRAVERSE_UP_ = true;
export const _TRAVERSE_DOWN_ = false;
export function consume(leaf: Leaf, up: boolean): boolean {
	if (leaf.new === false) {
		throw new Error('Only new Leaf can consume other Leaves.');
	}

	const l = leaf;

	if (up) {
		const { prevLeaf } = l;
		if (prevLeaf !== null) {
			// Check if consumable
			const consumable =
					sameLeafStyles(l, prevLeaf) ||
					isZeroLeaf(l) ||
					isZeroLeaf(prevLeaf);
			// Not consumable
			if (!consumable) return false;

			// Consumable
			if (isZeroLeaf(l)) {
				l.text = prevLeaf.text;
				// If current Leaf is zero-width, adopt consumed Leaf's styles
				copyLeafStyles(l, prevLeaf);
			} else if (!isZeroLeaf(prevLeaf)) {
				l.text = `${prevLeaf.text}${l.text}`;
			}
			// Get prevLeaf.prevLeaf
			const prevPrevLeaf = prevLeaf.prevLeaf;
			// Update current Leaf's prevLeaf to prevPrevLeaf
			l.prevLeaf = prevPrevLeaf;
			// If not null, update prevLeaf.prevLeaf.nextLeaf to current Leaf
			if (prevPrevLeaf !== null) {
				prevPrevLeaf.nextLeaf = l;
			}
			// If old, push prevLeaf to history past stack;
			if (prevLeaf.new === false) {
				unchain(prevLeaf, _PAST_STACK_);
			} else if (prevLeaf.consumed !== undefined) {
				// If not old, check if consumed attribute exists
				// It it does, mark consumed Leaf
				prevLeaf.consumed = true;
			}
			// Consumed successfully
			return true;
		}
		// prevLeaf is null, unable to consume, exit if block
	} else {
		const { nextLeaf } = l;
		if (nextLeaf !== null) {
			// Check if consumable
			const consumable =
					sameLeafStyles(l, nextLeaf) ||
					isZeroLeaf(l) ||
					isZeroLeaf(nextLeaf);
			// Not consumable
			if (!consumable) return false;

			// Consumable
			if (isZeroLeaf(l)) {
				l.text = nextLeaf.text;
				// If current Leaf is zero-width, adopt consumed Leaf's styles
				copyLeafStyles(l, nextLeaf);
			} else if (!isZeroLeaf(nextLeaf)) {
				l.text = `${l.text}${nextLeaf.text}`;
			}
			// Get nextLeaf.nextLeaf
			const nextNextLeaf = nextLeaf.nextLeaf;
			// Update current Leaf's nextLeaf to nextNextLeaf
			l.nextLeaf = nextNextLeaf;
			// If not null, update nextLeaf.nextLeaf.nextLeaf to current Leaf
			if (nextNextLeaf !== null) {
				nextNextLeaf.prevLeaf = l;
			}
			// If old, push nextLeaf to history past stack;
			if (nextLeaf.new === false) {
				unchain(nextLeaf, _PAST_STACK_);
			} else if (nextLeaf.consumed !== undefined) {
				// If not old, check if consumed attribute exists
				// It it does, mark consumed Leaf
				nextLeaf.consumed = true;
			}
			// Consumed successfully
			return true;
		}
		// nextLeaf is null, unable to consume, exit else block
	}
	return false;
}

/*
	DirtyNewLeaves
		- This array stores references to newly created Leaves that should be called autoMergeLeaf
		- Don't iterate through this. Just pop and call autoMergeLeaf.
			- Do NOT call autoMergeLeaf on Leaves that have already been merged.
*/
export const DirtyNewLeaves = [];

/*
	applyLeafStyle:
		- Create three new Leaf objects with the middle one adopting new styles.
			- New styles update old styles, not replace. (e.g. bold -> italic = bold & italic)
		- Discard new Leaves that are zero-width
		- Replace the old Leaf in the chain with the new one(s)
		- Unchain the old leaf - it means putting it into the history
			- Old Leaf is pushed into a temporary history step object
		- Push new Leaf(s) into a dirty stack
			- Every new Leaf in the dirty stack will be called autoMergeLeaf
			- Give each dirty Leaf a consumed attribute, so that autoMergeLeaf will
			  skip already consumed dirty Leaves.
		- If range width is 0, do nothing. (This is handled by applyCaretStyle)
		- Applying the same style does nothing.
		- applyLeafStyle() only works on old Leaves.
	@ params
		leaf: Leaf object (required)
		range: Array object - default: [0, 0]
		newStyles: Object - default: {}
			- bold: Boolean (optional)
			- italic: Boolean (optional)
			- underline: Boolean (optional)
*/
export function applyLeafStyle(
	leaf: Leaf,
	range: Array<number> = [0, 0],
	newStyles: Object = {}
): void {
	if (leaf.new === true) {
		throw new Error('applyLeafStyle() only works on old Leaves.');
	}

	const r = trimRange(leaf, range);
	// If range width is 0, do nothing. (This is handled by applyCaretStyle)
	if (r[0] === r[1]) return;

	const { text, styles, prevLeaf, nextLeaf } = leaf;
	const { ...oldStyles } = styles;
	const newLeafStyles = new LeafStyles({ ...oldStyles, ...newStyles });
	// If applying same styles, do nothing.
	if (styles.hash === newLeafStyles.hash) return;

	const t1 = text.substring(0, r[0]);
	const t2 = text.substring(r[0], r[1]);
	const t3 = text.substring(r[1], text.length);

	let l1 = new Leaf({
		text: t1,
		styles: new LeafStyles({ ...oldStyles }),
		prevLeaf
	});
	let l2 = new Leaf({
		text: t2,
		styles: newLeafStyles,
		prevLeaf: l1
	});
	let l3 = new Leaf({
		text: t3,
		styles: new LeafStyles({ ...oldStyles }),
		prevLeaf: l2,
		nextLeaf
	});

	// Re-chain
	l1.nextLeaf = l2;
	l2.nextLeaf = l3;
	if (prevLeaf) {
		prevLeaf.nextLeaf = l1;
	}
	if (nextLeaf) {
		nextLeaf.prevLeaf = l3;
	}

	// Discard zero-wdith new Leaves
	if (isZeroLeaf(l1)) {
		l1 = destroyLeaf(l1);
	}
	if (isZeroLeaf(l2)) {
		l2 = destroyLeaf(l2);
	}
	if (isZeroLeaf(l3)) {
		l3 = destroyLeaf(l3);
	}

	// Unchain(this) -> put this into history stack
	unchain(leaf, _PAST_STACK_);

	// Put newly created Leaves into dirty stack
	// Also, add a consumed attribute, which will be deleted after autoMergeLeaf
	if (l1 !== null) {
		l1.consumed = false;
		DirtyNewLeaves.push(l1);
	}
	if (l2 !== null) {
		l2.consumed = false;
		DirtyNewLeaves.push(l2);
	}
	if (l3 !== null) {
		l3.consumed = false;
		DirtyNewLeaves.push(l3);
	}
}

/*
	autoMergeLeaf:
		- Consume adjacent leaves (use consume()), by first traversing up.
		- If unable to consume, traverse down.
		- If still unable to consume, stop.
		- Current Leaf must be new, or it will throw error.
		- Only call autoMergeLeaf after applyStyle is finished on all leaves
		- autoMergeLeaf is called on all new Leaves in DirtyNewLeaves
			- autoMergeLeaf should skip new Leaves that have already been merged.
	@ params
		leaf: Leaf object
		up: Boolean
*/
export function autoMergeLeaf(leaf: Leaf, up: boolean): void {
	if (leaf.new === false) {
		throw new Error('autoMergeLeaf must be called on a new Leaf.');
	}

	if (up) {
		if (consume(leaf, true)) {
			autoMergeLeaf(leaf, true);
		} else {
			autoMergeLeaf(leaf, false);
		}
	} else if (consume(leaf, false)) {
		autoMergeLeaf(leaf, false);
	}
}

/*
	autoMergeDirtyLeaves:
		- An abstraction for iterating through DirtyNewLeaves and call autoMergeLeaf()
		  on each.
*/
export function autoMergeDirtyLeaves(): void {
	while (DirtyNewLeaves.length > 0) {
		const dirtyLeaf = DirtyNewLeaves.pop();
		if (!dirtyLeaf.consumed) {
			autoMergeLeaf(dirtyLeaf, _TRAVERSE_UP_);
		}
		delete dirtyLeaf.consumed;
	}
}

//= History operations

/*
	copyHistoryStep
	readyHistoryStep
	readyTempHistorySteps
	undo (Action)
	redo (Action)
	applyStyle (Action)
*/

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
	oldStep.detach();
	return newStep;
}

/*
	readyHistoryStep:
		- Copy & push a history step into history if not empty.
	@ params
		step: BlankHistoryStep Object
*/
export function readyHistoryStep(step: BlankHistoryStep): void {
	if (step.stack.length > 0) {
		History.push(copyHistoryStep(step));
	}
}

/*
	readyTempHistorySteps:
		- Ready TempHistoryPastStep & TempHistoryFutureStep.
		- Call this when there's a completely new Action.
	@ error
		throw if both TempHistoryPastStep and TempHistoryFutureStep are not empty
*/
export function readyTempHistorySteps(): void {
	if (TempHistoryPastStep.stack.length > 0 && TempHistoryFutureStep.stack.length > 0) {
		throw new Error('Both TempHistoryPastStep and TempHistoryFutureStep are not empty. Something is wrong!');
	}
	readyHistoryStep(TempHistoryPastStep);
	readyHistoryStep(TempHistoryFutureStep);
}

/*
	undo: (Action)
		- If past stack is empty, do nothing
		- Else pop
		- Iterate
		- Rechain
*/
export function undo(): void {
	if (History.stackPast.length === 0) return;
	const pastStep = History.pop(_FROM_PAST_);
	// Iterate through pastStep
	while (pastStep.stack.length > 0) {
		const leaf = pastStep.pop();
		rechain(leaf, _FROM_PAST_);
	}
}

/*
	redo: (Action)
		- If future stack is empty, do nothing
		- Else pop
		- Iterate
		- Rechain
*/
export function redo(): void {
	if (History.stackFuture.length === 0) return;
	const futureStep = History.pop(_FROM_FUTURE_);
	// Iterate through futureStep
	while (futureStep.stack.length > 0) {
		const leaf = futureStep.pop();
		rechain(leaf, _FROM_FUTURE_);
	}
}

/*
	applyStyle: (Action)
		- Apply new styles to a selection of Leaves.
		- Skip autoMergeLeaf() on dirty Leaves already consumed.
			- Delete consumed attribute on dirty Leaves after autoMergeLeaf().
	@ params
		selections: Array<Object>
			- leaf: leaf Object
			- range: Array<number>
		newStyles: Object (LeafStyles props)
*/
export function applyStyle(selections: Array<Object>, newStyles: Object): void {
	if (selections.length === 0) return;
	// Iterate through Leaves in selections, and call applyLeafStyle on each.
	for (const selection of selections) {
		applyLeafStyle(selection.leaf, selection.range, newStyles);
	}
	// autoMergeLeaf
	autoMergeDirtyLeaves();
}

//= Leaf applyText functions

/*
	mergeLeafTexts
	applyLeafText (Action)
	applyText (Action)
*/

/*
	mergeLeafTexts:
		- Merge leafText into targetLeafText if:
			- leafText and targetLeafText reference the same Leaf.
			- leafText's range begins right after targetLeafText's range.
		- Merge consecutive "Delete" operations.
		- Merge consecutive "Backspace" operations.
		- Return true if merged successfully, else false.
	@ params
		leafText: LeafText object
		targetLeafText: LeafText object
	@ return
		success: Boolean
*/
export function mergeLeafTexts(leafText: LeafText, targetLeafText: LeafText): boolean {
	if (leafText.leaf !== targetLeafText.leaf) return false;

	const lt = leafText;
	const tlt = targetLeafText;

	// Merge "Backspace"
	// Dude + Backspace at 4,4 = Dud -> lt1: [3,3], 'e'
	// Dud + Backspace at 3,3 = Du -> lt2: [2,2], 'd'
	// lt2 * lt1 = [2,2], 'de'
	// Undo
	// Du + lt2 * lt1 = Dude -> lt3`: [2,4], ''
	// Redo
	// Dude + lt3` = Du -> l4: [2,2], 'de'
	if (targetLeafText.range[0] === targetLeafText.range[1] && targetLeafText.text.length === 1 &&
		leafText.range[0] === leafText.range[1] && leafText.text.length === 1 &&
		targetLeafText.range[0] - 1 === leafText.range[0]) {
		/* eslint-disable */
		tlt.range[0] = lt.range[0];
		tlt.range[1] = lt.range[1];
		/* eslint-enable */
		tlt.text = `${lt.text}${tlt.text}`;
		return true;
	}

	// Merge "Delete"
	// Dude + Delete at 0,0 = ude -> lt1: [0,0], 'D'
	// ude + Delete at 0,0 = de -> lt2: [0,0], 'u'
	// lt2 * lt1 = [0,0], 'Du'
	//
	// Normal merge and "Delete" merge work the same.
	if (leafText.range[0] !== targetLeafText.range[1]) return false;
	/* eslint-disable */
	tlt.range[1] = lt.range[1];
	/* eslint-enable */
	tlt.text = `${tlt.text}${lt.text}`;

	return true;
}

/*
	applyLeafText: (Action)
		- Replace part of Leaf.text specified in range with the new text, even if
		  the resulting text is the same as the old one.
		- Create a new LeafText object to be pushed into history stack
		- If range covers the entire Leaf and the new text is empty, manually unchain and replace it
		  with a new zero-width Leaf.
		- If two adjacent LeafTexts in History Step can be merged, merge them.
			- There's no need to merge in rechain().
		- applyLeafText() only works on old Leaves.
		- Applying empty string '' to a zero-width range, such as [0,0], does nothing.
		- If leaf is zero-width and new text is not empty, make range cover the whole leaf.
		- Don't worry about zero-width characters in new text.
	@ params
		leaf: Leaf object
		range: Array<number> - default: [0, 0]
		text: String
		options: null or String or Object - default: null
*/
export function applyLeafText(
	leaf: Leaf,
	range: Array<number> = [0, 0],
	text: string
): void {
	if (leaf.new === true) {
		throw new Error('applyLeafText() only works on old Leaves.');
	}

	const r = trimRange(leaf, range);
	const l = leaf;

	// If leaf is zero-width and new text is empty, do nothing.
	// Else, force range to cover the whole leaf.
	// Deleting a lone and zero-width Leaf is handled by BlankNode (TODO)
	if (isZeroLeaf(l)) {
		if (text === '') return;
		r[0] = 0;
		r[1] = l.text.length;
	}

	// For "Backspace" at [5,5] for example, the range is changed to [4,5]
	// For "Delete" at [0,0] for example, the range is changed to [0,1]
	// Range change is not handled here.

	// Applying empty string '' to a zero-width range, such as [0,0], do nothing.
	if (text === '' && r[0] === r[1]) return;

	// If range covers the whole Leaf and new text is empty, unchain and replace it
	// with a new zero-width Leaf, then auto merge.
	if (r[1] - r[0] === l.text.length && text === '') {
		// If current Leaf is the only Leaf, BlankBlock is needed for the chaining to work (TODO)
		// Right now, don't worry about it.
		const zl = new Leaf();
		zl.prevLeaf = l.prevLeaf;
		zl.nextLeaf = l.nextLeaf;

		if (l.prevLeaf !== null) {
			l.prevLeaf.nextLeaf = zl;
		}
		if (l.nextLeaf !== null) {
			l.nextLeaf.prevLeaf = zl;
		}

		unchain(leaf, _PAST_STACK_);

		zl.consumed = false;
		DirtyNewLeaves.push(zl);
		autoMergeDirtyLeaves();
		return;
	}

	const t1 = l.text.substring(0, r[0]);
	const t2 = l.text.substring(r[0], r[1]);
	const t3 = l.text.substring(r[1], l.text.length);

	l.text = `${t1}${text}${t3}`;

	const lt = new LeafText({
		leaf,
		range: [r[0], r[0] + text.length],
		text: t2
	});

	// Check if LeafText can be merged with the latest unchained element
	const len = TempHistoryPastStep.stack.length;
	let merged = false;
	if (len > 0) {
		const e = TempHistoryPastStep.stack[len - 1];
		if (e instanceof LeafText) {
			merged = mergeLeafTexts(lt, e);
		}
	}

	if (!merged) unchain(lt, _PAST_STACK_);
}

/*
	NOTE: BlankBlock is not implemented yet.

	NOTE 2: Need to handle newline character in string as replacement (TODO)

	applyText: (Action)
		- Replace the entire selections with either pure text or a LeafChain
		- There are four scenarios:
			1. selections only contain 1 element and replacement is string.
				- Simply change the text, and create LeafText for history
			2. selections have more than 1 element or replacement is a LeafChain, or both.
				- Unchain everything.
				- Turn first Leaf into a new "fist Leaf".
				- Turn last Leaf into a new "last Leaf".
					- First and last Leaves can be the same Leaf.
				- If replacement is a string, concat it after the new "first Leaf".
					- This means replacement is unstyled text, for example, copied & pasted from
					  Notepad or any unrecognized external source.
					- Copy & paste from BlankEditor should always use LeafChain.
						- Or don't. It depends on user experience.
				- If replacement is a LeafChain, manually chain it between first and last Leaf.
					- Assume LeafChain has been autoMergeLeaf().
				- Auto merge all dirty Leaves.
		- Note: new Leaves except for the first Leaf should not have parent.
	@ params
		selections: Array<Object>
			- leaf: Leaf object
			- range: Array<number>
		replacement: string | LeafChain
*/

export function applyText(selections: Array<Object>, replacement: string | LeafChain): void {
	if (selections.length === 0) return;

	const r = replacement;

	if (selections.length === 1 && (typeof r) === 'string') {
		const { leaf, range } = selections[0];
		applyLeafText(leaf, range, r);
	} else {
		const firstSelection = selections[0];
		const lastSelection = selections[selections.length - 1];

		const { leaf: firstLeaf, range: firstRange } = firstSelection;
		const { ...firstLeafStylesProps } = firstLeaf.styles;
		const { leaf: lastLeaf, range: lastRange } = lastSelection;
		const { ...lastLeafStylesProps } = lastLeaf.styles;

		// Create new first Leaf (omit nextLeaf for now)
		const l1 = new Leaf({
			text: firstLeaf.text.substring(0, firstRange[0]),
			styles: new LeafStyles({ ...firstLeafStylesProps }),
			prevLeaf: firstLeaf.prevLeaf
		});
		if (firstLeaf.prevLeaf !== null) {
			firstLeaf.prevLeaf.nextLeaf = l1;
		}
		// Create new last Leaf (omit prevLeaf for now)
		const l3 = new Leaf({
			text: lastLeaf.text.substring(lastRange[1], lastLeaf.text.length),
			styles: new LeafStyles({ ...lastLeafStylesProps }),
			nextLeaf: lastLeaf.nextLeaf
		});
		if (lastLeaf.nextLeaf !== null) {
			lastLeaf.nextLeaf.prevLeaf = l3;
		}

		// If replacement is a string, concat it after l1.text
		if ((typeof r) === 'string') {
			l1.text = `${l1.text}${r}`;
			// Chain l1 and l3 together
			l1.nextLeaf = l3;
			l3.prevLeaf = l1;
		} else {
			// Manually chain LeafChain between l1 and l3
			// Do not use ChainBetween or ChainBetweenDangerous, because l1 and l3
			// are not chained.
			l1.nextLeaf = r.startLeaf;
			r.startLeaf.prevLeaf = l1;
			r.endLeaf.nextLeaf = l3;
			l3.prevLeaf = r.endLeaf;
		}

		// Unchain everything in selections
		for (const selection of selections) {
			unchain(selection.leaf, _PAST_STACK_);
		}

		// Push new Leaves to dirty stack
		// Assume LeafChain is not dirty
		l1.consumed = false;
		DirtyNewLeaves.push(l1);
		l3.consumed = false;
		DirtyNewLeaves.push(l3);

		// autoMergeLeaf
		autoMergeDirtyLeaves();
	}
}
