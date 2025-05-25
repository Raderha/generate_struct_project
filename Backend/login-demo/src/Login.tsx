import { useState } from 'react';

export default function Login({
  onLoginSuccess,
}: {
  onLoginSuccess: (token: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const res = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert(`✅ 로그인 성공: ${data.user.email}`);
      onLoginSuccess(data.token); // 부모(App.tsx)에 토큰 전달
    } else {
      alert(`❌ 로그인 실패: ${data.detail}`);
    }
  };

  const handleRegister = async () => {
    const res = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      alert('🎉 회원가입 성공! 이제 로그인 해보세요.');
    } else {
      alert(`❌ 회원가입 실패: ${data.detail}`);
    }
  };

  return (
    <div>
      <h2>로그인 / 회원가입</h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      /><br /><br />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      /><br /><br />
      <button onClick={handleLogin}>로그인</button>
      <button onClick={handleRegister}>회원가입</button>
    </div>
  );
}
