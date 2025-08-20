import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function MockTest() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [currentSection, setCurrentSection] = useState('listening'); // listening, reading, writing

  // Dummy data for a mock test (replace with API calls)
  const dummyTest = {
    id: 1,
    title: "IELTS Mock Test 1",
    description: "A full-length IELTS mock test.",
    sections: {
      listening: {
        title: "Listening Section",
        questions: [
          { id: 1, text: "What is the capital of France?", options: ["London", "Paris", "Rome", "Berlin"], correctAnswer: "Paris" },
          { id: 2, text: "What is 2 + 2?", options: ["3", "4", "5", "6"], correctAnswer: "4" },
        ],
      },
      reading: {
        title: "Reading Section",
        passage: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
        questions: [
          { id: 3, text: "What is the main idea of the passage?", options: ["A", "B", "C", "D"], correctAnswer: "A" },
          { id: 4, text: "According to the passage, what is ...?", options: ["X", "Y", "Z", "W"], correctAnswer: "X" },
        ],
      },
      writing: {
        title: "Writing Section",
        task1: "Describe the graph below.",
        task2: "Write an essay on the topic...",
      },
    },
  };

  useEffect(() => {
    // In a real application, fetch test data from backend
    setTest(dummyTest);
  }, [testId]);

  const handleAnswerChange = (section, questionId, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [section]: {
        ...(prevAnswers[section] || {}),
        [questionId]: value,
      },
    }));
  };

  const handleWritingChange = (task, value) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      writing: {
        ...(prevAnswers.writing || {}),
        [task]: value,
      },
    }));
  };

  const handleSubmitTest = () => {
    // In a real application, send answers to backend for grading
    setMessage('Mock test submitted for grading!');
    console.log('Submitted Answers:', answers);
  };

  if (!test) {
    return <div className="text-center mt-10">Loading mock test...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{test.title}</h2>
      <p className="mb-4">{test.description}</p>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      <div className="flex mb-4">
        <button
          className={`px-4 py-2 mr-2 ${currentSection === 'listening' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setCurrentSection('listening')}
        >
          Listening
        </button>
        <button
          className={`px-4 py-2 mr-2 ${currentSection === 'reading' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setCurrentSection('reading')}
        >
          Reading
        </button>
        <button
          className={`px-4 py-2 ${currentSection === 'writing' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setCurrentSection('writing')}
        >
          Writing
        </button>
      </div>

      {currentSection === 'listening' && (
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-4">{test.sections.listening.title}</h3>
          {test.sections.listening.questions.map((question, index) => (
            <div key={question.id} className="mb-4">
              <p className="font-semibold mb-2">{index + 1}. {question.text}</p>
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="mb-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name={`listening-question-${question.id}`}
                      value={option}
                      onChange={(e) => handleAnswerChange('listening', question.id, e.target.value)}
                      checked={answers.listening && answers.listening[question.id] === option}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {currentSection === 'reading' && (
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-4">{test.sections.reading.title}</h3>
          <p className="mb-4">{test.sections.reading.passage}</p>
          {test.sections.reading.questions.map((question, index) => (
            <div key={question.id} className="mb-4">
              <p className="font-semibold mb-2">{index + 1}. {question.text}</p>
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="mb-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      name={`reading-question-${question.id}`}
                      value={option}
                      onChange={(e) => handleAnswerChange('reading', question.id, e.target.value)}
                      checked={answers.reading && answers.reading[question.id] === option}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {currentSection === 'writing' && (
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-4">{test.sections.writing.title}</h3>
          <div className="mb-4">
            <p className="font-semibold mb-2">Task 1: {test.sections.writing.task1}</p>
            <textarea
              className="w-full p-2 border rounded"
              rows="6"
              value={answers.writing?.task1 || ''}
              onChange={(e) => handleWritingChange('task1', e.target.value)}
            ></textarea>
          </div>
          <div className="mb-4">
            <p className="font-semibold mb-2">Task 2: {test.sections.writing.task2}</p>
            <textarea
              className="w-full p-2 border rounded"
              rows="10"
              value={answers.writing?.task2 || ''}
              onChange={(e) => handleWritingChange('task2', e.target.value)}
            ></textarea>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmitTest}
        className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Submit Mock Test
      </button>
    </div>
  );
}

export default MockTest;