import { RequestModel } from '../../types/RequestModel';

/**
 * Prints the current payload state to the console.
 * 
 * @param payload - The payload object to be modified.
 * @returns The modified payload object.
 */
const logRequestsToConsoleTask = (request: RequestModel): RequestModel => {
    console.log("ReturnOfTheCustomTask: Request", request);
    return request;
};

export default logRequestsToConsoleTask;