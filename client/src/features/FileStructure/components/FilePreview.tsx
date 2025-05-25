import { useState, useEffect } from 'react';
import './FilePreview.css';

interface FilePreviewProps {
  selectedFile: string | null;
}

const FilePreview: React.FC<FilePreviewProps> = ({ selectedFile }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      setIsLoading(true);
      setError(null);

      const storedProject = localStorage.getItem('currentProject');
      if (storedProject) {
        const projectData = JSON.parse(storedProject);

        fetch('/api/generate/file-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            projectName: projectData.projectName,
            filePath: selectedFile
          })
        })
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch file content');
          }
          return response.json();
        })
        .then(data => {
          setFileContent(data.content);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching file content:', error);
          setError('Failed to load file content');
          setIsLoading(false);
        });
      }
    } else {
      setFileContent('');
    }
  }, [selectedFile]);

  if (!selectedFile) {
    return (
      <div className="file-preview-container">
        <div className="file-preview-empty">
          Select a file to preview its contents
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="file-preview-container">
        <div className="file-preview-empty">Loading file content...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-preview-container">
        <div className="file-preview-empty">{error}</div>
      </div>
    );
  }

  return (
    <div className="file-preview-container">
      <div className="file-preview-header">
        <span className="file-name">{selectedFile}</span>
      </div>
      <div className="file-preview-content">
        <pre className="code-content">
          <code>{fileContent}</code>
        </pre>
      </div>
    </div>
  );
};

export default FilePreview;
