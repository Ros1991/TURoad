import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiPlay, FiMusic } from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';

export interface Story {
  storyCityId: number;
  nameTextRefId: number;
  descriptionTextRefId?: number;
  playCount: number;
  audioUrlRefId?: number;
  cityId?: number;
}

export interface StoryForm {
  nameTextRefId: number;
  descriptionTextRefId: number;
  audioUrlRefId: number;
}

interface StoriesCardProps {
  stories: Story[];
  onAddStory?: (storyData: StoryForm) => Promise<void>;
  onDeleteStory?: (storyId: number) => Promise<void>;
  title?: string;
  showAddButton?: boolean;
}

const StoriesCard: React.FC<StoriesCardProps> = ({
  stories,
  onAddStory,
  onDeleteStory,
  title = "Histórias",
  showAddButton = true
}) => {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [deleteStoryId, setDeleteStoryId] = useState<number | null>(null);
  const [storyForm, setStoryForm] = useState<StoryForm>({
    nameTextRefId: 0,
    descriptionTextRefId: 0,
    audioUrlRefId: 0
  });

  const handleAddStory = async () => {
    if (onAddStory) {
      await onAddStory(storyForm);
      setStoryForm({
        nameTextRefId: 0,
        descriptionTextRefId: 0,
        audioUrlRefId: 0
      });
      setShowStoryModal(false);
    }
  };

  const handleDeleteStory = async () => {
    if (deleteStoryId && onDeleteStory) {
      await onDeleteStory(deleteStoryId);
      setDeleteStoryId(null);
    }
  };

  return (
    <>
      {/* Main Card */}
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">{title} ({stories.length})</h2>
        {showAddButton && onAddStory && (
          <button
            onClick={() => setShowStoryModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <FiPlus />
            Adicionar História
          </button>
        )}
      </div>

      <div className="space-y-4">
        {stories.length === 0 ? (
          <p className="text-gray-400 text-center py-8">Nenhuma história disponível</p>
        ) : (
          stories.map((story) => (
            <div
              key={story.storyCityId}
              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-2">
                    Ref. Nome: {story.nameTextRefId}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiPlay />
                      {story.playCount} reproduções
                    </span>
                    {story.audioUrlRefId && (
                      <span className="flex items-center gap-1">
                        <FiMusic />
                        Áudio: {story.audioUrlRefId}
                      </span>
                    )}
                  </div>
                </div>
                {onDeleteStory && (
                  <button
                    onClick={() => setDeleteStoryId(story.storyCityId)}
                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>

      {/* Add Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Adicionar História</h3>
            <div className="space-y-4">
              <div>
                <label className="text-gray-400 text-sm block mb-2">ID Referência Nome</label>
                <input
                  type="number"
                  value={storyForm.nameTextRefId}
                  onChange={(e) => setStoryForm({ ...storyForm, nameTextRefId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">ID Referência Descrição</label>
                <input
                  type="number"
                  value={storyForm.descriptionTextRefId}
                  onChange={(e) => setStoryForm({ ...storyForm, descriptionTextRefId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-2">ID Referência URL Áudio</label>
                <input
                  type="number"
                  value={storyForm.audioUrlRefId}
                  onChange={(e) => setStoryForm({ ...storyForm, audioUrlRefId: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowStoryModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStory}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Adicionar História
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteStoryId}
        title="Excluir História"
        message="Tem certeza que deseja excluir esta história"
        confirmText="Excluir"
        cancelText="Cancelar"
        confirmColor="red"
        onConfirm={handleDeleteStory}
        onCancel={() => setDeleteStoryId(null)}
      />
    </>
  );
};

export default StoriesCard;
