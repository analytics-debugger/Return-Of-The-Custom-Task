// src/tasks/privacySweepTask.ts

import { RequestModel } from "../../types/RequestModel";

/**
 * Holder for the privacySweepTask function.
 * 
 * @param payload - The payload object to be modified.

 */
const privacySweepTask = (
  payload: RequestModel,
): RequestModel => {
  // Check if payload is provided
  if (!payload) {
    throw new Error("Payload is required.");
  }


  return payload;
};

export default privacySweepTask;