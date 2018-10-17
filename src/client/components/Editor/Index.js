import React, { Component } from 'react';
import { Editor } from 'custom/slate-react';
import { Value } from 'custom/slate';

const initialValue = Value.fromJSON({
	document: {
		nodes: [{
			object: 'block',
			type: 'paragraph',
			nodes: [{
				object: 'text',
				leaves: [{
					text: 'My first paragraph!'
				}]
			}]
		}]
	}
});

class TextEditor extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: initialValue
		};
		this.onChange = ({ value }) => {
			console.log(value);
			this.setState({ value });
		};
		this.onKeyDown = (e, change) => {
			if (!e.ctrlKey) return;
			e.preventDefault();

			switch (e.key) {
				case 'b':
					change.addMark('bold');
					break;
				default:
					console.log('switch.default', e.key);
			}
		};
	}

	render() {
		return (
			<div
				style={{
					maxWidth: '600px',
					margin: 'auto'
				}}
			>
				<Editor
					value={this.state.value}
					onChange={this.onChange}
					onKeyDown={this.onKeyDown}
				/>
			</div>
		);
	}
}

export default TextEditor;
