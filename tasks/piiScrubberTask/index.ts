// src/tasks/piiScrubberTask.ts

import { RequestModel } from '../../types/RequestModel';

/**
 * Holder for the piiScrubberTask function.
 * 
 * @param payload - The payload object to be modified.

 */

const piiScrubber = function(payload, queryParamsBlackList, _, callback, logScrubbing) {
  
  const defaultBlackListedQueryStringParameters = ['email', 'mail', 'name', 'surname'];
  if (Array.isArray(queryParamsBlackList)) {
    queryParamsBlackList.forEach(param => {
      if (defaultBlackListedQueryStringParameters.indexOf(param) === -1) {
        defaultBlackListedQueryStringParameters.push(param);
      }
    });
  }

  const scrubPatterns = {
    email: { regex: /[a-zA-Z0-9-_.]+@[a-zA-Z0-9-_.]+/, replacement: '[email_redacted]' },
    ukpc: { regex: /[A-Za-z][A-Ha-hJ-Yj-y]?[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2}|[Gg][Ii][Rr] ?0[Aa]{2}/, replacement: '[uk_postal_code_redacted]' },
    ssn: { regex: /\b^(?!000|666)[0-8][0-9]{2}-(?!00)[0-9]{2}-(?!0000)[0-9]{4}\b/, replacement: '[ssn_redacted]' }
  };

  // Parse the query string into key-value pairs
  const keyValues = queryString.replace(/(^\?)/, '').split('&').reduce((obj, param) => {
    const [key, value] = param.split('=');
    obj[key] = decodeURIComponent(value);
    return obj;
  }, {});

  // Define the regex for valid keys (u)
  const validKeyRegex = new RegExp([
    '^(', 
    ['dl','dp','dt','dh','dr','ec','ea','el','sn','sa','st','uid'].join('|'), 
    ')$'
  ].join(''), 'i');

  const scrubbedValues = {};
  const scrubbedFields = [];

  Object.entries(keyValues).forEach(([key, value]) => {
    if (key.match(validKeyRegex)) {
      // Check if value matches any PII pattern
      Object.entries(scrubPatterns).forEach(([type, { regex, replacement }]) => {
        if (value.match(regex)) {
          scrubbedValues[key] = {
            original: value,
            scrubbed: value.replace(regex, replacement)
          };
          value = value.replace(regex, replacement);
        }
      });

      // Check for sensitive query string parameters in URLs
      if (value.match(/http/)) {
        scrubKeys.forEach(param => {
          const paramRegex = new RegExp('(([\\?&]' + param + '=)[^&/?]+)', 'gi');
          if (value.match(paramRegex)) {
            scrubbedValues[key] = scrubbedValues[key] || { original: value };
            value = value.replace(paramRegex, '$2removed');
            scrubbedValues[key].scrubbed = value;
          }
        });
      }

      // Update scrubbed values
      keyValues[key] = value;
    }
  });

  if (callback && scrubbedFields.length > 0) {
    callback(scrubbedFields);
  }

  if (logScrubbing && Object.keys(scrubbedValues).length) {
    console.groupCollapsed('PII Scrubber: Scrubbed Data');
    console.log(scrubbedValues);
    console.groupEnd();
  }

  return Object.keys(keyValues).map(key => key + '=' + encodeURIComponent(keyValues[key])).join('&');
};



const piiScrubberTask = (
  payload: RequestModel,
): RequestModel => {
  // Check if payload is provided
  if (!payload) {
    throw new Error('Payload is required.');
  }


  return payload;
};

export default piiScrubberTask;