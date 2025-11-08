export interface AllAttemptedQuestionsInterface {
  question_number: number;
  description: string;
  multiple_choice_options: Array<string>;
  time: number;
  hints: Array<string>;
  type: "multiple_choice" | "true/false" | "short_answer" | "multiple_select";
  answer?: Array<string>;
  is_flagged: boolean;
  correct_answer?: Array<string>;
  fetch_time?: number;
  answer_submitted?: boolean;
}

export interface AllAttemptedQuestionsResponseInterface {
  data: {
    attempt_status: number;
    time_remaining: number;
    progress: {
      completed: number;
    };
    answered_questions: Array<{
      question: {
        question_number: number;
        description: string;
        hints: Array<string>;
        type:
          | "multiple_choice"
          | "true/false"
          | "short_answer"
          | "multiple_select";
        domain: string;
        tags: Array<string>;
        multiple_choice_options: Array<string>;
        difficulty: number;
        time: number;
      };
      answer: Array<string>;
      hint_used: Array<string>;
      timestamp: number;
      is_flagged: boolean;
    }>;
  };
}

export interface CurrentQuestionInterface {
  question_number: number;
  description: string;
  multiple_choice_options: Array<string>;
  time: number;
  hints: Array<string>;
  type: "multiple_choice" | "true/false" | "short_answer" | "multiple_select";
  answer?: Array<string>;
  is_flagged: boolean;
  correct_answer?: Array<string>;
  fetch_time?: number;
  answer_submitted?: boolean;
}

export interface ProgressInfoInterface {
  completed: number;
  total_attempted: number;
  total_questions: number;
}

export interface LearningModeQuestionProps {
  questionList: number[];
  progressInfo: ProgressInfoInterface;
  allAttemptedQuestions: AllAttemptedQuestionsInterface[];
  currentQuestion: CurrentQuestionInterface;
  setCurrentQuestion: React.Dispatch<
    React.SetStateAction<CurrentQuestionInterface>
  >;
  submitAnswer: ({
    questionNumber,
    answer,
    isFlagged,
  }: {
    questionNumber: number;
    answer: string;
    isFlagged: boolean;
  }) => Promise<void>;
  finishTestAttempt: () => void;
  hasErrorLoadingQuestion: boolean;
  isSubmittingAnswer: boolean;
  setPreview: React.Dispatch<React.SetStateAction<boolean>>;
  totalQuestions: number;
  updateCurrentQuestion: (index: number) => void;
}

export interface NextQuestionResponseInterface {
  data: {
    description: string;
    hints: Array<string>;
    type: "multiple_choice" | "true/false" | "short_answer" | "multiple_select";
    multiple_choice_options: Array<string>;
    domain: string;
    tags: Array<string>;
    difficulty: number;
    time: number;
    question_number: number;
    is_flagged: boolean;
    fetch_time: number;
  };
}

export interface SubmitAnswerInterface {
  data: {
    message: string;
    progress: {
      completed: number;
    };
    answers: Array<{
      question_number: number;
      description: string;
      hints: Array<string>;
      type:
        | "multiple_choice"
        | "true/false"
        | "short_answer"
        | "multiple_select";
      domain: string;
      tags: Array<string>;
      multiple_choice_options: Array<string>;
      difficulty: number;
      time: number;
      answer: Array<string>;
      is_flagged: boolean;
    }>;
  };
}
