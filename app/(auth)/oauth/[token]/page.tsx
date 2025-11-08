"use client";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OauthPage() {
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3007/v1";

  const oauthLogin = async () => {
    const token = pathname.split("/").pop();
    if (!token) {
      return;
    }
    sessionStorage.setItem("token", token);
    try {
      setLoading(true);
      const response = await axios.get(`${baseUrl}/auth/students/profile`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      console.log(token);
      sessionStorage.setItem("userId", response.data.userId);
      router.push("/");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    oauthLogin();
  }, []);

  return <div>{loading ? "loading" : "redirecting please wait "}</div>;
}
