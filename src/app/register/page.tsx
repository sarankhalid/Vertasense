"use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { z } from "zod";
// import { useForm, FormProvider } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRegister } from "@refinedev/core";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { PersonalInfoForm } from "@/components/register/personal-info-form";
// import { OrganizationInfoForm } from "@/components/register/organization-info-form";
// import Link from "next/link";

// const personalInfoSchema = z
//   .object({
//     name: z.string().min(2),
//     email: z.string().email(),
//     password: z.string().min(8),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   });

// const organizationSchema = z.object({
//   phone: z.string().optional(),
//   company: z.string().optional(),
//   website: z.string().optional(),
//   terms: z.boolean(),
// });

// export default function Register() {
//   const [activeTab, setActiveTab] = useState("personal");
//   const { mutate: register } = useRegister();
//   const router = useRouter();

//   const personalForm = useForm({
//     resolver: zodResolver(personalInfoSchema),
//     defaultValues: {
//       name: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const organizationForm = useForm({
//     resolver: zodResolver(organizationSchema),
//     defaultValues: {
//       phone: "",
//       company: "",
//       website: "",
//       terms: false,
//     },
//   });

//   // API call function
//   const checkUserExists = async (email: string) => {
//     try {
//       const response = await fetch("/api/check-user", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         // Handle success, move to the next tab
//         setActiveTab("organization");
//       } else {
//         // Handle error (e.g., user already exists or email not verified)
//         console.error(data.message);
//         // alert(data.message); // You can replace this with a more elegant error handling mechanism.
//       }
//     } catch (error) {
//       console.error("Error during API call:", error);
//       alert("An error occurred while checking user.");
//     }
//   };

//   const handlePersonalSubmit = async () => {
//     const { email } = personalForm.getValues(); // Extract email from the form
//     if (email) {
//       await checkUserExists(email); // Call the API to check if the user exists
//     }
//   };

//   const handleOrganizationSubmit = async (data: any) => {
//     const formData = { ...personalForm.getValues(), ...data };
//     await register(formData, {
//       onSuccess: () => {
//         router.push("/login");
//       },
//       onError: (error) => {
//         console.error("Error:", error);
//       },
//     });
//   };

//   return (
//     <div className="flex min-h-screen">
//       {/* Right column - Image */}
//       <div className="hidden lg:block lg:w-1/2">
//         <div className="relative h-full w-full">
//           <img
//             src="/placeholder.svg?height=1080&width=1920"
//             alt="Registration cover"
//             // fill
//             className="object-cover"
//             // priority
//           />
//           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col justify-end p-12">
//             <h2 className="text-white text-3xl font-bold mb-2">
//               Join our platform
//             </h2>
//             <p className="text-white/80 text-lg max-w-md">
//               Create an account to access all features and start managing your
//               business efficiently.
//             </p>
//           </div>
//         </div>
//       </div>
//       {/* Left column - Form */}
//       <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
//         <div className="w-full max-w-md">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold">Create your account</h1>
//             <p className="mt-2 text-muted-foreground">
//               Get started with our platform in just a few steps
//             </p>
//           </div>

//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="grid w-full grid-cols-2 mb-8">
//               <TabsTrigger value="personal">Personal Info</TabsTrigger>
//               {/* <TabsTrigger
//                 value="organization"
//                 disabled={!personalInfoComplete}
//                 className={`${
//                   !personalInfoComplete ? "cursor-not-allowed opacity-50" : ""
//                 }`}
//               >
//                 Organization
//               </TabsTrigger> */}
//               <TabsTrigger
//                 value="organization"
//                 disabled={!isOrganizationTabEnabled} // Disable the tab until API call is successful
//               >
//                 Organization
//               </TabsTrigger>
//             </TabsList>

//             {/* Personal Info Tab */}
//             <TabsContent value="personal">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-xl">
//                     Personal Information
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <FormProvider {...personalForm}>
//                     <PersonalInfoForm onSubmit={handlePersonalSubmit} />
//                   </FormProvider>
//                 </CardContent>
//                 <CardFooter className="flex justify-center border-t p-4">
//                   <p className="text-sm text-muted-foreground">
//                     Already have an account?{" "}
//                     <Link
//                       href="/login"
//                       className="font-medium text-primary hover:underline"
//                     >
//                       Sign in
//                     </Link>
//                   </p>
//                 </CardFooter>
//               </Card>
//             </TabsContent>

//             {/* Organization Info Tab */}
//             <TabsContent value="organization">
//               <Card>
//                 <CardHeader>
//                   <CardTitle className="text-xl">
//                     Organization Details
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   <FormProvider {...organizationForm}>
//                     <OrganizationInfoForm onSubmit={handleOrganizationSubmit} />
//                   </FormProvider>
//                 </CardContent>
//                 <CardFooter className="flex justify-center border-t p-4">
//                   <p className="text-sm text-muted-foreground">
//                     Already have an account?{" "}
//                     <Link
//                       href="/login"
//                       className="font-medium text-primary hover:underline"
//                     >
//                       Sign in
//                     </Link>
//                   </p>
//                 </CardFooter>
//               </Card>
//             </TabsContent>
//           </Tabs>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@refinedev/core";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonalInfoForm } from "@/components/register/personal-info-form";
import { OrganizationInfoForm } from "@/components/register/organization-info-form";
import Link from "next/link";

const personalInfoSchema = z
  .object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const organizationSchema = z.object({
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().optional(),
  terms: z.boolean(),
});

export default function Register() {
  const [activeTab, setActiveTab] = useState("personal");
  const { mutate: register } = useRegister();
  const router = useRouter();

  const personalForm = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const organizationForm = useForm({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      phone: "",
      company: "",
      website: "",
      terms: false,
    },
  });

  // API call function to check if the user exists
  const checkUserExists = async (email: string) => {
    try {
      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // if (data.message === "User already exists and email is verified.") {
        // Set error on email field
        // personalForm.setError("email", {
        //   type: "manual",
        //   message: data.message,
        // });
        // } else if (data.message === "User exists but email is not verified.") {
        //   personalForm.setError("email", {
        //     type: "manual",
        //     message: data.message,
        //   });
        // } else if (
        //   data.message === "User does not exist, invite logic can go here."
        // ) {
        setActiveTab("organization");
        // }
      } else {
        // If there's an error response, show it on the email field
        personalForm.setError("email", {
          type: "manual",
          message: data.message,
        });
      }
    } catch (error) {
      console.error("Error during user check:", error);
      personalForm.setError("email", {
        type: "manual",
        message: "An error occurred while checking the user.",
      });
    }
  };

  const handlePersonalSubmit = async () => {
    const { email } = personalForm.getValues(); // Extract email from the form
    if (email) {
      await checkUserExists(email); // Call the API to check if the user exists
    }
  };

  const handleOrganizationSubmit = async (data: any) => {
    const formData = { ...personalForm.getValues(), ...data };
    await register(formData, {
      onSuccess: () => {
        router.push("/login");
      },
      onError: (error) => {
        console.error("Error:", error);
      },
    });
  };

  // Use isSubmitting from react-hook-form
  const isPersonalSubmitting = personalForm.formState.isSubmitting;
  const isOrganizationSubmitting = organizationForm.formState.isSubmitting;

  return (
    <div className="flex min-h-screen">
      {/* Right column - Image */}
      <div className="hidden lg:block lg:w-1/2">
        <div className="relative h-full w-full">
          <img
            src="/placeholder.svg?height=1080&width=1920"
            alt="Registration cover"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/20 flex flex-col justify-end p-12">
            <h2 className="text-white text-3xl font-bold mb-2">
              Join our platform
            </h2>
            <p className="text-white/80 text-lg max-w-md">
              Create an account to access all features and start managing your
              business efficiently.
            </p>
          </div>
        </div>
      </div>
      {/* Left column - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create your account</h1>
            <p className="mt-2 text-muted-foreground">
              Get started with our platform in just a few steps
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>

              {/* Organization Tab is always disabled */}
              <TabsTrigger value="organization" disabled>
                Organization
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormProvider {...personalForm}>
                    <PersonalInfoForm
                      onSubmit={handlePersonalSubmit}
                      isSubmitting={isPersonalSubmitting}
                    />
                  </FormProvider>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-primary hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Organization Info Tab */}
            <TabsContent value="organization">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    Organization Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FormProvider {...organizationForm}>
                    <OrganizationInfoForm
                      onSubmit={handleOrganizationSubmit}
                      isSubmitting={isOrganizationSubmitting}
                    />
                  </FormProvider>
                </CardContent>
                <CardFooter className="flex justify-center border-t p-4">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="font-medium text-primary hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
