import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ActionList } from './components/ActionList';
import { ActionFormModal } from './components/ActionFormModal';
import type { ClickAction } from './types';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ClickAction | null>(null);

  const handleAddClick = () => {
    setEditingAction(null);
    setIsModalOpen(true);
  };

  const handleEdit = (action: ClickAction) => {
    setEditingAction(action);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAction(null);
  };

  return (
    <div className="app">
      <Sidebar onAddClick={handleAddClick} />
      <ActionList onEdit={handleEdit} />
      <ActionFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editAction={editingAction}
      />

      <style>{`
        .app {
          height: 100vh;
          display: flex;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;
