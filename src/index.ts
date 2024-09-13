let interceptors: Interceptor[] = [];

// Check if the URL belongs to GA4
function isGA4Hit(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const params = new URLSearchParams(urlObj.search);

        const tid = params.get('tid');
        const cid = params.get('cid');
        const v = params.get('v');

        return !!tid && tid.startsWith('G-') && !!cid && v === '2';
    } catch (e) {
        console.error('Error parsing URL:', e);
        return false;
    }
}

// Interceptor function to handle fetch requests and responses
function interceptor(fetch: typeof window.fetch, args: FetchArgs): Promise<Response> {
    const reversedInterceptors = interceptors.reduce<Interceptor[]>(
        (array, interceptor) => [interceptor].concat(array),
        []
    );

    let promise: Promise<FetchArgs> = Promise.resolve(args);

    // Apply request interceptors (resolve to FetchArgs)
    reversedInterceptors.forEach(({ request, requestError }) => {
        if (request || requestError) {
            promise = promise.then(
                args => (request ? request(...args) : args),
                requestError
            );
        }
    });

    // Proceed with the original fetch call (resolve to Response)
    let responsePromise: Promise<Response> = promise.then(args => fetch(args[0], args[1]));

    // Apply response interceptors (resolve to Response)
    reversedInterceptors.forEach(({ response, responseError }) => {
        if (response || responseError) {
            responsePromise = responsePromise.then(response, responseError);
        }
    });

    return responsePromise;
}

interface GA4CustomTaskSettings {
    allowedMeasurementIds?: string[];
    tasks?: ((ga4RequestModel: any) => any)[];
}

interface GA4RequestModel {
    endpoint: string;
    sharedPayload: { [key: string]: any } | null;
    events: { [key: string]: any }[];
}

const GA4CustomTask = function (settings: GA4CustomTaskSettings) {
    if (!settings) return;

    interceptors.push({
        request: function (resource: RequestInfo, options: RequestInit = {}) {
            try {
                if (typeof resource === 'string' && isGA4Hit(resource)) {
                    const url = new URL(resource);
                    let ga4RequestModel: GA4RequestModel = {
                        endpoint: url.origin + url.pathname,
                        sharedPayload: null,
                        events: [],
                    };

                    const payloadArray = Array.from(new URLSearchParams(url.search).entries());

                    if (!options.body) {
                        ga4RequestModel.sharedPayload = Object.fromEntries(
                            payloadArray.slice(0, payloadArray.findIndex(([key]) => key === 'en'))
                        );
                        ga4RequestModel.events = [
                            Object.fromEntries(payloadArray.slice(payloadArray.findIndex(([key]) => key === 'en')))
                        ];
                    } else {
                        ga4RequestModel.sharedPayload = Object.fromEntries(payloadArray);
                        ga4RequestModel.events = (options.body as string)
                            .split('\r\n')
                            .map(e => Object.fromEntries(new URLSearchParams(e).entries()));
                    }

                    const payload = Object.fromEntries(new URLSearchParams(url.search));

                    if (
                        settings.allowedMeasurementIds &&
                        Array.isArray(settings.allowedMeasurementIds) &&
                        !settings.allowedMeasurementIds.includes(payload['tid'])
                    ) {
                        return [resource, options] as FetchArgs;
                    }

                    if (Array.isArray(settings.tasks)) {
                        settings.tasks.forEach(callback => {
                            if (typeof callback === 'function') {
                                ga4RequestModel = callback.call({ originalFetch: GA4CustomTask.originalFetch }, ga4RequestModel);
                            } else {
                                console.warn('Callback is not a function:', callback);
                            }
                        });
                    }

                    const reBuildResource = (model: GA4RequestModel) => {
                        const resourceString = new URLSearchParams(model.sharedPayload || {}).toString();
                        const bodyString = model.events.map(e => new URLSearchParams(e).toString()).join('\r\n');
                        return {
                            endpoint: model.endpoint,
                            resource: resourceString,
                            body: bodyString,
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
            console.log("ASDASD", [resource, options])
            return [resource, options] as FetchArgs;
        },
        response: function (response: Response) {
            // Here, you can handle the response, inspect the status code, or modify the response if needed
            console.log("RESPONSE", response);
            // Return the response for further processing
            return response;
        },
        responseError: function (error: any) {
            return Promise.reject(error);
        },
    });

    // Ensure fetch is available in the environment
    window.fetch = (function (fetch: typeof window.fetch) {
        return function (resource: RequestInfo | URL, options?: RequestInit) {
            const fetchArgs: FetchArgs = [resource, options];
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
export default GA4CustomTask