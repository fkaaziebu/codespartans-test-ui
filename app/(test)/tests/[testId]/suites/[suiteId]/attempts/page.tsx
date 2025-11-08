"use client";
import axios from "axios";
import { Eye, LoaderCircle, Pause, Play } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { useFinishAttemptBannerUpdate } from "@/hooks/use-action-store";
export default function TestSuiteAttemptsPage() {
  const [isRoutingToAttemptPage, setIsRoutingToAttemptPage] = useState(false);
  const [isLoadingSuiteAttempts, setIsLoadingSuiteAttempts] = useState(false);
  const [testSuiteAttempts, setTestSuiteAttempts] = useState<
    Array<{
      attempt_id: string;
      status: number;
      analytics: {
        score: number;
        completed_at: string;
      };
    }>
  >([]);
  const [isLoadingTestAttemptStart, setIsLoadingTestAttemptStart] =
    useState(false);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const testId = searchParams.get("testId");
  const mode = searchParams.get("mode");
  const courseId = pathname.split("/")[pathname.split("/").length - 4];
  const suiteId = pathname.split("/")[pathname.split("/").length - 2];
  const totalQuestions = searchParams.get("totalQuestions");
  // const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const baseUrl = "http://localhost:3004/v1";
  const { resetUserFinished } = useFinishAttemptBannerUpdate();

  const getTestSuiteAttempts = async () => {
    try {
      setIsLoadingSuiteAttempts(true);
      const response = await axios.get(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/attempts?mode=${mode}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setTestSuiteAttempts(response.data);
    } catch (error) {
      toast({
        title: "An error occured while loading attempt history",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingSuiteAttempts(false);
    }
  };

  const startTestAttempt = async () => {
    try {
      resetUserFinished();
      setIsLoadingTestAttemptStart(true);
      const response = await axios.post(
        `${baseUrl}/simulation/tests/${testId}/suites/${suiteId}/start-attempt?mode=${mode}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        },
      );

      setIsRoutingToAttemptPage(true);

      router.push(
        `attempts/${response.data.attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`,
      );
    } catch (error) {
      toast({
        title: "An error occured while starting attempt",
        // @ts-expect-error known error
        description: error?.response?.data?.message,
        variant: "destructive",
      });
    } finally {
      setIsLoadingTestAttemptStart(false);
    }
  };

  const getAnalyticsScore = (score: number) => {
    return score === undefined ? "--" : `${Math.round(score)}%`;
  };

  const onContinueAttempt = (attemptId: string) => {
    router.push(
      `attempts/${attemptId}?mode=${mode}&testId=${testId}&totalQuestions=${totalQuestions}`,
    );
  };

  const onViewStats = (attemptId: string) => {
    router.push(`attempts/${attemptId}/stats?mode=${mode}&testId=${testId}`);
  };

  useEffect(() => {
    if (!sessionStorage.getItem("token")) {
      router.push("/individual/login");
    }
    getTestSuiteAttempts();
  }, []);
  return (
    <>
      {isLoadingTestAttemptStart && (
        <div className="fixed z-30 flex h-screen w-screen flex-col items-center justify-center gap-5 rounded-lg border border-gray-200/20 bg-gray-500/50 shadow-lg backdrop-blur-md backdrop-filter">
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
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex max-w-screen-xl flex-col gap-5 py-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <Link href={`/tests/${courseId}/suites`} className="underline">
                Back to suites page
              </Link>
            </div>
            <div>
              <Button
                className="flex items-center gap-4 bg-gray-900 px-2 py-2 text-gray-300 hover:bg-gray-950"
                onClick={startTestAttempt}
              >
                Take Test{" "}
                {!isLoadingTestAttemptStart ? (
                  <Play className="h-4 w-4 text-gray-300" />
                ) : (
                  <LoaderCircle className="h-4 w-4 animate-spin text-gray-300" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!isLoadingSuiteAttempts ? (
        <div className="mx-auto my-4 w-full max-w-screen-xl rounded-xl border border-gray-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attempt</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testSuiteAttempts.map((attempt, index) => (
                <TableRow key={attempt.attempt_id}>
                  <TableCell className="font-medium">
                    Attempt {testSuiteAttempts.length - index}
                  </TableCell>
                  <TableCell>
                    {getAnalyticsScore(attempt.analytics.score)}
                  </TableCell>
                  <TableCell>
                    {attempt.analytics.completed_at
                      ? new Date(
                          attempt.analytics.completed_at,
                        ).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {/* Show continue button for ongoing/paused attempts */}
                      {(attempt.status === 1 || attempt.status === 3) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onContinueAttempt(attempt.attempt_id)}
                        >
                          {attempt.status === 1 ? (
                            <Play className="h-4 w-4" />
                          ) : (
                            <Pause className="h-4 w-4" />
                          )}
                        </Button>
                      )}

                      {/* Show stats button only for completed attempts */}
                      {attempt.status === 2 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewStats(attempt.attempt_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
