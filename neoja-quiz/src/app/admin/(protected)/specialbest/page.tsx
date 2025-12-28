'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Jersey_15, Poppins } from "next/font/google";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Image from "next/image";
import { toast } from "react-hot-toast";

const jersey15 = Jersey_15({ subsets: ["latin"], weight: "400" });
const poppins = Poppins({ subsets: ["latin"], weight: "400" });

interface FormData {
  topBestPlayer: string;
  startDate: string;
  endDate: string;
}

const SpecialBest = (): React.ReactElement => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    topBestPlayer: "10",
    startDate: "",
    endDate: "",
  });

  const [initialData, setInitialData] = useState<FormData>({
    topBestPlayer: "",
    startDate: "",
    endDate: "",
  });

  const [isFormChanged, setIsFormChanged] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsInitialLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/admin/special-best', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        if (data.status === 'success' && data.data.settings) {
          const settings = data.data.settings;
          const newFormData = {
            topBestPlayer: settings.topBestPlayer.toString(),
            startDate: settings.startDate,
            endDate: settings.endDate
          };
          setFormData(newFormData);
          setInitialData(newFormData);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load current settings');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    const hasChanged =
      formData.topBestPlayer !== initialData.topBestPlayer ||
      formData.startDate !== initialData.startDate ||
      formData.endDate !== initialData.endDate;
    setIsFormChanged(hasChanged);
  }, [formData, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'topBestPlayer') {
      if (value === '' || /^\d*$/.test(value)) {
        newValue = value;
      } else {
        return;
      }
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: newValue
    }));
  };

  const handleDateChange = (date: Date | null, name: string) => {
    if (!date) return;
    
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');

    setFormData(prevState => ({
      ...prevState,
      [name]: formattedDate
    }));
  };

  const validateForm = () => {
    const topBestPlayer = parseInt(formData.topBestPlayer);
    if (isNaN(topBestPlayer) || topBestPlayer < 1) {
      toast.error("Top Best Player count must be a positive number");
      return false;
    }

    if (!formData.startDate.trim()) {
      toast.error("Start date cannot be empty");
      return false;
    }

    if (!formData.endDate.trim()) {
      toast.error("End date cannot be empty");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!isFormChanged) {
      toast("No changes made");
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const payload = {
        topBestPlayer: parseInt(formData.topBestPlayer),
        startDate: formData.startDate,
        endDate: formData.endDate
      };

      console.log('Form Data:', formData);
      console.log('Sending payload:', payload);
      console.log('Payload type:', typeof payload.topBestPlayer);

      const response = await fetch('http://localhost:3000/api/admin/special-best', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      console.log("Response status:", response.status);
      const responseData = await response.json();
      console.log("Response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
      }
      
      if (responseData.status === 'success') {
        toast.success("Special best settings updated successfully!");
        router.push("/admin");
      } else {
        throw new Error(responseData.message || "Failed to update settings");
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast.error(error instanceof Error ? error.message : "Failed to update settings");
    } finally {
      setIsLoading(false);
    }
  };

  const onSaveClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden">
      {(isLoading || isInitialLoading) && (
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
            <div className="absolute inset-0 rounded-xl md:rounded-3xl bg-black opacity-75 z-10" style={{ borderWidth: 1, borderColor: '#2CF0FA' }} />
            <Image
              src={'/baseballfull.png'}
              width={100}
              height={100}
              alt="Baseball decoration"
              style={{ position: 'absolute', top: 0, right: 0 }}
            />
            <form onSubmit={onSaveClick} className="flex flex-col items-center justify-center h-full relative z-20">
              <div className="absolute top-[-15px] md:top-[-25px] 4k:top-[-40px] px-4 md:px-10 py-2 4k:py-9 rounded-xl shadow-lg" style={{
                background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)'
              }}>
                <h1 className={`text-sm md:text-2xl 2xl:text-4xl 4k:text-[50px] font-bold text-nowrap ${jersey15.className} text-white`}>
                  Special Best Settings
                </h1>
              </div>

              <div className="flex flex-col gap-6 md:gap-8 2xl:gap-12 w-[90%] md:w-[80%] mt-12 md:mt-8">
                <div className="flex flex-col gap-2 md:gap-3 4k:gap-6">
                  <label className={`text-white text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                    Top Best Player
                  </label>
                  <div className="flex justify-center w-full p-[2px] rounded-full" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                    <input
                      type="text"
                      name="topBestPlayer"
                      value={formData.topBestPlayer}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 md:py-3 2xl:py-2 4k:py-2 rounded-full text-center text-2xl md:text-4xl 2xl:text-6xl 4k:text-[80px] !bg-white text-black focus:outline-none ${poppins.className}`}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2 md:gap-3 4k:gap-6">
                  <label className={`text-white text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                    Pick Date
                  </label>
                  <div className="flex flex-row items-center justify-center gap-4 md:gap-8 w-full p-[2px] md:p-[3px] 2xl:p-[4px] 4k:p-[6px] rounded-full" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                    <div className="flex flex-row items-center justify-center gap-4 md:gap-8 w-full bg-white rounded-full p-2 md:p-3 2xl:p-4 4k:p-6">
                      <div className="flex flex-row items-center !bg-white rounded-md p-[2px] w-[250px] md:w-[300px] lg:w-[350px]" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                        <div className="flex flex-row items-center w-full !bg-white rounded-md px-2 md:px-4">
                          <div className="flex flex-row items-center w-full ml-4 md:ml-6 lg:ml-10">
                            <DatePicker
                              selected={formData.startDate ? new Date(formData.startDate.split('-').reverse().join('-')) : null}
                              onChange={(date) => handleDateChange(date, 'startDate')}
                              dateFormat="dd-MM-yyyy"
                              placeholderText="31-10-2024"
                              className={`w-[100px] md:w-[120px] lg:w-[150px] ml-2 md:ml-4 lg:ml-10 text-xs md:text-base 2xl:text-xl 4k:text-[30px] !bg-white text-black py-4 md:py-6 rounded-md focus:outline-none ${poppins.className}`}
                            />
                            <Image
                              src={'/calendar.png'}
                              width={24}
                              height={24}
                              className="w-[20px] md:w-[24px] lg:w-[30px] h-auto"
                              alt="Calendar icon"
                            />
                          </div>
                        </div>
                      </div>
                      <span className={`text-black text-sm md:text-xl 2xl:text-3xl 4k:text-[50px] font-bold ${poppins.className}`}>
                        to
                      </span>
                      <div className="flex flex-row items-center !bg-white rounded-md p-[2px] w-[250px] md:w-[300px] lg:w-[350px]" style={{ background: 'linear-gradient(to right, #2CF0FA, #F05CE6, #893DE6)' }}>
                        <div className="flex flex-row items-center w-full !bg-white rounded-md px-2 md:px-4">
                          <div className="flex flex-row items-center w-full ml-4 md:ml-6 lg:ml-10">
                            <DatePicker
                              selected={formData.endDate ? new Date(formData.endDate.split('-').reverse().join('-')) : null}
                              onChange={(date) => handleDateChange(date, 'endDate')}
                              dateFormat="dd-MM-yyyy"
                              placeholderText="31-10-2024"
                              className={`w-[100px] md:w-[120px] lg:w-[150px] ml-2 md:ml-4 lg:ml-10 text-xs md:text-base 2xl:text-xl 4k:text-[30px] !bg-white text-black py-4 md:py-6 rounded-md focus:outline-none ${poppins.className}`}
                            />
                            <Image
                              src={'/calendar.png'}
                              width={24}
                              height={24}
                              className="w-[20px] md:w-[24px] lg:w-[30px] h-auto"
                              alt="Calendar icon"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-6 md:mt-8 2xl:mt-12">
                  <button
                    type="submit"
                    disabled={!isFormChanged || isLoading}
                    className={`bg-[#F5BD1D] px-8 md:px-12 py-3 md:py-4 2xl:py-6 4k:py-9 rounded-xl text-sm md:text-lg 2xl:text-2xl 4k:text-[40px] font-bold text-white transition-all duration-300 hover:bg-[#F5BD1D]/90 hover:shadow-lg transform hover:scale-105 ${poppins.className}
                      ${(!isFormChanged || isLoading) ? 'opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none' : ''}`}
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
          <Image
            src={'/avatar.png'}
            width={400}
            height={400}
            alt="Baseball decoration"
            className="w-[200px] md:w-[300px] 2xl:w-[400px] 4k:w-[500px] h-auto"
            style={{ position: 'absolute', bottom: 0, right: 0, zIndex: 9999999 }}
          />
        </div>
      </div>
    </div>
  );
};

export default SpecialBest;