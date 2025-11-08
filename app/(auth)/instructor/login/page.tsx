"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import apple from "@/public/images/apple_546072.png";
import facebook from "@/public/images/facebook_5968764.png";
import google from "@/public/images/google_13170545.png";
import { login } from "@/app/api/auth";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// svg images
import LoginSvg from "@/public/images/secure-login.svg";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { Slide, toast } from "react-toastify";

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
      router.push("/instructor/home");
    } catch (error) {
      // @ts-expect-error very necessary
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl flex flex-col gap-1 md:flex-row items-center gap-6 md:gap-36">
      {/* Hidden on small screens */}
      <div className="hidden md:block w-[60%]">
        <Image src={LoginSvg} alt="Login svg image" />
      </div>
      <div className="w-full md:w-[40%] mr-0 md:mr-24">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl text-center leading-[2.5rem] hidden lg:block">
              Log in to continue your learning journey
            </CardTitle>
            <CardTitle className="text-3xl text-center leading-[2.5rem] block lg:hidden">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 w-full"
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
                          className="border-gray-500 py-6 rounded-none"
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
                          className="border-gray-500 py-6 rounded-none"
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
                  <div className="px-4 py-1 bg-red-50 text-red-800 rounded-lg text-sm">
                    {errorMessage}
                  </div>
                )}
                <Button
                  disabled={loading}
                  type="submit"
                  className={cn(
                    "w-full rounded-none py-6 bg-purple-600 hover:bg-purple-700 font-bold",
                    loading && "bg-purple-400 hover:bg-purple-500"
                  )}
                >
                  {loading ? "Loading..." : "Login"}
                </Button>
              </form>
            </Form>

            <div className="space-y-5">
              <div className="flex w-full items-center">
                <div className="w-full bg-gray-300 h-[0.1rem]" />
                <span className="w-full text-sm text-gray-500 text-center">
                  Other log in options
                </span>
                <div className="w-full bg-gray-300 h-[0.1rem]" />
              </div>
              <div className="flex items-center justify-center gap-5">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-none border-gray-900"
                >
                  <Image src={google} alt="google" height={30} width={30} />
                </Button>
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
                    href="/instructor/forgotPassword"
                    className="ml-2 underline text-purple-700 font-bold"
                  >
                    Reset
                  </Link>
                </div>

                <div className="flex items-center justify-center bg-gray-100 px-2 py-4">
                  <span>Don&apos;t have an account?</span>
                  <Link
                    href="/instructor/register"
                    className="ml-2 underline text-purple-700 font-bold"
                  >
                    Sign up
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
