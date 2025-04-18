"use client";

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

  // Add explicit loading state for organization form
  const [isOrganizationSubmitting, setIsOrganizationSubmitting] =
    useState(false);

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
    console.log("Email : ", email);
    try {
      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      console.log("Response : ", response);

      if (response.ok) {
        setActiveTab("organization");
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
      await checkUserExists(email);
    }
  };

  const handleOrganizationSubmit = async (data: any) => {
    // Explicitly set loading state first
    console.log("Setting organization loading state to true");
    setIsOrganizationSubmitting(true);
    
    // Force a delay to ensure the state update is rendered
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log("Organization loading state after setting:", isOrganizationSubmitting);
    
    try {
      const formData = { ...personalForm.getValues(), ...data };
      
      // Add artificial delay to make loading state more visible during testing
      // Remove this in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      register(formData, {
        onSuccess: () => {
          router.push("/login");
        },
        onError: (error) => {
          console.error("Error:", error);
        },
      });
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      // Ensure loading state is reset
      setIsOrganizationSubmitting(false);
    }
  };

  // Use explicit loading state for organization form and react-hook-form for personal form
  const isPersonalSubmitting = personalForm.formState.isSubmitting;

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

              {/* Organization Tab is disabled until personal info is validated */}
              <TabsTrigger
                value="organization"
                disabled={activeTab !== "organization"}
              >
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
