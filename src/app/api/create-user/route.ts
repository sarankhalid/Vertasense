// // import { NextRequest, NextResponse } from "next/server";
// // import { createClient } from "@supabase/supabase-js";
// // import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";

// // export async function POST(request: NextRequest) {
// //     try {
// //         // Parse the request body
// //         const body = await request.json();
// //         const { name, email, role, phone, organization_id } = body;

// //         if (!email || !role) {
// //             return NextResponse.json(
// //                 { message: "Email and role are required" },
// //                 { status: 400 }
// //             );
// //         }

// //         // Create a Supabase client with the service role key for admin operations
// //         const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

// //         // Define the site URL with fallback
// //         const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// //         console.log("Using site URL:", url);

// //         // Invite the user with role in metadata
// //         const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
// //             email,
// //             {
// //                 redirectTo: `https://vertasense.vercel.app/reset-password`,
// //                 data: { role, name, email, phone, organization_id }, // Store the role in user metadata

// //             }
// //         );

// //         if (error) {
// //             console.error("Error inviting user:", error);
// //             return NextResponse.json({ message: error.message }, { status: 500 });
// //         }

// //         console.log("User invited successfully:", data);

// //         return NextResponse.json(
// //             { message: "User invited successfully", userId: data.user.id },
// //             { status: 200 }
// //         );
// //     } catch (error) {
// //         console.error("Error in invite-user API:", error);
// //         return NextResponse.json(
// //             {
// //                 message:
// //                     error instanceof Error ? error.message : "An unknown error occurred",
// //             },
// //             { status: 500 }
// //         );
// //     }
// // }


// // // // // // import { NextRequest, NextResponse } from "next/server";
// // // // // // import { createClient } from "@supabase/supabase-js";
// // // // // // import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";

// // // // // // export async function POST(request: NextRequest) {
// // // // // //     try {
// // // // // //         // Parse the request body
// // // // // //         const body = await request.json();
// // // // // //         const { name, email, role, phone, organization_id } = body;

// // // // // //         if (!email || !role) {
// // // // // //             return NextResponse.json(
// // // // // //                 { message: "Email and role are required" },
// // // // // //                 { status: 400 }
// // // // // //             );
// // // // // //         }

// // // // // //         // Create a Supabase client with the service role key for admin operations
// // // // // //         const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

// // // // // //         // Define the site URL with fallback
// // // // // //         const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// // // // // //         console.log("Using site URL:", url);

// // // // // //         // Check if the user already exists
// // // // // //         const { data: user, error: fetchUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email);

// // // // // //         if (fetchUserError) {
// // // // // //             console.error("Error fetching user:", fetchUserError);
// // // // // //             return NextResponse.json({ message: fetchUserError.message }, { status: 500 });
// // // // // //         }

// // // // // //         // If the user exists and the email is not verified, send an invitation
// // // // // //         if (user) {
// // // // // //             if (!user.email_confirmed_at) {
// // // // // //                 // Email is not verified, resend invite link
// // // // // //                 console.log("User exists but email is not verified, sending invite again.");

// // // // // //                 const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
// // // // // //                     email,
// // // // // //                     {
// // // // // //                         redirectTo: `${url}/reset-password`,
// // // // // //                         data: { role, name, email, phone, organization_id }, // Store the role in user metadata
// // // // // //                     }
// // // // // //                 );

// // // // // //                 if (error) {
// // // // // //                     console.error("Error inviting user:", error);
// // // // // //                     return NextResponse.json({ message: error.message }, { status: 500 });
// // // // // //                 }

// // // // // //                 console.log("User invited successfully:", data);

// // // // // //                 if (process.env.NODE_ENV === "development") {
// // // // // //                     try {
// // // // // //                         // Generate a recovery link to get the action link for debugging
// // // // // //                         const { data: resetData } = await supabaseAdmin.auth.admin.generateLink(
// // // // // //                             {
// // // // // //                                 type: "recovery",
// // // // // //                                 email,
// // // // // //                                 options: {
// // // // // //                                     redirectTo: `${url}/reset-password`,
// // // // // //                                 },
// // // // // //                             }
// // // // // //                         );

// // // // // //                         if (resetData?.properties?.action_link) {
// // // // // //                             console.log("Debug - direct action link:", resetData.properties.action_link);
// // // // // //                             return NextResponse.json(
// // // // // //                                 {
// // // // // //                                     message: "User invited successfully",
// // // // // //                                     userId: data.user.id,
// // // // // //                                     debugLink: resetData.properties.action_link,
// // // // // //                                 },
// // // // // //                                 { status: 200 }
// // // // // //                             );
// // // // // //                         }
// // // // // //                     } catch (debugError) {
// // // // // //                         console.error("Error generating debug link:", debugError);
// // // // // //                     }
// // // // // //                 }

// // // // // //                 return NextResponse.json(
// // // // // //                     { message: "User invited successfully", userId: data.user.id },
// // // // // //                     { status: 200 }
// // // // // //                 );
// // // // // //             } else {
// // // // // //                 // User exists and email is verified, just update metadata
// // // // // //                 console.log("User exists and email is verified, updating metadata.");

// // // // // //                 const { data, error } = await supabaseAdmin.auth.updateUserById(user.id, {
// // // // // //                     data: { role, name, phone, organization_id },
// // // // // //                 });

// // // // // //                 if (error) {
// // // // // //                     console.error("Error updating user metadata:", error);
// // // // // //                     return NextResponse.json({ message: error.message }, { status: 500 });
// // // // // //                 }

// // // // // //                 console.log("User metadata updated successfully:", data);

// // // // // //                 return NextResponse.json(
// // // // // //                     { message: "User metadata updated successfully", userId: data.id },
// // // // // //                     { status: 200 }
// // // // // //                 );
// // // // // //             }
// // // // // //         } else {
// // // // // //             // User does not exist, invite them
// // // // // //             const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
// // // // // //                 email,
// // // // // //                 {
// // // // // //                     redirectTo: `${url}/reset-password`,
// // // // // //                     data: { role, name, email, phone, organization_id }, // Store the role in user metadata
// // // // // //                 }
// // // // // //             );

// // // // // //             if (error) {
// // // // // //                 console.error("Error inviting user:", error);
// // // // // //                 return NextResponse.json({ message: error.message }, { status: 500 });
// // // // // //             }

// // // // // //             console.log("User invited successfully:", data);

// // // // // //             if (process.env.NODE_ENV === "development") {
// // // // // //                 try {
// // // // // //                     // Generate a recovery link to get the action link for debugging
// // // // // //                     const { data: resetData } = await supabaseAdmin.auth.admin.generateLink(
// // // // // //                         {
// // // // // //                             type: "recovery",
// // // // // //                             email,
// // // // // //                             options: {
// // // // // //                                 redirectTo: `${url}/reset-password`,
// // // // // //                             },
// // // // // //                         }
// // // // // //                     );

// // // // // //                     if (resetData?.properties?.action_link) {
// // // // // //                         console.log("Debug - direct action link:", resetData.properties.action_link);
// // // // // //                         return NextResponse.json(
// // // // // //                             {
// // // // // //                                 message: "User invited successfully",
// // // // // //                                 userId: data.user.id,
// // // // // //                                 debugLink: resetData.properties.action_link,
// // // // // //                             },
// // // // // //                             { status: 200 }
// // // // // //                         );
// // // // // //                     }
// // // // // //                 } catch (debugError) {
// // // // // //                     console.error("Error generating debug link:", debugError);
// // // // // //                 }
// // // // // //             }

// // // // // //             return NextResponse.json(
// // // // // //                 { message: "User invited successfully", userId: data.user.id },
// // // // // //                 { status: 200 }
// // // // // //             );
// // // // // //         }
// // // // // //     } catch (error) {
// // // // // //         console.error("Error in invite-user API:", error);
// // // // // //         return NextResponse.json(
// // // // // //             {
// // // // // //                 message:
// // // // // //                     error instanceof Error ? error.message : "An unknown error occurred",
// // // // // //             },
// // // // // //             { status: 500 }
// // // // // //         );
// // // // // //     }
// // // // // // }


// // // import { NextRequest, NextResponse } from "next/server";
// // // import { createClient } from "@supabase/supabase-js";
// // // import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";

// // // export async function POST(request: NextRequest) {
// // //     try {
// // //         // Parse the request body
// // //         const body = await request.json();
// // //         const { name, email, role, phone, organization_id } = body;

// // //         if (!email || !role) {
// // //             return NextResponse.json(
// // //                 { message: "Email and role are required" },
// // //                 { status: 400 }
// // //             );
// // //         }

// // //         // Create a Supabase client with the service role key for admin operations
// // //         const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

// // //         // Define the site URL with fallback
// // //         const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// // //         console.log("Using site URL:", url);

// // //         // Check if the user already exists by listing all users and finding by email
// // //         // Pagination parameters should match the API spec
// // //         const { data, error: fetchUserError } = await supabaseAdmin.auth.admin.listUsers();

// // //         console.log("data : ", data)

// // //         if (fetchUserError) {
// // //             console.error("Error fetching users:", fetchUserError);
// // //             return NextResponse.json({ message: fetchUserError.message }, { status: 500 });
// // //         }

// // //         // Find the user with the matching email
// // //         const existingUser = data.users.find(user => user.email === email);

// // //         // If the user exists and the email is not verified, send an invitation
// // //         if (existingUser) {
// // //             if (!existingUser.email_confirmed_at) {
// // //                 // Email is not verified, resend invite link
// // //                 console.log("User exists but email is not verified, sending invite again.");

// // //                 const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
// // //                     redirectTo: `${url}/reset-password`,
// // //                     data: { role, name, email, phone, organization_id }, // Store the role in user metadata
// // //                 });

// // //                 if (error) {
// // //                     console.error("Error inviting user:", error);
// // //                     return NextResponse.json({ message: error.message }, { status: 500 });
// // //                 }

// // //                 console.log("User invited successfully:", data);

// // //                 if (process.env.NODE_ENV === "development") {
// // //                     try {
// // //                         // Generate a recovery link to get the action link for debugging
// // //                         const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
// // //                             type: "recovery",
// // //                             email,
// // //                             options: {
// // //                                 redirectTo: `${url}/reset-password`,
// // //                             },
// // //                         });

// // //                         if (resetError) {
// // //                             console.error("Error generating debug link:", resetError);
// // //                         } else if (resetData?.properties?.action_link) {
// // //                             console.log("Debug - direct action link:", resetData.properties.action_link);
// // //                             return NextResponse.json(
// // //                                 {
// // //                                     message: "User invited successfully",
// // //                                     userId: data.user.id,
// // //                                     debugLink: resetData.properties.action_link,
// // //                                 },
// // //                                 { status: 200 }
// // //                             );
// // //                         }
// // //                     } catch (debugError) {
// // //                         console.error("Error generating debug link:", debugError);
// // //                     }
// // //                 }

// // //                 return NextResponse.json(
// // //                     { message: "User invited successfully", userId: data.user.id },
// // //                     { status: 200 }
// // //                 );
// // //             } else {
// // //                 // User exists and email is verified, just update metadata
// // //                 console.log("User exists and email is verified, updating metadata.");

// // //                 const { data: roleData } = await supabaseAdmin.from("roles").select("id").eq("name", role).single()

// // //                 const { data: orgUserData, error: orgUserError } = await supabaseAdmin.from("org_users").insert([
// // //                     {
// // //                         user_id: existingUser.id,
// // //                         organization_id: organization_id,
// // //                         role_id: roleData?.id, // Assuming 'role' maps to a role ID
// // //                         created_at: new Date().toISOString(),
// // //                         updated_at: new Date().toISOString(),
// // //                     }
// // //                 ]);
// // //                 // const { data, error } = await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
// // //                 //     user_metadata: { role, name, phone, organization_id },
// // //                 // });

// // //                 // if (error) {
// // //                 //     console.error("Error updating user metadata:", error);
// // //                 //     return NextResponse.json({ message: error.message }, { status: 500 });
// // //                 // }

// // //                 console.log("User metadata updated successfully:", data);

// // //                 return NextResponse.json(
// // //                     { message: "User metadata updated successfully", userId: data.user.id },
// // //                     { status: 200 }
// // //                 );
// // //             }
// // //         } else {
// // //             // User does not exist, invite them
// // //             const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
// // //                 redirectTo: `${url}/reset-password`,
// // //                 data: { role, name, email, phone, organization_id }, // Store the role in user metadata
// // //             });

// // //             if (error) {
// // //                 console.error("Error inviting user:", error);
// // //                 return NextResponse.json({ message: error.message }, { status: 500 });
// // //             }

// // //             console.log("User invited successfully:", data);

// // //             if (process.env.NODE_ENV === "development") {
// // //                 try {
// // //                     // Generate a recovery link to get the action link for debugging
// // //                     const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
// // //                         type: "recovery",
// // //                         email,
// // //                         options: {
// // //                             redirectTo: `${url}/reset-password`,
// // //                         },
// // //                     });

// // //                     if (resetError) {
// // //                         console.error("Error generating debug link:", resetError);
// // //                     } else if (resetData?.properties?.action_link) {
// // //                         console.log("Debug - direct action link:", resetData.properties.action_link);
// // //                         return NextResponse.json(
// // //                             {
// // //                                 message: "User invited successfully",
// // //                                 userId: data.user.id,
// // //                                 debugLink: resetData.properties.action_link,
// // //                             },
// // //                             { status: 200 }
// // //                         );
// // //                     }
// // //                 } catch (debugError) {
// // //                     console.error("Error generating debug link:", debugError);
// // //                 }
// // //             }

// // //             return NextResponse.json(
// // //                 { message: "User invited successfully", userId: data.user.id },
// // //                 { status: 200 }
// // //             );
// // //         }
// // //     } catch (error) {
// // //         console.error("Error in invite-user API:", error);
// // //         return NextResponse.json(
// // //             {
// // //                 message:
// // //                     error instanceof Error ? error.message : "An unknown error occurred",
// // //             },
// // //             { status: 500 }
// // //         );
// // //     }
// // // }

// // // // import { NextRequest, NextResponse } from "next/server";
// // // // import { createClient } from "@supabase/supabase-js";
// // // // import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";

// // // // export async function POST(request: NextRequest) {
// // // //     try {
// // // //         // Parse the request body
// // // //         const body = await request.json();
// // // //         const { name, email, role, phone, organization_id } = body;

// // // //         if (!email || !role) {
// // // //             return NextResponse.json(
// // // //                 { message: "Email and role are required" },
// // // //                 { status: 400 }
// // // //             );
// // // //         }

// // // //         // Create a Supabase client with the service role key for admin operations
// // // //         const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

// // // //         // Define the site URL with fallback
// // // //         const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// // // //         console.log("Using site URL:", url);

// // // //         // Check if the user already exists by listing all users
// // // //         const { data, error: fetchUserError } = await supabaseAdmin.auth.admin.listUsers();

// // // //         console.log("Data : ", data)

// // // //         if (fetchUserError) {
// // // //             console.error("Error fetching users:", fetchUserError);
// // // //             return NextResponse.json({ message: fetchUserError.message }, { status: 500 });
// // // //         }

// // // //         // Find the user with the matching email
// // // //         const existingUser = data.users.find(user => user.email === email);

// // // //         // If the user exists and the email is not verified, send an invitation
// // // //         if (existingUser) {
// // // //             if (!existingUser.email_confirmed_at) {
// // // //                 // Email is not verified, resend invite link
// // // //                 console.log("User exists but email is not verified, sending invite again.");

// // // //                 const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
// // // //                     redirectTo: `${url}/reset-password`,
// // // //                     data: { role, name, email, phone, organization_id },
// // // //                 });

// // // //                 if (inviteError) {
// // // //                     console.error("Error inviting user:", inviteError);
// // // //                     return NextResponse.json({ message: inviteError.message }, { status: 500 });
// // // //                 }

// // // //                 // Check if inviteData is returned correctly
// // // //                 if (!inviteData || !inviteData.user) {
// // // //                     console.error("Invite response doesn't contain user data:", inviteData);
// // // //                     return NextResponse.json({ message: "Error: User data not returned after invite" }, { status: 500 });
// // // //                 }

// // // //                 console.log("User invited successfully:", inviteData.user.id);

// // // //                 return NextResponse.json(
// // // //                     { message: "User invited successfully", userId: inviteData.user.id },
// // // //                     { status: 200 }
// // // //                 );
// // // //             } else {
// // // //                 // User exists and email is verified, just update metadata
// // // //                 console.log("User exists and email is verified, updating metadata.");

// // // //                 // Fetch role from the 'roles' table
// // // //                 const { data: roleData, error: roleError } = await supabaseAdmin
// // // //                     .from("roles")
// // // //                     .select("id")
// // // //                     .eq("name", role)
// // // //                     .single();

// // // //                 if (roleError) {
// // // //                     console.error("Error fetching role data:", roleError);
// // // //                     return NextResponse.json({ message: roleError.message }, { status: 500 });
// // // //                 }

// // // //                 if (!roleData) {
// // // //                     console.error("Role not found:", role);
// // // //                     return NextResponse.json({ message: "Role not found" }, { status: 500 });
// // // //                 }

// // // //                 // Insert metadata into the org_users table
// // // //                 const { data: orgUserData, error: orgUserError } = await supabaseAdmin.from("org_users").insert([
// // // //                     {
// // // //                         user_id: existingUser.id,
// // // //                         organization_id: organization_id,
// // // //                         role_id: roleData.id,
// // // //                         created_at: new Date().toISOString(),
// // // //                         updated_at: new Date().toISOString(),
// // // //                     }
// // // //                 ]);

// // // //                 if (orgUserError) {
// // // //                     console.error("Error inserting into org_users:", orgUserError);
// // // //                     return NextResponse.json({ message: orgUserError.message }, { status: 500 });
// // // //                 }

// // // //                 console.log("User metadata updated successfully:", orgUserData);

// // // //                 return NextResponse.json(
// // // //                     { message: "User metadata updated successfully", userId: existingUser.id },
// // // //                     { status: 200 }
// // // //                 );
// // // //             }
// // // //         } else {
// // // //             // User does not exist, invite them
// // // //             const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
// // // //                 redirectTo: `${url}/reset-password`,
// // // //                 data: { role, name, email, phone, organization_id },
// // // //             });

// // // //             if (inviteError) {
// // // //                 console.error("Error inviting user:", inviteError);
// // // //                 return NextResponse.json({ message: inviteError.message }, { status: 500 });
// // // //             }

// // // //             // Check if inviteData is returned correctly
// // // //             if (!inviteData || !inviteData.user) {
// // // //                 console.error("Invite response doesn't contain user data:", inviteData);
// // // //                 return NextResponse.json({ message: "Error: User data not returned after invite" }, { status: 500 });
// // // //             }

// // // //             console.log("User invited successfully:", inviteData.user.id);

// // // //             return NextResponse.json(
// // // //                 { message: "User invited successfully", userId: inviteData.user.id },
// // // //                 { status: 200 }
// // // //             );
// // // //         }
// // // //     } catch (error) {
// // // //         console.error("Error in invite-user API:", error);
// // // //         return NextResponse.json(
// // // //             {
// // // //                 message: error instanceof Error ? error.message : "An unknown error occurred",
// // // //             },
// // // //             { status: 500 }
// // // //         );
// // // //     }
// // // // }



// // // import { NextRequest, NextResponse } from "next/server";
// // // import { createClient } from "@supabase/supabase-js";
// // // import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";

// // // export async function POST(request: NextRequest) {
// // //     try {
// // //         // Parse the request body
// // //         const body = await request.json();
// // //         const { name, email, role, phone, organization_id } = body;

// // //         if (!email || !role) {
// // //             return NextResponse.json(
// // //                 { message: "Email and role are required" },
// // //                 { status: 400 }
// // //             );
// // //         }

// // //         // Create a Supabase client with the service role key for admin operations
// // //         const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

// // //         // Define the site URL with fallback
// // //         const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
// // //         console.log("Using site URL:", url);

// // //         // Check if the user already exists by listing all users
// // //         const { data, error: fetchUserError } = await supabaseAdmin.auth.admin.listUsers();

// // //         if (fetchUserError) {
// // //             console.error("Error fetching users:", fetchUserError);
// // //             return NextResponse.json({ message: fetchUserError.message }, { status: 500 });
// // //         }

// // //         // Find the user with the matching email
// // //         const existingUser = data.users.find(user => user.email === email);

// // //         // If the user exists and the email is not verified, send an invitation
// // //         if (existingUser) {
// // //             if (!existingUser.email_confirmed_at) {
// // //                 // Email is not verified, resend invite link
// // //                 console.log("User exists but email is not verified, sending invite again.");

// // //                 // First, delete the existing user to avoid conflicts
// // //                 const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingUser.id);

// // //                 if (deleteError) {
// // //                     console.error("Error deleting existing user:", deleteError);
// // //                     return NextResponse.json({ message: deleteError.message }, { status: 500 });
// // //                 }

// // //                 // Create a new invitation with extended expiration
// // //                 const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
// // //                     redirectTo: `${url}/reset-password`,
// // //                     data: { role, name, email, phone, organization_id },
// // //                     // The proper options for inviteUserByEmail are limited to redirectTo and data
// // //                 });

// // //                 if (inviteError) {
// // //                     console.error("Error inviting user:", inviteError);
// // //                     return NextResponse.json({ message: inviteError.message }, { status: 500 });
// // //                 }

// // //                 // Check if inviteData is returned correctly
// // //                 if (!inviteData || !inviteData.user) {
// // //                     console.error("Invite response doesn't contain user data:", inviteData);
// // //                     return NextResponse.json({ message: "Error: User data not returned after invite" }, { status: 500 });
// // //                 }

// // //                 console.log("User invited successfully:", inviteData.user.id);

// // //                 return NextResponse.json(
// // //                     { message: "User invited successfully", userId: inviteData.user.id },
// // //                     { status: 200 }
// // //                 );
// // //             } else {
// // //                 // User exists and email is verified, just update metadata
// // //                 console.log("User exists and email is verified, updating metadata.");

// // //                 // Fetch role from the 'roles' table
// // //                 const { data: roleData, error: roleError } = await supabaseAdmin
// // //                     .from("roles")
// // //                     .select("id")
// // //                     .eq("name", role)
// // //                     .single();

// // //                 if (roleError) {
// // //                     console.error("Error fetching role data:", roleError);
// // //                     return NextResponse.json({ message: roleError.message }, { status: 500 });
// // //                 }

// // //                 if (!roleData) {
// // //                     console.error("Role not found:", role);
// // //                     return NextResponse.json({ message: "Role not found" }, { status: 500 });
// // //                 }

// // //                 // Check if the user already exists in the org_users table
// // //                 const { data: existingOrgUser, error: checkOrgUserError } = await supabaseAdmin
// // //                     .from("org_users")
// // //                     .select("*")
// // //                     .eq("user_id", existingUser.id)
// // //                     .eq("organization_id", organization_id)
// // //                     .single();

// // //                 if (checkOrgUserError && checkOrgUserError.code !== "PGRST116") { // PGRST116 is "not found" error
// // //                     console.error("Error checking org_users:", checkOrgUserError);
// // //                     return NextResponse.json({ message: checkOrgUserError.message }, { status: 500 });
// // //                 }

// // //                 // If the org_user entry exists, update it. Otherwise, insert a new one.
// // //                 let orgUserData;
// // //                 let orgUserError;

// // //                 if (existingOrgUser) {
// // //                     // Update existing record
// // //                     const result = await supabaseAdmin
// // //                         .from("org_users")
// // //                         .update({
// // //                             role_id: roleData.id,
// // //                             updated_at: new Date().toISOString(),
// // //                         })
// // //                         .eq("user_id", existingUser.id)
// // //                         .eq("organization_id", organization_id);

// // //                     orgUserData = result.data;
// // //                     orgUserError = result.error;
// // //                 } else {
// // //                     // Insert new record
// // //                     const result = await supabaseAdmin
// // //                         .from("org_users")
// // //                         .insert([{
// // //                             user_id: existingUser.id,
// // //                             organization_id: organization_id,
// // //                             role_id: roleData.id,
// // //                             created_at: new Date().toISOString(),
// // //                             updated_at: new Date().toISOString(),
// // //                         }]);

// // //                     orgUserData = result.data;
// // //                     orgUserError = result.error;
// // //                 }

// // //                 if (orgUserError) {
// // //                     console.error("Error updating/inserting into org_users:", orgUserError);
// // //                     return NextResponse.json({ message: orgUserError.message }, { status: 500 });
// // //                 }

// // //                 console.log("User metadata updated successfully:", orgUserData);

// // //                 return NextResponse.json(
// // //                     { message: "User metadata updated successfully", userId: existingUser.id },
// // //                     { status: 200 }
// // //                 );
// // //             }
// // //         } else {
// // //             // User does not exist, invite them
// // //             const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
// // //                 redirectTo: `${url}/reset-password`,
// // //                 data: { role, name, email, phone, organization_id },
// // //             });

// // //             if (inviteError) {
// // //                 console.error("Error inviting user:", inviteError);
// // //                 return NextResponse.json({ message: inviteError.message }, { status: 500 });
// // //             }

// // //             // Check if inviteData is returned correctly
// // //             if (!inviteData || !inviteData.user) {
// // //                 console.error("Invite response doesn't contain user data:", inviteData);
// // //                 return NextResponse.json({ message: "Error: User data not returned after invite" }, { status: 500 });
// // //             }

// // //             console.log("User invited successfully:", inviteData.user.id);

// // //             return NextResponse.json(
// // //                 { message: "User invited successfully", userId: inviteData.user.id },
// // //                 { status: 200 }
// // //             );
// // //         }
// // //     } catch (error) {
// // //         console.error("Error in invite-user API:", error);
// // //         return NextResponse.json(
// // //             {
// // //                 message: error instanceof Error ? error.message : "An unknown error occurred",
// // //             },
// // //             { status: 500 }
// // //         );
// // //     }
// // // }

// import { NextRequest, NextResponse } from "next/server";
// import { createClient } from "@supabase/supabase-js";
// import { SUPABASE_URL, SERVICE_ROLE_KEY } from "@/utils/supabase/constants";

// export async function POST(request: NextRequest) {
//     try {
//         const body = await request.json();
//         const { name, email, role, phone, organization_id } = body;

//         // Validate required fields
//         if (!email || !role) {
//             return NextResponse.json({ message: "Email and role are required" }, { status: 400 });
//         }

//         if (!organization_id) {
//             return NextResponse.json({ message: "Organization ID is required" }, { status: 400 });
//         }

//         // Create a Supabase client with the service role key for admin operations
//         const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

//         // Define the site URL with fallback
//         const url = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
//         console.log("Using site URL:", url);

//         // Directly fetch the user by email instead of listing all users
//         const { data: existingUser, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();

//         if (fetchError) {
//             console.error("Error fetching user by email:", fetchError);
//             return NextResponse.json({ message: fetchError.message }, { status: 500 });
//         }

//         // Fetch role ID from the 'roles' table
//         const { data: roleData, error: roleError } = await supabaseAdmin
//             .from("roles")
//             .select("id")
//             .eq("name", role)
//             .single();

//         if (roleError) {
//             console.error("Error fetching role data:", roleError);
//             return NextResponse.json({ message: roleError.message }, { status: 500 });
//         }

//         if (!roleData) {
//             console.error("Role not found:", role);
//             return NextResponse.json({ message: `Role '${role}' not found in the system` }, { status: 404 });
//         }

//         // Case 1: User exists
//         if (existingUser) {
//             // Case 1.1: User exists but email is not verified
//             if (!existingUser.email_confirmed_at) {
//                 console.log("User exists but email is not verified, sending invite again");

//                 // Instead of deleting the user, re-invite them
//                 const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
//                     email,
//                     {
//                         redirectTo: `${url}/reset-password`,
//                         data: { role, name, email, phone, organization_id },
//                     }
//                 );

//                 if (inviteError) {
//                     console.error("Error inviting user:", inviteError);
//                     return NextResponse.json({ message: inviteError.message }, { status: 500 });
//                 }

//                 return NextResponse.json({ message: "User invited successfully", userId: inviteData?.user?.id }, { status: 200 });
//             }

//             // Case 1.2: User exists and email is verified
//             console.log("User exists and email is verified, updating org_users relationship");

//             // Handle organization assignment (checking org_users table)
//             const { data: existingOrgUser, error: checkOrgUserError } = await supabaseAdmin
//                 .from("org_users")
//                 .select("*")
//                 .eq("user_id", existingUser.id)
//                 .eq("organization_id", organization_id);

//             if (checkOrgUserError) {
//                 console.error("Error checking org_users:", checkOrgUserError);
//                 return NextResponse.json({ message: checkOrgUserError.message }, { status: 500 });
//             }

//             // Update or insert organization-user relation
//             let orgUserData;
//             if (existingOrgUser?.length > 0) {
//                 const result = await supabaseAdmin
//                     .from("org_users")
//                     .update({ role_id: roleData.id, updated_at: new Date().toISOString() })
//                     .eq("user_id", existingUser.id)
//                     .eq("organization_id", organization_id);

//                 orgUserData = result.data;
//             } else {
//                 const result = await supabaseAdmin
//                     .from("org_users")
//                     .insert([{
//                         user_id: existingUser.id,
//                         organization_id: organization_id,
//                         role_id: roleData.id,
//                         created_at: new Date().toISOString(),
//                         updated_at: new Date().toISOString(),
//                     }]);

//                 orgUserData = result.data;
//             }

//             if (orgUserData?.length === 0) {
//                 return NextResponse.json({ message: "Error updating/inserting into org_users" }, { status: 500 });
//             }

//             return NextResponse.json({
//                 message: "User added to organization successfully",
//                 userId: existingUser.id,
//             }, { status: 200 });
//         }

//         // Case 2: User does not exist, invite them
//         else {
//             console.log("User does not exist, creating new invitation");

//             const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
//                 email,
//                 {
//                     redirectTo: `${url}/reset-password`,
//                     data: { role, name, email, phone, organization_id },
//                 }
//             );

//             if (inviteError) {
//                 console.error("Error inviting user:", inviteError);
//                 return NextResponse.json({ message: inviteError.message }, { status: 500 });
//             }

//             return NextResponse.json({
//                 message: "User invited successfully",
//                 userId: inviteData.user.id,
//             }, { status: 200 });
//         }
//     } catch (error) {
//         console.error("Error in invite-user API:", error);
//         return NextResponse.json({
//             message: error instanceof Error ? error.message : "An unknown error occurred",
//         }, { status: 500 });
//     }
// }


// async function getUserByEmail(email: string) {
//     const { data, error } = await supabase.rpc('get_user_by_email', { p_email: email });

//     if (error) {
//         console.error('Error fetching user by email:', error);
//         return null;
//     }

//     return data;
// }
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SERVICE_ROLE_KEY } from '@/utils/supabase/constants';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, role, phone, organization_id } = body;

        // Validate required fields
        if (!email || !role) {
            return NextResponse.json({ message: 'Email and role are required' }, { status: 400 });
        }

        if (!organization_id) {
            return NextResponse.json({ message: 'Organization ID is required' }, { status: 400 });
        }

        // Create a Supabase client with the service role key for admin operations
        const supabaseAdmin = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!);

        // Define the site URL with fallback
        const url = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        console.log('Using site URL:', url);

        // Fetch the user by email using the custom function
        const { data: existingUser, error: fetchError } = await supabaseAdmin.rpc('get_user_by_email', { p_email: email });

        console.log("Data : ", existingUser)

        if (fetchError) {
            console.error('Error fetching user by email:', fetchError);
            return NextResponse.json({ message: fetchError.message }, { status: 500 });
        }

        // Fetch role ID from the 'roles' table
        const { data: roleData, error: roleError } = await supabaseAdmin
            .from('roles')
            .select('id')
            .eq('name', role)
            .single();

        if (roleError) {
            console.error('Error fetching role data:', roleError);
            return NextResponse.json({ message: roleError.message }, { status: 500 });
        }

        if (!roleData) {
            console.error('Role not found:', role);
            return NextResponse.json({ message: `Role '${role}' not found in the system` }, { status: 404 });
        }

        // Case 1: User exists
        if (existingUser) {
            // Case 1.1: User exists but email is not verified
            if (!existingUser[0].email_confirmed_at) {
                console.log('User exists but email is not verified, sending invite again');

                // Instead of deleting the user, re-invite them
                const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                    email,
                    {
                        redirectTo: `${url}/reset-password`,
                        data: { role, name, email, phone, organization_id },
                    }
                );

                if (inviteError) {
                    console.error('Error inviting user:', inviteError);
                    return NextResponse.json({ message: inviteError.message }, { status: 500 });
                }

                return NextResponse.json({ message: 'User invited successfully', userId: inviteData?.user?.id }, { status: 200 });
            }

            // Case 1.2: User exists and email is verified
            console.log('User exists and email is verified, updating org_users relationship');

            // Handle organization assignment (checking org_users table)
            const { data: existingOrgUser, error: checkOrgUserError } = await supabaseAdmin
                .from('org_users')
                .select('*')
                .eq('user_id', existingUser[0].user_id)
                .eq('organization_id', organization_id);

            if (checkOrgUserError) {
                console.error('Error checking org_users:', checkOrgUserError);
                return NextResponse.json({ message: checkOrgUserError.message }, { status: 500 });
            }

            // Explicitly type orgUserData as an array
            // Explicitly type orgUserData as an array or null
            let orgUserData: any[] | null = null;

            if (existingOrgUser?.length > 0) {
                const result = await supabaseAdmin
                    .from('org_users')
                    .update({ role_id: roleData.id, updated_at: new Date().toISOString() })
                    .eq('user_id', existingUser[0].user_id)
                    .eq('organization_id', organization_id);

                orgUserData = result.data;
            } else {
                const result = await supabaseAdmin
                    .from('org_users')
                    .insert([
                        {
                            user_id: existingUser[0].user_id,
                            organization_id: organization_id,
                            role_id: roleData.id,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                    ]);

                orgUserData = result.data;
            }

            if (orgUserData?.length === 0) {
                return NextResponse.json({ message: 'Error updating/inserting into org_users' }, { status: 500 });
            }

            return NextResponse.json({
                message: 'User added to organization successfully',
                userId: existingUser[0].user_id,
            });
        }

        // Case 2: User does not exist
        // If the user does not exist, create a new user
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            email,
            {
                redirectTo: `https://vertasense.vercel.app/reset-password`,
                data: { role, name, email, phone, organization_id }, // Store the role in user metadata

            }
        );

        if (error) {
            console.error("Error inviting user:", error);
            return NextResponse.json({ message: error.message }, { status: 500 });
        }

        console.log("User invited successfully:", data);

        return NextResponse.json(
            { message: "User invited successfully", userId: data.user.id },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in POST handler:', error);
        return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
    }
}
