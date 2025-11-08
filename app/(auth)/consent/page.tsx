"use client";
import axios from "axios";
import { LoaderCircle, LogIn, MailPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function ConsentPage() {
  return (
    <Suspense fallback={<p>Loading ...</p>}>
      <Page />
    </Suspense>
  );
}

function Page() {
  const router = useRouter();
  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3007/v1";
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const registerUser = async ({
    email,
    firstName,
    lastName,
  }: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  }) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${baseUrl}/auth/consent`, {
        consent: "yes",
        email,
        firstName,
        lastName,
      });

      router.replace(response.data.redirectUrl);
    } catch (error) {
      toast({
        title: "Account creation error",
        // @ts-expect-error error
        description: `${error?.response?.data?.message[0]}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-medium">
          Create a new account
        </CardTitle>
        <CardDescription>To get started, please sign up</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <div className="flex items-center justify-center space-x-2 rounded-lg bg-gray-50 p-3">
            <MailPlus className="mr-1 h-4 w-4" />
            <span className="text-sm text-gray-600">
              {searchParams.get("email")}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-center space-x-2"
          onClick={() =>
            registerUser({
              email: searchParams.get("email"),
              firstName: searchParams.get("firstName"),
              lastName: searchParams.get("lastName"),
            })
          }
        >
          <LogIn className="mr-2 h-4 w-4" />
          <span>Sign up with Google</span>
          {isLoading && <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />}
        </Button>

        <p className="text-center text-xs text-gray-500">
          By signing up, I agree to the Codespartans{" "}
          <a href="#" className="text-gray-900 underline">
            Terms of Service
          </a>{" "}
          and acknowledge that the{" "}
          <a href="#" className="text-gray-900 underline">
            Privacy Statement
          </a>{" "}
          applies.
        </p>
      </CardContent>
    </Card>
  );
}
