![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

# eventBouncer Task

This task acts like the bouncer of your GA4 party – no uninvited events get through the door! 🎉 It’s got eagle eyes for any sneaky, unexpected parameters trying to tag along with your events,
and they’ll get turned away at the gate too. 🚫 No shady events here – only the VIP events make it in! 😎
  
# Parameters

 This task takes a schema of the events definition:
 The ```sharedEventParameters``` Array will hold a list of the parameters that may be included on any event. ( This way we don't need to defined them on each of the events )
 The ```events``` Object, holds the event guest list, any event coming through that is not on this list will be removed from the payload. We can defined also the ```wlep``` ( White Listed Event Parameters ) , which
 will check the enabled parameters for the current event. If the current event has a parameter that is not on the ```wlep``` or it's defined from the sharedEventParameters it will be removed from the event data.



 ```eventBouncerTask(requestModel, {{allowedEventsSchema}})```

|Parameter|Type|Description|
|--|--|--|
|allowedEventsSchema|object||

# allowedEvents Schema

```
{    
    "sharedEventParameters": ["page_type"],
    "events": {
        "page_view": {
            "wlep": []
        },
        "add_to_cart": {
            "wlep": []
        }
    } 
}
```

# Usage

> You can grab the code for this task from dist/tasks/ folder

```var eventBouncerTask = () => {...}```

Then we pass it back as a task.

```
var GA4CustomTaskInstance = new GA4CustomTask({
 allowedMeasurementIds: ["G-DEBUGEMALL"],
 tasks: [
    (request) => eventBouncerTask(requestModel, {{allowedEventsSchema}}),    
 ]
});
```
