"use client";
import React, { useState } from "react";
import Dashboard from "@/components/pages/admin/dashboard";
import Courses from "@/components/pages/admin/courses";
import TestAnalytics from "@/components/pages/admin/test-analytics";
import TestAssignment from "@/components/pages/admin/test-assignment";
import StudentManagement from "@/components/pages/admin/student-management";
import Navbar from "@/components/pages/admin/navbar";
import { PlusIcon } from "lucide-react";

// Define tab types
type TabType =
  | "dashboard"
  | "courses"
  | "test-analytics"
  | "test-assignment"
  | "student-management";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [userRole, setUserRole] = useState<"instructor" | "admin">(
    "instructor",
  );

  // Function to toggle between instructor and admin roles (for demo purposes)
  const toggleRole = () => {
    setUserRole(userRole === "instructor" ? "admin" : "instructor");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} onToggleRole={toggleRole} />

      {/* Tabs */}
      <div className="container mx-auto px-4">
        <div className="mt-6 flex border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "dashboard"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "courses"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("courses")}
          >
            Courses
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "test-analytics"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("test-analytics")}
          >
            Test Analytics
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "test-assignment"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("test-assignment")}
          >
            Test Assignment
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "student-management"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("student-management")}
          >
            Student Management
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === "dashboard" && <Dashboard userRole={userRole} />}
          {activeTab === "courses" && <Courses userRole={userRole} />}
          {activeTab === "test-analytics" && <TestAnalytics />}
          {activeTab === "test-assignment" && <TestAssignment />}
          {activeTab === "student-management" && <StudentManagement />}
        </div>
      </div>

      {/* Universal Action Button */}
      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700">
        <PlusIcon size={24} />
      </button>
    </div>
  );
};

export default App;
