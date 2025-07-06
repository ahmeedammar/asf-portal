import { useEffect, useState } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Login function
  const login = async () => {
    try {
      const res = await fetch('https://helpdesk-web-service.onrender.com/api/login ', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
        credentials: 'include' // Important for cookies
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Login successful', data);
        fetchUsers(); // Fetch users after login
      } else {
        alert('Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error logging in');
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch('https://helpdesk-web-service.onrender.com/api/users ', {
        method: 'GET',
        credentials: 'include' // Required if using session cookies
      });

      if (res.status === 401) {
        alert('You need to log in first');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to load users');
      setLoading(false);
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('https://helpdesk-web-service.onrender.com/api/me ', {
          method: 'GET',
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          fetchUsers();
        } else {
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : user ? (
        <>
          <p>Welcome, {user.username}</p>
          <button onClick={login} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
            Refresh Users
          </button>

          <ul className="mt-4 space-y-2">
            {users.length > 0 ? (
              users.map((u) => <li key={u.id}>{u.username}</li>)
            ) : (
              <p>No users found.</p>
            )}
          </ul>
        </>
      ) : (
        <button onClick={login} className="bg-green-500 text-white px-4 py-2 rounded">
          Log In
        </button>
      )}
    </div>
  );
}

export default App;