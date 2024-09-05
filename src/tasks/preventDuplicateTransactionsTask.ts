// src/tasks/preventDuplicateTransactionsTask.ts

import { RequestPayload } from '../types/RequestPayload';
import storageHelper from '../helpers/storageHelper';
/**
 * Monitors purchase events and keeps track of transaction IDs to prevent duplicate transactions.
 * Used a synced dual localStorage and cookie storage to store transaction IDs.
 * 
 * @param payload - The payload object to be modified.
 * @param storeName - The storage type to be used. Defaults to 'cookie'.
 * @returns The modified payload object.
 */
const preventDuplicateTransactionsTask = function (
    payload: RequestPayload,
    storeName: string = '__ad_trans_dedup'
): RequestPayload {
    // Check if it's a purchase event
    if (payload.en === "purchase") {
        const transactionId: string = payload["ep.transaction_id"];
        let alreadyTrackedTransactions: string[] = [];

        const storedValue = storageHelper.get(storeName);
        if (storedValue) {
            try {
                alreadyTrackedTransactions = JSON.parse(storedValue) as string[];
            } catch (error) {
                console.error("Failed to parse stored transactions:", error);
                alreadyTrackedTransactions = [];
            }
        }

        // Check for duplicate transactions
        if (!alreadyTrackedTransactions.includes(transactionId)) {
            alreadyTrackedTransactions.push(transactionId);
            storageHelper.set(storeName, JSON.stringify(alreadyTrackedTransactions));
        } else {
            // We add a __skip flag to skip this request
            payload.__skip = true;
        }
    }

    // Return the modified payload object
    return payload;
};

export default preventDuplicateTransactionsTask;