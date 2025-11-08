export type TestSuite = {
  _id: string;
  startIndex: number;
  endIndex: number;
};

export type CourseDetails = {
  title: string;
  description: string;
  time: number;
  domains: string[];
  level: string;
  questions: number;
};

export type TestMode = {
  id: string;
  mode: "proctored" | "learning";
  course: CourseDetails;
  test_suites: TestSuite[];
  attempts: Array<{ id: string; score: number; date: Date }>;
};

export type CourseData = {
  proctored: TestMode;
  learning: TestMode;
};
