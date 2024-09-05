// src/tasks/piiScrubberTask.ts

import { RequestPayload } from '../types/RequestPayload';

/**
 * Holder for the piiScrubberTask function.
 * 
 * @param payload - The payload object to be modified.

 */
const piiScrubberTask = (
    payload: RequestPayload,
): RequestPayload => {
    // Check if payload is provided
    if (!payload) {
        throw new Error('Payload is required.');
    }


    return payload;
};

export default piiScrubberTask;