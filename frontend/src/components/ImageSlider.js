import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

// Import local images
import ieltsMockTestImage from './pictures/ielts-mock-test.jpg';
import expertTrainingImage from './pictures/expert-training.jpg';
import personalizedFeedbackImage from './pictures/personalized-feedback.jpg';

function ImageSlider() {
  return (
    <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false} dynamicHeight={true}>
      <div className="relative h-96 flex items-center justify-center text-gray-800 bg-white">
        <div className="grid grid-cols-3 gap-4 items-center w-full h-full">
          <div className="flex flex-col justify-center items-start p-8 text-left col-span-1">
            <h2 className="text-4xl font-bold mb-2">Master Your IELTS with Mock Tests</h2>
            <p className="text-lg mb-4">Practice all sections with realistic simulations and get ready for your exam.</p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300">Start a Mock Test</button>
          </div>
          <div className="flex items-center justify-center h-full col-span-2">
            <img src={ieltsMockTestImage} alt="IELTS Mock Test illustration" className="object-contain h-full w-full" />
          </div>
        </div>
      </div>
      <div className="relative h-96 flex items-center justify-center text-gray-800 bg-white">
        <div className="grid grid-cols-3 gap-4 items-center w-full h-full">
          <div className="flex flex-col justify-center items-start p-8 text-left col-span-1">
            <h2 className="text-4xl font-bold mb-2">Expert-Led Training Modules</h2>
            <p className="text-lg mb-4">Access comprehensive lessons and interactive quizzes designed by IELTS experts.</p>
            <button className="bg-green-600 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-green-700 transition duration-300">Explore Courses</button>
          </div>
          <div className="flex items-center justify-center h-full col-span-2">
            <img src={expertTrainingImage} alt="Expert Training illustration" className="object-contain h-full w-full" />
          </div>
        </div>
      </div>
      <div className="relative h-96 flex items-center justify-center text-gray-800 bg-white">
        <div className="grid grid-cols-3 gap-4 items-center w-full h-full">
          <div className="flex flex-col justify-center items-start p-8 text-left col-span-1">
            <h2 className="text-4xl font-bold mb-2">Personalized Writing Feedback</h2>
            <p className="text-lg mb-4">Submit your essays and get detailed, AI-powered feedback to improve your score.</p>
            <button className="bg-red-600 text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-red-700 transition duration-300">Get Feedback</button>
          </div>
          <div className="flex items-center justify-center h-full col-span-2">
            <img src={personalizedFeedbackImage} alt="Personalized Feedback illustration" className="object-contain h-full w-full" />
          </div>
        </div>
      </div>
    </Carousel>
  );
}

export default ImageSlider;