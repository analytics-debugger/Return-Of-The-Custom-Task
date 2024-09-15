var eventBouncerTask = (function () {
    'use strict';

    /**
     * Cleans up the events and parameters to match the defined model
     *
     * @param request - The RequestModel object to be cleaned.
     * @param allowedEventsSchema - The allowedEvents Schema object.
     * @returns The cleaned RequestModel object.
     */
    var eventBouncerTask = function (request, allowedEventsSchema) {
        if (allowedEventsSchema === void 0) { allowedEventsSchema = { events: {} }; }
        if (!request || !allowedEventsSchema || Object.keys(allowedEventsSchema).length === 0) {
            console.error('eventBouncerTask: Request and allowedEventsSchema are required.');
            return request;
        }
        // Default empty array if sharedEventParameters is not provided
        var sharedEventParameters = allowedEventsSchema.sharedEventParameters || [];
        // Remove unwanted events and parameters
        request.events = request.events
            .filter(function (event) { return Object.keys(allowedEventsSchema.events).includes(event.en); }) // Step 1: Filter events based on valid event names
            .map(function (event) {
            var _a;
            var eventAllowedParams = sharedEventParameters.concat(((_a = allowedEventsSchema.events[event.en]) === null || _a === void 0 ? void 0 : _a.wlep) || [] // Use empty array if wlep is not defined
            );
            // Filter the parameters that start with "ep." based on the allowed parameters
            var filteredEvent = { en: event.en }; // Keep only valid parameters
            Object.keys(event).forEach(function (key) {
                if (key.startsWith('ep.')) {
                    var paramName = key.slice(3); // Remove "ep." prefix
                    if (eventAllowedParams.includes(paramName)) {
                        filteredEvent[key] = event[key];
                    }
                }
                else {
                    // Keep non-"ep." properties as is (like "en")
                    filteredEvent[key] = event[key];
                }
            });
            return filteredEvent;
        });
        // Return the cleaned RequestModel object
        return request;
    };

    return eventBouncerTask;

})();
