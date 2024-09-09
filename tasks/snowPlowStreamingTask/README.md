
![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# snowPlowStreaming Task

This task will loop through all your request to find any PII

# Usage
## Task Code

```var snowPlowStreaming = (...) => {...}```
> You can grab the code for this task from dist/tasks/ folder

## Code Example
```
var GA4CustomTaskInstance = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
   (requestModel) => snowPlowStreaming(requestModel,  endpointHostname),
 ]
});
```


### Parameters

```snowPlowStreaming(requestModel, '{{endpointHostname}}')```
|Parameter|Type|Description|
|--|--|--|
|endpointHostname|string|myendpoint.dot.com|