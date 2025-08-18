import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiEdit, FiMusic } from 'react-icons/fi';
import ConfirmDialog from './ConfirmDialog';
import LocalizedTextInput from './LocalizedTextInput';

export interface Story {
  storyCityId: number;
  name: string;
  nameTextRefId: number;
  description?: string;
  descriptionTextRefId?: number;
  audioUrl?: string;
  audioUrlRefId?: number;
  cityId?: number;
}

export interface StoryForm {
  name: string;
  nameTextRefId: number;
  description: string;
  descriptionTextRefId: number;
  audioUrl: string;
  audioUrlRefId: number;
}

interface StoriesCardProps {
  stories: Story[];
  onAddStory?: (storyData: StoryForm) => Promise<void>;
  onEditStory?: (storyId: number, storyData: StoryForm) => Promise<void>;
  onDeleteStory?: (storyId: number) => Promise<void>;
  title?: string;
  showAddButton?: boolean;
}

const StoriesCard: React.FC<StoriesCardProps> = ({
  stories,
  onAddStory,
  onEditStory,
  onDeleteStory,
  title = "Histórias",
  showAddButton = true
}) => {
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [editingStoryId, setEditingStoryId] = useState<number | null>(null);
  const [deleteStoryId, setDeleteStoryId] = useState<number | null>(null);
  const [storyForm, setStoryForm] = useState<StoryForm>({
    name: '',
    nameTextRefId: 0,
    description: '',
    descriptionTextRefId: 0,
    audioUrl: '',
    audioUrlRefId: 0
  });

  const handleAddStory = async () => {
    if (editingStoryId && onEditStory) {
      await onEditStory(editingStoryId, storyForm);
    } else if (onAddStory) {
      await onAddStory(storyForm);
    }
    setStoryForm({
      name: '',
      nameTextRefId: 0,
      description: '',
      descriptionTextRefId: 0,
      audioUrl: '',
      audioUrlRefId: 0
    });
    setShowStoryModal(false);
    setEditingStoryId(null);
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
                    {story.name || `Nome não encontrado (ID: ${story.nameTextRefId})`}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    {story.description && (
                      <span>{story.description}</span>
                    )}
                    {story.audioUrl && (
                      <span className="flex items-center gap-1">
                        <FiMusic />
                        Áudio disponível
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {onEditStory && (
                    <button
                      onClick={() => {
                        setEditingStoryId(story.storyCityId);
                        setStoryForm({
                          name: story.name || '',
                          nameTextRefId: story.nameTextRefId,
                          description: story.description || '',
                          descriptionTextRefId: story.descriptionTextRefId || 0,
                          audioUrl: story.audioUrl || '',
                          audioUrlRefId: story.audioUrlRefId || 0
                        });
                        setShowStoryModal(true);
                      }}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    >
                      <FiEdit />
                    </button>
                  )}
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
            </div>
          ))
        )}
      </div>
    </div>

      {/* Add Story Modal */}
      {showStoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingStoryId ? 'Editar História' : 'Adicionar História'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-white text-sm block mb-2">Nome da História</label>
                <LocalizedTextInput
                  value={storyForm.name}
                  onChange={(value) => setStoryForm(prev => ({ ...prev, name: value }))}
                  onBothChange={(value, referenceId) => {
                    setStoryForm(prev => ({ ...prev, name: value, nameTextRefId: referenceId }));
                  }}
                  onReferenceIdChange={(referenceId) => {
                    setStoryForm(prev => ({ ...prev, nameTextRefId: referenceId }));
                  }}
                  fieldName="Nome da História"
                  placeholder="Digite o nome da história"
                  referenceId={storyForm.nameTextRefId || 0}
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">Descrição da História</label>
                <LocalizedTextInput
                  value={storyForm.description}
                  onChange={(value) => setStoryForm(prev => ({ ...prev, description: value }))}
                  onBothChange={(value, referenceId) => {
                    setStoryForm(prev => ({ ...prev, description: value, descriptionTextRefId: referenceId }));
                  }}
                  onReferenceIdChange={(referenceId) => {
                    setStoryForm(prev => ({ ...prev, descriptionTextRefId: referenceId }));
                  }}
                  fieldName="Descrição da História"
                  placeholder="Digite a descrição da história"
                  referenceId={storyForm.descriptionTextRefId || 0}
                />
              </div>
              <div>
                <label className="text-white text-sm block mb-2">URL do Áudio</label>
                <LocalizedTextInput
                  value={storyForm.audioUrl}
                  onChange={(value) => setStoryForm(prev => ({ ...prev, audioUrl: value }))}
                  onBothChange={(value, referenceId) => {
                    setStoryForm(prev => ({ ...prev, audioUrl: value, audioUrlRefId: referenceId }));
                  }}
                  onReferenceIdChange={(referenceId) => {
                    setStoryForm(prev => ({ ...prev, audioUrlRefId: referenceId }));
                  }}
                  fieldName="URL do Áudio"
                  placeholder="Digite a URL do arquivo de áudio"
                  referenceId={storyForm.audioUrlRefId || 0}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStoryModal(false);
                  setEditingStoryId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddStory}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {editingStoryId ? 'Atualizar História' : 'Adicionar História'}
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
