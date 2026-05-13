import { updateSuppliserStockUseCase } from "@repo/core/usecases";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get('Authorization');
        if (!apiKey) {
            return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
        }

        const data = await request.json();

        await updateSuppliserStockUseCase(apiKey, data);
        
        return NextResponse.json({ message: 'Processed stock updated successfully' }, { status: 200 });
    } catch (error: any) {
        console.error(error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}