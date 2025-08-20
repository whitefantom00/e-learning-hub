import React from 'react';

// Import local logos
import ieltsLogo from './logos/ielts.png';
import aLevelLogo from './logos/a-level.png';
import toeflLogo from './logos/toefl.png';
import pteLogo from './logos/pte.png';
import cambridgeLogo from './logos/cambridge.png';
import duolingoLogo from './logos/duolingo.png';

function Footer() {
  const logos = [
    ieltsLogo,
    aLevelLogo,
    toeflLogo,
    pteLogo,
    cambridgeLogo,
    duolingoLogo,
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