// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { supabaseBrowserClient } from "@/utils/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// export default function ResetPassword() {
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams();

//   // Extract the access token and refresh token from the URL
//   const accessToken = searchParams.get("access_token");
//   const refreshToken = searchParams.get("refresh_token");
//   const type = searchParams.get("type");

//   useEffect(() => {
//     // If we have tokens in the URL, set the session
//     const setSession = async () => {
//       if (accessToken && refreshToken) {
//         try {
//           const { error } = await supabaseBrowserClient.auth.setSession({
//             access_token: accessToken,
//             refresh_token: refreshToken,
//           });

//           if (error) {
//             console.error("Error setting session:", error);
//             setError("Failed to authenticate. Please try again or request a new reset link.");
//           }
//         } catch (err) {
//           console.error("Exception setting session:", err);
//           setError("An unexpected error occurred. Please try again later.");
//         }
//       }
//     };

//     setSession();
//   }, [accessToken, refreshToken]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);

//     // Validate passwords
//     if (password !== confirmPassword) {
//       setError("Passwords do not match");
//       setLoading(false);
//       return;
//     }

//     if (password.length < 8) {
//       setError("Password must be at least 8 characters long");
//       setLoading(false);
//       return;
//     }

//     try {
//       // Update the password
//       const { error } = await supabaseBrowserClient.auth.updateUser({
//         password,
//       });

//       if (error) {
//         console.error("Error updating password:", error);
//         setError(error.message);
//       } else {
//         setSuccess(true);
//         // Redirect to login page after 3 seconds
//         setTimeout(() => {
//           router.push("/login");
//         }, 3000);
//       }
//     } catch (err) {
//       console.error("Exception updating password:", err);
//       setError("An unexpected error occurred. Please try again later.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-100">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle>Reset Password</CardTitle>
//           <CardDescription>
//             {type === "magiclink"
//               ? "You've been authenticated via magic link. Please set a new password for your account."
//               : "Please enter a new password for your account."}
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           {success ? (
//             <div className="bg-green-100 text-green-800 p-4 rounded-md">
//               Password updated successfully! Redirecting to login page...
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-4">
//               {error && (
//                 <div className="bg-red-100 text-red-800 p-4 rounded-md">
//                   {error}
//                 </div>
//               )}
//               <div className="space-y-2">
//                 <Label htmlFor="password">New Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   required
//                   placeholder="Enter your new password"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword">Confirm Password</Label>
//                 <Input
//                   id="confirmPassword"
//                   type="password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   required
//                   placeholder="Confirm your new password"
//                 />
//               </div>
//               <Button type="submit" className="w-full" disabled={loading}>
//                 {loading ? "Updating..." : "Reset Password"}
//               </Button>
//             </form>
//           )}
//         </CardContent>
//         <CardFooter className="flex justify-center">
//           <Button variant="link" onClick={() => router.push("/login")}>
//             Back to Login
//           </Button>
//         </CardFooter>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabaseBrowserClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Function to extract tokens from URL hash
    const getHashParams = () => {
      if (typeof window !== "undefined") {
        const hash = window.location.hash.substring(1);
        return new URLSearchParams(hash);
      }
      return new URLSearchParams();
    };

    // Set session based on tokens from hash or query params
    const setSession = async () => {
      // Try to get tokens from hash first (for invite links)
      const hashParams = getHashParams();
      let accessToken = hashParams.get("access_token");
      let refreshToken = hashParams.get("refresh_token");
      let type = hashParams.get("type");

      // If not in hash, try query params (for recovery links)
      if (!accessToken || !refreshToken) {
        accessToken = searchParams.get("access_token");
        refreshToken = searchParams.get("refresh_token");
        type = searchParams.get("type");
      }

      console.log("Auth type:", type);

      if (accessToken && refreshToken) {
        try {
          const { error } = await supabaseBrowserClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Error setting session:", error);
            setError(
              "Failed to authenticate. Please try again or request a new reset link."
            );
          }
        } catch (err) {
          console.error("Exception setting session:", err);
          setError("An unexpected error occurred. Please try again later.");
        }
      } else {
        // Check if we're already authenticated
        const { data } = await supabaseBrowserClient.auth.getSession();
        if (!data.session) {
          setError(
            "No authentication tokens found. Please use a valid reset link."
          );
        }
      }
    };

    setSession();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      // Update the password
      const { error } = await supabaseBrowserClient.auth.updateUser({
        password,
      });

      if (error) {
        console.error("Error updating password:", error);
        setError(error.message);
      } else {
        setSuccess(true);
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      }
    } catch (err) {
      console.error("Exception updating password:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Determine the auth type from hash or search params
  const getAuthType = () => {
    if (typeof window !== "undefined") {
      const hash = new URLSearchParams(window.location.hash.substring(1));
      const hashType = hash.get("type");
      if (hashType) return hashType;
    }
    return searchParams.get("type");
  };

  const authType = getAuthType();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Password</CardTitle>
          <CardDescription>
            {authType === "invite"
              ? "Welcome! Please set a password for your account."
              : authType === "magiclink"
              ? "You've been authenticated via magic link. Please set a new password for your account."
              : "Please enter a new password for your account."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-md">
              Password updated successfully! Redirecting to login page...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-100 text-red-800 p-4 rounded-md">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm your new password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Set Password"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push("/login")}>
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
