![ReturnoftheCustomTask](https://github-production-user-asset-6210df.s3.amazonaws.com/1494564/364970922-92f0b278-1d0e-4d62-a289-2ac203eefc25.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20240907%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20240907T203954Z&X-Amz-Expires=300&X-Amz-Signature=a4d602457c7b07733eecb58255db5285f54c5b01d687377671ffae031eee9917&X-Amz-SignedHeaders=host&actor_id=1494564&key_id=0&repo_id=852888529)

# LogRequestToConsole Task
This task will print the current request state to the console. Useful for debugging pourposes.
  
# Usage

> You can grab the code for this task from dist/tasks/ folder

```var logRequestsToConsoleTask = () => {...}``` 

Then we pass it back as a task. This task doesn't accept any parameters.
```
var interceptCustomTask = new GA4CustomTask({
	allowedMeasurementIds: ["G-DEBUGEMALL"],
	tasks: [
		logRequestsToConsoleTask
	]
});
```