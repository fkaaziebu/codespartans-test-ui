"use client";
import Link from "next/link";
import UserSection from "@/components/UserSection";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import course_thumbnail from "@/public/images/mathematics thumbnail.jpeg";
import learning from "@/public/images/financial_data.svg";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import CourseGrid from "../courses/course-grid";

const DashboardPage = () => {
  const [userProfile, setUserProfile] = useState({ name: "", role: "" });
  const router = useRouter();

  const getProfile = async () => {
    try {
      const result = await axios.get(
        "https://exam-simulation-platform-production-307d.up.railway.app/v1/students/profile",
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      setUserProfile(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/organization/login");
    }
    getProfile();
  }, []);

  return (
    <div className="flex flex-col mx-auto">
      <div className="shadow-lg w-full">
        <nav className="flex space-x-6 py-4 justify-evenly text-gray-600 overflow-x-auto no-scrollbar">
          {[
            "Development",
            "Business",
            "Finance & Accounting",
            "IT & Software",
            "Office Productivity",
            "Personal Development",
            "Design",
            "Marketing",
            "Health & Fitness",
            "Music",
          ].map((category) => (
            <Link key={category} href="#" className="text-sm whitespace-nowrap">
              {category}
            </Link>
          ))}
        </nav>
      </div>
      <div className="max-w-full mx-auto flex-col  px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          <UserSection user={userProfile} />
          <section className="bg-yellow-600 rounded-lg p-6 sm:p-8 relative h-full min-h-[300px] flex justify-between items-center">
            <button className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1">
              <ChevronLeft size={24} />
            </button>
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1">
              <ChevronRight size={24} />
            </button>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg max-w-4xl w-fit m-4 sm:m-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Slow and steady
              </h2>
              <p className="mb-2">
                Try learning just 5–10 minutes a day.{" "}
                <Link href="" className="text-purple-600 underline">
                  Continue your course
                </Link>{" "}
                and reach your peak potential.
              </p>
            </div>
            <div className="hidden lg:block ml-12">
              <Image
                src={learning}
                alt="Learning illustration"
                width={400}
                height={400}
                className="object-cover border-none"
              />
            </div>
          </section>

          <section className="my-6 mx-4 lg:mx-0">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                Let&apos;s start learning
              </h2>
              <Link
                href="/individual/my-learning"
                className="text-lg font-bold text-purple-600 underline"
              >
                My learning
              </Link>
            </div>
            <div className="bg-white shadow rounded-lg p-4 flex items-center space-x-4 mx-auto">
              <div className="relative">
                <Image
                  src={course_thumbnail}
                  alt="Course thumbnail"
                  width={120}
                  height={68}
                  className="rounded"
                />
                <button className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                  <Play size={24} className="text-white" />
                </button>
              </div>
              <div>
                <h3 className="font-semibold">
                  Building a Web Application Layout - Part 1
                </h3>
                <p className="text-sm text-gray-600">Lecture • 10m left</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{ width: "45%" }}
                  ></div>
                </div>
              </div>
            </div>
          </section>
          <section id="course-grid" className="my-6">
            <div className="text-2xl sm:text-3xl font-thin mb-2 p-4">
              <p>What to learn next</p>
            </div>
            <div className="text-lg font-bold p-2 sm:p-4 mb-4">
              <p>
                Because you viewed{" "}
                <span className="text-purple-600">Mathematics</span>
              </p>
              <CourseGrid />
            </div>
            <div className="text-lg font-bold p-4 mb-4">
              <p>
                Because you viewed{" "}
                <span className="text-purple-600">Mathematics</span>
              </p>
              <CourseGrid />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
