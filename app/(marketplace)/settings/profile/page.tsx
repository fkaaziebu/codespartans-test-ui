"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  firstname: z.string().min(3, {
    message: "username must be at least 2 characters",
  }),
  lastname: z.string().min(3, {
    message: "username must be at least 2 characters",
  }),
  headline: z.string().min(5, {
    message: "",
  }),
  website1: z.string(),
  website2: z.string(),
});

export default function Profile() {
  const [userProfile, setUserProfile] = useState({
    name: "",
    role: "",
    email: "",
  });
  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3007/v1";
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
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      headline: "",
      website1: "",
      website2: "",
    },
  });

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div>
      <CardHeader className="flex flex-col items-center justify-center border-b-2 py-4">
        <CardTitle className="text-xl font-bold">
          <p>Public Profile</p>
        </CardTitle>
        <CardTitle className="text-md font-light text-gray-600">
          Add information about yourself
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto flex max-w-2xl flex-col gap-5 py-10">
          <Form {...form}>
            <div className="text-md !important gap-0 font-bold text-gray-900">
              Basics:
            </div>
            <FormField
              control={form.control}
              name="firstname"
              render={({}) => (
                <FormItem className="-mt-4">
                  <FormControl>
                    <Input
                      defaultValue={
                        userProfile.name
                          .split(" ")[0]
                          .slice(0, 1)
                          .toUpperCase() +
                        userProfile.name.split(" ")[0].slice(1)
                      }
                      className="h-12 rounded-full border-gray-700 font-medium text-gray-900 focus:outline-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastname"
              render={({}) => (
                <FormItem>
                  <FormControl>
                    <Input
                      defaultValue={
                        userProfile.name.split(" ")[1] === "undefined"
                          ? "Lastname"
                          : userProfile.name.split(" ")[1]
                      }
                      className="h-12 rounded-full border-gray-700 font-medium text-gray-900 focus:outline-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="headline"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Add a professional headline like, `Instructor` or `student`"
                      className="h-12 rounded-none border-gray-700 font-medium text-gray-900 focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="text-md !important gap-0 font-bold text-gray-900">
              Links:
            </div>
            <FormField
              control={form.control}
              name="website1"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="website (http(s)://..)"
                      className="h-12 rounded-full border-gray-700 font-medium text-gray-900 focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website2"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder=""
                      className="h-12 rounded-full border-gray-700 font-medium text-gray-900 focus:outline-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </Form>
        </div>
      </CardContent>
    </div>
  );
}
