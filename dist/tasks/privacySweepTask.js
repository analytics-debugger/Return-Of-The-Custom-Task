var privacySweepTask = (function () {
    'use strict';

    /**
     * Removes all parameters that are not privacy friendly or that are not reported on Google Analytics 4 in any way.
     *
     * @param request - The request model to be modified.
     * @returns The modified request model.
     */
    var privacySweepTask = function (request) {
        if (!request) {
            console.error('privacySweepTask: Request is required.');
            return request; // Returning the request even though it's not expected to be null or undefined
        }
        var blacklistedParams = [
            'ecid', 'ur', 'are', 'frm', 'pscdl', 'tfd', 'tag_exp', 'dma',
            'dma_cps', 'gcd', 'gcs', 'gsu', 'gcut', 'gcid', 'gclsrc',
            'gclid', 'gaz', 'us_privacy', 'gdpr', 'gdpr_consent',
            'us_privacy', '_geo', '_rdi', '_uie', '_uc'
        ];
        // Filtering and reducing the sharedPayload
        request.sharedPayload = Object.keys(request.sharedPayload)
            .filter(function (key) { return !blacklistedParams.includes(key); })
            .reduce(function (acc, key) {
            acc[key] = request.sharedPayload[key];
            return acc;
        }, {});
        return request;
    };

    return privacySweepTask;

})();
