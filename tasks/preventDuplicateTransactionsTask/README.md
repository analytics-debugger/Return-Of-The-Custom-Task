
![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# preventDuplicateTransactions Task

This task will take the current purchase event transaction_id and save it into the current browser storage. If there's a subsecuente
purchase event with the same ```transaction_id``` the purchase event will be removed from the payload.

This tasks relays on cookies and localStorage to keep track of the transactions. Also it keeps both storages synched, meaning that if 
the user clears it's cookies localStarage will be read and cookie will be recovered.

Since a request may contain more than one purcahse event, instead of blocking the hit, individual purchase events are 
removed from the payload.

# Usage
## Task Code

```var preventDuplicateTransactions = (...) => {...}```
> You can grab the code for this task from dist/tasks/ folder

## Code Example
```
var CustomTaskIntercept = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
  (requestModel) => preventDuplicateTransactions(requestModel, '__transaction_cookie'), 
 ]
});
```

### Parameters
  
```preventDuplicateTransactions(requestModel, '{{storeName}}')```
|Parameter|Type|Description|
|--|--|--|
|storeName|string|The cookie name / localStorage name to be used to keep track of transactions, ```__ad_trans_dedup``` is used by default|
