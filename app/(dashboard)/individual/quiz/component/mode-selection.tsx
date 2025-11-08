"use client";
import { Button } from "@/components/ui/button";
import React from "react";

const ModeSelectionModal: React.FC<{
  onSelectMode: (mode: "proctored" | "learning") => void;
}> = ({ onSelectMode }) => {
  return (
    <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-75">
      <div className="bg-white p-10 rounded">
        <h2>Select Mode</h2>
        <Button onClick={() => onSelectMode("proctored")} className="btn m-2">
          Proctored Mode
        </Button>
        <Button onClick={() => onSelectMode("learning")} className="btn m-2">
          Learning Mode
        </Button>
      </div>
    </div>
  );
};
export default ModeSelectionModal;
