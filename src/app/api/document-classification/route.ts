"use server";

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }
        const body = await request.json();
        const { selectedCertificateId } = body;

        if (!selectedCertificateId) {
            return NextResponse.json(
                { error: "Certificate ID is required" },
                { status: 400 }
            );
        }

        // Forward the request to the Supabase function
        const response = await fetch(
            "https://tneutyrfeftrwwuvvxlu.supabase.co/functions/v1/document-classification",
            {
                method: "POST",
                headers: {
                    'Authorization': authHeader,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ certificateId: selectedCertificateId }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return NextResponse.json(
                { error: "Classification failed", details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json().catch(() => ({}));
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error("Error in document classification API:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
