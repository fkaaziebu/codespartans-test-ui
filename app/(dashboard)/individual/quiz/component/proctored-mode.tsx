import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlagIcon } from "lucide-react";
import { useState } from "react";

const ProctoredMode: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const questions = [
    {
      text: "A project is in the execution phase when new team members are on board...",
      options: [
        "Plan a meeting with the new team members...",
        "Schedule a session to let the existing team members...",
        "Conduct a session to update the existing social agreement...",
        "Organize a meeting with all team members...",
      ],
    },
    {
      text: "What is a mammal",
      options: [
        "A 4 legged animal",
        "I do not know",
        "A cod blooded animal",
        "Ask AI",
      ],
    },
    // Add more questions here
  ];

  const handlePrev = () => {
    setCurrentQuestion((prev) => (currentQuestion === 0 ? prev : prev - 1));
  };

  const handleNext = () => {
    setCurrentQuestion((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col ">
      <Card className="flex my-10 max-w-fit">
        <CardContent className="flex items-center pt-3 font-semibold">
          <p className=" text-red-500 text-right"> Time Left: 43:23</p>
        </CardContent>
      </Card>
      <h2>Question {currentQuestion + 1}</h2>
      <p>{questions[currentQuestion].text}</p>

      <div className="flex flex-col mt-10 gap-10">
        {questions[currentQuestion].options.map((option, index) => (
          <label key={index}>
            <input type="radio" name="answer" />
            {option}
          </label>
        ))}
      </div>
      <div className="flex justify-between flex-row gap-6">
        {currentQuestion > 0 && (
          <Button
            className="mt-20 p-6 bg-black font-bold text-white border rounded-none"
            onClick={handlePrev}
          >
            Prev
          </Button>
        )}
        <Button className="mt-20 p-6 bg-gray-900 text-white border rounded-none">
          <FlagIcon className="text-sm text-red-400 font-light mr-4" />
          Flag
        </Button>
        {currentQuestion < questions.length - 1 ? (
          <Button
            className="mt-20 p-6 bg-black font-bold text-white border rounded-none"
            onClick={handleNext}
          >
            Next
          </Button>
        ) : (
          <Button className="mt-20 p-6 bg-green-500 font-bold text-white border rounded-none">
            Submit
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProctoredMode;
