"use client";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export type InstructorsCourses = {
  title: string;
  image: string;
  progress: number | null;
};

type MyLearningDropdownProps = {
  courses: InstructorsCourses[];
};

const MyCoursesDropDown: React.FC<MyLearningDropdownProps> = ({ courses }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="px-4 py-2 text-sm font-medium">My Learning</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 shadow-lg">
        {courses.map((course, index) => (
          <div
            key={index}
            className="mb-4 flex items-start border-b p-2 hover:bg-gray-100 transition"
          >
            <Image
              src={course.image}
              alt={course.title}
              className="w-12 h-12 mr-4 object-cover border border-gray-300 rounded"
            />
            <div className="flex-1">
              <DropdownMenuItem className="flex flex-col p-0">
                <span className="font-medium text-sm">{course.title}</span>
                <button className="text-xs font-bold text-purple-800 p-0 mt-1">
                  create new course{" "}
                </button>
              </DropdownMenuItem>
              {course.progress !== null && (
                <div className="mt-1">
                  <Progress
                    value={course.progress}
                    className="h-1 mb-1 w-[60%] bg-purple-300"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        <Link
          href="/individual/my-learning"
          className="flex flex-grow w-full p-2 border bg-black justify-center text-white"
        >
          Go to My Courses
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MyCoursesDropDown;
