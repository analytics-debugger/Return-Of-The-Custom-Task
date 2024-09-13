// src/tasks/sendToSecondaryMeasurementIdTask.ts

/**
 * Sends a copy to a secondary Measurement Ids
 * You can control which events to copy
 * 
 * @param request - The request model to be modified.
 * @param toMeasurementIds - Array of Measurement IDs to send a copy to
 * @param whiteListedEvents - Array of event names that will be kepts
 * @param blackListedEvents - Array of event names that will be removed
 * @returns The modified payload object.
 */
const sendToSecondaryMeasurementIdTask = (
  request: RequestModel,
  toMeasurementIds: string[],
  whiteListedEvents: string[] = [], 
  blackListedEvents: string[] = []
): RequestModel => {
  if (!request || !toMeasurementIds || !Array.isArray(toMeasurementIds) || toMeasurementIds.length === 0) {
    console.error('sendToSecondaryMeasurementIdTask: Request and extra measurementIds are required.');
    return request;
  }

  const buildFetchRequest = (requestModel) => {
    const { endpoint, sharedPayload, events } = requestModel;
    const sharedPayloadString = new URLSearchParams(sharedPayload).toString();
    const eventParams = events.map(e => new URLSearchParams(e).toString());
  
    const resource = events.length === 1 
      ? `${endpoint}?${sharedPayloadString}&${eventParams[0]}`
      : `${endpoint}?${sharedPayloadString}`;
  
    const options = {
      method: 'POST',
      body: null
    };
  
    if (events.length > 1) {
      options.body = eventParams.join('\r\n');
    }
  
    return { resource, options };
  };
  const clonedRequest = JSON.parse(JSON.stringify(request));
  
  // Filter events based on white-listed and black-listed arrays
  const filterEvents = (
    events: Event[],
    whiteListedEvents?: string[],
    blackListedEvents?: string[]
  ): Event[] => {
    const validateEventsArray = (list?: string[]): list is string[] => Array.isArray(list) && list.length > 0;

    const applyFilter = (events: Event[], list: Set<string> | null, keep: boolean): Event[] => {
      if (!list) return events;
      return events.filter(event => keep ? list.has(event.en) : !list.has(event.en));
    };

    if (validateEventsArray(whiteListedEvents)) {
      return applyFilter(events, new Set(whiteListedEvents), true);
    } else if (validateEventsArray(blackListedEvents)) {
      return applyFilter(events, new Set(blackListedEvents), false);
    } else {
      return events;
    }
  };

  // Apply the event filtering
  clonedRequest.events = filterEvents(
    clonedRequest.events,
    whiteListedEvents,
    blackListedEvents
  );
  if(clonedRequest.events.length > 0){
    toMeasurementIds.forEach(id => {
      if(!/^(G-|MC-)[A-Z0-9]+$/.test(id)){
        console.error('Invalid MeasurementId Format, skipping', id);
      }else{
        clonedRequest.sharedPayload.tid = id;
  
        const req = buildFetchRequest(clonedRequest);      
        if(window.GA4CustomTask?.originalFetch){
          window.GA4CustomTask.originalFetch(req.resource, req.options);    
        }
        
  
      }
    });
  }
  return request;
};

export default sendToSecondaryMeasurementIdTask;

