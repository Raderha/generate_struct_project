// src/features/FileStructure/FileStructure.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../MainPage/components/TopNav';
import FileStructureViewer from './components/FileStructureViewer';
import FilePreview from './components/FilePreview';
import DownloadModal from './components/DownloadModal';
import './components/FileStructure.css';

interface ProjectData {
  projectName: string;
  downloadUrl: string;
  prompt: string;
}

interface ErrorResponse {
  detail?: string;
  message?: string;
}

function FileStructure() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 로컬 스토리지에서 프로젝트 데이터 가져오기
    const storedProject = localStorage.getItem('currentProject');
    if (!storedProject) {
      // 프로젝트 데이터가 없으면 메인 페이지로 이동
      navigate('/');
      return;
    }
    setProjectData(JSON.parse(storedProject));
  }, [navigate]);
  
  const handleFileSelect = (filePath: string) => {
    setSelectedFile(filePath);
  };
  
  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const handleDownload = async (path: string) => {
    if (!projectData) return;

    try {
      // 경로가 비어있는지 확인
      if (!path || path.trim() === '') {
        throw new Error('저장 경로를 입력해주세요.');
      }

      const requestBody = {
        projectName: projectData.projectName,
        savePath: path.replace(/\\/g, '/')
      };
      
      console.log('Sending download request with body:', requestBody);

      // 프로젝트를 지정된 경로에 저장
      const response = await fetch('/api/generate/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let responseData;
      try {
        const text = await response.text();
        console.log('Raw response:', text);
        responseData = JSON.parse(text);
        console.log('Parsed response data:', responseData);
      } catch (jsonError) {
        console.error('Error parsing response:', jsonError);
        throw new Error('서버 응답을 처리하는 중 오류가 발생했습니다.');
      }

      if (!response.ok) {
        // 서버에서 반환한 에러 메시지 처리
        const errorMessage = responseData?.detail || '프로젝트 저장에 실패했습니다.';
        console.error('Server error:', errorMessage);
        throw new Error(errorMessage);
      }

      // 성공 메시지 표시
      alert(responseData.message || '프로젝트가 성공적으로 저장되었습니다.');
      
      // ZIP 파일 다운로드
      try {
        const downloadResponse = await fetch(projectData.downloadUrl);
        if (!downloadResponse.ok) {
          throw new Error('ZIP 파일 다운로드에 실패했습니다.');
        }
        
        const blob = await downloadResponse.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectData.projectName}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } catch (downloadError) {
        console.error('ZIP download error:', downloadError);
        alert('ZIP 파일 다운로드 중 오류가 발생했습니다.');
      }
      
    } catch (error) {
      console.error('Download error:', error);
      console.error('Error type:', typeof error);
      console.error('Error object:', error);
      
      // 에러 메시지 처리 개선
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        alert(error.message);
      } else if (typeof error === 'string') {
        console.error('String error:', error);
        alert(error);
      } else if (error && typeof error === 'object') {
        // 객체 형태의 에러 처리
        const errorObj = error as ErrorResponse;
        console.error('Object error:', errorObj);
        const errorMessage = errorObj.detail || errorObj.message || '프로젝트 저장 중 오류가 발생했습니다.';
        alert(errorMessage);
      } else {
        console.error('Unknown error type');
        alert('프로젝트 저장 중 오류가 발생했습니다.');
      }
    }
  };
  
  if (!projectData) {
    return null; // 로딩 중
  }

  return (
    <div className="file-structure-page">
      {/* 상단 네비게이션 */}
      <TopNav />
      
      {/* 메인 컨텐츠 */}
      <div className="file-structure-content">
        {/* 좌측: 파일 다운로드 */}
        <div className="file-download-section">
          <div className="file-header">
            <h2>{projectData.projectName}</h2>
            <button className="download-icon" onClick={openModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          </div>
          <div className="file-structure-viewer">
            <FileStructureViewer onFileSelect={handleFileSelect} />
          </div>
          
          {/* 저장 버튼을 카드 내부로 이동 */}
          <div className="save-button-container">
            <button className="save-button" onClick={openModal}>프로젝트 저장</button>
          </div>
        </div>
        
        {/* 우측: 파일 미리보기 */}
        <div className="file-preview-section">
          <div className="file-header">
            <h2>파일 미리보기</h2>
          </div>
          <div className="file-preview-viewer">
            <FilePreview selectedFile={selectedFile} />
          </div>
        </div>
      </div>
      
      {/* 다운로드 모달 */}
      <DownloadModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onDownload={handleDownload} 
      />
    </div>
  );
}

export default FileStructure;