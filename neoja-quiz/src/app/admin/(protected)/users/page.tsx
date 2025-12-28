"use client";

import { Jersey_15, Poppins } from "next/font/google";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: "400" });

const Loader = () => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
    <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#F5BD1D]"></div>
  </div>
);

interface UserRanking {
  position: number;
  highestScore: number;
}

interface UserRankings {
  allTime: UserRanking;
  weekly: UserRanking;
  monthly: UserRanking;
  daily: UserRanking;
}

interface User {
  userId: string;
  fullName: string;
  role: string;
  rankings: UserRankings;
  attempts: number;
}

export default function EditUsers() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredData, setFilteredData] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("You must be logged in to view users");
      }

      const response = await fetch("http://localhost:3000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (data.status === "success") {
        setUsers(data.data.users);
        setFilteredData(data.data.users);
      } else {
        toast.error(data.message || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().trim();
    setQuery(value);

    if (!value) {
      setFilteredData(users);
      return;
    }

    const filtered = users.filter((item) => {
      const fullName = item?.fullName?.toLowerCase() || "";
      const position = item?.rankings?.allTime?.position?.toString() || "";
      const allTimeScore =
        item?.rankings?.allTime?.highestScore?.toString() || "";
      const weeklyScore =
        item?.rankings?.weekly?.highestScore?.toString() || "";
      const monthlyScore =
        item?.rankings?.monthly?.highestScore?.toString() || "";
      const dailyScore = item?.rankings?.daily?.highestScore?.toString() || "";

      return (
        fullName.includes(value) ||
        position.includes(value) ||
        allTimeScore.includes(value) ||
        weeklyScore.includes(value) ||
        monthlyScore.includes(value) ||
        dailyScore.includes(value)
      );
    });

    setFilteredData(filtered);
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {(isLoading || isDeleting) && <Loader />}

      <div className="absolute top-0 left-0 w-full h-full  opacity-50 z-0" />

      <div
        className="h-screen w-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/adminbg.png')` }}
      >
        <div className="flex flex-col items-center justify-center h-full relative z-10">
          <div className="bg-center bg-cover bg-no-repeat w-[95%] md:w-[85%] lg:w-[80%] h-[85%] md:h-[80%] rounded-xl md:rounded-3xl relative">
            <Image
              src={"/baseballfull.png"}
              width={100}
              height={100}
              alt="Baseball decoration"
              className="absolute top-0 right-0"
            />
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
                  User Edits
                </h1>
              </div>

              <div className="flex flex-col gap-4 w-full h-[90%] px-4 md:px-8 mt-8 md:mt-0">
                <div className="flex items-center justify-center">
                  <div
                    style={{
                      background:
                        "linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)",
                      padding: "2px",
                      borderRadius: "9999px",
                    }}
                    className="w-[90%] md:w-[60%] mt-2 2xl:mt-8"
                  >
                    <div className="flex flex-row bg-black rounded-full justify-between items-center px-4 md:px-8">
                      <input
                        type="text"
                        placeholder="Search by name, position or score..."
                        value={query}
                        onChange={handleSearch}
                        className={`bg-transparent w-full text-[10px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[20px] px-3 h-[30px] md:h-[35px] 2xl:h-[55px] text-white rounded-full focus:outline-none ${poppins.className}`}
                      />
                      <Image
                        src={"/search.png"}
                        alt="search"
                        width={40}
                        height={40}
                        className="size-4 md:size-6 2xl:size-10 cursor-pointer hover:opacity-80"
                        onClick={() =>
                          handleSearch({
                            target: { value: query },
                          } as React.ChangeEvent<HTMLInputElement>)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div
                    style={{
                      background:
                        "linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)",
                      padding: "2px",
                      borderRadius: "12px",
                    }}
                    className="rounded-xl md:rounded-2xl shadow-lg mb-4"
                  >
                    <div className="bg-black rounded-xl md:rounded-2xl p-2 md:p-4">
                      <div className="flex items-center justify-between">
                        <h1
                          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-white text-nowrap w-[100px] md:w-[150px] 2xl:w-[200px] ${poppins.className}`}
                        >
                          # Name
                        </h1>
                        <h1
                          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-white text-nowrap min-w-[40px] text-center ${poppins.className}`}
                        >
                          Position
                        </h1>
                        <h1
                          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-white text-nowrap min-w-[40px] text-center ${poppins.className}`}
                        >
                          Daily
                        </h1>
                        <h1
                          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-white text-nowrap min-w-[40px] text-center ${poppins.className}`}
                        >
                          Weekly
                        </h1>
                        <h1
                          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-white text-nowrap min-w-[40px] text-center ${poppins.className}`}
                        >
                          Monthly
                        </h1>
                        <h1
                          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-white text-nowrap min-w-[40px] text-center ${poppins.className}`}
                        >
                          Yearly
                        </h1>
                        <div className="w-[60px] md:w-[100px]" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-4">
                    {filteredData.map((user, index) => (
                      <div
                        key={user.userId}
                        style={{
                          background:
                            "linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)",
                          padding: "2px",
                          borderRadius: "8px",
                        }}
                        className="rounded-lg"
                      >
                        <TableCol
                          id={index + 1}
                          name={user.fullName}
                          allTimeRank={user.rankings.allTime}
                          weeklyRank={user.rankings.weekly}
                          monthlyRank={user.rankings.monthly}
                          dailyRank={user.rankings.daily}
                          userData={user}
                          setIsDeleting={setIsDeleting}
                          onUserDeleted={fetchUsers}
                        />
                      </div>
                    ))}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TableColProps {
  id: number;
  name: string;
  allTimeRank: UserRanking;
  weeklyRank: UserRanking;
  monthlyRank: UserRanking;
  dailyRank: UserRanking;
  userData: User;
  setIsDeleting: (value: boolean) => void;
  onUserDeleted: () => void;
}

const TableCol = ({
  id,
  name,
  allTimeRank,
  weeklyRank,
  monthlyRank,
  dailyRank,
  userData,
  setIsDeleting,
  onUserDeleted,
}: TableColProps) => {
  const router = useRouter();
  const isAdmin = userData.role === "admin";
  const currentUserId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  const handleDelete = async () => {
    try {
      const confirmed = window.confirm(
        `Are you sure you want to delete user ${name}?`
      );
      if (!confirmed) return;

      setIsDeleting(true);
      const response = await fetch(`/api/admin/users/${userData.userId}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.status === "success") {
        toast.success("User deleted successfully");
        onUserDeleted(); // Refresh the user list
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`${
        isAdmin ? "bg-gray-100" : "bg-white"
      } rounded-lg p-2 md:p-4`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center w-[100px] md:w-[150px] 2xl:w-[200px]">
          <span
            className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-black mr-1 ${poppins.className}`}
          >
            {id}.
          </span>
          <div className="flex flex-col">
            <span
              className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-black truncate ${poppins.className}`}
              title={name}
            >
              {name.length > 8 ? `${name.slice(0, 8)}...` : name}
            </span>
            {/* {isAdmin && (
              <span className={`inline-block px-2 py-0.5 rounded-full text-[6px] md:text-[8px] 2xl:text-sm font-semibold w-fit ${poppins.className} ${
                userData.userId === currentUserId 
                  ? 'bg-[#FF6201] text-white' 
                  : 'bg-[#F77822]/20 text-[#F77822]'
              }`}>
                {userData.userId === currentUserId ? 'You' : 'Admin'}
              </span>
            )} */}
          </div>
        </div>

        <h1
          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-black min-w-[40px] text-center ${poppins.className}`}
        >
          {allTimeRank?.position || "-"}
        </h1>
        <h1
          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-black min-w-[40px] text-center ${poppins.className}`}
        >
          {dailyRank?.highestScore || "-"}
        </h1>
        <h1
          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-black min-w-[40px] text-center ${poppins.className}`}
        >
          {weeklyRank?.highestScore || "-"}
        </h1>
        <h1
          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-black min-w-[40px] text-center ${poppins.className}`}
        >
          {monthlyRank?.highestScore || "-"}
        </h1>
        <h1
          className={`text-[10px] md:text-sm 2xl:text-3xl font-bold text-black min-w-[40px] text-center ${poppins.className}`}
        >
          {allTimeRank?.highestScore || "-"}
        </h1>
        <div className="flex gap-2 min-w-[60px] md:min-w-[80px] justify-end">
          <button
            onClick={() => {
              const userDataString = JSON.stringify({
                fullName: name,
                userId: userData.userId,
                rankings: {
                  allTime: allTimeRank || { position: 0, highestScore: 0 },
                  weekly: weeklyRank || { position: 0, highestScore: 0 },
                  monthly: monthlyRank || { position: 0, highestScore: 0 },
                  daily: dailyRank || { position: 0, highestScore: 0 },
                },
                attempts: userData.attempts,
                role: userData.role,
              });
              router.push(
                `/admin/editform?userData=${encodeURIComponent(userDataString)}`
              );
            }}
            className="bg-transparent"
          >
            <Image
              src={"/edit.png"}
              alt="edit"
              width={36}
              height={36}
              className="w-4 md:w-6 2xl:w-9"
            />
          </button>
          {userData.userId !== currentUserId && (
            <button
              onClick={handleDelete}
              className="bg-transparent hover:opacity-70"
            >
              <Image
                src={"/delete.png"}
                alt="delete"
                width={36}
                height={36}
                className="w-4 md:w-6 2xl:w-9"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
