import { useState } from 'react';
import { Link } from 'react-router-dom';

function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = '/'; // 메인으로 이동
        onClose();
      } else {
        alert('로그인 실패');
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-start justify-end z-50">
      {/* 블러 오버레이 */}
      <div
        className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-20 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* 로그인 박스 */}
      <div className="relative mt-16 mr-16 bg-white rounded-lg shadow-lg p-8 z-10 w-96">
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">Email</label>
          <input className="w-full mb-4 p-2 border rounded" placeholder="example@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          <label className="block mb-2">Password</label>
          <input className="w-full mb-4 p-2 border rounded" type="password" placeholder="your password" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-black text-white py-2 rounded" type="submit">Sign In</button>
          <div className="flex items-center justify-between mt-2">
            <Link to="/signup" className="text-sm text-blue-600">Sign Up</Link>
            <span className="text-gray-300 mx-2"></span>
            <Link to="/login" className="text-sm text-green-600">Social Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
export default LoginModal;