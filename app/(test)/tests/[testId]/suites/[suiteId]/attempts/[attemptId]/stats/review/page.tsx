"use client";

import axios from "axios";
import { CheckCircle, Filter, Flag, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Question {
  question: {
    question_number: number;
    description: string;
    hints: string[];
    tags: string[];
    type: "multiple_choice" | "true/false" | "short_answer" | "multiple_select";
    difficulty: number;
    domain: string;
    multiple_choice_options?: string[];
    correct_answer: string[];
  };
  answer: string;
  hint_used: string[];
  timestamp: number;
  is_flagged: boolean;
}

const QuestionReviewPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [retest, setRetest] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [answeredQuestionList, setAnsweredQuestionList] = useState<Question[]>(
    [],
  );
  const [activeFilter, setActiveFilter] = useState("all");

  const [questionAnswers, setQuestionAnswers] = useState<
    Record<number, string>
  >({});
  const [answeredQuestions, setAnsweredQuestions] = useState<
    Record<number, boolean>
  >({});
  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3004/v1";

  const courseId = pathname.split("/")[pathname.split("/").length - 7];

  const normalizeAnswer = (answer: string | string[]): string[] => {
    return Array.isArray(answer) ? answer : [answer];
  };

  const getAllAttemptedQuestions = async () => {
    setIsLoading(true);
    try {
      const attemptId = pathname.split("/")[pathname.split("/").length - 3];
      const mode = searchParams.get("mode");
      const suiteId = pathname.split("/")[pathname.split("/").length - 5];
      const testId = searchParams.get("testId");

      const response = await axios.get(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts/${attemptId}/review?mode=${mode}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setAnsweredQuestionList(response.data.review || []);
    } catch (error) {
      console.error("Failed to fetch attempted questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isCorrectAnswer = (question: Question) => {
    const normalizedAnswer = normalizeAnswer(question.answer);

    switch (question.question.type) {
      case "multiple_select":
        // For multi-select, check if arrays match (order doesn't matter)
        const selectedAnswers = normalizedAnswer[0].split(",");
        const correctAnswers = question.question.correct_answer;
        return (
          selectedAnswers.length === correctAnswers.length &&
          selectedAnswers.every((answer) => correctAnswers.includes(answer))
        );

      case "true/false":
      case "multiple_choice":
      case "short_answer":
      default:
        // For other types, direct comparison is fine
        return (
          normalizedAnswer[0]?.toLowerCase() ===
          question.question.correct_answer[0].toLowerCase()
        );
    }
  };

  const isFlagged = (question: Question) => {
    const normaLizedFlaggedAnswer = question.is_flagged;
    return normaLizedFlaggedAnswer;
  };

  const filters = [
    {
      id: "all",
      label: "All Questions",
      count: answeredQuestionList.length || 0,
    },
    {
      id: "correct",
      label: "Correct Questions",
      count: answeredQuestionList.filter(isCorrectAnswer).length || 0,
    },
    {
      id: "wrong",
      label: "Wrong Questions",
      count:
        answeredQuestionList.filter((q) => !isCorrectAnswer(q)).length || 0,
    },
    {
      id: "flagged",
      label: "Flagged Questions",
      count: answeredQuestionList.filter((q) => isFlagged(q)).length || 0,
    },
  ];

  const filterQuestions = () => {
    switch (activeFilter) {
      case "correct":
        return answeredQuestionList.filter((q) => isCorrectAnswer(q));
      case "wrong":
        return answeredQuestionList.filter((q) => !isCorrectAnswer(q));
      case "flagged":
        return answeredQuestionList.filter(isFlagged);
      default:
        return answeredQuestionList;
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "Easy";
      case 2:
        return "Medium";
      case 3:
        return "Hard";
      default:
        return "Unknown";
    }
  };

  const renderAnswerSection = (q: Question) => {
    const normalizedAnswer = normalizeAnswer(q.answer);

    switch (q.question.type) {
      case "multiple_choice":
        return (
          <div className="mt-2">
            <span className="font-medium">Options:</span>
            <ul className="ml-4 mt-1 list-disc text-gray-600">
              {q.question.multiple_choice_options?.map((option, index) => {
                const isSelected = option === normalizedAnswer[0];
                const isCorrect = option === q.question.correct_answer[0];
                return (
                  <li
                    key={index}
                    className={`${
                      isCorrect
                        ? "rounded px-2 py-1 font-bold text-green-600"
                        : isSelected && !isCorrect
                          ? "rounded px-2 py-1 font-bold text-red-600"
                          : "rounded px-2 py-1 font-bold text-gray-600"
                    }`}
                  >
                    {option}
                  </li>
                );
              })}
            </ul>
          </div>
        );

      case "multiple_select":
        return (
          <div className="mt-2">
            <span className="font-medium">Options:</span>
            <ul className="ml-4 mt-1 list-disc text-gray-600">
              {q.question.multiple_choice_options?.map((option, index) => {
                const selectedAnswers = normalizedAnswer[0].split(",");
                const isSelected = selectedAnswers.includes(option);
                const isCorrect = q.question.correct_answer.includes(option);
                return (
                  <li
                    key={index}
                    className={`${
                      isCorrect
                        ? "rounded px-2 py-1 font-bold text-green-600"
                        : isSelected && !isCorrect
                          ? "rounded px-2 py-1 font-bold text-red-600"
                          : "rounded px-2 py-1 font-bold text-gray-600"
                    }`}
                  >
                    {option} {isSelected && "✓"}
                  </li>
                );
              })}
            </ul>
          </div>
        );

      case "true/false":
        return (
          <div className="mt-2">
            <span className="font-medium">Answer:</span>
            <div className="mt-1 space-y-1">
              {["True", "False"].map((option) => {
                const isSelected = option === normalizedAnswer[0].toLowerCase();
                const isCorrect =
                  option.toLowerCase() ===
                  q.question.correct_answer[0].toLowerCase();
                return (
                  <div
                    key={option}
                    className={`rounded px-2 py-1 ${
                      isCorrect
                        ? "font-bold text-green-600"
                        : isSelected && !isCorrect
                          ? "font-bold text-red-600"
                          : "text-gray-600"
                    }`}
                  >
                    {option.toLowerCase()} {isSelected && "✓"}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case "short_answer":
        return (
          <div className="mt-2">
            <div className="space-y-2">
              <div>
                <span className="font-medium">Your Answer:</span>
                <div
                  className={`ml-4 rounded px-2 py-1 ${
                    isCorrectAnswer(q) ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {normalizedAnswer[0]}
                </div>
              </div>
              <div>
                <span className="font-medium">Correct Answer:</span>
                <div className="ml-4 rounded px-2 py-1 text-green-600">
                  {q.question.correct_answer[0]}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRetest = (filterId: string) => {
    setRetest(true);
  };

  const handleStopRetest = () => {
    setRetest(false);
  };

  const handleRetestAnswerSelect = (questionNumber: number, answer: string) => {
    setQuestionAnswers((prev) => ({
      ...prev,
      [questionNumber]: answer,
    }));
    setAnsweredQuestions((prev) => ({
      ...prev,
      [questionNumber]: true,
    }));
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    getAllAttemptedQuestions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2 text-gray-100">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-xl font-semibold text-purple-600">
            ExamSim
          </Link>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex justify-between gap-2 space-x-4">
              <Link href={`/tests/${courseId}/suites`} className="underline">
                Back to suites page
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="h-full overflow-hidden">
        {!retest && (
          <div className="mx-auto max-w-screen-xl p-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        {filters.find((f) => f.id === activeFilter)?.label}
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-[280px]">
                      <div className="space-y-2">
                        {filters.map((filter) => (
                          <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left hover:bg-gray-100 ${
                              activeFilter === filter.id ? "bg-gray-100" : ""
                            }`}
                          >
                            <span>{filter.label}</span>
                            <span className="text-sm text-gray-500">
                              {filter.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterQuestions().map((q) => (
                    <Card key={q.question.question_number}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              {isCorrectAnswer(q) ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                              )}
                              <h3 className="font-medium">
                                Question{" "}
                                {answeredQuestionList.findIndex(
                                  (item) =>
                                    item.question.question_number ===
                                    q.question.question_number,
                                ) + 1}
                              </h3>
                              {isFlagged(q) && (
                                <Flag className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <div className="ml-7 space-y-3">
                              <ReactMarkdown
                                className="markdown-content"
                                remarkPlugins={[remarkGfm]}
                              >
                                {q.question.description || ""}
                              </ReactMarkdown>
                              <div className="mt-2 text-sm">
                                <div className="mb-2">
                                  <span className="font-medium">
                                    Difficulty:
                                  </span>{" "}
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs ${
                                      q.question.difficulty === 1
                                        ? "bg-green-100 text-green-800"
                                        : q.question.difficulty === 2
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {getDifficultyLabel(q.question.difficulty)}
                                  </span>
                                </div>

                                {renderAnswerSection(q)}

                                <div className="mt-2">
                                  <span className="font-medium">Hints:</span>
                                  <ul className="ml-4 list-disc text-gray-600">
                                    {q.question.hints.map((hint, index) => (
                                      <li key={index}>{hint}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex w-full">
                <div className="flex w-full space-y-2">
                  <Button
                    className="flex w-full items-center rounded-md bg-gray-100 px-3 py-2 text-left text-black hover:bg-gray-600 hover:text-white"
                    onClick={() => handleRetest(activeFilter)}
                  >
                    Retest {filters.find((f) => f.id === activeFilter)?.label}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
      <div>
        {retest && (
          <div className="mx-auto max-w-screen-xl p-4">
            <div className="mb-4 flex justify-between">
              <h2 className="text-xl font-bold">Retest Questions</h2>
              <Button
                variant="outline"
                onClick={handleStopRetest}
                className="text-gray-600 hover:text-gray-800 hover:underline"
              >
                Back to Review
              </Button>
            </div>
            <div className="space-y-6">
              {filterQuestions().map((q, index) => {
                const isAnswered =
                  answeredQuestions[q.question.question_number];
                const selectedAnswer =
                  questionAnswers[q.question.question_number];
                const isCorrect = (() => {
                  switch (q.question.type) {
                    case "multiple_select":
                      const selectedAnswers = selectedAnswer?.split(",") || [];
                      const correctAnswers = q.question.correct_answer;
                      return (
                        selectedAnswers.length === correctAnswers.length &&
                        selectedAnswers.every((answer) =>
                          correctAnswers.includes(answer),
                        )
                      );
                    case "short_answer":
                      return (
                        selectedAnswer?.toLowerCase() ===
                        q.question.correct_answer[0].toLowerCase()
                      );
                    case "true/false":
                      return (
                        selectedAnswer?.toLowerCase() ===
                        q.question.correct_answer[0].toLowerCase()
                      );
                    default:
                      return selectedAnswer === q.question.correct_answer[0];
                  }
                })();

                return (
                  <Card key={q.question.question_number} className="p-6">
                    <div className="mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">
                          Question {index + 1}
                        </span>
                        {isAnswered &&
                          (isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ))}
                      </div>
                      <ReactMarkdown
                        className="markdown-content"
                        remarkPlugins={[remarkGfm]}
                      >
                        {q?.question.description || ""}
                      </ReactMarkdown>
                    </div>

                    {/* Multiple Choice and True/False Questions */}
                    {(q.question.type === "multiple_choice" ||
                      q.question.type === "true/false") && (
                      <RadioGroup
                        value={selectedAnswer || ""}
                        onValueChange={(value) =>
                          handleRetestAnswerSelect(
                            q.question.question_number,
                            value,
                          )
                        }
                        className="space-y-3"
                      >
                        {(q.question.type === "true/false"
                          ? ["True", "False"]
                          : q.question.multiple_choice_options
                        )?.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={option}
                              id={`q${q.question.question_number}-option${optionIndex}`}
                              className="border-2"
                            />
                            <Label
                              htmlFor={`q${q.question.question_number}-option${optionIndex}`}
                              className={`flex-1 cursor-pointer rounded-md p-2 ${
                                isAnswered &&
                                option.toLowerCase() ===
                                  q.question.correct_answer[0].toLowerCase()
                                  ? "bg-green-100 text-green-800"
                                  : isAnswered &&
                                      option === selectedAnswer &&
                                      !isCorrect
                                    ? "bg-red-100 text-red-800"
                                    : "hover:bg-gray-100"
                              } `}
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}

                    {/* Multi-Select Questions */}
                    {q.question.type === "multiple_select" && (
                      <div className="space-y-3">
                        {q.question.multiple_choice_options?.map(
                          (option, optionIndex) => {
                            const selectedOptions = selectedAnswer
                              ? selectedAnswer.split(",")
                              : [];
                            const isSelected = selectedOptions.includes(option);
                            return (
                              <div
                                key={optionIndex}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`q${q.question.question_number}-option${optionIndex}`}
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    const newAnswers = checked
                                      ? [...selectedOptions, option]
                                      : selectedOptions.filter(
                                          (a) => a !== option,
                                        );
                                    handleRetestAnswerSelect(
                                      q.question.question_number,
                                      newAnswers.join(","),
                                    );
                                  }}
                                  className="border-2"
                                />
                                <Label
                                  htmlFor={`q${q.question.question_number}-option${optionIndex}`}
                                  className={`flex-1 cursor-pointer rounded-md p-2 ${
                                    isAnswered &&
                                    q.question.correct_answer.includes(option)
                                      ? "bg-green-100 text-green-800"
                                      : isAnswered &&
                                          isSelected &&
                                          !q.question.correct_answer.includes(
                                            option,
                                          )
                                        ? "bg-red-100 text-red-800"
                                        : "hover:bg-gray-100"
                                  }`}
                                >
                                  {option}
                                </Label>
                              </div>
                            );
                          },
                        )}
                      </div>
                    )}

                    {/* Short Answer Questions */}
                    {q.question.type === "short_answer" && (
                      <div className="space-y-3">
                        <Input
                          type="text"
                          value={selectedAnswer || ""}
                          onChange={(e) =>
                            handleRetestAnswerSelect(
                              q.question.question_number,
                              e.target.value,
                            )
                          }
                          placeholder="Type your answer here..."
                          className={`w-full p-2 ${
                            isAnswered
                              ? isCorrect
                                ? "border-green-500 bg-green-50"
                                : "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                        {isAnswered && !isCorrect && (
                          <div className="mt-2">
                            <span className="font-medium">
                              Correct Answer:{" "}
                            </span>
                            <span className="text-green-600">
                              {q.question.correct_answer[0]}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {isAnswered && (
                      <div className="mt-4">
                        {isCorrect ? (
                          <div className="font-medium text-green-600">
                            Correct! Well done!
                          </div>
                        ) : (
                          <div className="font-medium text-red-600">
                            Incorrect. Try again!
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default QuestionReviewPage;
