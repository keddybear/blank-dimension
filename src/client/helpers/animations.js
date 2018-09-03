const smoothEnter = (el) => {
	TweenMax.fromTo(el, 0.5, { opacity: 0 }, { opacity: 1 });
};

const slideIn = (el) => {
	TweenMax.fromTo(el, 0.5, {
		x: -100,
		opacity: 0
	}, {
		x: 0,
		opacity: 1,
		ease: Back.easeOut.config(1.4)
	});
};

export {
	smoothEnter,
	slideIn
};
