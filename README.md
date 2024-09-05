
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

# Available Tasks List

||Task Name|Description|
|-|------------|--|
|#1|logRequestsToConsoleTask|Logs all requests to the console, for debugging pourposes