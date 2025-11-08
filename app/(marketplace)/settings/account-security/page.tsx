"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Slide, toast } from "react-toastify";
import { z } from "zod";
import { changePassword } from "@/app/api/auth";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  previousPassword: z.string(),
  password: z.string(),
});

export default function AccountSecurity() {
  const [errorMessage, setErrorMessage] = useState("");
  const [userProfile, setUserProfile] = useState({
    name: "",
    role: "",
    email: "",
  });
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_AUTH;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      previousPassword: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { previousPassword, password } = values;
    const token = sessionStorage.getItem("token");

    if (!token) {
      setErrorMessage(
        "You need to be logged into your account to change password",
      );
      return;
    }

    try {
      await changePassword(previousPassword, password, token);
      toast.success("password change succesful", {
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

  const getProfile = async () => {
    try {
      const result = await axios.get(`${baseUrl}/auth/students/profile`, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });
      setUserProfile(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    getProfile();
  }, []);

  return (
    <div>
      <CardHeader className="flex flex-col items-center justify-center border-b-2 py-4">
        <CardTitle className="text-xl font-bold">
          <p>Account</p>
        </CardTitle>
        <CardTitle className="text-md font-light text-gray-600">
          Edit your account settings and change your password here.
        </CardTitle>
      </CardHeader>
      <CardContent className="gap-5 border-b-2">
        <div className="mx-auto flex max-w-2xl flex-col py-5">
          <div className="text-md font-bold text-gray-900">Email:</div>
          <div className="-mb-2 flex h-12 items-center px-3 font-medium text-gray-900">
            <p className="">
              <span className="text-gray-600">Your email address is </span>{" "}
              <span className="w-full text-wrap font-bold">
                {userProfile.email}
              </span>
            </p>
          </div>
        </div>
      </CardContent>
      <CardContent className=" ">
        <div className="mx-auto flex max-w-2xl flex-col gap-10 py-5">
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
                        className="h-12 rounded-full border-gray-700 font-medium text-gray-900 focus:outline-none"
                        {...field}
                        onFocus={() => setErrorMessage("")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="-mt-5">
                    <FormControl>
                      <Input
                        placeholder="Enter New Password"
                        type="password"
                        className="h-12 rounded-full border-gray-700 font-medium text-gray-900 focus:outline-none"
                        {...field}
                        onFocus={() => setErrorMessage("")}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {errorMessage && (
                <div className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-800">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-fit rounded-none px-4 py-2 font-bold text-white hover:bg-gray-600"
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
