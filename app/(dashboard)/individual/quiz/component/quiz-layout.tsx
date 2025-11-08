import { ReactNode, useState } from "react";
import ModeSelectionModal from "./mode-selection";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LayoutProps {
  children: ReactNode;
}

const QuizLayout: React.FC<LayoutProps> = ({ children }) => {
  const [mode, setMode] = useState<"proctored" | "learning" | null>(null);

  const handleModeSelect = (selectedMode: "proctored" | "learning") => {
    setMode(selectedMode);
  };
  return (
    <Card className="mx-auto max-w-screen-lg flex-col items-center justify-center my-10">
      {/* Show the mode selection modal if mode hasn't been selected */}
      {!mode && <ModeSelectionModal onSelectMode={handleModeSelect} />}

      {mode && (
        <div className="flex flex-col justify-center">
          {/* Progress bar */}
          <CardHeader className=" bg-gray-800">
            <CardTitle>
              <div className="flex justify-between text-white relative">
                <p>21/250</p>
                <h1>
                  Current Mode:{" "}
                  {mode === "proctored" ? "Proctored Mode" : "Learning Mode"}
                </h1>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Pass mode as a prop to children */}
            <div className="w-full max-w-7xl">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                  //@ts-expect-error NEC
                  return React.cloneElement(child, { mode });
                }
                return child;
              })}
            </div>
          </CardContent>
        </div>
      )}
    </Card>
  );
};
export default QuizLayout;
