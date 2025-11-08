"use client";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";

import { useForm } from "react-hook-form";
import { z } from "zod";

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
  website: z.string(),
});

export default function Profile() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      headline: "",
      website: "",
    },
  });

  return (
    <div>
      <CardHeader className="flex flex-col justify-center items-center border-b-2 py-4">
        <CardTitle className="text-xl font-bold">
          <p>Public Profile</p>
        </CardTitle>
        <CardTitle className="text-md font-light  text-gray-600 ">
          Add information about yourself
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto max-w-2xl py-10 flex flex-col gap-5">
          <Form {...form}>
            <div className="font-bold text-gray-900 text-md !important gap-0">
              Basics:
            </div>
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem className="-mt-4">
                  <FormControl>
                    <Input
                      placeholder="first name"
                      className=" focus:outline-none border-gray-700 rounded-full text-gray-900 h-12 font-medium"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="last name"
                      className=" focus:outline-none border-gray-700 rounded-full text-gray-900 h-12 font-medium"
                      {...field}
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
                      className=" focus:outline-none border-gray-700 rounded-none text-gray-900 h-12 font-medium"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="font-bold text-gray-900 text-md !important gap-0">
              Links:
            </div>
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="website (http(s)://..)"
                      className=" focus:outline-none border-gray-700 rounded-full text-gray-900 h-12 font-medium"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder=""
                      className=" focus:outline-none border-gray-700 rounded-full text-gray-900 h-12 font-medium"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder=""
                      className=" focus:outline-none border-gray-700 rounded-full text-gray-900 h-12 font-medium"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder=""
                      className=" focus:outline-none border-gray-700 rounded-full text-gray-900 h-12 font-medium"
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
