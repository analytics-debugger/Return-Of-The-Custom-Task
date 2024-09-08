import { RequestModel } from "../../types/RequestModel";

/**
 * Prints the current payload state to the console.
 * 
 * @param payload - The payload object to be modified.
 * @returns The modified payload object.
 */
const logRequestsToConsoleTask = (request: RequestModel): RequestModel => {
  console.group(`%cReturnOfTheCustomTask: New Request ( ${request.events.length} Events )`, "color: purple; font-size: large; font-weight: bold;");
  console.log("Endpoint", request.endpoint);
  console.log("Shared Payload", request.sharedPayload);
  request.events.forEach((e,i)=>{
    console.group(`#${i+1} - Event: ${e.en}`);
    console.log(JSON.stringify(e, null, 4));    
    console.groupEnd();        
  });
  console.groupCollapsed("RAW INFO");
  console.log(request);
  console.groupEnd();        
  console.groupEnd();
  return request;
};

export default logRequestsToConsoleTask;