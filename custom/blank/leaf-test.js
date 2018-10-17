const styleIndex = {
	bold: 0,
	italic: 1,
	underline: 2
};

const readStyle = styleString => styleString.split(' ');
const formStyle = styleArray => styleArray.join(' ');

/*
	{
		styles: '1 0 0', // bold: true, italic: false, underline: false
		text: 'This is a bold test.',
		preSib: <Object>,
		nextSib: <Object>
	}
*/

const applyStyle = (current, range, style) => {
	// refs to current and range are copied
	// do not modify them!
	if (range[0] >= range[1]) return null;

	const before = current.text.substring(0, range[0]);
	const middle = current.text.substring(range[0], range[1]);
	const after = current.text.substring(range[1]);

	const beforeObj = Object.assign(
		{ text: before },
		{ styles: current.styles, preSib: current.preSib }
	);
	const middleObj = { styles: style, text: middle, preSib: beforeObj };
	const afterObj = Object.assign(
		{ text: after },
		{ styles: current.styles, preSib: middleObj, afterObj: current.nextSib }
	);

	beforeObj.nextSib = middleObj;
	middleObj.nextSib = afterObj;

	return [beforeObj, middleObj, afterObj];
};

const inlineMerge = obj => {

};
