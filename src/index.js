class GA4CustomTask {
    constructor(settings) {
        if (!settings || !settings.tasks) {
            throw new Error('Invalid settings: tasks are required');
        }

        this.settings = settings;        
        this.originalFetch = window.fetch;

        // Initialize the fetch interceptor
        this.initialize();
    }

    initialize() {
        // Check if fetch is native and not already modified
        if (this.originalFetch && this.originalFetch.toString().includes('native code')) {
            // Replace the fetch method with our interceptor
            window.fetch = this.interceptFetch.bind(this);
        }
    }

    async interceptFetch(...args) {
        const [resource,options] = args;
        const containsId = (stackTrace, id) => new RegExp(`id=${id}`,'i').test(stackTrace);
        let gtagOrigin = false;
        const isGA4Hit = (url) => {
          try {
            const urlObj = new URL(url);
            const params = new URLSearchParams(urlObj.search);
        
            const tid = params.get('tid');
            const cid = params.get('cid');
            const en = params.get('en');
            const v = params.get('v');
        
            // Check if 'tid' starts with 'G-', 'cid' is present, 'en' is present, and 'v' is 2
            return tid && tid.startsWith('G-') &&
                   cid !== null &&
                   en !== null &&
                   v === '2';
          } catch (e) {
            return false;
          }
        };
       /* try {
            throw new Error();
            // Generate a stack trace
        } catch (e) {
            gtagOrigin = containsId(e.stack || 'No stack trace available', 'G-CTN8S7LV5J')
        }
        */

        try {
            if (resource && isGA4Hit(resource)) {
      
                const url = new URL(resource);
                let payload = Object.fromEntries(new URLSearchParams(url.search));            
                if (this.settings.allowedMeasurementIds && Array.isArray(this.settings.allowedMeasurementIds) && !this.settings.allowedMeasurementIds.includes(payload.tid)) {
                    // Its a GA4 hit but it's not enabled
                    return this.originalFetch.apply(window, args);    
                }
                if (this.settings.tasks && Array.isArray(this.settings.tasks)) {
                    for (const callback of this.settings.tasks) {
                        if (typeof callback === 'function') {
                            payload = callback(payload);
                        } else {
                            console.warn('Callback is not a function:', callback);
                        }
                    }
                }

                // Reconstruct the URL with the modified payload
                const newUrl = new URL(url);
                newUrl.search = new URLSearchParams(payload).toString();

                // Update the resource argument with the modified URL
                args[0] = newUrl.toString();
            }
        } catch (e) {
            console.error('Error in fetch interceptor:', e);
        }

        // Call the original fetch with the correct context and arguments
        return this.originalFetch.apply(window, args);
    }
}

export default GA4CustomTask;