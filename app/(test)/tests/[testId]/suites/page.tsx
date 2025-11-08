"use client";
import axios from "axios";
import { History, LoaderCircle, Play } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function TestSuitesPage() {
  const [isRoutingToAttemptPage, setIsRoutingToAttemptPage] = useState(false);
  const [currentMode, setCurrentMode] = useState<"proctored" | "learning">(
    "proctored",
  );
  const [isLoadingTestSuite, setIsLoadingTestSuite] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoadingTestAttemptStart, setIsLoadingTestAttemptStart] =
    useState(false);
  const [courseInfo, setCourseInfo] = useState<{
    proctored: {
      id: string;
      course: {
        title: string;
        description: string;
      };
      test_suites: Array<{
        _id: string;
        start: number;
        end: number;
        total_attempts: number;
      }>;
    };
    learning: {
      id: string;
      course: {
        title: string;
        description: string;
      };
      test_suites: Array<{
        _id: string;
        start: number;
        end: number;
        total_attempts: number;
      }>;
    };
  }>();
  const [hasActiveTest, setHasActiveTest] = useState(false);
  const [socketLoading, setSocketLoading] = useState(true);
  const [suite_Id, setSuite_Id] = useState("");
  const [attemptId, setAttemptId] = useState("");
  const [courseId, setCourseId] = useState();
  const [totalQuestions, setTotalQuestions] = useState();
  const [mode, setMode] = useState<"proctored" | "learning">();
  const [testId, setTestId] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATION;
  const INACTIVITY_TIMEOUT = 50000;

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      setHasActiveTest(false);
    }, INACTIVITY_TIMEOUT);
  }, []);

  // const initializeSocket = useCallback(() => {
  //   const socket = io(
  //     "http://localhost:3004",
  //     {
  //       transports: ["websocket"],
  //       reconnection: true,
  //       reconnectionDelay: 1000,
  //       reconnectionDelayMax: 5000,
  //       reconnectionAttempts: 5,
  //     },
  //   );

  //   socket.on("connect", () => {
  //     const userId = sessionStorage.getItem("userId");
  //     // Join test room if testId is provided
  //     if (userId) {
  //       socket.emit(
  //         "registerUser",
  //         { user_id: userId },
  //         (response: {
  //           status: string;
  //           user_id: number;
  //           socketCount: number;
  //         }) => {
  //           console.log("Joined test room:", response);
  //         },
  //       );
  //     }
  //   });

  //   socket.on("disconnect", () => {
  //     console.log("Socket disconnected");
  //     if (inactivityTimerRef.current) {
  //       clearTimeout(inactivityTimerRef.current);
  //     }
  //     setHasActiveTest(false);
  //     setSocketLoading(false);
  //   });

  //   socket.on("error", (error) => {
  //     console.error("Socket error:", error);
  //   });

  //   socket.on("activeTestsUpdate", (data) => {
  //     resetInactivityTimer();

  //     if (data.activeTests[0].time_remaining > 0) {
  //       setHasActiveTest(true);
  //     }

  //     if (data.activeTests[0].time_remaining <= 0) {
  //       setHasActiveTest(false);
  //     }

  //     setCourseId(data.activeTests[0].course_id);
  //     setTestId(data.activeTests[0].test_id);
  //     setSuite_Id(data.activeTests[0].suite_id);
  //     setAttemptId(data.activeTests[0].attempt_id);
  //     setMode(data.activeTests[0].mode);
  //     setTotalQuestions(data.activeTests[0].total_questions);
  //     setSocketLoading(false);
  //   });

  //   return socket;
  // }, [resetInactivityTimer]);

  const initializeSocket = useCallback(() => {
    const socket = io("http://localhost:3004", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      const userId = sessionStorage.getItem("userId");
      if (userId) {
        socket.emit(
          "registerUser",
          { user_id: userId },
          (response: {
            status: string;
            user_id: number;
            socketCount: number;
          }) => {
            console.log("Joined test room:", response);
          },
        );
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setHasActiveTest(false);
      setSocketLoading(false); // Ensure loading is false even if disconnected
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setSocketLoading(false); // Ensure loading is false on error
    });

    socket.on("activeTestsUpdate", (data) => {
      resetInactivityTimer();

      if (data.activeTests[0].time_remaining > 0) {
        setHasActiveTest(true);
      } else {
        setHasActiveTest(false);
      }

      setCourseId(data.activeTests[0].course_id);
      setTestId(data.activeTests[0].test_id);
      setSuite_Id(data.activeTests[0].suite_id);
      setAttemptId(data.activeTests[0].attempt_id);
      setMode(data.activeTests[0].mode);
      setTotalQuestions(data.activeTests[0].total_questions);

      // Mark socket as initialized
      setSocketLoading(false);
    });

    return socket;
  }, [resetInactivityTimer]);

  const getTestSuites = async () => {
    try {
      setIsLoadingTestSuite(true);
      const courseId = pathname.split("/")[pathname.split("/").length - 2];
      const response = await axios.get(
        `${baseUrl}/simulation/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      console.log(response);
      setCourseInfo(response.data);
    } catch (error) {
      toast({
        title: "An error occured while loading test suites",
        description: "Try refreshing the page to see if it fixes the issue",
        variant: "destructive",
      });
      console.log(error);
    } finally {
      setIsLoadingTestSuite(false);
    }
  };

  const startTestAttempt = async ({
    testId,
    suiteId,
    totalQuestions,
  }: {
    testId: string;
    suiteId: string;
    totalQuestions: number;
  }) => {
    try {
      setIsLoadingTestAttemptStart(true);
      const response = await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/start-attempt?mode=${currentMode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setIsRoutingToAttemptPage(true);

      router.push(
        `suites/${suiteId}/attempts/${response.data.attemptId}?mode=${currentMode}&testId=${testId}&totalQuestions=${totalQuestions}`,
      );
    } catch (error) {
      toast({
        title: "",
        // @ts-expect-error known error
        description: ` ${error?.response?.data?.message} click to continue`,
        onClick: () => {
          if (
            courseId &&
            suite_Id &&
            attemptId &&
            mode &&
            testId &&
            totalQuestions
          ) {
            router.push(
              `/tests/${courseId}/suites/${suite_Id}/attempts/${attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`,
            );
          } else {
            toast({
              title: "Error",
              description: "Test data is not available. Please try again.",
              variant: "destructive",
            });
          }
        },
        variant: "destructive",
      });
    } finally {
      setIsLoadingTestAttemptStart(false);
    }
  };

  const getRandomInt = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const startRandomTestAttempt = async () => {
    try {
      setIsLoadingTestAttemptStart(true);
      const randomSelectedCourse = courseInfo && courseInfo[currentMode];
      const testId = randomSelectedCourse?.id;
      const suite =
        randomSelectedCourse?.test_suites[
          getRandomInt(0, randomSelectedCourse?.test_suites.length - 1)
        ];

      const suiteId = suite?._id;
      const totalQuestions = (suite?.end || 0) - (suite?.start || 0);
      setIsLoadingTestAttemptStart(true);
      const response = await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/start-attempt?mode=${currentMode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setIsRoutingToAttemptPage(true);

      router.push(
        `suites/${suiteId}/attempts/${response.data.attemptId}?mode=${currentMode}&testId=${testId}&totalQuestions=${totalQuestions}`,
      );
    } catch (error) {
      toast({
        title: "An error occured while starting attempt",
        // @ts-expect-error known error
        description: ` ${error?.response?.data?.message} click to continue`,
        onClick: () => {
          router.push(
            `/tests/${courseId}/suites/${suite_Id}/attempts/${attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`,
          );
        },
        variant: "destructive",
      });
    } finally {
      setIsLoadingTestAttemptStart(false);
    }
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    getTestSuites();
  }, []);

  useEffect(() => {
    // Test time update
    const socket = initializeSocket();
    socket.on("activeTestsUpdate", (data) => {
      if (data.activeTests[0].time_remaining > 0) {
        setHasActiveTest(true);
      }

      if (data.activeTests[0].time_remaining <= 0) {
        setHasActiveTest(false);
      }

      setCourseId(data.activeTests[0].course_id);
      setTestId(data.activeTests[0].test_id);
      setAttemptId(data.activeTests[0].attempt_id);
      setMode(data.activeTests[0].mode);
      setTotalQuestions(data.activeTests[0].total_questions);
    });
  }, []);
  return (
    <>
      {isLoadingTestAttemptStart && (
        <div className="fixed z-30 flex h-screen w-screen flex-col items-center justify-center gap-5 rounded-lg border border-gray-200/20 bg-gray-500/50 text-gray-900 shadow-lg backdrop-blur-md backdrop-filter">
          {isLoadingTestAttemptStart && <span>Creating attempt...</span>}
          {isRoutingToAttemptPage && (
            <span>We are sending you to the attempt page...</span>
          )}

          <LoaderCircle className="h-16 w-16 animate-spin text-gray-300" />
        </div>
      )}
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 text-gray-100">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-semibold text-purple-600">
            ExamSim
          </Link>
          <h1>{courseInfo?.proctored.course.title}</h1>
        </div>
      </div>
      <div className="bg-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-gray-950">Test Modes</h2>
              <p className="text-sm text-gray-800">
                {courseInfo?.proctored.course.description}
              </p>
            </div>
            <div>
              {!hasActiveTest && (
                <Button
                  className="flex items-center gap-4 bg-gray-900 px-2 py-2 text-gray-300 hover:bg-gray-950"
                  onClick={() => startRandomTestAttempt()}
                  disabled={hasActiveTest || isLoadingTestAttemptStart}
                >
                  Random Test{" "}
                  {!isLoadingTestAttemptStart ? (
                    <Play className="h-4 w-4 text-gray-300" />
                  ) : (
                    <LoaderCircle className="h-4 w-4 animate-spin text-gray-300" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="mx-auto flex max-w-screen-xl flex-col gap-5 py-5">
          <div className="flex items-center gap-4 border-b border-b-gray-200">
            <button
              className={cn(
                "border-b-2 border-white px-2 py-1.5 font-bold",
                currentMode === "proctored" && "border-blue-500 text-blue-500",
              )}
              onClick={() => setCurrentMode("proctored")}
            >
              Proctored
            </button>
            <button
              className={cn(
                "border-b-2 border-white px-2 py-1.5 font-bold",
                currentMode === "learning" && "border-blue-500 text-blue-500",
              )}
              onClick={() => setCurrentMode("learning")}
            >
              Learning
            </button>
          </div>
        </div>
      </div>

      {!isLoadingTestSuite ? (
        <div className="h-full overflow-y-auto">
          <div className="mx-auto max-w-screen-xl py-5">
            <Card>
              <CardHeader className="flex cursor-pointer items-center justify-between px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold">Practice Tests</h2>
                </div>
              </CardHeader>

              {currentMode === "proctored" &&
                courseInfo?.proctored.test_suites.map((suite, ind) => (
                  <div
                    key={suite._id}
                    className="group border-t px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-gray-50">
                          <History className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Practice Test #{ind + 1} -{" "}
                            {courseInfo.proctored.course.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          {suite.end - suite.start} questions
                        </span>
                        <div className="flex gap-2">
                          {suite.total_attempts > 0 && (
                            <Link
                              href={`suites/${suite._id}/attempts?mode=${currentMode}&testId=${courseInfo?.proctored?.id}&totalQuestions=${suite.end - suite.start}`}
                              className="hidden items-center justify-center rounded-md border px-3 py-1.5 hover:bg-gray-100 group-hover:flex"
                            >
                              View attempts
                            </Link>
                          )}
                          {!hasActiveTest && (
                            <Button
                              variant="default"
                              className="hidden group-hover:flex"
                              onClick={() =>
                                startTestAttempt({
                                  testId: courseInfo?.proctored?.id,
                                  suiteId: suite._id,
                                  totalQuestions: suite.end - suite.start,
                                })
                              }
                            >
                              {!isLoadingTestAttemptStart ? (
                                "Start Test"
                              ) : (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              )}
                            </Button>
                          )}

                          {hasActiveTest &&
                            suite_Id === suite._id &&
                            mode === currentMode && (
                              <Link
                                className="hidden items-center justify-center rounded-sm bg-gray-800 px-4 text-white group-hover:flex"
                                href={`/tests/${courseId}/suites/${suite._id}/attempts/${attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`}
                              >
                                {!isLoadingTestAttemptStart ? (
                                  "Continue"
                                ) : (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                              </Link>
                            )}
                          {hasActiveTest &&
                            suite_Id === suite._id &&
                            mode !== currentMode && (
                              <Button
                                variant="default"
                                className="hidden group-hover:flex"
                                disabled={
                                  socketLoading ||
                                  hasActiveTest ||
                                  isLoadingTestAttemptStart
                                }
                                onClick={() =>
                                  startTestAttempt({
                                    testId: courseInfo?.proctored?.id,
                                    suiteId: suite._id,
                                    totalQuestions: suite.end - suite.start,
                                  })
                                }
                              >
                                {!isLoadingTestAttemptStart ? (
                                  "Start Test"
                                ) : (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                              </Button>
                            )}

                          {hasActiveTest && suite_Id !== suite._id && (
                            <Button
                              variant="default"
                              className="hidden group-hover:flex"
                              disabled={
                                socketLoading ||
                                hasActiveTest ||
                                isLoadingTestAttemptStart
                              }
                              onClick={() =>
                                startTestAttempt({
                                  testId: courseInfo?.proctored?.id,
                                  suiteId: suite._id,
                                  totalQuestions: suite.end - suite.start,
                                })
                              }
                            >
                              {!isLoadingTestAttemptStart ? (
                                "Start Test"
                              ) : (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

              {currentMode === "learning" &&
                courseInfo?.learning.test_suites.map((suite, ind) => (
                  <div
                    key={suite._id}
                    className="group border-t px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-gray-50">
                          <History className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Practice Test #{ind + 1} -{" "}
                            {courseInfo.learning.course.title}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-gray-600">
                          {suite.end - suite.start} questions
                        </span>
                        <div className="flex gap-2">
                          {suite.total_attempts > 0 && (
                            <Link
                              href={`suites/${suite._id}/attempts?mode=${currentMode}&testId=${courseInfo?.learning?.id}&totalQuestions=${suite.end - suite.start}`}
                              className="hidden items-center justify-center rounded-md border px-3 py-1.5 hover:bg-gray-100 group-hover:flex"
                            >
                              View attempts
                            </Link>
                          )}
                          {!hasActiveTest && (
                            <Button
                              variant="default"
                              className="hidden group-hover:flex"
                              onClick={() =>
                                startTestAttempt({
                                  testId: courseInfo?.learning?.id,
                                  suiteId: suite._id,
                                  totalQuestions: suite.end - suite.start,
                                })
                              }
                            >
                              {!isLoadingTestAttemptStart ? (
                                "Start Test"
                              ) : (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              )}
                            </Button>
                          )}

                          {hasActiveTest &&
                            suite_Id === suite._id &&
                            mode === currentMode && (
                              <Link
                                className="hidden items-center justify-center rounded-sm bg-gray-800 px-4 text-white group-hover:flex"
                                href={`/tests/${courseId}/suites/${suite._id}/attempts/${attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`}
                              >
                                {!isLoadingTestAttemptStart ? (
                                  "Continue"
                                ) : (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                              </Link>
                            )}

                          {hasActiveTest &&
                            suite_Id === suite._id &&
                            mode !== currentMode && (
                              <Button
                                variant="default"
                                className="hidden group-hover:flex"
                                disabled={hasActiveTest || socketLoading}
                                onClick={() =>
                                  startTestAttempt({
                                    testId: courseInfo?.learning?.id,
                                    suiteId: suite._id,
                                    totalQuestions: suite.end - suite.start,
                                  })
                                }
                              >
                                {!isLoadingTestAttemptStart ? (
                                  "Start Test"
                                ) : (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                )}
                              </Button>
                            )}

                          {hasActiveTest && suite_Id !== suite._id && (
                            <Button
                              variant="default"
                              className="hidden group-hover:flex"
                              disabled={hasActiveTest || socketLoading}
                              onClick={() =>
                                startTestAttempt({
                                  testId: courseInfo?.learning?.id,
                                  suiteId: suite._id,
                                  totalQuestions: suite.end - suite.start,
                                })
                              }
                            >
                              {!isLoadingTestAttemptStart ? (
                                "Start Test"
                              ) : (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </Card>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-y-auto bg-gray-50">
          <div className="max-w-screen-xlitems-center mx-auto flex h-full w-full justify-center gap-5 py-5">
            <LoaderCircle className="h-16 w-16 animate-spin text-gray-300" />
          </div>
        </div>
      )}
    </>
  );
}
