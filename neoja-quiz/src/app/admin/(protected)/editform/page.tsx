'use client';

import React, { useState, useEffect, ChangeEvent, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Jersey_15, Poppins } from "next/font/google";
import { toast } from 'react-hot-toast';
import Image from "next/image";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: "400" });

interface FormData {
  fullName: string;
  maxAttempts: string;
  targetUserId: string;
  position: string;
  dailyScore: string;
  weeklyScore: string;
  monthlyScore: string;
  yearlyScore: string;
}

const EditFormContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userDataParam = searchParams.get('userData');

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    maxAttempts: "",
    targetUserId: "",
    position: "",
    dailyScore: "",
    weeklyScore: "",
    monthlyScore: "",
    yearlyScore: ""
  });

  const [initialData, setInitialData] = useState<FormData>({
    fullName: "",
    maxAttempts: "",
    targetUserId: "",
    position: "",
    dailyScore: "",
    weeklyScore: "",
    monthlyScore: "",
    yearlyScore: ""
  });

  const [isFormChanged, setIsFormChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        const data: FormData = {
          fullName: userData.fullName || "",
          maxAttempts: userData.attempts?.toString() || "",
          targetUserId: userData.userId || "",
          position: userData.rankings?.allTime?.position?.toString() || "",
          dailyScore: userData.rankings?.daily?.highestScore?.toString() || "",
          weeklyScore: userData.rankings?.weekly?.highestScore?.toString() || "",
          monthlyScore: userData.rankings?.monthly?.highestScore?.toString() || "",
          yearlyScore: userData.rankings?.allTime?.highestScore?.toString() || ""
        };
        setFormData(data);
        setInitialData(data);
      } catch (error) {
        console.error('Error parsing user data:', error);
        toast.error('Invalid user data');
        router.push('/admin/users');
      }
    }
  }, [userDataParam, router]);

  useEffect(() => {
    const hasChanged =
      formData.fullName !== initialData.fullName ||
      formData.maxAttempts !== initialData.maxAttempts ||
      formData.position !== initialData.position ||
      formData.dailyScore !== initialData.dailyScore ||
      formData.weeklyScore !== initialData.weeklyScore ||
      formData.monthlyScore !== initialData.monthlyScore ||
      formData.yearlyScore !== initialData.yearlyScore;
    setIsFormChanged(hasChanged);
  }, [formData, initialData]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (['dailyScore', 'weeklyScore', 'monthlyScore', 'yearlyScore', 'maxAttempts'].includes(name)) {
      // Allow empty string or numbers only
      if (value === '' || /^\d*$/.test(value)) {
        newValue = value;
      } else {
        return; // Don't update if not a valid number
      }
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: newValue
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Participant name cannot be empty");
      return false;
    }

    if (!formData.position.trim()) {
      toast.error("Position cannot be empty");
      return false;
    }

    const scoreFields = ['dailyScore', 'weeklyScore', 'monthlyScore', 'yearlyScore'] as const;
    for (const field of scoreFields) {
      const score = parseInt(formData[field]);
      if (isNaN(score) || score < 0) {
        toast.error(`${field.replace('Score', ' Score').replace(/([A-Z])/g, ' $1').trim()} must be a non-negative number`);
        return false;
      }
    }

    const maxAttempts = parseInt(formData.maxAttempts);
    if (isNaN(maxAttempts) || maxAttempts < 1) {
      toast.error("Max attempts must be a positive number");
      return false;
    }

    if (maxAttempts > 10) {
      toast.error("Max attempts cannot exceed 10");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!isFormChanged) {
      toast("No changes made", { icon: 'ℹ️' });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`http://localhost:3000/api/admin/users/${formData.targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          position: formData.position,
          maxAttempts: parseInt(formData.maxAttempts),
          rankings: {
            daily: { highestScore: parseInt(formData.dailyScore) },
            weekly: { highestScore: parseInt(formData.weeklyScore) },
            monthly: { highestScore: parseInt(formData.monthlyScore) },
            allTime: { highestScore: parseInt(formData.yearlyScore) }
          }
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        toast.success("Settings updated successfully!");
        router.push("/admin/users");
      } else {
        toast.error(data.message || "Failed to update settings");
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  const onSaveClick = (e: FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#F5BD1D]"></div>
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full opacity-50 z-0" />
      
      <div
        className="h-screen w-screen bg-cover bg-no-repeat bg-center"
        style={{ backgroundImage: `url('/adminbg.png')` }}
      >
        <div className="flex flex-col items-center justify-center h-full relative z-10">
          <div className="bg-center bg-cover bg-no-repeat w-[95%] md:w-[85%] lg:w-[80%] h-[85%] md:h-[80%] rounded-xl md:rounded-3xl relative">
          <div className="absolute inset-0 rounded-xl md:rounded-3xl bg-black opacity-75 z-10"  style={{borderWidth:1,borderColor:'#2CF0FA'}}/>
   <Image
                  src={'/baseballfull.png'} 
                  width={100} 
                  height={100} 
                  alt="Baseball decoration"
                  style={{position:'absolute', top:0,right:0}}
                />
            <div className="flex flex-col items-center justify-center h-full relative z-20">
            <div className="absolute top-[-15px] md:top-[-25px] 4k:top-[-40px] px-4 md:px-10 py-2 4k:py-9 rounded-xl shadow-lg" style={{
                background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)'
              }}>
                <h1 className={`text-sm md:text-2xl 2xl:text-4xl 4k:text-[50px] font-bold text-nowrap ${jersey15.className} text-white`}>
                  Edit Form
                </h1>
              </div>

              <div className="flex flex-col gap-6 md:gap-8 2xl:gap-12 w-[90%] md:w-[80%] mt-12 md:mt-8">
                <div className="flex flex-col gap-2 md:gap-3 4k:gap-6">
                  <label className={`text-white text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                    Participant Name
                  </label>
                  <div className="w-full p-[2px] rounded-xl" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 md:py-3 2xl:py-4 4k:py-9 rounded-xl text-xs md:text-base 2xl:text-xl 4k:text-[30px] !bg-white text-black focus:outline-none ${poppins.className}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:gap-3 4k:gap-6">
                  <label className={`text-white text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                    Position
                  </label>
                  <div className="w-full p-[2px] rounded-xl" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 md:py-3 2xl:py-4 4k:py-9 rounded-xl text-xs md:text-base 2xl:text-xl 4k:text-[30px] !bg-white text-black focus:outline-none ${poppins.className}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 2xl:gap-12">
                  <div className="flex flex-col gap-2 md:gap-3 4k:gap-6 flex-1">
                    <label className={`text-white text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                      Daily Score
                    </label>
                    <div className="w-full p-[2px] rounded-xl" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                      <input
                        type="text"
                        name="dailyScore"
                        value={formData.dailyScore}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 md:py-3 2xl:py-4 4k:py-9 rounded-xl text-xs md:text-base 2xl:text-xl 4k:text-[30px] !bg-white text-black focus:outline-none ${poppins.className}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:gap-3 4k:gap-6 flex-1">
                    <label className={`text-white text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                      Weekly Score
                    </label>
                    <div className="w-full p-[2px] rounded-xl" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                      <input
                        type="text"
                        name="weeklyScore"
                        value={formData.weeklyScore}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 md:py-3 2xl:py-4 4k:py-9 rounded-xl text-xs md:text-base 2xl:text-xl 4k:text-[30px] !bg-white text-black focus:outline-none ${poppins.className}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-8 2xl:gap-12">
                  <div className="flex flex-col gap-2 md:gap-3 4k:gap-6 flex-1">
                    <label className={`text-white text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                      Monthly Score
                    </label>
                    <div className="w-full p-[2px] rounded-xl" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                      <input
                        type="text"
                        name="monthlyScore"
                        value={formData.monthlyScore}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 md:py-3 2xl:py-4 4k:py-9 rounded-xl text-xs md:text-base 2xl:text-xl 4k:text-[30px] !bg-white text-black focus:outline-none ${poppins.className}`}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:gap-3 4k:gap-6 flex-1">
                    <label className={`text-white text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                      Yearly Score
                    </label>
                    <div className="w-full p-[2px] rounded-xl" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                      <input
                        type="text"
                        name="yearlyScore"
                        value={formData.yearlyScore}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-2 md:py-3 2xl:py-4 4k:py-9 rounded-xl text-xs md:text-base 2xl:text-xl 4k:text-[30px] !bg-white text-black focus:outline-none ${poppins.className}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-4 md:mt-8">
                  <button
                    onClick={onSaveClick}
                    disabled={!isFormChanged || isLoading}
                    className={`bg-[#F5BD1D] px-6 md:px-8 py-2 md:py-3 2xl:py-4 4k:py-9 rounded-lg text-sm md:text-base 2xl:text-xl 4k:text-[40px] font-bold text-white transition-colors ${poppins.className}
                      ${(!isFormChanged || isLoading) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#F5BD1D]/80'}`}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <Image src={'/avatar.png'} 
            width={400}
            height={400}
            alt="Baseball decoration"
            className="w-[200px] md:w-[300px] 2xl:w-[400px] 4k:w-[500px] h-auto"
            style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 9999999 }} />
        </div>
      </div>
    </div>
  );
};

export default function EditForm() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-[#F5BD1D]"></div>
      </div>
    }>
      <EditFormContent />
    </Suspense>
  );
}