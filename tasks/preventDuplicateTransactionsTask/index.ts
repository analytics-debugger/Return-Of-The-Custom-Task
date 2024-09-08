// src/tasks/preventDuplicateTransactionsTask.ts

import { RequestModel } from '../../types/RequestModel';
import storageHelper from '../../src/helpers/storageHelper';
/**
 * Monitors purchase events and keeps track of transaction IDs to prevent duplicate transactions.
 * Used a synced dual localStorage and cookie storage to store transaction IDs.
 * 
 * @param request - The request model to be modified.
 * @param storeName - The storage type to be used. Defaults to 'cookie'.
 * @returns The modified payload object.
 */
const preventDuplicateTransactionsTask = (
  request: RequestModel,
  storeName: string = '__ad_trans_dedup'
): RequestModel => {

  if (!request) {
    console.error('preventDuplicateTransactionsTask: Request is required.');
    return request;
  }

  const hasPurchaseEvents = request.events.some(e => e.en === 'purchase');

  if (hasPurchaseEvents) {
    let alreadyTrackedTransactions: string[] = [];
    
    try {
      const storedTransactions = storageHelper.get(storeName);
      alreadyTrackedTransactions = storedTransactions ? JSON.parse(storedTransactions) : [];
    } catch (error) {
      console.error('Failed to parse stored transactions:', error);
    }

    // Remove duplicate purchase events
    request.events = request.events.filter(event => {
      if (event.en === 'purchase' && alreadyTrackedTransactions.includes(event['ep.transaction_id'])) {
        return false; // Remove this event
      }
      alreadyTrackedTransactions.push(event['ep.transaction_id']); // Add to tracked transactions
      return true; // Keep this event
    });

    // Write the new transactions to Storage
    storageHelper.set(storeName, JSON.stringify(alreadyTrackedTransactions));
  }
  
  if(request.events.length === 0) {
    // So it seems that all events were removed, there's no need to even sent this request
    request.__skip = true;
  } 
  return request;
};


export default preventDuplicateTransactionsTask;