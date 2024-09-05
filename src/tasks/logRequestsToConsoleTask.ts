import { RequestPayload } from '../types/RequestPayload';

/**
 * Prints the current payload state to the console.
 * 
 * @param payload - The payload object to be modified.
 * @returns The modified payload object.
 */
const logRequestsToConsoleTask = (payload: RequestPayload): RequestPayload => {
    console.log("TheReturnOfTheCustomTask: Request", payload);
    return payload;
};

export default logRequestsToConsoleTask;