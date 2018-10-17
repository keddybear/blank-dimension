// Semaphore
const Semaphore = (max) => {
	const tasks = [];
	let counter = max;

	const dispatch = () => {
		if (counter > 0 && tasks.length > 0) {
			counter -= 1;
			tasks.shift()();
		}
	};

	const release = () => {
		counter += 1;
		dispatch();
	};

	const acquire = () =>
		new Promise((resolve) => {
			tasks.push(resolve);
			setImmediate(dispatch);
		});

	return async (fn) => {
		await acquire();
		let result;
		try {
			result = await fn();
		} catch (e) {
			throw e;
		} finally {
			release();
		}
		return result;
	};
};

// Worker Cluster
const maxWorkers = navigator.hardwareConcurrency || 4;
const defaultHandler = async (worker, data) => {
	worker.postMessage(data);
	return worker.once('message');
};

const Cluster = (path, handler = defaultHandler, max = maxWorkers) => {
	const pool = [];
	const semaphore = Semaphore(max);

	const useWorker = async (fn) => {
		const worker = pool.pop() || new Worker(path);
		let result;
		try {
			result = await fn(worker);
		} catch (e) {
			throw e;
		} finally {
			pool.push(worker);
		}
		return result;
	};

	return async (data) => {
		await semaphore(() => useWorker(worker => handler(worker, data)));
	};
};

module.exports = {
	Semaphore,
	Cluster
};
