"use client";
import { Jersey_15, Poppins } from "next/font/google";
import Image from "next/image";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: "400" });

export default function QuizSettings() {
  const [quizTimer, setQuizTimer] = useState(25);
  const [quizScore, setQuizScore] = useState(50);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to view settings");
      }

      const response = await fetch("http://localhost:3000/api/admin/settings", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      setQuizTimer(data.data.settings.questionTimeLimit);
      setQuizScore(data.data.settings.scorePerQuestion);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch settings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizTimer(Number(e.target.value));
    setHasChanges(true);
  };

  const handleScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuizScore(Number(e.target.value));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      alert("No changes to save");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to save settings");
      }

      const response = await fetch("http://localhost:3000/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          questionTimeLimit: Number(quizTimer),
          scorePerQuestion: Number(quizScore),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setHasChanges(false);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save settings"
      );
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save settings. Please try again."
      );
    }
  };

  const getBackgroundSize = (value: number, min: number, max: number) => {
    return ((value - min) * 100) / (max - min) + "%";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-50 z-0" />

      <div
        className="h-screen w-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/adminbg.png')` }}
      >
        <div className="flex flex-col items-center justify-center h-full relative z-10 ">
          <div
            className="bg-center bg-cover bg-no-repeat w-[90%] md:w-[70%] h-[80%] md:h-[75%] rounded-xl md:rounded-3xl relative"
            style={{ backgroundImage: `url('/adminbg.png')` }}
          >
            <div
              className="absolute inset-0 rounded-xl md:rounded-3xl bg-black opacity-75 z-10"
              style={{ borderWidth: 1, borderColor: "#2CF0FA" }}
            />

            <div className="flex flex-col items-center justify-center h-full relative z-20">
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
                  Quiz Settings
                </h1>
              </div>

              <div className="flex flex-col items-center justify-center w-full gap-4 md:gap-8 px-4 md:px-0">
                <Image
                  src={"/baseballfull.png"}
                  width={100}
                  height={100}
                  alt="Baseball decoration"
                  style={{ position: "absolute", top: 0, right: 0 }}
                />
                <div className="flex flex-col gap-2 w-full md:w-2/3 2xl:w-1/2">
                  <label
                    className={` ${poppins.className} block text-base md:text-xl 2xl:text-3xl 4k:text-[50px] text-white font-bold mb-2 text-nowrap`}
                  >
                    Quiz Timer
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="5"
                    value={quizTimer}
                    onChange={handleTimerChange}
                    className="w-full h-6 md:h-8 4k:h-16 2xl:h-10 bg-[#F5BD1D] rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right,#893DE6 0%,  #F05CE6,  #2CF0FA ${getBackgroundSize(
                        quizTimer,
                        5,
                        30
                      )}, #ccc ${getBackgroundSize(
                        quizTimer,
                        5,
                        30
                      )}, #ccc 100%)`,
                    }}
                  />
                  <div
                    className={`flex ${poppins.className} justify-between text-xs md:text-sm 2xl:text-xl 4k:text-[30px] text-white mt-2`}
                  >
                    <span>5s</span>
                    <span>10s</span>
                    <span>15s</span>
                    <span>20s</span>
                    <span>25s</span>
                    <span>30s</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-2/3 2xl:w-1/2">
                  <label
                    className={` ${poppins.className} block text-base md:text-xl 2xl:text-3xl 4k:text-[50px] text-white font-bold mb-2 text-nowrap`}
                  >
                    Quiz Score
                  </label>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="10"
                    value={quizScore}
                    onChange={handleScoreChange}
                    className="w-full h-6 md:h-8 2xl:h-10 4k:h-16 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right,#893DE6 0%,  #F05CE6,  #2CF0FA ${getBackgroundSize(
                        quizScore,
                        20,
                        80
                      )}, #ccc ${getBackgroundSize(
                        quizScore,
                        20,
                        80
                      )}, #ccc 100%)`,
                    }}
                  />
                  <div
                    className={`flex ${poppins.className} justify-between text-xs md:text-sm 2xl:text-xl 4k:text-[30px] text-white mt-2`}
                  >
                    <span>20</span>
                    <span>30</span>
                    <span>40</span>
                    <span>50</span>
                    <span>60</span>
                    <span>70</span>
                    <span>80</span>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={!hasChanges}
                  className={`mt-4 px-6 py-2 rounded-lg text-white font-bold ${
                    hasChanges
                      ? "bg-gradient-to-r from-[#2CF0FA] via-[#F05CE6] to-[#893DE6]"
                      : "bg-gray-500"
                  }`}
                >
                  Save Settings
                </button>

                <Image
                  src={"/baseballfull.png"}
                  width={100}
                  height={100}
                  alt="Baseball decoration"
                  style={{ position: "absolute", bottom: 0, left: 0 }}
                />
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

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 0;
          height: 0;
        }
        input[type="range"]::-moz-range-thumb {
          width: 0;
          height: 0;
        }
        input[type="range"] {
          border-radius: 20px;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
