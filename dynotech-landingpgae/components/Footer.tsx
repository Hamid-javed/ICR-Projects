import Link from "next/link";

export function Footer() {
  return (
    <footer className="py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row justify-start lg:justify-between lg:items-start">
          <div className="mb-8 lg:mb-0">
            <div className="text-sm space-y-1 text-[#5B5B5B]">
              <p className="font-bold ">Dynotech Innovations, LDA</p>
              <p className="font-medium">Rua Luís de Camões 1017, 7° Dt°</p>
              <p className="font-medium">Montijo 2870-154</p>
              <p className="font-medium">Portugal</p>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <Link
                href="#"
                className="text-gray-600 hover:text-gray-900 mb-0.5"
              >
                <span className="sr-only">LinkedIn</span>
                <LinkdinIcon />
              </Link>
              <Link href="#" className="text-gray-600 hover:text-gray-900">
                <span className="sr-only">Twitter</span>
                <Xicon />
              </Link>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="text-sm text-[#5B5B5B] mb-2 font-medium">
              Built With 🧡 in Portugal
            </div>
            <div className="text-sm text-[#5B5B5B] mb-4 font-medium">
              © 2025 Dynotech Innovations. All rights reserved.
            </div>
            <div className="flex font-medium justify-start sm:justify-end items-center space-x-2 lg:space-x-4  lg:space-y-0 text-sm">
              <Link
                href="#"
                className="text-[#2A2A2A] hover:text-gray-900 underline"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-[#2A2A2A] hover:text-gray-900 underline"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const LinkdinIcon = () => {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.8874 11.4246V18.1075H15.0129V11.872C15.0129 10.3052 14.4523 9.23653 13.0504 9.23653C11.9799 9.23653 11.3423 9.95743 11.0624 10.6539C10.9601 10.9029 10.9338 11.2498 10.9338 11.5985V18.1075H7.05762C7.05762 18.1075 7.11015 7.54747 7.05762 6.45253H10.9338V8.10445L10.9085 8.14249H10.9338V8.10445C11.4483 7.312 12.3675 6.17902 14.4261 6.17902C16.9755 6.17902 18.8874 7.84543 18.8874 11.4246ZM3.00388 0.834717C1.6789 0.834717 0.811279 1.70415 0.811279 2.848C0.811279 3.96649 1.65354 4.86219 2.95317 4.86219H2.97852C4.33068 4.86219 5.17022 3.96649 5.17022 2.848C5.14668 1.70415 4.33068 0.834717 3.00388 0.834717ZM1.04132 18.1075H4.91573V6.45253H1.04132V18.1075Z"
        fill="#2A2A2A"
      />
    </svg>
  );
};

const Xicon = () => {
  return (
    <svg
      width="19"
      height="18"
      viewBox="0 0 19 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.151 0.6604H17.9291L11.8612 7.61361L19 17.0755H13.411L9.03326 11.3359L4.02382 17.0755H1.24458L7.73477 9.63776L0.886841 0.6604H6.61854L10.5751 5.90531L15.151 0.6604ZM14.1774 15.4091H15.717L5.7808 2.23965H4.13024L14.1774 15.4091Z"
        fill="#2A2A2A"
      />
    </svg>
  );
};
