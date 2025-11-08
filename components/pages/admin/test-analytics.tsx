// components/TestAnalytics.tsx
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChevronDownIcon, FilterIcon, DownloadIcon } from "lucide-react";

const TestAnalytics: React.FC = () => {
  const [activeView, setActiveView] = useState<
    "overview" | "detailed" | "student"
  >("overview");

  // Mock data for analytics
  const overviewData = [
    { name: "Week 1", avgScore: 78, completionRate: 85, passRate: 75 },
    { name: "Week 2", avgScore: 72, completionRate: 80, passRate: 70 },
    { name: "Week 3", avgScore: 85, completionRate: 90, passRate: 80 },
    { name: "Week 4", avgScore: 81, completionRate: 75, passRate: 78 },
    { name: "Week 5", avgScore: 79, completionRate: 82, passRate: 74 },
    { name: "Week 6", avgScore: 88, completionRate: 87, passRate: 85 },
  ];

  const questionData = [
    {
      id: 1,
      question: "Variable declaration in JavaScript",
      avgTime: 45,
      successRate: 85,
    },
    {
      id: 2,
      question: "Function parameters and arguments",
      avgTime: 60,
      successRate: 75,
    },
    {
      id: 3,
      question: "Array manipulation methods",
      avgTime: 90,
      successRate: 65,
    },
    {
      id: 4,
      question: "Object-oriented programming concepts",
      avgTime: 120,
      successRate: 60,
    },
    {
      id: 5,
      question: "DOM manipulation techniques",
      avgTime: 75,
      successRate: 70,
    },
  ];

  const studentData = [
    {
      id: 1,
      name: "Jane Smith",
      completedTests: 8,
      avgScore: 85,
      lastActivity: "1 day ago",
    },
    {
      id: 2,
      name: "John Davis",
      completedTests: 6,
      avgScore: 78,
      lastActivity: "2 days ago",
    },
    {
      id: 3,
      name: "Emma Wilson",
      completedTests: 9,
      avgScore: 92,
      lastActivity: "5 hours ago",
    },
    {
      id: 4,
      name: "Michael Brown",
      completedTests: 7,
      avgScore: 75,
      lastActivity: "3 days ago",
    },
    {
      id: 5,
      name: "Sarah Johnson",
      completedTests: 5,
      avgScore: 81,
      lastActivity: "1 week ago",
    },
  ];

  const distributionData = [
    { name: "90-100%", value: 25 },
    { name: "80-89%", value: 35 },
    { name: "70-79%", value: 20 },
    { name: "60-69%", value: 15 },
    { name: "Below 60%", value: 5 },
  ];

  const COLORS = ["#4f46e5", "#60a5fa", "#10b981", "#f59e0b", "#ef4444"];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Test Analytics</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50">
            <FilterIcon size={16} />
            Filter
          </button>
          <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50">
            <DownloadIcon size={16} />
            Export
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <div className="flex space-x-4">
            <button
              className={`rounded-md px-4 py-2 ${activeView === "overview" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
              onClick={() => setActiveView("overview")}
            >
              Overview
            </button>
            <button
              className={`rounded-md px-4 py-2 ${activeView === "detailed" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
              onClick={() => setActiveView("detailed")}
            >
              Detailed Analytics
            </button>
            <button
              className={`rounded-md px-4 py-2 ${activeView === "student" ? "bg-blue-100 text-blue-700" : "text-gray-700"}`}
              onClick={() => setActiveView("student")}
            >
              Student Level
            </button>
          </div>
          <div className="flex items-center">
            <span className="mr-2 text-sm text-gray-500">Time Period:</span>
            <div className="relative">
              <button className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-gray-800">
                Last 6 Weeks
                <ChevronDownIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview View */}
      {activeView === "overview" && (
        <>
          {/* Metric Cards */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-2 text-sm font-medium text-gray-500">
                Average Score
              </h2>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">82%</h3>
                  <span className="flex items-center text-xs text-green-600">
                    +4% from previous period
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-2 text-sm font-medium text-gray-500">
                Completion Rate
              </h2>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">78%</h3>
                  <span className="flex items-center text-xs text-red-600">
                    -2% from previous period
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-2 text-sm font-medium text-gray-500">
                Pass Rate
              </h2>
              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-800">75%</h3>
                  <span className="flex items-center text-xs text-green-600">
                    +5% from previous period
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-800">
                Trends Over Time
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={overviewData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="avgScore"
                      name="Avg Score"
                      stroke="#4f46e5"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="completionRate"
                      name="Completion Rate"
                      stroke="#10b981"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="passRate"
                      name="Pass Rate"
                      stroke="#f59e0b"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-lg font-medium text-gray-800">
                Score Distribution
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {distributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detailed Analytics View */}
      {activeView === "detailed" && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">
              Question Performance
            </h2>
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-500">Test Bundle:</span>
              <div className="relative">
                <button className="flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1 text-gray-800">
                  JavaScript Fundamentals
                  <ChevronDownIcon size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Question
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Avg. Time (sec)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Success Rate
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {questionData.map((question) => (
                  <tr key={question.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {question.question}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {question.avgTime} sec
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-2.5 w-full rounded-full bg-gray-200">
                          <div
                            className="h-2.5 rounded-full bg-blue-600"
                            style={{ width: `${question.successRate}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {question.successRate}%
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <button className="text-blue-600 hover:text-blue-800">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-lg font-medium text-gray-800">
              Common Mistakes
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-medium text-gray-800">
                  Variable Scope Understanding
                </h3>
                <p className="text-sm text-gray-600">
                  45% of students struggle with understanding variable scope in
                  JavaScript functions.
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-medium text-gray-800">
                  Callback Functions
                </h3>
                <p className="text-sm text-gray-600">
                  38% of students have difficulty implementing callback
                  functions correctly.
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-medium text-gray-800">
                  Asynchronous Code
                </h3>
                <p className="text-sm text-gray-600">
                  52% of students have issues with async/await and Promise
                  concepts.
                </p>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-2 font-medium text-gray-800">
                  DOM Event Handling
                </h3>
                <p className="text-sm text-gray-600">
                  35% of students make errors when implementing event handlers
                  and propagation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Student Level View */}
      {activeView === "student" && (
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-800">
              Student Performance
            </h2>
            <input
              type="text"
              placeholder="Search students..."
              className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Student
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Completed Tests
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Avg. Score
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Last Activity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {studentData.map((student) => (
                  <tr key={student.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {student.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.completedTests}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.avgScore}%
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {student.lastActivity}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      <button className="mr-3 text-blue-600 hover:text-blue-800">
                        View Profile
                      </button>
                      <button className="text-blue-600 hover:text-blue-800">
                        Assign Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <h2 className="mb-4 text-lg font-medium text-gray-800">
              Performance Details - Sarah Johnson
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { test: "Test 1", score: 75 },
                      { test: "Test 2", score: 82 },
                      { test: "Test 3", score: 78 },
                      { test: "Test 4", score: 85 },
                      { test: "Test 5", score: 81 },
                    ]}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis dataKey="test" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      name="Score"
                      stroke="#4f46e5"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <h3 className="mb-3 font-medium text-gray-800">
                  Strengths & Weaknesses
                </h3>
                <div className="mb-3">
                  <h4 className="mb-1 text-sm font-medium text-gray-700">
                    Strengths
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>Strong in data structure concepts</li>
                    <li>Excellent debugging skills</li>
                    <li>Good understanding of OOP principles</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-medium text-gray-700">
                    Areas for Improvement
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>Algorithm optimization</li>
                    <li>Asynchronous programming concepts</li>
                    <li>Advanced CSS techniques</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAnalytics;
