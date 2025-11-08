// components/TestAssignment.tsx
import React, { useState } from "react";
import {
  Search,
  Filter,
  Calendar,
  Users,
  Check,
  X,
  ChevronDown,
  Download,
  Clock,
} from "lucide-react";

interface TestBundle {
  id: number;
  title: string;
  subject: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  questions: number;
  estimatedTime: string;
  lastUpdated: string;
}

interface StudentGroup {
  id: number;
  name: string;
  students: number;
}

interface Assignment {
  id: number;
  testTitle: string;
  assignedTo: string;
  assignedType: "group" | "individual";
  studentsCount: number;
  assignedDate: string;
  dueDate: string;
  status: "active" | "completed" | "in-progress";
}

const TestAssignment: React.FC = () => {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestBundle | null>(null);
  const [assignmentType, setAssignmentType] = useState<"group" | "individual">(
    "group",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");

  // Mock data for test bundles
  const testBundles: TestBundle[] = [
    {
      id: 1,
      title: "JavaScript Fundamentals",
      subject: "Programming",
      difficulty: "Beginner",
      questions: 25,
      estimatedTime: "45 mins",
      lastUpdated: "1 week ago",
    },
    {
      id: 2,
      title: "Advanced Data Structures",
      subject: "Computer Science",
      difficulty: "Advanced",
      questions: 40,
      estimatedTime: "90 mins",
      lastUpdated: "3 days ago",
    },
    {
      id: 3,
      title: "React Basics",
      subject: "Web Development",
      difficulty: "Intermediate",
      questions: 30,
      estimatedTime: "60 mins",
      lastUpdated: "2 weeks ago",
    },
    {
      id: 4,
      title: "SQL Queries",
      subject: "Database",
      difficulty: "Intermediate",
      questions: 35,
      estimatedTime: "75 mins",
      lastUpdated: "5 days ago",
    },
    {
      id: 5,
      title: "Python for Beginners",
      subject: "Programming",
      difficulty: "Beginner",
      questions: 20,
      estimatedTime: "40 mins",
      lastUpdated: "1 month ago",
    },
  ];

  // Mock data for student groups
  const studentGroups: StudentGroup[] = [
    { id: 1, name: "Web Development Cohort", students: 25 },
    { id: 2, name: "Data Science Group", students: 18 },
    { id: 3, name: "Mobile App Development", students: 22 },
    { id: 4, name: "AI/ML Workshop", students: 15 },
  ];

  // Mock data for recent assignments
  const recentAssignments: Assignment[] = [
    {
      id: 1,
      testTitle: "JavaScript Fundamentals",
      assignedTo: "Web Development Cohort",
      assignedType: "group",
      studentsCount: 25,
      assignedDate: "Mar 20, 2025",
      dueDate: "Mar 25, 2025",
      status: "active",
    },
    {
      id: 2,
      testTitle: "Python for Beginners",
      assignedTo: "Data Science Group",
      assignedType: "group",
      studentsCount: 18,
      assignedDate: "Mar 18, 2025",
      dueDate: "Mar 24, 2025",
      status: "active",
    },
    {
      id: 3,
      testTitle: "Advanced Data Structures",
      assignedTo: "Emma Wilson",
      assignedType: "individual",
      studentsCount: 1,
      assignedDate: "Mar 15, 2025",
      dueDate: "Mar 22, 2025",
      status: "in-progress",
    },
    {
      id: 4,
      testTitle: "SQL Queries",
      assignedTo: "AI/ML Workshop",
      assignedType: "group",
      studentsCount: 15,
      assignedDate: "Mar 12, 2025",
      dueDate: "Mar 19, 2025",
      status: "completed",
    },
  ];

  // Filter test bundles based on search and filters
  const filteredTestBundles = testBundles.filter((test) => {
    const matchesSearch = test.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject
      ? test.subject === selectedSubject
      : true;
    const matchesDifficulty = selectedDifficulty
      ? test.difficulty === selectedDifficulty
      : true;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  // Get unique subjects
  const subjects = Array.from(new Set(testBundles.map((test) => test.subject)));
  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  // Handler to open assignment modal for a specific test
  const handleAssignTest = (test: TestBundle) => {
    setSelectedTest(test);
    setIsAssignModalOpen(true);
  };

  // Handler to close modal
  const handleCloseModal = () => {
    setIsAssignModalOpen(false);
    setSelectedTest(null);
    setAssignmentType("group");
  };

  // Handler to confirm assignment
  const handleConfirmAssignment = () => {
    // In a real app, this would call an API to create the assignment
    console.log("Assignment confirmed", {
      test: selectedTest,
      type: assignmentType,
      // Other form data would be collected here
    });

    // Close the modal
    handleCloseModal();
  };

  // Format today's date as YYYY-MM-DD for the date input
  const today = new Date().toISOString().split("T")[0];
  // Default due date (7 days from today)
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 7);
  const defaultDueDateStr = defaultDueDate.toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Test Assignment
        </h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-700 hover:bg-gray-50">
            <Download size={16} />
            Export Assignments
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search test bundles..."
              className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <select
                className="appearance-none rounded-md border border-gray-300 py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
              <Filter
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
            <div className="relative">
              <select
                className="appearance-none rounded-md border border-gray-300 py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
              >
                <option value="">All Difficulties</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
              <Filter
                className="absolute left-3 top-2.5 text-gray-400"
                size={18}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Test Bundles */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="text-lg font-medium text-gray-800">
            Available Test Bundles
          </h2>
          <span className="text-sm text-gray-500">
            {filteredTestBundles.length} test bundles available
          </span>
        </div>
        {filteredTestBundles.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredTestBundles.map((test) => (
              <div
                key={test.id}
                className="p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-md font-medium text-gray-800">
                      {test.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                        {test.subject}
                      </span>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800">
                        {test.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>{test.questions} Questions</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{test.estimatedTime}</span>
                      </span>
                      <span>Updated {test.lastUpdated}</span>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => handleAssignTest(test)}
                      className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    >
                      Assign Test
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              No test bundles match your filters. Try adjusting your search
              criteria.
            </p>
          </div>
        )}
      </div>

      {/* Recent Assignments */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
          <h2 className="text-lg font-medium text-gray-800">
            Recent Assignments
          </h2>
          <div className="relative">
            <select className="rounded-md border border-gray-300 bg-white py-1 pl-4 pr-8 text-sm">
              <option value="all">All Assignments</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1.5 text-gray-400"
              size={16}
            />
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
                  Test Bundle
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Assigned To
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Assigned Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Due Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                >
                  Status
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
              {recentAssignments.map((assignment) => (
                <tr
                  key={assignment.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    {assignment.testTitle}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-col">
                      <span>{assignment.assignedTo}</span>
                      <span className="text-xs text-gray-400">
                        {assignment.assignedType === "group"
                          ? `${assignment.studentsCount} students`
                          : "Individual"}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {assignment.assignedDate}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {assignment.dueDate}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        assignment.status === "active"
                          ? "bg-green-100 text-green-800"
                          : assignment.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {assignment.status === "active"
                        ? "Active"
                        : assignment.status === "in-progress"
                          ? "In Progress"
                          : "Completed"}
                    </span>
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
      </div>

      {/* Assign Test Modal */}
      {isAssignModalOpen && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Assign Test: {selectedTest.title}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Assignment Type
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assignmentType"
                    className="h-4 w-4 text-blue-600"
                    checked={assignmentType === "group"}
                    onChange={() => setAssignmentType("group")}
                  />
                  <span className="ml-2">Assign to Group</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="assignmentType"
                    className="h-4 w-4 text-blue-600"
                    checked={assignmentType === "individual"}
                    onChange={() => setAssignmentType("individual")}
                  />
                  <span className="ml-2">Assign to Individual</span>
                </label>
              </div>
            </div>

            {assignmentType === "group" ? (
              <div className="mb-4">
                <label
                  htmlFor="student-group"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Student Group
                </label>
                <select
                  id="student-group"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a group</option>
                  {studentGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.students} students)
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="mb-4">
                <label
                  htmlFor="student-search"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Search Student
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="student-search"
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by name or email..."
                  />
                  <Search
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                </div>
                <div className="mt-2 rounded-md bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <Users size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Emma Wilson</p>
                      <p className="text-xs text-gray-500">
                        emma.wilson@example.com
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="assignment-date"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Assignment Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="assignment-date"
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={today}
                  />
                  <Calendar
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="due-date"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="due-date"
                    className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue={defaultDueDateStr}
                  />
                  <Calendar
                    className="absolute left-3 top-2.5 text-gray-400"
                    size={18}
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="instructions"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Instructions (Optional)
              </label>
              <textarea
                id="instructions"
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add any specific instructions for students..."
              ></textarea>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="flex items-center gap-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                <Check size={16} />
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAssignment;
