var preventDuplicateTransactionsTask = (function () {
    'use strict';

    var storageHelper = {
        sync: function (name) {
            try {
                var valueFromCookie = null;
                try {
                    valueFromCookie = this.getDecodedCookie(name);
                }
                catch (error) {
                }
                var valueFromLocalStorage = localStorage.getItem(name);
                this.set(name, valueFromCookie || valueFromLocalStorage || '');
            }
            catch (error) {
                console.error('Error in sync method:', error);
            }
        },
        get: function (name) {
            try {
                // Uncomment the following line if you want to ensure synchronization before getting the value
                // this.sync(name);
                var value = localStorage.getItem(name);
                return value || null;
            }
            catch (error) {
                console.error('Error in get method:', error);
                return null;
            }
        },
        set: function (name, value, days, path, domain) {
            if (days === void 0) { days = 7; }
            if (path === void 0) { path = '/'; }
            if (domain === void 0) { domain = ''; }
            try {
                var safeValue = btoa(value);
                var expires = new Date(Date.now() + days * 864e5).toUTCString();
                document.cookie = "".concat(name, "=").concat(safeValue, "; expires=").concat(expires, "; path=").concat(path, "; domain=").concat(domain, "; SameSite=Strict; Secure");
                localStorage.setItem(name, value);
            }
            catch (error) {
                console.error('Error in set method:', error);
            }
        },
        getDecodedCookie: function (name) {
            try {
                var cookie = document.cookie.split('; ').find(function (row) { return row.startsWith(name + '='); });
                if (!cookie)
                    return null;
                var encodedValue = cookie.split('=')[1];
                return JSON.parse(atob(encodedValue));
            }
            catch (error) {
                console.error('Error decoding cookie:', error);
                return null;
            }
        }
    };

    /**
     * Monitors purchase events and keeps track of transaction IDs to prevent duplicate transactions.
     * Used a synced dual localStorage and cookie storage to store transaction IDs.
     *
     * @param request - The request model to be modified.
     * @param storeName - The storage type to be used. Defaults to 'cookie'.
     * @returns The modified payload object.
    */
    var preventDuplicateTransactionsTask = function (request, storeName) {
        if (storeName === void 0) { storeName = '__ad_trans_dedup'; }
        if (!request) {
            console.error('preventDuplicateTransactionsTask: Request is required.');
            return request;
        }
        var hasPurchaseEvents = request.events.some(function (e) { return e.en === 'purchase'; });
        if (hasPurchaseEvents) {
            var alreadyTrackedTransactions_1 = [];
            try {
                var storedTransactions = storageHelper.get(storeName);
                alreadyTrackedTransactions_1 = storedTransactions ? JSON.parse(storedTransactions) : [];
            }
            catch (error) {
                console.error('Failed to parse stored transactions:', error);
            }
            // Remove duplicate purchase events
            request.events = request.events.filter(function (event) {
                if (event.en === 'purchase' && alreadyTrackedTransactions_1.includes(event['ep.transaction_id'])) {
                    return false; // Remove this event
                }
                alreadyTrackedTransactions_1.push(event['ep.transaction_id']); // Add to tracked transactions
                return true; // Keep this event
            });
            // Write the new transactions to Storage
            storageHelper.set(storeName, JSON.stringify(alreadyTrackedTransactions_1));
        }
        if (request.events.length === 0) {
            // So it seems that all events were removed, there's no need to even sent this request
            request.__skip = true;
        }
        return request;
    };

    return preventDuplicateTransactionsTask;

})();
