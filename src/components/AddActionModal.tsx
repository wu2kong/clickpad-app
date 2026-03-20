import React, { useState } from 'react';
import { X, Edit3, Folder, FileText, FolderOpen, FolderSearch, FileSearch, Globe, Loader2 } from 'lucide-react';

interface AddActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onManualCreate: () => void;
  onFromApp: () => void;
  onFromFile: () => void;
  onFromDirectory: () => void;
  onFromFileWithPath?: (path: string) => void | Promise<void>;
  onFromDirectoryWithPath?: (path: string) => void | Promise<void>;
  onFromUrl?: (url: string) => void | Promise<void>;
}

type SubMenuType = 'file' | 'directory' | 'url' | null;

export const AddActionModal: React.FC<AddActionModalProps> = ({
  isOpen,
  onClose,
  onManualCreate,
  onFromApp,
  onFromFile,
  onFromDirectory,
  onFromFileWithPath,
  onFromDirectoryWithPath,
  onFromUrl,
}) => {
  const [subMenu, setSubMenu] = useState<SubMenuType>(null);
  const [manualPath, setManualPath] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleManualCreate = () => {
    onManualCreate();
    onClose();
  };

  const handleFromApp = () => {
    onFromApp();
    onClose();
  };

  const handleFromFilePicker = () => {
    onFromFile();
    onClose();
  };

  const handleFromDirectoryPicker = () => {
    onFromDirectory();
    onClose();
  };

  const handleManualPath = (type: 'file' | 'directory') => {
    setSubMenu(type);
    setManualPath('');
  };

  const handleManualPathSubmit = async () => {
    const path = manualPath.trim();
    if (!path) return;
    
    setIsLoading(true);
    try {
      if (subMenu === 'file' && onFromFileWithPath) {
        await onFromFileWithPath(path);
      } else if (subMenu === 'directory' && onFromDirectoryWithPath) {
        await onFromDirectoryWithPath(path);
      }
      setSubMenu(null);
      setManualPath('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlSubmit = async () => {
    let url = urlInput.trim();
    if (!url || !onFromUrl) return;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    
    setIsLoading(true);
    try {
      await onFromUrl(url);
      setSubMenu(null);
      setUrlInput('');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackFromSubMenu = () => {
    if (isLoading) return;
    setSubMenu(null);
    setManualPath('');
    setUrlInput('');
  };

  const handleClose = () => {
    if (isLoading) return;
    setSubMenu(null);
    setManualPath('');
    setUrlInput('');
    onClose();
  };

  const getTitle = () => {
    switch (subMenu) {
      case 'file': return '添加文件';
      case 'directory': return '添加目录';
      case 'url': return '添加网址';
      default: return '添加小程序';
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{getTitle()}</h2>
          <button className="close-btn" onClick={handleClose} disabled={isLoading}>
            <X size={20} />
          </button>
        </div>

        {subMenu === null && (
          <div className="modal-body">
            <button className="option-btn from-app" onClick={handleFromApp}>
              <div className="option-icon">
                <Folder size={24} />
              </div>
              <div className="option-content">
                <h3>从应用选择</h3>
                <p>自动提取应用信息和图标（支持多选）</p>
              </div>
            </button>

            <button className="option-btn from-file" onClick={() => handleManualPath('file')}>
              <div className="option-icon">
                <FileText size={24} />
              </div>
              <div className="option-content">
                <h3>添加文件</h3>
                <p>选择或输入文件路径（支持多选）</p>
              </div>
            </button>

            <button className="option-btn from-directory" onClick={() => handleManualPath('directory')}>
              <div className="option-icon">
                <FolderOpen size={24} />
              </div>
              <div className="option-content">
                <h3>添加目录</h3>
                <p>选择或输入目录路径（支持多选）</p>
              </div>
            </button>

            <button className="option-btn from-url" onClick={() => setSubMenu('url')}>
              <div className="option-icon">
                <Globe size={24} />
              </div>
              <div className="option-content">
                <h3>添加网址</h3>
                <p>快捷打开网页链接</p>
              </div>
            </button>

            <button className="option-btn manual" onClick={handleManualCreate}>
              <div className="option-icon">
                <Edit3 size={24} />
              </div>
              <div className="option-content">
                <h3>手动创建</h3>
                <p>自定义名称、动作和参数</p>
              </div>
            </button>
          </div>
        )}

        {subMenu === 'file' && (
          <div className="modal-body">
            <button className="option-btn from-file" onClick={handleFromFilePicker} disabled={isLoading}>
              <div className="option-icon">
                <FileSearch size={24} />
              </div>
              <div className="option-content">
                <h3>从文件选择器选择</h3>
                <p>使用系统文件选择器（支持多选）<br />按快捷键Cmd+Shift+.可切换显示隐藏文件</p>
              </div>
            </button>

            <div className="manual-path-section">
              <div className="manual-path-header">
                <span>或手动输入路径（支持隐藏文件）</span>
              </div>
              <input
                type="text"
                className="manual-path-input"
                value={manualPath}
                onChange={(e) => setManualPath(e.target.value)}
                placeholder="/path/to/file"
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleManualPathSubmit()}
                disabled={isLoading}
              />
              <div className="manual-path-actions">
                <button className="btn-secondary" onClick={handleBackFromSubMenu} disabled={isLoading}>
                  返回
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleManualPathSubmit}
                  disabled={!manualPath.trim() || isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="spinner" size={16} /> 添加中...</>
                  ) : '添加'}
                </button>
              </div>
            </div>
          </div>
        )}

        {subMenu === 'directory' && (
          <div className="modal-body">
            <button className="option-btn from-directory" onClick={handleFromDirectoryPicker} disabled={isLoading}>
              <div className="option-icon">
                <FolderSearch size={24} />
              </div>
              <div className="option-content">
                <h3>从目录选择器选择</h3>
                <p>使用系统目录选择器（支持多选）<br />按快捷键Cmd+Shift+.可切换显示隐藏目录</p>
              </div>
            </button>

            <div className="manual-path-section">
              <div className="manual-path-header">
                <span>或手动输入路径（支持隐藏目录）</span>
              </div>
              <input
                type="text"
                className="manual-path-input"
                value={manualPath}
                onChange={(e) => setManualPath(e.target.value)}
                placeholder="/path/to/directory"
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleManualPathSubmit()}
                disabled={isLoading}
              />
              <div className="manual-path-actions">
                <button className="btn-secondary" onClick={handleBackFromSubMenu} disabled={isLoading}>
                  返回
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleManualPathSubmit}
                  disabled={!manualPath.trim() || isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="spinner" size={16} /> 添加中...</>
                  ) : '添加'}
                </button>
              </div>
            </div>
          </div>
        )}

        {subMenu === 'url' && (
          <div className="modal-body">
            <div className="url-input-section">
              <div className="url-input-header">
                <span>输入网址</span>
              </div>
              <input
                type="text"
                className="url-input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://github.com"
                onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleUrlSubmit()}
                disabled={isLoading}
              />
              {isLoading && (
                <div className="loading-hint">
                  <Loader2 className="spinner" size={14} />
                  <span>正在获取网站图标...</span>
                </div>
              )}
              <div className="url-input-actions">
                <button className="btn-secondary" onClick={handleBackFromSubMenu} disabled={isLoading}>
                  返回
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleUrlSubmit}
                  disabled={!urlInput.trim() || isLoading}
                >
                  {isLoading ? (
                    <><Loader2 className="spinner" size={16} /> 添加中...</>
                  ) : '添加'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .modal-content {
          background: var(--bg-primary);
          border-radius: 12px;
          width: 90%;
          max-width: 420px;
          box-shadow: var(--shadow-md);
        }
        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-primary);
        }
        .modal-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          color: var(--text-tertiary);
        }
        .close-btn:hover:not(:disabled) {
          background: var(--bg-tertiary);
        }
        .close-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .modal-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .option-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border: 2px solid var(--border-primary);
          border-radius: 10px;
          background: var(--bg-primary);
          cursor: pointer;
          transition: all 0.15s;
          text-align: left;
        }
        .option-btn:hover:not(:disabled) {
          border-color: var(--accent-primary);
          background: var(--bg-secondary);
        }
        .option-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .option-icon {
          width: 48px;
          height: 48px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .option-btn.manual .option-icon {
          background: var(--accent-bg);
          color: var(--accent-primary);
        }
        .option-btn.from-app .option-icon {
          background: var(--success-bg);
          color: var(--success-text);
        }
        .option-btn.from-file .option-icon {
          background: #fef3c7;
          color: #d97706;
        }
        .option-btn.from-directory .option-icon {
          background: #dbeafe;
          color: #2563eb;
        }
        .option-btn.from-url .option-icon {
          background: #f0fdf4;
          color: #16a34a;
        }
        .option-content h3 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .option-content p {
          margin: 0;
          font-size: 13px;
          color: var(--text-tertiary);
        }
        .manual-path-section, .url-input-section {
          margin-top: 16px;
        }
        .manual-path-header, .url-input-header {
          font-size: 13px;
          color: var(--text-tertiary);
          margin-bottom: 8px;
        }
        .manual-path-input, .url-input {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--border-secondary);
          border-radius: 6px;
          font-size: 14px;
          color: var(--text-secondary);
          background: var(--bg-primary);
          transition: border-color 0.15s;
          box-sizing: border-box;
        }
        .manual-path-input:focus, .url-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .manual-path-input:disabled, .url-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .loading-hint {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          font-size: 13px;
          color: var(--text-tertiary);
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .manual-path-actions, .url-input-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
        }
        .btn-secondary, .btn-primary {
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-secondary {
          background: var(--bg-tertiary);
          border: none;
          color: var(--text-secondary);
        }
        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-hover);
        }
        .btn-secondary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-primary {
          background: var(--accent-primary);
          border: none;
          color: #ffffff;
        }
        .btn-primary:hover:not(:disabled) {
          background: var(--accent-secondary);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};