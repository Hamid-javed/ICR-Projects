'use client';

import { useRouter } from 'next/navigation';
import { Jersey_15 } from 'next/font/google';
import Image from 'next/image';
const jersey15 = Jersey_15({ subsets: ['latin'], weight: '400' });
export default function LandingPage() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: 'url(/neoja-brainball-bg.png)', // Place your image in public/ as neoja-brainball-bg.jpg
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-[768px] mx-auto w-full">
        {/* Title and Baseball at the very top */}
        <div className="w-full flex items-center pt-8 z-20 absolute top-0 left-0 ">
          <div className="flex-1 flex justify-center">
            <div className={`${jersey15.className} text-6xl ml-10 font-extrabold text-center uppercase tracking-widest`} style={{

              background: 'linear-gradient(90deg, #2CF0FA 0%, #F05CE6 50%, #893DE6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '0.1em',
              textAlign: 'center',

            }}>
              Neoja<br />Brainball
            </div>
          </div>
          <Image src="/baseball.png" alt="Basketball" width={80} height={80} />
        </div>
        {/* Overlay for better button visibility */}
        <div className="absolute" />
        {/* Button at the very bottom */}
        <div className="absolute bottom-8 left-0 w-full flex justify-center z-10 px-4">
          <div
            className="p-[2px] rounded-xl w-full max-w-[768px] mx-auto"
            style={{
              background: 'linear-gradient(90deg, #2CF0FA 0%, #F05CE6 50%, #893DE6 100%)'
            }}
          >
            <div className="rounded-xl bg-[#181924] w-full">
              <button
                onClick={() => router.push('/register')}
                className="w-full px-8 py-4 rounded-xl text-xl font-bold bg-transparent text-cyan-200"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 