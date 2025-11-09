"use client";
import axios from "axios";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  LoaderCircle,
  Pause,
  Play,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { io } from "socket.io-client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function LiveAttemptPage() {
  const [attemptState, setAttemptState] = useState<
    "active" | "paused" | "completed"
  >("active");
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [questionList, setQuestionList] = useState<Array<number>>([]);
  const [answeredQuestionList, setAnsweredQuestionList] = useState<
    Array<{
      question_number: number;
      description: string;
      multiple_choice_options: Array<string>;
      time: number;
      type: string;
      answer: Array<string>;
      is_flagged: boolean;
    }>
  >();
  const [isLoadingNextQuestion, setIsLoadingNextQuestion] = useState(false);
  const [isPausingResumingAttempt, setIsPausingResumingAttempt] =
    useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [isFinishingAttempt, setIsFinishingAttempt] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [hasErrorLoadingQuestion, setHasErrorLoadingQuestion] = useState(false);
  const [currentSelectedNumber, setCurrentSelectedNumber] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<{
    question_number: number;
    description: string;
    multiple_choice_options: Array<string>;
    time: number;
    hints?: Array<string>;
    type: string;
    answer: Array<string>;
    is_flagged: boolean;
    correct_answer?: Array<string>;
    fetch_time?: Date;
  }>({
    question_number: 0,
    description: "",
    multiple_choice_options: [],
    time: 0,
    hints: [],
    type: "",
    answer: [],
    is_flagged: false,
    correct_answer: [],
  });
  const [progressInfo, setProgressInfo] = useState<{
    completed: number;
    total_attempted: number;
    total_questions: number;
  }>({
    completed: 0,
    total_attempted: 0,
    total_questions: 0,
  });
  const [cachedAnswers, setCachedAnswers] = useState<{
    multipleSelect: string[];
    shortAnswer: string;
    trueOrFalse: string;
    multipleChoice: string;
  }>({
    multipleSelect: [],
    shortAnswer: "",
    trueOrFalse: "",
    multipleChoice: "",
  });
  const [fetchedQuestions, setFetchedQuestions] = useState<{
    [key: number]: {
      question_number: number;
      description: string;
      multiple_choice_options: Array<string>;
      time: number;
      hints?: Array<string>;
      type: string;
      answer: Array<string>;
      is_flagged: boolean;
      correct_answer?: Array<string>;
      fetch_time?: Date;
    };
  }>({});

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isActive, setIsActive] = useState(true);
  const [showWarningModal, setShowWarningModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [events, setEvents] = useState<string[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<number>(0);

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const testId = searchParams.get("testId");
  const mode = searchParams.get("mode");
  const attemptId = pathname.split("/").pop();

  const initializeSocket = useCallback(() => {
    const socket = io(
      "http://ec2-3-66-190-132.eu-central-1.compute.amazonaws.com:3002",
      {
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      },
    );

    socket.on("connect", () => {
      const testId = searchParams.get("testId");
      // Join test room if testId is provided
      if (testId) {
        socket.emit(
          "joinTestRoom",
          { test_id: testId },
          (response: { status: string; roomSize: number }) => {
            console.log("Joined test room:", response);
          },
        );
      }

      setIsSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsSocketConnected(false);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return socket;
  }, [searchParams.get("testId")]);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATION;
  //flag question handler
  const handleFlaggedQuestion = async () => {
    try {
      await submitAnswer({
        questionNumber: currentQuestion?.question_number || 0,
        answer: currentQuestion?.answer
          ? currentQuestion?.answer[0]
          : "flag question",
        isFlagged: !currentQuestion.is_flagged, //is_flagged
      });
    } catch (error) {
      console.error("Error", error);
    }
  };

  const getRandomQuestion = async () => {
    try {
      setIsLoadingNextQuestion(true);
      const testId = searchParams.get("testId");
      const mode = searchParams.get("mode");
      const suiteId = pathname.split("/")[pathname.split("/").length - 3];
      const attemptId = pathname.split("/").pop();

      if (fetchedQuestions[progressInfo.total_attempted + 1]) {
        setCurrentQuestion(fetchedQuestions[progressInfo.total_attempted + 1]);
        setCurrentSelectedNumber(progressInfo.total_attempted + 1);
        setHasErrorLoadingQuestion(false);
        return;
      }

      const response = await axios.get(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/next-question?mode=${mode}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setFetchedQuestions((prev) => ({
        ...prev,
        [progressInfo.total_attempted + 1]: response.data,
      }));

      setCurrentQuestion(response.data);
      setCurrentSelectedNumber(progressInfo.total_attempted + 1);
      setHasErrorLoadingQuestion(false);
    } catch (error) {
      toast({
        title: "An error occured while fetching question",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
      setHasErrorLoadingQuestion(true);
    } finally {
      setIsLoadingNextQuestion(false);
    }
  };

  const navigateToQuestion = async (index: number) => {
    try {
      setIsLoadingNextQuestion(true);
      setShowAnswer(false);

      // If we're moving to a previously answered question
      if (answeredQuestionList && index < answeredQuestionList.length) {
        selectPreviousQuestion(index);
        setCurrentSelectedNumber(index + 1);
      } else if (fetchedQuestions[index + 1]) {
        setCurrentQuestion(fetchedQuestions[index + 1]);
        setCurrentSelectedNumber(index + 1);
        setHasErrorLoadingQuestion(false);
      }
      // If we're moving to a new question
      else {
        const testId = searchParams.get("testId");
        const mode = searchParams.get("mode");
        const suiteId = pathname.split("/")[pathname.split("/").length - 3];
        const attemptId = pathname.split("/").pop();

        const response = await axios.get(
          `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/next-question?mode=${mode}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          },
        );
        setFetchedQuestions((prev) => ({
          ...prev,
          [index + 1]: response.data,
        }));

        setCurrentQuestion(response.data);
        setCurrentSelectedNumber(index + 1);
        setHasErrorLoadingQuestion(false);
      }
    } catch (error) {
      toast({
        title: "Failed to navigate to question",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
      setHasErrorLoadingQuestion(true);
    } finally {
      setIsLoadingNextQuestion(false);
    }
  };

  const handleNextQuestion = async () => {
    try {
      setShowAnswer(false);
      // option to submit multiple select answers after cache
      switch (currentQuestion.type) {
        case "multiple_select":
          if (cachedAnswers.multipleSelect.length > 0) {
            await submitAnswer({
              questionNumber: currentQuestion.question_number,
              answer: cachedAnswers.multipleSelect.join(","),
              isFlagged: currentQuestion.is_flagged,
            });
          }
          break;
        case "multiple_choice":
          if (cachedAnswers.multipleChoice) {
            await submitAnswer({
              questionNumber: currentQuestion.question_number,
              answer: cachedAnswers.multipleChoice || "",
              isFlagged: currentQuestion.is_flagged,
            });
          }
          break;
        case "short_answer":
          if (cachedAnswers.shortAnswer.trim()) {
            await submitAnswer({
              questionNumber: currentQuestion.question_number,
              answer: cachedAnswers.shortAnswer,
              isFlagged: currentQuestion.is_flagged,
            });
          }
          break;
        case "true/false":
          if (cachedAnswers.trueOrFalse) {
            await submitAnswer({
              questionNumber: currentQuestion.question_number,
              answer: cachedAnswers.trueOrFalse,
              isFlagged: currentQuestion.is_flagged,
            });
          }
          break;
        default:
          // Handle empty answer for other question types
          if (!currentQuestion?.answer?.[0]) {
            await submitAnswer({
              questionNumber: currentQuestion.question_number,
              answer: "",
              isFlagged: currentQuestion.is_flagged,
            });
          }
      }

      // Navigate to next question
      await navigateToQuestion(currentSelectedNumber);
      // Clear cached answers after navigation
      setCachedAnswers({
        multipleSelect: [],
        shortAnswer: "",
        trueOrFalse: "",
        multipleChoice: "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleShowAnswer = () => {
    if (currentQuestion?.answer?.[0]) {
      setShowAnswer(true);
    }
  };

  const submitAnswer = async ({
    questionNumber,
    answer,
    isFlagged,
  }: {
    questionNumber: number;
    answer: string;
    isFlagged: boolean;
  }) => {
    try {
      setIsSubmittingAnswer(true);

      // Only update current question after successful submission
      const testId = searchParams.get("testId");
      const mode = searchParams.get("mode");
      const suiteId = pathname.split("/")[pathname.split("/").length - 3];
      const attemptId = pathname.split("/").pop();

      const response = await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/questions/${questionNumber}/submit-answer?mode=${mode}`,
        {
          answer: [answer],
          fetchTime: currentQuestion.fetch_time,
          isFlagged,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      // Only update states after successful submission

      const currQues = response.data.answers.find(
        // @ts-expect-error neccssary
        (f) => f.question_number === currentQuestion.question_number,
      );

      const updatedQuestion = {
        ...currQues,
        fetch_time: currentQuestion.fetch_time,
      };

      setCurrentQuestion(updatedQuestion);
      setFetchedQuestions((prev) => ({
        ...prev,
        [currentSelectedNumber]: updatedQuestion,
      }));

      const progress = {
        completed: response.data.progress.completed,
        total_attempted: response.data.answers.length,
        total_questions: Number(searchParams.get("totalQuestions")),
      };

      setProgressInfo(progress);
      setAnsweredQuestionList(response.data.answers);
      console.log(response.data);
      return response; // Return response for chaining
    } catch (error) {
      // Rethrow error to be handled by caller
      throw error;
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  const getAllAttemptedQuestions = async () => {
    try {
      const testId = searchParams.get("testId");
      const mode = searchParams.get("mode");
      const suiteId = pathname.split("/")[pathname.split("/").length - 3];
      const attemptId = pathname.split("/").pop();

      const response = await axios.get(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/questions?mode=${mode}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      const progress = {
        completed: response.data.progress.completed,
        total_attempted: response.data.answered_questions.length,
        total_questions: Number(searchParams.get("totalQuestions")),
      };
      setProgressInfo(progress);
      setAnsweredQuestionList(
        response.data.answered_questions.map(
          (question: {
            question: {
              question_number: number;
              description: string;
              multiple_choice_options: Array<string>;
              time: number;
              type: string;
            };
            answer: Array<string>;
            is_flagged: boolean;
          }) => ({
            ...question.question,
            answer: question.answer,
            is_flagged: question.is_flagged,
          }),
        ),
      );
      if (progress.total_attempted < progress.total_questions) {
        setCurrentSelectedNumber(response.data.answered_questions.length + 1);
      } else {
        setCurrentQuestion({
          ...response.data.answered_questions[0].question,
          answer: response.data.answered_questions[0].answer,
          is_flagged: response.data.answered_questions[0].is_flagged,
        });
      }
    } catch (error) {
      toast({
        title: "An error occured while loading attempts",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    }
  };

  const pauseTestAttempt = async () => {
    try {
      setIsPausingResumingAttempt(true);
      const testId = searchParams.get("testId");
      const suiteId = pathname.split("/")[pathname.split("/").length - 3];
      const attemptId = pathname.split("/").pop();

      await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/pause-attempt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setAttemptState("paused");
      setIsOpen(false);
      toast({
        title: "Successfully paused test attempt",
        description:
          "You have successfully paused this attempt, you can resume it anytime you are ready",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "An error occured while starting attempt",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsPausingResumingAttempt(false);
    }
  };

  const resumeTestAttempt = async () => {
    try {
      setIsPausingResumingAttempt(true);
      const testId = searchParams.get("testId");
      const suiteId = pathname.split("/")[pathname.split("/").length - 3];
      const attemptId = pathname.split("/").pop();

      await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/resume-attempt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setAttemptState("active");
      setIsOpen(false);

      toast({
        title: "Successfully resumed test attempt",
        description:
          "You have successfully resumed this attempt, click next question to get the next question",
        variant: "default",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "An error occured while starting attempt",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsPausingResumingAttempt(false);
    }
  };

  const finishTestAttempt = async () => {
    try {
      setIsFinishingAttempt(true);
      const testId = searchParams.get("testId");
      const mode = searchParams.get("mode");
      const suiteId = pathname.split("/")[pathname.split("/").length - 3];
      const attemptId = pathname.split("/").pop();

      await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/finish-attempt?mode=${mode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      toast({
        title: "Finished test attempt",
        description:
          "You have successfully completed the test attempt, we are routing you to the statistics page",
        variant: "default",
      });

      router.push(`${attemptId}/stats?mode=${mode}&testId=${testId}`);
    } catch (error) {
      toast({
        title: "An error occured while finishing attempt",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsFinishingAttempt(false);
    }
  };

  const selectPreviousQuestion = (index: number) => {
    if (answeredQuestionList?.length) {
      const question = answeredQuestionList[index];
      setCurrentQuestion(question);

      // Initialize cached answers based on question type
      switch (question.type) {
        case "multiple_choice":
          setCachedAnswers((prev) => ({
            ...prev,
            multipleChoice: question.answer?.[0] || "",
          }));
          break;
        case "multiple_select":
          const answers =
            typeof question.answer[0] === "string" &&
            question.answer[0].includes(",")
              ? question.answer[0].split(",")
              : question.answer;
          setCachedAnswers((prev) => ({
            ...prev,
            multipleSelect: answers,
          }));
          break;
        case "short_answer":
          setCachedAnswers((prev) => ({
            ...prev,
            shortAnswer: question.answer?.[0] || "",
          }));
          break;
        case "true/false":
          setCachedAnswers((prev) => ({
            ...prev,
            trueOrFalse: question.answer?.[0] || "",
          }));
          break;
        default:
          // Reset all cached answers for other question types
          setCachedAnswers({
            multipleSelect: [],
            shortAnswer: "",
            trueOrFalse: "",
            multipleChoice: "",
          });
      }
    }
  };

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

  // Test monitor
  const addEvent = (eventMessage: string) => {
    const now = Date.now();
    if (now - lastEventTime < 100) {
      return;
    }
    const timeStamp = new Date().toLocaleTimeString();
    setEvents((prev) => [...prev, `${timeStamp}: ${eventMessage}`]);
    setLastEventTime(now);
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent("Tab switched");
        setWarningCount((prev) => prev + 1);
        setIsActive(false);
      } else {
        addEvent("Returned to test");
        setIsActive(true);
      }
    };

    const handleFocus = () => {
      if (!document.hidden) {
        addEvent("Window focused");
        setIsActive(true);
      }
    };

    const handleBlur = () => {
      if (!document.hidden) {
        addEvent("Window minimized");
        setWarningCount((prev) => prev + 1);
        setIsActive(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    if (warningCount > 3) {
      setShowWarningModal(true);
    }

    if (warningCount >= 9) {
      finishTestAttempt();
    }
  }, [warningCount]);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    const listOfQuestions = [];
    for (let i = 0; i < Number(searchParams.get("totalQuestions")); i++) {
      listOfQuestions.push(i + 1);
    }
    setQuestionList(listOfQuestions);

    getAllAttemptedQuestions();

    // Test time update
    const socket = initializeSocket();
    socket.on("testTimeUpdate", (data) => {
      setTimeRemaining(data.time_remaining);
      const state = data.status === 1 ? "active" : "paused";
      setAttemptState(state);
      if (Number(data.time_remaining) <= 0) {
        router.push(`${attemptId}/stats?mode=${mode}&testId=${testId}`);
      }
    });
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    if (preview) {
      getAllAttemptedQuestions();
    }
  }, [preview]);

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    if (progressInfo.total_attempted < progressInfo.total_questions) {
      getRandomQuestion();
    }
  }, [progressInfo]);

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    if (attemptState === "paused") {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timeRemaining, attemptState]);

  return (
    <div className="h-full overflow-hidden">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 text-gray-100">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-semibold">
            CodeSpartans
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold">Connection status</span>
          {isSocketConnected ? (
            <span className="rounded-xl bg-green-950 px-2 py-1 text-xs font-bold text-green-100">
              Connected
            </span>
          ) : (
            <span className="rounded-xl bg-red-950 px-2 py-1 text-xs font-bold text-red-100">
              Disconnected
            </span>
          )}
        </div>
      </div>

      <Card className="mx-auto mt-4 flex max-w-screen-xl items-center justify-between border px-4 py-3">
        <div className="flex w-[5%] items-center justify-between">
          <span className="italic">{progressInfo.total_attempted}</span>{" "}
          <span className="rounded-sm bg-gray-200 px-1">/</span>{" "}
          <span className="font-bold">{progressInfo.total_questions}</span>
        </div>
        <div className="h-5 w-[75%] bg-gray-200">
          <div
            className={cn(`h-full bg-gray-900`)}
            style={{
              width: `${progressInfo.completed}%`,
            }}
          ></div>
        </div>
        <div className="flex items-center gap-3">
          {mode === "proctored" && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">{formatTime(timeRemaining)}</span>
            </div>
          )}
          {mode === "proctored" &&
            (attemptState === "active" ? (
              <Dialog
                open={isOpen && attemptState === "active"}
                onOpenChange={setIsOpen}
              >
                <DialogTrigger asChild>
                  <button className="flex items-center">
                    <Pause className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Pause Test Attempt</DialogTitle>
                    <DialogDescription>
                      Do you want to pause the test attempt?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" onClick={pauseTestAttempt}>
                      Pause Attempt{" "}
                      {isPausingResumingAttempt && (
                        <LoaderCircle className="ml-2 h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ) : (
              <Dialog
                open={isOpen && attemptState === "paused"}
                onOpenChange={setIsOpen}
              >
                <DialogTrigger asChild>
                  <button className="flex items-center">
                    <Play className="h-4 w-4" />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Resume Test Attempt</DialogTitle>
                    <DialogDescription>
                      Do you want to resume the test attempt?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button type="submit" onClick={resumeTestAttempt}>
                      Resume Attempt{" "}
                      {isPausingResumingAttempt && (
                        <LoaderCircle className="ml-2 h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            ))}

          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm underline">Finish test</button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="font-semibold">
                  Finish Test Attempt
                </DialogTitle>
                <DialogDescription className="text-sm font-medium">
                  {answeredQuestionList?.length !== questionList.length ||
                  answeredQuestionList?.filter((q) => q.answer[0] === "")
                    .length ? (
                    <>
                      You have{" "}
                      <strong style={{ color: "red" }}>
                        {" "}
                        unanswered questions
                      </strong>
                      , If you&apos;re unsure of an answer take a wild guess,
                      you may be right
                      <span className="ml-1 text-lg">🤷</span>
                    </>
                  ) : (
                    <>
                      {" "}
                      <span className="text-green-400">Good Job </span>, Best of
                      luck!!
                      <span className="ml-1 text-lg"> 😉</span>
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" onClick={finishTestAttempt}>
                  Finish Attempt{" "}
                  {isFinishingAttempt && (
                    <LoaderCircle className="ml-2 h-5 w-5 animate-spin text-gray-400" />
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          {mode === "proctored" && warningCount > 0 && (
            <div className="font-medium text-red-600">{warningCount}</div>
          )}
          {mode === "proctored" && (
            <AlertDialog
              open={showWarningModal}
              onOpenChange={setShowWarningModal}
            >
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                    WARNING: Tab Switch Detected!
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-base">
                    <p className="mb-2">
                      You have switched tabs {warningCount} times.
                    </p>
                    <p className="font-semibold text-red-600">
                      {warningCount >= 7
                        ? "This is your FINAL WARNING. Your next tab switch will result in automatic test submission."
                        : "Further tab switches may result in test disqualification."}
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogAction
                    onClick={() => setShowWarningModal(false)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    I Understand
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </Card>
      {mode === "proctored" && !preview && (
        <div className="mx-auto grid h-full max-w-screen-xl grid-cols-1 gap-6 p-6 md:grid-cols-4">
          {/* Question Navigation Sidebar */}
          <Card className="col-span-1 hidden h-fit border px-6 py-4 md:block">
            <div className="grid grid-cols-4 gap-3">
              {questionList.map((questionNumber, ind) => (
                <button
                  disabled={progressInfo.total_attempted < ind + 1}
                  key={questionNumber}
                  className={cn(
                    "flex h-12 w-full items-center justify-center rounded-lg border font-medium transition-colors",
                    progressInfo.total_attempted >= ind + 1 &&
                      answeredQuestionList?.length && {
                        "bg-red-500 text-white hover:bg-red-600":
                          answeredQuestionList[ind].is_flagged,
                        "bg-gray-700 text-white hover:bg-gray-900":
                          answeredQuestionList[ind].answer[0] !== "" &&
                          !answeredQuestionList[ind].is_flagged,
                        "bg-white text-black":
                          answeredQuestionList[ind].answer[0] === "",
                      },
                    ind + 1 === currentSelectedNumber && "ring-2 ring-offset-1",
                  )}
                  onClick={() => navigateToQuestion(ind)}
                >
                  {questionNumber}
                </button>
              ))}
            </div>
          </Card>

          {/* Question Content */}
          <Card className="col-span-1 min-h-[600px] border px-8 py-6 md:col-span-3">
            <div className="flex flex-col gap-8">
              {/* Question Header */}
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="text-2xl font-bold">
                    Question {currentSelectedNumber}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFlaggedQuestion}
                  >
                    <Flag
                      className="h-5 w-5"
                      style={{
                        color: currentQuestion.is_flagged
                          ? "rgb(239 68 68)"
                          : "rgb(107 114 128)",
                      }}
                    />
                  </Button>
                </div>

                {/* Question Description */}
                {!hasErrorLoadingQuestion ? (
                  <div className="prose max-w-none">
                    <ReactMarkdown
                      className="markdown-content"
                      remarkPlugins={[remarkGfm]}
                    >
                      {currentQuestion?.description || ""}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="bg-red-500 px-3 py-2 text-sm text-red-50">
                    An error occurred while loading your question, please reload
                    your page
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="flex-grow">
                {/* Multiple Choice */}
                {currentQuestion.type === "multiple_choice" && (
                  <RadioGroup
                    value={
                      cachedAnswers.multipleChoice ||
                      currentQuestion?.answer?.[0] ||
                      ""
                    }
                    onValueChange={(value) => {
                      const option = value.split(
                        `${currentQuestion.question_number}-`,
                      )[1];
                      setCachedAnswers((prev) => ({
                        ...prev,
                        multipleChoice: option,
                      }));
                    }}
                    className="space-y-4"
                  >
                    {currentQuestion?.multiple_choice_options.map((option) => (
                      <div
                        key={`${currentQuestion.question_number}-${option}`}
                        className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={`${currentQuestion.question_number}-${option}`}
                          id={`${currentQuestion.question_number}-${option}`}
                          checked={
                            option ===
                            (cachedAnswers.multipleChoice ||
                              currentQuestion?.answer?.[0])
                          }
                          aria-checked={
                            option ===
                            (cachedAnswers.multipleChoice ||
                              currentQuestion?.answer?.[0])
                          }
                        />
                        <Label
                          htmlFor={`${currentQuestion.question_number}-${option}`}
                          className="flex-grow text-lg"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Multiple Select */}
                {currentQuestion.type === "multiple_select" && (
                  <div className="space-y-4">
                    {currentQuestion?.multiple_choice_options.map((option) => {
                      const isSelected =
                        cachedAnswers.multipleSelect.includes(option);
                      return (
                        <div
                          key={`${currentQuestion.question_number}-${option}`}
                          className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                        >
                          <Checkbox
                            id={`${currentQuestion.question_number}-${option}`}
                            checked={isSelected}
                            disabled={isSubmittingAnswer}
                            onCheckedChange={(checked) => {
                              let newAnswers;
                              if (checked) {
                                newAnswers = [
                                  ...cachedAnswers.multipleSelect,
                                  option,
                                ];
                              } else {
                                newAnswers =
                                  cachedAnswers.multipleSelect.filter(
                                    (a) => a !== option,
                                  );
                              }
                              setCachedAnswers((prev) => ({
                                ...prev,
                                multipleSelect: newAnswers,
                              }));
                            }}
                          />
                          <Label
                            htmlFor={`${currentQuestion.question_number}-${option}`}
                            className="flex-grow text-lg"
                          >
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer */}
                {currentQuestion.type === "short_answer" && (
                  <div className="space-y-4">
                    <Input
                      type="text"
                      value={
                        cachedAnswers.shortAnswer ||
                        currentQuestion?.answer?.[0] ||
                        ""
                      }
                      disabled={isSubmittingAnswer}
                      onChange={(e) => {
                        setCachedAnswers((prev) => ({
                          ...prev,
                          shortAnswer: e.target.value,
                        }));
                      }}
                      placeholder="Type your answer here..."
                      className="w-full p-4 text-lg"
                    />
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.type === "true/false" && (
                  <RadioGroup
                    value={
                      cachedAnswers.trueOrFalse ||
                      currentQuestion?.answer?.[0] ||
                      ""
                    }
                    onValueChange={(value) => {
                      setCachedAnswers((prev) => ({
                        ...prev,
                        trueOrFalse: value,
                      }));
                    }}
                    className="space-y-4"
                  >
                    {["True", "False"].map((option) => (
                      <div
                        key={`${currentQuestion.question_number}-${option}`}
                        className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`${currentQuestion.question_number}-${option}`}
                          checked={
                            option ===
                            (cachedAnswers.trueOrFalse ||
                              currentQuestion?.answer?.[0])
                          }
                        />
                        <Label
                          htmlFor={`${currentQuestion.question_number}-${option}`}
                          className="flex-grow text-lg"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t pt-6">
                <div className="flex items-center gap-4">
                  {currentSelectedNumber > 1 && (
                    <Button
                      variant="outline"
                      onClick={() =>
                        navigateToQuestion(currentSelectedNumber - 2)
                      }
                      disabled={isSubmittingAnswer}
                      className="flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous Question
                    </Button>
                  )}
                  {isSubmittingAnswer && (
                    <span className="text-sm text-gray-500">Saving...</span>
                  )}
                </div>

                <Button
                  variant="default"
                  onClick={async () => {
                    if (
                      currentSelectedNumber === progressInfo.total_questions
                    ) {
                      // Handle submission logic for different question types
                      let pendingAnswer = "";

                      switch (currentQuestion.type) {
                        case "multiple_select":
                          pendingAnswer =
                            cachedAnswers.multipleSelect.length > 0
                              ? cachedAnswers.multipleSelect.join(",")
                              : "";
                          break;
                        case "short_answer":
                          pendingAnswer = cachedAnswers.shortAnswer.trim();
                          break;
                        case "true/false":
                          pendingAnswer = cachedAnswers.trueOrFalse;
                          break;
                        case "multiple_choice":
                          pendingAnswer = currentQuestion?.answer?.[0] || "";
                          break;
                      }

                      await submitAnswer({
                        questionNumber: currentQuestion.question_number,
                        answer: pendingAnswer,
                        isFlagged: currentQuestion.is_flagged,
                      });

                      setPreview(true);
                    } else {
                      handleNextQuestion();
                    }
                  }}
                  disabled={isSubmittingAnswer || isLoadingNextQuestion}
                  className="flex items-center gap-2"
                >
                  {currentSelectedNumber === progressInfo.total_questions
                    ? "Preview & Submit"
                    : "Next Question"}
                  {isLoadingNextQuestion ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {mode === "learning" && !preview && (
        <div className="mx-auto grid h-full max-w-screen-xl grid-cols-1 gap-6 p-6 md:grid-cols-4">
          {/* Question Navigation Sidebar */}
          <Card className="col-span-1 hidden h-fit border px-6 py-4 md:block">
            <div className="grid grid-cols-4 gap-3">
              {questionList.map((questionNumber, ind) => (
                <button
                  disabled={progressInfo.total_attempted < ind + 1}
                  key={questionNumber}
                  className={cn(
                    "flex h-12 w-full items-center justify-center rounded-lg border font-medium transition-colors",
                    progressInfo.total_attempted >= ind + 1 &&
                      answeredQuestionList?.length && {
                        "bg-red-500 text-white hover:bg-red-600":
                          answeredQuestionList[ind].is_flagged,
                        "bg-gray-700 text-white hover:bg-gray-900":
                          answeredQuestionList[ind].answer[0] !== "" &&
                          !answeredQuestionList[ind].is_flagged,
                        "bg-white text-black":
                          answeredQuestionList[ind].answer[0] === "",
                      },
                    ind + 1 === currentSelectedNumber && "ring-2 ring-offset-1",
                  )}
                  onClick={() => navigateToQuestion(ind)}
                >
                  {questionNumber}
                </button>
              ))}
            </div>
          </Card>

          {/* Question Content */}
          <Card className="col-span-1 min-h-[600px] border px-8 py-6 md:col-span-3">
            <div className="flex flex-col gap-8">
              {/* Question Header */}
              <div className="relative flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="text-2xl font-bold">
                    Question {currentSelectedNumber}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleFlaggedQuestion}
                  >
                    <Flag
                      className="h-5 w-5"
                      style={{
                        color: currentQuestion.is_flagged
                          ? "rgb(239 68 68)"
                          : "rgb(107 114 128)",
                      }}
                    />
                  </Button>
                </div>

                {/* Question Description */}
                {!hasErrorLoadingQuestion ? (
                  <div className="prose max-w-none">
                    <ReactMarkdown
                      className="markdown-content"
                      remarkPlugins={[remarkGfm]}
                    >
                      {currentQuestion?.description || ""}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="bg-red-500 px-3 py-2 text-sm text-red-50">
                    An error occurred while loading your question, please reload
                    your page
                  </div>
                )}
              </div>

              {/* Answer Options */}
              <div className="flex-grow">
                {/* Multiple Choice */}
                {currentQuestion.type === "multiple_choice" && (
                  <RadioGroup
                    value={`${currentQuestion?.question_number}-${currentQuestion?.answer?.[0] || ""}`}
                    onValueChange={(value) => {
                      const option = value.slice(
                        `${currentQuestion?.question_number}`.length + 1,
                      );
                      submitAnswer({
                        questionNumber: currentQuestion?.question_number || 0,
                        answer: option,
                        isFlagged: currentQuestion.is_flagged,
                      });
                    }}
                    className="space-y-4"
                  >
                    {currentQuestion?.multiple_choice_options.map((option) => (
                      <div
                        key={`${currentQuestion.question_number}-${option}`}
                        className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={`${currentQuestion.question_number}-${option}`}
                          id={`${currentQuestion.question_number}-${option}`}
                          checked={option === currentQuestion?.answer?.[0]}
                        />
                        <Label
                          htmlFor={`${currentQuestion.question_number}-${option}`}
                          className="flex-grow text-lg"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {/* Multiple Select */}
                {currentQuestion.type === "multiple_select" && (
                  <div className="space-y-4">
                    {currentQuestion?.multiple_choice_options.map((option) => {
                      const isSelected =
                        cachedAnswers.multipleSelect.includes(option);
                      return (
                        <div
                          key={`${currentQuestion.question_number}-${option}`}
                          className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                        >
                          <Checkbox
                            id={`${currentQuestion.question_number}-${option}`}
                            checked={isSelected}
                            disabled={isSubmittingAnswer}
                            onCheckedChange={(checked) => {
                              let newAnswers;
                              if (checked) {
                                newAnswers = [
                                  ...cachedAnswers.multipleSelect,
                                  option,
                                ];
                              } else {
                                newAnswers =
                                  cachedAnswers.multipleSelect.filter(
                                    (a) => a !== option,
                                  );
                              }
                              setCachedAnswers((prev) => ({
                                ...prev,
                                multipleSelect: newAnswers,
                              }));
                            }}
                          />
                          <Label
                            htmlFor={`${currentQuestion.question_number}-${option}`}
                            className="flex-grow text-lg"
                          >
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Short Answer */}
                {currentQuestion.type === "short_answer" && (
                  <div className="space-y-4">
                    <Input
                      type="text"
                      value={
                        cachedAnswers.shortAnswer ||
                        currentQuestion?.answer?.[0] ||
                        ""
                      }
                      disabled={isSubmittingAnswer}
                      onChange={(e) => {
                        setCachedAnswers((prev) => ({
                          ...prev,
                          shortAnswer: e.target.value,
                        }));
                      }}
                      placeholder="Type your answer here..."
                      className="w-full p-4 text-lg"
                    />
                  </div>
                )}

                {/* True/False */}
                {currentQuestion.type === "true/false" && (
                  <RadioGroup
                    value={
                      cachedAnswers.trueOrFalse ||
                      currentQuestion?.answer?.[0] ||
                      ""
                    }
                    onValueChange={(value) => {
                      setCachedAnswers((prev) => ({
                        ...prev,
                        trueOrFalse: value,
                      }));
                    }}
                    className="space-y-4"
                  >
                    {["True", "False"].map((option) => (
                      <div
                        key={`${currentQuestion.question_number}-${option}`}
                        className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                      >
                        <RadioGroupItem
                          value={option}
                          id={`${currentQuestion.question_number}-${option}`}
                          checked={
                            option ===
                            (cachedAnswers.trueOrFalse ||
                              currentQuestion?.answer?.[0])
                          }
                        />
                        <Label
                          htmlFor={`${currentQuestion.question_number}-${option}`}
                          className="flex-grow text-lg"
                        >
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {showAnswer && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <h3 className="mb-2 font-semibold">
                    Correct Answer: {currentQuestion?.correct_answer?.[0]}
                  </h3>
                  <h4 className="text-base font-medium">Hints: </h4>
                  <div className="text-sm text-gray-600">
                    {currentQuestion?.hints?.map((hint, index) => (
                      <p key={index}> {hint} </p>
                    ))}
                  </div>
                  {currentQuestion.answer[0] ===
                  currentQuestion.correct_answer?.[0] ? (
                    <div className="mt-2 text-green-600">
                      ✓ Your answer is correct!
                    </div>
                  ) : (
                    <div className="mt-2 text-red-600">
                      × You selected: {currentQuestion.answer[0]}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Previous button */}
                {currentSelectedNumber > 1 && (
                  <button
                    disabled={isSubmittingAnswer}
                    className={cn(
                      "flex items-center gap-2 rounded-sm border px-2 py-1 hover:bg-gray-100",
                      isSubmittingAnswer &&
                        "border-gray-100 text-gray-400 hover:bg-gray-50",
                    )}
                    onClick={() =>
                      navigateToQuestion(currentSelectedNumber - 2)
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous question</span>
                  </button>
                )}
                <div>
                  <span className="text-xs">
                    {isSubmittingAnswer && "Saving..."}
                  </span>

                  {!showAnswer ? (
                    <button
                      disabled={
                        isSubmittingAnswer || !currentQuestion?.answer?.[0]
                      }
                      className={cn(
                        "flex items-center gap-2 rounded-sm border px-2 py-1 hover:bg-gray-100",
                        (isSubmittingAnswer || !currentQuestion?.answer?.[0]) &&
                          "border-gray-100 text-gray-400 hover:bg-gray-50",
                      )}
                      onClick={handleShowAnswer}
                    >
                      <span>
                        {!currentQuestion?.answer?.[0]
                          ? " Select  answer "
                          : "Show Answer"}
                      </span>
                    </button>
                  ) : (
                    <button
                      disabled={isSubmittingAnswer || isLoadingNextQuestion}
                      className={cn(
                        "flex items-center gap-2 rounded-sm border px-2 py-1 hover:bg-gray-100",
                        (isSubmittingAnswer || isLoadingNextQuestion) &&
                          "border-gray-100 text-gray-400 hover:bg-gray-50",
                      )}
                      onClick={async () => {
                        if (
                          currentSelectedNumber === progressInfo.total_questions
                        ) {
                          if (!currentQuestion.answer?.[0]) {
                            await submitAnswer({
                              questionNumber: currentQuestion.question_number,
                              answer: "",
                              isFlagged: currentQuestion.is_flagged,
                            });
                          }
                          finishTestAttempt();
                        } else {
                          handleNextQuestion();
                        }
                      }}
                    >
                      <span>
                        {currentSelectedNumber === progressInfo.total_questions
                          ? "Submit"
                          : "Next question"}
                      </span>
                      {!isLoadingNextQuestion ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <LoaderCircle className="h-5 w-5 animate-spin text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {mode === "proctored" && preview && (
        <div className="mx-auto mt-4 flex h-full max-w-screen-xl flex-col gap-4">
          <Card className="mb-6 rounded-lg bg-white p-6 shadow-lg">
            <div className="grid grid-cols-1 gap-6">
              {answeredQuestionList?.map((question, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 p-4 shadow-md"
                >
                  <div className="flex justify-between">
                    <div className="mb-2 text-lg font-bold text-gray-800">
                      Question {index + 1}
                    </div>
                    <div className="flex justify-center space-x-4">
                      {question.is_flagged && (
                        <div className="font-semibold text-red-600">
                          <span role="img" aria-label="flag" className="mr-2">
                            🚩
                          </span>
                        </div>
                      )}
                      <button
                        className="text-sm text-blue-500 underline hover:text-blue-700"
                        onClick={() => {
                          setPreview(false);
                          selectPreviousQuestion(index);
                          setCurrentSelectedNumber(index + 1);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                  {/* Question Description */}
                  <div className="mb-4 text-gray-600">
                    <ReactMarkdown
                      className="markdown-content"
                      remarkPlugins={[remarkGfm]}
                    >
                      {question.description || ""}
                    </ReactMarkdown>
                  </div>
                  {/* Answer Section */}
                  <div>
                    <ul className="space-y-2">
                      {question.multiple_choice_options.map(
                        (option, optionIndex) => (
                          <li
                            key={optionIndex}
                            className={`rounded-lg p-2 ${
                              Array.isArray(question.answer)
                                ? question.answer.includes(option)
                                  ? "border border-green-500 bg-green-100 text-green-800"
                                  : "border border-gray-300 bg-white text-gray-600"
                                : question.answer === option
                                  ? "border border-green-500 bg-green-100 text-green-800"
                                  : "border border-gray-300 bg-white text-gray-600"
                            }`}
                          >
                            {option}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
