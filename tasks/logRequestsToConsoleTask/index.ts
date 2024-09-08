import { RequestModel } from "../../types/RequestModel";

/**
 * Prints the current payload state to the console.
 * 
 * @param payload - The payload object to be modified.
 * @returns The modified payload object.
 */

const logRequestsToConsoleTask = (request: RequestModel): RequestModel => {
  // Check if payload is provided
  if (!request) {
    throw new Error("RequestModel is required.");
  }

  console.group(`%cReturnOfTheCustomTask: New Request ( ${obj.events.length} Events )`, "color: purple; font-size: large; font-weight: bold;");
  console.log(obj);
  console.groupEnd();
  // Return back the request
  return request;
};

export default logRequestsToConsoleTask;