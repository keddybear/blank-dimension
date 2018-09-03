import React from 'react';

function isReactElement(suspectedElement) {
	let isElem = false;
	if (React.isValidElement(suspectedElement)) {
		isElem = true;
	} else if (Array.isArray(suspectedElement)) {
		for (let i = 0, l = suspectedElement.length; i < l; i += 1) {
			if (React.isValidElement(suspectedElement[i])) {
				isElem = true;
				break;
			}
		}
	}
	return isElem;
}

export function shallowEqual(thisProps, nextProps, ignored = []) {
	let equals = false;
	if (thisProps === nextProps) {
		equals = true;
	} else if (typeof thisProps === 'object' && typeof nextProps === 'object') {
		equals = true;
		const propNames = new Set(Object.keys(thisProps), Object.keys(nextProps));
		for (const propName of propNames) {
			if (!ignored.includes(propName)) {
				if (thisProps[propName] !== nextProps[propName] && !isReactElement(thisProps[propName])) {
					// No need to check nextProps[propName] as well, as we know they are not equal
					equals = false;
					break;
				}
			}
		}
	}
	return equals;
}
