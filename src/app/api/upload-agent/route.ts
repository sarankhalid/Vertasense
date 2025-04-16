import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * API route that proxies requests to the Supabase function
 * This avoids CORS issues when calling the Supabase function directly from the browser
 */
export async function POST(request: NextRequest) {
    try {
        // Get the authorization header from the incoming request
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Get the form data from the request
        const formData = await request.formData();

        // Forward the request to the Supabase function using axios
        const response = await axios.post(
            'https://tneutyrfeftrwwuvvxlu.supabase.co/functions/v1/upload-agent',
            formData,
            {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'multipart/form-data',
                },
                // Ensure axios properly handles the response
                validateStatus: () => true,
            }
        );

        // Return the response from the Supabase function
        return NextResponse.json(response.data, { status: response.status });
    } catch (error) {
        console.error('Error in upload-agent proxy:', error);

        // Handle axios errors
        if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const data = error.response?.data || { error: 'Failed to proxy request to Supabase function' };

            return NextResponse.json(data, { status });
        }

        return NextResponse.json(
            { error: 'Failed to proxy request to Supabase function' },
            { status: 500 }
        );
    }
}
