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
					value: null,
					writable: true
				},
				focusNode: {
					value: 0,
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
						// Collapse to startNode if after endNode
						if (this.focusNode !== null && this.anchorNode.compareDocumentPosition) {
							const pos = this.anchorNode.compareDocumentPosition(this.focusNode);
							if ((pos === 0 && this.anchorOffset > this.focusOffset) ||
								isBitSet(pos, Node.DOCUMENT_POSITION_PRECEDING)) {
								this.focusNode = this.anchorNode;
								this.focusOffset = this.anchorOffset;
							}
						}
					},
					writable: false
				},
				setEnd: {
					value: function(endNode, endOffset) {
						this.focusNode = endNode;
						this.focusOffset = endOffset;
						// Collapse to endNode if before startNode
						if (this.anchorNode !== null && this.anchorNode.compareDocumentPosition) {
							const pos = this.anchorNode.compareDocumentPosition(this.focusNode);
							if ((pos === 0 && this.anchorOffset > this.focusOffset) ||
								isBitSet(pos, Node.DOCUMENT_POSITION_PRECEDING)) {
								this.anchorNode = this.focusNode;
								this.anchorOffset = this.focusOffset;
							}
						}
					},
					writable: false
				}
			});
			return range;
		};
		// Quick select
		global.window.quickSelect = (anchorNode, anchorOffset, focusNode, focusOffset) => {
			const range = global.window.createRange();
			range.setStart(anchor, anchorOffset);
			range.setEnd(focus, focusOffset);

			const sel = global.window.getSelection();
			sel.removeAllRanges();
			sel.addRange(range);
		}
	});
};
