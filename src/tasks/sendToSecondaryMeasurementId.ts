// src/tasks/sendToSecondaryMeasurementId.ts

import { RequestPayload } from '../types/RequestPayload';

/**
 * Holder for the sendToSecondaryMeasurementId function.
 * 
 * @param payload - The payload object to be modified.

 */
const sendToSecondaryMeasurementId = (
    payload: RequestPayload,
): RequestPayload => {
    // Check if payload is provided
    if (!payload) {
        throw new Error('Payload is required.');
    }


    return payload;
};

export default sendToSecondaryMeasurementId;