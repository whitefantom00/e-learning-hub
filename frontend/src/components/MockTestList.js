import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function MockTestList() {
  const [mockTests, setMockTests] = useState([]);
  const [message, setMessage] = useState('');

  // Dummy data for mock tests (replace with API calls)
  const dummyMockTests = [
    { id: 1, title: "IELTS Mock Test 1", description: "A full-length IELTS mock test." },
    { id: 2, title: "IELTS Mock Test 2", description: "Another full-length IELTS mock test." },
  ];

  useEffect(() => {
    // In a real application, fetch mock test data from backend
    setMockTests(dummyMockTests);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Available Mock Tests</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockTests.map((test) => (
          <div key={test.id} className="bg-white p-4 rounded shadow-md">
            <h3 className="text-xl font-semibold mb-2">{test.title}</h3>
            <p className="text-gray-600 mb-4">{test.description}</p>
            <Link
              to={`/mock-test/${test.id}`}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded inline-block"
            >
              Start Test
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MockTestList;