
![image](https://github.com/user-attachments/assets/85f977fd-8269-471c-b41f-e0b93a14382d)

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
const ga4CustomTaskInterceptor = new GA4CustomTask({
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

# Available Tasks List

||Task Name|Description|
|-|------------|--|
|#1|logRequestsToConsoleTask|Logs all requests to the console, for debugging pourposes
|#2|mapClientIdTask|Grabs the clientId (&cid) and attaches the value to the specified parameter
|#3|mapPayloadSizeTask|Attaches the current payload size to the specified parameter
|#4|preventDuplicateTransactionsTask|Prevents Duplicate Purchases/transaations keeping a list of transactions on the cookies/localStorage
|#5|snowPlowStreamingTask|Sends a copy of the payload to your SnowPlow Collector
|#6|sendToSecondaryMeasurementId|Sends a copy of the payload to a secondary account
|#7|piiScrubberTask|Loops all data in the payload redacting the PII Data
|#8|privacySweepTask|Cleans Up all non "Analytics" related parameters/ids

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

var mapClientIdTask = () => {...} // Copy from dist folder
const ga4CustomTaskInterceptor = new GA4CustomTask({
    allowedMeasurementIds: ["G-DEBUGEMALL"],
    tasks: [
        (payload) => mapClientIdTask(payload, 'client_id')
    ]
});
```

## Stacking / Chaining Task
You may add as many tasks as you want, but remember they will be execute secuencially, so apply them wisely.

# Support
Donations Accepted