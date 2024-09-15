/**
 * Prints the current RequestModel to the console.
 * 
 * @param request - The RequestModel object to be logged.
 * @returns The unchanged RequestModel object.
 */
const logRequestsToConsoleTask = (request: RequestModel): RequestModel => {
  console.group(
    `%cReturnOfTheCustomTask: New Request (${request.events.length} Events)`,
    'color: purple; font-size: large; font-weight: bold;'
  );
  console.log(request);
  console.groupEnd();
  
  // Return the RequestModel object as is
  return request;
};

export default logRequestsToConsoleTask;
