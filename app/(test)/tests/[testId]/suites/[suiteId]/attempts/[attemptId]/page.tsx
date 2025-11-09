"use client";
import axios from "axios";
// Icons
import {
  ChevronRight,
  ChevronsLeft,
  Clock,
  Flag,
  LoaderCircle,
  Pause,
  Play,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { io } from "socket.io-client";
// Types
import {
  AllAttemptedQuestionsInterface,
  AllAttemptedQuestionsResponseInterface,
  CurrentQuestionInterface,
  NextQuestionResponseInterface,
  ProgressInfoInterface,
  SubmitAnswerInterface,
} from "@/app/types/active-attempt";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
// Components
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
import { useFinishAttemptBannerUpdate } from "@/hooks/use-action-store";
// Utils
import { cn, formatTime } from "@/lib/utils";

export default function LiveAttemptPage() {
  // internal hooks states
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // states
  const router = useRouter();
  const testId = searchParams.get("testId");
  const mode = searchParams.get("mode");
  const totalQuestions = Number(searchParams.get("totalQuestions"));
  const suiteId = pathname.split("/")[pathname.split("/").length - 3];
  const attemptId = pathname.split("/").pop();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_SIMULATION;
  const [questionList, setQuestionList] = useState<Array<number>>([]);
  const [allAttemptedQuestions, setAllAttemptedQuestions] = useState<
    Array<AllAttemptedQuestionsInterface>
  >([
    {
      question_number: 0,
      description: "",
      multiple_choice_options: [],
      time: 0,
      hints: [],
      type: "multiple_choice",
      is_flagged: false,
      answer: [],
    },
  ]);
  const [currentQuestion, setCurrentQuestion] =
    useState<CurrentQuestionInterface>({
      question_number: 0,
      description: "",
      multiple_choice_options: [],
      time: 0,
      hints: [],
      type: "multiple_choice",
      is_flagged: false,
    });
  const [progressInfo, setProgressInfo] = useState<ProgressInfoInterface>({
    completed: 0,
    total_attempted: 0,
    total_questions: 0,
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPausingResumingAttempt, setIsPausingResumingAttempt] =
    useState(false);
  const [isFinishingAttempt, setIsFinishingAttempt] = useState(false);
  const [hasErrorLoadingQuestion, setHasErrorLoadingQuestion] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);
  const [preview, setPreview] = useState(false);
  const hasQuestionBeenFetched = useRef(false);
  const { setUserFinished } = useFinishAttemptBannerUpdate();

  // actions
  const initializeSocket = useCallback(() => {
    const socket = io("http://3.73.36.150:3002", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
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
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return socket;
  }, [testId]);

  // Responsible for fetching the next question
  const getRandomQuestion = async () => {
    try {
      const response: NextQuestionResponseInterface = await axios.get(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/next-question?mode=${mode}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setCurrentQuestion(response.data);

      await submitAnswer({
        questionNumber: response.data?.question_number || 0,
        answer: "",
        isFlagged: false,
        fetchTime: response.data?.fetch_time,
      });
    } catch (error) {
      console.log(error);
      setHasErrorLoadingQuestion(true);

      setErrorMessage(
        // @ts-expect-error known error
        error?.response?.data?.message || "An unknown error occurred",
      );
    }
  };

  const flagQuestion = () => {
    setCurrentQuestion({
      ...currentQuestion,
      is_flagged: !currentQuestion?.is_flagged,
    });
  };

  // Responsible for only submitting the answer to the current question
  const submitAnswer = async ({
    questionNumber,
    answer,
    isFlagged,
    fetchTime,
  }: {
    questionNumber: number;
    answer: string;
    isFlagged: boolean;
    fetchTime?: number;
  }) => {
    try {
      setIsSubmittingAnswer(true);
      const response: SubmitAnswerInterface = await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/questions/${questionNumber}/submit-answer?mode=${mode}`,
        {
          answer: [answer],
          fetchTime: fetchTime || currentQuestion?.fetch_time,
          isFlagged,
        },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setAllAttemptedQuestions(response.data.answers.map((answer) => answer));
    } catch (error) {
      console.log(error);
    } finally {
      setIsSubmittingAnswer(false);
    }
  };

  // Responsible for fetching all attempted questions
  const getAllAttemptedQuestions = async () => {
    try {
      const response: AllAttemptedQuestionsResponseInterface = await axios.get(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/questions?mode=${mode}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setAllAttemptedQuestions(
        response.data.answered_questions.map((answer) => ({
          ...answer,
          ...answer.question,
        })),
      );
    } catch (error) {
      console.log(error);
    }
  };

  const finishAttempt = async () => {
    try {
      setIsFinishingAttempt(true);

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
      setUserFinished(true);

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

  const pauseAttempt = async () => {
    try {
      setIsPausingResumingAttempt(true);
      await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/pause-attempt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setIsPaused(true);
      setIsOpen(false);

      toast({
        title: "Successfully paused test attempt",
        description:
          "You have successfully paused this test, you can resume it anytime you are ready",
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

  const resumeAttempt = async () => {
    try {
      setIsPausingResumingAttempt(true);
      await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/resume-attempt`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setIsPaused(false);
      setIsOpen(false);
      getAllAttemptedQuestions();
      setHasErrorLoadingQuestion(false);

      toast({
        title: "Successfully resumed test attempt",
        description:
          "You have successfully resumed this attempt, click next question to get the next question",
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

  const updateCurrentQuestion = async (questionIndex: number) => {
    const question = allAttemptedQuestions[questionIndex];

    if (question) {
      setCurrentQuestion(question);
    }
  };

  // const handleNextQuestionProctored = () => {
  //   submitAnswer({
  //     questionNumber: currentQuestion?.question_number || 0,
  //     answer: currentQuestion?.answer ? currentQuestion?.answer[0] : "",
  //     isFlagged: currentQuestion?.is_flagged || false,
  //   });
  //   if (
  //     allAttemptedQuestions.findIndex(
  //       (question) =>
  //         question.question_number === currentQuestion.question_number,
  //     ) ===
  //     totalQuestions - 1
  //   ) {
  //     setPreview(true);
  //   }
  // };

  const handleNextQuestionProctored = async () => {
    // Find current index
    const currentIndex = allAttemptedQuestions.findIndex(
      (question) =>
        question.question_number === currentQuestion.question_number,
    );

    // Submit the current answer
    await submitAnswer({
      questionNumber: currentQuestion?.question_number || 0,
      answer: currentQuestion?.answer ? currentQuestion?.answer.join(", ") : "",
      isFlagged: currentQuestion?.is_flagged || false,
    });

    // Check if this is the last question
    if (currentIndex === totalQuestions - 1) {
      setPreview(true);
      return;
    }

    // Check if the next question exists in allAttemptedQuestions
    if (
      currentIndex !== -1 &&
      currentIndex + 1 < allAttemptedQuestions.length
    ) {
      // Navigate to the next existing question
      updateCurrentQuestion(currentIndex + 1);
    } else {
      // If there's no next question, explicitly get a new random question
      getRandomQuestion();
    }
  };

  // const handleNextQuestionLearning = () => {
  //   submitAnswer({
  //     questionNumber: currentQuestion?.question_number || 0,
  //     answer: currentQuestion?.answer ? currentQuestion?.answer[0] : "",
  //     isFlagged: currentQuestion?.is_flagged || false,
  //   });

  //   const currentIndex = allAttemptedQuestions.findIndex(
  //     (question) =>
  //       question.question_number === currentQuestion.question_number,
  //   );

  //   const isLastQuestion = currentIndex === totalQuestions - 1;

  //   if (isLastQuestion) {
  //     finishAttempt();
  //   } else {
  //     getRandomQuestion();
  //   }
  // };

  const handleNextQuestionLearning = async () => {
    // Find current index
    const currentIndex = allAttemptedQuestions.findIndex(
      (question) =>
        question.question_number === currentQuestion.question_number,
    );

    // Submit the current answer
    await submitAnswer({
      questionNumber: currentQuestion?.question_number || 0,
      answer: currentQuestion?.answer ? currentQuestion?.answer[0] : "",
      isFlagged: currentQuestion?.is_flagged || false,
    });

    // Check if this is the last question
    if (currentIndex === totalQuestions - 1) {
      finishAttempt();
      return;
    }

    // Check if the next question exists in allAttemptedQuestions
    if (
      currentIndex !== -1 &&
      currentIndex + 1 < allAttemptedQuestions.length
    ) {
      // Navigate to the next existing question
      updateCurrentQuestion(currentIndex + 1);
    } else {
      // If there's no next question, get a new random question
      getRandomQuestion();
    }
  };

  // side effects
  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }

    // list of questions for the test
    const listOfQuestions = [];
    for (let i = 0; i < totalQuestions; i++) {
      listOfQuestions.push(i + 1);
    }
    setQuestionList(listOfQuestions);

    // Fetch questions
    getAllAttemptedQuestions();

    // Test time update
    const socket = initializeSocket();
    socket.on("testTimeUpdate", (data) => {
      setTimeRemaining(data.time_remaining);
      const state = data.status === 1 ? "active" : "paused";
      setIsPaused(state === "paused");
      if (Number(data.time_remaining) <= 0) {
        router.push(`${attemptId}/stats?mode=${mode}&testId=${testId}`);
      }
    });
  }, []);

  // useEffect(() => {
  //   if (mode === "proctored" && allAttemptedQuestions.length < totalQuestions) {
  //     getRandomQuestion();
  //   } else if (allAttemptedQuestions.length === totalQuestions) {
  //     setCurrentQuestion(allAttemptedQuestions[totalQuestions - 1]);
  //     setHasErrorLoadingQuestion(false);
  //   }
  // }, [mode === "proctored" ? allAttemptedQuestions : null]);

  useEffect(() => {
    if (allAttemptedQuestions.length === totalQuestions) {
      setCurrentQuestion(allAttemptedQuestions[totalQuestions - 1]);
      setHasErrorLoadingQuestion(false);
    }
  }, [allAttemptedQuestions.length, totalQuestions]);

  // useEffect(() => {
  //   // Initial question loading for proctored mode
  //   if (
  //     mode === "proctored" &&
  //     allAttemptedQuestions.length === 1 &&
  //     !allAttemptedQuestions[0].question_number &&
  //     currentQuestion.question_number === 0
  //   ) {
  //     getRandomQuestion();
  //   }
  // }, [mode, allAttemptedQuestions]);

  useEffect(() => {
    // Initial question loading for proctored mode
    if (
      mode === "proctored" &&
      !hasQuestionBeenFetched.current && // <-- Add this condition
      allAttemptedQuestions.length === 1 &&
      !allAttemptedQuestions[0].question_number &&
      currentQuestion.question_number === 0
    ) {
      hasQuestionBeenFetched.current = true; // Set the flag before fetching
      getRandomQuestion();
    }
  }, [mode, allAttemptedQuestions]);

  useEffect(() => {
    if (
      mode === "learning" &&
      !hasQuestionBeenFetched.current &&
      allAttemptedQuestions.length > 0 &&
      !currentQuestion.answer
    ) {
      hasQuestionBeenFetched.current = true;

      if (allAttemptedQuestions[0].question_number) {
        setCurrentQuestion(allAttemptedQuestions[0]);
      } else {
        getRandomQuestion();
      }
    }
  }, [mode, allAttemptedQuestions.length]);

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

    if (isPaused) {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [timeRemaining, isPaused]);

  useEffect(() => {
    setProgressInfo({
      completed: (allAttemptedQuestions.length / totalQuestions) * 100,
      total_attempted: allAttemptedQuestions.length,
      total_questions: totalQuestions,
    });
  }, [allAttemptedQuestions, totalQuestions]);

  return (
    <div className="h-full overflow-hidden">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 text-gray-100">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-semibold text-purple-600">
            ExamSim
          </Link>
        </div>
      </div>
      <>
        <Card className="mx-auto mt-4 flex max-w-screen-xl items-center justify-between border px-4 py-3">
          <div className="flex w-[5%] items-center justify-between">
            <span className="italic">{progressInfo?.total_attempted}</span>{" "}
            <span className="rounded-sm bg-gray-200 px-1">/</span>{" "}
            <span className="font-bold">{progressInfo?.total_questions}</span>
          </div>
          <div className="h-5 w-[75%] bg-gray-200">
            <div
              className="h-full bg-gray-900"
              style={{
                width: `${progressInfo?.completed}%`,
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            {mode === "proctored" && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatTime(timeRemaining)}</span>
              </div>
            )}
            {mode === "proctored" &&
              (!isPaused ? (
                <Dialog open={isOpen && !isPaused} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="flex items-center">
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
                      <Button type="submit" onClick={pauseAttempt}>
                        Pause Attempt{" "}
                        {isPausingResumingAttempt && (
                          <LoaderCircle className="ml-2 h-5 w-5 animate-spin text-gray-400" />
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={isOpen && isPaused} onOpenChange={setIsOpen}>
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
                      <Button type="submit" onClick={resumeAttempt}>
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
                    {allAttemptedQuestions?.length !== questionList.length ||
                    allAttemptedQuestions?.filter(
                      (q) => (q?.answer?.[0] ?? "") === "",
                    ).length ? (
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
                        <span className="text-green-400">Good Job </span>, Best
                        of luck!!
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
                  <Button type="submit" onClick={finishAttempt}>
                    Finish Attempt{" "}
                    {isFinishingAttempt && (
                      <LoaderCircle className="ml-2 h-5 w-5 animate-spin text-gray-400" />
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </>
      {!preview ? (
        <>
          {mode === "proctored" ? (
            <div className="mx-auto grid h-full max-w-screen-xl grid-cols-1 gap-6 p-6 md:grid-cols-4">
              {/* List of Questions, select between questions, show flagged state, show answered state, show skipped state */}
              <Card className="col-span-1 hidden h-fit border px-6 py-4 md:block">
                <div className="grid grid-cols-4 gap-3">
                  {questionList.map((questionNumber, ind) => (
                    <button
                      type="button"
                      disabled={progressInfo.total_attempted < ind + 1}
                      key={questionNumber}
                      className={cn(
                        "flex h-12 w-full items-center justify-center rounded-lg border font-medium transition-colors",
                        allAttemptedQuestions[ind]?.question_number ===
                          currentQuestion?.question_number && "bg-gray-200",
                        allAttemptedQuestions[ind]?.question_number !==
                          currentQuestion?.question_number &&
                          allAttemptedQuestions[ind]?.is_flagged &&
                          "bg-red-500 text-white hover:bg-red-600",
                        allAttemptedQuestions[ind]?.question_number !==
                          currentQuestion?.question_number &&
                          allAttemptedQuestions[ind]?.answer &&
                          allAttemptedQuestions[ind]?.answer[0] &&
                          !allAttemptedQuestions[ind]?.is_flagged &&
                          "bg-gray-700 text-white hover:bg-gray-900",
                        allAttemptedQuestions[ind]?.question_number !==
                          currentQuestion?.question_number &&
                          allAttemptedQuestions[ind] &&
                          allAttemptedQuestions[ind]?.answer &&
                          !allAttemptedQuestions[ind]?.answer[0] &&
                          !allAttemptedQuestions[ind]?.is_flagged &&
                          "bg-yellow-200",
                      )}
                      onClick={() => updateCurrentQuestion(ind)}
                    >
                      {questionNumber}
                    </button>
                  ))}
                </div>
              </Card>
              {/* Current Question, prev, next, flag */}
              <Card className="col-span-1 min-h-[600px] border px-8 py-6 md:col-span-3">
                <div className="flex flex-col gap-8">
                  {/* Question Header */}
                  <div className="relative flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b pb-4">
                      <div className="text-2xl font-bold">
                        Question{" "}
                        {allAttemptedQuestions.findIndex(
                          (question) =>
                            question.question_number ===
                            currentQuestion.question_number,
                        ) !== -1
                          ? allAttemptedQuestions.findIndex(
                              (question) =>
                                question.question_number ===
                                currentQuestion.question_number,
                            ) + 1
                          : allAttemptedQuestions.length + 1}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={flagQuestion}
                      >
                        <Flag
                          className="h-5 w-5"
                          style={{
                            color: currentQuestion?.is_flagged
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
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  {/* Answer Options */}
                  <div className="flex-grow">
                    {/* Multiple Choice */}
                    {currentQuestion?.type === "multiple_choice" && (
                      <RadioGroup
                        value={currentQuestion?.answer?.[0] || ""}
                        onValueChange={(value) => {
                          const option = value
                            .split(`${currentQuestion.question_number}-`)
                            .slice(1)
                            .join(" ");

                          setCurrentQuestion({
                            ...currentQuestion,
                            answer: [option],
                          });
                        }}
                        className="space-y-4"
                      >
                        {currentQuestion?.multiple_choice_options.map(
                          (option) => (
                            <Label
                              key={`${currentQuestion.question_number}-${option}`}
                              htmlFor={`${currentQuestion.question_number}-${option}`}
                              className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                            >
                              <RadioGroupItem
                                value={`${currentQuestion.question_number}-${option}`}
                                id={`${currentQuestion.question_number}-${option}`}
                                checked={
                                  option === currentQuestion?.answer?.[0]
                                }
                                aria-checked={
                                  option === currentQuestion?.answer?.[0]
                                }
                              />
                              <div className="flex-grow text-lg">{option}</div>
                            </Label>
                          ),
                        )}
                      </RadioGroup>
                    )}

                    {/* Multiple Select */}
                    {currentQuestion.type === "multiple_select" && (
                      <div className="space-y-4">
                        {currentQuestion?.multiple_choice_options.map(
                          (option) => {
                            const isSelected = (
                              currentQuestion?.answer?.[0] ?? ""
                            )
                              .split(/,\s*/)
                              .includes(option);

                            return (
                              <div
                                key={`${currentQuestion.question_number}-${option}`}
                                className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                              >
                                <Checkbox
                                  id={`${currentQuestion.question_number}-${option}`}
                                  checked={isSelected}
                                  disabled={isSubmittingAnswer}
                                  onCheckedChange={(checked: boolean) => {
                                    let answer: Array<string> | undefined = [];
                                    if (checked) {
                                      if (currentQuestion.answer?.[0].length) {
                                        answer = [
                                          currentQuestion?.answer?.[0] +
                                            ", " +
                                            option,
                                        ];
                                      } else {
                                        answer = [option];
                                      }
                                    } else {
                                      if (currentQuestion.answer?.length) {
                                        answer = [
                                          (currentQuestion?.answer?.[0] ?? "")
                                            .split(/,\s*/)
                                            .filter((a) => a !== option)
                                            .join(", "),
                                        ];
                                      } else {
                                        answer = [];
                                      }
                                    }
                                    console.log(answer);
                                    setCurrentQuestion({
                                      ...currentQuestion,
                                      answer,
                                    });
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
                          },
                        )}
                      </div>
                    )}

                    {/* Short Answer */}
                    {currentQuestion.type === "short_answer" && (
                      <div className="space-y-4">
                        <Input
                          type="text"
                          value={currentQuestion?.answer?.[0] || ""}
                          disabled={isSubmittingAnswer}
                          onChange={(e) => {
                            setCurrentQuestion({
                              ...currentQuestion,
                              answer: [e.target.value],
                            });
                          }}
                          placeholder="Type your answer here..."
                          className="w-full p-4 text-lg"
                        />
                      </div>
                    )}

                    {/* True/False */}
                    {currentQuestion.type === "true/false" && (
                      <RadioGroup
                        value={currentQuestion?.answer?.[0] || ""}
                        onValueChange={(value) => {
                          // Update the selected answer in the current question
                          setCurrentQuestion({
                            ...currentQuestion,
                            answer: [value], // Set the selected value as the answer
                          });
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
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between border-t pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4">
                        {allAttemptedQuestions.length > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <Button
                              variant="outline"
                              disabled={isSubmittingAnswer}
                              className="flex items-center gap-2"
                              onClick={() => {
                                const index = allAttemptedQuestions.findIndex(
                                  (question) =>
                                    question.question_number ===
                                    currentQuestion.question_number,
                                );

                                updateCurrentQuestion(
                                  index !== -1
                                    ? index - 1
                                    : allAttemptedQuestions.length - 1,
                                );
                              }}
                            >
                              <ChevronsLeft className="h-4 w-4" />
                              Prev
                            </Button>
                          </div>
                        )}
                        {isSubmittingAnswer && (
                          <span className="text-sm text-gray-500">
                            Saving...
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Button
                        variant="default"
                        disabled={isSubmittingAnswer}
                        className="flex items-center gap-2"
                        onClick={
                          mode === "proctored"
                            ? handleNextQuestionProctored
                            : handleNextQuestionLearning
                        }
                      >
                        {allAttemptedQuestions.findIndex(
                          (question) =>
                            question.question_number ===
                            currentQuestion.question_number,
                        ) ===
                        totalQuestions - 1
                          ? "submit and preview"
                          : "Next question"}
                        {isSubmittingAnswer ? (
                          <LoaderCircle className="h-5 w-5 animate-spin" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            //learning mode type of questions
            <>
              <div className="mx-auto grid h-full max-w-screen-xl grid-cols-1 gap-6 p-6 md:grid-cols-4">
                {/* List of Questions, select between questions, show flagged state, show answered state, show skipped state */}
                <Card className="col-span-1 hidden h-fit border px-6 py-4 md:block">
                  <div className="grid grid-cols-4 gap-3">
                    {questionList.map((questionNumber, ind) => (
                      <button
                        type="button"
                        disabled={progressInfo.total_attempted < ind + 1}
                        key={questionNumber}
                        className={cn(
                          "flex h-12 w-full items-center justify-center rounded-lg border font-medium transition-colors",
                          allAttemptedQuestions[ind]?.question_number ===
                            currentQuestion?.question_number && "bg-gray-200",
                          allAttemptedQuestions[ind]?.question_number !==
                            currentQuestion?.question_number &&
                            allAttemptedQuestions[ind]?.is_flagged &&
                            "bg-red-500 text-white hover:bg-red-600",
                          allAttemptedQuestions[ind]?.question_number !==
                            currentQuestion?.question_number &&
                            allAttemptedQuestions[ind]?.answer &&
                            allAttemptedQuestions[ind]?.answer[0] &&
                            !allAttemptedQuestions[ind]?.is_flagged &&
                            "bg-gray-700 text-white hover:bg-gray-900",
                          allAttemptedQuestions[ind]?.question_number !==
                            currentQuestion?.question_number &&
                            allAttemptedQuestions[ind] &&
                            allAttemptedQuestions[ind]?.answer &&
                            !allAttemptedQuestions[ind]?.answer[0] &&
                            !allAttemptedQuestions[ind]?.is_flagged &&
                            "bg-yellow-200",
                        )}
                        onClick={() => updateCurrentQuestion(ind)}
                      >
                        {questionNumber}
                      </button>
                    ))}
                  </div>
                </Card>
                {/* Current Question, prev, next, flag */}
                <Card className="col-span-1 min-h-[600px] border px-8 py-6 md:col-span-3">
                  <div className="flex flex-col gap-8">
                    {/* Question Header */}
                    <div className="relative flex flex-col gap-4">
                      <div className="flex items-center justify-between border-b pb-4">
                        <div className="text-2xl font-bold">
                          Question{" "}
                          {allAttemptedQuestions.findIndex(
                            (question) =>
                              question.question_number ===
                              currentQuestion.question_number,
                          ) !== -1
                            ? allAttemptedQuestions.findIndex(
                                (question) =>
                                  question.question_number ===
                                  currentQuestion.question_number,
                              ) + 1
                            : allAttemptedQuestions.length + 1}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={flagQuestion}
                        >
                          <Flag
                            className="h-5 w-5"
                            style={{
                              color: currentQuestion?.is_flagged
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
                          Attempt has been pause please resume attempt
                        </div>
                      )}
                    </div>

                    {/* Answer Options */}
                    <div className="flex-grow">
                      {/* Multiple Choice */}
                      {currentQuestion?.type === "multiple_choice" && (
                        <RadioGroup
                          value={currentQuestion?.answer?.[0] || ""}
                          onValueChange={(value) => {
                            // Only allow changing answer if not already submitted
                            if (!currentQuestion.answer_submitted) {
                              const option = value
                                .split(`${currentQuestion.question_number}-`)
                                .slice(1)
                                .join(" ");

                              setCurrentQuestion({
                                ...currentQuestion,
                                answer: [option],
                              });
                            }
                          }}
                          className="space-y-4"
                          disabled={currentQuestion.answer_submitted}
                        >
                          {currentQuestion?.multiple_choice_options.map(
                            (option) => (
                              <Label
                                key={`${currentQuestion.question_number}-${option}`}
                                htmlFor={`${currentQuestion.question_number}-${option}`}
                                className={cn(
                                  "flex items-center space-x-3 rounded-lg border p-4 transition-colors",
                                  currentQuestion.answer_submitted &&
                                    option ===
                                      (currentQuestion.correct_answer &&
                                        currentQuestion?.correct_answer[0]) &&
                                    "border-green-500 bg-green-50",
                                  currentQuestion.answer_submitted &&
                                    option === currentQuestion?.answer?.[0] &&
                                    option !==
                                      (currentQuestion.correct_answer &&
                                        currentQuestion.correct_answer[0]) &&
                                    "border-red-500 bg-red-50",
                                  !currentQuestion.answer_submitted &&
                                    "hover:bg-gray-50",
                                )}
                              >
                                <RadioGroupItem
                                  value={`${currentQuestion.question_number}-${option}`}
                                  id={`${currentQuestion.question_number}-${option}`}
                                  checked={
                                    option === currentQuestion?.answer?.[0]
                                  }
                                  aria-checked={
                                    option === currentQuestion?.answer?.[0]
                                  }
                                  disabled={currentQuestion.answer_submitted}
                                />
                                <div className="flex-grow text-lg">
                                  {option}
                                </div>
                                {currentQuestion.answer_submitted &&
                                  option ===
                                    (currentQuestion.correct_answer &&
                                      currentQuestion.correct_answer[0]) && (
                                    <div className="text-green-600">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M20 6L9 17l-5-5" />
                                      </svg>
                                    </div>
                                  )}
                                {currentQuestion.answer_submitted &&
                                  option === currentQuestion?.answer?.[0] &&
                                  option !==
                                    (currentQuestion.correct_answer &&
                                      currentQuestion.correct_answer[0]) && (
                                    <div className="text-red-600">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    </div>
                                  )}
                              </Label>
                            ),
                          )}
                        </RadioGroup>
                      )}

                      {/* Multiple Select */}
                      {currentQuestion.type === "multiple_select" && (
                        <div className="space-y-4">
                          {currentQuestion?.multiple_choice_options.map(
                            (option) => {
                              const isSelected =
                                currentQuestion?.answer?.includes(option);
                              const isCorrect =
                                currentQuestion.answer_submitted &&
                                currentQuestion.correct_answer?.includes(
                                  option,
                                );
                              const isIncorrect =
                                currentQuestion.answer_submitted &&
                                isSelected &&
                                !currentQuestion.correct_answer?.includes(
                                  option,
                                );

                              return (
                                <div
                                  key={`${currentQuestion.question_number}-${option}`}
                                  className={cn(
                                    "flex items-center space-x-3 rounded-lg border p-4 transition-colors",
                                    isCorrect && "border-green-500 bg-green-50",
                                    isIncorrect && "border-red-500 bg-red-50",
                                    !currentQuestion.answer_submitted &&
                                      "hover:bg-gray-50",
                                  )}
                                >
                                  <Checkbox
                                    id={`${currentQuestion.question_number}-${option}`}
                                    checked={isSelected}
                                    disabled={
                                      isSubmittingAnswer ||
                                      currentQuestion.answer_submitted
                                    }
                                    onCheckedChange={(checked) => {
                                      if (!currentQuestion.answer_submitted) {
                                        let answer = [];
                                        if (checked) {
                                          answer = [
                                            ...(currentQuestion?.answer || []),
                                            option,
                                          ];
                                        } else {
                                          // @ts-expect-error error
                                          answer =
                                            currentQuestion?.answer?.filter(
                                              (a) => a !== option,
                                            );
                                        }

                                        setCurrentQuestion({
                                          ...currentQuestion,
                                          answer,
                                        });
                                      }
                                    }}
                                  />
                                  <Label
                                    htmlFor={`${currentQuestion.question_number}-${option}`}
                                    className="flex-grow text-lg"
                                  >
                                    {option}
                                  </Label>
                                  {isCorrect && (
                                    <div className="text-green-600">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <path d="M20 6L9 17l-5-5" />
                                      </svg>
                                    </div>
                                  )}
                                  {isIncorrect && (
                                    <div className="text-red-600">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="20"
                                        height="20"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      )}

                      {/* Short Answer */}
                      {currentQuestion.type === "short_answer" && (
                        <div className="space-y-4">
                          <Input
                            type="text"
                            value={currentQuestion?.answer?.[0] || ""}
                            disabled={
                              isSubmittingAnswer ||
                              currentQuestion.answer_submitted
                            }
                            onChange={(e) => {
                              if (!currentQuestion.answer_submitted) {
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  answer: [e.target.value],
                                });
                              }
                            }}
                            placeholder="Type your answer here..."
                            className={cn(
                              "w-full p-4 text-lg",
                              currentQuestion.answer_submitted &&
                                (currentQuestion.correct_answer &&
                                  currentQuestion.correct_answer[0]) ===
                                  (currentQuestion.correct_answer &&
                                    currentQuestion.correct_answer[0]) &&
                                "border-green-500 bg-green-50",
                              currentQuestion.answer_submitted &&
                                (currentQuestion.correct_answer &&
                                  currentQuestion.correct_answer[0]) !==
                                  (currentQuestion.correct_answer &&
                                    currentQuestion.correct_answer[0]) &&
                                "border-red-500 bg-red-50",
                            )}
                          />
                          {currentQuestion.answer_submitted && (
                            <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                              <p className="font-medium text-gray-700">
                                Correct Answer:
                              </p>
                              <p className="mt-1 text-green-600">
                                {currentQuestion.correct_answer}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* True/False */}
                      {currentQuestion.type === "true/false" && (
                        <RadioGroup
                          value={currentQuestion?.answer?.[0] || ""}
                          onValueChange={(value) => {
                            if (!currentQuestion.answer_submitted) {
                              setCurrentQuestion({
                                ...currentQuestion,
                                answer: [value],
                              });
                            }
                          }}
                          className="space-y-4"
                          disabled={currentQuestion.answer_submitted}
                        >
                          {["True", "False"].map((option) => (
                            <div
                              key={`${currentQuestion.question_number}-${option}`}
                              className={cn(
                                "flex items-center space-x-3 rounded-lg border p-4 transition-colors",
                                currentQuestion.answer_submitted &&
                                  option ===
                                    (currentQuestion.correct_answer &&
                                      currentQuestion.correct_answer[0]) &&
                                  "border-green-500 bg-green-50",
                                currentQuestion.answer_submitted &&
                                  option === currentQuestion?.answer?.[0] &&
                                  option !==
                                    (currentQuestion.correct_answer &&
                                      currentQuestion.correct_answer[0]) &&
                                  "border-red-500 bg-red-50",
                                !currentQuestion.answer_submitted &&
                                  "hover:bg-gray-50",
                              )}
                            >
                              <RadioGroupItem
                                value={option}
                                id={`${currentQuestion.question_number}-${option}`}
                                checked={
                                  option === currentQuestion?.answer?.[0]
                                }
                                disabled={currentQuestion.answer_submitted}
                              />
                              <Label
                                htmlFor={`${currentQuestion.question_number}-${option}`}
                                className="flex-grow text-lg"
                              >
                                {option}
                              </Label>
                              {currentQuestion.answer_submitted &&
                                option ===
                                  (currentQuestion.correct_answer &&
                                    currentQuestion.correct_answer[0]) && (
                                  <div className="text-green-600">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M20 6L9 17l-5-5" />
                                    </svg>
                                  </div>
                                )}
                              {currentQuestion.answer_submitted &&
                                option === currentQuestion?.answer?.[0] &&
                                option !==
                                  (currentQuestion.correct_answer &&
                                    currentQuestion.correct_answer[0]) && (
                                  <div className="text-red-600">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="20"
                                      height="20"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <line x1="18" y1="6" x2="6" y2="18" />
                                      <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                  </div>
                                )}
                            </div>
                          ))}
                        </RadioGroup>
                      )}

                      {/* Feedback and Hints Section - Only visible after submitting answer */}
                      {currentQuestion.answer_submitted && (
                        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                          <div className="mb-3 text-lg font-medium text-gray-800">
                            {(currentQuestion.correct_answer &&
                              currentQuestion.correct_answer[0]) ===
                              currentQuestion.correct_answer ||
                            (Array.isArray(currentQuestion.correct_answer) &&
                              JSON.stringify(
                                currentQuestion?.answer?.sort(),
                              ) ===
                                JSON.stringify(
                                  currentQuestion.correct_answer.sort(),
                                ))
                              ? "Correct! 🎉"
                              : "Incorrect ❌"}
                          </div>

                          {currentQuestion.hints &&
                            currentQuestion.hints.length > 0 && (
                              <div className="mt-4">
                                <h3 className="mb-2 font-medium text-gray-700">
                                  Hints & Explanation:
                                </h3>
                                <ul className="ml-5 list-disc space-y-1 text-gray-600">
                                  {currentQuestion.hints.map((hint, index) => (
                                    <li key={index}>{hint}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between border-t pt-6">
                      <div className="flex items-center gap-4">
                        {allAttemptedQuestions.length > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <Button
                              variant="outline"
                              disabled={isSubmittingAnswer}
                              className="flex items-center gap-2"
                              onClick={() => {
                                const index = allAttemptedQuestions.findIndex(
                                  (question) =>
                                    question.question_number ===
                                    currentQuestion.question_number,
                                );

                                updateCurrentQuestion(
                                  index !== -1
                                    ? index - 1
                                    : allAttemptedQuestions.length - 1,
                                );
                              }}
                            >
                              <ChevronsLeft className="h-4 w-4" />
                              Prev
                            </Button>
                          </div>
                        )}
                        {isSubmittingAnswer && (
                          <span className="text-sm text-gray-500">
                            Saving...
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        {!currentQuestion.answer_submitted ? (
                          <Button
                            variant="default"
                            disabled={
                              isSubmittingAnswer ||
                              !currentQuestion.answer ||
                              (Array.isArray(currentQuestion?.answer) &&
                                currentQuestion.answer?.length === 0)
                            }
                            className="flex items-center gap-2"
                            onClick={() => {
                              setIsSubmittingAnswer(true);

                              // Simulate API call to check answer
                              setTimeout(() => {
                                // Update current question with submission status and correctness
                                setCurrentQuestion({
                                  ...currentQuestion,
                                  answer_submitted: true,
                                  // This is where you'd normally get the correct answer from API
                                  // Placeholder for demonstration
                                });

                                const updatedAttemptedQuestions = [
                                  ...allAttemptedQuestions,
                                ];
                                const existingIndex =
                                  updatedAttemptedQuestions.findIndex(
                                    (q) =>
                                      q.question_number ===
                                      currentQuestion.question_number,
                                  );

                                if (existingIndex !== -1) {
                                  updatedAttemptedQuestions[existingIndex] = {
                                    ...currentQuestion,
                                    answer_submitted: true,
                                  };
                                } else {
                                  updatedAttemptedQuestions.push({
                                    ...currentQuestion,
                                    answer_submitted: true,
                                  });
                                }

                                setAllAttemptedQuestions(
                                  updatedAttemptedQuestions,
                                );
                                setIsSubmittingAnswer(false);
                              }, 500);
                            }}
                          >
                            Show Answer
                            {isSubmittingAnswer ? (
                              <LoaderCircle className="h-5 w-5 animate-spin" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            onClick={
                              mode === "proctored"
                                ? handleNextQuestionProctored
                                : handleNextQuestionLearning
                            }
                          >
                            {allAttemptedQuestions.findIndex(
                              (question) =>
                                question.question_number ===
                                currentQuestion.question_number,
                            ) ===
                            totalQuestions - 1
                              ? "Complete Quiz"
                              : "Next question"}
                            {isSubmittingAnswer ? (
                              <LoaderCircle className="h-5 w-5 animate-spin" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="mx-auto mt-4 flex h-full max-w-screen-xl flex-col gap-4">
          <Card className="mb-6 rounded-lg bg-white p-6 shadow-lg">
            <div className="grid grid-cols-1 gap-6">
              {allAttemptedQuestions?.map((question, index) => (
                <div
                  key={question.description}
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
                        type="button"
                        className="text-sm text-blue-500 underline hover:text-blue-700"
                        onClick={() => {
                          setPreview(false);
                          updateCurrentQuestion(index);
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
                    {(question.type === "multiple_choice" ||
                      question.type === "multiple_select") && (
                      <ul className="space-y-2">
                        {question.multiple_choice_options.map((option) => (
                          <li
                            key={option}
                            className={`rounded-lg p-2 ${
                              Array.isArray(
                                (question?.answer?.[0] ?? "").split(/,\s*/), // Split by comma and optional space
                              )
                                ? ((question?.answer?.[0] ?? "")
                                    .split(/,\s*/)
                                    .includes(option) ?? false)
                                  ? "border border-green-500 bg-green-100 text-green-800"
                                  : "border border-gray-300 bg-white text-gray-600"
                                : Array.isArray(question?.answer) &&
                                    (question?.answer?.[0] ?? "")
                                      .split(/,\s*/)
                                      .includes(option)
                                  ? "border border-green-500 bg-green-100 text-green-800"
                                  : "border border-gray-300 bg-white text-gray-600"
                            }`}
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    {question.type === "true/false" && (
                      <ul className="space-y-2">
                        {["True", "False"].map((option) => (
                          <li
                            key={option}
                            className={`rounded-lg p-2 ${
                              Array.isArray(
                                (question?.answer?.[0] ?? "").split(/,\s*/), // Split by comma and optional space
                              )
                                ? ((question?.answer?.[0] ?? "")
                                    .split(/,\s*/)
                                    .includes(option) ?? false)
                                  ? "border border-green-500 bg-green-100 text-green-800"
                                  : "border border-gray-300 bg-white text-gray-600"
                                : Array.isArray(question?.answer) &&
                                    (question?.answer?.[0] ?? "")
                                      .split(/,\s*/)
                                      .includes(option)
                                  ? "border border-green-500 bg-green-100 text-green-800"
                                  : "border border-gray-300 bg-white text-gray-600"
                            }`}
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    {question.type === "short_answer" && (
                      <div className="space-y-2">
                        <div className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600">
                          {question?.answer?.length ? question?.answer[0] : ""}
                        </div>
                      </div>
                    )}
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
