/* eslint-disable */
const timer = function(name) {
	const start = new Date();
	return {
		stop: function() {
			const end  = new Date();
			const time = end.getTime() - start.getTime();
			console.log('Timer:', name, 'finished in', time, 'ms');
		}
	}
};

class NN {
	constructor(props = {}) {
		this.nextNode = props.nextNode || null;
		this.prevNode = props.prevNode || null;
		this.parent = props.parent || null;
		this.firstChild = props.firstChild || null;
	}
}

function getNextEndNode(n) {
	let p = n.parent;
	if (p === null) return null;
	while (p.nextNode === null) {
		p = p.parent;
		if (p === null) return null;
	}
    if (p.nextNode === null) return null;
	p = p.nextNode;
	let c = p.firstChild;
	while (c && c.firstChild) {
		c = c.firstChild;
	}
	return c;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function autoGenerate(root, total) {
	let currentNode = root;
	for (let i = 0; i < total; i += 1) {
		const direction = getRandomInt(3);
		switch (direction) {
			case 0: // down
				if (!currentNode.firstChild) {
					const child = new NN();
					currentNode.firstChild = child;
					child.parent = currentNode;
				}
				const n1 = new NN();
				currentNode.nextNode = n1;
				n1.prevNode = currentNode;
				currentNode = n1;
				break;
			case 1: // left
				const n2 = new NN();
				if (currentNode.parent) {
					currentNode = currentNode.parent;
				}
				if (!currentNode.firstChild) {
					const child = new NN();
					currentNode.firstChild = child;
					child.parent = currentNode;
				}
				currentNode.nextNode = n2;
				n2.prevNode = currentNode;
				currentNode = n2;
				break;
			case 2: // right
				const n3 = new NN();
				currentNode.firstChild = n3;
				n3.parent = currentNode;
				currentNode = n3;
				break;
			default:
				break;
		}
	}
}

function countTotalEndNodes(first) {
	let counter = 0;
	let currentNode = first;
	while (currentNode !== null) {
		counter += 1;
		currentNode = getNextEndNode(currentNode);
	}
	return counter;
}

const root1 = new NN();
const end1 = new NN();

root1.firstChild = end1 ;
end1 .parent = root1;

autoGenerate(root1, 1000000);

var t = timer('countTotalEndNodes');
console.log(countTotalEndNodes(end1));
t.stop();
