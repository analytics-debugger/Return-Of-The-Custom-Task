![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# LogRequestToConsole Task

This task will print the current request state to the console. Useful for debugging pourposes.
  
# Parameters
 This task doesn't accept any parameters.
 
# Usage

> You can grab the code for this task from dist/tasks/ folder

```var logRequestsToConsoleTask = () => {...}```


Then we pass it back as a task.

```
var GA4CustomTaskInstance = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
  logRequestsToConsoleTask
 ]
});
```
