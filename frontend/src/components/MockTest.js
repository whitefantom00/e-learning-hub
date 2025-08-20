import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function MockTest() {
  const { testId } = useParams();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [currentSection, setCurrentSection] = useState('listening'); // listening, reading, writing
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchTest = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setMessage('Error: Not authenticated.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/mock-tests/${testId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch mock test');
        }

        const data = await response.json();
        // Parse options if they are stored as JSON strings
        const parsedSections = {};
        data.sections.forEach(section => {
          if (section.questions) {
            section.questions = section.questions.map(q => ({
              ...q,
              options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
            }));
          }
          parsedSections[section.title] = section;
        });
        setTest({ ...data, sections: parsedSections });
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };

    fetchTest();
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

  const handleSubmitTest = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/mock-tests/${testId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ test_id: parseInt(testId), answers: answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit test');
      }

      const data = await response.json();
      setResults(data);
      setMessage('Mock test submitted for grading!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
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

      {currentSection === 'listening' && test.sections.listening && (
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

      {currentSection === 'reading' && test.sections.reading && (
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

      {currentSection === 'writing' && test.sections.writing && (
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

      {results && (
        <div className="mt-4 p-4 bg-blue-100 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-2">Results:</h3>
          <p>Listening Score: {results.listening_score} / {results.total_questions_listening}</p>
          <p>Reading Score: {results.reading_score} / {results.total_questions_reading}</p>
        </div>
      )}
    </div>
  );
}

export default MockTest;