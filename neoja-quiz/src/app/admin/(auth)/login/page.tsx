"use client";

import { useRouter } from "next/navigation";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { Poppins } from "next/font/google";
import { Jersey_15 } from "next/font/google";
import Image from "next/image";
import Cookies from "js-cookie";
import useWebHandler from "@/app/remote/WebHandler";
import urls from "@/app/remote/Urls";
import Snackbar from "@/app/components/Snackbar";

interface LoginResponse {
  token: string;
  data: {
    user: {
      email: string;
      role: string;
    };
  };
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function AdminLoginPage() {
  const router = useRouter();
  const { post } = useWebHandler();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: "",
    type: "success" as "success" | "error" | "info",
  });

  // Setup admin on component mount
  useEffect(() => {
    const setupAdmin = async () => {
      try {
        const response = await fetch(urls.ADMIN_SETUP, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Cookies.get("token") || ""}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        console.log("Admin setup response:", data);
      } catch (error) {
        // Ignore error if admin already exists
        console.log("Admin setup:", error);
      }
    };
    setupAdmin();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({
        isVisible: true,
        message: "Please fix the errors in the form",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await post<LoginResponse>(urls.ADMIN_LOGIN, {
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error("No data received from server");
      }

      if (data.token) {
        Cookies.set("token", data.token, { expires: 365 });
        Cookies.set("userRole", data.data.user.role, { expires: 365 });
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setSnackbar({
        isVisible: true,
        message: "Login successful!",
        type: "success",
      });

      // Navigate to admin dashboard after a short delay
      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (error) {
      console.error("Error submitting form:", error);
      let errorMessage = "An error occurred. Please try again.";

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        errorMessage =
          "Unable to connect to the server. Please check if the server is running.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setSnackbar({
        isVisible: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center relative px-4 ${poppins.className} `}
      style={{
        backgroundColor: "#181924",
      }}
    >
      <div className="max-w-[768px] mx-auto w-full mb-20">
        {/* Top bar with back arrow */}
        <div
          className="absolute z-20 "
          style={{
            borderRadius: "3px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button onClick={() => router.back()} aria-label="Back">
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
        </div>
        {/* Logo and basketball icon */}
        <div className="w-full flex flex-col  items-center relative">
          <div className="text-center mt-12 ">
            <div
              className={`text-6xl font-extrabold tracking-widest ${jersey15.className}`}
              style={{
                fontFamily: "Jersey 15",
                letterSpacing: "0.1em",
                background: "linear-gradient(90deg, #2CF0FA, #F05CE6, #893DE6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              NEOJA
            </div>
            <div
              className={`text-6xl font-extrabold mb-6 tracking-widest ${jersey15.className}`}
              style={{
                fontFamily: "Jersey 15",
                letterSpacing: "0.1em",
                background: "linear-gradient(90deg, #2CF0FA, #F05CE6, #893DE6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              BRAINBALL
            </div>
          </div>
          <Image
            src="/baseball.png"
            alt="Basketball"
            width={100}
            height={100}
            className="absolute right-0 top-0"
            style={{ right: "-10px", top: "-10px" }}
          />
        </div>
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className={`w-full flex flex-col gap-6 mt-2 px-4 ${poppins.className}`}
        >
          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1 tracking-widest">
              Email
            </label>
            <input
              type="email"
              name="email"
              className={`w-full bg-transparent border-0 border-b-2 ${
                errors.email ? "border-red-500" : "border-[#F05CE6]"
              } focus:border-[#2CF0FA] outline-none text-white text-base font-regular placeholder-gray-500 py-2 ${
                poppins.className
              } [&:not(:placeholder-shown)]:bg-transparent`}
              placeholder="admin@neoja.com"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-xs uppercase text-gray-400 mb-1 tracking-widest">
              Password
            </label>
            <input
              type="password"
              name="password"
              className={`w-full bg-transparent border-0 border-b-2 ${
                errors.password ? "border-red-500" : "border-[#F05CE6]"
              } focus:border-[#2CF0FA] outline-none text-white text-base font-regular placeholder-gray-500 py-2 ${
                poppins.className
              } [&:not(:placeholder-shown)]:bg-transparent`}
              placeholder="Password ***"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Gradient border button at the bottom */}
          <div className="mt-8">
            <div
              className="p-[2px] rounded-xl w-full"
              style={{
                background:
                  "linear-gradient(90deg, #2CF0FA 0%, #F05CE6 50%, #893DE6 100%)",
              }}
            >
              <div className="rounded-xl bg-[#181924] w-full">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-8 py-2 rounded-xl ${
                    jersey15.className
                  }  text-2xl font-bold bg-transparent text-cyan-200 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Snackbar
        isVisible={snackbar.isVisible}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
