"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { AlarmClock } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import Thumbnail from "@/public/images/mathematics thumbnail.jpeg";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDownIcon } from "lucide-react";
import { SetStateAction, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Topic } from "@/app/types/topic";
import { useRouter } from "next/navigation";

export default function MyQuestions() {
  const [selectedSort, setSelectedSort] = useState("Sort Type");
  const [selectedFilter, setSelectedFilter] = useState("Filter By");
  const [myCourses, setMyCourses] = useState<Topic[]>([]);
  const router = useRouter();
  const handleFilter = (FilterType: SetStateAction<string>) => {
    setSelectedFilter(FilterType);
  };
  const handleSort = (SortType: SetStateAction<string>) => {
    setSelectedSort(SortType);
  };

  const subscribedCourses = async () => {
    try {
      const result = await axios.get(
        "https://exam-simulation-platform-production-307d.up.railway.app/v1/users/courses",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        },
      );
      console.log(result);
      setMyCourses(result.data);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  // const subscribedCoursesDetails = async (courseId: string) => {
  //   try {
  //     const result = await axios.get(
  //       `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/courses/${courseId}`,
  //       {
  //         headers: {
  //           Authorization: "Bearer " + sessionStorage.getItem("token"),
  //         },
  //       },
  //     );
  //     console.log(result.data);
  //     router.push(`/tests/${courseId}/suites`);
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //   }
  // };

  // const handleSubscribeCourseDetails = (courseId: string) => {
  //   subscribedCoursesDetails(courseId);
  // };

  useEffect(() => {
    subscribedCourses();
  }, []);

  return (
    <div className="flex flex-col gap-6 font-sans">
      <div className="min-w-full">
        <div className="min-w-full">
          <Card className="flex flex-col gap-1 rounded-none bg-gray-800 pt-5">
            <CardHeader className="">
              <CardTitle className="text-center text-3xl font-bold text-white sm:pl-20 sm:text-left md:text-5xl">
                My Learning
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap justify-center gap-4 sm:justify-start sm:pl-20">
                {[
                  "All courses",
                  "My Lists",
                  "WishList",
                  "Archived",
                  "Learning Tools",
                ].map((item, index) => (
                  <Link
                    key={index}
                    href="#"
                    className="text-sm text-white hover:underline sm:text-base"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <section
        id="all-courses"
        className="mx-auto max-w-screen-xl flex-col items-center justify-center gap-4"
      >
        <Card className="mx-auto w-full rounded-none sm:w-[80%]">
          <CardContent className="flex flex-col p-4 sm:flex-row">
            <div className="mx-auto sm:mx-0">
              <AlarmClock width={40} height={40} />
            </div>
            <div className="flex flex-col space-y-2 text-center sm:pl-8 sm:text-left">
              <p className="text-l font-semibold">Schedule test time</p>
              <p className="text-lg font-semibold">Schedule test time</p>
              <p>
                Learning a little each day adds up. Research shows that students
                who make learning a habit are more likely to reach their goals.
                Set time aside to learn and get reminders using your learning
                scheduler.
              </p>
              <div className="flex justify-center gap-4 pt-2 sm:justify-start">
                <Button className="rounded-none font-bold text-white hover:bg-gray-700">
                  Get Started
                </Button>
                <Button className="border-none bg-white font-bold text-black hover:bg-white">
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mx-auto w-full rounded-none sm:w-[80%]">
          <div className="mt-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-wrap gap-4">
              <div>
                <div className="mb-2">Sort by</div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="w-full gap-2 border-gray-900 p-2 sm:w-auto"
                    asChild
                  >
                    <Button className="rounded-none border bg-white text-gray-900 hover:bg-white">
                      <span>{selectedSort}</span>
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52">
                    {[
                      "Recently enrolled",
                      "Recently accessed",
                      "Title: A-Z",
                      "Title: Z-A",
                    ].map((item) => (
                      <DropdownMenuItem
                        key={item}
                        onClick={() => handleSort(item)}
                      >
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <div className="mb-2">Filter by</div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="w-full gap-2 border-gray-900 p-2 sm:w-auto"
                    asChild
                  >
                    <Button className="rounded-none border bg-white text-gray-900 hover:bg-white">
                      <span>{selectedFilter}</span>
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52">
                    {[
                      "Recently enrolled",
                      "Recently accessed",
                      "Title: A-Z",
                      "Title: Z-A",
                    ].map((item) => (
                      <DropdownMenuItem
                        key={item}
                        onClick={() => handleFilter(item)}
                      >
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-8">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="w-full gap-2 border-gray-900 p-2 sm:w-auto"
                    asChild
                  >
                    <Button className="rounded-none border bg-white text-gray-900 hover:bg-white">
                      <span>{selectedFilter}</span>
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52">
                    {[
                      "Recently enrolled",
                      "Recently accessed",
                      "Title: A-Z",
                      "Title: Z-A",
                    ].map((item) => (
                      <DropdownMenuItem
                        key={item}
                        onClick={() => handleFilter(item)}
                      >
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-8">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="w-full gap-2 border-gray-900 p-2 sm:w-auto"
                    asChild
                  >
                    <Button className="rounded-none border bg-white text-gray-900 hover:bg-white">
                      <span>{selectedFilter}</span>
                      <ChevronDownIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-52">
                    {[
                      "Recently enrolled",
                      "Recently accessed",
                      "Title: A-Z",
                      "Title: Z-A",
                    ].map((item) => (
                      <DropdownMenuItem
                        key={item}
                        onClick={() => handleFilter(item)}
                      >
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button className="mt-8 bg-white font-medium text-gray-900 hover:bg-white">
                Reset
              </Button>
            </div>
            <div className="flex sm:w-auto">
              <Input
                type="text"
                placeholder="Search my test bundles"
                className="flex-grow rounded-none border border-black px-3 py-2 text-sm focus:outline-none"
              />
              <Button className="rounded-none border-none bg-gray-800 px-4 py-2">
                <MagnifyingGlassIcon className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
          <div className="my-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {myCourses.length > 0 ? (
              myCourses.map((course) => (
                <div
                  onClick={() => router.push(`/tests/${course.id}/suites`)}
                  key={course.id}
                  className="w-full cursor-pointer rounded-md border-gray-300"
                >
                  <div className="relative mb-3 aspect-video border">
                    <Image
                      src={Thumbnail}
                      alt={course.title}
                      className="h-36 object-cover"
                    />
                  </div>
                  <div>
                    <p className="mb-2 text-xl font-bold">{course.title}</p>
                  </div>
                  <p className="text-wrap text-xs font-extralight">
                    {course.description}
                  </p>
                  <div className="mt-2">
                    <div className="overflow- relative my-2 h-1 w-full rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${70}%`,
                          backgroundColor: "purple",
                        }}
                      />
                    </div>
                    <p className="w-[60%] text-sm font-normal">70% complete</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No courses available.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
