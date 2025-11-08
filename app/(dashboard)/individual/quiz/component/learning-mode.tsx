import { Button } from "@/components/ui/button";
import { useState } from "react";

const LearningMode: React.FC = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const handleSelect = (answer: string) => {
    setSelectedAnswer(answer);
    // Mocking correct answer feedback
    if (answer === "correct") {
      setFeedback("Correct!");
    } else {
      setFeedback("Wrong. The correct answer is XYZ.");
    }
  };

  return (
    <div className="flex flex-col">
      <h2>Question 21</h2>
      <p>
        A project is in the execution phase when new team members are on
        board...
      </p>
      <div className="flex flex-col mt-20 gap-10">
        <label onClick={() => handleSelect("wrong1")}>
          <input type="radio" name="answer" /> Plan a meeting with the new team
          members...
        </label>
        <label onClick={() => handleSelect("correct")}>
          <input type="radio" name="answer" /> Schedule a session to let the
          existing team members...
        </label>
        <label onClick={() => handleSelect("wrong2")}>
          <input type="radio" name="answer" /> Conduct a session to update the
          existing social agreement...
        </label>
        <label onClick={() => handleSelect("wrong3")}>
          <input type="radio" name="answer" /> Organize a meeting with all team
          members...
        </label>
      </div>
      {/* Feedback */}
      {selectedAnswer && <div className="mt-10">{feedback}</div>}
      <div>
        <Button className="mt-20 bg-black text-white border rounded-none">
          Next Question
        </Button>
      </div>
    </div>
  );
};

export default LearningMode;
