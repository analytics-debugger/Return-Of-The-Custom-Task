var preventDuplicateTransactionsTask = (function () {
    'use strict';

    var storageHelper = {
        sync: function (name) {
            var cookie = document.cookie.split('; ').find(function (row) { return row.startsWith(name + '='); });
            var valueFromLocalStorage = localStorage.getItem(name);
            var valueFromCookie = cookie ? cookie.split('=')[1] : null;
            if (valueFromCookie !== null) {
                var decodedValue = decodeURIComponent(valueFromCookie);
                var timestampFromCookie = parseInt(decodedValue.split(':')[0], 10);
                var timestampFromLocalStorage = valueFromLocalStorage ? parseInt(valueFromLocalStorage.split(':')[0], 10) : 0;
                if (timestampFromCookie > timestampFromLocalStorage) {
                    localStorage.setItem(name, decodedValue);
                }
                else if (timestampFromLocalStorage > timestampFromCookie) {
                    if (valueFromLocalStorage !== null) {
                        document.cookie = "".concat(name, "=").concat(encodeURIComponent(valueFromLocalStorage), "; path=/; SameSite=Strict; Secure");
                    }
                }
            }
            else {
                // Handle case where cookie is null
                if (valueFromLocalStorage !== null) {
                    document.cookie = "".concat(name, "=").concat(encodeURIComponent(valueFromLocalStorage), "; path=/; SameSite=Strict; Secure");
                }
            }
        },
        get: function (name) {
            this.sync(name);
            var value = localStorage.getItem(name);
            return value ? value.split(':')[1] || null : null;
        },
        set: function (name, value, days, path, domain) {
            if (days === void 0) { days = 7; }
            if (path === void 0) { path = '/'; }
            if (domain === void 0) { domain = ''; }
            var timestamp = Date.now();
            var valueWithTimestamp = "".concat(timestamp, ":").concat(value);
            var encodedValue = encodeURIComponent(valueWithTimestamp);
            localStorage.setItem(name, valueWithTimestamp);
            var expires = new Date(Date.now() + days * 864e5).toUTCString();
            document.cookie = "".concat(name, "=").concat(encodedValue, "; expires=").concat(expires, "; path=").concat(path, "; domain=").concat(domain, "; SameSite=Strict; Secure");
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
