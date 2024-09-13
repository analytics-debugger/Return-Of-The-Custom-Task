
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
   (requestModel) => piiScrubberTask(requestModel, [], [], null, true),
 ]
});
```

### Parameters

```piiScrubberTask(requestModel, '{{NAME}}', '{{SCOPE}}')```
|Parameter|Type|Description|
|--|--|--|
|queryParamsBlackList|[]string|List of parameters to be removed from URL Like values|
|scrubPatternsList|[]object|List of parameters to be removed from URL Like values|
|callback|Function|You can pass a function and the current scrubbing will be passed back, you can use this for logging if any PII was found, that way if there's any Privacy issue you can take action|
|logScrubbing|boolean|Event or User. 'event' will be used by default|

## Passing Custom Scrubbing Patters.
We can make the scrubber to search for some patterns over all the values in the payload, and replace the matches with the defined redact text.
The scrubber by default cleans up all the emails like texts it finds.

This is the current pattern defined:
```
{
  id: 'email',
  regex: /[a-zA-Z0-9-_.]+@[a-zA-Z0-9-_.]+/,
  replacement: '[email_redacted]'
}
```

If we want to add some new patterns we need pass an array that will have a main key for the pattern ID, and the the regex and the replacement text. 

For example setting up out scrubber as in the following example will scrub any UK Postal Code and any SSN Like string on the payload:

```
var GA4CustomTaskInstance = new GA4CustomTask({
    allowedMeasurementIds: ["G-DEBUGEMALL"],
    tasks: [
        (requestModel) => piiScrubberTask(requestModel, [], 
        [{
          id: 'ukpc',
          regex: /[A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2}/,
          replacement: '[uk_postal_code_redacted]'
        },
        {
          id: 'ssn',
          regex: /\b^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/,
          replacement: '[ssn_redacted]'
        }]
        , null, true),
    ]
});
```