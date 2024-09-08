// src/tasks/sendToSecondaryMeasurementIdTask.ts

import { RequestModel } from '../../types/RequestModel';
/**
 * Removes all parameters that are not privacy friendly or that are not reported on Google Analytics 4 in any way.
 * 
 * @param request - The request model to be modified.
 * @returns The modified payload object.
 */

const sendToSecondaryMeasurementIdTask = (
  request: RequestModel
): RequestModel => {

  return request;
};

export default privacysendToSecondaryMeasurementIdTaskSweepTask;