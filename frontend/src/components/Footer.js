import React from 'react';

// Import local logos
import ieltsLogo from './logos/IELTS.jpg';
import gmatLogo from './logos/GMAT.png';
import toeflLogo from './logos/TOEFL.jpg';
import toeicLogo from './logos/TOEIC.jpg';
import aLevelLogo from './logos/ALEVEL.jpeg';

function Footer() {
  const logos = [
    ieltsLogo,
    aLevelLogo,
    toeflLogo,
    gmatLogo,
    toeicLogo
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