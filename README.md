![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)


# Return-Of-The-Custom-Task

Leveraging Fetch Inteceptors to replicate the old friend Custom Task :)

# Why

One of the best additions to Universal Analytics in the past was the Tasks, more specifically the customTask that allowed us to modify the hits payloads before they
were sent to the endpoint.

In April 2024, Google Switched the use of sendBeacon to the fetch API. ( not a breaking change since sendBeacon seems to work on top of Fetch ), and along with the chance
of reading the response from the requests, it allows to intercept the requests and modify the data before it gets send. Which is you read it right it's the same as the
customTask used to work like.

That's why I build a Fetch Interceptor that will allow you to apply custom functions to your payloads, for example for automatically adding the clientId as a event parameter
or user property, sending a duplicate hit to a secondary account or preventing the duplicate transactions.

The current features are:

- Grab the current Payload and perform any action over it before it gets sent
- Allows callbacks concatenations
- Measurement ID based setup ( apply the callbacks only to the defined hits )

Not only this, I tool some time to port and improve all the customTask I was able to find around on internet so you can just use them on your setup.

# How to Use It

One we have loaded the GA4CustomTask.js code we need to instanciate our Tasker:

```
var ga4CustomTaskInterceptor = new GA4CustomTask({
    allowedMeasurementIds: ["G-DEBUGEMALL"],
    tasks: [
        logRequestsToConsoleTask,
        task2,
        task3
    ]
});
```

Since this is shared between all instances in your pages, you need to specify at least one allowedMeasurementIds, this way only these requests will be
intercepted.

Also, if there's no tasks nothing will be intercepted.

# Building your own Task
You can create your own custom tasks. By default, the library provides a `RequestModel` interface, which includes `sharedPayload` and `events` in object format. The library handles:

- Parsing the request type (GET/POST)
- Managing multiple events
- Constructing the final fetch request for your convenience


```
interface RequestModel {
  endpoint: string;
  sharedPayload: { [key: string]: any }; // No need for null in the type
  events: { [key: string]: any }[];
  __skip?: boolean;
}

```

```
const myCustomTask = (request: RequestModel): RequestModel => {
  // Your Code
  return request;
};
```

The task expects you to return the RequestModel back. 
This is a very simple example that just logs the requests

```
var mySimpleCustomTask = (request) => {
    console.log("NEW GA4 REQUEST", request);
    return request;
}
```

If you need to pass parameters

```
const myCustomTaskWithParams = (request: RequestModel, name: string): RequestModel => {
  // your logic
  return request;
};
```

```
var GA4CustomTaskInstance = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
  (requestModel) => myCustomTaskWithParams(requestModel, 'myNameParamValue'), 
 ]
});
```


Original Fetch object is available at ```GA4CustomTask.originalFetch``` for your convenience.
You can take a look to tasks folder to see more examples.

# Available Tasks List

||Task Name|Description|
|-|------------|--|
|#1|[logRequestsToConsoleTask](tasks/logRequestsToConsoleTask)|Logs all requests to the console, for debugging pourposes
|#2|[mapClientIdTask](tasks/mapClientIdTask)|Grabs the clientId (&cid) and attaches the value to the specified parameter
|#3|[mapPayloadSizeTask](tasks/mapPayloadSizeTask)|Attaches the current payload size to the specified parameter
|#4|[preventDuplicateTransactionsTask](tasks/preventDuplicateTransactionsTask)|Prevents Duplicate Purchases/transaations keeping a list of transactions on the cookies/localStorage
|#5|[snowPlowStreamingTask](tasks/snowPlowStreamingTask)|Sends a copy of the payload to your SnowPlow Collector
|#6|[sendToSecondaryMeasurementId](tasks/logRequestssendToSecondaryMeasurementIdoConsoleTask)|Sends a copy of the payload to a secondary account
|#7|[piiScrubberTask](tasks/piiScrubberTask)|Loops all data in the payload redacting the PII Data
|#8|[privacySweepTask](tasks/privacySweepTask)|Cleans Up all non "Analytics" related parameters/ids

## Adding / Loading Tasks
We provide several ready to use tasks, you'll find them within the dist/tasks folder, they are offered in normal and minified version. 

### Adding a Task that doens't need parameters
```

var logRequestsToConsoleTask = () => {...} // Copy from dist folder
const ga4CustomTaskInterceptor = new GA4CustomTask({
    allowedMeasurementIds: ["G-DEBUGEMALL"],
    tasks: [
        logRequestsToConsoleTask,
    ]
});
```

### Adding a Task that used
Some tasks may require parameters, In that case we'll need to pass the paremter this way

```
const mapClientIdTask = () => {...} // Copy from dist folder
const ga4CustomTaskInterceptor = new GA4CustomTask({
    allowedMeasurementIds: ["G-DEBUGEMALL"],
    tasks: [
        (request) => mapClientIdTask(request, 'client_id')
    ]
});
```
In GTM we woh't be able to use arrow functions or const 
```
var mapClientIdTask = function(payload, clientId) {
    // Function body copied from dist folder
};
var ga4CustomTaskInterceptor = new GA4CustomTask({
    allowedMeasurementIds: ["G-DEBUGEMALL"],
    tasks: [
        function(request) {
            return mapClientIdTask(request, 'client_id');
        }
    ]
});

```

## Stacking / Chaining Tasks
You may add as many tasks as you want, but remember they will be execute secuencially, so apply them wisely.

# The Request Model
Working with Google Analytics 4 (GA4) is more complex than with Universal Analytics, mainly because a GA4 request can contain multiple events. This makes it impossible to work with just a single payload. To simplify things, this library automatically splits and parses the request for you. It takes the current GA4 request and builds a `requestModel`, which includes the shared payload and the event details.

You don’t need to worry about parsing the request. If the request doesn’t have a body, the library will handle splitting the main payload and return a single event.

```json
requestModel: {
    sharedPayload: {},
    events: [{}, {}]
}
```

# Support
Donations Accepted

