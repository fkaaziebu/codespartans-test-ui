"use client";
import { DialogTrigger } from "@radix-ui/react-dialog";
import axios from "axios";
import { ChevronRight, LoaderCircle, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Maximum number of trial questions
const MAX_TRIAL_QUESTIONS = 5;

export default function TrialPage() {
  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3006/v1";
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState(false);
  const pathname = usePathname();
  const [showAnswer, setShowAnswer] = useState(false);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [showEndTrialModal, setShowEndTrialModal] = useState(false);
  const [userAnswers, setUserAnswers] = useState({
    multipleChoice: "",
    multipleSelect: [] as string[],
    shortAnswer: "",
    trueOrFalse: "",
  });
  const [trialResults, setTrialResults] = useState<{
    totalAnswered: number;
    correctAnswers: number;
    questionHistory: Array<{
      questionNumber: number;
      isCorrect: boolean;
      domain?: string;
      difficulty?: number;
    }>;
  }>({
    totalAnswered: 0,
    correctAnswers: 0,
    questionHistory: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState<{
    id?: number;
    question_number: number;
    description: string;
    multiple_choice_options: Array<string>;
    time: number;
    hints: Array<string>;
    solution_steps: Array<string>;
    type: string;
    correct_answer: Array<string>;
    is_flagged?: boolean;
    domain?: string;
    tags?: Array<string>;
    difficulty?: number;
  }>({
    question_number: 0,
    description: "",
    multiple_choice_options: [],
    time: 0,
    hints: [],
    type: "",
    correct_answer: [],
    solution_steps: [],
  });

  const getTrialQuestion = async (question_number: number) => {
    setIsLoading(true);
    setLoadingError(false);
    const courseId = pathname.split("/").pop();

    try {
      const response = await axios.get(
        `${baseUrl}/courses/${courseId}/questions/${question_number}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );
      setCurrentQuestion(response.data);
      console.log(response.data);
    } catch (e) {
      console.error("Error fetching trial question:", e);
      setLoadingError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);

    // Track the question result
    const isCorrect = isAnswerCorrect();

    // Update trial results with this question's outcome
    setTrialResults((prev) => {
      const newHistory = [...prev.questionHistory];

      // Check if this question is already in history (in case of resubmit)
      const existingIndex = newHistory.findIndex(
        (q) => q.questionNumber === currentQuestion.question_number,
      );

      if (existingIndex >= 0) {
        // Update existing record
        newHistory[existingIndex] = {
          questionNumber: currentQuestion.question_number,
          isCorrect,
          domain: currentQuestion.domain,
          difficulty: currentQuestion.difficulty,
        };
      } else {
        // Add new record
        newHistory.push({
          questionNumber: currentQuestion.question_number,
          isCorrect,
          domain: currentQuestion.domain,
          difficulty: currentQuestion.difficulty,
        });
      }

      // Calculate new correct answers count
      const correctCount = newHistory.filter((q) => q.isCorrect).length;

      return {
        totalAnswered: newHistory.length,
        correctAnswers: correctCount,
        questionHistory: newHistory,
      };
    });
  };

  const handleNextQuestion = () => {
    // Check if we've reached the maximum number of trial questions
    if (questionNumber >= MAX_TRIAL_QUESTIONS) {
      setShowEndTrialModal(true);
      return;
    }

    // For trial, advance to next question
    setShowAnswer(false);
    setUserAnswers({
      multipleChoice: "",
      multipleSelect: [],
      shortAnswer: "",
      trueOrFalse: "",
    });
    setQuestionNumber(questionNumber + 1);
    getTrialQuestion(questionNumber + 1);
  };

  const isAnswerSelected = () => {
    switch (currentQuestion.type) {
      case "multiple_choice":
        return userAnswers.multipleChoice !== "";
      case "multiple_select":
        return userAnswers.multipleSelect.length > 0;
      case "short_answer":
        return userAnswers.shortAnswer.trim() !== "";
      case "true/false":
        return userAnswers.trueOrFalse !== "";
      default:
        return false;
    }
  };

  const isAnswerCorrect = () => {
    switch (currentQuestion.type) {
      case "multiple_choice":
        return currentQuestion.correct_answer.includes(
          userAnswers.multipleChoice,
        );
      case "multiple_select":
        // Check if arrays have the same elements
        return (
          userAnswers.multipleSelect.length ===
            currentQuestion.correct_answer.length &&
          userAnswers.multipleSelect.every((a) =>
            currentQuestion.correct_answer.includes(a),
          )
        );
      case "short_answer":
        // Case insensitive comparison for short answers
        return currentQuestion.correct_answer.some(
          (answer) =>
            answer.toLowerCase() === userAnswers.shortAnswer.toLowerCase(),
        );
      case "true/false":
        return currentQuestion.correct_answer.includes(userAnswers.trueOrFalse);
      default:
        return false;
    }
  };

  const getUserAnswerText = () => {
    switch (currentQuestion.type) {
      case "multiple_choice":
        return userAnswers.multipleChoice;
      case "multiple_select":
        return userAnswers.multipleSelect.join(", ");
      case "short_answer":
        return userAnswers.shortAnswer;
      case "true/false":
        return userAnswers.trueOrFalse;
      default:
        return "";
    }
  };

  const handlePurchaseCourse = () => {
    // Navigate to purchase page or show purchase modal
    window.location.href = `/courses/${pathname.split("/").pop()}`;
    // Close the end trial modal
    setShowEndTrialModal(false);
  };

  useEffect(() => {
    getTrialQuestion(questionNumber);
  }, []);

  return (
    <div className="grid place-items-center p-4 sm:p-6">
      {/* Question Content - Responsive */}
      <Card
        className="grid w-full max-w-3xl grid-rows-[auto_1fr_auto] gap-6 border px-4 py-4 sm:px-8 sm:py-6"
        style={{ minHeight: "700px", maxWidth: "800px" }}
      >
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Question Header */}
          <div className="relative flex flex-col gap-4">
            <div className="flex flex-col items-start justify-between border-b pb-4 sm:flex-row sm:items-center">
              <div className="text-lg font-bold sm:text-2xl">
                Trial Question {currentQuestion.question_number} of{" "}
                {MAX_TRIAL_QUESTIONS}
              </div>
              <div className="flex items-center gap-2 text-sm sm:text-base">
                {currentQuestion.difficulty && (
                  <span className="text-gray-500">
                    Difficulty: {currentQuestion.difficulty}/5
                  </span>
                )}
                <span className="text-gray-500">
                  Time: {Math.floor(currentQuestion.time / 60)}:
                  {String(currentQuestion.time % 60).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Question Description */}
            {isLoading ? (
              <div className="flex h-48 w-full items-center justify-center">
                <div className="text-center">
                  <LoaderCircle className="mx-auto mb-2 h-8 w-8 animate-spin text-gray-400" />
                  <p className="text-sm text-gray-500">Loading question...</p>
                </div>
              </div>
            ) : loadingError ? (
              <div className="w-full bg-red-500 px-3 py-2 text-sm text-red-50">
                An error occurred while loading your question, please reload
                your page
              </div>
            ) : (
              <div className="prose w-full max-w-none">
                <ReactMarkdown
                  className="markdown-content"
                  remarkPlugins={[remarkGfm]}
                >
                  {currentQuestion.description}
                </ReactMarkdown>
              </div>
            )}
          </div>

          {/* Answer Options */}
          {!isLoading && !loadingError && (
            <div className="flex-grow">
              {/* Multiple Choice */}
              {currentQuestion.type === "multiple_choice" && (
                <RadioGroup
                  value={userAnswers.multipleChoice}
                  onValueChange={(value) => {
                    setUserAnswers((prev) => ({
                      ...prev,
                      multipleChoice: value,
                    }));
                  }}
                  className="space-y-2"
                >
                  {currentQuestion?.multiple_choice_options.map((option) => (
                    <div
                      key={`${currentQuestion.question_number}-${option}`}
                      className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                    >
                      <RadioGroupItem
                        value={option}
                        id={`${currentQuestion.question_number}-${option}`}
                        checked={option === userAnswers.multipleChoice}
                      />
                      <Label
                        htmlFor={`${currentQuestion.question_number}-${option}`}
                        className="flex-grow text-sm sm:text-lg"
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
                      userAnswers.multipleSelect.includes(option);
                    return (
                      <div
                        key={`${currentQuestion.question_number}-${option}`}
                        className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-gray-50"
                      >
                        <Checkbox
                          id={`${currentQuestion.question_number}-${option}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            let newAnswers;
                            if (checked) {
                              newAnswers = [
                                ...userAnswers.multipleSelect,
                                option,
                              ];
                            } else {
                              newAnswers = userAnswers.multipleSelect.filter(
                                (a) => a !== option,
                              );
                            }
                            setUserAnswers((prev) => ({
                              ...prev,
                              multipleSelect: newAnswers,
                            }));
                          }}
                        />
                        <Label
                          htmlFor={`${currentQuestion.question_number}-${option}`}
                          className="flex-grow text-sm sm:text-lg"
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
                    value={userAnswers.shortAnswer}
                    onChange={(e) => {
                      setUserAnswers((prev) => ({
                        ...prev,
                        shortAnswer: e.target.value,
                      }));
                    }}
                    placeholder="Type your answer here..."
                    className="w-full p-4 text-sm sm:text-lg"
                  />
                </div>
              )}

              {/* True/False */}
              {currentQuestion.type === "true/false" && (
                <RadioGroup
                  value={userAnswers.trueOrFalse}
                  onValueChange={(value) => {
                    setUserAnswers((prev) => ({
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
                        checked={option === userAnswers.trueOrFalse}
                      />
                      <Label
                        htmlFor={`${currentQuestion.question_number}-${option}`}
                        className="flex-grow text-sm sm:text-lg"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>
          )}

          {/* Answer Feedback */}
          {showAnswer && (
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-2 font-semibold">
                Correct Answer: {currentQuestion?.correct_answer?.join(", ")}
              </h3>

              {/* Hints Section */}
              {currentQuestion?.hints?.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-base font-medium">Hints: </h4>
                  <ul className="ml-5 list-disc text-sm text-gray-600">
                    {currentQuestion?.hints?.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Solution Steps Section */}
              {currentQuestion?.solution_steps?.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-base font-medium">Solution: </h4>
                  <ol className="ml-5 list-decimal text-sm text-gray-600">
                    {currentQuestion?.solution_steps?.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Feedback Section */}
              {isAnswerCorrect() ? (
                <div className="mt-2 text-green-600">
                  ✓ Your answer is correct!
                </div>
              ) : (
                <div className="mt-2 text-red-600">
                  × Your answer is incorrect. You selected:{" "}
                  {getUserAnswerText()}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              {currentQuestion.domain && (
                <span className="text-xs text-gray-500 sm:text-sm">
                  Domain: {currentQuestion.domain}
                </span>
              )}
            </div>
            <div>
              {!showAnswer ? (
                <Button
                  disabled={!isAnswerSelected() || isLoading}
                  variant="outline"
                  onClick={handleShowAnswer}
                  className="w-full sm:w-auto"
                >
                  <span>
                    {!isAnswerSelected() ? "Select an answer" : "Check Answer"}
                  </span>
                </Button>
              ) : questionNumber >= MAX_TRIAL_QUESTIONS ? (
                <Dialog
                  open={showEndTrialModal}
                  onOpenChange={setShowEndTrialModal}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex w-full items-center gap-2 sm:w-auto"
                    >
                      Submit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90vh] w-full max-w-full overflow-y-auto px-3 py-3 sm:max-w-md sm:px-4 sm:py-4 md:max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-center text-lg font-bold sm:text-xl">
                        Trial Completed!
                      </DialogTitle>
                      <DialogDescription className="pt-2 text-center text-sm sm:text-base">
                        You&apos;ve completed all {MAX_TRIAL_QUESTIONS} trial
                        questions.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-4 py-4 sm:space-y-6">
                      {/* Score Display */}
                      <div className="w-full">
                        <div className="mb-4 flex items-center justify-center">
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 sm:h-28 sm:w-28">
                            <span className="text-2xl font-bold text-blue-600 sm:text-3xl">
                              {Math.round(
                                (trialResults.correctAnswers /
                                  trialResults.totalAnswered) *
                                  100,
                              )}
                              %
                            </span>
                          </div>
                        </div>

                        <div className="mb-4 rounded-lg bg-gray-100 p-3 sm:p-4">
                          <h3 className="mb-2 text-center text-sm font-semibold sm:text-base">
                            Your Performance
                          </h3>
                          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                            <div className="flex flex-col items-center rounded bg-white p-2">
                              <span className="text-gray-500">Questions</span>
                              <span className="font-bold">
                                {trialResults.totalAnswered}/
                                {MAX_TRIAL_QUESTIONS}
                              </span>
                            </div>
                            <div className="flex flex-col items-center rounded bg-white p-2">
                              <span className="text-gray-500">Correct</span>
                              <span className="font-bold">
                                {trialResults.correctAnswers}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Insights */}
                        <div className="text-xs sm:text-sm">
                          <h4 className="mb-2 font-medium">
                            Performance Insights:
                          </h4>
                          <ul className="list-disc space-y-1 pl-5">
                            {trialResults.correctAnswers ===
                            trialResults.totalAnswered ? (
                              <li className="text-green-600">
                                Perfect score! You&apos;ve mastered the trial
                                questions.
                              </li>
                            ) : trialResults.correctAnswers >=
                              Math.floor(trialResults.totalAnswered * 0.8) ? (
                              <li className="text-green-600">
                                Great job! You demonstrated strong understanding
                                of the concepts.
                              </li>
                            ) : trialResults.correctAnswers >=
                              Math.floor(trialResults.totalAnswered * 0.6) ? (
                              <li className="text-blue-600">
                                Good progress. The full course will help
                                strengthen your knowledge.
                              </li>
                            ) : (
                              <li className="text-orange-600">
                                The full course will provide detailed
                                explanations to help improve your understanding.
                              </li>
                            )}

                            {/* Domain-specific insights if we have domains */}
                            {trialResults.questionHistory.some(
                              (q) => q.domain,
                            ) && (
                              <li>
                                {(() => {
                                  // Find strengths and weaknesses by domain
                                  const domainResults =
                                    trialResults.questionHistory.reduce(
                                      (acc, q) => {
                                        if (q.domain) {
                                          if (!acc[q.domain])
                                            acc[q.domain] = {
                                              correct: 0,
                                              total: 0,
                                            };
                                          acc[q.domain].total++;
                                          if (q.isCorrect)
                                            acc[q.domain].correct++;
                                        }
                                        return acc;
                                      },
                                      {} as Record<
                                        string,
                                        { correct: number; total: number }
                                      >,
                                    );

                                  // Find best and worst domains
                                  let bestDomain = { name: "", score: 0 };
                                  let worstDomain = { name: "", score: 1 };

                                  Object.entries(domainResults).forEach(
                                    ([domain, result]) => {
                                      const score =
                                        result.correct / result.total;
                                      if (score > bestDomain.score)
                                        bestDomain = { name: domain, score };
                                      if (score < worstDomain.score)
                                        worstDomain = { name: domain, score };
                                    },
                                  );

                                  if (
                                    bestDomain.name &&
                                    worstDomain.name &&
                                    bestDomain.name !== worstDomain.name
                                  ) {
                                    return `Strongest in ${bestDomain.name}, could improve in ${worstDomain.name}.`;
                                  } else if (bestDomain.name) {
                                    return `Showed good understanding of ${bestDomain.name}.`;
                                  }

                                  return "The full course covers all domains in detail.";
                                })()}
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="rounded-full bg-blue-100 p-3">
                        <ShoppingCart className="h-8 w-8 text-blue-600 sm:h-10 sm:w-10" />
                      </div>
                      <div className="space-y-2 text-center">
                        <h3 className="text-sm font-medium sm:text-base">
                          Ready to unlock the full experience?
                        </h3>
                        <p className="text-xs text-gray-500 sm:text-sm">
                          Purchase the full course to access all questions,
                          detailed solutions, personalized progress tracking,
                          and much more!
                        </p>
                      </div>
                    </div>

                    <DialogFooter className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center sm:space-x-2">
                      <Button
                        variant="outline"
                        onClick={handlePurchaseCourse}
                        className="w-full sm:w-auto"
                      >
                        Maybe Later
                      </Button>
                      <Button
                        onClick={handlePurchaseCourse}
                        className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
                      >
                        Purchase Full Course
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleNextQuestion}
                  className="flex w-full items-center gap-2 sm:w-auto"
                >
                  <span>Next Question</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* End Trial Modal */}
    </div>
  );
}
