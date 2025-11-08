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
import LoginSvg from "@/public/images/secure-login.svg";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { requestResetPassword } from "@/app/api/auth";

const formSchema = z.object({
  email: z.string().email("Input a valid email."),
});

export default function ForgotPassword() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await requestResetPassword(values.email);
      router.push("/individual/forgotPassword/reset-successful");
      console.log(response.data);
    } catch (error) {
      console.error("Reset password error:", error);

      setErrorMessage(
        //@ts-expect-error - necessary as error may not have message
        error.message || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-[100%] items-center justify-center gap-36 px-4 py-8 md:flex-row">
      <div className="hidden w-full md:block md:w-1/2 lg:w-[30%]">
        <Image src={LoginSvg} alt="Login svg image" />
      </div>
      <div className="w-full items-center justify-center md:w-1/2 lg:w-[30%]">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center text-2xl leading-tight md:text-3xl">
              Forgot Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full space-y-5"
                aria-busy={loading}
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
                          className="rounded-none border-gray-500 py-3 md:py-6"
                          {...field}
                          onFocus={() => setErrorMessage(null)}
                          type="email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {errorMessage && (
                  <div
                    className="rounded-none bg-red-50 px-4 py-2 text-sm text-red-800"
                    aria-live="assertive"
                  >
                    {errorMessage}
                  </div>
                )}
                <Button
                  disabled={loading}
                  type="submit"
                  className={cn(
                    "w-full rounded-none bg-purple-600 py-3 font-bold hover:bg-purple-700 md:py-6",
                    loading && "bg-purple-400 hover:bg-purple-500",
                  )}
                  aria-busy={loading}
                >
                  {loading ? "Processing..." : "Reset"}
                </Button>
              </form>
            </Form>
            <div className="flex items-center justify-center bg-gray-100">
              <Button
                type="button"
                className="w-full rounded-none bg-purple-600 py-3 font-bold hover:bg-purple-700 md:py-6"
                onClick={() => router.back()}
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
