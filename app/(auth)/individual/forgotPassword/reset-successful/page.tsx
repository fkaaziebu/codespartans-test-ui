"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowLeft, CircleCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ActivationUi() {
  const router = useRouter();
  return (
    <div className="mx-auto flex max-w-screen-xl items-center gap-36">
      <div className="w-full">
        <div className="flex flex-col gap-2">
          <Card className="border px-6 py-4 shadow">
            <CardHeader className="flex items-center justify-center">
              <CircleCheck className="h-10 w-10 text-green-500" />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-5">
              <p className="text-xl font-bold text-gray-900">
                Reset Email sent
              </p>
              <p className="text-md text-gray-600">
                Open your email and complete the steps
              </p>
            </CardContent>
          </Card>
          <Button
            className="w-fit justify-start gap-1 bg-inherit hover:bg-white"
            onClick={() => router.push("/individual/login")}
          >
            <ArrowLeft className="text-black" />
            <p className="text-black">back to login</p>
          </Button>
        </div>
      </div>
    </div>
  );
}
