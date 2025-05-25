// src/features/MainPage/components/TopNav.tsx
import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';
import { Link } from 'react-router-dom';

function TopNav() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    window.location.reload();
  };

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white border-b border-gray-200 h-16 flex items-center px-8">
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between">
        {/* 왼쪽 (공백 영역 유지용) */}
        <div className="w-1/3" />

        {/* 가운데 (Main, Help) */}
        <div className="w-1/3 flex justify-center gap-6">
          <Link to="/" className="text-gray-800 font-semibold hover:underline">Main</Link>
          <Link to="/mypage" className="text-gray-800 font-semibold hover:underline">MyPage</Link>
          <Link to="/" className="text-gray-800 font-semibold hover:underline">Help</Link>
        </div>

        {/* 오른쪽 (로그인, 회원가입 or 로그아웃) */}
        <div className="w-1/3 flex justify-end gap-4">
          {isLoggedIn ? (
            <button
              type="button"
              className="border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-100"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          ) : (
            <>
              <div className="relative">
                <button
                  type="button"
                  className="border border-gray-300 px-4 py-2 rounded-md text-sm hover:bg-gray-100"
                  onClick={() => setShowLoginModal(true)}
                >
                  로그인
                </button>
                {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
              </div>
              <Link to="/signup" className="bg-black text-white px-4 py-2 rounded-md text-sm hover:opacity-90">회원가입</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default TopNav;
