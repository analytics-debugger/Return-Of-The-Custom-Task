// types.d.ts

interface Window {
    GA4CustomTask: any; // Replace 'any' with a more specific type if needed
  }

interface Event {
  en: string; // The string value 'en' can be up to 40 characters long
  [key: string]: any; // Additional dynamic properties with any key and value
}

interface FetchOptions extends RequestInit {
  body?: string; // Explicitly include `body` if it's used
}

interface GA4CustomTaskSettings {
  tasks?: ((request: RequestModel) => RequestModel)[];
  allowedMeasurementIds?: string[];
}

interface RequestModel {
  endpoint: string;
  sharedPayload: { [key: string]: any } | null;
  events: { [key: string]: any }[];
  __skip?: boolean;
}

interface ScrubPattern {
  id: string;
  regex: RegExp;
  replacement: string;
}