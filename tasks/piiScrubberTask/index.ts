// src/tasks/piiScrubberTask.ts

import { RequestModel } from "../../types/RequestModel";

/**
 * Holder for the piiScrubberTask function.
 * 
 * @param payload - The payload object to be modified.

 */
const piiScrubberTask = (
  payload: RequestModel,
): RequestModel => {
  // Check if payload is provided
  if (!payload) {
    throw new Error("Payload is required.");
  }


  return payload;
};

export default piiScrubberTask;