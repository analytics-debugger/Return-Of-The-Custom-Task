
![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# piiScrubberTask Task

This task will loop through all your request to find any PII

# Usage
## Task Code

```var piiScrubberTask = (...) => {...}```
> You can grab the code for this task from dist/tasks/ folder

## Code Example
```
var GA4CustomTaskInstance = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
   (requestModel) => piiScrubberTask(requestModel, [], null, true),
 ]
});
```


### Parameters

```mapClientIdTask(requestModel, '{{NAME}}', '{{SCOPE}}')```
|Parameter|Type|Description|
|--|--|--|
|queryParamsBlackList|[]string|List of parameters to be removed from URL Like values|
|callback|Function|You can pass a function and the current scrubbing will be passed back, you can use this for logging if any PII was found, that way if there's any Privacy issue you can take action|
|logScrubbing|boolean|Event or User. 'event' will be used by default|