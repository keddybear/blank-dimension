/* eslint-disable */
class BlankObserver {
	constructor() {
		this.observers = {};

		this.listen = (event, fn) => {
			if (typeof this.observers[event] === 'undefined') {
				this.observers[event] = [];
			}
			this.observers[event].push(fn);
		};
		this.unlisten = (event, fn) => {
			if (Array.isArray(this.observers[event])) {
				this.observers[event] = this.observers[event].filter(subscriber => subscriber !== fn);
			}
		};
		this.fire = (event, data) => {
			if (Array.isArray(this.observers[event])) {
				this.observers[event].forEach(subscriber => subscriber(data));
			}
		};
	}
}
