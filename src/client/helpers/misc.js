// Assign a node's ref to its component
const assign = (obj, key) => (node) => {
	const copy = obj;
	copy[key] = node;
};

export {
	assign
};
