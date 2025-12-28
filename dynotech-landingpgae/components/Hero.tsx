import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useToast from "@/hooks/usetoast";
import Link from "next/link";
import { useState } from "react";

export function Hero() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    // Validate email format
    if (!validateEmail(email)) {
      showError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      showSuccess("You've been added to the waitlist! We'll keep you updated.");
      setEmail(""); // Clear the input after successful submission
    } catch (error: any) {
      showError(error.message || "Failed to join waitlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-6 py-20 lg:py-32 text-center">
      <div className="max-w-5xl mx-auto">
        <p className="text-gray-500 text-sm font-medium mb-8 tracking-wide w-fit mx-auto border border-gray-200 rounded-full px-4 py-2 bg-[#FBFBFB]">
          4 Products Launching This Year
        </p>

        <h1 className="text-5xl lg:text-7xl font-bold mb-8 leading-[1.1] tracking-tight">
          <span className="text-orange-500 mr-1 font-medium relative italic">
            Innovative
            <span className="hidden lg:block absolute bottom-2 -rotate-[1.3deg] right-0 w-[70%] h-[4px] bg-gradient-to-r from-orange-500 via-orange-300 to-orange-50 rounded-full"></span>
            <span className="hidden lg:flex absolute bottom-0 -rotate-[6.2deg] justify-end transform left-0 w-[31%] h-[4px] bg-orange-500 rounded-full"></span>
          </span>{" "}
          <span className="text-gray-900">solutions for</span>
          <br />
          <span className="text-gray-900">modern business</span>
        </h1>

        <p className="text-[#2A2A2A] text-[16px] lg:text-2xl mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
          Dynotech Innovations is building the next generation
          <br className="hidden lg:block" />
          of financial, communication, and infrastructure tools
          <br className="hidden lg:block" />
          for businesses worldwide.
        </p>

        <div className="mx-auto mb-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Input
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your Email"
            className="w-full sm:w-1/3 h-14 px-5 text-base border-gray-200 rounded-xl focus:border-orange-500 focus:ring-orange-500 outline-none focus:outline-none"
            disabled={isLoading}
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-40 h-14 text-white font-semibold rounded-xl text-base transition-all duration-200 bg-[linear-gradient(97.71deg,#FF842C_6.77%,#F17821_95.07%)] hover:bg-[linear-gradient(97.71deg,#FF7C1E_6.77%,#EB6B0F_95.07%)] active:bg-[linear-gradient(97.71deg,#F77519_6.77%,#EB6B0F_95.07%)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Joining..." : "Join Waitlist"}
          </Button>
        </div>

        <p className="text-black text-base font-bold">
          or{" "}
          <Link
            href="#products"
            className="text-gray-900 underline hover:no-underline font-medium"
          >
            take a look at the products
          </Link>
        </p>
      </div>
    </section>
  );
}
