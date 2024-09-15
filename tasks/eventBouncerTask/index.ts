/**
 * Cleans up the events and parameters to match the defined model
 * 
 * @param request - The RequestModel object to be cleaned.
 * @param allowedEventsSchema - The allowedEvents Schema object.
 * @returns The cleaned RequestModel object.
 */
const eventBouncerTask = (
  request: RequestModel,
  allowedEventsSchema: AllowedEventsSchema = { events: {} },
): RequestModel => {
  if (!request || !allowedEventsSchema || Object.keys(allowedEventsSchema).length === 0) {
    console.error('eventBouncerTask: Request and allowedEventsSchema are required.');
    return request;
  }

  // Default empty array if sharedEventParameters is not provided
  const sharedEventParameters = allowedEventsSchema.sharedEventParameters || [];

  // Remove unwanted events and parameters
  request.events = request.events
    .filter(event => Object.keys(allowedEventsSchema.events).includes(event.en)) // Step 1: Filter events based on valid event names
    .map(event => {
      const eventAllowedParams = sharedEventParameters.concat(
        allowedEventsSchema.events[event.en]?.wlep || [] // Use empty array if wlep is not defined
      );

      // Filter the parameters that start with "ep." based on the allowed parameters
      const filteredEvent: GA4Event = { en: event.en }; // Keep only valid parameters
      Object.keys(event).forEach(key => {
        if (key.startsWith('ep.')) {
          const paramName = key.slice(3); // Remove "ep." prefix
          if (eventAllowedParams.includes(paramName)) {
            filteredEvent[key] = event[key];
          }
        } else {
          // Keep non-"ep." properties as is (like "en")
          filteredEvent[key] = event[key];
        }
      });

      return filteredEvent;
    });

  // Return the cleaned RequestModel object
  return request;
};

export default eventBouncerTask;
