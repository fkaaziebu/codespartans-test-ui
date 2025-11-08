"use client";
import axios from "axios";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import EmptyHappyState from "@/public/images/empty-happy-state.svg";

export default function StatsPage() {
  const [testAnalytics, setTestAnalytics] = useState<{
    score: number;
    mastery_level: number;
    completed_at: string;
    started_at: string;
    time_events: Array<{
      type: "start" | "pause" | "end" | "resume";
      recorded_at: string;
    }>;
    domain_performance: Array<{
      domain: string;
      score: number;
      time_spent: number;
      confidence_level: number;
      areas_of_improvement: Array<string>;
    }>;
    learning_insights: {
      weaknesses: Array<string>;
      recommendations: Array<string>;
    };
  }>({
    score: 0,
    mastery_level: 0,
    completed_at: "",
    started_at: "",
    time_events: [
      {
        type: "start",
        recorded_at: "",
      },
    ],
    domain_performance: [
      {
        domain: "",
        score: 0,
        time_spent: 0,
        confidence_level: 0,
        areas_of_improvement: [""],
      },
    ],
    learning_insights: {
      weaknesses: [""],
      recommendations: [""],
    },
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const testId = searchParams.get("testId");
  const mode = searchParams.get("mode");
  const courseId = pathname.split("/")[pathname.split("/").length - 6];
  const suiteId = pathname.split("/")[pathname.split("/").length - 4];
  const attemptId = pathname.split("/")[pathname.split("/").length - 2];
  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3004/v1";

  const getTestSuiteAttemptStat = async (
    retryCount = 0,
    maxRetries = 3,
    delay = 5000,
  ) => {
    try {
      setIsLoadingStats(true);

      const response = await axios.get(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/stats?mode=${mode}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      console.log("time events", response.data.time_events);
      setTestAnalytics({
        ...response.data.analytics,
        time_events: response.data.time_events,
      }); // Set the analytics data
    } catch (error) {
      console.error(error);

      if (retryCount < maxRetries) {
        console.log(`Retrying... Attempt ${retryCount + 1} of ${maxRetries}`);
        setTimeout(() => {
          getTestSuiteAttemptStat(retryCount + 1, maxRetries, delay);
        }, delay);
      } else {
        console.error("Max retry attempts reached. Unable to fetch stats.");
      }
    } finally {
      setIsLoadingStats(false);
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ${seconds % 60}s`;
  };

  function calculateEffectiveDuration(
    events?: Array<{
      type: "start" | "pause" | "end" | "resume";
      recorded_at: string;
    }>,
  ) {
    let startTime: number | null = null;
    let endTime: number | null = null;
    let pauseStart: number | null = null;
    let totalPauseDuration = 0;
    console.log("events", events);
    events?.forEach((event) => {
      const eventTime = new Date(event.recorded_at).getTime();

      if (event.type === "start") {
        startTime = eventTime;
      } else if (event.type === "pause") {
        pauseStart = eventTime;
      } else if (event.type === "resume" && pauseStart !== null) {
        totalPauseDuration += eventTime - pauseStart;
        pauseStart = null;
      } else if (event.type === "end") {
        endTime = eventTime;
      }
    });

    if (startTime !== null && endTime !== null) {
      const totalDuration = endTime - startTime;
      const effectiveDuration = totalDuration - totalPauseDuration;
      return effectiveDuration;
    }

    return 1;
  }

  const getMasteryLabel = (level: number) => {
    switch (level) {
      case 1:
        return <Badge className="bg-red-100 text-red-800">Beginner</Badge>;
      case 2:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">Intermediate</Badge>
        );
      case 3:
        return <Badge className="bg-green-100 text-green-800">Advanced</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    getTestSuiteAttemptStat();
  }, []);

  // useEffect(() => {
  //   if (!isLoadingStats && testAnalytics.score > 0) {
  //     window.location.reload();
  //   }
  // }, [isLoadingStats]);

  return (
    <>
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 text-gray-100">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-semibold text-purple-600">
            ExamSim
          </Link>
          {/* <h1>{courseInfo?.proctored.course.title}</h1> */}
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex justify-between gap-2 space-x-4">
              <Link href={`/tests/${courseId}/suites`} className="underline">
                Back to suites page
              </Link>

              <Link
                href={`/tests/${courseId}/suites/${suiteId}/attempts/${attemptId}/stats/review?mode=${mode}&testId=${testId}`}
                className="rounded-sm border px-2 text-gray-900 hover:bg-purple-300 hover:text-white"
              >
                Review
              </Link>
            </div>
          </div>
        </div>
      </div>

      {!isLoadingStats ? (
        <div className="h-[90%] overflow-y-auto py-3 pb-20">
          <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-5 py-3">
            {/* Overview Section */}
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Overall Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round(testAnalytics.score)}%
                  </div>
                  <Progress value={testAnalytics.score} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mastery Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-2xl font-bold">
                    Level {testAnalytics.mastery_level}
                  </div>
                  {getMasteryLabel(testAnalytics.mastery_level)}
                </CardContent>
              </Card>

              <Card className="flex items-center gap-2">
                <Card className="h-full w-full rounded-r-none border-r-0 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Completion Date
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!testAnalytics.completed_at ? (
                      <div className="flex items-center space-x-4">
                        {/* Placeholder for the date */}
                        <div className="h-6 w-24 animate-pulse rounded bg-gray-300"></div>
                        {/* Placeholder for the time or additional text */}
                        <div className="h-6 w-16 animate-pulse rounded bg-gray-300"></div>
                      </div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">
                          {new Date(
                            testAnalytics.completed_at,
                          ).toLocaleDateString()}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(
                            testAnalytics.completed_at,
                          ).toLocaleTimeString()}
                        </p>
                        <div></div>
                      </>
                    )}
                  </CardContent>
                </Card>
                <div className="h-full items-center border"></div>
                <Card className="h-full w-full rounded-l-none border-l-0 shadow-none">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      You Spent a total of
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatTime(
                        calculateEffectiveDuration(testAnalytics.time_events),
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Card>
            </div>

            {/* Domain Details */}
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Detailed Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {testAnalytics.domain_performance.map((domain) => (
                      <div key={domain.domain} className="border-b pb-4">
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold">{domain.domain}</h3>
                          <span className="text-sm text-muted-foreground">
                            Time spent: {formatTime(domain.time_spent)}
                          </span>
                        </div>
                        <Progress
                          value={(domain.score / domain.confidence_level) * 100}
                          className="h-2"
                        />
                        <p className="mt-1 text-sm text-muted-foreground">
                          Score: {domain.score}/{domain.confidence_level}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Insights */}
            <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {testAnalytics.learning_insights.weaknesses.length > 0 ? (
                      testAnalytics.learning_insights.weaknesses.map(
                        (weakness, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500"></span>
                            {weakness}
                          </li>
                        ),
                      )
                    ) : (
                      <div className="p-5">
                        <Image
                          src={EmptyHappyState}
                          alt="Empty state for weaknesses"
                          className="h-60"
                        />
                      </div>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {testAnalytics.learning_insights.recommendations.length >
                    0 ? (
                      testAnalytics.learning_insights.recommendations.map(
                        (rec, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                            {rec}
                          </li>
                        ),
                      )
                    ) : (
                      <div className="p-5">
                        <Image
                          src={EmptyHappyState}
                          alt="Empty state for recommendations"
                          className="h-60"
                        />
                      </div>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[90%] overflow-y-auto py-3 pb-20">
          <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-5 py-3">
            <LoaderCircle className="h-16 w-16 animate-spin text-gray-300" />
          </div>
        </div>
      )}
    </>
  );
}
