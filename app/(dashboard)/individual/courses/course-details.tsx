"use client";
import { TopicDetails } from "@/app/types/topic";
import axios from "axios";
import { FileText, Play, Award, Monitor, Check } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Slide, toast } from "react-toastify";
// import Spinner from "@/components/ui/spinner";

const CourseDetailPage = () => {
  const [topicDetails, setTopicDetails] = useState<TopicDetails | null>(null);
  const [loading, setLoading] = useState(true); // loading state
  const pathname = usePathname();
  const id = pathname.split("/").pop();

  const api = async () => {
    const courseId = id;
    if (!courseId) {
      throw new Error("No topic selected");
    }

    try {
      setLoading(true);
      const result = await axios.get(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/courses/${courseId}`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      setTopicDetails(result.data);
    } catch (error) {
      console.log(error);
      toast.error("Could not view details of course, try again", {
        position: "bottom-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "dark",
        transition: Slide,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        {/* <Spinner /> */}
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto flex-col overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* What you'll learn */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">What you&apos;ll learn</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {topicDetails?.domains.map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <Check className="mt-1 flex-shrink-0" size={20} />
                <span>{item}</span>
              </div>
            )) || <p>No learning points available.</p>}
          </div>
        </div>

        {/* This course includes */}
        <div className="bg-white border rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">This course includes:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Play size={20} />
              <span>{topicDetails?.time || "No videos available"}</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText size={20} />
              <span>{topicDetails?.level || 0} level</span>
            </div>
            <div className="flex items-center gap-3">
              <Award size={20} />
              <span>Certificate of completion</span>
            </div>
            <div className="flex items-center gap-3">
              <Monitor size={20} />
              <span>Access on mobile and TV</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
