"use client";

import { Jersey_15, Poppins } from "next/font/google";
import Image from "next/image";
import { useRouter } from "next/navigation";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-poppins",
});

export default function AdminMainPage() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/admin/login");
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      <button
        onClick={handleLogout}
        className="bg-red-500 absolute right-10 top-14 cursor-pointer z-50 text-white font-semibold px-5 py-2 rounded-xl shadow-md hover:bg-red-600 hover:shadow-lg transform hover:scale-105 transition duration-200 ease-in-out"
      >
        Logout
      </button>

      <div
        className="h-screen w-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/adminbg.png')` }}
      >
        <div className="flex flex-col items-center justify-center h-full relative">
          <div
            className="bg-center bg-cover bg-no-repeat w-[90%] md:w-[70%] h-[80%] md:h-[75%] rounded-xl md:rounded-3xl relative"
            style={{ backgroundImage: `url('/adminbg.png)` }}
          >
            <div className="absolute inset-0 rounded-xl md:rounded-3xl bg-black opacity-75 z-10" />

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
                  NEOJA Basketball Quiz
                </h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-2 md:gap-4 2xl:gap-8 w-[90%] md:w-[80%] mt-8 md:mt-0">
                <Image
                  src={"/baseballfull.png"}
                  width={100}
                  height={100}
                  alt="Baseball decoration"
                  style={{ position: "absolute", top: 0, right: 0 }}
                />
                {btnsArr.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => router.push(item.path)}
                    className={`relative overflow-hidden group cursor-pointer text-white px-4 py-2 md:py-3 2xl:py-4 4k:py-8 rounded-lg text-xs md:text-sm 2xl:text-xl 4k:text-[30px] font-semibold w-full flex items-center justify-center min-h-[40px] md:min-h-[50px] 2xl:min-h-[60px] transition-all border-2 border-transparent hover:bg-gradient-to-r hover:from-[#2CF0FA] hover:via-[#F05CE6] hover:to-[#893DE6] ${poppins.className}`}
                    style={{
                      borderImage:
                        "linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6) 1",
                      borderImageSlice: 1,
                    }}
                  >
                    {item.title}
                  </button>
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

      <div className="absolute top-0 left-0 w-full h-full  opacity-50 z-0" />
    </div>
  );
}

const btnsArr = [
  { id: 1, title: "Upload Questions", path: "/admin/questions" },
  { id: 2, title: "Quiz Settings", path: "/admin/settings" },
  { id: 3, title: "Users Edit", path: "/admin/users" },
  { id: 4, title: "Specific Timer Best Settings", path: "/admin/specialbest" },
];
