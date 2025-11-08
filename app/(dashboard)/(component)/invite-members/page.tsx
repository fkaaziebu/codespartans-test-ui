"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Image from "next/image";
import LoginSvg from "@/public/images/login.svg";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormData {
  emails: string;
}

// Zod schema for email validation
const emailSchema = z.object({
  emails: z
    .string()
    .min(1, { message: "Please enter at least one email." })
    .refine(
      (value) =>
        value
          .split(",")
          .every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())),
      {
        message: "Please enter valid email addresses separated by commas.",
      }
    ),
});

export default function InviteMembers() {
  const [emailList, setEmailList] = useState<string[]>([]);
  const [isRestructured, setIsRestructured] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(emailSchema),
  });

  const handleSplitEmails = (data: FormData) => {
    const splitEmails = data.emails.split(",").map((email) => email.trim());
    setEmailList(splitEmails);
    setIsRestructured(true); // Hide textarea and show restructured emails
  };

  const handleSubmit = (data: FormData) => {
    // Process final email list
    console.log("Final Emails:", emailList);
    console.log(data)
  };

  return (
    <div className="mx-auto max-w-screen-xl flex h-[100%] items-center gap-36">
      <div className="w-[40%]  ">
        <Image src={LoginSvg} alt="Login svg image" />
      </div>
      <div className="w-[60%] mr-24 ">
        <Card className="border-4 border-gray-400 shadow-md ">
          <CardHeader>
            <CardTitle className="text-3xl text-center leading-[2.5rem]">
              Invite emembers to your team
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-5 w-full"
              >
                {!isRestructured && (
                  <FormField
                    control={form.control}
                    name="emails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          Invite Members (Emails separated by commas):
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter emails separated by commas"
                            {...field}
                            className="border-gray-500 py-6 rounded-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {!isRestructured && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p>Add email or more emails</p>
                    </div>
                    <Button
                      type="button"
                      onClick={form.handleSubmit(handleSplitEmails)}
                      className="w-[40%]  rounded-none py-6 bg-purple-600 hover:bg-purple-700 font-bold"
                    >
                      Restructure Emails
                    </Button>
                  </div>
                )}

                {isRestructured && (
                  <div>
                    <h3>Confirm Emails:</h3>
                    {emailList.map((email, index) => (
                      <div key={index} className="flex flex-col py-1">
                        <Input
                          type="text"
                          value={email}
                          className="border-gray-500 py-4 rounded-lg w-[40%]"
                          onChange={(e) => {
                            const updatedEmails = [...emailList];
                            updatedEmails[index] = e.target.value;
                            setEmailList(updatedEmails);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type="submit"
                      className="w-[40%]  rounded-none py-6 bg-purple-600 hover:bg-purple-700 font-bold"
                    >
                      Submit Emails
                    </Button>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
