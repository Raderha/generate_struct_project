import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function KakaoCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get('code');
    if (code) {
      // 백엔드에 code 전달
      fetch('/api/auth/kakao/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(async res => {
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('isLoggedIn', 'true');
            navigate('/'); // 메인으로 이동
          } else {
            alert('카카오 로그인 실패');
            navigate('/login');
          }
        })
        .catch(() => {
          alert('서버 오류');
          navigate('/login');
        });
    } else {
      alert('인가 코드가 없습니다.');
      navigate('/login');
    }
  }, [navigate]);

  return <div>카카오 로그인 중...</div>;
}

export default KakaoCallback;