import { useState, useEffect } from 'react';
import './FilePreview.css';

interface FilePreviewProps {
  selectedFile: string | null;
}

const FilePreview: React.FC<FilePreviewProps> = ({ selectedFile }) => {
  const [fileContent, setFileContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');

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
          setEditedContent(data.content);
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
      setEditedContent('');
    }
  }, [selectedFile]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedContent(fileContent);
  };

  const handleSaveClick = async () => {
    if (editedContent !== fileContent) {
      const storedProject = localStorage.getItem('currentProject');
      if (storedProject) {
        const projectData = JSON.parse(storedProject);
        
        try {
          const response = await fetch('/api/projects/update-file', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              projectName: projectData.projectName,
              filePath: selectedFile,
              content: editedContent
            })
          });

          if (!response.ok) {
            throw new Error('Failed to save file');
          }

          setFileContent(editedContent);
          setIsEditing(false);
        } catch (error) {
          console.error('Error saving file:', error);
          alert('Failed to save file. Please try again.');
        }
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelClick = () => {
    setEditedContent(fileContent);
    setIsEditing(false);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedContent(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSaveClick();
    } else if (e.key === 'Escape') {
      handleCancelClick();
    }
  };

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
        <span className="file-name">
          {selectedFile}
          {isEditing && editedContent !== fileContent && (
            <span className="unsaved-indicator">*</span>
          )}
        </span>
        <div className="file-actions">
          {!isEditing ? (
            <button 
              className="edit-button"
              onClick={handleEditClick}
              title="Edit file"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
          ) : (
            <div className="edit-actions">
              <button 
                className="save-button"
                onClick={handleSaveClick}
                title="Save changes"
                disabled={editedContent === fileContent}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17,21 17,13 7,13 7,21"></polyline>
                  <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
              </button>
              <button 
                className="cancel-button"
                onClick={handleCancelClick}
                title="Cancel editing"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="file-preview-content">
        {isEditing ? (
          <textarea
            className="code-editor"
            value={editedContent}
            onChange={handleContentChange}
            spellCheck={false}
            autoFocus
            onKeyDown={handleKeyDown}
          />
        ) : (
          <pre className="code-content">
            <code>{fileContent}</code>
          </pre>
        )}
      </div>
    </div>
  );
};

export default FilePreview;
