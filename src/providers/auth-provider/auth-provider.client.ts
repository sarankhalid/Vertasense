"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

export const authProviderClient: AuthProvider = {
    login: async ({ email, password }) => {
        const { data, error } = await supabaseBrowserClient.auth.signInWithPassword(
            {
                email,
                password,
            }
        );

        console.log("Data : ", data)
        console.log("Error : ", error)

        if (error) {
            return {
                success: false,
                error,
            };
        }

        if (data?.session) {
            await supabaseBrowserClient.auth.setSession(data.session);

            return {
                success: true,
                redirectTo: "/",
            };
        }

        // for third-party login
        return {
            success: false,
            error: {
                name: "LoginError",
                message: "Invalid username or password",
            },
        };
    },
    logout: async () => {
        // Clear the auth store data
        const clearAuth = useAuthStore.getState().clearAuth;
        clearAuth();
        
        const { error } = await supabaseBrowserClient.auth.signOut();

        if (error) {
            return {
                success: false,
                error,
            };
        }

        return {
            success: true,
            redirectTo: "/login",
        };
    },
    // register: async ({ email, password }) => {
    //   try {
    //     const { data, error } = await supabaseBrowserClient.auth.signUp({
    //       email,
    //       password,
    //     });

    //     if (error) {
    //       return {
    //         success: false,
    //         error,
    //       };
    //     }

    //     if (data) {
    //       return {
    //         success: true,
    //         redirectTo: "/",
    //       };
    //     }
    //   } catch (error: any) {
    //     return {
    //       success: false,
    //       error,
    //     };
    //   }

    //   return {
    //     success: false,
    //     error: {
    //       message: "Register failed",
    //       name: "Invalid email or password",
    //     },
    //   };
    // },
    register: async ({ email, password, name, phone, company, designation, website }) => {
        try {
            const { data, error } = await supabaseBrowserClient.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name,
                        phone,
                        company,
                        designation,
                        website,
                        role: "CONSULTING_FIR_ADMIN"
                    },
                },
            });

            console.log("Data : ", data)
            console.log("Error : ", error)

            if (error) {
                return {
                    success: false,
                    error,
                };
            }

            if (data) {
                return {
                    success: true,
                    redirectTo: "/",
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error,
            };
        }

        return {
            success: false,
            error: {
                message: "Register failed",
                name: "Invalid email or password",
            },
        };
    },
    check: async () => {
        const { data, error } = await supabaseBrowserClient.auth.getUser();
        const { user } = data;


        if (error) {
            console.log("Error : ", error)
            return {
                authenticated: false,
                redirectTo: "/login",
                logout: true,
            };
        }

        if (user) {
            return {
                authenticated: true,
            };
        }

        return {
            authenticated: false,
            redirectTo: "/login",
        };
    },
    getPermissions: async () => {
        const user = await supabaseBrowserClient.auth.getUser();

        if (user) {
            return user.data.user?.role;
        }

        return null;
    },
    getIdentity: async () => {
        const { data } = await supabaseBrowserClient.auth.getUser();

        if (data?.user) {
            return {
                ...data.user,
                name: data.user.email,
            };
        }

        return null;
    },
    onError: async (error) => {
        if (error?.code === "PGRST301" || error?.code === 401) {
            return {
                logout: true,
            };
        }

        return { error };
    },
};
