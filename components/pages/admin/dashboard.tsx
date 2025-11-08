// components/Dashboard.tsx
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  ChevronUpIcon,
  ChevronDownIcon,
  BarChartIcon,
  UsersIcon,
  FileTextIcon,
  CheckCircleIcon,
} from "lucide-react";

interface DashboardProps {
  userRole: "instructor" | "admin";
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  // Mock data for charts
  const revenueData = [
    { name: "Jan", value: 40 },
    { name: "Feb", value: 30 },
    { name: "Mar", value: 45 },
    { name: "Apr", value: 35 },
    { name: "May", value: 55 },
    { name: "Jun", value: 40 },
    { name: "Jul", value: 60 },
    { name: "Aug", value: 45 },
    { name: "Sep", value: 70 },
    { name: "Oct", value: 55 },
    { name: "Nov", value: 50 },
    { name: "Dec", value: 65 },
  ];

  const completionData = [
    { name: "Week 1", completed: 85, inProgress: 15 },
    { name: "Week 2", completed: 75, inProgress: 25 },
    { name: "Week 3", completed: 90, inProgress: 10 },
    { name: "Week 4", completed: 65, inProgress: 35 },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Course assigned",
      subject: "Introduction to Python",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: 2,
      action: "Test completed",
      subject: "JavaScript Basics",
      time: "4 hours ago",
      status: "success",
    },
    {
      id: 3,
      action: "Comment added",
      subject: "Data Structures Quiz",
      time: "1 day ago",
      status: "info",
    },
    {
      id: 4,
      action: "Course approved",
      subject: "Web Development 101",
      time: "2 days ago",
      status: "success",
    },
    {
      id: 5,
      action: "New student added",
      subject: "Machine Learning",
      time: "3 days ago",
      status: "info",
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Dashboard</h1>

      {/* Metric Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Active Students
            </span>
            <span className="rounded-full bg-blue-50 p-2">
              <UsersIcon size={20} className="text-blue-600" />
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">245</h3>
              <span className="flex items-center text-xs text-green-600">
                <ChevronUpIcon size={16} />
                <span>12% from last month</span>
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Tests Assigned
            </span>
            <span className="rounded-full bg-purple-50 p-2">
              <FileTextIcon size={20} className="text-purple-600" />
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">56</h3>
              <span className="flex items-center text-xs text-green-600">
                <ChevronUpIcon size={16} />
                <span>8% from last month</span>
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Tests in Progress
            </span>
            <span className="rounded-full bg-orange-50 p-2">
              <BarChartIcon size={20} className="text-orange-600" />
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">32</h3>
              <span className="flex items-center text-xs text-red-600">
                <ChevronDownIcon size={16} />
                <span>3% from last month</span>
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Completion Rate
            </span>
            <span className="rounded-full bg-green-50 p-2">
              <CheckCircleIcon size={20} className="text-green-600" />
            </span>
          </div>
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-800">78%</h3>
              <span className="flex items-center text-xs text-green-600">
                <ChevronUpIcon size={16} />
                <span>5% from last month</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700">
            {userRole === "instructor" ? "Create Course" : "Assign Test"}
          </button>
          <button className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
            Manage Students
          </button>
          <button className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
            View Analytics
          </button>
          {userRole === "instructor" && (
            <button className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
              Add Questions
            </button>
          )}
          {userRole === "admin" && (
            <button className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200">
              Review Courses
            </button>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Performance Trends
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            Test Completion Status
          </h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={completionData}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="completed" stackId="a" fill="#4f46e5" />
                <Bar dataKey="inProgress" stackId="a" fill="#e5e7eb" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          Recent Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Action
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Subject
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Time
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
              {recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {activity.action}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {activity.subject}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {activity.time}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    {activity.status === "success" ? (
                      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                        Info
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
