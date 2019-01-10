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

### Paste huge document, undo and redo

|               | Paste           | Undo      | Redo     | Screenshots |
| ------------- | --------------- | --------- | -------- | ----------- |
| **_slate.js_** | 22410.2 ms | 2347.2 ms | 13628.7 ms | [Link](img/benchmark-paste-slate.jpg) |
| **_Google Doc_** | 8138.5 ms | 2337.7 ms | 2273.8 ms | [Link](img/benchmark-paste-google_doc.jpg) |
| **_Reddit_** | 1849.7 ms | 23.3 ms | 391.1 ms | [Link](img/benchmark-paste-reddit.jpg) |
| **_Blank.js_** | 248.2 ms | 31.0 ms | 182.9 ms | [Link](img/benchmark-paste-blank.jpg) |

### Bold huge document, undo and redo

|               | Bold           | Undo      | Redo     | Screenshots |
| ------------- | --------------- | --------- | -------- | ----------- |
| **_slate.js_** | 16540.1 ms | 7343.9 ms | Unavailable | [Link](img/benchmark-bold-slate.jpg) |
| **_Google Doc_** | 1675.1 ms | 1020.7 ms | 1751.3 ms | [Link](img/benchmark-bold-google_doc.jpg) |
| **_Reddit_** | 672.4 ms | 345.0 ms | 471.5 ms | [Link](img/benchmark-bold-reddit.jpg) |
| **_Blank.js_** | 812.0 ms | 654.1 ms | 646.3 ms | [Link](img/benchmark-bold-blank.jpg) |

### Change huge document to list, undo and redo

|               | List           | Undo      | Redo     | Screenshots |
| ------------- | --------------- | --------- | -------- | ----------- |
| **_slate.js_** | 28553.7 ms | 31872.2 ms | Unavailable | [Link](img/benchmark-list-slate.jpg) |
| **_Google Doc_** | 5068.0 ms | 1737.5 ms | 2546.5 ms | [Link](img/benchmark-list-google_doc.jpg) |
| **_Reddit_** | 390.4 ms | 388.2 ms | 361.0 ms | [Link](img/benchmark-list-reddit.jpg) |
| **_Blank.js_** | 166.8 ms | 183.9 ms | 165.2 ms | [Link](img/benchmark-list-blank.jpg) |
