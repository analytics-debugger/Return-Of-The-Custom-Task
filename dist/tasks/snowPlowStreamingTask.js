var snowPlowStreamingTask = (function () {
    'use strict';

    /**
     * Sends a copy of the payload to a Snowplow endpoint.
     *
     * @param request - The request model to be modified.
     * @param endpointHostname - SnowPlow Collector Endpoint Hostname.
     * @returns The modified payload object.
     *
     * Based on https://docs.snowplow.io/docs/collecting-data/collecting-from-own-applications/google-analytics-plugin/
     */
    var snowPlowStreamingTask = function (request, endpointHostname) {
        if (!request || !endpointHostname) {
            console.error('snowPlowStreamingTask: Request and endpointHistname are required.');
            return request;
        }
        var vendor = 'com.google.analytics';
        var version = 'v1';
        var fullEndpointUrl = ((endpointHostname.slice(-1) !== '/') ? endpointHostname + '/' : endpointHostname) + vendor + '/' + version;
        // Snowplow won't be handeling the requests will multiple events, so we will convert them to single requests
        request.events.forEach(function (event) {
            var XMLRequest = new XMLHttpRequest();
            XMLRequest.open('POST', fullEndpointUrl, true);
            XMLRequest.setRequestHeader('Content-type', 'text/plain; charset=UTF-8');
            var payload = Object.assign({}, request.sharedPayload, event);
            XMLRequest.send(new URLSearchParams(payload).toString());
        });
        // Send the payload to the endpoint 
        return request;
    };

    return snowPlowStreamingTask;

})();