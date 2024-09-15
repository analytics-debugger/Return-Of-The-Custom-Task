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
  scope: 'event' | 'user' = 'event'
): RequestModel => {
  // Validate input parameters
  if (!request || !name) {
    console.error('mapPayloadSizeTask: Request and name are required.');
    return request;
  }

  const clientIdKey = `ep.${name}`;

  // Process based on the scope
  if (scope === 'user' && request.events.length > 0) {
    // Add the client ID to the first event if scope is 'user'
    request.events[0][`up.${name}`] = request.sharedPayload.cid;
  } else {
    // Add the client ID to all events if scope is 'event'
    request.events.forEach(event => {
      event[clientIdKey] = request.sharedPayload.cid;
    });
  }

  // Return the modified request object
  return request;
};

export default mapClientIdTask;
