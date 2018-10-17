//= Chain test

class Node {
	constructor(id) {
		this.prevNode = null;
		this.nextNode = null;
		this.id = id;
	}

	chainAfter(n) {
		const copy = n;
		this.nextNode = copy;
		copy.prevNode = this;
	}

	chainBefore(n) {
		const copy = n;
		this.prevNode = copy;
		copy.nextNode = this;
	}
}

class NullNode {
	constructor(props) {
		this.prevNode = props.prevNode || null;
		this.nextNode = props.nextNode || null;
	}
}

const stackPast = [];
const stackFuture = [];

function printChain(node, up) {
	if (up) {
		if (node.prevNode !== null) {
			printChain(node.prevNode, true);
		} else {
			printChain(node, false);
		}
	} else {
		console.log(`@-[${node.id}]`);
		if (node.nextNode !== null) {
			console.log('|');
			printChain(node.nextNode, false);
		}
	}
}

/*
	Unchain:
		- Push the node into stackBackward or stackForward
*/
const PAST = true;
const FUTURE = false;
function unchain(node, past) {
	if (past) {
		stackPast.push(node);
	} else {
		stackFuture.push(node);
	}
}

/*
	Chain:
		- change current node1's prevNode if after is true, or nextNode if false, to node2
		- change node2 prevNode or nextNode accordingly
		- You can assume node1 is NOT replacing its own prevNode or nextNode.
*/
const AFTER = true;
const BEFORE = false;
function chain(node1, node2, after) {
	const n1 = node1;
	const n2 = node2;

	if (after) {
		if (n2.nextNode === n1) return;
		let next2 = n2.nextNode;
		n2.nextNode = n1;
		n1.prevNode = n2;
		if (next2 === null) {
			next2 = new NullNode({ prevNode: n2 });
		}
		unchain(next2, PAST);
	} else {
		if (n2.prevNode === n1) return;
		let prev2 = n2.prevNode;
		n2.prevNode = n1;
		n1.nextNode = n2;
		if (prev2 === null) {
			prev2 = new NullNode({ nextNode: n2 });
		}
		unchain(prev2, PAST);
	}
}

/*
	Rechain:
		- Put node from past or future back into chain
*/
const FROMPAST = true;
const FROMFUTURE = false;
function rechain(node, fromPast) {
	const n = node;
	const { prevNode, nextNode } = n;

	if (n instanceof NullNode) {
		if (prevNode !== null) {
			if (prevNode.nextNode !== null) {
				const next2 = prevNode.nextNode;
				prevNode.nextNode = null;
				unchain(next2, !fromPast);
			}
		} else if (nextNode !== null) {
			if (nextNode.prevNode !== null) {
				const prev2 = nextNode.prevNode;
				nextNode.prevNode = null;
				unchain(prev2, !fromPast);
			}
		}
	} else if (n instanceof Node) {
		if (prevNode !== null) {
			let next2 = prevNode.nextNode;
			if (next2 === n) return;
			prevNode.nextNode = n;
			if (next2 === null) {
				next2 = new NullNode({ prevNode });
			}
			unchain(next2, !fromPast);
		}
		if (nextNode !== null) {
			let prev2 = nextNode.prevNode;
			if (prev2 === n) return;
			nextNode.prevNode = n;
			if (prev2 === null) {
				prev2 = new NullNode({ nextNode });
			}
			unchain(prev2, !fromPast);
		}
	}
}

/*
	Consume:
		- Remove the node up the chain or down the chain
*/
const UP = true;
const DOWN = false;
function consume(node, up) {
	const n = node;

	if (up) {
		const { prevNode } = n;
		if (prevNode !== null) {
			const prevPrevNode = prevNode.prevNode;
			n.prevNode = prevPrevNode;
			if (prevPrevNode !== null) {
				prevPrevNode.nextNode = n;
			}
			unchain(prevNode, PAST);
		}
	} else {
		const { nextNode } = n;
		if (nextNode !== null) {
			const nextNextNode = nextNode.nextNode;
			n.nextNode = nextNextNode;
			if (nextNextNode !== null) {
				nextNextNode.prevNode = n;
			}
			unchain(nextNode, PAST);
		}
	}
}

// test
const l1 = new Node(1);
const l2 = new Node(2);
const l3 = new Node(3);
const l4 = new Node(4);
const l5 = new Node(5);

l1.chainAfter(l2);
l2.chainAfter(l3);

console.log('Print current chain:');
printChain(l1);

l4.chainAfter(l5);

console.log('\nPrint second chain:');
printChain(l4);

chain(l4, l1, AFTER);

console.log('\nChain l4 after l1:');
printChain(l1);
console.log('\nstackPast:');
console.log(stackPast);

console.log('\nUndo:');
rechain(stackPast.pop(), FROMPAST);
printChain(l1);
console.log('\nstackFuture:');
console.log(stackFuture);

console.log('\nRedo:');
rechain(stackFuture.pop(), FROMFUTURE);
printChain(l1);
console.log('\nstackPast:');
console.log(stackPast);

const l6 = new Node(6);
console.log('\nChain l6 after l5:');
chain(l6, l5, AFTER);
printChain(l1);
console.log('\nstackPast:');
console.log(stackPast);

console.log('\nUndo:');
rechain(stackPast.pop(), FROMPAST);
printChain(l1);
console.log('\nstackFuture:');
console.log(stackFuture);

console.log('\nRedo:');
rechain(stackFuture.pop(), FROMFUTURE);
printChain(l1);
console.log('\nstackPast:');
console.log(stackPast);
