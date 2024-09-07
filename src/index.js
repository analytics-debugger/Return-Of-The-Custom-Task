function GA4CustomTask(settings) {
    if (!settings || !settings.tasks) {
        throw new Error('Invalid settings: tasks are required');
    }

    this.settings = settings;
    this.originalFetch = window.fetch;

    // Initialize the fetch interceptor
    this.initialize();
}

// Add the initialize method to GA4CustomTask's prototype
GA4CustomTask.prototype.initialize = function() {
    // Check if fetch is native and not already modified
    if (this.originalFetch && this.originalFetch.toString().includes('native code')) {
        // Replace the fetch method with our interceptor
        window.fetch = this.interceptFetch.bind(this);
    }
};

// Add the interceptFetch method to GA4CustomTask's prototype
// Add the interceptFetch method to GA4CustomTask's prototype
GA4CustomTask.prototype.interceptFetch = function() {
    var _this = this;
    var args = arguments;
    var resource = args[0];
    var options = args[1];

    var containsId = function(stackTrace, id) {
        return new RegExp('id=' + id, 'i').test(stackTrace);
    };

    var isGA4Hit = function(url) {
        try {
            var urlObj = document.createElement('a');
            urlObj.href = url;
            var params = urlObj.search.substring(1).split('&');
            var query = {};
            for (var i = 0; i < params.length; i++) {
                var pair = params[i].split('=');
                query[pair[0]] = decodeURIComponent(pair[1]);
            }

            var tid = query['tid'];
            var cid = query['cid'];
            var en = query['en'];
            var v = query['v'];

            return tid && tid.indexOf('G-') === 0 &&
                cid !== undefined &&
                en !== undefined &&
                v === '2';
        } catch (e) {
            return false;
        }
    };

    if (resource && isGA4Hit(resource)) {
        var url = document.createElement('a');
        url.href = resource;
        var payload = {};
        var params = url.search.substring(1).split('&');
        for (var i = 0; i < params.length; i++) {
            var pair = params[i].split('=');
            payload[pair[0]] = decodeURIComponent(pair[1]);
        }

        if (_this.settings.allowedMeasurementIds && Array.isArray(_this.settings.allowedMeasurementIds) &&
            _this.settings.allowedMeasurementIds.indexOf(payload.tid) === -1) {
            // It's a GA4 hit but it's not enabled
            return _this.originalFetch.apply(window, args);
        }

        if (_this.settings.tasks && Array.isArray(_this.settings.tasks)) {
            for (var j = 0; j < _this.settings.tasks.length; j++) {
                var callback = _this.settings.tasks[j];
                if (typeof callback === 'function') {
                    payload = callback(payload);
                } else {
                    console.warn('Callback is not a function:', callback);
                }
            }
        }

        // Reconstruct the URL with the modified payload
        var newUrl = document.createElement('a');
        newUrl.href = resource;
        newUrl.search = new URLSearchParams(payload).toString();

        // Update the resource argument with the modified URL
        args[0] = newUrl.href;
    }

    // Call the original fetch with the correct context and arguments
    return _this.originalFetch.apply(window, args);
};


export default GA4CustomTask;
