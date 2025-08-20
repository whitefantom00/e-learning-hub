import React from 'react';

function LogoMarquee() {
  const logos = [
    "https://via.placeholder.com/100x50?text=IELTS",
    "https://via.placeholder.com/100x50?text=A-Level",
    "https://via.placeholder.com/100x50?text=TOEFL",
    "https://via.placeholder.com/100x50?text=PTE",
    "https://via.placeholder.com/100x50?text=Cambridge",
    "https://via.placeholder.com/100x50?text=Duolingo",
  ];

  return (
    <div className="overflow-hidden whitespace-nowrap py-8 bg-gray-100 mt-8">
      <div className="inline-block animate-marquee">
        {logos.map((logo, index) => (
          <img key={index} src={logo} alt="Certificate Logo" className="h-12 mx-8 inline-block" />
        ))}
        {/* Duplicate logos to create a seamless loop */}
        {logos.map((logo, index) => (
          <img key={index + logos.length} src={logo} alt="Certificate Logo" className="h-12 mx-8 inline-block" />
        ))}
      </div>
    </div>
  );
}

export default LogoMarquee;