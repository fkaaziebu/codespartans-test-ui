"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const AutoLogout = () => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const INACTIVITY_LIMIT = 120 * 60 * 1000;

  const resetTimer = () => {
    if (timer) clearTimeout(timer); // Clear the old timer
    setTimer(
      setTimeout(() => {
        // Perform the logout action here
        sessionStorage.removeItem("token");
        router.push("/"); // Redirect to login page
      }, INACTIVITY_LIMIT),
    );
  };

  useEffect(() => {
    // Start the inactivity timer
    resetTimer();

    // Add event listeners to detect user activity
    const events = ["mousemove", "keydown", "click"];

    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Clean up event listeners on component unmount
    return () => {
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
    };
  }, []);

  return null;
};

export default AutoLogout;
