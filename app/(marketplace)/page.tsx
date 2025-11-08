"use client";

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Heart, LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useAction } from "@/hooks/use-action-store";
import learning from "@/public/images/financial_data.svg";
import school from "@/public/images/learning.svg";
import mathematics_image from "@/public/images/mathematics thumbnail.jpeg";
import teaching from "@/public/images/undraw_computer_apps_9ssq.svg";

export default function HomePage() {
  return (
    <Suspense fallback={<p>Loading homepage .....</p>}>
      <ActualHomePage />
    </Suspense>
  );
}

function ActualHomePage() {
  const { onUpdate, data } = useAction();
  const [startIndex, setStartIndex] = useState(0);
  const coursesPerPage = 4;
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [courses, setCourses] = useState<
    Array<{
      id: number;
      title: string;
      level: string;
      currency: string;
      time: number;
      domains: Array<string>;
      description: string;
      original_price: number;
      current_price: number;
      subscribed: boolean;
      inCart: boolean;
      avatar_url: string;
    }>
  >([]);
  const [profile, setProfile] = useState<{
    id: number;
    name: string;
    email: string;
  }>();
  const [categories, setCategories] = useState<
    Array<{
      id: number;
      name: string;
      subscribed: boolean;
      inCart: boolean;
      avatar_url: string;
    }>
  >([]);

  const router = useRouter();
  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3006/v1";
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      setIsLoadingCourses(true);
      const response = await axios.get(`${baseUrl}/courses?page=1&limit=10`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      console.log("courses", response);
      setCourses(response.data.items);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingCourses(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await axios.get(
        `${baseUrl}/categories?page=1&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setCategories(response.data.items);
      console.log("categories", response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const addToCart = async (id: string) => {
    try {
      setIsAddingToCart(true);
      const response: {
        data: {
          cart: Array<{
            id: number;
            title: string;
            currency: string;
            original_price: number;
            current_price: number;
            avatar_url: string;
          }>;
        };
      } = await axios.post(
        `${baseUrl}/carts/courses:add`,
        {
          courseId: id,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setCourses((prevCourses) =>
        prevCourses.map((course) => ({
          ...course,
          inCart: Number(id) === course.id ? true : course.inCart,
          subscribed: Number(id) === course.id ? true : course.subscribed,
        })),
      );

      onUpdate("cart-action", {
        cartItems: response?.data?.cart,
        subscribedCourseItems: data.subscribedCourseItems,
      });

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

  const getUserProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3007/v1/auth/students/profile`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setProfile(response.data);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const slide = [
    {
      title: "Slow and steady",
      description: (
        <>
          Try learning just 5–10 minutes a day.{" "}
          <Link href="" className="text-purple-600 underline">
            Continue your Learning
          </Link>{" "}
          and reach your peak potential.
        </>
      ),
      image: learning, // Replace with actual image path
      background: "bg-yellow-600",
    },
    {
      title: "Consistent Progress",
      description: (
        <>
          Build habits with consistent effort.{" "}
          <Link href="" className="text-purple-600 underline">
            Check your stats
          </Link>{" "}
          and see how far you’ve come.
        </>
      ),
      image: school, // Replace with actual image path
      background: "bg-teal-400",
    },
    {
      title: "All in one place",
      description: (
        <>
          Elevate your horizon.{" "}
          <Link href="" className="text-purple-600 underline">
            Browse courses
          </Link>{" "}
          and see what’s left to learn.
        </>
      ),
      image: teaching, // Replace with actual image path
      background: "bg-slate-400",
    },
  ];

  const handlePrevSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slide.length - 1 : prevIndex - 1,
    );
  };

  const handleNextSlide = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) =>
      prevIndex === slide.length - 1 ? 0 : prevIndex + 1,
    );
  };

  const nextCourses = () => {
    setStartIndex((prev) =>
      Math.min(prev + coursesPerPage, courses.length - coursesPerPage),
    );
  };

  const previousCourses = () => {
    setStartIndex((prev) => Math.max(prev - coursesPerPage, 0));
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const formatTimeToHours = (seconds: number): number => {
    const hours = seconds / 3600;
    // Round to 1 decimal place
    return Number(hours.toFixed(1));
  };

  useEffect(() => {
    const timer = setInterval(() => {
      handleNextSlide();
    }, 15000);

    return () => {
      clearInterval(timer);
    };
  }, [currentIndex]);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    fetchCourses();
    getUserProfile();
    fetchCategories();
  }, []);

  return (
    <>
      <div>
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 px-2 sm:px-5">
            <div className="w-12sd flex h-8 items-center justify-center rounded-full bg-gray-900 text-lg font-bold text-white sm:h-16 sm:w-16 sm:text-3xl">
              {profile?.name.split(" ")[0]?.slice(0, 1).toUpperCase() || ""}
              {profile?.name.split(" ")[1] === "undefined"
                ? " "
                : profile?.name.split(" ")[1]?.slice(0, 1).toUpperCase()}
            </div>
            <div className="py-2">
              <p className="text-xl font-bold sm:text-2xl">
                Welcome back,{" "}
                {profile?.name.split(" ")[0].slice(0, 1).toUpperCase()}
                {profile?.name.split(" ")[0].toLowerCase().slice(1)}{" "}
                {profile?.name.split(" ")[1] === "undefined"
                  ? " "
                  : profile?.name.split(" ")[1]?.slice(0, 1).toUpperCase() ||
                    ""}
                {profile?.name.split(" ")[1] === "undefined"
                  ? " "
                  : profile?.name.split(" ")[1]?.toLowerCase().slice(1) || ""}
              </p>
            </div>
          </div>

          <div className="mt-6 sm:mt-10">
            <section className="relative flex h-[300px] items-center justify-between rounded-lg p-4 sm:h-[350px] sm:p-6 md:h-[450px] md:p-8">
              <button
                onClick={handlePrevSlide}
                className="absolute -left-2 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-gray-500 p-1 text-white sm:-left-3"
              >
                <ChevronLeft size={20} className="sm:h-6 sm:w-6" />
              </button>

              <div className="relative flex h-full w-full overflow-hidden">
                <AnimatePresence initial={false} custom={direction}>
                  <motion.div
                    key={currentIndex}
                    className={`absolute inset-0 flex w-full flex-col items-center justify-between lg:flex-row ${slide[currentIndex].background}`}
                    initial={{ x: direction === 1 ? "100%" : "-100%" }}
                    animate={{ x: "0%" }}
                    exit={{ x: direction === 1 ? "-100%" : "100%" }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="m-2 my-auto w-full max-w-4xl rounded-lg bg-white p-3 shadow-lg sm:m-4 sm:p-4 md:m-6 md:p-6 lg:w-fit">
                      <h2 className="mb-2 text-xl font-bold sm:text-2xl md:text-3xl">
                        {slide[currentIndex].title}{" "}
                      </h2>
                      <p className="mb-2 text-sm sm:text-base">
                        {slide[currentIndex].description}
                      </p>
                    </div>
                    <div className="hidden md:block lg:ml-12">
                      <Image
                        src={slide[currentIndex].image}
                        alt="Slide illustration"
                        width={400}
                        height={400}
                        className="h-full border-none object-cover"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button
                onClick={handleNextSlide}
                className="absolute -right-2 top-1/2 z-10 -translate-y-1/2 transform rounded-full bg-gray-500 p-1 text-white sm:-right-3"
              >
                <ChevronRight size={20} className="sm:h-6 sm:w-6" />
              </button>
            </section>
          </div>
        </div>
      </div>

      <div>
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5">
            <h1 className="mx-4 text-xl font-semibold sm:mx-16 sm:text-2xl">
              Browse our Courses
            </h1>
            <div className="relative w-full py-5">
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm sm:h-12 sm:w-12"
                  onClick={previousCourses}
                  disabled={startIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm sm:h-12 sm:w-12"
                  onClick={nextCourses}
                  disabled={startIndex >= courses.length - coursesPerPage}
                >
                  <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              </div>

              <div className="mx-4 grid grid-cols-1 gap-4 sm:mx-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {!isLoadingCourses
                  ? courses
                      .slice(startIndex, startIndex + coursesPerPage)
                      ?.map((course) => (
                        <HoverCard key={course.id}>
                          <HoverCardTrigger>
                            <Card className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg">
                              <CardHeader className="p-0">
                                <div className="aspect-video w-full overflow-hidden">
                                  <Image
                                    src={course.avatar_url}
                                    width="400"
                                    height="400"
                                    alt={course.title}
                                    className="h-full w-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                  />
                                </div>
                              </CardHeader>

                              <CardContent className="p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <Badge
                                    variant="secondary"
                                    className="capitalize"
                                  >
                                    {course.level}
                                  </Badge>
                                </div>

                                <h3 className="line-clamp-2 text-wrap text-base font-semibold sm:text-lg">
                                  {course.title}
                                </h3>
                              </CardContent>

                              <CardFooter className="p-4 pt-0">
                                <div className="flex w-full items-center justify-between">
                                  <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground line-through sm:text-sm">
                                      {formatPrice(
                                        course.original_price,
                                        course.currency,
                                      )}
                                    </span>
                                    <span className="text-base font-bold text-primary sm:text-lg">
                                      {formatPrice(
                                        course.current_price,
                                        course.currency,
                                      )}
                                    </span>
                                  </div>

                                  <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button
                                      size="sm"
                                      onClick={() =>
                                        router.push(`courses/${course.id}`)
                                      }
                                    >
                                      View Course
                                    </Button>
                                  </div>
                                </div>
                              </CardFooter>
                            </Card>
                          </HoverCardTrigger>
                          <HoverCardContent
                            className="w-[300px] p-0 sm:w-[400px]"
                            side="right"
                          >
                            <Card className="border-0 shadow-none">
                              <CardHeader className="space-y-4 p-4 sm:p-6">
                                <h3 className="break-words text-lg font-bold sm:text-xl">
                                  {course.title}
                                </h3>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
                                  <span>
                                    {formatTimeToHours(course.time)} total hours
                                  </span>
                                  <span>•</span>
                                  <span>{course.level}</span>
                                </div>

                                <div className="space-y-1 text-xs sm:text-sm">
                                  <p className="text-muted-foreground">
                                    {course.description}
                                  </p>
                                </div>
                              </CardHeader>

                              <CardContent className="p-4 pt-0 sm:p-6">
                                <div className="flex flex-wrap gap-2">
                                  {course.domains.map((domain, index) => {
                                    if (index < 10) {
                                      return (
                                        <Badge
                                          key={index}
                                          variant="outline"
                                          className="bg-background text-xs sm:text-sm"
                                        >
                                          {domain}
                                        </Badge>
                                      );
                                    }
                                  })}
                                </div>
                              </CardContent>

                              <CardFooter className="flex justify-between border-t p-4 sm:p-6">
                                <div className="flex flex-col">
                                  <div className="text-xs text-muted-foreground line-through sm:text-sm">
                                    {formatPrice(
                                      course.original_price,
                                      course.currency,
                                    )}
                                  </div>
                                  <div className="text-xl font-bold sm:text-2xl">
                                    {formatPrice(
                                      course.current_price,
                                      course.currency,
                                    )}
                                  </div>
                                </div>

                                <div className="flex gap-2">
                                  {!course.inCart ? (
                                    !course.subscribed ? (
                                      <Button
                                        onClick={() =>
                                          addToCart(`${course.id}`)
                                        }
                                        className="px-2 py-0 text-xs sm:text-sm"
                                      >
                                        Add to cart
                                        {isAddingToCart && (
                                          <LoaderCircle className="ml-2 h-4 w-4 animate-spin text-gray-300" />
                                        )}
                                      </Button>
                                    ) : (
                                      <Button
                                        onClick={() =>
                                          router.push(
                                            `/tests/${course.id}/suites`,
                                          )
                                        }
                                        className="px-2 py-0 text-xs sm:text-sm"
                                      >
                                        Go to test
                                      </Button>
                                    )
                                  ) : (
                                    <Button
                                      disabled
                                      className="px-2 py-0 text-xs sm:text-sm"
                                    >
                                      Already in cart
                                    </Button>
                                  )}
                                  <Button size="icon" variant="outline">
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardFooter>
                            </Card>
                          </HoverCardContent>
                        </HoverCard>
                      ))
                  : [1, 2, 3, 4].map((index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-0">
                          <Skeleton className="aspect-video w-full" />
                        </CardHeader>

                        <CardContent className="p-4">
                          <div className="mb-2">
                            <Skeleton className="h-5 w-20" />
                          </div>

                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5">
            <h1 className="mx-4 text-xl font-semibold sm:mx-16 sm:text-2xl">
              Browse our Categories
            </h1>
            <div className="relative w-full py-5">
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm sm:h-12 sm:w-12"
                  onClick={previousCourses}
                  disabled={startIndex === 0}
                >
                  <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm sm:h-12 sm:w-12"
                  onClick={nextCourses}
                  disabled={startIndex >= courses.length - coursesPerPage}
                >
                  <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                </Button>
              </div>

              <div className="mx-4 grid grid-cols-1 gap-4 sm:mx-16 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {!isLoadingCategories
                  ? categories
                      .slice(startIndex, startIndex + coursesPerPage)
                      ?.map((category) => (
                        <Card
                          key={category.id}
                          className="group h-full overflow-hidden transition-all duration-300 hover:shadow-lg"
                        >
                          <CardHeader className="p-0">
                            <div className="aspect-video w-full overflow-hidden">
                              <Image
                                src={category.avatar_url || mathematics_image}
                                width="400"
                                height="400"
                                alt={category.name}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                          </CardHeader>

                          <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between">
                              <Badge variant="secondary" className="capitalize">
                                Primary
                              </Badge>
                            </div>

                            <h3 className="line-clamp-2 text-nowrap text-base font-semibold sm:text-lg">
                              {category.name}
                            </h3>
                          </CardContent>

                          <CardFooter className="p-4 pt-0">
                            <div className="flex w-full items-center justify-between">
                              <div className="opacity-0 transition-opacity group-hover:opacity-100">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    router.push(`categories/${category.id}`)
                                  }
                                >
                                  View Bundle
                                </Button>
                              </div>
                            </div>
                          </CardFooter>
                        </Card>
                      ))
                  : [1, 2, 3, 4].map((index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="p-0">
                          <Skeleton className="aspect-video w-full" />
                        </CardHeader>

                        <CardContent className="p-4">
                          <div className="mb-2">
                            <Skeleton className="h-5 w-20" />
                          </div>

                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </CardContent>

                        <CardFooter className="p-4 pt-0">
                          <div className="flex w-full items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-5 w-24" />
                            </div>
                            <Skeleton className="h-9 w-24" />
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
