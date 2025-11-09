"use client";
import axios from "axios";
import { BookOpen } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import mathematics_image from "@/public/images/mathematics thumbnail.jpeg";

export default function LearningPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCourseStatusLoading, setIsCourseStatusLoading] = useState(false);
  const [myLearning, setMyLearning] = useState<
    Array<{ id: number; title: string; name: string; avatar_url: string }>
  >([]);
  const [myCategories, setMyCategories] = useState<
    Array<{ id: number; title: string; name: string; avatar_url: string }>
  >([]);
  const [courseStatus, setCourseStatus] = useState<
    Array<{ courseId: number; status: number }>
  >([]);

  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_INVENTORY;

  const getSubscribedCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/users/courses`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setMyLearning(response.data);

      // setMyLearning((prevData) => {
      //   const newCourses = response.data;
      //   const mergedData = [...prevData, ...newCourses];
      //   const uniqueData = Array.from(
      //     new Map(mergedData.map((course) => [course.id, course])).values(),
      //   );

      //   return uniqueData;
      // });

      const status = await getCoursesStatus(
        response.data.map((course: { id: string }) => course?.id),
      );

      setCourseStatus(status?.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSubscribedCategories = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${baseUrl}/users/categories`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      setMyCategories(response.data.categories);

      // setMyLearning((prevData) => {
      //   const newCategories = response.data.categories;
      //   const mergedData = [...prevData, ...newCategories];
      //   const uniqueData = Array.from(
      //     new Map(
      //       mergedData.map((category) => [category.id, category]),
      //     ).values(),
      //   );
      //   return uniqueData;
      // });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCoursesStatus = async (ids: string[]) => {
    try {
      setIsCourseStatusLoading(true);
      const response = await axios.post(
        `http://3.73.36.150:3002/v1/simulation/courses/status`,
        { courseIds: ids },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      return response;
    } catch (error) {
      console.log(error);
    } finally {
      setIsCourseStatusLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    getSubscribedCourses();
    getSubscribedCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-xl py-6">
        <p>Loading your courses...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-screen-xl py-6">
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="mb-6 text-2xl font-bold">My Learning</h1>

            {myLearning.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {myLearning.map((course) => (
                  <Card key={course.id} className="flex flex-col">
                    <CardContent className="flex-grow p-6">
                      <Image
                        src={course.avatar_url}
                        height={400}
                        width={400}
                        alt={course.title}
                        className="mb-4 aspect-video w-full rounded-lg bg-muted"
                      />
                      <h3 className="line-clamp-2 font-semibold">
                        {course.title}
                      </h3>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      {!courseStatus?.find((crs) => crs.courseId === course.id)
                        ?.status ? (
                        <Button
                          disabled={isCourseStatusLoading}
                          className="w-full"
                          onClick={() =>
                            router.push(`/tests/${course.id}/suites`)
                          }
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          {!isCourseStatusLoading
                            ? "Start Learning"
                            : "Loading..."}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() =>
                            router.push(`/tests/${course.id}/suites`)
                          }
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          Continue Learning
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="mb-4 text-muted-foreground">
                    You have not subscribed to any courses yet
                  </p>
                  <Button onClick={() => router.push("/")}>
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
          <div className="mt-4">
            <h1 className="mb-6 text-2xl font-bold">My Categories</h1>

            {myCategories.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {myCategories.map((course) => (
                  <Card key={course.id} className="flex flex-col">
                    <CardContent className="flex-grow p-6">
                      <Image
                        src={course.avatar_url || mathematics_image}
                        height={400}
                        width={400}
                        alt={course.name}
                        className="mb-4 aspect-video w-full rounded-lg bg-muted"
                      />
                      <h3 className="line-clamp-2 font-semibold">
                        {course.name}
                      </h3>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      {!courseStatus.find((crs) => crs.courseId === course.id)
                        ?.status ? (
                        <Button
                          disabled={isCourseStatusLoading}
                          className="w-full"
                          onClick={() => router.push(`categories/${course.id}`)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          {!isCourseStatusLoading ? "Open" : "Loading..."}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => router.push(`categories/${course.id}`)}
                        >
                          <BookOpen className="mr-2 h-4 w-4" />
                          View
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="mb-4 text-muted-foreground">
                    You have not subscribed to any courses yet
                  </p>
                  <Button onClick={() => router.push("/")}>
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
