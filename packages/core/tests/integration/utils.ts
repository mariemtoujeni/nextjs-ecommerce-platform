import { getInjection } from "../../src/types";

export enum TestUser {
    ADMIN = 'TEST_ADMIN',
    CUSTOMER = 'TEST_CUSTOMER',
    GUEST = 'TEST_GUEST',
}

export const signInTestUser = async (user: TestUser) => {
    const supabase = await getInjection('ISupabaseClient');

    if(!process.env[`${user}_EMAIL`] || !process.env[`${user}_PASSWORD`]) {
        throw new Error(`${user} credentials not found`);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email: process.env[`${user}_EMAIL`]!,
        password: process.env[`${user}_PASSWORD`]!,
    });

    if(error) {
        throw new Error(`${user} sign in failed: ${error.message}`);
    }

    return data;
}

export const signInAnonymous = async () => {
    const supabase = await getInjection('ISupabaseClient');
    await supabase.auth.signInAnonymously();
}

export const signOutTestUser = async () => {
    const supabase = await getInjection('ISupabaseClient');
    await supabase.auth.signOut();
}