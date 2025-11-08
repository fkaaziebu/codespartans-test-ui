"use client";
import axios from "axios";
import { BookOpen, Clock, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/use-action-store";

interface CourseDetails {
  id: number;
  title: string;
  description: string;
  time: number;
  domains: string[];
  level: string;
  original_price: number;
  current_price: number;
  currency: string;
  subscribed: boolean;
  inCart: boolean;
  isBestSeler: boolean;
}

export default function CourseDetailPage() {
  const { onUpdate, data } = useAction();
  const [isLoadingCourseDetails, setIsLoadingCourseDetails] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isSubscribingToCourse, setIsSubscribingToCourse] = useState(false);
  const [courseData, setCourseData] = useState<CourseDetails>({
    id: 1,
    title: "Elementary Mathematics",
    description: "This course contains elementary level mathematics questions",
    time: 750,
    domains: [
      "Addition",
      "Subtraction",
      "Multiplication",
      "Division",
      "Geometry",
      "Number Sequences",
      // ... rest of domains
    ],
    level: "elementary",
    original_price: 20,
    current_price: 20,
    currency: "usd",
    subscribed: false,
    inCart: false,
    isBestSeler: false,
  });

  const pathname = usePathname();
  const router = useRouter();
  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3006/v1";

  const fetchCourseDetails = async () => {
    try {
      setIsLoadingCourseDetails(true);
      const courseId = pathname.split("/").pop();

      const response = await axios.get(`${baseUrl}/courses/${courseId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      setCourseData(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingCourseDetails(false);
    }
  };

  const addToCart = async () => {
    try {
      setIsAddingToCart(true);
      const response = await axios.post(
        `${baseUrl}/carts/courses:add`,
        {
          courseId: `${courseData.id}`,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      onUpdate("cart-action", {
        cartItems: response?.data?.cart,
        subscribedCourseItems: data.subscribedCourseItems,
      });

      setCourseData((prevData) => ({ ...prevData, inCart: true }));
      toast({
        title: "Course added to cart",
        description: "You can now proceed to checkout",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error adding course",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const subscribeToCourse = async () => {
    try {
      setIsSubscribingToCourse(true);
      const response = await axios.post(
        `${baseUrl}/courses/subscribe`,
        {
          courseIds: [courseData.id],
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      onUpdate("subscribe-action", {
        cartItems: data.cartItems.filter((item) => courseData.id !== item.id),
        subscribedCourseItems: response.data.subscribedCourses,
      });

      setCourseData((prevData) => ({ ...prevData, subscribed: true }));

      toast({
        title: "You have subscribed to course",
        description: "You can now proceed to this course test page",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error subscribing to course",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsSubscribingToCourse(false);
    }
  };

  // Helper function to count unique domains and their frequencies
  const getDomainFrequency = (domains: string[]) => {
    const frequency: { [key: string]: number } = {};
    domains.forEach((domain) => {
      frequency[domain] = (frequency[domain] || 0) + 1;
    });
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .map(([domain, count]) => ({ domain, count }));
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    fetchCourseDetails();
  }, []);

  return (
    <div>
      {/* Hero Section with Dark Background */}
      {!isLoadingCourseDetails ? (
        <>
          <div className="bg-[#1C1D1F] text-white">
            <div className="mx-auto max-w-screen-xl px-4 py-8">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Course Info */}
                <div className="space-y-6 lg:col-span-2 lg:pr-6">
                  {/* Breadcrumb */}
                  <nav className="mb-4 flex text-sm text-gray-400">
                    <Link href="/" className="hover:underline">
                      Courses
                    </Link>
                    <span className="mx-2">›</span>
                    <span className="capitalize">{courseData.title}</span>
                  </nav>

                  <h1 className="text-4xl font-bold">{courseData.title}</h1>
                  <p className="text-xl text-gray-300">
                    {courseData.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <Badge
                      variant="secondary"
                      className="bg-[#ECB84B] text-black"
                    >
                      Bestseller
                    </Badge>
                    <div className="flex items-center gap-1 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span>{(courseData.time / 3600).toFixed(1)} hours</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-300">
                      <BookOpen className="h-4 w-4" />
                      <span>{courseData.domains.length} questions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Topics Distribution */}
          <div className="relative mx-auto max-w-screen-xl px-4 py-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <h2 className="mb-6 text-2xl font-bold">Topics Distribution</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {getDomainFrequency(courseData.domains).map(
                    ({ domain, count }, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-[#A435F0]">✓</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-base">
                            <span>{domain}</span>
                            <span className="text-gray-500">
                              {count} questions
                            </span>
                          </div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-[#A435F0]"
                              style={{
                                width: `${(count / courseData.domains.length) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Purchase Card */}
              <div className="lg:absolute lg:-top-12 lg:right-8 lg:col-span-1 lg:w-[21rem]">
                <Card className="sticky top-6 bg-white text-black">
                  <CardContent className="space-y-6 p-6">
                    <div>
                      <p className="text-3xl font-bold">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: courseData.currency.toUpperCase(),
                        }).format(courseData.current_price)}
                      </p>
                      {courseData.original_price > courseData.current_price && (
                        <p className="text-gray-600 line-through">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: courseData.currency.toUpperCase(),
                          }).format(courseData.original_price)}
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      {!courseData.subscribed ? (
                        <>
                          {!courseData.inCart ? (
                            <Button
                              className="w-full bg-[#A435F0] hover:bg-[#8710D8]"
                              size="lg"
                              onClick={addToCart}
                              disabled={isAddingToCart}
                            >
                              Add to cart
                              {isAddingToCart && (
                                <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-[#A435F0] hover:bg-[#8710D8]"
                              size="lg"
                              onClick={() => router.push("/cart")}
                            >
                              Go to cart
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            className="w-full"
                            size="lg"
                            onClick={subscribeToCourse}
                            disabled={isSubscribingToCourse}
                          >
                            Buy now
                            {isSubscribingToCourse && (
                              <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            className="w-full bg-gray-600 text-gray-100 hover:bg-gray-500 hover:text-gray-200"
                            size="lg"
                            onClick={() =>
                              router.push(`/trial/${courseData.id}`)
                            }
                          >
                            Try now
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full bg-[#A435F0] hover:bg-[#8710D8]"
                          size="lg"
                          onClick={() =>
                            router.push(`/tests/${courseData.id}/suites`)
                          }
                        >
                          Go to test
                        </Button>
                      )}
                    </div>

                    <p className="text-center text-xs text-gray-600">
                      30-Day Money-Back Guarantee
                    </p>

                    <div className="space-y-4 pt-4">
                      <h3 className="font-bold">This course includes:</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4" />
                          {courseData.domains.length} practice questions
                        </li>
                        <li className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {(courseData.time / 3600).toFixed(1)} hours of content
                        </li>
                        <li>
                          • {new Set(courseData.domains).size} unique topics
                        </li>
                        <li>• Lifetime access</li>
                        <li>• Certificate of completion</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-full items-center justify-center py-5">
          <LoaderCircle className="h-16 w-16 animate-spin text-gray-300" />
        </div>
      )}
    </div>
  );
}
