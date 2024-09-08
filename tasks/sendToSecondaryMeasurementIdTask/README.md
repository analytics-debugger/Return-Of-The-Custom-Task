![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# privacySweep Task

This task removes any parameters that aren't directly related to Analytics, such as IDs other than the clientId or any other values that aren't relevant to Google Analytics 4.

## Current cleaned up parameters

| Key            |
|----------------|
| ecid           |
| ur             |
| are            |
| frm            |
| pscdl          |
| tfd            |
| tag_exp        |
| dma            |
| dma_cps        |
| gcd            |
| gcs            |
| gsu            |
| gcut           |
| gcid           |
| gclsrc         |
| gclid          |
| gaz            |
| us_privacy     |
| gdpr           |
| gdpr_consent   |
| us_privacy     |
| _geo           |
| _rdi           |
| _uie           |
| _uc            |

# Usage

## Task Code

```var privacySweepTask = (...) => {...}```
> You can grab the code for this task from dist/tasks/ folder

## Code Example

```
var CustomTaskIntercept = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
  privacySweepTask 
 ]
});
```

### Parameters

No parameters accepted
