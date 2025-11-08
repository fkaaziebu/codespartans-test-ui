"use client";
import CourseDetailPage from "../../courses/course-details";
import CourseOfferCard from "../../courses/course-offfer-card";
import { Topic } from "@/app/types/topic";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { Slide, toast } from "react-toastify";
import { useEffect, useState } from "react";

export default function CourseDetails() {
  const pathname = usePathname();
  const id = pathname.split("/").pop();
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const fetchTopics = async () => {
    const courseId = id;
    if (!courseId) {
      throw new Error("No topic selected");
    }
    try {
      const result = await axios.get(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/courses/${courseId}`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log(result);
      setSelectedTopic(result.data);
    } catch (error) {
      toast.error("Could not fetch topics, refresh the page", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        transition: Slide,
      });
      console.error("Error fetching topics:", error);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const addToCart = async () => {
    try {
      await axios.post(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/carts/courses:add?`,
        {
          courseId: id?.toString(),
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      toast.success("Added to cart successfully, happy learning", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
      router.push("/individual/cart");
    } catch (error) {
      const errorMessage =
        // @ts-expect-error nec
        error.response?.data?.message ?? "Failed to add to cart. Try again.";
      toast.error(errorMessage, {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Slide,
      });
    }
  };

  return (
    <div className="relative overflow-x-hidden">
      {/* Course Header */}
      <div className="w-full flex flex-col px-4 md:px-6 py-4 bg-gray-900 text-white items-left justify-center">
        <div className="pl-10 items-center justify-center">
          <h1 className="text-xl md:text-3xl font-bold mb-2 ">
            {selectedTopic?.title}
          </h1>
          <p className="text-sm md:text-lg mb-4">
            {selectedTopic?.description}
          </p>

          {/* Course Stats */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm mb-4">
            {selectedTopic?.isBestseller && (
              <span className="bg-yellow-400 text-black px-2 py-0.5 text-xs font-bold rounded">
                Bestseller
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-screen-lg grid grid-cols-1 md:grid-cols-3 gap-4 px-4 overflow-x-hidden">
        <div className="col-span-2">
          <CourseDetailPage />
        </div>
        <div className="sticky top-4">
          <CourseOfferCard
            current_price={selectedTopic?.current_price ?? 0}
            original_price={selectedTopic?.original_price ?? 0}
            discount={selectedTopic?.discount ?? 0}
            timeLeft={12}
            couponCode={"GHJHVVHVVHHH"}
            subscriptionPrice={selectedTopic?.current_price ?? 0}
            handleAddToCart={addToCart}
          />
        </div>
      </div>
    </div>
  );
}
