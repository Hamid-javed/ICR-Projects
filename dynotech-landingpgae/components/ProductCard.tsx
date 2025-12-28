import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Feature {
  icon: React.ReactNode;
  text: string;
}

interface ProductCardProps {
  name: string;
  logo: React.ReactNode;
  logoBgColor: string;
  description: string;
  tags: string[];
  features: Feature[];
}

export function ProductCard({
  name,
  logo,
  logoBgColor,
  description,
  tags,
  features,
}: ProductCardProps) {
  return (
    <div
      id={name}
      className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-sm border border-gray-100 relative"
    >
      {/* Remind Me Button: top-right on large screens, below image on small */}
      <div className="lg:absolute hidden lg:block lg:top-6 lg:right-6 mb-4 lg:mb-0">
        <Button
          variant="outline"
          size="sm"
          className="text-gray-700 border border-gray-200 active:bg-[#F1F1F1] hover:bg-[#F3F3F3] hover:border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 w-fit shadow-sm bg-white"
        >
          <Bell className="w-4 h-4" />
          <span>Remind me</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Logo Section */}
        <div className="w-full lg:w-[30%] flex justify-center items-center bg-[#F7F7F7] rounded-2xl">
          <div
            className={`w-full h-[300px] flex items-center justify-center rounded-2xl`}
          >
            <div className="p-8">{logo}</div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full lg:w-[70%] pt-6 p-0 lg:pl-12 flex flex-col justify-center">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden text-gray-700 border border-gray-200 hover:border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 w-fit shadow-sm bg-white"
              >
                <Bell className="w-4 h-4" />
                <span>Remind me</span>
              </Button>
              <div className="flex sm:justify-center sm:items-center gap-3 sm:flex-row flex-col">
                {" "}
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {name}
                </h3>
                <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 w-fit">
                  <span>
                    <Roket />
                  </span>
                  <span>Launching soon</span>
                </span>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-3 mb-6">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-[#F4F4F4] rounded-lg text-gray-500 text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-[#2A2A2A] text-[16px] sm:text-lg leading-relaxed mb-8">
            {description}
          </p>

          {/* Features */}
          <ul className="space-y-4">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  {feature.icon}
                </div>
                <span className="text-gray-600">{feature.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export const Roket = () => {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.429216 5.16883L2.87922 2.71883C3.01533 2.58272 3.17574 2.48549 3.36047 2.42716C3.54519 2.36883 3.73477 2.35911 3.92922 2.39799L4.68755 2.55841C4.16255 3.18063 3.74935 3.74452 3.44797 4.25008C3.14658 4.75563 2.85491 5.36813 2.57297 6.08758L0.429216 5.16883ZM3.4188 6.49591C3.64241 5.79591 3.94633 5.1348 4.33055 4.51258C4.71477 3.89036 5.17891 3.30702 5.72296 2.76258C6.57852 1.90702 7.5556 1.26788 8.65421 0.845162C9.75283 0.422439 10.7785 0.293523 11.7313 0.458411C11.8966 1.41119 11.7702 2.43688 11.3521 3.5355C10.9341 4.63411 10.2973 5.61119 9.44172 6.46675C8.90699 7.00147 8.32366 7.4658 7.69171 7.85975C7.05977 8.25369 6.3938 8.56227 5.6938 8.7855L3.4188 6.49591ZM7.4438 4.74591C7.66741 4.96952 7.94216 5.08133 8.26805 5.08133C8.59394 5.08133 8.86849 4.96952 9.09171 4.74591C9.31494 4.5223 9.42674 4.24774 9.42713 3.92224C9.42752 3.59674 9.31571 3.322 9.09171 3.098C8.86771 2.874 8.59316 2.76219 8.26805 2.76258C7.94294 2.76297 7.66819 2.87477 7.4438 3.098C7.21941 3.32122 7.1076 3.59597 7.10838 3.92224C7.10916 4.24852 7.22097 4.52308 7.4438 4.74591ZM7.03546 11.7605L6.10213 9.61675C6.82158 9.3348 7.4366 9.04313 7.94722 8.74175C8.45783 8.44036 9.02405 8.02716 9.64588 7.50216L9.79172 8.2605C9.8306 8.45494 9.82088 8.64705 9.76255 8.83683C9.70422 9.02661 9.60699 9.18936 9.47088 9.32508L7.03546 11.7605ZM1.36255 8.36258C1.70283 8.0223 2.11602 7.84963 2.60213 7.84458C3.08824 7.83952 3.50144 8.00733 3.84172 8.348C4.18199 8.68866 4.35213 9.10186 4.35213 9.58758C4.35213 10.0733 4.18199 10.4865 3.84172 10.8272C3.59866 11.0702 3.19285 11.2792 2.6243 11.4542C2.05574 11.6292 1.27058 11.7848 0.268799 11.9209C0.40491 10.9195 0.560465 10.1369 0.735465 9.573C0.910465 9.00911 1.11949 8.60563 1.36255 8.36258Z"
        fill="white"
      />
    </svg>
  );
};
