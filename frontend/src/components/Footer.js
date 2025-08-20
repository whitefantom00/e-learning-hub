import React from 'react';

function Footer() {
  const logos = [
    "https://via.placeholder.com/100x50?text=IELTS",
    "https://via.placeholder.com/100x50?text=A-Level",
    "https://via.placeholder.com/100x50?text=TOEFL",
    "https://via.placeholder.com/100x50?text=PTE",
    "https://via.placeholder.com/100x50?text=Cambridge",
    "https://via.placeholder.com/100x50?text=Duolingo",
  ];

  return (
    <footer className="bg-gray-800 text-white py-8 mt-10">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-xl font-bold mb-4">Our Certifications</h3>
        <div className="flex flex-wrap justify-center items-center gap-8 mb-8">
          {logos.map((logo, index) => (
            <img key={index} src={logo} alt="Certificate Logo" className="h-12" />
          ))}
        </div>
        <p>&copy; {new Date().getFullYear()} E-Learning Hub. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;