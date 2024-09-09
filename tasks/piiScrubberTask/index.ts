// src/tasks/piiScrubberTask.ts

import { RequestModel } from '../../types/RequestModel';

/**
 * Sends a copy of the payload to a Snowplow endpoint. 
 * 
 * @param request - The request model to be modified.
 * @param queryParamsBlackList - Array of Measurement IDs to send a copy to
 * @param callback - function to be called after scrubbing
 * @param logScrubbing -log scrubbing details
 * @returns The modified payload object.
 */
const piiScrubberTask = (
  request: RequestModel,
  queryParamsBlackList?: string[],
  callback?: (scrubbedFields: string[]) => void,
  logScrubbing: boolean = false
): RequestModel => {
  if (!request) {
    console.error('piiScrubberTask: Request is required.');
    return request;
  }

  const blackListedQueryStringParameters = ['email', 'mail', 'name', 'surname'];
  if (Array.isArray(queryParamsBlackList)) {
    queryParamsBlackList.forEach(param => {
      if (!blackListedQueryStringParameters.includes(param)) {
        blackListedQueryStringParameters.push(param);
      }
    });
  }

  const scrubPatterns = {
    email: {
      regex: /[a-zA-Z0-9-_.]+@[a-zA-Z0-9-_.]+/,
      replacement: '[email_redacted]'
    },
    ukpc: {
      regex: /[A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2}/,
      replacement: '[uk_postal_code_redacted]'
    },
    ssn: {
      regex: /\b^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/,
      replacement: '[ssn_redacted]'
    }
  };

  const scrubbedValues: { [key: string]: any } = {};
  const scrubbedFields: string[] = [];

  const scrubData = (data: { [key: string]: any }, origin: string) => {
    Object.entries(data).forEach(([key, value]) => {
      Object.entries(scrubPatterns).forEach(([type, { regex, replacement }]) => {
        if (regex.test(value)) {
          scrubbedValues[key] = {
            origin,
            rule: `matched: ${type}`,
            original: value,
            scrubbed: value.replace(regex, replacement)
          };
          data[key] = value.replace(regex, replacement);
          scrubbedFields.push(key);
        }
      });

      // Handle URLs in query parameters
      if (typeof value === 'string' && value.includes('http')) {
        try {
          const url = new URL(value);
          const params = new URLSearchParams(url.search);

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

          url.search = params.toString();
          data[key] = url.toString();
        } catch (e) {
          console.error('Invalid URL:', value);
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
    callback(scrubbedFields);
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