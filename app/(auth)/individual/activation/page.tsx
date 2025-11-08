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
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";
import { Slide, toast } from "react-toastify";
import { activateAccount } from "@/app/api/auth";

const formSchema = z.object({
  email: z.string().min(2, {
    message: "Input a valid email.",
  }),
});

export default function ActivationCode() {
  return (
    <Suspense fallback={<p>Loading ...</p>}>
      <ActualActivatAccount />
    </Suspense>
  );
}

function ActualActivatAccount() {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  // Define the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  // Define submit handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    const activationCode = searchParams.get("activationCode");
    const { email } = values;
    if (!activationCode) {
      setErrorMessage("Activation code is required");
      return;
    }
    try {
      setLoading(true);
      await activateAccount(activationCode, email);
      toast.success("Activation successful, happy learning", {
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
      router.push("/individual/login");
    } catch (error) {
      setErrorMessage(
        //@ts-expect-error very neccesary
        typeof error.response?.data?.message === "string"
          ? //@ts-expect-error very neccesary
            error.response.data.message
          : //@ts-expect-error very neccesary
            error.response.data.message[0],
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-8 p-4 sm:p-8 md:flex-row md:justify-center md:gap-36">
      <div className="w-full md:w-1/2 lg:w-[40%]">
        <Image src={LoginSvg} alt="Login svg image" className="mx-auto" />
      </div>
      <div className="w-full md:w-1/2 lg:w-[40%]">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <CardTitle className="text-center text-2xl leading-[2.5rem] md:text-3xl">
              Activate Your Account
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
                          onFocus={() => setErrorMessage("")}
                          placeholder="johndoe@gmail.com"
                          className="rounded-md border-gray-500 py-3 md:rounded-none md:py-6"
                          {...field}
                          type="email"
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
                    "w-full rounded-md bg-purple-600 py-3 font-bold hover:bg-purple-700 md:rounded-none md:py-6",
                    loading && "bg-gray-500 hover:bg-gray-600",
                  )}
                >
                  {loading ? "Activating..." : "Activate"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
