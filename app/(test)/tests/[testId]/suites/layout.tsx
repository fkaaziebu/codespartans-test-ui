"use client";
import { Clock, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { useFinishAttemptBannerUpdate } from "@/hooks/use-action-store";

export default function TestSuiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [state, setState] = useState(1);
  const [isOpenBanner, setIsOpenBanner] = useState(true);

  const [hasActiveTest, setHasActiveTest] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [suiteId, setSuiteId] = useState("");
  const [attemptId, setAttemptId] = useState("");
  const [totalQuestions, setTotalQuestions] = useState();
  const [courseId, setCourseId] = useState();
  const [mode, setMode] = useState<"proctored" | "learning">();
  const [testId, setTestId] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const router = useRouter();
  const [isTestActive, setIsTestActive] = useState(false);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const INACTIVITY_TIMEOUT = 50000; // 50 seconds for testing
  const { userFinished, resetUserFinished } = useFinishAttemptBannerUpdate();
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    inactivityTimerRef.current = setTimeout(() => {
      setHasActiveTest(false);
    }, INACTIVITY_TIMEOUT);
  }, []);

  const initializeSocket = useCallback(() => {
    const socket = io(
      "http://ec2-3-76-36-58.eu-central-1.compute.amazonaws.com:3002",
      {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      },
    );

    socket.on("connect", () => {
      const userId = sessionStorage.getItem("userId");
      // Join test room if testId is provided
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
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      setHasActiveTest(false);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      console.log(hasActiveTest);
    });

    socket.on("activeTestsUpdate", (data) => {
      resetInactivityTimer();
      const activeTest = data.activeTests[0];
      setIsTestActive(activeTest.time_remaining > 0);

      if (data.activeTests[0].time_remaining > 0) {
        setHasActiveTest(true);
      }

      if (
        data.activeTests[0].time_remaining <= 0 ||
        data.activeTests[0].status === 4 ||
        data.activeTests[0].status === 2
      ) {
        setHasActiveTest(false);
      }

      setState(data.activeTests[0].status);
      setTimeRemaining(data.activeTests[0].time_remaining);
      setCourseTitle(data.activeTests[0].course_title);
      setCourseId(data.activeTests[0].course_id);
      setTestId(data.activeTests[0].test_id);
      setSuiteId(data.activeTests[0].suite_id);
      setAttemptId(data.activeTests[0].attempt_id);
      setMode(data.activeTests[0].mode);
      setTotalQuestions(data.activeTests[0].total_questions);
    });

    return socket;
  }, [resetInactivityTimer]);

  const formatTime = (
    seconds: number,
    format: "HH:MM:SS" | "MM:SS" = "HH:MM:SS",
  ): string => {
    if (format === "MM:SS") {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }

    // Test time update
    const socket = initializeSocket();
    socket.on("activeTestsUpdate", (data) => {
      resetInactivityTimer();

      if (data.activeTests[0].time_remaining > 0) {
        setHasActiveTest(true);
      }

      if (data.activeTests[0].time_remaining <= 0) {
        setHasActiveTest(false);
      }

      setState(data.activeTests[0].status);
      setTimeRemaining(data.activeTests[0].time_remaining);
      setCourseTitle(data.activeTests[0].course_title);
      setCourseId(data.activeTests[0].course_id);
      setTestId(data.activeTests[0].test_id);
      setSuiteId(data.activeTests[0].suite_id);
      setAttemptId(data.activeTests[0].attempt_id);
      setMode(data.activeTests[0].mode);
      setTotalQuestions(data.activeTests[0].total_questions);
    });
  }, []);
  console.log("usefinished", userFinished);
  useEffect(() => {
    if (userFinished) {
      setIsOpenBanner(false);
      resetUserFinished();
    }
  }, [userFinished]);

  return (
    <div className="flex h-full flex-col">
      {/* {hasActiveTest && isOpenBanner && (
        <div className="flex w-full items-center justify-between bg-yellow-500 px-4 text-yellow-950">
          <Link
            href={`/tests/${courseId}/suites/${suiteId}/attempts/${attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`}
            className="underline"
          >
            Test for {courseTitle} in progress, click to continue
          </Link>

          <div className="flex items-center gap-2">
            {mode && mode === "proctored" && (
              <>
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatTime(timeRemaining)}</span>
              </>
            )}
            {state === 3 && <span>Paused</span>}
            <Button
              onClick={() => setIsOpenBanner(false)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-yellow-500 hover:text-yellow-950"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )} */}

      {isTestActive && isOpenBanner && (
        <div className="flex w-full items-center justify-between bg-yellow-500 px-4 text-yellow-950">
          <Link
            href={`/tests/${courseId}/suites/${suiteId}/attempts/${attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`}
            className="underline"
          >
            Test for {courseTitle} in progress, click to continue
          </Link>

          <div className="flex items-center gap-2">
            {mode && mode === "proctored" && (
              <>
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatTime(timeRemaining)}</span>
              </>
            )}
            {state === 3 && <span>Paused</span>}
            <Button
              onClick={() => setIsOpenBanner(false)}
              variant="ghost"
              size="icon"
              className="h-7 w-7 hover:bg-yellow-500 hover:text-yellow-950"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
