"use client";

import { useEffect, useState } from "react";
import { Jersey_15, Poppins } from "next/font/google";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

interface Question {
  _id: string;
  questionId: number;
  questionText: string;
  options: Array<{
    text: string;
    isCorrect: boolean;
  }>;
  category: string;
  difficulty?: string;
}

export default function AdminPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = searchParams.get("questionId");
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!questionId) {
        setError("No question ID provided");
        setIsLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        console.log("🚀 ~ fetchQuestion ~ token:", token);
        if (!token) {
          throw new Error("You must be logged in to view questions");
        }

        const response = await fetch(
          `http://localhost:3000/api/admin/questions/${questionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch question");
        }

        const data = await response.json();
        setQuestion(data.data.question);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to fetch question"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestion();
  }, [questionId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error || "Question not found"}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      <div
        className="h-screen w-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/adminbg.png')` }}
      >
        <div className="flex flex-col items-center justify-center h-full relative">
          <div
            className="bg-center bg-cover bg-no-repeat w-[90%] md:w-[70%] h-[80%] md:h-[75%] rounded-xl md:rounded-3xl relative"
            style={{ backgroundImage: `url('/adminbg.png')` }}
          >
            <Image
              src={"/baseballfull.png"}
              width={100}
              height={100}
              alt="Baseball decoration"
              style={{ position: "absolute", top: 0, left: 0, zIndex: 9999999 }}
            />
            <div className="absolute inset-0 rounded-xl md:rounded-3xl bg-black opacity-75 z-10" />

            <div className="flex flex-col items-center justify-center h-full relative z-20 p-4">
              <div
                className="absolute top-[-15px] md:top-[-25px] 4k:top-[-40px] px-4 md:px-10 py-2 4k:py-9 rounded-xl shadow-lg"
                style={{
                  background:
                    "linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)",
                }}
              >
                <h1
                  className={`text-sm md:text-2xl 2xl:text-4xl 4k:text-[50px] font-bold text-nowrap ${jersey15.className} text-white`}
                >
                  Question no.{question?.questionId}
                </h1>
              </div>
              {/* Close Button */}
              <button
                onClick={() => router.back()}
                className="absolute top-4 right-4 z-30"
              >
                <Image
                  src={"/close.png"}
                  alt="Close"
                  width={24}
                  height={24}
                  className="w-6 h-6 md:w-8 md:h-8"
                />
              </button>

              <div className="flex flex-col items-center justify-center gap-4 w-[90%] md:w-[80%] mt-8 md:mt-0">
                {/* Question Text */}
                <p
                  className={`text-white text-lg md:text-xl 2xl:text-3xl 4k:text-[40px] font-bold text-center ${poppins.className}`}
                >
                  {question.questionText}
                </p>

                {/* Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-4">
                  {question.options.map((option, index) => (
                    <button
                      key={index}
                      className={`relative overflow-hidden group text-white px-4 py-2 md:py-3 2xl:py-4 4k:py-8 rounded-lg text-xs md:text-sm 2xl:text-xl 4k:text-[30px] font-semibold w-full flex items-center justify-center text-center min-h-[40px] md:min-h-[50px] 2xl:min-h-[60px] transition-all border-2 border-transparent hover:bg-gradient-to-r hover:from-[#2CF0FA] hover:via-[#F05CE6] hover:to-[#893DE6] ${
                        poppins.className
                      } ${
                        option.isCorrect
                          ? "bg-green-500/20 border-green-500"
                          : ""
                      }`}
                      style={{
                        borderImage: option.isCorrect
                          ? "none"
                          : "linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6) 1",
                        borderImageSlice: 1,
                      }}
                    >
                      {option.text}
                      {option.isCorrect && (
                        <span className="ml-2 text-green-400">✓</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Category and Difficulty */}
                <div className="flex flex-wrap gap-4 mt-4 text-white">
                  <div className="bg-white/10 px-4 py-2 rounded-lg">
                    <span
                      className={`text-sm md:text-base ${poppins.className}`}
                    >
                      Category: {question.category}
                    </span>
                  </div>
                  {question.difficulty && (
                    <div className="bg-white/10 px-4 py-2 rounded-lg">
                      <span
                        className={`text-sm md:text-base ${poppins.className}`}
                      >
                        Difficulty: {question.difficulty}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Image
            src={"/avatar.png"}
            width={400}
            height={400}
            alt="Baseball decoration"
            className="w-[300px] md:w-[400px] 2xl:w-[500px] 4k:w-[600px] h-auto"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              zIndex: 9999999,
            }}
          />
        </div>
      </div>
    </div>
  );
}
