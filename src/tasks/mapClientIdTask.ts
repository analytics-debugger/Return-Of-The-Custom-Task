// src/tasks/mapClientIdTask.ts

import { RequestPayload } from '../types/RequestPayload';

/**
 * Adds a client ID to the payload object to the specified event/property name and scope.
 * 
 * @param payload - The payload object to be modified.
 * @param name - The name to be used as part of the new key in the payload.
 * @param scope - The scope determines the prefix of the new key. Defaults to 'event'.
 * @returns The modified payload object.
 */
const mapClientIdTask = (
    payload: RequestPayload,
    name: string,
    scope: 'event' | 'user' = 'event'
): RequestPayload => {
    // Check if payload is provided
    if (!payload) {
        throw new Error('Payload is required.');
    }

    // Check if name is provided
    if (!name) {
        throw new Error('Name is required.');
    }

    // Construct the new key based on the scope and name
    const keyPrefix = scope === 'user' ? 'up.' : 'ep.';
    const key = `${keyPrefix}${name}`;

    // Add the client ID to the payload with the constructed key
    payload[key] = payload.cid;

    // Return the modified payload object
    return payload;
};

export default mapClientIdTask;