import React, { useState, useEffect } from 'react';

function TestResults() {
  const [testResults, setTestResults] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchTestResults = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setMessage('Error: Not authenticated.');
        return;
      }

      try {
        const response = await fetch('http://localhost:8000/test-results/me/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to fetch test results');
        }

        const data = await response.json();
        setTestResults(data);
      } catch (error) {
        setMessage(`Error: ${error.message}`);
      }
    };

    fetchTestResults();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">My Test Results</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {testResults.length === 0 ? (
        <p>No test results found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {testResults.map((result) => (
            <div key={result.id} className="bg-white p-4 rounded shadow-md">
              <h3 className="text-xl font-semibold mb-2">Mock Test ID: {result.mock_test_id}</h3>
              <p>Listening Score: {result.listening_score} / {result.total_questions_listening}</p>
              <p>Reading Score: {result.reading_score} / {result.total_questions_reading}</p>
              {result.writing_feedback && (
                <div className="mt-2">
                  <h4 className="font-semibold">Writing Feedback:</h4>
                  <p>Task 1: {JSON.parse(result.writing_feedback).task1_feedback}</p>
                  <p>Task 2: {JSON.parse(result.writing_feedback).task2_feedback}</p>
                  <p>Overall: {JSON.parse(result.writing_feedback).overall_suggestion}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TestResults;