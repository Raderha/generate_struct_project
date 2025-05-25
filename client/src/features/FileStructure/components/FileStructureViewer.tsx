// src/features/FileStructure/components/FileStructureViewer.tsx
import { useState, useEffect } from 'react';
import './FileStructureViewer.css';  // 스타일시트 추가

interface FileStructureViewerProps {
  onFileSelect: (filePath: string) => void;
}

interface FileNode {
  name: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  path: string;
}

const FileStructureViewer: React.FC<FileStructureViewerProps> = ({ onFileSelect }) => {
  const [fileStructure, setFileStructure] = useState<FileNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<string[]>([]);

  useEffect(() => {
    // 로컬 스토리지에서 프로젝트 데이터 가져오기
    const storedProject = localStorage.getItem('currentProject');
    console.log('Stored project data:', storedProject);
    
    if (storedProject) {
      const projectData = JSON.parse(storedProject);
      console.log('Parsed project data:', projectData);
      
      // 프로젝트 구조 가져오기
      fetch('/api/generate/structure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          projectName: projectData.projectName
        })
      })
      .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
          return response.text().then(text => {
            console.error('Error response:', text);
            throw new Error(`HTTP error! status: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Received structure data:', data);
        if (!data.structure || !Array.isArray(data.structure)) {
          console.error('Invalid structure data:', data);
          throw new Error('Invalid structure data received from server');
        }
        setFileStructure(data.structure);
        // 모든 디렉토리를 기본적으로 펼침
        const allDirs = getAllDirectories(data.structure);
        console.log('All directories:', allDirs);
        setExpandedDirs(allDirs);
      })
      .catch(error => {
        console.error('Error fetching project structure:', error);
        setFileStructure([]); // 에러 시 빈 배열로 설정
      });
    }
  }, []);

  // 모든 디렉토리 경로를 가져오는 함수
  const getAllDirectories = (nodes: FileNode[]): string[] => {
    if (!Array.isArray(nodes)) {
      console.error('getAllDirectories received non-array:', nodes);
      return [];
    }
    
    let dirs: string[] = [];
    nodes.forEach(node => {
      if (node.type === 'directory') {
        dirs.push(node.path);
        if (node.children && Array.isArray(node.children)) {
          dirs = [...dirs, ...getAllDirectories(node.children)];
        }
      }
    });
    return dirs;
  };

  // 디렉토리 클릭 시 토글
  const toggleDirectory = (path: string) => {
    if (expandedDirs.includes(path)) {
      setExpandedDirs(expandedDirs.filter(dir => dir !== path));
    } else {
      setExpandedDirs([...expandedDirs, path]);
    }
  };

  // 파일 클릭 시 선택
  const handleFileClick = (path: string) => {
    onFileSelect(path);
  };

  // 재귀적으로 파일 구조를 렌더링합니다
  const renderFileStructure = (nodes: FileNode[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.path} className="file-node">
        <div 
          className={`file-item ${node.type === 'file' ? 'file-node-file' : 'file-node-directory'}`} 
          onClick={() => node.type === 'directory' ? toggleDirectory(node.path) : handleFileClick(node.path)}
        >
          {node.type === 'directory' && (
            <span className="directory-icon">
              {expandedDirs.includes(node.path) ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              )}
            </span>
          )}
          <span className="file-name">{node.name}</span>
        </div>
        {node.type === 'directory' && 
         expandedDirs.includes(node.path) && 
         node.children && (
           <div className="file-children">
             {renderFileStructure(node.children, level + 1)}
           </div>
         )}
      </div>
    ));
  };

  return (
    <div className="file-structure-container">
      {renderFileStructure(fileStructure)}
    </div>
  );
};

export default FileStructureViewer;