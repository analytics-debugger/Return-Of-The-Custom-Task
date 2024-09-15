(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.GA4CustomTask = factory());
})(this, (function () { 'use strict';

    // Check if the URL belongs to GA4
    function isGA4Hit(url) {
        try {
            var urlObj = new URL(url);
            var params = new URLSearchParams(urlObj.search);
            var tid = params.get('tid');
            var cid = params.get('cid');
            var v = params.get('v');
            return !!tid && tid.startsWith('G-') && !!cid && v === '2';
        }
        catch (e) {
            console.error('Error parsing URL:', e);
            return false;
        }
    }

    var interceptors = [];
    // Interceptor function to handle fetch requests and responses
    function interceptor(fetch, args) {
        var reversedInterceptors = interceptors.reduce(function (array, interceptor) { return [interceptor].concat(array); }, []);
        var promise = Promise.resolve(args);
        // Apply request interceptors (resolve to FetchArgs)
        reversedInterceptors.forEach(function (_a) {
            var request = _a.request, requestError = _a.requestError;
            if (request || requestError) {
                promise = promise.then(function (args) { return (request ? request.apply(void 0, args) : args); }, requestError);
            }
        });
        // Proceed with the original fetch call (resolve to Response)
        var responsePromise = promise.then(function (args) { return fetch(args[0], args[1]); });
        // Apply response interceptors (resolve to Response)
        reversedInterceptors.forEach(function (_a) {
            var response = _a.response, responseError = _a.responseError;
            if (response || responseError) {
                responsePromise = responsePromise.then(response, responseError);
            }
        });
        return responsePromise;
    }
    var GA4CustomTask = function (settings) {
        if (!settings)
            return;
        interceptors.push({
            request: function (resource, options) {
                if (options === void 0) { options = {}; }
                try {
                    if (typeof resource === 'string' && isGA4Hit(resource)) {
                        var url = new URL(resource);
                        var RequestModel_1 = {
                            endpoint: url.origin + url.pathname,
                            sharedPayload: {},
                            events: [],
                        };
                        var payloadArray = Array.from(new URLSearchParams(url.search).entries());
                        if (!options.body) {
                            RequestModel_1.sharedPayload = Object.fromEntries(payloadArray.slice(0, payloadArray.findIndex(function (_a) {
                                var key = _a[0];
                                return key === 'en';
                            })));
                            RequestModel_1.events = [
                                Object.fromEntries(payloadArray.slice(payloadArray.findIndex(function (_a) {
                                    var key = _a[0];
                                    return key === 'en';
                                })))
                            ];
                        }
                        else {
                            RequestModel_1.sharedPayload = Object.fromEntries(payloadArray);
                            RequestModel_1.events = options.body
                                .split('\r\n')
                                .map(function (e) { return Object.fromEntries(new URLSearchParams(e).entries()); });
                        }
                        var payload = Object.fromEntries(new URLSearchParams(url.search));
                        if (settings.allowedMeasurementIds &&
                            Array.isArray(settings.allowedMeasurementIds) &&
                            !settings.allowedMeasurementIds.includes(payload['tid'])) {
                            return [resource, options];
                        }
                        if (Array.isArray(settings.tasks)) {
                            settings.tasks.forEach(function (callback) {
                                if (typeof callback === 'function') {
                                    RequestModel_1 = callback.call({ originalFetch: GA4CustomTask.originalFetch }, RequestModel_1);
                                }
                                else {
                                    console.warn('Callback is not a function:', callback);
                                }
                            });
                        }
                        var reBuildResource = function (model) {
                            var resourceString = new URLSearchParams(model.sharedPayload || {}).toString();
                            var bodyString = model.events.map(function (e) { return new URLSearchParams(e).toString(); }).join('\r\n');
                            return {
                                endpoint: model.endpoint,
                                resource: resourceString,
                                body: bodyString,
                            };
                        };
                        var newResource = reBuildResource(RequestModel_1);
                        if (options.body) {
                            resource = "".concat(newResource.endpoint, "?").concat(newResource.resource);
                            options.body = newResource.body;
                        }
                        else {
                            resource = "".concat(newResource.endpoint, "?").concat(newResource.resource, "&").concat(newResource.body);
                        }
                    }
                }
                catch (e) {
                    console.error('Error in fetch interceptor:', e);
                }
                return [resource, options];
            },
            response: function (response) {
                return response;
            },
            responseError: function (error) {
                return Promise.reject(error);
            },
        });
        // Ensure fetch is available in the environment
        window.fetch = (function (fetch) {
            return function (resource, options) {
                var fetchArgs = [resource, options];
                return interceptor(fetch, fetchArgs);
            };
        })(window.fetch);
        return {
            clear: function () {
                interceptors = [];
            },
        };
    };
    // Add original fetch for TypeScript type safety
    GA4CustomTask.originalFetch = window.fetch;

    return GA4CustomTask;

}));
