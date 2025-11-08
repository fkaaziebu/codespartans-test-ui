export interface DomainScore {
  domain: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  color: string;
}

export interface TestPerformance {
  testId: string;
  testName: string;
  overallScore: number;
  totalTime: string;
  dateCompleted: string;
  domainScores: DomainScore[];
}

export interface QuestionDetail {
  id: string;
  question: string;
  domain: string;
  timeSpent: number; // in seconds
  isCorrect: boolean;
  yourAnswer: string;
  correctAnswer: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface TimePerDomain {
  domain: string;
  averageTime: number;
  totalTime: number;
  questionCount: number;
}

export interface PerformanceTimeline {
  date: string;
  score: number;
  testName: string;
}

export interface AdvancedTestPerformance extends TestPerformance {
  questions: QuestionDetail[];
  timeAnalytics: {
    averageTimePerQuestion: number;
    timePerDomain: TimePerDomain[];
    fastestQuestion: QuestionDetail;
    slowestQuestion: QuestionDetail;
  };
  performanceHistory: PerformanceTimeline[];
}
