import { z } from "zod";

export const eventOptionsSchema = z.object({
    limit: z.number().optional().default(50),
    offset: z.number().optional().default(0),
    sort: z.enum(['asc', 'desc']).optional().default('desc'),
    search: z.string().optional().default(''),
    filters: z.array(z.object({
        key: z.string(),
        values: z.union([z.array(z.string()), z.array(z.object({
            key: z.string(),
            values: z.array(z.string())
        }))]),
    })).optional(),
})

export type EventFilterInput = z.input<typeof eventOptionsSchema>;
export type EventFilter = z.infer<typeof eventOptionsSchema>;

export enum EventFilterTypeAdmin {
    STATE = "STATE",
}

export type Event = {
    id : number;
    name : string;
    status: number;
    image : string;
    description: string;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
    url: string;
}

export type EventInput = {
    name : string;
    image : string;
    description: string;
    startDate: Date;
    endDate: Date;
    url: string;
}

