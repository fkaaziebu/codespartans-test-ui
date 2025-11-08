"use client";
import axios from "axios";
import { BookOpen, Clock, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface Course {
  id: number;
  title: string;
  description: string;
  time: number;
  domains: string[];
  level: string;
  original_price: number;
  current_price: number;
  currency: string;
}

interface CourseDetails {
  id: number;
  name: string;
  courses: Course[];
  inCart: boolean;
  subscribed: boolean;
}

export default function CourseDetailPage() {
  const [isLoadingCourseDetails, setIsLoadingCourseDetails] = useState(false);
  const [isSubscribingToCategory, setIsSubscribingToCategory] = useState(false);
  const [courseData, setCourseData] = useState<CourseDetails>({
    id: 2,
    name: "Biology certificate",
    courses: [
      {
        id: 4,
        title: "Elementary Biology",
        description: "This course contains elementary level biology questions",
        time: 690,
        domains: ["Plant Biology", "Animal Biology"],
        level: "elementary",
        original_price: 25,
        current_price: 25,
        currency: "usd",
      },
    ],
    subscribed: false,
    inCart: false,
  });

  const pathname = usePathname();
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_INVENTORY;

  const fetchCourseCategoryDetails = async () => {
    try {
      setIsLoadingCourseDetails(true);
      const categoryId = pathname.split("/").pop();

      const response = await axios.get(`${baseUrl}/categories/${categoryId}`, {
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

  const subscribeToCategory = async () => {
    try {
      setIsSubscribingToCategory(true);

      await axios.post(
        `${baseUrl}/categories/subscribe`,
        {
          categoryId: Number(pathname.split("/").pop()),
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      toast({
        title: "You have subscribed to course",
        description: "You can now proceed to this course test page",
        variant: "default",
      });

      window.location.reload();
    } catch (error) {
      toast({
        title: "Error subscribing to course",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsSubscribingToCategory(false);
    }
  };

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
    fetchCourseCategoryDetails();
  }, []);

  return (
    <div>
      {!isLoadingCourseDetails ? (
        <>
          <div className="bg-[#1C1D1F] text-white">
            <div className="mx-auto max-w-screen-xl px-4 py-8">
              <nav className="mb-4 flex text-sm text-gray-400">
                <Link href="/" className="hover:underline">
                  Courses
                </Link>
                <span className="mx-2">›</span>
                <span className="capitalize">{courseData.name}</span>
              </nav>
              <h1 className="mb-8 text-4xl font-bold">{courseData.name}</h1>
              <div className="flex flex-col gap-2">
                <p className="text-2xl text-gray-300">
                  Bundle Price:{" "}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency:
                      courseData.courses[0]?.currency.toUpperCase() || "USD",
                  }).format(
                    courseData.courses.reduce(
                      (total, course) => total + course.current_price,
                      0,
                    ),
                  )}
                </p>
                {courseData.courses.reduce(
                  (total, course) => total + course.original_price,
                  0,
                ) >
                  courseData.courses.reduce(
                    (total, course) => total + course.current_price,
                    0,
                  ) && (
                  <p className="text-xl text-gray-300 line-through">
                    Original Price:{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency:
                        courseData.courses[0]?.currency.toUpperCase() || "USD",
                    }).format(
                      courseData.courses.reduce(
                        (total, course) => total + course.original_price,
                        0,
                      ),
                    )}
                  </p>
                )}
                <p className="text-lg text-gray-400">
                  {courseData.courses.length}{" "}
                  {courseData.courses.length === 1 ? "course" : "courses"}{" "}
                  included
                </p>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-screen-xl px-4 py-8">
            {courseData.courses.map((course, idx) => (
              <div
                key={course.id}
                className="mb-16 border-b pb-16 last:border-b-0"
              >
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  <div className="space-y-6 lg:col-span-2 lg:pr-6">
                    <div>
                      <h2 className="mb-4 text-2xl font-bold">
                        {course.title}
                      </h2>
                      <p className="mb-4 text-xl text-gray-800">
                        {course.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{(course.time / 3600).toFixed(1)} hours</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.domains.length} questions</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between">
                        <h2 className="mb-6 text-2xl font-bold">
                          Topics Distribution
                        </h2>
                        {courseData.subscribed ? (
                          <Button
                            className="bg-[#A435F0] text-white hover:bg-[#b67cdd]"
                            onClick={() =>
                              router.push(`/tests/${course.id}/suites`)
                            }
                          >
                            Start Test
                          </Button>
                        ) : (
                          <></>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {getDomainFrequency(course.domains).map(
                          ({ domain, count }, domainIndex) => (
                            <div
                              key={domainIndex}
                              className="flex items-start gap-2"
                            >
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
                                      width: `${(count / course.domains.length) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  {idx === 0 && (
                    <div>
                      {!courseData.subscribed ? (
                        <Card className="sticky top-6 bg-white text-black">
                          <CardContent className="space-y-6 p-6">
                            <div className="space-y-4">
                              <Button
                                className="w-full bg-[#A435F0] hover:bg-[#8710D8]"
                                size="lg"
                                onClick={() => subscribeToCategory()}
                              >
                                Subscribe to category
                                {isSubscribingToCategory && (
                                  <LoaderCircle className="ml-2 h-4 w-4 animate-spin" />
                                )}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <></>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
