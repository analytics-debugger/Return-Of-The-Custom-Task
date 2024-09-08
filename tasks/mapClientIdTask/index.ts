// src/tasks/mapClientIdTask.ts

import { RequestModel } from '../../types/RequestModel';

/**
 * Adds a client ID to the payload object to the specified event/property name and scope.
 * 
 * @param request - The request model to be modified.
 * @param name - The name to be used as part of the new key in the payload.
 * @param scope - The scope determines the prefix of the new key. Defaults to 'event'.
 * @returns The modified payload object.
 */
const mapClientIdTask = (
  request: RequestModel,
  name: string,
  scope: 'event' | 'user' = 'event',    
): RequestModel => {
  // Check if payload is provided
  if (!request) {
    throw new Error('Request is required.');
  }

  // Check if name is provided
  if (!name) {
    throw new Error('Name is required.');
  }
  const keyPrefix = scope === 'user' ? 'up.' : 'ep.';
  const key = `${keyPrefix}${name}`;

  if(scope === 'user') {
    request.sharedPayload[key] = request.sharedPayload.cid;
  }else {
  // Add the client ID to all the events
    request.events.map((event) => {
      event[key] = request.sharedPayload.cid;
    }); 
  }

  // Return the modified payload object
  return request;
};

export default mapClientIdTask;