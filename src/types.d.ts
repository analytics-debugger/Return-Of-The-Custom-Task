// types.d.ts

interface Window {
    GA4CustomTask: any; // Replace 'any' with a more specific type if needed
  }

interface GA4Event {
  en: string; // The string value 'en' can be up to 40 characters long
  [key: string]: any; // Additional dynamic properties with any key and value
}

type FetchArgs = [RequestInfo | URL, RequestInit?];

interface Interceptor {
  request?: (...args: FetchArgs) => FetchArgs | Promise<FetchArgs>;
  requestError?: (error: any) => Promise<FetchArgs>;
  response?: (response: Response) => Response | Promise<Response>;
  responseError?: (error: any) => Promise<Response>;
}

interface GA4CustomTaskSettings {
  allowedMeasurementIds?: string[];
  tasks?: ((RequestModel: any) => any)[];
}

interface RequestModel {
  endpoint: string;
  sharedPayload: { [key: string]: any }; // No need for null in the type
  events: { [key: string]: any }[];
  __skip?: boolean;
}

interface ScrubPattern {
  id: string;
  regex: RegExp;
  replacement: string;
}

interface AllowedEventsSchema {
  sharedEventParameters?: string[];
  events: {
    [key: string]: {
      wlep: string[];
    };
  };
}
