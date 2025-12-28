"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Jersey_15, Poppins } from "next/font/google";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const filters = ["Today", "Weekly", "Monthly", "Yearly"];

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("Today");
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [yourPosition, setYourPosition] = useState({
    rank: 0,
    name: "",
    score: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLeaderboard = async (filter: string) => {
    try {
      setLoading(true);
      const token = Cookies.get("token");
      const deviceId = Cookies.get("deviceId");
      if (!deviceId) {
        router.push("/");
      }

      let endpoint = "";
      switch (filter) {
        case "Today":
          endpoint = "/api/leaderboard/daily";
          break;
        case "Weekly":
          endpoint = "/api/leaderboard/weekly";
          break;
        case "Monthly":
          endpoint = "/api/leaderboard/monthly";
          break;
        case "Yearly":
          endpoint = "/api/leaderboard/all-time";
          break;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leaderboard data");
      }

      const data = await response.json();
      setLeaderboardData(data.data.leaderboard);

      // Get current user's position
      const userResponse = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
        }/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const user = userData.data.user;
        const userRank =
          data.data.leaderboard.findIndex(
            (entry: any) => entry._id === user._id
          ) + 1;

        setYourPosition({
          rank: userRank || 0,
          name: user.name,
          score: user.score,
        });
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch leaderboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeFilter);
  }, [activeFilter]);

  return (
    <div
      className={`min-h-screen w-full flex flex-col bg-gradient-to-br from-[#181924] via-[#1a1b2e] to-[#23243a] relative ${poppins.className}`}
      style={{
        minHeight: "100vh",
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
          Leaderboard
        </div>
        <div className="p-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#2CF0FA] via-[#F05CE6] to-[#893DE6] flex items-center justify-center">
            <svg
              width="24"
              height="24"
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
      </div>

      {/* Card */}
      <div className="relative max-w-[768px] mx-auto w-full rounded-2xl mt-2 pb-8 pt-2 px-0 shadow-lg border border-t-1 border-x-0 border-b-0 border-[#2CF0FA]/30">
        {/* Filter Tabs */}
        <div className="w-full max-w-[768px] mx-auto px-4 flex justify-between gap-3 pt-4 pb-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 px-2 py-2 rounded-lg font-semibold text-base transition-all border-2
                ${
                  activeFilter === filter
                    ? "bg-gradient-to-r from-[#2CF0FA] to-[#F05CE6] "
                    : "bg-transparent text-white border-white/40 hover:border-[#2CF0FA]"
                }
              `}
              style={
                activeFilter === filter
                  ? { boxShadow: "0 0 0 2px #2CF0FA, 0 0 8px #F05CE6" }
                  : {}
              }
            >
              {filter}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-white text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : (
          <>
            {/* Table header */}
            <div className="flex justify-between px-10 pb-2 pt-6">
              <span
                className="text-white text-xl font-bold"
                style={{ fontFamily: "inherit" }}
              >
                Participant
              </span>
              <span
                className="text-white text-xl font-bold"
                style={{ fontFamily: "inherit" }}
              >
                Score
              </span>
            </div>
            {/* List */}
            <div className="px-10">
              {leaderboardData.map((entry: any, idx: number) => (
                <div
                  key={entry._id}
                  className="flex items-center justify-between py-2 relative"
                >
                  <div className="flex items-center gap-3">
                    {/* Show avatar only for top 3 */}
                    {idx < 3 && (
                      <Image
                        src="/position.png"
                        alt="Avatar"
                        width={32}
                        height={32}
                      />
                    )}
                    <span
                      className={`text-white text-lg font-bold ${
                        idx < 3
                          ? "bg-gradient-to-r from-[#2CF0FA] via-[#F05CE6] to-[#893DE6] bg-clip-text text-transparent"
                          : ""
                      }`}
                    >{`${idx + 1}. ${entry.name}`}</span>
                  </div>
                  <span
                    className={`text-white text-lg font-bold ${
                      idx < 3
                        ? "bg-gradient-to-r from-[#2CF0FA] via-[#F05CE6] to-[#893DE6] bg-clip-text text-transparent"
                        : ""
                    }`}
                  >
                    {entry.score}
                  </span>
                  {/* Neon line */}
                  <div
                    className={`absolute left-0 right-0 bottom-0 h-[2px] ${
                      idx < 3
                        ? "bg-gradient-to-r from-[#2CF0FA] via-[#F05CE6] to-[#893DE6]"
                        : "bg-[#2CF0FA]/30"
                    }`}
                  ></div>
                </div>
              ))}
            </div>

            {/* Your Position */}
            <div className="mt-10 px-10">
              <div className="text-white text-lg font-semibold mb-2">
                Your Position
              </div>
              <div
                className="rounded-lg px-4 py-3 flex items-center justify-between shadow-lg"
                style={{ background: "rgba(44,240,250,0.6)" }}
              >
                <span className="text-white text-lg font-bold">
                  {yourPosition.rank}. {yourPosition.name}
                </span>
                <span className="text-white text-lg font-bold">
                  {yourPosition.score}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
