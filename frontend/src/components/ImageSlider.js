import React from 'react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

function ImageSlider() {
  return (
    <Carousel autoPlay infiniteLoop showThumbs={false} showStatus={false}>
      <div>
        <img src="https://via.placeholder.com/800x400?text=IELTS+Mock+Test" alt="IELTS Mock Test" />
        <p className="legend">Prepare for your IELTS Mock Tests</p>
      </div>
      <div>
        <img src="https://via.placeholder.com/800x400?text=Expert+Training" alt="Expert Training" />
        <p className="legend">Expert Training for all sections</p>
      </div>
      <div>
        <img src="https://via.placeholder.com/800x400?text=Personalized+Feedback" alt="Personalized Feedback" />
        <p className="legend">Get Personalized Feedback on your Writing</p>
      </div>
    </Carousel>
  );
}

export default ImageSlider;