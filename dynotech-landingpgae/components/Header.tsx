import { useState } from "react";
import Link from "next/link";
import { Grid3X3 } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="relative">
      <div className="container mx-auto px-2 md:px-10 py-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center w-full">
            <img
              src="/images/dynotech-logo.png"
              alt="Dynotech Innovations"
              className="h-5 sm:h-6 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden w-full justify-end lg:flex items-center space-x-10">
            <Link
              href="#"
              className="text-gray-800 hover:text-gray-900 text-sm font-medium"
            >
              Home
            </Link>
            <div className="flex items-center space-x-2 bg-gray-100 p-1 rounded-lg">
              <Link
                href="#products"
                className="px-4 py-2 text-gray-800 text-sm font-medium rounded-lg hover:bg-white hover:shadow"
              >
                Products
              </Link>
              <Link
                href="#DynoCash"
                className="px-4 py-2 text-gray-800 hover:bg-white hover:shadow text-sm font-medium rounded-lg"
              >
                DynoCash
              </Link>
              <Link
                href="#SpeechCue"
                className="px-4 py-2 text-gray-800 hover:bg-white hover:shadow text-sm font-medium rounded-lg"
              >
                SpeechCue
              </Link>
              <Link
                href="#NameWord"
                className="px-4 py-2 text-gray-800 hover:bg-white hover:shadow text-sm font-medium rounded-lg"
              >
                NameWord
              </Link>
              <Link
                href="#BozzMail"
                className="px-4 py-2 text-gray-800 hover:bg-white hover:shadow text-sm font-medium rounded-lg"
              >
                BozzMail
              </Link>
            </div>
            <Link
              href="#"
              className="text-gray-800 hover:text-gray-900 text-sm font-medium"
            >
              Waitlist
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="relative">
            {/* Toggle Button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden flex items-center justify-between w-full bg-white hover:bg-[#F3F3F3] px-4 py-2 rounded-lg border border-gray-300 shadow-sm transition"
            >
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">
                  Products
                </span>
              </div>
            </button>

            {/* Menu Overlay */}
            {isMenuOpen && (
              <div
                onClick={(e) => e.stopPropagation}
                className="absolute top-full mt-1 right-0 w-[150px] border-none bg-[#F3F3F3] border rounded-lg z-50 p-2 animate-fade-in-down"
              >
                <div className="flex flex-col justify-end items-end">
                  {[
                    { label: "DynoCash", href: "#DynoCash" },
                    { label: "SpeechCue", href: "#SpeechCue" },
                    { label: "NameWord", href: "#NameWord" },
                    { label: "BozzMail", href: "#BozzMail" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={() => toggleMenu()}
                      className="block text-base font-medium py-2 px-4 rounded-lg text-gray-700 hover:bg-white transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
