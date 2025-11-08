// components/StudentManagement.tsx
import React, { useState } from "react";
import {
  SearchIcon,
  FilterIcon,
  UserIcon,
  // ChevronDownIcon,
  MoreHorizontalIcon,
  // LineChart,
  // Line,
  // XAxis,
  // YAxis,
  // CartesianGrid,
  // Tooltip,
  // ResponsiveContainer,
} from "lucide-react";

interface Student {
  id: number;
  name: string;
  email: string;
  status: "active" | "inactive";
  assignedTests: number;
  completedTests: number;
  lastActivity: string;
  avgScore: number;
}

const StudentManagement: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Mock student data
  const students: Student[] = [
    {
      id: 1,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      status: "active",
      assignedTests: 12,
      completedTests: 8,
      lastActivity: "1 day ago",
      avgScore: 85,
    },
    {
      id: 2,
      name: "John Davis",
      email: "john.davis@example.com",
      status: "active",
      assignedTests: 10,
      completedTests: 6,
      lastActivity: "2 days ago",
      avgScore: 78,
    },
    {
      id: 3,
      name: "Emma Wilson",
      email: "emma.wilson@example.com",
      status: "active",
      assignedTests: 15,
      completedTests: 9,
      lastActivity: "5 hours ago",
      avgScore: 92,
    },
    {
      id: 4,
      name: "Michael Brown",
      email: "michael.brown@example.com",
      status: "inactive",
      assignedTests: 8,
      completedTests: 7,
      lastActivity: "3 days ago",
      avgScore: 75,
    },
    {
      id: 5,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      status: "active",
      assignedTests: 9,
      completedTests: 5,
      lastActivity: "1 week ago",
      avgScore: 81,
    },
  ];

  // Handler to select a student for detailed view
  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  // Performance data for the selected student
  const studentPerformanceData = [
    { test: "JavaScript Fundamentals", score: 85, date: "Mar 15, 2025" },
    { test: "Web Development Basics", score: 78, date: "Mar 05, 2025" },
    { test: "React Components", score: 92, date: "Feb 25, 2025" },
    { test: "CSS Layouts", score: 75, date: "Feb 15, 2025" },
    { test: "Node.js Basics", score: 88, date: "Feb 05, 2025" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Student Management
        </h1>
        <button className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
          Add New Student
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select className="appearance-none rounded-md border border-gray-300 py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <FilterIcon
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
            <div className="relative">
              <select className="appearance-none rounded-md border border-gray-300 py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">All Tests</option>
                <option value="assigned">Assigned Tests</option>
                <option value="completed">Completed Tests</option>
                <option value="pending">Pending Tests</option>
              </select>
              <FilterIcon
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
            <div className="relative">
              <select className="appearance-none rounded-md border border-gray-300 py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Activity Date</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
              <FilterIcon
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Student List */}
        <div className="lg:col-span-1">
          <div className="h-full overflow-hidden rounded-lg bg-white shadow">
            <div className="border-b border-gray-200 bg-gray-50 p-4">
              <h2 className="text-lg font-medium text-gray-800">Students</h2>
            </div>
            <div className="max-h-[600px] divide-y divide-gray-200 overflow-y-auto">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
                    selectedStudent?.id === student.id ? "bg-blue-50" : ""
                  }`}
                  onClick={() => handleViewStudent(student)}
                >
                  <div className="flex items-center">
                    <div className="mr-3 flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                        <UserIcon size={20} className="text-gray-500" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {student.name}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {student.email}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          student.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {student.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Last active: {student.lastActivity}</span>
                    <span>
                      {student.completedTests}/{student.assignedTests} tests
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Student Details */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="h-full rounded-lg bg-white shadow">
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
                <h2 className="text-lg font-medium text-gray-800">
                  {selectedStudent.name} - Performance Details
                </h2>
                <div className="flex gap-2">
                  <button className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
                    Message
                  </button>
                  <button className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                    Assign Test
                  </button>
                  <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <MoreHorizontalIcon size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Student Info */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div className="rounded-md bg-gray-50 p-4">
                    <p className="mb-1 text-xs text-gray-500">Status</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedStudent.status === "active"
                        ? "Active"
                        : "Inactive"}
                    </p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-4">
                    <p className="mb-1 text-xs text-gray-500">
                      Completion Rate
                    </p>
                    <p className="text-lg font-semibold text-gray-800">
                      {Math.round(
                        (selectedStudent.completedTests /
                          selectedStudent.assignedTests) *
                          100,
                      )}
                      %
                    </p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-4">
                    <p className="mb-1 text-xs text-gray-500">Average Score</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedStudent.avgScore}%
                    </p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-4">
                    <p className="mb-1 text-xs text-gray-500">Last Activity</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {selectedStudent.lastActivity}
                    </p>
                  </div>
                </div>

                {/* Performance Over Time Chart */}
                <div className="mb-6">
                  <h3 className="text-md mb-3 font-medium text-gray-700">
                    Performance Over Time
                  </h3>
                  <div className="h-64 rounded-md border border-gray-200 bg-white p-4">
                    <div className="h-full">
                      {/* This would be a recharts component in a real application */}
                      <div className="flex h-full items-center justify-center text-gray-500">
                        [Performance Trend Line Chart]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completed Tests */}
                <div className="mb-6">
                  <h3 className="text-md mb-3 font-medium text-gray-700">
                    Test Performance
                  </h3>
                  <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Test Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Score
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {studentPerformanceData.map((test, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                              {test.test}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {test.score}%
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              {test.date}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  test.score >= 80
                                    ? "bg-green-100 text-green-800"
                                    : test.score >= 70
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                }`}
                              >
                                {test.score >= 80
                                  ? "Excellent"
                                  : test.score >= 70
                                    ? "Good"
                                    : "Needs Improvement"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assigned Tests */}
                <div>
                  <h3 className="text-md mb-3 font-medium text-gray-700">
                    Pending Tests
                  </h3>
                  <div className="rounded-md bg-gray-50 p-6 text-center">
                    <p className="mb-2 text-gray-500">
                      JavaScript Advanced Concepts
                    </p>
                    <p className="mb-2 text-gray-500">
                      Database Design Principles
                    </p>
                    <p className="text-gray-500">UI/UX Fundamentals</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg bg-white p-6 shadow">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <UserIcon size={32} className="text-gray-400" />
                </div>
                <h3 className="mb-1 text-lg font-medium text-gray-700">
                  Select a Student
                </h3>
                <p className="text-gray-500">
                  Select a student from the list to view detailed performance
                  metrics.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentManagement;
