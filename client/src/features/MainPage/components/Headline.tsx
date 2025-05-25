import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Headline() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setIsLoading(true);
    setIsError(false);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (data.download_url) {
        localStorage.setItem('currentProject', JSON.stringify({
          projectName: data.project_name,
          downloadUrl: data.download_url,
          prompt: prompt
        }));
        navigate('/file-structure');
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error('Error details:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">프로젝트 구조 자동 생성기</h1>
      <p className="text-lg text-center text-gray-600 mb-8">당신의 코딩을 보다 더 쉽게</p>

      <div className="flex w-full gap-2 justify-center">
        <input
          type="text"
          placeholder="자연어로 구조 생성하기"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-96 border border-gray-300 rounded-md px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      {/* ✅ 로딩 중일 때 */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-zinc-800 text-white rounded-xl shadow-lg w-[400px] px-6 py-5 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">⏳</span>
              <span className="text-base font-semibold whitespace-nowrap">프로젝트 구조가 생성 중입니다...</span>
            </div>
            <button
              className="mt-1 px-4 py-1 bg-gray-700 rounded hover:bg-red-600 transition text-sm"
              onClick={() => setIsLoading(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}


      {/* ❌ 에러 발생 시 */}
      {isError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="bg-red-700 text-white rounded-lg shadow-lg px-8 py-6 w-[340px] text-center relative">
            <div className="flex items-center justify-center mb-4">
              <span className="text-white text-xl mr-2">❌</span>
              <span className="text-lg font-semibold">구조 생성에 실패했습니다.</span>
            </div>
            <button
              className="absolute bottom-2 right-4 text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-800 transition"
              onClick={() => setIsError(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Headline;
