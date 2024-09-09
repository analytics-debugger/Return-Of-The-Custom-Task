function GA4CustomTask(settings) {
  if (!settings || !settings.tasks) {
    throw new Error('Invalid settings: tasks are required');
  }

  // Store originalFetch in a closure
  GA4CustomTask.originalFetch = window.fetch.bind(window);

  function initialize() {
    if (GA4CustomTask.originalFetch && GA4CustomTask.originalFetch.toString().includes('native code')) {
      // Bind interceptFetch to the correct context
      window.fetch = function(...args) {
        return interceptFetch.apply(null, args);
      };
    }
  }

  function interceptFetch(resource, options) {
    const isGA4Hit = (url) => {
      try {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);

        const tid = params.get('tid');
        const cid = params.get('cid');
        const v = params.get('v');

        return tid && tid.startsWith('G-') && cid && v === '2';
      } catch (e) {
        console.error('Error parsing URL:', e);
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

        const payloadArray = Array.from(new URLSearchParams(url.search).entries());

        if (!options.body) {
          ga4RequestModel.sharedPayload = Object.fromEntries(
            payloadArray.slice(0, payloadArray.findIndex(([key]) => key === 'en'))
          );
          ga4RequestModel.events = [
            Object.fromEntries(
              payloadArray.slice(payloadArray.findIndex(([key]) => key === 'en'))
            )
          ];
        } else {
          ga4RequestModel.sharedPayload = Object.fromEntries(payloadArray);
          ga4RequestModel.events = options.body.split('\r\n').map(e =>
            Object.fromEntries(new URLSearchParams(e).entries())
          );
        }

        const payload = Object.fromEntries(new URLSearchParams(url.search));

        if (settings.allowedMeasurementIds &&
            Array.isArray(settings.allowedMeasurementIds) &&
            !settings.allowedMeasurementIds.includes(payload.tid)) {
          return GA4CustomTask.originalFetch(resource, options);
        }

        if (Array.isArray(settings.tasks)) {
          settings.tasks.forEach(callback => {
            if (typeof callback === 'function') {
              // Bind `originalFetch` to the callback
              ga4RequestModel = callback.call({ originalFetch: GA4CustomTask.originalFetch }, ga4RequestModel);
            } else {
              console.warn('Callback is not a function:', callback);
            }
          });
        }

        const reBuildResource = (model) => {
          const resource = new URLSearchParams(model.sharedPayload).toString();
          const body = model.events.map(e =>
            new URLSearchParams(e).toString()
          ).join('\r\n');
          return {
            endpoint: model.endpoint,
            resource,
            body
          };
        };

        const newResource = reBuildResource(ga4RequestModel);

        if (options.body) {
          resource = `${newResource.endpoint}?${newResource.resource}`;
          options.body = newResource.body;
        } else {
          resource = `${newResource.endpoint}?${newResource.resource}&${newResource.body}`;
        }
      }
    } catch (e) {
      console.error('Error in fetch interceptor:', e);
    }

    return GA4CustomTask.originalFetch(resource, options);
  }

  initialize();
  return {
    settings
  };
}

export default GA4CustomTask;