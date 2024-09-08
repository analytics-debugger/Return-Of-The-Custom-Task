// src/tasks/mapPayloadSizeTask.ts

import { RequestModel } from "../../types/RequestModel";

/**
 * Adds a event parameter on the provided event property name with the size of the payload.
 * 
 * @param payload - The payload object to be modified.
 * @param name - The name to be used as part of the new key in the payload.
 * @param scope - The scope determines the prefix of the new key. Defaults to 'event'.
 * @returns The modified payload object.
 */
const mapPayloadSizeTask = (
  payload: RequestModel,
  name: string,
): RequestModel => {
  if (!payload) {
    throw new Error("Payload is required.");
  }

  if (!name) {
    throw new Error("Name is required.");
  }

  const key = `epn.${name}`;
  payload[key] = new URLSearchParams(payload).toString().length;

  return payload;
};

export default mapPayloadSizeTask;