import { useState, useEffect } from 'react';
import Login from './Login';
import Logout from './Logout';

import { useNavigate } from 'react-router-dom';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

useEffect(() => {
  const savedToken = localStorage.getItem("token");
  if (savedToken && savedToken !== "undefined") {
    setToken(savedToken);
  } else {
    setToken(null);
  }
}, []);


  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/dashboard');  // ✅ 로그인 후 이동 경로
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/');  // ✅ 로그아웃 후 홈으로
  };

  return (
    <div className="App" style={{ padding: 20 }}>
      {token ? (
        <>
          <p>🔐 로그인 상태입니다.</p>
          <Logout token={token} onLogout={handleLogout} />
        </>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
