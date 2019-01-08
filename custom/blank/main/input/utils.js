// @flow

// Key Types
export const KeyTypes = {
	/*
		CHARACTER:
			- Pressed key produces a printable character.
	*/
	CHARACTER: 1
};

// Modifiers
export const KeyModifiers = {
	SHIFT: 1,
	CTRL: 2,
	ALT: 4,
	META: 8,
	ANY: 255
};

// Contexts
export const BlankContexts = {
	/*
		NO_CONTEXT:
			- The void equivalent of Context.
	*/
	NO_CONTEXT: 'NO_CONTEXT',
	/*
		COMPOSITION:
			- Text composition in Blank Editor is active.
	*/
	COMPOSITION: 'COMPOSITION'
};

// Intents
export const BlankIntents = {
	_default: 'default', // Event does not call preventDefault()
	// Basic
	insert_char: 'insert_char',
	replace_text: 'replace_text',
	del: 'delete',
	backspace: 'backspace',
	newline: 'newline',
	undo: 'undo',
	redo: 'redo',
	copy: 'copy',
	cut: 'cut',
	cut_content: 'cut_content',
	paste: 'paste',
	paste_content: 'paste_content',
	paste_plain: 'paste_plain',
	paste_plain_content: 'paste_plain_content',
	select_all: 'select_all',
	// Style
	bold: 'bold',
	italic: 'italic',
	underline: 'underline',
	// Branch Type
	bt_paragraph: 'bt_paragraph',
	bt_olist: 'bt_olist',
	bt_ulist: 'bt_ulist',
	// Others
	indent_list_item: 'indent_list_item',
	unindent_list_item: 'unindent_list_item',
	cut_list: 'cut_list' // Change current list item to a paragraph
};
