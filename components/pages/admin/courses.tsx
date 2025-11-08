// components/Courses.tsx
import React, { useState } from "react";
import { EditIcon, EyeIcon, CheckIcon, MessageSquareIcon } from "lucide-react";

interface CourseProps {
  userRole: "instructor" | "admin";
}

interface Course {
  id: number;
  title: string;
  questions: number;
  students: number;
  createdDate: string;
  status: "unassigned" | "assigned" | "approved";
}

const Courses: React.FC<CourseProps> = ({ userRole }) => {
  // Mock course data
  const mockCourses: Course[] = [
    {
      id: 1,
      title: "Introduction to Programming",
      questions: 25,
      students: 0,
      createdDate: "2025-03-10",
      status: "unassigned",
    },
    {
      id: 2,
      title: "Data Structures and Algorithms",
      questions: 42,
      students: 0,
      createdDate: "2025-03-12",
      status: "unassigned",
    },
    {
      id: 3,
      title: "Web Development Fundamentals",
      questions: 30,
      students: 85,
      createdDate: "2025-02-25",
      status: "assigned",
    },
    {
      id: 4,
      title: "Database Systems",
      questions: 35,
      students: 62,
      createdDate: "2025-02-28",
      status: "assigned",
    },
    {
      id: 5,
      title: "Python for Data Science",
      questions: 50,
      students: 120,
      createdDate: "2025-01-15",
      status: "approved",
    },
    {
      id: 6,
      title: "Mobile App Development",
      questions: 38,
      students: 75,
      createdDate: "2025-01-20",
      status: "approved",
    },
  ];

  // Filter courses based on status
  const unassignedCourses = mockCourses.filter(
    (course) => course.status === "unassigned",
  );
  const assignedCourses = mockCourses.filter(
    (course) => course.status === "assigned",
  );
  const approvedCourses = mockCourses.filter(
    (course) => course.status === "approved",
  );

  // State for course creation modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Courses</h1>
        {userRole === "instructor" && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
          >
            Create New Course
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <select className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="unassigned">Unassigned</option>
              <option value="assigned">Assigned</option>
              <option value="approved">Approved</option>
            </select>
            <select className="rounded-md border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sort By</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="questions">Most Questions</option>
              <option value="students">Most Students</option>
            </select>
          </div>
        </div>
      </div>

      {/* Unassigned Courses */}
      {unassignedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-gray-700">
            Unassigned Courses
          </h2>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            {unassignedCourses.map((course) => (
              <div
                key={course.id}
                className="border-b border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-md font-medium text-gray-800">
                      {course.title}
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="mr-4">{course.questions} Questions</span>
                      <span>Created on {course.createdDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
                      <EyeIcon size={16} />
                      View
                    </button>
                    <button className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
                      <EditIcon size={16} />
                      Edit
                    </button>
                    {userRole === "instructor" && (
                      <button className="flex items-center gap-1 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700">
                        Assign to Admin
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assigned Courses */}
      {assignedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-gray-700">
            Assigned Courses (Pending Approval)
          </h2>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            {assignedCourses.map((course) => (
              <div
                key={course.id}
                className="border-b border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-md font-medium text-gray-800">
                      {course.title}
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="mr-4">{course.questions} Questions</span>
                      <span className="mr-4">{course.students} Students</span>
                      <span>Created on {course.createdDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
                      <EyeIcon size={16} />
                      View
                    </button>
                    {userRole === "instructor" && (
                      <button className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
                        <EditIcon size={16} />
                        Edit
                      </button>
                    )}
                    {userRole === "admin" && (
                      <>
                        <button className="flex items-center gap-1 rounded bg-purple-600 px-3 py-1 text-white hover:bg-purple-700">
                          <MessageSquareIcon size={16} />
                          Comment
                        </button>
                        <button className="flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700">
                          <CheckIcon size={16} />
                          Approve
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved Courses */}
      {approvedCourses.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-3 text-lg font-medium text-gray-700">
            Approved Courses
          </h2>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            {approvedCourses.map((course) => (
              <div
                key={course.id}
                className="border-b border-gray-200 p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="mb-4 md:mb-0">
                    <h3 className="text-md font-medium text-gray-800">
                      {course.title}
                    </h3>
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <span className="mr-4">{course.questions} Questions</span>
                      <span className="mr-4">{course.students} Students</span>
                      <span>Created on {course.createdDate}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
                      <EyeIcon size={16} />
                      View
                    </button>
                    {userRole === "instructor" && (
                      <button className="flex items-center gap-1 rounded bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
                        <EditIcon size={16} />
                        Edit Questions
                      </button>
                    )}
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                      Approved
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">
              Create New Course
            </h2>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="course-title"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Course Title
                </label>
                <input
                  type="text"
                  id="course-title"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course title"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="course-description"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="course-description"
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter course description"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;
