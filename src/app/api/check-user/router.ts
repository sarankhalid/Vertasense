// import { NextRequest, NextResponse } from "next/server";
// import { createClient, User } from "@supabase/supabase-js";
// import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";

// export async function POST(request: NextRequest) {
//     try {
//         // Parse the request body
//         const body = await request.json();
//         const { email } = body;

//         if (!email) {
//             return NextResponse.json(
//                 { message: "Email is required" },
//                 { status: 400 }
//             );
//         }

//         // Create a Supabase client with the service role key for admin operations
//         const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

//         // Define the site URL with fallback
//         const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
//         console.log("Using site URL:", url);

//         // Fetch the list of users
//         const { data: users, error: fetchUserError } = await supabaseAdmin.auth.admin.listUsers();
//         console.log("Users : ", users)

//         if (fetchUserError) {
//             console.error("Error fetching users:", fetchUserError);
//             return NextResponse.json({ message: fetchUserError.message }, { status: 500 });
//         }

//         // Find the user with the provided email
//         const user = users?.find((user: User) => user.email === email);

//         if (user) {
//             // Check if the email is verified
//             if (user.email_verified) {
//                 return NextResponse.json(
//                     { message: "User already exists and email is verified." },
//                     { status: 200 }
//                 );
//             } else {
//                 return NextResponse.json(
//                     { message: "User exists but email is not verified." },
//                     { status: 400 }
//                 );
//             }
//         }

//         // If no user found, proceed with the user invitation (or any other logic)
//         console.log("User does not exist. Proceeding with the invitation.");

//         return NextResponse.json(
//             { message: "User does not exist, invite logic can go here." },
//             { status: 200 }
//         );

//     } catch (error) {
//         console.error("Error in invite-user API:", error);
//         return NextResponse.json(
//             {
//                 message:
//                     error instanceof Error ? error.message : "An unknown error occurred",
//             },
//             { status: 500 }
//         );
//     }
// }


import { NextRequest, NextResponse } from "next/server";
import { createClient, User } from "@supabase/supabase-js";
import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";

export async function POST(request: NextRequest) {
    try {
        // Parse the request body
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        // Create a Supabase client with the service role key for admin operations
        const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

        // Define the site URL with fallback
        const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        console.log("Using site URL:", url);

        // Fetch the list of users
        const { data: users, error: fetchUserError } = await supabaseAdmin.auth.admin.listUsers();

        console.log("Users : ", users)

        // If there's an error while fetching users, log the error and return a message
        if (fetchUserError) {
            console.error("Error fetching users:", fetchUserError);
            return NextResponse.json({ message: fetchUserError.message }, { status: 500 });
        }

        if (!users || users.length === 0) {
            // In case there are no users in the response
            return NextResponse.json(
                { message: "No users found in the database." },
                { status: 200 }
            );
        }

        // Find the user with the provided email
        const user = users.find((user: User) => user.email === email);

        if (user) {
            // Check if the email is verified
            if (user.email_verified) {
                return NextResponse.json(
                    { message: "User already exists and email is verified." },
                    { status: 200 }
                );
            } else {
                return NextResponse.json(
                    { message: "User exists but email is not verified." },
                    { status: 400 }
                );
            }
        }

        // If no user is found, proceed with the user invitation or other logic
        console.log("User does not exist. Proceeding with the invitation.");

        return NextResponse.json(
            { message: "User does not exist, invite logic can go here." },
            { status: 200 }
        );

    } catch (error) {
        console.error("Error in invite-user API:", error);
        return NextResponse.json(
            {
                message:
                    error instanceof Error ? error.message : "An unknown error occurred",
            },
            { status: 500 }
        );
    }
}
