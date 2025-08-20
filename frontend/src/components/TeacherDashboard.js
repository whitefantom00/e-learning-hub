import React, { useState, useEffect } from 'react';

function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [message, setMessage] = useState('');
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizDescription, setNewQuizDescription] = useState('');
  const [newQuizQuestions, setNewQuizQuestions] = useState([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  const [editingQuiz, setEditingQuiz] = useState(null);

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

  const handleAddQuestion = () => {
    setNewQuizQuestions([...newQuizQuestions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...newQuizQuestions];
    if (field.startsWith('option')) {
      const optionIndex = parseInt(field.replace('option', ''), 10);
      updatedQuestions[index].options[optionIndex] = value;
    } else {
      updatedQuestions[index][field] = value;
    }
    setNewQuizQuestions(updatedQuestions);
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:8000/quizzes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newQuizTitle,
          description: newQuizDescription,
          questions: newQuizQuestions,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create quiz');
      }

      setMessage('Quiz created successfully!');
      setNewQuizTitle('');
      setNewQuizDescription('');
      setNewQuizQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
      fetchQuizzes();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleEditQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setNewQuizTitle(quiz.title);
    setNewQuizDescription(quiz.description);
    // Ensure options are parsed correctly if stored as JSON string
    const parsedQuestions = quiz.questions.map(q => ({
      ...q,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
    }));
    setNewQuizQuestions(parsedQuestions);
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    if (!token || !editingQuiz) return;

    try {
      const response = await fetch(`http://localhost:8000/quizzes/${editingQuiz.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: newQuizTitle,
            description: newQuizDescription,
            questions: newQuizQuestions,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update quiz');
      }

      setMessage('Quiz updated successfully!');
      setEditingQuiz(null);
      setNewQuizTitle('');
      setNewQuizDescription('');
      setNewQuizQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
      fetchQuizzes();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/quizzes/${quizId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete quiz');
      }

      setMessage('Quiz deleted successfully!');
      fetchQuizzes();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Teacher Dashboard - Quiz Management</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      <div className="bg-white p-4 rounded shadow-md mb-4">
        <h3 className="text-xl font-semibold mb-2">{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</h3>
        <form onSubmit={editingQuiz ? handleUpdateQuiz : handleCreateQuiz}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Title:</label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newQuizTitle}
              onChange={(e) => setNewQuizTitle(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Description:</label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={newQuizDescription}
              onChange={(e) => setNewQuizDescription(e.target.value)}
            ></textarea>
          </div>

          <h4 className="text-lg font-semibold mb-2">Questions:</h4>
          {newQuizQuestions.map((q, qIndex) => (
            <div key={qIndex} className="bg-gray-100 p-3 rounded mb-3">
              <label className="block text-gray-700 text-sm font-bold mb-2">Question {qIndex + 1} Text:</label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                value={q.text}
                onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                required
              />
              <label className="block text-gray-700 text-sm font-bold mb-2">Options (4):</label>
              {q.options.map((option, optIndex) => (
                <input
                  key={optIndex}
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-1"
                  placeholder={`Option ${optIndex + 1}`}
                  value={option}
                  onChange={(e) => handleQuestionChange(qIndex, `option${optIndex}`, e.target.value)}
                  required
                />
              ))}
              <label className="block text-gray-700 text-sm font-bold mb-2 mt-2">Correct Answer:</label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={q.correctAnswer}
                onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQuestion}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Add Question
          </button>

          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            {editingQuiz ? 'Update Quiz' : 'Create Quiz'}
          </button>
          {editingQuiz && (
            <button
              type="button"
              onClick={() => setEditingQuiz(null)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>

      <h3 className="text-xl font-semibold mb-2">My Quizzes</h3>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((quiz) => (
            <tr key={quiz.id}>
              <td className="py-2 px-4 border-b">{quiz.id}</td>
              <td className="py-2 px-4 border-b">{quiz.title}</td>
              <td className="py-2 px-4 border-b">{quiz.description}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEditQuiz(quiz)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteQuiz(quiz.id)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TeacherDashboard;