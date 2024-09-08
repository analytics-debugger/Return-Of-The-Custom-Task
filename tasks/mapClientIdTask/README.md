
![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# mapClientId Task

This task will read the current clientId ( ```&cid``` ) value from the request and map it back as an ```event parameter``` to all events in the payload.
In the other side if we set the scope as ```'user'``` it will ba attached just to the first event on the request as an ```user property```.

# Usage
## Task Code

```var mapClientIdTask = (...) => {...}```
> You can grab the code for this task from dist/tasks/ folder

## Code Example
```
var CustomTaskIntercept = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
  (requestModel) => mapClientIdTask(requestModel, 'client_id', 'event'), 
 ]
});
```


### Parameters

```mapClientIdTask(requestModel, '{{NAME}}', '{{SCOPE}}')```
|Parameter|Type|Description|
|--|--|--|
|name|string|It's the event-property or user parameter key that will be used|
|scope|string|Event or User. 'event' will be used by default|
