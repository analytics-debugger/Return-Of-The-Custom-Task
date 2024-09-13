// src/tasks/mapPayloadSizeTask.ts

/**
 * Adds a event parameter on the provided event property name with the size of the payload.
 * 
 * @param request - The request model to be modified.
 * @param name - The name to be used as part of the new key in the payload.
 * @param eventsList - The list of events where the size will be attached to
 * @returns The modified payload object.
 */
const mapPayloadSizeTask = (
  request: RequestModel,
  name: string,
  eventsList: Array<string>,
): RequestModel => {

  if (!request || !name) {
    console.error('mapPayloadSizeTask: Request and name are required.');
    return request;
  }

  const key = `epn.${name}`;
  const total_payload_size = request.events.reduce((total_evt_size, event_payload) => { 
    return total_evt_size + new URLSearchParams(event_payload).toString().length;
  }, new URLSearchParams(request.sharedPayload || '').toString().length);

  
  request.events.forEach((event) => {
    if (eventsList && eventsList.length > 0) {
      if (eventsList.includes(event['en'])) {
        event[key] = total_payload_size;
      }
    } else {
      event[key] = total_payload_size;
    }
  });

  return request;

};

export default mapPayloadSizeTask;