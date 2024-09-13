![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# sendToSecondaryMeasurementId Task

This task will send a duplicate hit to the defined alternative Measurement Ids

# Usage

## Task Code

```var sendToSecondaryMeasurementIdTask = (...) => {...}```
> You can grab the code for this task from dist/tasks/ folder

## Code Example

```
var GA4CustomTaskInstance = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
  (requestModel) => sendToSecondaryMeasurementIdTask(requestModel, ["G-SECONDID"], [], []), 
 ]
});
```

### Parameters
  
```sendToSecondaryMeasurementIdTask(requestModel, toMeasurementIds)```
|Parameter|Type|Description|
|--|--|--|
|toMeasurementIds|string[]|The array of measurement that will be getting a copy|
|whiteListedEvents|string[]|List of event names that will be replicated to the accounts, not defining this value or it being an empty array will mean all will be send|
|blackListedEvents|string[]|In case ```whiteListedEvents``` is not defined, or holding an empty array, will these events to be removed from payloads before sending a copy|

