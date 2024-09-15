var sendToSecondaryMeasurementIdTask = (function () {
    'use strict';

    /**
     * Sends a copy to secondary Measurement Ids
     * You can control which events to copy
     *
     * @param request - The request model to be modified.
     * @param toMeasurementIds - Array of Measurement IDs to send a copy to
     * @param whiteListedEvents - Array of event names that will be kept
     * @param blackListedEvents - Array of event names that will be removed
     * @returns The modified request model.
     */
    var sendToSecondaryMeasurementIdTask = function (request, toMeasurementIds, whiteListedEvents, blackListedEvents) {
        if (whiteListedEvents === void 0) { whiteListedEvents = []; }
        if (blackListedEvents === void 0) { blackListedEvents = []; }
        if (!request || !toMeasurementIds || !Array.isArray(toMeasurementIds) || toMeasurementIds.length === 0) {
            console.error('sendToSecondaryMeasurementIdTask: Request and Measurement IDs are required.');
            return request;
        }
        var buildFetchRequest = function (requestModel) {
            var endpoint = requestModel.endpoint, sharedPayload = requestModel.sharedPayload, events = requestModel.events;
            var sharedPayloadString = new URLSearchParams(sharedPayload).toString(); // Cast to any to handle object to query string conversion
            var eventParams = events.map(function (e) { return new URLSearchParams(e).toString(); }); // Cast to any for the same reason
            var resource = events.length === 1
                ? "".concat(endpoint, "?").concat(sharedPayloadString, "&").concat(eventParams[0])
                : "".concat(endpoint, "?").concat(sharedPayloadString);
            var options = {
                method: 'POST',
                body: events.length > 1 ? eventParams.join('\r\n') : null
            };
            return { resource: resource, options: options };
        };
        var clonedRequest = JSON.parse(JSON.stringify(request));
        var filterEvents = function (events, whiteListedEvents, blackListedEvents) {
            var validateEventsArray = function (list) { return Array.isArray(list) && list.length > 0; };
            var applyFilter = function (events, list, keep) {
                if (!list)
                    return events;
                return events.filter(function (event) { return keep ? list.has(event.en) : !list.has(event.en); });
            };
            if (validateEventsArray(whiteListedEvents)) {
                return applyFilter(events, new Set(whiteListedEvents), true);
            }
            else if (validateEventsArray(blackListedEvents)) {
                return applyFilter(events, new Set(blackListedEvents), false);
            }
            else {
                return events;
            }
        };
        clonedRequest.events = filterEvents(clonedRequest.events, whiteListedEvents, blackListedEvents);
        if (clonedRequest.events.length > 0) {
            toMeasurementIds.forEach(function (id) {
                var _a;
                if (!/^(G-|MC-)[A-Z0-9]+$/.test(id)) {
                    console.error('Invalid Measurement ID format, skipping:', id);
                }
                else {
                    clonedRequest.sharedPayload.tid = id;
                    var req = buildFetchRequest(clonedRequest);
                    if ((_a = window.GA4CustomTask) === null || _a === void 0 ? void 0 : _a.originalFetch) {
                        window.GA4CustomTask.originalFetch(req.resource, req.options);
                    }
                    else {
                        console.error('GA4CustomTask.originalFetch is not defined.');
                    }
                }
            });
        }
        return request;
    };

    return sendToSecondaryMeasurementIdTask;

})();
