"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

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
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import LoginSvg from "@/public/images/secure-login.svg";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { resetPassword } from "@/app/api/auth";
import { Slide, toast } from "react-toastify";

const formSchema = z
  .object({
    email: z.string(),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
    confirmPassword: z.string().min(6, {
      message: "Password must be at least 6 characters.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function OrganizationalLogin() {
  return (
    <Suspense fallback={<p>Loading ...</p>}>
      <ActualOrganizationalLogin />
    </Suspense>
  );
}

function ActualOrganizationalLogin() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const resetCode = searchParams.get("resetCode");

    const { email, password } = values;

    if (!resetCode) {
      setErrorMessage("Reset code is required");
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, password, resetCode);
      toast.success("Password Reset Successful", {
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
    } catch (error) {
      //@ts-expect-error necessary
      setErrorMessage(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-8 px-4 py-8 md:flex-row md:gap-16">
      <div className="flex w-full justify-center md:w-1/2">
        <Image
          src={LoginSvg}
          alt="Login svg image"
          className="max-w-xs md:max-w-full"
        />
      </div>
      <div className="w-full md:w-1/2">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center text-2xl leading-8 md:text-3xl md:leading-[2.5rem]">
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-4 md:space-y-5"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@email.com"
                          className="rounded-none border-gray-500 py-3 md:py-4"
                          {...field}
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
                      <FormLabel className="font-bold">New Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder=""
                          className="rounded-none border-gray-500 py-3 md:py-4"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder=""
                          className="rounded-none border-gray-500 py-3 md:py-4"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {errorMessage && (
                  <div className="rounded bg-red-50 px-4 py-2 text-sm text-red-800">
                    {errorMessage}
                  </div>
                )}
                <Button
                  disabled={loading}
                  type="submit"
                  className={cn(
                    "w-full rounded bg-purple-600 py-3 font-bold hover:bg-purple-700 md:py-4",
                    loading && "bg-purple-400 hover:bg-purple-500",
                  )}
                >
                  {loading ? "Processing..." : "Reset"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
