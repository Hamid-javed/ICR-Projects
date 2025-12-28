"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Jersey_15, Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import { useQuiz } from "../context/QuizContext";
import { QuizQuestion } from "../types";
import Cookies from "js-cookie";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function QuizPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    hasAnsweredQuestion,
    score: contextScore,
    quizSettings,
    fetchUserScore,
  } = useQuiz();
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  // Update timer when settings change
  useEffect(() => {
    if (quizSettings) {
      setTimeLeft(quizSettings.questionTimeLimit);
    }
  }, [quizSettings]);

  // Fetch user score when component mounts
  useEffect(() => {
    fetchUserScore();
  }, []);

  useEffect(() => {
    const deviceId = Cookies.get("deviceId");
    if (!deviceId) {
      router.push("/");
    }
  }, []);

  useEffect(() => {
    const fetchQuestion = async () => {
      const questionId = searchParams.get("questionId");
      if (!questionId) {
        setError("No question ID provided");
        return;
      }

      // Check if question has already been answered
      if (hasAnsweredQuestion(questionId)) {
        router.push("/arena");
        return;
      }

      try {
        // Check if the questionId is a QR code (contains non-numeric characters)
        const isQRCode = /[^0-9]/.test(questionId);
        const endpoint = isQRCode
          ? `/api/questions/qr/${questionId}`
          : `/api/questions/${questionId}`;

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
          }${endpoint}`,
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("token")}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch question");
        }

        const data = await response.json();
        if (!data?.data?.question) {
          throw new Error("Invalid question data received");
        }
        setQuestion(data.data.question);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch question"
        );
      }
    };

    fetchQuestion();
  }, [searchParams, router, hasAnsweredQuestion]);

  // Timer logic
  useEffect(() => {
    if (!question) return;

    if (timeLeft <= 0 && !answered) {
      setAnswered(true);
      setTimeout(() => router.push("/arena"), 2000);
      return;
    }
    if (timeLeft <= 0 && answered) return;
    if (answered) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, answered, router, question]);

  // Move to next screen after answer
  useEffect(() => {
    if (answered && selected !== null) {
      const timeout = setTimeout(() => {
        if (isQuizComplete) {
          router.push("/leaderboard");
        } else {
          router.push("/arena");
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [answered, selected, router, isQuizComplete]);

  // For the timer circle animation
  const totalTime = quizSettings?.questionTimeLimit || 30;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = (timeLeft / totalTime) * circumference;

  const handleSelect = async (idx: number) => {
    if (answered || !question) return;

    try {
      setSelected(idx);
      setAnswered(true);

      const token = Cookies.get("token");
      console.log("Token being used:", token);

      // Submit answer to backend
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/questions/${question._id || question.questionId}/answer`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            optionId: question.options[idx]._id,
          }),
        }
      );

      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);

      if (!response.ok) {
        // Handle authentication errors
        if (response.status === 401) {
          console.log("Authentication error detected");
          // Clear the invalid token
          Cookies.remove("token");
          // Show error message
          setError("Your session has expired. Please log in again.");
          // Redirect to login page after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 2000);
          return;
        }
        throw new Error(data.message || "Failed to submit answer");
      }

      // Update score in context
      if (data.data.isCorrect) {
        fetchUserScore(); // Fetch updated score from the server
      }

      // Show feedback for 2 seconds before moving to next question
      setTimeout(() => {
        router.push("/arena");
      }, 2000);
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError(err instanceof Error ? err.message : "Failed to submit answer");
      setAnswered(false);
      setSelected(null);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#181924] text-white">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => router.push("/arena")}
          className="mt-4 px-6 py-2 rounded-lg text-white font-bold bg-gradient-to-r from-[#2CF0FA] via-[#F05CE6] to-[#893DE6]"
        >
          Back to Scanner
        </button>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#181924]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

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
        <div className={`text-4xl font-bold text-white ${jersey15.className}`}>
          QUIZ
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

      {/* Main quiz card */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        <div className="relative w-full max-w-[768px] mx-auto pt-8 pb-16">
          <div
            className="rounded-3xl shadow-lg"
            style={{ borderTop: "1px solid #2CF0FA", borderRadius: "20px" }}
          >
            {/* Timer and Score */}
            <div className="flex items-center justify-between px-6 pt-6">
              <div className="flex items-center">
                {/* Timer circle */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg width="64" height="64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="#23244a"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="url(#timerGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      style={{ transition: "stroke-dashoffset 1s linear" }}
                    />
                    <defs>
                      <linearGradient
                        id="timerGradient"
                        x1="0"
                        y1="0"
                        x2="64"
                        y2="0"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#2CF0FA" />
                        <stop offset="0.5" stopColor="#F05CE6" />
                        <stop offset="1" stopColor="#893DE6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span
                    style={{ fontSize: "12px" }}
                    className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm {poppins.className}"
                  >
                    {timeLeft} sec
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#2CF0FA]">
                  {contextScore || 0}
                </span>
                <span className="text-lg text-white ml-1">score</span>
              </div>
            </div>

            {/* Question box */}
            <div
              style={{ zIndex: 10 }}
              className={`px-6 mt-6 z-10 ${poppins.className}`}
            >
              <div className="rounded-2xl bg-[#23244a] p-6 text-white shadow text-left z-10">
                <div className="font-bold text-xl mb-2">
                  Question {question.questionId}
                </div>
                <div className="text-lg font-medium">
                  {question.questionText}
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="px-6 mt-8 flex flex-col gap-4">
              {question.options.map((option, idx: number) => {
                let border =
                  "linear-gradient(90deg, #2CF0FA 0%, #F05CE6 50%, #893DE6 100%) 1";
                let bg = "transparent";
                let text = "text-white";

                if (answered) {
                  if (option.isCorrect) {
                    border =
                      "linear-gradient(90deg, #2CF0FA 0%, #00FFB4 100%) 1";
                    bg = "rgba(44,240,250,0.10)";
                    text = "text-[#2CF0FA] font-bold";
                  } else if (selected === idx) {
                    border =
                      "linear-gradient(90deg, #F05CE6 0%, #893DE6 100%) 1";
                    bg = "rgba(240,92,230,0.10)";
                    text = "text-[#F05CE6] font-bold";
                  }
                } else if (selected === idx) {
                  bg = "rgba(44,240,250,0.10)";
                  text = "text-[#2CF0FA] font-bold";
                }

                return (
                  <button
                    key={option._id}
                    className={`w-full rounded-xl py-3 px-4 text-lg font-semibold text-left border-2 transition-all ${text} ${poppins.className}`}
                    style={{
                      borderImage: border,
                      borderStyle: "solid",
                      background: bg,
                      cursor: answered ? "not-allowed" : "pointer",
                    }}
                    disabled={answered}
                    onClick={() => handleSelect(idx)}
                  >
                    {option.text}
                    {answered && option.isCorrect && (
                      <span className="ml-2">✅</span>
                    )}
                    {answered && selected === idx && !option.isCorrect && (
                      <span className="ml-2">❌</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Next button */}
            <div className="flex justify-end px-6 mt-8 mb-4">
              <button
                className={`rounded-full px-10 py-3 text-lg font-bold text-white shadow-lg ${poppins.className}`}
                style={{
                  background:
                    "linear-gradient(90deg, #2CF0FA 0%, #F05CE6 50%, #893DE6 100%)",
                  opacity: answered ? 1 : 0.5,
                  cursor: answered ? "pointer" : "not-allowed",
                }}
                onClick={() => answered && router.push("/arena")}
                disabled={!answered}
              >
                {isQuizComplete ? "Finish" : "Next Question"}
              </button>
            </div>

            {/* Basketball icon, absolutely positioned */}
            <div
              style={{
                position: "absolute",
                right: "-40px",
                top: "30%",
                transform: "translateY(-50%)",
              }}
            >
              <Image
                src="/baseball.png"
                alt="Basketball"
                width={80}
                height={80}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
