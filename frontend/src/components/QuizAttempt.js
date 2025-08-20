import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function QuizAttempt() {
  const { quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [message, setMessage] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuiz = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setMessage('Error: Not authenticated.');
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/quizzes/${quizId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch quiz');
        }

        const data = await response.json();
        // Parse options if they are stored as JSON strings
        const parsedQuestions = data.questions.map(q => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
        }));
        setQuiz({ ...data, questions: parsedQuestions });
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionId, selectedOption) => {
    setAnswers({ ...answers, [questionId]: selectedOption });
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    quiz.questions.forEach(question => {
      if (answers[question.id] === question.correct_answer) {
        correctCount++;
      }
    });
    setScore(correctCount);
    setShowResults(true);
    setMessage(`You scored ${correctCount} out of ${quiz.questions.length} questions correctly!`);
  };

  if (!quiz) {
    return <div className="text-center mt-10">Loading quiz...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{quiz.title}</h2>
      <p className="mb-4">{quiz.description}</p>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {!showResults ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuiz(); }}>
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="bg-white p-4 rounded shadow-md mb-4">
              <p className="font-semibold mb-2">{index + 1}. {question.text}</p>
              {
                question.options.map((option, optIndex) => (
                  <div key={optIndex} className="mb-2">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        className="form-radio"
                        name={`question-${question.id}`}
                        value={option}
                        onChange={() => handleAnswerChange(question.id, option)}
                        checked={answers[question.id] === option}
                      />
                      <span className="ml-2">{option}</span>
                    </label>
                  </div>
                ))
              }
            </div>
          ))}
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Submit Quiz
          </button>
        </form>
      ) : (
        <div className="bg-white p-4 rounded shadow-md">
          <h3 className="text-xl font-semibold mb-2">Quiz Results</h3>
          <p className="text-lg">Your Score: {score} / {quiz.questions.length}</p>
          <h4 className="font-semibold mt-4">Review Answers:</h4>
          {quiz.questions.map((question, index) => (
            <div key={question.id} className="mb-2">
              <p className="font-semibold">{index + 1}. {question.text}</p>
              <p>Your Answer: <span className={answers[question.id] === question.correct_answer ? 'text-green-600' : 'text-red-600'}>{answers[question.id]}</span></p>
              <p>Correct Answer: <span className="text-green-600">{question.correct_answer}</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizAttempt;