"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Topic } from "@/app/types/topic";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import Thumbnail from "@/public/images/mathematics thumbnail.jpeg";

const MyLearningDropdown = () => {
  const [courses, setCourses] = useState<Topic[]>([]);
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_INVENTORY;

  const subscribedCourses = async () => {
    try {
      const result = await axios.get(`${baseUrl}/users/courses`, {
        headers: {
          Authorization: "Bearer " + sessionStorage.getItem("token"),
        },
      });
      console.log(result);
      setCourses(result.data);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const subscribedCoursesDetails = async (courseId: string) => {
    try {
      const result = await axios.get(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/courses/${courseId}`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        },
      );
      console.log(result.data);
      router.push(`/individual/quiz/${courseId}`);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const handleSubscribeCourseDetails = (courseId: string) => {
    subscribedCoursesDetails(courseId);
  };

  useEffect(() => {
    subscribedCourses();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-4 py-2 text-sm font-medium">My Learning</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 shadow-lg">
        {courses.map((course, index) => (
          <div
            key={index}
            className="mb-4 flex items-start border-b p-2 transition hover:bg-gray-100"
            onClick={() => {
              handleSubscribeCourseDetails(course.id);
            }}
          >
            <Image
              src={Thumbnail}
              alt={course.title}
              className="mr-2 h-full w-14 rounded border border-gray-300 object-cover"
            />
            <div className="flex-1">
              <DropdownMenuItem className="flex flex-col p-0">
                <span className="text-sm font-medium">{course.title}</span>
                <button className="mt-1 p-0 text-xs font-bold text-purple-800">
                  Start learning
                </button>
              </DropdownMenuItem>

              <div className="mt-1">
                <Progress
                  value={30}
                  style={{ backgroundColor: "black" }}
                  className="mb-1 h-1 w-[80%]"
                />
              </div>
            </div>
          </div>
        ))}
        <Link
          href="/individual/my-learning"
          className="flex w-full flex-grow justify-center border bg-black p-2 text-white"
        >
          Go to My Learning
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MyLearningDropdown;
