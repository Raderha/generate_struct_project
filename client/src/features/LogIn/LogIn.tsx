// LogIn.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import kakaoLoginImg from '../../assets/kakao_login_medium_narrow.png'; //카카오 로그인 이미지
import googleLoginImg from '../../assets/google_login_medium_narrow.png'; //구글 로그인 이미지

function LogIn() {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('isLoggedIn', 'true');
        window.location.href = '/'; // 메인으로 이동
      } else {
        alert('로그인 실패');
      }
    } catch (err) {
      alert('서버 오류');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-4/5 max-w-xl mx-auto flex flex-col items-center scale-90">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">프로젝트 구조 자동 생성기</h1>
          <p className="text-lg text-gray-600">당신의 코딩을 보다 더 쉽게</p>
        </div>
        <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors"
            >
              Sign in
            </button>
          </form>
          <div className="mt-6 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">또는</span>
              <img
                src={kakaoLoginImg}
                alt="카카오 로그인"
                className="cursor-pointer w-[183px] h-10 mb-2 transition-transform hover:scale-105 hover:shadow-md"
                onClick={async () => {
                  try {
                    const response = await fetch('http://localhost:8000/api/auth/kakao/login');
                    const data = await response.json();
                    window.location.href = data.redirect_url;
                  } catch (error) {
                    console.error('카카오 로그인 URL 가져오기 실패:', error);
                    alert('카카오 로그인을 시작할 수 없습니다.');
                  }
                }}
              />

              <img
                src={googleLoginImg}
                alt="구글 로그인"
                className="cursor-pointer w-[183px] h-10 mb-2 transition-transform hover:scale-105 hover:shadow-md"
                onClick={async () => {
                  try {
                    console.log('구글 로그인 URL 요청 시작');
                    const response = await fetch('http://localhost:8000/api/auth/google/login', {
                      method: 'GET',
                      headers: {
                        'Accept': 'application/json',
                      },
                    });
                    console.log('응답 상태:', response.status);
                    const data = await response.json();
                    console.log('받은 데이터:', data);
                    window.location.href = data.redirect_url;
                  } catch (error) {
                    console.error('구글 로그인 URL 가져오기 실패:', error);
                    if (error instanceof TypeError) {
                      console.error('네트워크 오류가 발생했습니다. 백엔드 서버가 실행 중인지 확인해주세요.');
                    }
                    alert('구글 로그인을 시작할 수 없습니다.');
                  }
                }}
              />
          </div>
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-gray-600 hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogIn;