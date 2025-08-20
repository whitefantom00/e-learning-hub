import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

function ImageSlider() {
  return (
    <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} dynamicHeight={true}>
      <div className="relative h-96 flex items-center justify-center text-white bg-gradient-to-r from-blue-500 to-purple-600">
        <img src="https://via.placeholder.com/1200x400?text=IELTS+Mock+Test" alt="IELTS Mock Test" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="relative z-10 p-4">
          <h2 className="text-4xl font-bold mb-2">Master Your IELTS with Mock Tests</h2>
          <p className="text-lg mb-4">Practice all sections with realistic simulations and get ready for your exam.</p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">Start a Mock Test</button>
        </div>
      </div>
      <div className="relative h-96 flex items-center justify-center text-white bg-gradient-to-r from-green-500 to-teal-600">
        <img src="https://via.placeholder.com/1200x400?text=Expert+Training" alt="Expert Training" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="relative z-10 p-4">
          <h2 className="text-4xl font-bold mb-2">Expert-Led Training Modules</h2>
          <p className="text-lg mb-4">Access comprehensive lessons and interactive quizzes designed by IELTS experts.</p>
          <button className="bg-white text-green-600 px-6 py-2 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">Explore Courses</button>
        </div>
      </div>
      <div className="relative h-96 flex items-center justify-center text-white bg-gradient-to-r from-red-500 to-orange-600">
        <img src="https://via.placeholder.com/1200x400?text=Personalized+Feedback" alt="Personalized Feedback" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="relative z-10 p-4">
          <h2 className="text-4xl font-bold mb-2">Personalized Writing Feedback</h2>
          <p className="text-lg mb-4">Submit your essays and get detailed, AI-powered feedback to improve your score.</p>
          <button className="bg-white text-red-600 px-6 py-2 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">Get Feedback</button>
        </div>
      </div>
    </Carousel>
  );
}

export default ImageSlider;