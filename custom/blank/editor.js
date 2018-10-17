import React, { Component } from 'react';
import Block from './block';

import BlankObserver from './observer';

import './styles.scss';

const disabled = (e) => {
	e.preventDefault();
	e.stopPropagation();
};

const disabledEvents = {
	// Clipboard Events
	onCopy: disabled,
	onCut: disabled,
	onPaste: disabled,

	// Composition Events
	// onCompositionEnd: disabled,
	// onCompositionStart: disabled,
	// onCompositionUpdate: disabled,

	// Keyboard Events
	onKeyDown: disabled,
	onKeyPress: disabled,
	onKeyUp: disabled,

	// Focus Events
	// onFocus: disabled,
	// onBlur: disabled,

	// Form Events
	// onChange: disabled,
	// onInput: disabled,
	// onInvalid: disabled,
	// onSubmit: disabled,

	// Mouse Events
	onClick: this.handleClick,
	// onContextMenu: disabled,
	// onDoubleClick: disabled,
	// onDrag: disabled,
	// onDragEnd: disabled,
	// onDragEnter: disabled,
	// onDragExit: disabled,
	// onDragLeave: disabled,
	// onDragOver: disabled,
	// onDragStart: disabled,
	// onDrop: disabled,
	// onMouseDown: disabled,
	// onMouseEnter: disabled,
	// onMouseLeave: disabled,
	// onMouseMove: disabled,
	// onMouseOut: disabled,
	// onMouseOver: disabled,
	// onMouseUp: disabled,

	// Pointer Events
	// onPointerDown: disabled,
	// onPointerMove: disabled,
	// onPointerUp: disabled,
	// onPointerCancel: disabled,
	// onGotPointerCapture: disabled,
	// onLostPointerCapture: disabled,
	// onPointerEnter: disabled,
	// onPointerLeave: disabled,
	// onPointerOver: disabled,
	// onPointerOut: disabled,

	// Selection Events
	onSelect: disabled

	// Touch Events
	// onTouchCancel: disabled,
	// onTouchEnd: disabled,
	// onTouchMove: disabled,
	// onTouchStart: disabled,

	// UI Events
	// onScroll: disabled,

	// Wheel Events
	// onWheel: disabled,

	// Media Events
	// onAbort: disabled,
	// onCanPlay: disabled,
	// onCanPlayThrough: disabled,
	// onDurationChange: disabled,
	// onEmptied: disabled,
	// onEncrypted: disabled,
	// onEnded: disabled,
	// onError: disabled,
	// onLoadedData: disabled,
	// onLoadedMetadata: disabled,
	// onLoadStart: disabled,
	// onPause: disabled,
	// onPlay: disabled,
	// onPlaying: disabled,
	// onProgress: disabled,
	// onRateChange: disabled,
	// onSeeked: disabled,
	// onSeeking: disabled,
	// onStalled: disabled,
	// onSuspend: disabled,
	// onTimeUpdate: disabled,
	// onVolumeChange: disabled,
	// onWaiting: disabled,

	// Image Events
	// onLoad: disabled,
	// onError: disabled,

	// Animation Events
	// onAnimationStart: disabled,
	// onAnimationEnd: disabled,
	// onAnimationIteration: disabled,

	// Transition Events
	// onTransitionEnd: disabled,

	// Other Events
	// onToggle: disabled
};

const nodes = [{
	type: 'div',
	nodes: [{
		styles: [true, false, false],
		text: 'Hi!'
	}, {
		styles: [false, false, false],
		text: ' This is a test.'
	}]
}, {
	type: 'div',
	nodes: [{
		styles: [false, false, false],
		text: 'Second paragraph'
	}]
}, {
	type: 'ul',
	nodes: [{
		nodes: [{
			styles: [false, false, true],
			text: 'First list item'
		}, {
			styles: [false, true, true],
			text: ' in the list.'
		}]
	}]
}];

class BlankEditor extends Component {
	constructor(props) {
		super(props);

		this.counter = 0;
		this.document = {
			nodes: []
		};

		this.document.nodes = nodes;

		this.parentConnect = (newNode) => {
			this.document.nodes.push(newNode);
		};

		this.handleClick = (e) => {
			e.preventDefault();
			e.stopPropagation();
			// console.log('onClick.target', e.target);
			// console.log('onClick.data.offsetKey', e.target.dataset.offsetKey);
		};

		this.handleSelection = (e) => {
			e.preventDefault();
			e.stopPropagation();
			// const selection = document.getSelection();
			// console.log('Selection', selection);
			console.log('selectionchange');
		};
	}

	componentDidMount() {
		document.addEventListener('selectionchange', this.handleSelection);
	}

	componentDidUpdate() {
		// console.log('Node.updated');
	}

	componentWillUnmount() {
		document.removeEventListener('selectionchange', this.handleSelection);
	}

	render() {
		const attributes = {
			contentEditable: 'true',
			suppressContentEditableWarning: 'true',
			autoCorrect: 'on',
			spellCheck: 'true',
			role: 'textbox',
			'data-gramm': 'false'
		};

		const passProps = {
			parentConnect: this.parentConnect,
			observer: this.observer
		};

		const blocks = this.document.nodes.map((node) => {
			this.counter += 1;
			return <Block key={this.counter} {...passProps} {...node} offset={this.counter} />;
		});

		return (
			<div className='blank-editor' {...attributes} {...disabledEvents}>
				{blocks}
			</div>
		);
	}
}

export default BlankEditor;

/*
	Block-style
		- Independent, no auto merge

	Inline-style
		- Auto merge if same styles


	User event -> Get selection -> Apply user action

	*example*
	At the selection, are you modifying text or are you applying styles?

	Modifying text:
	Todo

	Applying styles:
		- Applying block-style
			- Re-render block
				- Get block id, setState
		- Applying inline-style
			- Re-render leaf
				- Get leaf id, setState

	<div data-block-key='1'>
		<span data-inline-key='1-1'>
			<span data-leaf-key='1-1-1'>Hello world!</span>
			<span data-leaf-key='1-1-2'>
				<strong data-leaf='true'> This is a bold test.</strong>
			</span>
		</span>
	</div>

	[{
		type: 'div',
		nodes: [{
			styles: [false, false, false],
			text: 'Hello world!'
		}, {
			styles: [true, false, false],
			text: ' This is a bold test.'
		}]
	}]

	' This' -> -bold

	styles: [true, false, false],
	text: '' (no zero-width)

	styles: [false, false, false],
	text: ' This'

	styles: [true, false, false],
	text: ' is a bold test.'

	=>

	[{
		type: 'div',
		nodes: [{
			styles: [false, false, false],
			text: 'Hello world!'
			preSib: ...,
			nextSib: ...
		}, {
			styles: [true, false, false],
			text: '' (no zero-width)
			dirty: true,
			preSib: ...,
			nextSib: ...
		}, {
			styles: [false, false, false],
			text: ' This'
			dirty: true,
			preSib: ...,
			nextSib: ...
		}, {
			styles: [true, false, false],
			text: ' is a bold test.',
			dirty: true,
			preSib: ...,
			nextSib: ...
		}]
	}]

*/
