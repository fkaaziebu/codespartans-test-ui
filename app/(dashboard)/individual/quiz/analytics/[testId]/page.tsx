import AnalyticsDashboard from "@/app/(dashboard)/individual/quiz/component/analytics";
import { AdvancedTestPerformance } from "@/app/types/analytics";

const samplePerformance: AdvancedTestPerformance = {
  testId: "1",
  testName: "Web Development Fundamentals",
  overallScore: 85,
  totalTime: "1h 45m",
  dateCompleted: "2024-02-15",
  domainScores: [
    {
      domain: "HTML & CSS",
      score: 90,
      totalQuestions: 20,
      correctAnswers: 18,
      color: "#4F46E5",
    },
    {
      domain: "JavaScript",
      score: 85,
      totalQuestions: 25,
      correctAnswers: 21,
      color: "#7C3AED",
    },
    {
      domain: "React Fundamentals",
      score: 78,
      totalQuestions: 15,
      correctAnswers: 12,
      color: "#EC4899",
    },
    {
      domain: "Backend Concepts",
      score: 82,
      totalQuestions: 18,
      correctAnswers: 15,
      color: "#8B5CF6",
    },
  ],
  questions: [
    {
      id: "1",
      question:
        "What is the correct syntax for declaring a variable in JavaScript?",
      domain: "JavaScript",
      timeSpent: 25,
      isCorrect: true,
      yourAnswer: "let variableName = value;",
      correctAnswer: "let variableName = value;",
      difficulty: "Easy",
    },
    // Add more questions...
  ],
  timeAnalytics: {
    averageTimePerQuestion: 45,
    timePerDomain: [
      {
        domain: "JavaScript",
        averageTime: 42,
        totalTime: 840,
        questionCount: 20,
      },
      // Add more domains...
    ],
    fastestQuestion: {
      id: "1",
      question: "What does HTML stand for?",
      domain: "HTML & CSS",
      timeSpent: 15,
      isCorrect: true,
      yourAnswer: "HyperText Markup Language",
      correctAnswer: "HyperText Markup Language",
      difficulty: "Easy",
    },
    slowestQuestion: {
      id: "15",
      question: "Explain the concept of closures in JavaScript",
      domain: "JavaScript",
      timeSpent: 120,
      isCorrect: false,
      yourAnswer: "...",
      correctAnswer: "...",
      difficulty: "Hard",
    },
  },
  performanceHistory: [
    {
      date: "2024-01-15",
      score: 75,
      testName: "JavaScript Basics",
    },
    // Add more history points...
  ],
};

const TestAnalyticsPage = () => {
  return (
    <div className="max-w-full mx-auto flex-col no-scrollbar px-4 sm:px-6 lg:px-8">
      <AnalyticsDashboard performance={samplePerformance} />
    </div>
  );
};
export default TestAnalyticsPage;
