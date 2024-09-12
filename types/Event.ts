// src/types/Event.ts
export interface Event {
    en: string; // The string value 'en' can be up to 40 characters long
    [key: string]: any; // Additional dynamic properties with any key and value
}