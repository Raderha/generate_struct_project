export default function Logout({
  token,
  onLogout,
}: {
  token: string;
  onLogout: () => void;
}) {
  const handleLogout = async () => {
    const res = await fetch('http://localhost:8000/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    if (res.ok) {
      alert(`👋 로그아웃 완료: ${data.user.email}`);
      onLogout(); // App.tsx에서 상태 초기화
    } else {
      alert(`❌ 로그아웃 실패: ${data.detail}`);
    }
  };

  return <button onClick={handleLogout}>로그아웃</button>;
}
