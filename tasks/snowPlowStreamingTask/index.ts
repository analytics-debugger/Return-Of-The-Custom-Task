// src/tasks/snowPlowStreamingTask.ts

import { RequestModel } from '../../types/RequestModel';

/**
 * Sends a copy of the payload to a Snowplow endpoint. 
 * 
 * @param payload - The payload object to be modified.
 * @param endpoint - SnowPlow Collector Endpoint.
 * @returns The modified payload object.
 */
const snowPlowStreamingTask = (
    payload: RequestModel,
    endpoint: string,
    scope: 'event'
): RequestModel => {
    if (!payload || !endpoint) {
        throw new Error('Payload and endpoints are required.');
    }

    const vendor = 'com.google.analytics';
    const version = 'v1';
    const path = ((endpoint.substr(-1) !== '/') ? endpoint + '/' : endpoint) + vendor + '/' + version;
    // Send the payload to the endpoint
    var request = new XMLHttpRequest();
    request.open('POST', path, true);
    request.setRequestHeader('Content-type', 'text/plain; charset=UTF-8');
    request.send(new URLSearchParams(payload).toString());

    return payload;
};

export default snowPlowStreamingTask;