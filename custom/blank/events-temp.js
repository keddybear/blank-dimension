/* eslint-disable */
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
