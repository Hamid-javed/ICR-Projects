export function TechnologySlider() {
  const keywords = [
    "AI",
    "Voice",
    "Crypto",
    "IVR",
    "VPS",
    "SaaS",
    "Mail",
    "Tech",
    "Cloud",
    "Infra",
    "Ops",
    "UX",
  ];

  return (
    <section className="py-8 overflow-hidden">
      <div className="relative">
        {/* Slider Container */}
        <div className="flex animate-scroll">
          {/* First set of keywords */}
          <div className="flex items-center space-x-12 px-6 whitespace-nowrap">
            {keywords.map((keyword, index) => (
              <span
                key={`first-${index}`}
                className={`text-[#949494] text-[50.88px] font-normal leading-[106%] tracking-[0%] text-center ${
                  index % 2 === 0 ? "italic" : ""
                } ${
                  keyword === "Voice" || keyword === "AI" ? "not-italic" : ""
                }`}
              >
                {keyword}
              </span>
            ))}
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex items-center space-x-12 px-6 whitespace-nowrap">
            {keywords.map((keyword, index) => (
              <span
                key={`second-${index}`}
                className="text-[#949494] text-[50.88px] font-normal italic font-['Poppins'] leading-[106%] tracking-[0%] text-center"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
