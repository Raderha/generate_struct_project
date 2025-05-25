// src/features/FileStructure/components/DownloadModal.tsx

import React, { useState } from 'react';
import './DownloadModal.css';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (path: string) => void;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onDownload }) => {
  const [filePath, setFilePath] = useState('C:\\Users\\myproject\\project');
  
  if (!isOpen) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onDownload(filePath);
    onClose();
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>파일 경로</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <input
              type="text"
              className="path-input"
              value={filePath}
              onChange={(e) => setFilePath(e.target.value)}
              placeholder="파일 저장 경로를 입력하세요"
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="download-button">다운로드</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DownloadModal;