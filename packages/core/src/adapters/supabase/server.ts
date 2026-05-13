'use server';

import { createServerClient } from "@supabase/ssr";
import { createClient as createSimpleClient, SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const storage: Record<string, string> = {};
type NodeEnv = typeof process.env.NODE_ENV | 'integration'
const cookieName = 'mlcn.auth.token'

const customStorage: Storage = {
    length: 0,
    clear: function (): void {
        Object.keys(storage).forEach(key => {
            delete storage[key];
        });
    },
    getItem: function (key: string): string | null {
        return storage[key] ?? null;
    },
    key: function (index: number): string | null {
        return Object.keys(storage)[index] ?? null;
    },
    removeItem: function (key: string): void {
        delete storage[key];
    },
    setItem: function (key: string, value: string): void {
        storage[key] = value;
    }
}

export const createClient = async () => {
    const nodeEnv = process.env.NODE_ENV as NodeEnv;

    if(nodeEnv === 'integration') {
        return createSimpleClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
            auth: {
                storage: customStorage,
            }
        });
    }

    const cookieStore = await cookies();

    return createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            cookieStore.set(name, value, options);
                        });
                    } catch (error) {
                        // The `set` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
            cookieOptions: {
                name: cookieName
            }
        },
    );
};


export const createClientWithResponse = async (request: NextRequest) => {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value),
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options),
                    );
                },
            },
            cookieOptions: {
                name: cookieName
            }
        },
    );

    return { supabase, response };
};

export const createClientAdmin = async () => {
    return createSimpleClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
};

export type BulkInsert = {
    table: string;
    data: any[];
}

export type BulkInsertResult = {
    errors: string[];
    success: boolean;
}

const MAX_INSERT = 20000;

export const bulkInsert = async (supabase: SupabaseClient, insert: BulkInsert): Promise<BulkInsertResult> => {

    let idx = 0;
    const errors: string[] = [];

    do {
        const end = Math.min((idx + 1) * MAX_INSERT, (idx * MAX_INSERT) + (insert.data.length - (idx * MAX_INSERT)));
        const toInsert = insert.data.slice(idx*MAX_INSERT, end);
        
        const { data, error } = await supabase.from(insert.table).upsert(toInsert);
        if(error) {
            errors.push(error.message)
        }

        idx++;
    } while(idx*MAX_INSERT < insert.data.length);

    return {
        errors,
        success: errors.length === 0
    }
}

const MAX_SELECT = 1000;
export type BulkSelect = {
    table: string;
    select: '';
    where?: string;
    limit?: number;
}
