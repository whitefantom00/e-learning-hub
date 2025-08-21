import sqlite3
import os

# Get the backend app directory path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend', 'data', 'app.db')

conn = sqlite3.connect(backend_path)
cursor = conn.cursor()

# Update admin role
cursor.execute('UPDATE users SET role = ? WHERE email = ?', ('admin', 'admin@gmail.com'))
# Update teacher role
cursor.execute('UPDATE users SET role = ? WHERE email = ?', ('teacher', 'teacher@gmail.com'))

conn.commit()
conn.close()
print("Roles updated successfully!")
