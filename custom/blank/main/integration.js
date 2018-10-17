import { Leaf, LeafStyles, NullLeaf, LeafChain } from './leaf';
import { History, BlankHistoryStep } from './history';

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
	rechain
	consume
	applyLeafStyle
	autoMergeLeaf
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
export function unchain(leaf: Leaf | NullLeaf | LeafChain, past: boolean): void {
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
		- NOTE: the two ends of LeafChain can be null. It needs to be handled by Inline (TODO)
	@ params
		leaf: Leaf object
		fromPast: Boolean
*/
export const _FROM_PAST_ = true;
export const _FROM_FUTURE_ = false;
export function rechain(leaf: Leaf | NullLeaf | LeafChain, fromPast: boolean): void {
	const l = leaf;
	const { prevLeaf, nextLeaf } = l;

	if (l instanceof LeafChain) {
		const { startLeaf, endLeaf } = l;

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
		- Don't iterate through this. Just pop and call autoMergeLeaf. (TODO)
*/
export const DirtyNewLeaves = [];

/*
	applyLeafStyle:
		- Create three new Leaf objects with the middle one adopting new styles.
			- New styles update old styles, not replace.
		- Discard new Leaves that are zero-width
		- Replace the old Leaf in the chain with the new one(s)
		- Unchain the old leaf - it means putting it into the history
			- Old Leaf is pushed into a temporary history step object
		- Push new Leaf(s) into a dirty stack
			- Every new Leaf in the dirty stack will be called autoMergeLeaf
		- If range width is 0, do nothing. (This is handled by applyCaretStyle)
		- Applying the same style does nothing.
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
		styles,
		prevLeaf
	});
	let l2 = new Leaf({
		text: t2,
		styles: newLeafStyles,
		prevLeaf: l1
	});
	let l3 = new Leaf({
		text: t3,
		styles,
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
	if (l1 !== null) {
		DirtyNewLeaves.push(l1);
	}
	if (l2 !== null) {
		DirtyNewLeaves.push(l2);
	}
	if (l3 !== null) {
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

//= History operations

/*
	copyHistoryStep
	undo
	redo
	...
	...
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
	Undo:
		- If past stack is empty, do nothing
		- Else pop
		- Iterate
		- Rechain
		- Copy TempHistoryFutureStep and push it to History
		- Re-render (TODO)
*/
export function undo(): void {
	if (History.stackPast.length === 0) return;

	// Clear TempHistoryFutureStep
	TempHistoryFutureStep.clear();
	const pastStep = History.pop(_FROM_PAST_);

	// Iterate through pastStep
	while (pastStep.stack.length > 0) {
		const leaf = pastStep.pop();
		rechain(leaf, _FROM_PAST_);
	}

	// Copy TempHistoryFutureStep and push it to History
	const futureStep = copyHistoryStep(TempHistoryFutureStep);
	History.push(futureStep);
}

/*
	Redo:
		- If future stack is empty, do nothing
		- Else pop
		- Iterate
		- Rechain
		- Copy TempHistoryPastStep and push it to History
		- Re-render (TODO)
*/
export function redo(): void {
	if (History.stackFuture.length === 0) return;

	// Clear TempHistoryPastStep
	TempHistoryPastStep.clear();
	const futureStep = History.pop(_FROM_FUTURE_);

	// Iterate through futureStep
	while (futureStep.stack.length > 0) {
		const leaf = futureStep.pop();
		rechain(leaf, _FROM_FUTURE_);
	}

	// Copy TempHistoryPastStep and push it to History
	const pastStep = copyHistoryStep(TempHistoryPastStep);
	History.push(pastStep);
}
