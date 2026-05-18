"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn) {
      router.replace("/moderacion");
    } else {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  return null;
}