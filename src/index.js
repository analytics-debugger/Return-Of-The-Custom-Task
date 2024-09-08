function GA4CustomTask(settings) {
  if (!settings || !settings.tasks) {
    throw new Error("Invalid settings: tasks are required");
  }

  this.settings = settings;
  this.originalFetch = window.fetch;

  // Initialize the fetch interceptor
  this.initialize();
}

// Add the initialize method to GA4CustomTask's prototype
GA4CustomTask.prototype.initialize = function() {
  // Check if fetch is native and not already modified
  if (this.originalFetch && this.originalFetch.toString().includes("native code")) {
    // Replace the fetch method with our interceptor
    window.fetch = this.interceptFetch.bind(this);
  }
};

// Add the interceptFetch method to GA4CustomTask's prototype
GA4CustomTask.prototype.interceptFetch = function() {
  const _this = this;
  const args = arguments;
  const resource = args[0];
  const options = args[1];

  const containsId = function(stackTrace, id) {
    return new RegExp("id=" + id, "i").test(stackTrace);
  };

  const isGA4Hit = (url) => {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);

      const tid = params.get("tid");
      const cid = params.get("cid");
      const v = params.get("v");

      return tid && tid.startsWith("G-") &&
                cid !== null &&
                v === "2";
    } catch (e) {
      return false;
    }
  };


  try {
    if (resource && isGA4Hit(resource)) {
      const url = new URL(resource);
      let ga4RequestModel = {
        endpoint: url.origin + url.pathname,
        sharedPayload: null,
        events: []
      };

      // Build and array to be sure we keep the order of the parameters
      const payloadArray = Array.from(new URLSearchParams(url.search).entries());
      // GA4 is not as straightforward as UA, we have 2 types of hits
      // those who contains 1 event and those who contains multiple events
      // We'll build a requestModel to handle both cases in the same way.
      // sharedModel will contain the shared part of the payload
      // events will hold and array of the events.

      if(!options.body){
        ga4RequestModel.sharedPayload = Object.fromEntries(new URLSearchParams(Array.from(new URLSearchParams(payloadArray.slice(0, payloadArray.findIndex( ([key]) => key === "en"))).entries())));
        ga4RequestModel.events = [Object.fromEntries(new URLSearchParams(Array.from(new URLSearchParams(payloadArray.slice(payloadArray.findIndex( ([key]) => key === "en"))).entries())))];    
      }else{
        ga4RequestModel.sharedPayload = Object.fromEntries(new URLSearchParams(Array.from(new URLSearchParams(payloadArray).entries()))),        
        ga4RequestModel.events = options.body.split("\r\n").map(e=> Object.fromEntries(new URLSearchParams(Array.from(new URLSearchParams(e).entries())))); 
      }
	    console.log(ga4RequestModel);
      let payload = Object.fromEntries(new URLSearchParams(url.search));

      if (this.settings.allowedMeasurementIds && Array.isArray(this.settings.allowedMeasurementIds) && !this.settings.allowedMeasurementIds.includes(payload.tid)) {
        // It's a GA4 hit but it's not enabled
        return window.fetch.apply(window, args);
      }

      if (this.settings.tasks && Array.isArray(this.settings.tasks)) {
        for (let i = 0; i < this.settings.tasks.length; i++) {
          const callback = this.settings.tasks[i];
          if (typeof callback === "function") {
            ga4RequestModel = callback(ga4RequestModel);
          } else {
            console.warn("Callback is not a function:", callback);
          }
        }
      }

      // We are done with the tasks, let's rebuild the resource
      const reBuildResource = (model) => {
        const resource = new URLSearchParams(Object.entries(model.sharedPayload)).toString();
        const body = model.events.map(e=> new URLSearchParams(Object.entries(e)).toString()).join("\r\n");
        const endpoint = model.endpoint;
        return {
   		    endpoint,
          resource,
          body
        };
      };
      // Reconstruct the URL with the modified payload
      const newResource = reBuildResource(ga4RequestModel);

      if(args[1].body){
 	        args[0] = [newResource.endpoint, newResource.resource].join("?");
        args[1].body = newResource.body;
      }else{
	        args[0] = [newResource.endpoint, newResource.resource + "&" + newResource.body].join("?");
      }           
    }
  } catch (e) {
    console.error("Error in fetch interceptor:", e);
  }

  // Call the original fetch with the correct context and arguments
  return _this.originalFetch.apply(window, args);
};

export default GA4CustomTask;
