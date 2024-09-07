// src/types/RequestModel.ts
export interface RequestModel {
    sharedPayload: { [key: string]: any };
    events: { [key: string]: any }[];
}
