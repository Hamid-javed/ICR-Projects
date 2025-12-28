'use client';

import { useRouter } from 'next/navigation';
import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import {  Poppins } from 'next/font/google';
import { Jersey_15 } from 'next/font/google';
import Image from 'next/image';
import Snackbar from '../components/Snackbar';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import Cookies from 'js-cookie';
import Urls from '../remote/Urls';
import useWebHandler from '../remote/WebHandler';

interface RegisterResponse {
  data: {
    user: {
      profilePicture: string;
      name: string;
      email: string;
      phone: string;
      gender: string;
    };
  };
  token: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  gender: string;
  avatar?: File | null;
  deviceId?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  gender?: string;
}

const jersey15 = Jersey_15({ subsets: ['latin'], weight: '400' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'] });

export default function RegisterPage() {
  const router = useRouter();
  const { post } = useWebHandler();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    gender: '',
    avatar: null,
    deviceId: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    isVisible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info'
  });
  useEffect(() => {
    const getDeviceId = async () => {
      try {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        console.log("🚀 ~ getDeviceId ~ result:", result);
        const deviceId = result.visitorId;
        console.log("🚀 ~ getDeviceId ~ deviceId:", deviceId)
        setFormData(prev => ({
          ...prev,
          deviceId
        }));
        Cookies.set('deviceId', deviceId, { expires: 365 }); 
      } catch (error) {
        console.error('Error getting device ID:', error);
      }
    };

    getDeviceId();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }

    if (!formData.gender) {
      newErrors.gender = 'Please select a gender';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  // Handler:
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, avatar: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setSnackbar({
        isVisible: true,
        message: 'Please fix the errors in the form',
        type: 'error'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('deviceId', formData.deviceId || '');
      formDataToSend.append('contactNo', formData.phone);
      formDataToSend.append('gender', formData.gender);
      if (formData.avatar) {
        formDataToSend.append('profilePicture', formData.avatar);
      }

      // Make API call using WebHandler
      const { data, error } = await post<RegisterResponse>(Urls.REGISTER_USER, formDataToSend);
      console.log("🚀 ~ handleSubmit ~ data:", data)

      if (error) {
        throw new Error(error);
      }

      if (!data) {
        throw new Error('No data received from server');
      }

      // Store user data and token in cookies
      Cookies.set('userData', JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        profilePicture: data.data.user.profilePicture
      }), { expires: 365 });
      console.log("🚀 ~ handleSubmit ~ data.token:", data.token)
      
      if (data.token) {
        Cookies.set('token', data.token, { expires: 365 });
      }
      
      setSnackbar({
        isVisible: true,
        message: 'Registration successful! Welcome aboard.',
        type: 'success'
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        phone: '',
        gender: '',
        avatar: null,
        deviceId: formData.deviceId // Preserve device ID
      });
      setPreviewUrl(null);

      // Navigate to scan page after a short delay
      setTimeout(() => {
        router.push('/arena');
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Unable to connect to the server. Please check if the server is running.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        isVisible: true,
        message: errorMessage,
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center justify-center relative px-4 ${poppins.className} `}
      style={{
        backgroundColor: '#181924',
      }}
    >
      <div className="max-w-[768px] mx-auto w-full mb-20">
      {/* Top bar with back arrow */}
      <div className="absolute z-20 " style={{ borderRadius: '3px' , justifyContent: 'center', alignItems: 'center'}}>
        <button onClick={() => router.back()} aria-label="Back">
          <svg width="28" height="28" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      {/* Logo and basketball icon */}
      <div className="w-full flex flex-col  items-center relative">
        <div className="text-center mt-12 ">
          <div className={`text-6xl font-extrabold tracking-widest ${jersey15.className}`} style={{ fontFamily: 'Jersey 15', letterSpacing: '0.1em', background: 'linear-gradient(90deg, #2CF0FA, #F05CE6, #893DE6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NEOJA
          </div>
          <div className={`text-6xl font-extrabold mb-6 tracking-widest ${jersey15.className}`} style={{ fontFamily: 'Jersey 15', letterSpacing: '0.1em', background: 'linear-gradient(90deg, #2CF0FA, #F05CE6, #893DE6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            BRAINBALL
          </div>
        </div>
        <Image src="/baseball.png" alt="Basketball" width={100} height={100} className="absolute right-0 top-0" style={{ right: '-10px', top: '-10px' }} />
      </div>
      <div className="flex justify-center ">
        <label htmlFor="avatar-upload" className="cursor-pointer group">
          <div className="w-32 h-32 p-[3px] rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-r from-[#2CF0FA] via-[#F05CE6] to-[#893DE6] relative">
            <div className="w-full h-full rounded-full bg-[#23244a] flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <Image src={previewUrl} alt="Avatar" width={96} height={96} className="object-cover w-full h-full" />
              ) : (
                <Image src="/Vector.png" alt="Avatar" width={48} height={48} style={{objectFit: 'contain'}}  />
              )}
            </div>
            <div className="absolute bottom-0 w-full bg-black/60 text-xs text-white text-center py-1 opacity-0 group-hover:opacity-100 transition">Change</div>
          </div>
          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </label>
      </div>
      {/* Form */}
      <form onSubmit={handleSubmit} className={`w-full flex flex-col gap-6 mt-2 px-4 ${poppins.className}`}>
        <div>
          <label className="block text-xs uppercase text-gray-400 mb-1 tracking-widest">Your Name</label>
          <input
            type="text"
            name="name"
            className={`w-full bg-transparent border-0 border-b-2 ${errors.name ? 'border-red-500' : 'border-[#F05CE6]'} focus:border-[#2CF0FA] outline-none text-white text-base font-regular placeholder-gray-500 py-2 ${poppins.className} [&:not(:placeholder-shown)]:bg-transparent`}
            placeholder="Jhon Doe"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>
        <div>
          <label className="block text-xs uppercase text-gray-400 mb-1 tracking-widest">Email</label>
          <input
            type="email"
            name="email"
            className={`w-full bg-transparent border-0 border-b-2 ${errors.email ? 'border-red-500' : 'border-[#F05CE6]'} focus:border-[#2CF0FA] outline-none text-white text-base font-regular placeholder-gray-500 py-2 ${poppins.className} [&:not(:placeholder-shown)]:bg-transparent`}
            placeholder="jhon@gmail.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="block text-xs uppercase text-gray-400 mb-1 tracking-widest">Phone no. (Optional)</label>
          <input
            type="tel"
            name="phone"
            className={`w-full bg-transparent border-0 border-b-2 ${errors.phone ? 'border-red-500' : 'border-[#F05CE6]'} focus:border-[#2CF0FA] outline-none text-white text-base font-regular placeholder-gray-500 py-2 ${poppins.className} [&:not(:placeholder-shown)]:bg-transparent`}
            placeholder="Phone no."
            value={formData.phone}
            onChange={handleInputChange}
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-xs uppercase text-gray-400 mb-1 tracking-widest">Gender</label>
          <select
            name="gender"
            className={`w-full bg-transparent border-0 border-b-2 ${errors.gender ? 'border-red-500' : 'border-[#F05CE6]'} focus:border-[#2CF0FA] outline-none text-white text-base font-regular py-2 ${poppins.className} [&:not(:placeholder-shown)]:bg-transparent`}
            value={formData.gender}
            onChange={handleInputChange}
            required
          >
            <option value="" disabled>Select</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
          )}
        </div>
        {/* Gradient border button at the bottom */}
        <div className="mt-8">
          <div
            className="p-[2px] rounded-xl w-full"
            style={{
              background: 'linear-gradient(90deg, #2CF0FA 0%, #F05CE6 50%, #893DE6 100%)'
            }}
          >
            <div className="rounded-xl bg-[#181924] w-full">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full px-8 py-2 rounded-xl ${jersey15.className}  text-2xl font-bold bg-transparent text-cyan-200 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Sign Up'
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
        onClose={() => setSnackbar(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
} 