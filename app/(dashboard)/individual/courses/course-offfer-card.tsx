import { PlayIcon } from "@heroicons/react/16/solid";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimerIcon, XIcon, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

interface CourseOfferProps {
  handleAddToCart: () => void;
  current_price: number;
  original_price: number;
  discount: number;
  timeLeft: number;
  couponCode: string;
  subscriptionPrice: number;
}

const CourseOfferCard: React.FC<CourseOfferProps> = ({
  current_price,
  original_price,
  discount,
  timeLeft,
  couponCode,
  subscriptionPrice,
  handleAddToCart,
}) => {
  return (
    <Card className="max-w-sm border rounded-none overflow-hidden bg-white">
      {/* Preview Video Section */}
      <CardHeader>
        <div className="relative w-full h-40 bg-gray-900  hidden md:block">
          <Button className="absolute inset-10 flex items-center justify-center">
            <div className="flex flex-col items-center text-white">
              <PlayIcon width={48} height={48} className="mb-2" />
              <span className="text-sm">Preview this course</span>
            </div>
          </Button>
        </div>
        {/* Navigation */}
        <div className="">
          <div className="flex">
            <Link
              href="#personal"
              className="flex-1 px-4 py-3 text-sm text-gray-700 font-medium bg-white rounded-none border-b-2 active:border-black hover:bg-white"
            >
              Personal
            </Link>
            <Link
              href="#"
              className="flex-1 px-4 py-3 text-sm text-gray-700 font-medium bg-white rounded-none border-b-2 active:border-black hover:bg-whit"
            >
              Teams
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <section id="personal">
          {/* suscription */}
          <div className="p-x">
            <h3 className="font-bold text-lg mb-1">
              Subscribe to ExamSim top courses
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Get this course, plus 12,000+ of our top-rated courses, with
              Personal Plan.{" "}
              <a href="#" className="text-purple-600">
                Learn more
              </a>
            </p>
            <Button className="w-full bg-purple-600 text-white py-3 rounded-none mb-2 font-medium hover:bg-purple-700">
              Try Personal Plan for free
            </Button>
            <p className="text-sm text-center text-gray-600 mb-2">
              Starting at ${subscriptionPrice} per month after trial
            </p>
            <p className="text-sm text-center text-gray-600 mb-2">
              Cancel anytime
            </p>

            <div className="flex items-center justify-center my-3">
              <div className="border-t border-gray-300 flex-grow"></div>
              <span className="px-4 text-sm text-gray-500">or</span>
              <div className="border-t border-gray-300 flex-grow"></div>
            </div>
          </div>

          <div className="flex  items-baseline gap-2 mb-1">
            <span className="text-xl font-bold">${current_price}</span>
            <span className="text-gray-600 line-through">
              ${original_price}
            </span>
            <span className="text-gray-600">{discount}% off</span>
          </div>
          {timeLeft > 0 && (
            <div className="flex gap-1 items-center font-bold text-xs text-red-600 mb-4">
              <TimerIcon />
              <span className="text-red-800">{timeLeft} hours </span>{" "}
              <span> left at this</span>
              price!
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex gap-2 mb-2">
            <Button
              className="flex-grow border border-gray-900 rounded-none bg-white text-gray-900 py-5 font-medium hover:bg-white"
              onClick={handleAddToCart}
            >
              Add to cart
            </Button>
            <Button className="py-5 border border-gray-900 rounded-none hover:bg-white bg-white">
              <Heart className="text-black rounded-none" />
            </Button>
          </div>
          <p className="text-center text-sm text-gray-600 mb-2">
            30-Day Money-Back Guarantee
          </p>
          <p className="text-center text-sm text-gray-600">
            Full Lifetime Access
          </p>
          {/* Coupon Section */}
          {couponCode && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md flex flex-col gap-2 justify-between">
              <div className="flex w-full border border-dashed p-2 justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {couponCode}{" "}
                    <span className="text-sm font-light">is applied</span>
                  </p>
                  <p className="text-xs text-gray-600">ExamSim coupon</p>
                </div>
                <Button className="bg-gray-50 text-purple-600 hover:bg-gray-50">
                  <XIcon className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex ">
                <Input
                  placeholder="Enter Coupon"
                  className="w-[100%] rounded-none border-gray-900 focus:border-none focus:outline-none"
                />
                <Button className="bg-gray-900 text-white rounded-none hover:bg-gray-800">
                  Apply
                </Button>
              </div>
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  );
};

export default CourseOfferCard;
