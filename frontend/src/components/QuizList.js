import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [message, setMessage] = useState('');

  const fetchQuizzes = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessage('Error: Not authenticated.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/quizzes/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch quizzes');
      }

      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Available Quizzes</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quizzes.map((quiz) => (
          <div key={quiz.id} className="bg-white p-4 rounded shadow-md">
            <h3 className="text-xl font-semibold mb-2">{quiz.title}</h3>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <Link
              to={`/quiz/${quiz.id}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
            >
              Start Quiz
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default QuizList;