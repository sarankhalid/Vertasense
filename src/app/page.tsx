"use client";

import { Suspense, useEffect } from "react";
import { WelcomePage } from "@refinedev/core";
import { useRouter } from "next/navigation";

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect user to the login page when this component mounts
    router.push("/login");
  }, [router]);

  return (
    <Suspense>
      <WelcomePage />
    </Suspense>
  );
}
