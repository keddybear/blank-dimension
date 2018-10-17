import React, { Component } from 'react';

class Leaf extends Component {
	constructor(props) {
		super(props);

		const { type, text, parentConnect } = props;
		this.state = { type, text };
		this.parentConnect = parentConnect;
		this.changeState = ({ type: leafType, text: leafText }) => {
			this.setState({ type: leafType, text: leafText });
		};
	}

	componentDidMount() {
		const newLeaf = {
			offset: this.props.offset,
			type: this.state.type,
			text: this.state.text,
			changeState: this.changeState
		};
		this.parentConnect(newLeaf);
	}

	componentDidUpdate() {
		// console.log('Leaf.updated');
	}

	render() {
		const { offset } = this.props;
		let node;
		if (this.state.type === 'bold') {
			node = <strong data-offset-key={offset}>{ this.state.text }</strong>;
		} else {
			node = <span data-offset-key={offset}>{ this.state.text }</span>;
		}
		return node;
	}
}

export default Leaf;
