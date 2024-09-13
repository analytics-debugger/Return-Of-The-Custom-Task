// src/tasks/piiScrubber.ts

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
const piiScrubberTask = (
  request: RequestModel,
  queryParamsBlackList: string[] = [],
  scrubPatternsList: ScrubPattern[] = [],
  callback?: (scrubbedValues: object) => void,
  logScrubbing: boolean = false
): RequestModel => {
  if (!request) {
    console.error('piiScrubberTask: Request is required.');
    return request;
  }

  const isUrlWithOptionalQuery = (value: string): boolean => {
    return /^(?:[a-zA-Z][a-zA-Z\d+\-.]*:\/\/[^\s]*)(?:\?[^\s]*)?$/.test(value);
  };

  const blackListedQueryStringParameters = ['email', 'mail', 'name', 'surname'].concat(queryParamsBlackList).filter(Boolean);
  const defaultScrubPatterns: ScrubPattern[] = [{
    id: 'email',
    regex: /[a-zA-Z0-9-_.]+@[a-zA-Z0-9-_.]+/,
    replacement: '[email_redacted]'
  }];
  
  const scrubPatterns = defaultScrubPatterns.concat(scrubPatternsList).filter(Boolean);

  const scrubbedValues: { [key: string]: any } = {};
  const scrubbedFields: string[] = [];

  const scrubData = (data: { [key: string]: any }, origin: string) => {
    Object.entries(data).forEach(([key, value]) => {
      scrubPatterns.forEach(({ id, regex, replacement }) => {
        if (typeof value === 'string' && regex.test(value)) {
          scrubbedValues[key] = {
            origin,
            rule: `matched pattern: ${id}`,
            original: value,
            scrubbed: value.replace(regex, replacement)
          };
          data[key] = value.replace(regex, replacement);
          scrubbedFields.push(key);
        }
      });


      if (typeof value === 'string' && isUrlWithOptionalQuery(value)) {
        try {
          const url = new URL(value);
          const params = new URLSearchParams(url.search);
      
          // Process blacklisted parameters
          blackListedQueryStringParameters.forEach(param => {
            if (params.has(param)) {
              params.set(param, 'parameter_removed');
              scrubbedValues[key] = {
                origin,
                rule: 'blacklisted parameter',
                original: value,
                scrubbed: url.toString()
              };
              scrubbedFields.push(param);
            }
          });
      
          // Process query string values for scrub patterns
          params.forEach((value, param) => {
            scrubPatterns.forEach(({ id, regex, replacement }) => {

              if (regex.test(value)) {
                const scrubbedValue = value.replace(regex,replacement);
                params.set(param, scrubbedValue);
                scrubbedValues[key] = {
                  origin,
                  rule: `matched pattern: ${id}`,
                  original: url.toString(),
                  scrubbed: scrubbedValue
                };
                scrubbedFields.push(param);
              }
            });
          });
      
          // Update the URL's search parameters and assign it to data
          url.search = params.toString();
          data[key] = url.toString();
        } catch (e) {
          console.error('Invalid URL:', value, e);
        }
      }
    });
  };

  // Scrub sharedPayload
  scrubData(request.sharedPayload, 'sharedPayload');

  // Scrub events
  request.events.forEach(event => scrubData(event, 'events'));

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

export default piiScrubberTask;
