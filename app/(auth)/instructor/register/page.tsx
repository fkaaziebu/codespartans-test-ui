"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { register } from "@/app/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import LoginSvg from "@/public/images/secure-login.svg";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    email: z
      .string({
        required_error: "Email is required",
      })
      .email({
        message: "Must be a valid email",
      }),
    password: z.string().min(6, {
      message: "Password must be at least 6 characters long",
    }),
    confirmPassword: z.string().min(6, {
      message: "Confirm Password must be at least 6 characters long",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"], // Field to display the error on
  });
//Define your form here
export default function IndividualRegistration() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  //Define a submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { email, password } = values;
    const name = values.firstName + " " + values.lastName;

    try {
      const userData = { name, email, password };
      setLoading(true);
      await register(userData);
      router.push("/successRegistration");
    } catch (error) {
      //@ts-expect-error very necessary
      if (typeof error.message === "string") {
        //@ts-expect-error very necessary
        setErrorMessage(error.message);
      } else {
        //@ts-expect-error very necessary
        setErrorMessage(error.message[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl flex flex-col lg:flex-row items-center gap-8 lg:gap-36 px-4">
      {/* Image Section */}
      <div className="w-full lg:w-[60%] hidden lg:block">
        <Image src={LoginSvg} alt="Register svg image" priority />
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-[40%]">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-3xl text-center leading-[2.5rem]">
              Sign up and Start Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 w-full"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold mb-2">
                          First Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-gray-500 py-3 md:py-6 rounded-none"
                            type="text"
                            id="firstname"
                            onFocus={() => setErrorMessage("")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold mb-2">
                          Last Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="border-gray-500 py-3 md:py-6 rounded-none"
                            type="text"
                            onFocus={() => setErrorMessage("")}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@mail.com"
                          className="border-gray-500 py-3 md:py-6 rounded-none"
                          id="email"
                          type="text"
                          onFocus={() => setErrorMessage("")}
                          {...field}
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
                          id="password"
                          type="password"
                          placeholder="password"
                          onFocus={() => setErrorMessage("")}
                          {...field}
                          className="border-gray-500 py-3 md:py-6 rounded-none block w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                          id="confirmPassword"
                          type="password"
                          placeholder="confirm password"
                          onFocus={() => setErrorMessage("")}
                          {...field}
                          className="border-gray-500 py-3 md:py-6 rounded-none block w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div>
                  <div className="flex items-center mb-4">
                    <Input
                      type="checkbox"
                      id="specialoffers"
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <FormLabel className="ml-2 block text-sm font-bold text-gray-900">
                      {" "}
                      Send me special offers, personalized recommendations, and
                      learning tips
                    </FormLabel>
                  </div>
                  {errorMessage && (
                    <div className="px-4 py-2 bg-red-50 text-red-800 rounded-none text-sm">
                      {errorMessage}
                    </div>
                  )}
                  <Button
                    disabled={loading}
                    type="submit"
                    className={cn(
                      "w-full bg-purple-600 text-white py-3 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 text-lg font-semibold mt-4",
                      loading && "bg-purple-400 hover:bg-purple-500"
                    )}
                  >
                    {loading ? "Signing up..." : "Sign up"}
                  </Button>
                </div>
              </form>
            </Form>
            <div>
              <p className="mt-4 text-xs text-center text-gray-500">
                By signing up, you agree to our{" "}
                <a href="#" className="text-purple-600 hover:underline">
                  Terms of Use
                </a>{" "}
                and{" "}
                <a href="#" className="text-purple-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/individual/login"
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
