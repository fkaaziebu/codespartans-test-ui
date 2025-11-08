import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { XCircleIcon } from "lucide-react";
import google from "@/public/images/google_13170545.png";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OauthRegistration() {
  return (
    <div className="mx-auto flex max-w-screen-xl flex-col items-center gap-6 lg:flex-row lg:gap-36">
      <div className="w-full items-center justify-center">
        <Card className="w-full border-none bg-inherit">
          <CardHeader className="mb-1 items-center justify-center">
            <CardTitle className="mb-0 text-4xl font-medium text-slate-700">
              Create a new account
            </CardTitle>
            <span className="text-lg font-normal text-neutral-500">
              To get started, please sign up
            </span>
          </CardHeader>
          <CardDescription className="mb-6 flex flex-col gap-6">
            <div className="flex h-10 items-center justify-between gap-2 bg-gray-100">
              <span className="pl-24 text-base font-medium">
                delaliagbesidorwu@gmail.com
              </span>
              <Button className="rounded-full bg-inherit hover:bg-inherit">
                <XCircleIcon
                  className="items-end"
                  width={16}
                  height={16}
                  color="black"
                />
              </Button>
            </div>
            <div className="flex h-10 items-center justify-center gap-3 rounded-sm border border-gray-500 bg-purple-500">
              <Image
                src={google}
                alt="google"
                height={20}
                width={20}
                className=""
              />
              <p>Sign up with Google</p>
            </div>
          </CardDescription>
          <CardFooter className="w-full">
            <div className="flex flex-col items-center justify-center text-sm font-medium text-slate-500">
              <span className="text-wrap text-sm font-medium text-slate-500">
                By signing up, I agree to the CodeSpartans Terms of Service and
                acknowledge
              </span>
              <span className="flex gap-1">
                that our{" "}
                <Link href="#" className="underline">
                  {" "}
                  privacy terms{" "}
                </Link>{" "}
                apply
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
