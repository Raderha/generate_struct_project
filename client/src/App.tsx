import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainPage from './features/MainPage/MainPage';
import LogIn from './features/LogIn/LogIn';
import SignUp from './features/SignUp/SignUp';
import MyPage from './features/MyPage/MyPage';
import KakaoCallback from './features/LogIn/oauth/kakao/callback';
import GoogleCallback from './features/LogIn/oauth/google/callback';
import FileStructure from './features/FileStructure/FileStructure';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login/oauth/kakao/callback" element={<KakaoCallback />} />
        <Route path="/login/oauth/google/callback" element={<GoogleCallback />} />
        <Route path="/file-structure" element={<FileStructure />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  );
}

export default App;
