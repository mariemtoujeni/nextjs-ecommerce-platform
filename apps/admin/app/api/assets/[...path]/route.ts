import type { NextRequest } from 'next/server'
import { getPublicUrl } from '@repo/actions/_storage';

export async function GET(request: NextRequest, { params } : {params: Promise<{ path: string[] }>}) {
    const { path } = await params;
    return await getPublicUrl(path.join('/'));
}