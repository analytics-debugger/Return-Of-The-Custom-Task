// src/tasks/sendToSecondaryMeasurementId.ts

import { RequestModel } from "../../types/RequestModel";

/**
 * Holder for the sendToSecondaryMeasurementId function.
 * 
 * @param payload - The payload object to be modified.

 */
const sendToSecondaryMeasurementId = (
  payload: RequestModel,
): RequestModel => {
  // Check if payload is provided
  if (!payload) {
    throw new Error("Payload is required.");
  }


  return payload;
};

export default sendToSecondaryMeasurementId;