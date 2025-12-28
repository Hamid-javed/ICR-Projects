"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Jersey_15, Poppins } from "next/font/google";
import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";
import { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { useQuiz } from "../context/QuizContext";
import Cookies from "js-cookie";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Random hints for the arena
const ARENA_HINTS = [
  "Scan QR codes to answer questions and earn points!",
  "The faster you answer, the more points you get!",
  "Each question has a time limit of 30 seconds.",
  "Correct answers earn you 40 points!",
  "Keep an eye on the timer!",
  "You can only attempt each question once.",
  "The leaderboard shows the top performers!",
  "Complete all questions to see your final score!",
  "Stay focused and scan carefully!",
  "Good luck and have fun!",
];

export default function ArenaPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [scanned, setScanned] = useState(false);
  const [currentHint, setCurrentHint] = useState("");
  const {
    currentQuestionIndex,
    isQuizComplete,
    totalQuestions,
    hasAnsweredQuestion,
  } = useQuiz();

  useEffect(() => {
    const deviceId = Cookies.get("deviceId");
    if (!deviceId) {
      router.push("/");
    }
  }, []);

  // Update hint every 5 seconds
  useEffect(() => {
    const updateHint = () => {
      const randomIndex = Math.floor(Math.random() * ARENA_HINTS.length);
      setCurrentHint(ARENA_HINTS[randomIndex]);
    };

    // Set initial hint
    updateHint();

    // Update hint every 5 seconds
    const interval = setInterval(updateHint, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleError = (err: unknown) => {
    let message = "Unknown error";
    if (err && typeof err === "object" && "message" in err) {
      message = (err as { message: string }).message;
    } else if (typeof err === "string") {
      message = err;
    }
    setError("Camera error: " + message);
  };

  const handleScan = async (detectedCodes: IDetectedBarcode[]) => {
    if (detectedCodes.length > 0 && !scanned) {
      try {
        setScanned(true);
        const qrCode = detectedCodes[0].rawValue;

        // Extract question ID from the QR code URL
        const urlParts = qrCode.split("/");
        const qrCodeId = urlParts[urlParts.length - 1];
        console.log("🚀 ~ handleScan ~ qrCodeId:", qrCodeId);

        // Get token from cookies
        const token = Cookies.get("token");
        if (!token) {
          throw new Error("You must be logged in to scan QR codes");
        }

        // Fetch question details from backend
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }/api/questions/qr/${qrCodeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          let errorMessage = "Failed to fetch question";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data?.data?.question) {
          throw new Error("Invalid question data received");
        }

        const question = data.data.question;
        console.log("🚀 ~ handleScan ~ question:", question);

        // Check if question has already been answered using questionId
        if (hasAnsweredQuestion(question._id)) {
          setError("You have already answered this question");
          // Don't reset scanned state immediately to prevent multiple scans
          setTimeout(() => {
            setScanned(false);
            setError("");
          }, 3000);
          return;
        }

        // Navigate to quiz page with question data
        router.push(`/quiz?questionId=${question.questionId}`);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to process QR code"
        );
        setTimeout(() => {
          setScanned(false);
          setError("");
        }, 3000);
      }
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col bg-[#181924] ${poppins.className}`}
      style={{
        backgroundImage: "url('/quiz-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-6 pb-2 max-w-[768px] mx-auto w-full">
        <button onClick={() => router.back()} aria-label="Back" className="p-2">
          <svg
            width="28"
            height="28"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            viewBox="0 0 24 24"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div
          className={`text-3xl font-bold text-white ${jersey15.className} mt-2`}
        >
          Welcome to Arena
        </div>
        <div className="p-2">
          {/* User icon */}
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-2.2 3.6-4 8-4s8 1.8 8 4" />
          </svg>
        </div>
      </div>

      {/* Main card/section */}
      <div
        className="flex-1 flex flex-col relative"
        style={{
          borderTop: "1px solid #2CF0FA",
          borderRadius: "20px",
          marginTop: "30px",
        }}
      >
        <div className="relative w-full max-w-[768px] mx-auto px-4 pt-10 pb-16">
          <div className="rounded-3xl shadow-lg p-6 md:p-10 relative overflow-visible">
            <div className="text-white text-2xl md:text-3xl font-bold mb-4 text-left">
              {isQuizComplete
                ? "Quiz Complete!"
                : `Question ${currentQuestionIndex + 1} of ${totalQuestions}`}
            </div>
            <div className="text-[#2CF0FA] text-lg mb-8 text-left animate-fade-in">
              {isQuizComplete ? "" : currentHint}
            </div>
            <div className="flex justify-center items-center min-h-[200px]">
              {isQuizComplete ? (
                <div className="text-center mt-30">
                  <div className="text-white text-2xl mb-4">
                    Congratulations! 🎉
                  </div>
                  <div className="text-[#2CF0FA] text-lg mb-8">
                    You have completed all the questions. Check the leaderboard
                    to see your ranking!
                  </div>
                  <button
                    onClick={() => router.push("/leaderboard")}
                    className="px-8 py-3 rounded-full text-white font-bold bg-gradient-to-r from-[#2CF0FA] via-[#F05CE6] to-[#893DE6] hover:opacity-90 transition-opacity"
                  >
                    View Leaderboard
                  </button>
                </div>
              ) : (
                <div
                  className="w-52 h-52 p-[3px] rounded-2xl"
                  style={{
                    background:
                      "linear-gradient(90deg, #2CF0FA 0%, #F05CE6 50%, #893DE6 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="w-full h-full rounded-2xl flex items-center justify-center overflow-hidden bg-white">
                    <Scanner
                      onScan={handleScan}
                      onError={handleError}
                      classNames={{
                        container:
                          "w-full h-full rounded-2xl flex items-center justify-center overflow-hidden bg-white",
                        video: "w-full h-full object-cover border-radius-16",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            {/* Basketball icon, absolutely positioned */}
            <div
              style={{
                position: "absolute",
                right: "-10px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <Image
                src="/baseball.png"
                alt="Basketball"
                width={100}
                height={100}
              />
            </div>
            {error && (
              <div className="text-red-400 mt-2 text-center">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
