// @flow
import React from 'react';
import { BlankIntents } from './main/input/utils';
/* eslint camelcase: 0 */
const { undo, redo, bold, italic, underline, bt_paragraph, bt_olist, bt_ulist } = BlankIntents;

const Sidebar = () => (
	<div id='sidebar' className='noselect'>
		<div>
			<div className='item' data-intent={undo}>
				<div>Undo<br /><span>CTRL+Z</span></div><div className='wrap' />
			</div>
			<div className='item' data-intent={redo}>
				<div>Redo<br /><span>CTRL+Y</span></div><div className='wrap' />
			</div>
			<div className='item' data-intent={bold}>
				<div>Bold<br /><span>CTRL+B</span></div><div className='wrap' />
			</div>
			<div className='item' data-intent={italic}>
				<div>Italic<br /><span>CTRL+I</span></div><div className='wrap' />
			</div>
			<div className='item' data-intent={underline}>
				<div>Underline<br /><span>CTRL+U</span></div><div className='wrap' />
			</div>
			<div className='item' data-intent={bt_paragraph}>
				<div>Paragraph<br /><span /></div><div className='wrap' />
			</div>
			<div className='item' data-intent={bt_olist}>
				<div>Ordered List<br /><span /></div><div className='wrap' />
			</div>
			<div className='item' data-intent={bt_ulist}>
				<div>Unordered List<br /><span /></div><div className='wrap' />
			</div>
		</div>
	</div>
);

export default Sidebar;
