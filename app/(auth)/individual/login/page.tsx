"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Slide, toast } from "react-toastify";
import { z } from "zod";
import { login } from "@/app/api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import apple from "@/public/images/apple_546072.png";
import facebook from "@/public/images/facebook_5968764.png";
import google from "@/public/images/google_13170545.png";
// svg images
import LoginSvg from "@/public/images/secure-login.svg";

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(2, {
    message: "Password must be at least 2 characters.",
  }),
});

export default function IndividualLogin() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3007/v1";

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;

    try {
      setLoading(true);
      const response = await login(email, password);
      toast.success("Login successful", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
      sessionStorage.setItem("token", response.access_token);
      sessionStorage.setItem("userId", response.id);
      router.push("/");
    } catch (error) {
      // @ts-expect-error very necessary
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-6 lg:flex-row lg:gap-36">
      {/* Hidden on small screens */}
      <div className="hidden lg:block">
        <Image src={LoginSvg} alt="Login svg image" />
      </div>
      <div className="mr-0 w-auto lg:mr-24 lg:w-auto">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="hidden text-center text-3xl leading-[2.5rem] lg:block">
              Log in to continue your learning journey
            </CardTitle>
            <CardTitle className="block text-center text-3xl leading-[2.5rem] lg:hidden">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="johndoe@gmail.com"
                          className="rounded-none border-gray-500 py-6"
                          {...field}
                          onFocus={() => setErrorMessage("")}
                          type="email"
                        />
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
                      <FormLabel className="font-bold">Password</FormLabel>
                      <FormControl>
                        <Input
                          className="rounded-none border-gray-500 py-6"
                          {...field}
                          onFocus={() => setErrorMessage("")}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {errorMessage && (
                  <div className="rounded-lg bg-red-50 px-4 py-1 text-sm text-red-800">
                    {errorMessage}
                  </div>
                )}
                <Button
                  disabled={loading}
                  type="submit"
                  className={cn(
                    "w-full rounded-none bg-purple-600 py-6 font-bold hover:bg-purple-700",
                    loading && "bg-purple-400 hover:bg-purple-500",
                  )}
                >
                  {loading ? "Loading..." : "Login"}
                </Button>
              </form>
            </Form>

            <div className="space-y-5">
              <div className="flex w-full items-center">
                <div className="h-[0.1rem] w-full bg-gray-300" />
                <span className="w-full text-center text-sm text-gray-500">
                  Other log in options
                </span>
                <div className="h-[0.1rem] w-full bg-gray-300" />
              </div>
              <div className="flex items-center justify-center gap-5">
                <Link
                  href={`${baseUrl}/auth/google/login`}
                  className="rounded-none border border-gray-900"
                >
                  <Image src={google} alt="google" height={40} width={40} />
                </Link>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-none border-gray-900"
                >
                  <Image src={facebook} alt="facebook" height={30} width={30} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-none border-gray-900"
                >
                  <Image src={apple} alt="apple" height={30} width={30} />
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center bg-gray-100 px-2 py-4">
                  <span>Forgot Password?</span>
                  <Link
                    href="/individual/forgotPassword"
                    className="ml-2 font-bold text-purple-700 underline"
                  >
                    Reset
                  </Link>
                </div>

                <div className="flex items-center justify-center bg-gray-100 px-2 py-4">
                  <span>Don&apos;t have an account?</span>
                  <Link
                    href="/individual/register"
                    className="ml-2 font-bold text-purple-700 underline"
                  >
                    Sign up
                  </Link>
                </div>
                <div className="flex items-center justify-center bg-gray-100 px-2 py-4">
                  <Link
                    href="/organization/login"
                    className="font-bold text-purple-700 underline"
                  >
                    Log in with your organization
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
