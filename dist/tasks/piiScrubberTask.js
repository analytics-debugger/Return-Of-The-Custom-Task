var piiScrubberTask = (function () {
    'use strict';

    /**
     * Scrubs PII from the request payload.
     *
     * @param request - The request model to be modified.
     * @param queryParamsBlackList - Array of parameters to be removed (From URL-like values).
     * @param scrubPatternsList - Array of patterns (regex) to match and scrub, defaults to email.
     * @param callback - Function to be called after scrubbing with the list of scrubbed fields.
     * @param logScrubbing - Whether to log scrubbing details.
     * @returns The modified request model.
     */
    var piiScrubberTask = function (request, queryParamsBlackList, scrubPatternsList, callback, logScrubbing) {
        if (queryParamsBlackList === void 0) { queryParamsBlackList = []; }
        if (scrubPatternsList === void 0) { scrubPatternsList = []; }
        if (logScrubbing === void 0) { logScrubbing = false; }
        if (!request) {
            console.error('piiScrubberTask: Request is required.');
            return request;
        }
        var isUrlWithOptionalQuery = function (value) {
            return /^(?:[a-zA-Z][a-zA-Z\d+\-.]*:\/\/[^\s]*)(?:\?[^\s]*)?$/.test(value);
        };
        var blackListedQueryStringParameters = ['email', 'mail', 'name', 'surname'].concat(queryParamsBlackList).filter(Boolean);
        var defaultScrubPatterns = [{
                id: 'email',
                regex: /[a-zA-Z0-9-_.]+@[a-zA-Z0-9-_.]+/,
                replacement: '[email_redacted]'
            }];
        var scrubPatterns = defaultScrubPatterns.concat(scrubPatternsList).filter(Boolean);
        var scrubbedValues = {};
        var scrubbedFields = [];
        var scrubData = function (data, origin) {
            if (data === null) {
                console.warn("Skipping scrubbing for ".concat(origin, " as data is null"));
                return;
            }
            Object.entries(data).forEach(function (_a) {
                var key = _a[0], value = _a[1];
                scrubPatterns.forEach(function (_a) {
                    var id = _a.id, regex = _a.regex, replacement = _a.replacement;
                    if (typeof value === 'string' && regex.test(value)) {
                        scrubbedValues[key] = {
                            origin: origin,
                            rule: "matched pattern: ".concat(id),
                            original: value,
                            scrubbed: value.replace(regex, replacement)
                        };
                        data[key] = value.replace(regex, replacement);
                        scrubbedFields.push(key);
                    }
                });
                if (typeof value === 'string' && isUrlWithOptionalQuery(value)) {
                    try {
                        var url_1 = new URL(value);
                        var params_1 = new URLSearchParams(url_1.search);
                        // Process blacklisted parameters
                        blackListedQueryStringParameters.forEach(function (param) {
                            if (params_1.has(param)) {
                                params_1.set(param, 'parameter_removed');
                                scrubbedValues[key] = {
                                    origin: origin,
                                    rule: 'blacklisted parameter',
                                    original: value,
                                    scrubbed: url_1.toString()
                                };
                                scrubbedFields.push(param);
                            }
                        });
                        // Process query string values for scrub patterns
                        params_1.forEach(function (value, param) {
                            scrubPatterns.forEach(function (_a) {
                                var id = _a.id, regex = _a.regex, replacement = _a.replacement;
                                if (regex.test(value)) {
                                    var scrubbedValue = value.replace(regex, replacement);
                                    params_1.set(param, scrubbedValue);
                                    scrubbedValues[key] = {
                                        origin: origin,
                                        rule: "matched pattern: ".concat(id),
                                        original: url_1.toString(),
                                        scrubbed: scrubbedValue
                                    };
                                    scrubbedFields.push(param);
                                }
                            });
                        });
                        // Update the URL's search parameters and assign it to data
                        url_1.search = params_1.toString();
                        data[key] = url_1.toString();
                    }
                    catch (e) {
                        console.error('Invalid URL:', value, e);
                    }
                }
            });
        };
        // Scrub sharedPayload
        scrubData(request.sharedPayload, 'sharedPayload');
        // Scrub events
        request.events.forEach(function (event) { return scrubData(event, 'events'); });
        // Call the callback if it's a function
        if (callback && scrubbedFields.length > 0) {
            callback(scrubbedValues);
        }
        // Log scrubbing details if required
        if (logScrubbing && Object.keys(scrubbedValues).length > 0) {
            console.groupCollapsed('PII Scrubber: Scrubbed Data');
            console.log(scrubbedValues);
            console.groupEnd();
        }
        return request;
    };

    return piiScrubberTask;

})();
