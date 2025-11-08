import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CircleCheck } from "lucide-react";

export default function ActivationUi() {
  return (
    <div className="mx-auto max-w-screen-xl flex items-center gap-36">
      <div className="w-full">
        <Card className="border  shadow px-6 py-4">
          <CardHeader className="flex justify-center items-center">
            <CircleCheck className="text-green-500 h-10 w-10" />
          </CardHeader>
          <CardContent className="flex flex-col gap-5 items-center justify-center">
            <p className="font-bold text-gray-900 text-xl ">
              Registration successful
            </p>
            <p className="text-gray-600 text-md ">
              Go to your email and activate your account
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
