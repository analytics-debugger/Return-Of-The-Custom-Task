
![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# mapPayloadSize Task

This task calculates the current payload size ( ```queryString``` + ```body post``` ) and maps it back to the event.
You may want to attach this value only to the an specific event names, you can pass the events list array at the end (for example for only reporting this value for ecommerce events )

# Usage
## Task Code

```var mapClienmapPayloadSizetIdTask = (...) => {...}```
> You can grab the code for this task from dist/tasks/ folder

## Code Example
```
var GA4CustomTaskInstance = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
  (requestModel) => mapPayloadSize(requestModel, 'payload_size',  ['add_to_cart','purchase']), 
 ]
});
```


### Parameters

```mapPayloadSize(requestModel, '{{NAME}}' ,[{{EVENTS_LIST}}])```
|Parameter|Type|Description|
|--|--|--|
|name|string|The event parameter name to be used|
|eventsList|Array[string]|Takes an array of events that will get the size attached to|
