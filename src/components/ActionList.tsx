import React, { useState } from 'react';
import { 
  LayoutGrid, List, Search, Play, 
  Edit2, Trash2, ExternalLink, Terminal, AlertTriangle
} from 'lucide-react';
import { useAppStore } from '../stores/appStore';
import type { ClickAction } from '../types';

interface ActionListProps {
  onEdit: (action: ClickAction) => void;
}

const getActionIcon = (type: string) => {
  switch (type) {
    case 'open_app': return <ExternalLink size={16} />;
    case 'execute_script': return <Terminal size={16} />;
    default: return <Play size={16} />;
  }
};

export const ActionList: React.FC<ActionListProps> = ({ onEdit }) => {
  const {
    viewMode,
    searchQuery,
    setViewMode,
    setSearchQuery,
    getFilteredActions,
    categories,
    tags,
    incrementExecutionCount,
    deleteClickAction,
  } = useAppStore();

  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; action: ClickAction | null }>({
    isOpen: false,
    action: null,
  });

  const filteredActions = getFilteredActions();

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || '未分类';
  };

  const getTagNames = (tagIds: string[]) => {
    return tagIds
      .map((id) => tags.find((t) => t.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const handleExecute = (action: ClickAction) => {
    incrementExecutionCount(action.id);
    console.log('Executing:', action.action);
  };

  return (
    <div className="action-list-container">
      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="搜索小程序..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="view-toggle">
          <button
            className={viewMode === 'grid' ? 'active' : ''}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid size={18} />
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className={`content ${viewMode}`}>
        {filteredActions.length === 0 ? (
          <div className="empty-state">
            <p>没有找到小程序</p>
            <p className="sub">点击左侧"添加小程序"按钮创建</p>
          </div>
        ) : (
          filteredActions.map((action) => (
            <div key={action.id} className="action-card">
              <div className="card-header">
                <div className="icon-wrapper">
                  {getActionIcon(action.action.type)}
                </div>
                <div className="card-content">
                  <div className="card-title-row">
                    <h3>{action.name}</h3>
                    <div className="card-actions">
                      <button
                        className="execute-btn"
                        onClick={() => handleExecute(action)}
                        title="执行"
                      >
                        <Play size={16} />
                      </button>
                      <button
                        className="edit-btn"
                        onClick={() => onEdit(action)}
                        title="编辑"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => setDeleteConfirm({ isOpen: true, action })}
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="description">{action.description || <em className="no-desc">无描述</em>}</p>
                  <div className="card-meta">
                    <span className="category">{getCategoryName(action.categoryId)}</span>
                    {action.tagIds.length > 0 && (
                      <span className="tags">{getTagNames(action.tagIds)}</span>
                    )}
                    <span className="stats">执行 {action.executionCount} 次</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {deleteConfirm.isOpen && deleteConfirm.action && (
          <div className="delete-modal-overlay" onClick={() => setDeleteConfirm({ isOpen: false, action: null })}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="delete-modal-icon">
                <AlertTriangle size={32} />
              </div>
              <h3>确认删除</h3>
              <p>确定要删除 "{deleteConfirm.action.name}" 吗？此操作无法撤销。</p>
              <div className="delete-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() => setDeleteConfirm({ isOpen: false, action: null })}
                >
                  取消
                </button>
                <button
                  className="btn-delete"
                  onClick={() => {
                    deleteClickAction(deleteConfirm.action!.id);
                    setDeleteConfirm({ isOpen: false, action: null });
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
        .action-list-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: #f9fafb;
        }
        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          background: #ffffff;
          border-bottom: 1px solid #e5e7eb;
        }
        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f3f4f6;
          padding: 8px 14px;
          border-radius: 8px;
          width: 320px;
          color: #6b7280;
        }
        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 14px;
          width: 100%;
          color: #374151;
        }
        .view-toggle {
          display: flex;
          gap: 4px;
          background: #f3f4f6;
          padding: 4px;
          border-radius: 6px;
        }
        .view-toggle button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          color: #6b7280;
          transition: all 0.15s;
        }
        .view-toggle button.active {
          background: #ffffff;
          color: #2563eb;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .view-toggle button:hover:not(.active) {
          color: #374151;
        }
        .content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .content.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 16px;
        }
        .content.list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #9ca3af;
        }
        .empty-state p {
          font-size: 16px;
          margin: 0;
        }
        .empty-state .sub {
          font-size: 14px;
          margin-top: 8px;
        }
        .action-card {
          background: #ffffff;
          border-radius: 10px;
          padding: 12px;
          border: 1px solid #e5e7eb;
          transition: all 0.15s;
        }
        .action-card:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 4px -1px rgba(0,0,0,0.1);
        }
        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        .icon-wrapper {
          width: 36px;
          height: 36px;
          background: #eff6ff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563eb;
          flex-shrink: 0;
          padding: 6px;
        }
        .card-content {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .card-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .card-title-row h3 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .card-actions {
          display: flex;
          gap: 2px;
          opacity: 0;
          transition: opacity 0.15s;
        }
        .action-card:hover .card-actions {
          opacity: 1;
        }
        .card-actions button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 4px;
          color: #9ca3af;
          transition: all 0.15s;
        }
        .card-actions button:hover {
          background: #f3f4f6;
          color: #374151;
        }
        .card-actions .execute-btn:hover {
          background: #dcfce7;
          color: #16a34a;
        }
        .card-actions .delete-btn:hover {
          background: #fee2e2;
          color: #dc2626;
        }
        .description {
          font-size: 12px;
          color: #6b7280;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-style: italic;
        }
        .no-desc {
          color: #9ca3af;
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: #9ca3af;
          margin-top: 4px;
        }
        .category {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
        }
        .tags {
          color: #9ca3af;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .stats {
          margin-left: auto;
          flex-shrink: 0;
        }
        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
        }
        .delete-modal {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          width: 360px;
          text-align: center;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .delete-modal-icon {
          width: 56px;
          height: 56px;
          background: #fef2f2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: #dc2626;
        }
        .delete-modal h3 {
          margin: 0 0 8px;
          font-size: 18px;
          font-weight: 600;
          color: #111827;
        }
        .delete-modal p {
          margin: 0 0 24px;
          font-size: 14px;
          color: #6b7280;
        }
        .delete-modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .delete-modal-actions button {
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-cancel {
          background: #f3f4f6;
          border: none;
          color: #374151;
        }
        .btn-cancel:hover {
          background: #e5e7eb;
        }
        .btn-delete {
          background: #dc2626;
          border: none;
          color: #ffffff;
        }
        .btn-delete:hover {
          background: #b91c1c;
        }
      `}</style>
    </div>
  );
};
