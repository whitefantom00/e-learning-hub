import React, { useState, useEffect } from 'react';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');

  const fetchUsers = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setMessage('Error: Not authenticated.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/admin/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete user');
      }

      setMessage('User deleted successfully!');
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const handleUpdate = async (userId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ email: editEmail, role: editRole }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update user');
      }

      setMessage('User updated successfully!');
      setEditingUser(null); // Exit editing mode
      fetchUsers(); // Refresh the user list
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard - User Management</h2>
      {message && <p className="mb-4 text-green-600">{message}</p>}

      {editingUser && (
        <div className="bg-white p-4 rounded shadow-md mb-4">
          <h3 className="text-xl font-semibold mb-2">Edit User: {editingUser.email}</h3>
          <div className="mb-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Role:</label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
            >
              <option value="student">student</option>
              <option value="teacher">teacher</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <button
            onClick={() => handleUpdate(editingUser.id)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Update User
          </button>
          <button
            onClick={() => setEditingUser(null)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      )}

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="py-2 px-4 border-b">{user.id}</td>
              <td className="py-2 px-4 border-b">{user.email}</td>
              <td className="py-2 px-4 border-b">{user.role}</td>
              <td className="py-2 px-4 border-b">
                <button
                  onClick={() => handleEdit(user)}
                  className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
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

export default AdminDashboard;