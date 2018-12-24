/* Setup file for ui-test */

/* eslint-disable */
import { JSDOM } from 'jsdom';
import { isBitSet } from '../utils';

function copyProps(src, target) {
	Object.defineProperties(target, {
		...Object.getOwnPropertyDescriptors(src),
		...Object.getOwnPropertyDescriptors(target),
	});
}

export const loadHTML = function(path) {
	return JSDOM.fromFile(path).then(dom => {
		const { window } = dom;

		global.window = window;
		global.document = window.document;
		global.navigator = { userAgent: 'node.js' };
		global.requestAnimationFrame = callback => setTimeout(callback, 0);
		global.cancelAnimationFrame = id => clearTimeout(id);
		// Make everything in window global
		copyProps(window, global);

		// Mock window selection
		const WindowSelection = {
			anchorNode: null,
			focusNode: null,
			anchorOffset: 0,
			focusOffset: 0
		}
		global.window.getSelection = () => {
			const sel = {};
			const { anchorNode, focusNode, anchorOffset, focusOffset } = WindowSelection;
			// Collapsed
			let isCollapsed = true;
			if (anchorNode !== focusNode || anchorOffset !== focusOffset) isCollapsed = false;
			// Range count (0 or 1)
			let rangeCount = 0;
			if (anchorNode !== null && focusNode !== null) rangeCount = 1;
			// Type
			let typeString = 'None';
			if (rangeCount) {
				if (isCollapsed) {
					typeString = 'Caret';
				} else {
					typeString = 'Range';
				}
			}
			// Assign properties
			Object.defineProperties(sel, {
				anchorNode: {
					value: anchorNode,
					writable: false
				},
				anchorOffset: {
					value: anchorOffset,
					writable: false
				},
				focusNode: {
					value: focusNode,
					writable: false
				},
				focusOffset: {
					value: focusOffset,
					writable: false
				},
				isCollapsed: {
					value: isCollapsed,
					writable: false
				},
				rangeCount: {
					value: rangeCount,
					writable: false
				},
				type: {
					value: typeString,
					writable: false
				},
				addRange: {
					value: (range) => {
						if (!range) return;
						if (range.anchorNode) WindowSelection.anchorNode = range.anchorNode;
						if (range.focusNode) WindowSelection.focusNode = range.focusNode;
						if (range.anchorOffset || range.anchorOffset === 0) {
							WindowSelection.anchorOffset = range.anchorOffset;
						}
						if (range.focusOffset || range.focusOffset === 0) {
							WindowSelection.focusOffset = range.focusOffset;
						}
					} ,
					writable: false
				},
				empty: {
					value: () => {
						WindowSelection.anchorNode = null;
						WindowSelection.focusNode = null;
						WindowSelection.anchorOffset = 0;
						WindowSelection.focusOffset = 0;
					},
					writable: false
				},
				removeAllRanges: {
					value: function() {
						this.empty();
					},
					writable: false
				}
			});
			return sel;
		};
		global.document.createRange = () => {
			const range = {};
			Object.defineProperties(range, {
				anchorNode: {
					value: null,
					writable: true
				},
				anchorOffset: {
					value: 0,
					writable: true
				},
				focusNode: {
					value: null,
					writable: true
				},
				focusOffset: {
					value: 0,
					writable: true
				},
				setStart: {
					value: function(startNode, startOffset) {
						this.anchorNode = startNode;
						this.anchorOffset = startOffset;
						// // Collapse to startNode if after endNode
						// if (this.anchorNode !== null &&
						// 	this.focusNode !== null &&
						// 	this.anchorNode.compareDocumentPosition) {
						// 	const pos = this.anchorNode.compareDocumentPosition(this.focusNode);
						// 	if ((pos === 0 && this.anchorOffset > this.focusOffset) ||
						// 		isBitSet(pos, Node.DOCUMENT_POSITION_PRECEDING)) {
						// 		this.focusNode = this.anchorNode;
						// 		this.focusOffset = this.anchorOffset;
						// 	}
						// }
					},
					writable: false
				},
				setEnd: {
					value: function(endNode, endOffset) {
						this.focusNode = endNode;
						this.focusOffset = endOffset;
						// // Collapse to endNode if before startNode
						// if (this.anchorNode !== null &&
						// 	this.focusNode !== null &&
						// 	this.anchorNode.compareDocumentPosition) {
						// 	const pos = this.anchorNode.compareDocumentPosition(this.focusNode);
						// 	if ((pos === 0 && this.anchorOffset > this.focusOffset) ||
						// 		isBitSet(pos, Node.DOCUMENT_POSITION_PRECEDING)) {
						// 		this.anchorNode = this.focusNode;
						// 		this.anchorOffset = this.focusOffset;
						// 	}
						// }
					},
					writable: false
				}
			});
			return range;
		};
		// Quick select
		global.window.quickSelect = (anchorNode, focusNode, anchorOffset, focusOffset) => {
			const range = global.document.createRange();
			range.setStart(anchorNode, anchorOffset);
			range.setEnd(focusNode, focusOffset);

			const sel = global.window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	});
};

// Spy
export class SpyMaster {
	constructor() {
		this.SpyCounter = new WeakMap();
		this.SpyStorage = new WeakMap();
	}

	spy(obj, fname) {
		if (typeof obj !== 'object') return;
		if (obj === null) return;
		if (obj[fname] === undefined) return;
		if (typeof obj[fname] !== 'function') return;

		const originalFn = obj[fname];
		const counter = this.SpyCounter.get(obj) || {};
		const storage = this.SpyStorage.get(obj) || {};

		// Prepare counter for function fname
		if (counter[fname] !== undefined) return; // Already spying
		this.SpyCounter.set(obj, { ...counter, [fname]: 0 });

		// Store original function for obj
		this.SpyStorage.set(obj, {...storage, [fname]: originalFn });

		// Wrap originalFn with a counter
		const sc = this.SpyCounter;
		obj[fname] = function() {
			const c = sc.get(obj);
			c[fname] += 1;
			return originalFn.apply(obj, arguments);
		};
	}

	unspy(obj, fname) {
		if (typeof obj !== 'object') return;
		if (obj === null) return;
		if (obj[fname] === undefined) return;
		if (typeof obj[fname] !== 'function') return;

		const counter = this.SpyCounter.get(obj);
		const storage = this.SpyStorage.get(obj);
		if (!counter || !storage) return;

		// Remove counter for fname
		if (counter[fname] !== undefined) {
			if (Object.keys(counter).length === 1) {
				this.SpyCounter.delete(obj);
			} else {
				delete counter[fname];
			}
		}

		// Restore fname original function from storage
		if (storage[fname] !== undefined) {
			const originalFn = storage[fname];
			if (Object.keys(storage).length === 1) {
				this.SpyStorage.delete(obj);
			} {
				delete storage[fname];
			}
			obj[fname] = originalFn;
		}
	}
	
	// Get call count
	get(obj, fname) {
		if (typeof obj !== 'object') return null;
		if (obj === null) return null;
		if (obj[fname] === undefined) return null;
		if (typeof obj[fname] !== 'function') return null;

		const counter = this.SpyCounter.get(obj);
		if (counter && counter[fname] !== undefined) {
			return counter[fname];
		}

		return null;
	}

	// Reset call count
	reset(obj, fname) {
		if (typeof obj !== 'object') return null;
		if (obj === null) return null;
		if (obj[fname] === undefined) return null;
		if (typeof obj[fname] !== 'function') return null;

		const counter = this.SpyCounter.get(obj);
		if (counter && counter[fname] !== undefined) {
			counter[fname] = 0;
		}
	}
}
