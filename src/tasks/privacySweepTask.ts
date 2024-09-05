// src/tasks/privacySweepTask.ts

import { RequestPayload } from '../types/RequestPayload';

/**
 * Holder for the privacySweepTask function.
 * 
 * @param payload - The payload object to be modified.

 */
const privacySweepTask = (
    payload: RequestPayload,
): RequestPayload => {
    // Check if payload is provided
    if (!payload) {
        throw new Error('Payload is required.');
    }


    return payload;
};

export default privacySweepTask;