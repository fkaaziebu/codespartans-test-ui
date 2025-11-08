"use client";
import { AdvancedTestPerformance } from "@/app/types/analytics";
import { Clock, Award, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  LineChart,
  CartesianGrid,
  XAxis,
  Line,
} from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { type ChartConfig } from "@/components/ui/chart";

export const AnalyticsDashboard: React.FC<{
  performance: AdvancedTestPerformance;
}> = ({ performance }) => {
  const pieData = performance.domainScores.map((domain) => ({
    name: domain.domain,
    value: domain.score,
    color: domain.color,
  }));

  const chartConfig = {
    domains: {
      label: "domain",
      color: "#7C3AED",
    },
  } satisfies ChartConfig;

  return (
    <div className="max-w-7xl my-2 mx-auto flex-col space-y-8 no-scrollbar px-4 sm:px-6 lg:px-8  mb-4 md:my-6">
      <h1 className="text-xl font-medium mb-4 md:text-2xl md:font-bold md:mb-8">
        Test Performance Analytics
      </h1>

      {/* Overall Time card */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-4">
          <div className="w-full flex gap-8">
            <div className="w-full bg-purple-100 p-4 rounded-md ">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Score</p>
                <h3 className="text-2xl font-bold">
                  {performance.overallScore}%
                </h3>
              </div>
            </div>
            <div className="w-full bg-purple-100 p-4 rounded-md">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Time</p>
                <h3 className="text-2xl font-bold">{performance.totalTime}</h3>
              </div>
            </div>
          </div>
        </CardContent>
        {/* Time Performance card */}
        <CardContent>
          <h2 className="text-lg font-semibold mb-6">
            Time Performance Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm text-gray-600 mb-2 ">
                Average Time per Question
              </h3>
              <div className="flex items-center gap-2 w-full">
                <Timer className="w-5 h-5 text-indigo-600" />
                <span className="text-xl font-bold">
                  {Math.round(performance.timeAnalytics.averageTimePerQuestion)}{" "}
                  sec
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm text-gray-600 mb-6">Fastest Question</h3>
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-green-600" />
                <span className="text-xl font-bold">
                  {performance.timeAnalytics.fastestQuestion.timeSpent} sec
                </span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm text-gray-600 mb-6">Slowest Question</h3>
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-red-600" />
                <span className="text-xl font-bold">
                  {performance.timeAnalytics.slowestQuestion.timeSpent} sec
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="text-lg font-semibold mb-6">Domain Performance</h2>
          <div className="space-y-6">
            {performance.domainScores.map((domain) => (
              <div key={domain.domain}>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">{domain.domain}</span>
                  <span className="text-sm text-gray-600">
                    {domain.correctAnswers}/{domain.totalQuestions} questions
                  </span>
                </div>
                <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${domain.score}%`,
                      backgroundColor: domain.color,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold">{domain.score}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-center gap-4">
        <Card className="bg-gray-50 w-full">
          <CardContent className="justify-center items-center pt-4">
            <ChartContainer
              config={chartConfig}
              className="mx-auto  max-h-[300px]"
            >
              <RadarChart data={pieData}>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent color="purple" />}
                />
                <PolarAngleAxis dataKey="name" color="black" />
                <PolarGrid />
                <Radar
                  dataKey="value"
                  fill="var(--color-domains)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="w-full hidden md:block">
          <CardContent>
            <div className="pt-4">
              <h3 className="text-md font-bold mb-1 lg:text-lg lg:font-semibold lg:mb-2">
                Performance History
              </h3>
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={pieData}
                  margin={{
                    left: 44,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={true}
                    axisLine={true}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent />}
                  />
                  <Line
                    dataKey="value"
                    type="natural"
                    stroke="var(--color-domains)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-domains)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
export default AnalyticsDashboard;
