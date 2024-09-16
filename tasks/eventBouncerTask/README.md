
![ReturnoftheCustomTask](https://github.com/user-attachments/assets/92f0b278-1d0e-4d62-a289-2ac203eefc25)

  

# attributionTracking Task
This task will take care of calculating the current session attribution value and attaching it
to all events, in the specified event parameter. 

Also it will keep a tracked of the adquisition compaign details ( the first one detected ) and the next sessions one being the last one the current. Meaning that you could pass to any parameter the last *n* campaign details info

The following interface is used to save the campaigns details:
```
interface  CampaignDetails  {
	medium:  string;
	source:  string;
	campaign:  string;
	content:  string;
	term:  string;
	id:  string;
	gclid:  string;
	timestamp:  number;
}
```
For example let's say that we have an user that has been in our site 3 times
1. coming from Google
2. coming from Direct
3. coming from a tagged campaign
4. from a Google Ad

The cookie value will contain the following data;
```
[{
	medium:  'organic',
	source:  'google.com',
	campaign:  '(organic)',
	term:  '(not provided)',
    timestamp:  1726530127
},{
	medium:  '(none)',
	source:  '(direct)',
	campaign:  '(direct)',
	timestamp:  1726530128
},{
	medium:  'mail',
	source:  'transactional',
	campaign:  'recover_password',
	timestamp:  1726530129
},{
	medium:  'cpc',
	source:  'google',
	campaign:  'autotagged ad campaign',
	timestamp:  1726530130
}]
```
First entry would be the adquisition details, last one the current session details, the other ones would be the assisting adquisition details. 

*** WIP *** Templating system to allow users to pass the data in the 

# Parameters

This takes 2 parameters;
**ignoredReferrers[]:** The list of domains to be ignored as referrers
**historyCount:** The total of attributions to save, by default 2 ( Max 5 )
**lastNonDirect:** false


# Usage

 

> You can grab the code for this task from dist/tasks/ folder
 

```var attributionTracking  = () => {...}```
 
  

Then we pass it back as a task.

  
```
var GA4CustomTaskInstance = new GA4CustomTask({
	allowedMeasurementIds: ["G-DEBUGEMALL"],
	tasks: [
		(request) => attributionTracking(requestModel, ["paypal.com"]),	
	]
});
```