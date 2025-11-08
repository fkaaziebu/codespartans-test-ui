"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePathname, useSearchParams } from "next/navigation";
import { Slide, toast } from "react-toastify";
import { FolderClosed, PauseIcon } from "lucide-react";

type Question = {
  description: string;
  hints: string[];
  type: "multiple_choice" | "text" | "number";
  multiple_choice_options?: string[];
  domain: string;
  tags: string[];
  difficulty: number;
  time: number;
  question_number: number;
};

export default function StartAttempt() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [showHints, setShowHints] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [pausedTimeLeft, setPausedTimeLeft] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pauseData, setPauseData] = useState<any | null>(null);
  const [showPauseCard, setShowPauseCard] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getAttemptId = pathname.split("/").pop();
  const getSuiteId = pathname.split("/")[pathname.split("/").length - 3];
  const getTestId = pathname.split("/")[pathname.split("/").length - 5];
  const getMode = searchParams.get("mode") || "";

  const getQuestions = async () => {
    const attemptId = getAttemptId;
    const suiteId = getSuiteId;
    const testId = getTestId;
    const mode = getMode;

    try {
      const result = await axios.get(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/next-question?mode=${mode}`,
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log(result);
      setQuestion(result.data);
      setTimeLeft(result.data.time * 60); // Convert minutes to seconds
      setTotalQuestions(result.data.question_number);
      setCurrentQuestionIndex(result.data.question_number - 1);
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
    }
  };

  useEffect(() => {
    getQuestions();
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSubmit = async () => {
    const attemptId = getAttemptId;
    const suiteId = getSuiteId;
    const testId = getTestId;
    const mode = getMode;
    if (!selectedAnswer) return;
    try {
      const result = await axios.post(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/questions/${question?.question_number}/submit-answer?mode=${mode}`,
        { answer: selectedAnswer },
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log(result);
      console.log("Submitted answer:", selectedAnswer);
      setAnsweredQuestions((prev) => [...prev, currentQuestionIndex]);
      await getQuestions();
      setSelectedAnswer("");
      setShowHints(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePauseTest = async () => {
    try {
      const attemptId = getAttemptId;
      const suiteId = getSuiteId;
      const testId = getTestId;
      const result = await axios.post(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/pause-attempt`,
        {},
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log("pause", result);
      setPauseData(result.data);
      setPausedTimeLeft(timeLeft);
      clearTimeout(timeLeft);
      setShowPauseCard(true);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const handleResumeTest = async () => {
    const attemptId = getAttemptId;
    const suiteId = getSuiteId;
    const testId = getTestId;

    try {
      const result = await axios.post(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/resume-attempt`,
        {},
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log("resumed", result);
      setShowPauseCard(false);
      setTimeLeft(pausedTimeLeft);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const finishAttempt = async () => {
    const attemptId = getAttemptId;
    const suiteId = getSuiteId;
    const testId = getTestId;
    const mode = getMode;

    try {
      const result = await axios.post(
        `https://exam-simulation-platform-production-307d.up.railway.app/v1/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/finish-attempt?mode=${mode}`,
        {},
        {
          headers: {
            Authorization: "Bearer " + sessionStorage.getItem("token"),
          },
        }
      );
      console.log("finished attempt", result);
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      getQuestions();
    }
  };

  const handleFlag = () => {
    setFlaggedQuestions((prev) => [...prev, currentQuestionIndex]);
  };

  if (!question) {
    return <div>Loading...</div>;
  }

  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="max-w-7xl mx-auto flex flex-col items-center justify-center p-4">
      {getMode === "learning" && (
        <div className="max-w-screen-xl mx-auto my-auto flex flex-col  overflow-auto p-4">
          <div className="max-w-full mx-auto flex-col  px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full lg:w-[80%]">
                <Card className="mb-4">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold md:text-xl md:font-bold">
                      Question {question.question_number}
                    </CardTitle>
                    <div className="flex gap-2 ">
                      <Badge
                        variant="outline"
                        className="text-sm font-light md:text-base md:font-normal "
                      >
                        {question.domain}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="hidden lg:block text-sm font-light md:text-base md:font-normal "
                      >
                        Difficulty:{" "}
                        {Array(question.difficulty).fill("★").join("")}
                      </Badge>
                      <Button
                        variant="outline"
                        className=""
                        onClick={finishAttempt}
                      >
                        <FolderClosed />
                      </Button>
                      {/* <Badge
                        variant="outline"
                        className={timeLeft < 60 ? "bg-red-100" : ""}
                      >
                        Time: {Math.floor(timeLeft / 60)}:
                        {(timeLeft % 60).toString().padStart(2, "0")}
                      </Badge> */}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <p className="text-lg mb-4">{question.description}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowHints(!showHints)}
                        className="mb-2"
                      >
                        {showHints ? "Hide Hints" : "Show Hints"}
                      </Button>
                      {showHints && (
                        <ul className="list-disc list-inside mb-4 pl-4">
                          {question.hints.map((hint, index) => (
                            <li key={index} className="text-gray-600">
                              {hint}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {question.type === "multiple_choice" &&
                      question.multiple_choice_options && (
                        <div className="space-y-4">
                          <RadioGroup
                            value={selectedAnswer}
                            onValueChange={setSelectedAnswer}
                          >
                            {question.multiple_choice_options.map(
                              (option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={option}
                                    id={`option-${index}`}
                                  />
                                  <Label htmlFor={`option-${index}`}>
                                    {option}
                                  </Label>
                                </div>
                              )
                            )}
                          </RadioGroup>
                        </div>
                      )}

                    <div className="mt-6 flex justify-between">
                      <div>
                        <Button
                          onClick={handlePrevious}
                          disabled={currentQuestionIndex === 0}
                          className="mr-2"
                        >
                          Previous
                        </Button>
                        <Button onClick={handleFlag}>Flag</Button>
                      </div>
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedAnswer}
                        className={
                          isLastQuestion ? "bg-green-500 text-white" : ""
                        }
                      >
                        {isLastQuestion ? "Finish" : "Submit"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="w-full lg:w-[20%]">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Question Navigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: totalQuestions }, (_, i) => i).map(
                        (index) => (
                          <Badge
                            key={index}
                            variant={
                              answeredQuestions.includes(index)
                                ? "outline"
                                : flaggedQuestions.includes(index)
                                ? "destructive"
                                : "default"
                            }
                            className={`cursor-pointer ${
                              currentQuestionIndex === index
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            onClick={() => {
                              setCurrentQuestionIndex(index);
                              getQuestions();
                            }}
                          >
                            {index + 1}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}

      <>
        {showPauseCard && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-lg w-full">
              <CardHeader>
                <CardTitle>Test Paused</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{pauseData.message}.</p>
                {pauseData && (
                  <div className="mb-4">
                    <Badge variant="outline">
                      Paused At: {pauseData.pausedAt}
                    </Badge>
                  </div>
                )}
                <p className="text-lg font-semibold">
                  Time Remaining:{" "}
                  {`${Math.floor(pauseData.attempt.time_remaining / 60)}:${(
                    pauseData.attempt.time_remaining % 60
                  )
                    .toString()
                    .padStart(2, "0")}`}
                </p>
                <Button onClick={handleResumeTest} className="mt-4">
                  Resume Test
                </Button>
                n
              </CardContent>
            </Card>
          </div>
        )}
      </>

      {getMode === "proctored" && (
        <div className="w-full  items-center justify-center">
          <div className="max-w-full mx-auto flex-col  px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="w-full  lg:w-[80%]">
                <Card className="mb-4 ">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base font-semibold md:text-xl md:font-bold">
                      Question {question.question_number}
                    </CardTitle>
                    <div className="flex gap-2 ">
                      {/* <Badge
                        variant="outline"
                        className="text-sm font-light md:text-base md:font-normal "
                      >
                        {question.domain}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="hidden lg:block text-sm font-light md:text-base md:font-normal "
                      >
                        Difficulty:{" "}
                        {Array(question.difficulty).fill("★").join("")}
                      </Badge> */}
                      <Badge
                        variant="outline"
                        className={timeLeft < 60 ? "bg-red-100" : ""}
                      >
                        Time: {Math.floor(timeLeft / 60)}:
                        {(timeLeft % 60).toString().padStart(2, "0")}
                      </Badge>
                      <Button
                        variant="outline"
                        className=""
                        onClick={handlePauseTest}
                      >
                        <PauseIcon />
                      </Button>
                      <Button
                        variant="outline"
                        className=""
                        onClick={finishAttempt}
                      >
                        <FolderClosed />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {question.type === "multiple_choice" &&
                      question.multiple_choice_options && (
                        <div className="space-y-4">
                          <RadioGroup
                            value={selectedAnswer}
                            onValueChange={setSelectedAnswer}
                          >
                            {question.multiple_choice_options.map(
                              (option, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-2"
                                >
                                  <RadioGroupItem
                                    value={option}
                                    id={`option-${index}`}
                                  />
                                  <Label htmlFor={`option-${index}`}>
                                    {option}
                                  </Label>
                                </div>
                              )
                            )}
                          </RadioGroup>
                        </div>
                      )}

                    <div className="mt-6 flex justify-between">
                      <div>
                        <Button
                          onClick={handlePrevious}
                          disabled={currentQuestionIndex === 0}
                          className="mr-2"
                        >
                          Previous
                        </Button>
                        <Button onClick={handleFlag}>Flag</Button>
                      </div>
                      <Button
                        onClick={handleSubmit}
                        disabled={!selectedAnswer}
                        className={
                          isLastQuestion ? "bg-green-500 text-white" : ""
                        }
                      >
                        {isLastQuestion ? "Finish" : "Submit"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="w-full lg:w-[20%]">
                <Card className="sticky top-4">
                  <CardHeader>
                    <CardTitle>Question Navigation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: totalQuestions }, (_, i) => i).map(
                        (index) => (
                          <Badge
                            key={index}
                            variant={
                              answeredQuestions.includes(index)
                                ? "outline"
                                : flaggedQuestions.includes(index)
                                ? "destructive"
                                : "default"
                            }
                            className={`cursor-pointer ${
                              currentQuestionIndex === index
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                            onClick={() => {
                              setCurrentQuestionIndex(index);
                              getQuestions();
                            }}
                          >
                            {index + 1}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
