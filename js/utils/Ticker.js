/**
 * Ticker queues functions and calls them later,
 * like underscore throttle function
 */

define('Plugbot/utils/Ticker', [], function () {
    'use strict';

    var Model = Backbone.Model.extend({
        defaults: function () {
            return {
                /**
                 * Default, read-only
                 */
                interval: 'optimal',
                optimalHz: 1
            };
        },
        initialize: function () {
            /**
             * Runtime options
             */
            // IDs (key: id, value: id of setTimeout)
            this.ids = {};
        },
        /**
         * Add a function call by id
         * @param {(number|string)} id  Id
         * @param {function} fn         Function to be called (No parameters)
         * @param {Object=} options     Options
         */
        add: function (id, fn, options) {
            var that = this,
                interval,
                remainingTime;

            // check if the function has been included
            if (undefined !== this.ids[id]) { return this; }

            // apply default settings
            options = options || {};
            _.defaults(options, {
                interval: this.get('interval')
            });

            // set remaining time
            interval = options.interval;

            if (!_.isNumber(interval)) {
                if ('optimal' === interval) {
                    interval = Math.round(1000 / this.get('optimalHz'));
                } else if ('hz' === interval.substr(-2)) {
                    interval = Math.round(1000 /
                        +interval.substr(0, interval.length - 2));
                }
            }

            remainingTime = interval - (Date.now() % interval);

            this.ids[id] = setTimeout(function () {
                // invoke
                fn.apply(that);

                // remove this key
                delete that.ids[id];
            }, remainingTime);

            return this;
        },
        /**
         * Remove an id
         * @param {(number|string)} id   Id
         */
        remove: function (id) {
            clearInterval(this.ids[id]);
            delete this.ids[id];

            return this;
        },
        has: function (id) {
            return (undefined !== this.ids[id]);
        },
        /**
         * Clear all calls
         */
        clear: function () {
            var ids = this.ids, key;

            for (key in ids) {
                if (ids.hasOwnProperty(key)) {
                    this.remove(key);
                }
            }

            return this;
        },
        close: function () {
            this.clear();
        }
    });

    return Model;
});
