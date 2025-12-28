"use client";

import React from "react";
import { useState, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import { Jersey_15, Poppins } from "next/font/google";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

interface Question {
  id: number;
  questionId: number;
  question: string;
  options: string[];
  correctAnswer: string;
  category: string;
}

interface QuestionRowProps {
  question: Question;
  onDelete: (id: number) => void;
}

const QuestionRow: React.FC<QuestionRowProps> = ({ question, onDelete }) => {
  const router = useRouter();
  const handlePreviewClick = () => {
    try {
      // Navigate to the preview page, passing the question ID
      router.push(`/admin/preview?questionId=${question.id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback to window.location if router is not ready
      window.location.href = `/admin/preview?questionId=${question.id}`;
    }
  };

  const handleDownloadQR = async () => {
    try {
      if (!question.questionId) {
        throw new Error(
          "Question ID is missing. Please refresh the page and try again."
        );
      }

      const response = await fetch(
        `http://localhost:3000/api/admin/questions/${question.questionId}/qr`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch QR code");
      }

      const data = await response.json();
      const qrCodeData = data.data.qrCode;

      if (!qrCodeData) {
        throw new Error("No QR code data received");
      }

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = qrCodeData;
      link.download = `question-${question.id}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading QR code:", error);
      // Show error message to user
      alert(
        error instanceof Error ? error.message : "Failed to download QR code"
      );
    }
  };

  return (
    <div className="bg-white rounded-lg p-2 md:p-4 hover:bg-gray-50 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center flex-wrap gap-1 sm:gap-2">
          <span
            className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-black ${poppins.className}`}
          >
            Q.{question.id}
          </span>
          <span
            className={`text-[8px] md:text-sm xl:text-3xl font-regular text-black ${poppins.className}`}
            title={question.question}
          >
            {question.question.length > 50
              ? `${question.question.slice(0, 50)}...`
              : question.question}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 justify-end">
          <div className="flex gap-2 min-w-[60px] md:min-w-[80px]">
            <button
              onClick={handlePreviewClick}
              className="bg-transparent hover:opacity-70 transition-opacity"
              title="Preview Question"
            >
              <Image
                src={"/preview.png"}
                alt={"Preview icon"}
                height={30}
                width={35}
                className="w-4 md:w-6 2xl:w-9"
              />
            </button>
            <button
              onClick={handleDownloadQR}
              className="bg-transparent hover:opacity-70 transition-opacity"
              title="Download QR Code"
            >
              <Image
                src={"/download.png"}
                alt={"Download QR code"}
                height={30}
                width={40}
                className="w-4 md:w-6 2xl:w-9"
              />
            </button>
            <button
              onClick={() => onDelete(question.id)}
              className="bg-transparent hover:opacity-70 transition-opacity"
              title="Delete Question"
            >
              <Image
                src={"/delete.png"}
                alt={"Delete question"}
                height={30}
                width={40}
                className="w-4 md:w-6 2xl:w-9"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function UploadQuestions() {
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("🚀 ~ fetchQuestions ~ token:", token);
      if (!token) {
        throw new Error("You must be logged in to view questions");
      }

      const response = await fetch(
        "http://localhost:3000/api/admin/questions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }

      const data = await response.json();
      setQuestions(
        data.data.questions
          .map(
            (q: {
              questionId: number;
              questionText: string;
              options: Array<{ text: string; isCorrect: boolean }>;
              category: string;
            }) => ({
              id: q.questionId,
              questionId: q.questionId,
              question: q.questionText,
              options: q.options.map((opt) => opt.text),
              correctAnswer: q.options.find((opt) => opt.isCorrect)?.text || "",
              category: q.category,
            })
          )
          .sort((a: Question, b: Question) => a.id - b.id)
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to fetch questions"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFileName(selectedFile.name);
      setErrorMessage("");

      // Create FormData and append file
      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        setIsUploading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("You must be logged in to upload questions");
        }

        const response = await fetch(
          "http://localhost:3000/api/questions/import",
          {
            method: "POST",
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to upload questions");
        }

        // Refresh the questions list after successful upload
        await fetchQuestions();
        setErrorMessage("Questions uploaded successfully!");
        setFileName("");
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to upload questions"
        );
        setFileName("");
      } finally {
        setIsUploading(false);
      }
    } else {
      setErrorMessage("Please upload a valid CSV file.");
      setFileName("");
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to delete questions");
      }

      const response = await fetch(
        `http://localhost:3000/api/admin/questions/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      // Refresh the questions list after successful deletion
      await fetchQuestions();
      setErrorMessage("Question deleted successfully!");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to delete question"
      );
    }
  };

  const handleDeleteAll = async () => {
    if (
      !confirm(
        "Are you sure you want to delete ALL questions? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const token = Cookies.get("token");
      if (!token) {
        throw new Error("You must be logged in to delete questions");
      }

      const response = await fetch(
        "http://localhost:3000/api/admin/questions",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete all questions");
      }

      // Refresh the questions list after successful deletion
      await fetchQuestions();
      setErrorMessage("All questions have been deleted successfully!");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to delete all questions"
      );
    }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-50 z-0" />

      <div
        className="min-h-screen w-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/adminbg.png')` }}
      >
        <div className="flex flex-col items-center justify-center min-h-screen py-8 px-4 sm:px-6 relative z-10">
          <div className="bg-center bg-cover bg-no-repeat w-[95%] sm:w-[90%] md:w-[80%] lg:w-[70%] h-auto min-h-[80vh] rounded-xl md:rounded-3xl relative">
            <div
              className="absolute inset-0 rounded-xl md:rounded-3xl bg-black opacity-75 z-10"
              style={{ borderWidth: 1, borderColor: "#2CF0FA" }}
            />

            <div className="flex flex-col items-center justify-center h-full relative z-20 p-4 sm:p-6 md:p-8">
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
                  Questions Management
                </h1>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 w-full mt-12 md:mt-16">
                <div className="w-full sm:w-[80%] md:w-[60%] flex flex-col sm:flex-row gap-4">
                  <div
                    className="flex-1 p-[2px] rounded-lg"
                    style={{
                      background:
                        "linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const fileInput = document.getElementById(
                          "file"
                        ) as HTMLInputElement;
                        fileInput?.click();
                      }}
                      disabled={isUploading}
                      className={`bg-white text-gray-500 rounded-lg shadow-lg flex items-center justify-between gap-2 w-full px-4 py-2 md:py-3 2xl:py-4 4k:py-9 ${
                        poppins.className
                      } ${isUploading ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <span className="text-sm md:text-base 2xl:text-xl truncate font-medium">
                        {isUploading
                          ? "Uploading..."
                          : fileName || "Choose File"}
                      </span>
                      <Image
                        src={"/filepick.png"}
                        alt="file"
                        width={50}
                        height={50}
                        className="w-4 md:w-5 2xl:w-6"
                      />
                    </button>
                  </div>

                  {questions.length > 0 && (
                    <div
                      className="sm:w-[200px] p-[2px] rounded-lg"
                      style={{
                        background:
                          "linear-gradient(to right, #FF4B4B, #FF0000)",
                      }}
                    >
                      <button
                        type="button"
                        onClick={handleDeleteAll}
                        className="bg-white text-red-500 rounded-lg shadow-lg flex items-center justify-center gap-2 w-full px-4 py-2 md:py-3 2xl:py-4 4k:py-9 hover:bg-red-50 transition-colors"
                      >
                        <span
                          className={`text-sm md:text-base 2xl:text-xl font-medium ${poppins.className}`}
                        >
                          Delete All
                        </span>
                        <Image
                          src={"/delete.png"}
                          alt="Delete all"
                          width={24}
                          height={24}
                          className="w-4 md:w-5 2xl:w-6"
                        />
                      </button>
                    </div>
                  )}
                </div>

                <input
                  id="file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".csv"
                />

                {errorMessage && (
                  <p
                    className={`text-red-500 text-sm md:text-base mt-2 ${poppins.className}`}
                  >
                    {errorMessage}
                  </p>
                )}

                {/* Questions Table */}
                <div className="w-full mt-4 space-y-2 overflow-y-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] pr-2">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                  ) : questions.length === 0 ? (
                    <div className="text-center text-white py-8">
                      No questions found. Upload a CSV file to add questions.
                    </div>
                  ) : (
                    questions.map((question) => (
                      <QuestionRow
                        key={question.id}
                        question={question}
                        onDelete={handleDeleteQuestion}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          <Image
            src={"/avatar.png"}
            width={300}
            height={300}
            alt="Baseball decoration"
            className="w-[200px] sm:w-[300px] md:w-[300px] lg:w-[300px] 2xl:w-[300px] 4k:w-[600px] h-auto"
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
