import { delay } from './utils';

/**
 * Implementation to ensure only one item in a queue is running
 * at once
 *
 * @class Queue
 */
class Queue {

    /**
     * Creates an instance of Queue.
     * 
     * @param {number} [interval=1000] The interval to wait between queue events
     * @memberof Queue
     */
    constructor(interval = 1000) {
        this._items = [];
        this._interval = interval
    }

    /**
     * Adds an item to the queue, to be run only after
     * date specified.
     *
     * @param {Function} fn A function to execute
     * @param {Date} [after=new Date()] Only run after this date
     * @memberof Queue
     * @returns {void}
     */
    add(fn, after = new Date()) {
        this._items.push({
            fn,
            after,
        });
    }

    /**
     * Fetches the next item to run, and returns it
     *
     * @private
     * @returns {{fn: Function, after: Date}} The item in the queue
     * @memberof Queue
     */
    _getNext() {
        const now = new Date();

        const idx = this._items.findIndex(el => now.getTime() > el.after.getTime());

        if (idx === -1) {
            return null;
        }

        const [item] = this._items.splice(idx, 1);
        
        return item;
    }

    /**
     * Main method to run the queue. 
     *
     * @memberof Queue
     * @returns {void}
     */
    async run() {
        while (true) {
            const item = this._getNext();

            if (item !== null) {
                await item.fn();
            }
            await delay(this._interval);
        }
    }
}

export default Queue;