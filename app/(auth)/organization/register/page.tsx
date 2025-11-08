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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import LoginSvg from "@/public/images/secure-login.svg";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";
import { registerOrganization } from "@/app/api/auth";

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  workEmail: z.string().email("Invalid email address"),
  // phoneNumber: z.string().min(10, "Invalid phone number"),
  location: z.string().min(1, "Location is required"),
  companyName: z.string().min(2, "Company name is required"),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long",
  }),
  // jobTitle: z.string().min(2, "Job title is required"),
  // jobLevel: z.string().min(1, "Job level is required"),
});

export default function OrganizationalRegistration() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      workEmail: "",
      location: "",
      companyName: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values
    const { workEmail, location, companyName, password } = values;
    const adminName = values.firstName + " " + values.lastName;
    const organizationLogo = "http://localhost:3000/image.png";

    try {
      const userData = {
        organizationName: companyName,
        organizationLocation: location,
        adminName,
        adminEmail: workEmail,
        password,
        organizationLogo,
      };
      setLoading(true);
      await registerOrganization(userData);
      router.push("/successRegistration");
    } catch (error) {
      //@ts-expect-error very neccesary
      if (typeof error.message === "string") {
        //@ts-expect-error very neccesary
        setErrorMessage(error.message);
      } else {
        //@ts-expect-error very neccesary
        setErrorMessage(error.message[0]);
      }
      //@ts-expect-error very neccesary
      console.log(error.response.data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
      {/* Image Section - hidden on small screens */}
      <div className="hidden lg:block lg:col-span-2">
        <Image src={LoginSvg} alt="Register svg image" />
      </div>

      {/* Form Section - spans 3 columns on larger screens */}
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-none w-[450px]">
          <CardHeader>
            <CardTitle className="text-3xl text-center leading-[2.5rem]">
              Register Your Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full flex flex-col gap-4"
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
                            className="border-gray-500 py-6 rounded-none"
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
                            className="border-gray-500 py-6 rounded-none"
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
                  name="workEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold mb-2">
                        Work Email *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-gray-500 py-6 rounded-none"
                          type="text"
                          onFocus={() => setErrorMessage("")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Location Select Field */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold mb-2">
                        Where are you located? *
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="United States">Ghana</SelectItem>
                          <SelectItem value="Canada">Others</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold mb-2">
                        Company Name *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-gray-500 py-6 rounded-none"
                          type="text"
                          id="companyname"
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
                      <FormLabel className="font-bold mb-2">
                        Password *
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="border-gray-500 py-6 rounded-none"
                          type="password"
                          id="password"
                          onFocus={() => setErrorMessage("")}
                          {...field}
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
                    "w-full bg-gray-800 text-white mt-4 hover:bg-gray-950",
                    loading && "bg-gray-500 hover:bg-gray-600"
                  )}
                >
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>
            </Form>
            <p className="mt-4 text-xs text-center text-gray-500">
              By signing up, you agree to our{" "}
              <Link href="#" className="text-purple-600 hover:underline">
                Terms of Use
              </Link>{" "}
              and{" "}
              <Link href="#" className="text-purple-600 hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
