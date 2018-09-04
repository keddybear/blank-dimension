import React, { Component } from 'react';

import Editor, { Editable, createEmptyState } from 'ory-editor-core';
import 'ory-editor-core/lib/index.css';

import { Trash, DisplayModeToggle, Toolbar } from 'ory-editor-ui';
import 'ory-editor-ui/lib/index.css';

const content = createEmptyState();

const editor = new Editor({
	editables: [content]
});

class App extends Component {
	componentWillMount() {

	}

	render() {
		return (
			<div>
				<div className='App-header'>
					<h2>Welcome to React</h2>
				</div>
				<Editable editor={editor} id={content.id} />
				<Trash editor={editor} />
				<DisplayModeToggle editor={editor} />
				<Toolbar editor={editor} />
			</div>
		);
	}
}

export default App;
