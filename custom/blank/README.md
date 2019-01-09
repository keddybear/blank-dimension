# Blank.js
Blank.js is the rich text editor for Blank Dimension. It's designed to write novels and allow authors to create their own custom formats, so its internal model must be flexible and it must be able to handle huge document efficiently.

[Demo](https://blankjs.herokuapp.com/)

## Performance
Here is the performance benchmarking with some popular rich text editors: slate.js, Google Doc, and reddit's rich text comment editor. **Google Doc has much more features than Blank.js, so the comparison here is just to see if my editor is definitely faster.**

**Scenarios:**
1. Paste huge document, undo and redo.
2. Bold huge document, undo and redo.
3. Change huge document to list, undo and redo.

**Material:** huge document (900 paragraphs) from [https://www.slatejs.org/#/huge-document](https://www.slatejs.org/#/huge-document)

#### Paste huge document, undo and redo

*slate.js*

[benchmark-paste-slate](img/benchmark-paste-slate.jpg)
