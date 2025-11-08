"use client";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Slide, toast } from "react-toastify";
import { changePassword } from "@/app/api/auth";

const formSchema = z.object({
  previousPassword: z.string(),
  newPassword: z.string(),
});

export default function AccountSecurity() {
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      previousPassword: "",
      newPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { previousPassword, newPassword } = values;
    const token = sessionStorage.getItem("token");

    if (!token) {
      setErrorMessage(
        "You need to be logged into your account to change password"
      );
      return;
    }

    try {
      await changePassword(previousPassword, newPassword, token);
      toast.success(" password change succesful", {
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
      //@ts-expect-error very necessary
      if (typeof error.message === "string") {
        //@ts-expect-error very necessary
        setErrorMessage(error.message);
      } else {
        //@ts-expect-error very necessary
        setErrorMessage(error.message[0]);
      }
    }
  }

  return (
    <div>
      <CardHeader className="flex flex-col justify-center items-center border-b-2 py-4">
        <CardTitle className="text-xl font-bold">
          <p>Account</p>
        </CardTitle>
        <CardTitle className="text-md font-light  text-gray-600 ">
          Edit your account settings and change your password here.
        </CardTitle>
      </CardHeader>
      <CardContent className="border-b-2  gap-5">
        <div className="mx-auto max-w-2xl py-5 flex flex-col">
          <div className="font-bold text-gray-900 text-md">Email:</div>
          <div className=" flex px-3  text-gray-900 h-12 font-medium items-center -mb-2">
            <p>
              <span className="text-gray-600">Your email address is </span>{" "}
              <span className="font-bold">delaliagbesidorwu@gmail.com</span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardContent className="  ">
        <div className="mx-auto gap-10 max-w-2xl py-5 flex flex-col">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-ful space-y-5"
            >
              <FormField
                control={form.control}
                name="previousPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter old password"
                        type="password"
                        className=" focus:outline-none border-gray-700 rounded-full text-gray-900 h-12 font-medium "
                        {...field}
                        onFocus={() => setErrorMessage("")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="-mt-5">
                    <FormControl>
                      <Input
                        placeholder="Enter New Password"
                        type="password"
                        className=" focus:outline-none border-gray-700 rounded-full text-gray-900 h-12 font-medium"
                        {...field}
                        onFocus={() => setErrorMessage("")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {errorMessage && (
                <div className="px-4 py-2 bg-red-50 text-red-800 rounded-full text-sm">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="rounded-none h-12 w-fit px-4 py-2 font-bold text-white hover:bg-gray-600"
              >
                Change Password
              </Button>
            </form>
          </Form>
        </div>
      </CardContent>
    </div>
  );
}
