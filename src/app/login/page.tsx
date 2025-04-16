// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/store/useAuthStore";
// import Image from "next/image";
// import Link from "next/link";
// import { z } from "zod";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Mail, Lock, Loader2 } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { useLogin } from "@refinedev/core";
// import { supabaseBrowserClient } from "@/utils/supabase/client";

// // Define the structure of the data returned from the org_users table
// // Correct the definition of the 'organizations' property to be an object, not an array
// interface OrgUserData {
//   id: string;
//   organization_id: string;
//   role_id: string;
//   organizations: {
//     id: string;
//     name: string;
//     type: string;
//   }; // Changed from an array to an object
//   roles: {
//     id: string;
//     name: string;
//   } | null;
// }

// // Define the structure for consultant data
// interface ConsultantData {
//   id: string;
//   organization_id: string;
//   role_id: string;
//   organizations: {
//     id: string;
//     name: string;
//     type: string;
//   };
//   roles: {
//     id: string;
//     name: string;
//   } | null;
// }

// const formSchema = z.object({
//   email: z.string().email({ message: "Please enter a valid email address" }),
//   password: z
//     .string()
//     .min(6, { message: "Password must be at least 6 characters" }),
// });

// type FormValues = z.infer<typeof formSchema>;

// export default function Login() {
//   const router = useRouter();
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   const { mutate: login, isLoading } = useLogin();

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   // Get the functions from our auth store
//   const { setOrganizations, setSelectedOrganization } = useAuthStore();

//   const onSubmit = async (values: FormValues) => {
//     login(
//       { ...values },
//       {
//         onSuccess: async () => {
//           try {
//             // Fetch user data from Supabase
//             const { data: userData } =
//               await supabaseBrowserClient.auth.getUser();

//             const { data: consultantRoleData, error: consultantRoleError } =
//               await supabaseBrowserClient
//                 .from("roles")
//                 .select("id")
//                 .eq("name", "CONSULTANT")
//                 .single();

//             if (userData?.user) {
//               // Fetch user's organizations and role from org_users table
//               const { data, error: orgUserError } = await supabaseBrowserClient
//                 .from("org_users")
//                 .select(
//                   `
//                       id,
//                       organization_id,
//                       role_id,
//                       organizations:organization_id (
//                         id,
//                         name,
//                         type
//                       ),
//                       roles:role_id (
//                         id,
//                         name
//                       )
//                     `
//                 )
//                 .eq("user_id", userData.user.id)
//                 .neq("role_id", consultantRoleData?.id);

//               console.log("Organization Users : ", data);

//               // Cast the data to the correct type
//               const orgUserData = data;

//               console.log("Organization User : ", orgUserData);

//               if (orgUserError) {
//                 console.error(
//                   "Error fetching user organization/role:",
//                   orgUserError
//                 );
//               } else if (orgUserData && orgUserData.length > 0) {
//                 // Extract organizations from the data with their associated roles
//                 // const organizations = orgUserData
//                 //   .filter((item) => item.organizations && item.roles) // Filter out any null organizations or roles
//                 //   .map((item: OrgUserData) => ({
//                 //     id: item.organizations.id,
//                 //     name: item.organizations.name,
//                 //     type: item.organizations.type,
//                 //     role: item?.roles?.name, // Store the role with each organization
//                 //   }));
//                 // Extract organizations from the data with their associated roles
//                 const organizations = orgUserData
//                   .filter((item) => item.organizations && item.roles) // Filter out any null organizations or roles
//                   .map((item) => ({
//                     id: item.organizations.id, // Accessing the 'organizations' object directly
//                     name: item.organizations.name,
//                     type: item.organizations.type,
//                     role: item?.roles?.name, // Store the role with each organization
//                   }));

//                 // Store organizations in global state
//                 if (organizations.length > 0) {
//                   setOrganizations(organizations);

//                   // If there's only one organization, set it as selected
//                   if (organizations.length === 1) {
//                     setSelectedOrganization(organizations[0]);
//                   }
//                 }
//               }
//             }
//           } catch (error) {
//             console.error("Error fetching user organization/role:", error);
//           }

//           // Navigate to dashboard
//           router.push("/dashboard");
//           router.refresh();
//         },
//         onError: (error) => {
//           console.error("Refine login error:", error);
//           setErrorMessage("Invalid email or password. Please try again.");
//         },
//       }
//     );
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Right column - Image */}
//       <div className="hidden lg:block lg:w-1/2">
//         <div className="relative h-full w-full">
//           <Image
//             src="/placeholder.svg?height=1080&width=1920"
//             alt="Login cover"
//             fill
//             className="object-cover"
//             priority
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col justify-end p-12">
//             <h2 className="text-white text-3xl font-bold mb-2">Welcome back</h2>
//             <p className="text-white/80 text-lg max-w-md">
//               Sign in to access your account and continue where you left off.
//             </p>
//           </div>
//         </div>
//       </div>
//       {/* Left column - Form */}
//       <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
//         <div className="w-full max-w-md">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold">Welcome back</h1>
//             <p className="mt-2 text-muted-foreground">
//               Sign in to your account to continue
//             </p>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl">Sign in</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Form {...form}>
//                 <form
//                   onSubmit={form.handleSubmit(onSubmit)}
//                   className="space-y-4"
//                 >
//                   {errorMessage && (
//                     <Alert variant="destructive">
//                       <AlertDescription>{errorMessage}</AlertDescription>
//                     </Alert>
//                   )}

//                   <FormField
//                     control={form.control}
//                     name="email"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Email</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                             <Input
//                               placeholder="your@email.com"
//                               className="pl-10"
//                               {...field}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="password"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Password</FormLabel>
//                         <FormControl>
//                           <div className="relative">
//                             <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
//                             <Input
//                               type="password"
//                               placeholder="Your password"
//                               className="pl-10"
//                               {...field}
//                             />
//                           </div>
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <div className="flex justify-end">
//                     <Link
//                       href="/forgot-password"
//                       className="text-sm text-primary hover:underline"
//                     >
//                       Forgot your password?
//                     </Link>
//                   </div>

//                   <Button type="submit" className="w-full" disabled={isLoading}>
//                     {isLoading ? (
//                       <>
//                         <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                         Signing in...
//                       </>
//                     ) : (
//                       "Sign in"
//                     )}
//                   </Button>
//                 </form>
//               </Form>
//             </CardContent>
//             <CardFooter className="flex justify-center border-t p-4">
//               <p className="text-sm text-muted-foreground">
//                 Don't have an account?{" "}
//                 <Link
//                   href="/register"
//                   className="font-medium text-primary hover:underline"
//                 >
//                   Create account
//                 </Link>
//               </p>
//             </CardFooter>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import Link from "next/link";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLogin } from "@refinedev/core";
import { supabaseBrowserClient } from "@/utils/supabase/client";

// Define the structure of the data returned from the org_users table
interface OrgUserData {
  id: string;
  organization_id: string;
  role_id: string;
  organizations: {
    id: string;
    name: string;
    type: string;
  };
  roles: {
    id: string;
    name: string;
  } | null;
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Login() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate: login, isLoading } = useLogin();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Get the functions from our auth store
  const { setOrganizations, setSelectedOrganization } = useAuthStore();

  const onSubmit = async (values: FormValues) => {
    login(
      { ...values },
      {
        onSuccess: async () => {
          try {
            // Fetch user data from Supabase
            const { data: userData } =
              await supabaseBrowserClient.auth.getUser();

            const { data: consultantRoleData, error: consultantRoleError } =
              await supabaseBrowserClient
                .from("roles")
                .select("id")
                .eq("name", "CONSULTANT")
                .single();

            if (userData?.user) {
              // Fetch user's organizations and role from org_users table
              const { data, error: orgUserError } = await supabaseBrowserClient
                .from("org_users")
                .select(
                  `
                      id,
                      organization_id,
                      role_id,
                      organizations:organization_id (
                        id,
                        name,
                        type
                      ),
                      roles:role_id (
                        id,
                        name
                      )
                    `
                )
                .eq("user_id", userData.user.id)
                .neq("role_id", consultantRoleData?.id);

              console.log("Organization Users : ", data);

              // Cast the data to the correct type
              const orgUserData = data;

              console.log("Organization User : ", orgUserData);

              if (orgUserError) {
                console.error(
                  "Error fetching user organization/role:",
                  orgUserError
                );
              } else if (orgUserData && orgUserData.length > 0) {
                // Extract organizations from the data with their associated roles
                const organizations = orgUserData
                  .filter((item: any) => item.organizations && item.roles) // Filter out any null organizations or roles
                  .map((item: any) => ({
                    id: item.organizations.id,
                    name: item.organizations.name,
                    type: item.organizations.type,
                    role: item.roles?.name, // Store the role with each organization
                  }));

                // Store organizations in global state
                if (organizations.length > 0) {
                  setOrganizations(organizations);

                  // If there's only one organization, set it as selected
                  if (organizations.length === 1) {
                    setSelectedOrganization(organizations[0]);
                  }
                }
              }
            }
          } catch (error) {
            console.error("Error fetching user organization/role:", error);
          }

          // Navigate to dashboard
          router.push("/dashboard");
          router.refresh();
        },
        onError: (error) => {
          console.error("Refine login error:", error);
          setErrorMessage("Invalid email or password. Please try again.");
        },
      }
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Right column - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <div className="relative h-full w-full">
          <Image
            src="/placeholder.svg?height=1080&width=1920"
            alt="Login cover"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col justify-end p-12">
            <h2 className="text-white text-3xl font-bold mb-2">Welcome back</h2>
            <p className="text-white/80 text-lg max-w-md">
              Sign in to access your account and continue where you left off.
            </p>
          </div>
        </div>
      </div>
      {/* Left column - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Sign in</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  {errorMessage && (
                    <Alert variant="destructive">
                      <AlertDescription>{errorMessage}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="your@email.com"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="password"
                              placeholder="Your password"
                              className="pl-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign in"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex justify-center border-t p-4">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-medium text-primary hover:underline"
                >
                  Create account
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
