// src/tasks/privacySweepTask.ts

import { RequestModel } from '../../types/RequestModel';
/**
 * Removes all parameters that are not privacy friendly or that are not reported on Google Analytics 4 in any way.
 * 
 * @param request - The request model to be modified.
 * @returns The modified payload object.
 */

const privacySweepTask = (
  request: RequestModel
): RequestModel => {
  const blacklistedParams = ['ecid', 'ur', 'are', 'frm', 'pscdl','tfd','tag_exp', 'dma', 'dma_cps', 'gcd', 'gcs', 'gsu', 'gcut', 'gcid', 'gclsrc', 'gclid', 'gaz', 'us_privacy', 'gdpr', 'gdpr_consent', 'us_privacy', '_geo', '_rdi', '_uie', '_uc'];
  request.sharedPayload = Object.keys(obj)
    .filter(key => !blacklistedParams.includes(key))
    .reduce((acc, key) => {
      acc[key] = obj[key];
      return acc;
    }, {});  
  return request;
};

export default privacySweepTask;