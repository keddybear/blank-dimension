/* eslint-disable */
import Context from '../../input/context';
import Keyboard from '../../input/keyboard';
import { BlankIntents, BlankContexts } from '../../input/utils';
import { COMPOSITION$keydown } from '../../input/helper';
import { expect } from 'chai';

// Contexts
const { COMPOSITION } = BlankContexts;

// Intents
const {
	_default,
	insert_char,
	replace_text,
	del,
	backspace,
	newline,
	undo,
	redo,
	copy,
	paste,
	cut,
	bold,
	italic,
	underline,
	indent_list_item,
	unindent_list_item,
	cut_list
} = BlankIntents;

// Mock input and expect intent
describe('Mock input and expect intent', function() {

	before(function(done) {
		Context.context = COMPOSITION;
		done();
	});

	describe('insert_char', function() {

		it('Press any key that produces a printable character', function(done) {
			const event = {
				code: 'KeyU',
				key: 'u',
				shiftKey: false,
				altKey: false,
				ctrlKey: false,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(insert_char);

			done();
		});

		it('Press any key that produces a printable character + Shift', function(done) {
			const event = {
				code: 'KeyU',
				key: 'u',
				shiftKey: true,
				altKey: false,
				ctrlKey: false,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(insert_char);

			done();
		});

		it('Press any key that produces a printable character + Shift + Ctrl', function(done) {
			const event = {
				code: 'KeyU',
				key: 'u',
				shiftKey: true,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal('');

			done();
		});

	});

	describe('del', function() {

		it('Press Delete', function(done) {
			const event = {
				code: 'Delete',
				key: 'Delete',
				shiftKey: false,
				altKey: false,
				ctrlKey: false,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(del);

			done();
		});

		it('Press Delete + Ctrl + Alt', function(done) {
			const event = {
				code: 'Delete',
				key: 'Delete',
				shiftKey: false,
				altKey: true,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal('');

			done();
		});

	});

	describe('backspace', function() {

		it('Press Backspace', function(done) {
			const event = {
				code: 'Backspace',
				key: 'Backspace',
				shiftKey: false,
				altKey: false,
				ctrlKey: false,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(backspace);

			done();
		});

		it('Press Backspace + CTRL', function(done) {
			const event = {
				code: 'Backspace',
				key: 'Backspace',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal('');

			done();
		});

	});

	describe('newline', function() {

		it('Press Enter', function(done) {
			const event = {
				code: 'Enter',
				key: 'Enter',
				shiftKey: false,
				altKey: false,
				ctrlKey: false,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(newline);

			done();
		});

		it('Press Enter + Shift', function(done) {
			const event = {
				code: 'Enter',
				key: 'Enter',
				shiftKey: true,
				altKey: false,
				ctrlKey: false,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal('');

			done();
		});

	});

	describe('undo', function() {

		it('Ctrl + Z', function(done) {
			const event = {
				code: 'KeyZ',
				key: 'z',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(undo);

			done();
		});

	});

	describe('redo', function() {

		it('Ctrl + Y', function(done) {
			const event = {
				code: 'KeyY',
				key: 'y',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(redo);

			done();
		});

	});

	describe('copy', function() {

		it('Ctrl + C', function(done) {
			const event = {
				code: 'KeyC',
				key: 'c',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(copy);

			done();
		});

	});

	describe('paste', function() {

		it('Ctrl + V', function(done) {
			const event = {
				code: 'KeyV',
				key: 'v',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(_default);

			done();
		});

	});

	describe('cut', function() {

		it('Ctrl + X', function(done) {
			const event = {
				code: 'KeyX',
				key: 'x',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(cut);

			done();
		});

	});

	describe('bold', function() {

		it('Ctrl + B', function(done) {
			const event = {
				code: 'KeyB',
				key: 'b',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(bold);

			done();
		});

	});

	describe('italic', function() {

		it('Ctrl + I', function(done) {
			const event = {
				code: 'KeyI',
				key: 'i',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(italic);

			done();
		});

	});

	describe('underline', function() {

		it('Ctrl + U', function(done) {
			const event = {
				code: 'KeyU',
				key: 'u',
				shiftKey: false,
				altKey: false,
				ctrlKey: true,
				metaKey: false
			};

			Keyboard.press(event);
			const intent = COMPOSITION$keydown();
			expect(intent).to.equal(underline);

			done();
		});

	});

});
