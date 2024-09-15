var mapPayloadSizeTask = (function () {
    'use strict';

    /**
     * Adds a event parameter on the provided event property name with the size of the payload.
     *
     * @param request - The request model to be modified.
     * @param name - The name to be used as part of the new key in the payload.
     * @param eventsList - The list of events where the size will be attached to
     * @returns The modified payload object.
     */
    var mapPayloadSizeTask = function (request, name, eventsList) {
        if (!request || !name) {
            console.error('mapPayloadSizeTask: Request and name are required.');
            return request;
        }
        var key = "epn.".concat(name);
        var total_payload_size = request.events.reduce(function (total_evt_size, event_payload) {
            return total_evt_size + new URLSearchParams(event_payload).toString().length;
        }, new URLSearchParams(request.sharedPayload || '').toString().length);
        request.events.forEach(function (event) {
            if (eventsList && eventsList.length > 0) {
                if (eventsList.includes(event['en'])) {
                    event[key] = total_payload_size;
                }
            }
            else {
                event[key] = total_payload_size;
            }
        });
        return request;
    };

    return mapPayloadSizeTask;

})();
