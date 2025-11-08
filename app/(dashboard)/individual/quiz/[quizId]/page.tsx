"use client";

import axios from "axios";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestSuite, CourseData } from "@/app/types/quiz";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Slide, toast } from "react-toastify";

export default function Quiz() {
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<
    "proctored" | "learning" | null
  >(null);
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);

  const handleModeSelect = (mode: "proctored" | "learning") => {
    setSelectedMode(mode);
    setSelectedSuite(null);
  };

  const handleSuiteSelect = (suite: TestSuite) => {
    setSelectedSuite(suite);
  };

  const handleStartTest = async () => {
    try {
      const result = await axios.post(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/tests/${courseData?.proctored.id}/suites/${selectedSuite?._id}/start-attempt?mode=${selectedMode}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );

      if (selectedMode === "proctored") {
        router.push(
          `${courseData?.proctored.id}/suites/${selectedSuite?._id}/attempts/${result?.data?.attemptId}?mode=${selectedMode}`
        );
      } else if (selectedMode === "learning") {
        router.push(
          `${courseData?.learning.id}/suites/${selectedSuite?._id}/attempts/${result?.data?.attemptId}?mode=${selectedMode}`
        );
      }
      console.log(result);
    } catch (error) {
      console.log(error);
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
    } finally {
    }
  };

  const subscribedCoursesDetails = async () => {
    const courseId = pathname.split("/").pop();
    try {
      const result = await axios.get(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/courses/${courseId}`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log("courseData", result);
      setCourseData(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    subscribedCoursesDetails();
  }, []);

  if (!courseData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center sm:text-left">
        View Test Details
      </h1>
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle>{courseData.proctored.course.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">{courseData.proctored.course.description}</p>
          <div className="flex justify-between mb-4">
            <Button
              className={`${
                selectedMode === "proctored"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => handleModeSelect("proctored")}
            >
              Proctored Mode
            </Button>
            <Button
              className={`${
                selectedMode === "learning"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => handleModeSelect("learning")}
            >
              Learning Mode
            </Button>
          </div>
          {selectedMode && (
            <div>
              <h3 className="text-lg font-medium mb-2">
                {selectedMode === "proctored"
                  ? "Proctored Test"
                  : "Learning Test"}
              </h3>
              <p className="mb-2">
                Time: {courseData[selectedMode].course.time} minutes
              </p>
              <p className="mb-2">
                Domains: {courseData[selectedMode].course.domains.join(", ")}
              </p>
              <p className="mb-2">
                Questions: {courseData[selectedMode].course.questions}
              </p>
              <div className="mb-4">
                <div className="text-base font-medium pt-4">
                  {" "}
                  Select a suite from below to proceed
                </div>
                <Accordion type="single" collapsible>
                  {courseData[selectedMode].test_suites.map((suite, index) => (
                    <AccordionItem value={suite._id} key={suite._id}>
                      <AccordionTrigger>
                        <h4 className="font-medium">Suite {index + 1}</h4>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Button
                          onClick={() => handleSuiteSelect(suite)}
                          className={`${
                            selectedSuite?._id === suite._id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {selectedSuite?._id === suite._id
                            ? "Selected"
                            : "Select This Suite"}
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
              <Button onClick={handleStartTest}>
                Start {selectedMode} Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
