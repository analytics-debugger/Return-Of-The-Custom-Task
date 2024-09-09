// src/tasks/sendToSecondaryMeasurementIdTask.ts

import { RequestModel } from '../../types/RequestModel';

/**
 * Sends a copy of the payload to a Snowplow endpoint. 
 * 
 * @param request - The request model to be modified.
 * @param toMeasurementIds - Array of Measurement IDs to send a copy to
 * @returns The modified payload object.
 */
const sendToSecondaryMeasurementIdTask = (
  request: RequestModel,
  toMeasurementIds: string[],
): RequestModel => {
  if (!request || !toMeasurementIds || !Array.isArray(toMeasurementIds) || toMeasurementIds.length === 0) {
    console.error('sendToSecondaryMeasurementIdTask: Request and extra measurementIds are required.');
    return request;
  }
  const clonedRequest = JSON.parse(JSON.stringify(request));

  const buildFetchRequest = (requestModel) => {
    const { endpoint, sharedPayload, events } = requestModel;
    const sharedPayloadString = new URLSearchParams(sharedPayload).toString();
    const eventParams = events.map(e => new URLSearchParams(e).toString());
  
    const resource = events.length === 1 
      ? `${endpoint}?${sharedPayloadString}&${eventParams[0]}`
      : `${endpoint}?${sharedPayloadString}`;
  
    const options = {
      method: 'POST',
      body: {}
    };
  
    if (events.length > 1) {
      options.body = eventParams.join('\r\n');
    }
  
    return { resource, options };
  };

  toMeasurementIds.forEach(id => {
    if(!/^(G-|MC-)[A-Z0-9]+$/.test(id)){
      console.log('Invalid MeasurementId Format, skipping', id);
    }else{
      clonedRequest.sharedPayload.tid = id;
      const req = buildFetchRequest(clonedRequest);      
      if(window.GA4CustomTask?.originalFetch){
        window.GA4CustomTask.originalFetch(req.resource, req.options);    
      }
      

    }
  });

  return request;
};

export default sendToSecondaryMeasurementIdTask;

