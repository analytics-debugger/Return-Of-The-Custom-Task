// src/tasks/logRequestToConsole.ts

/**
 * Prints the current payload state to the console.
 * 
 * @param request - The payload object to be modified.
 * @returns The modified payload object.
 */

const logRequestsToConsoleTask = (request: RequestModel): RequestModel => {
  console.group(`%cReturnOfTheCustomTask: New Request ( ${request.events.length} Events )`, 'color: purple; font-size: large; font-weight: bold;');
  console.log(request);
  console.groupEnd();
  // Return back the request
  return request;
};

export default logRequestsToConsoleTask;