interface Event {
  en: string; // Event name or identifier
  [key: string]: any; // Additional properties
}

interface RequestModel {
  endpoint: string;
  sharedPayload: { [key: string]: any };
  events: Event[];
  __skip?: boolean;
}

/**
 * Sends a copy to secondary Measurement Ids
 * You can control which events to copy
 * 
 * @param request - The request model to be modified.
 * @param toMeasurementIds - Array of Measurement IDs to send a copy to
 * @param whiteListedEvents - Array of event names that will be kept
 * @param blackListedEvents - Array of event names that will be removed
 * @returns The modified request model.
 */
const sendToSecondaryMeasurementIdTask = (
  request: RequestModel,
  toMeasurementIds: string[],
  whiteListedEvents: string[] = [],
  blackListedEvents: string[] = []
): RequestModel => {
  if (!request || !toMeasurementIds || !Array.isArray(toMeasurementIds) || toMeasurementIds.length === 0) {
    console.error('sendToSecondaryMeasurementIdTask: Request and Measurement IDs are required.');
    return request;
  }

  const buildFetchRequest = (requestModel: RequestModel) => {
    const { endpoint, sharedPayload, events } = requestModel;
    const sharedPayloadString = new URLSearchParams(sharedPayload as any).toString(); // Cast to any to handle object to query string conversion
    const eventParams = events.map(e => new URLSearchParams(e as any).toString()); // Cast to any for the same reason

    const resource = events.length === 1 
      ? `${endpoint}?${sharedPayloadString}&${eventParams[0]}`
      : `${endpoint}?${sharedPayloadString}`;

    const options: RequestInit = {
      method: 'POST',
      body: events.length > 1 ? eventParams.join('\r\n') : null
    };

    return { resource, options };
  };

  const clonedRequest: RequestModel = JSON.parse(JSON.stringify(request));

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

  clonedRequest.events = filterEvents(
    clonedRequest.events,
    whiteListedEvents,
    blackListedEvents
  );

  if (clonedRequest.events.length > 0) {
    toMeasurementIds.forEach(id => {
      if (!/^(G-|MC-)[A-Z0-9]+$/.test(id)) {
        console.error('Invalid Measurement ID format, skipping:', id);
      } else {
        clonedRequest.sharedPayload.tid = id;

        const req = buildFetchRequest(clonedRequest);      
        if (window.GA4CustomTask?.originalFetch) {
          window.GA4CustomTask.originalFetch(req.resource, req.options);
        } else {
          console.error('GA4CustomTask.originalFetch is not defined.');
        }
      }
    });
  }

  return request;
};

export default sendToSecondaryMeasurementIdTask;
