"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OAuthSuccess() {

  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {

    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      router.push("/explore");
    }

  }, []);

  return <p>Logging in...</p>;
}