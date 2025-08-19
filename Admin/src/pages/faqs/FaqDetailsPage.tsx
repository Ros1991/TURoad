import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import faqsService, { FAQ } from '../../services/faqs.service';
import LocalizedTextInput from '../../components/common/LocalizedTextInput';

const FaqDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    question: '',
    answer: '',
    questionTextRefId: 0,
    answerTextRefId: 0
  });

  useEffect(() => {
    if (id && id !== 'new') {
      loadFaq();
    } else if (id === 'new') {
      setEditMode(true);
      setLoading(false);
    }
  }, [id]);

  const loadFaq = async () => {
    try {
      setLoading(true);
      const faqId = Number(id);
      if (isNaN(faqId)) {
        toast.error('ID de FAQ inválido');
        navigate('/faqs');
        return;
      }
      const data = await faqsService.getFAQById(faqId);
      if (data) {
        setFaq(data);
        if (editMode) {
          const form = {
            question: data.question || '',
            answer: data.answer || '',
            questionTextRefId: data.questionTextRefId || 0,
            answerTextRefId: data.answerTextRefId || 0
          };
          setEditForm(form);
        } else {
          if (data && !editMode) {
            setEditForm({
              question: data.question || '',
              answer: data.answer || '',
              questionTextRefId: data.questionTextRefId || 0,
              answerTextRefId: data.answerTextRefId || 0
            });
          }
        }
      }
    } catch (error) {
      toast.error('Erro ao carregar FAQ');
      navigate('/faqs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      const payload = {
        questionTextRefId: editForm.questionTextRefId,
        answerTextRefId: editForm.answerTextRefId
      };
      
      if (id === 'new') {
        await faqsService.createFAQ(payload);
        toast.success('FAQ criado com sucesso');
        navigate('/faqs');
      } else {
        await faqsService.updateFAQ(Number(id), payload);
        toast.success('FAQ atualizado com sucesso');
        setEditMode(false);
        loadFaq();
      }
    } catch (error) {
      console.error('Error saving FAQ:', error);
      toast.error(id === 'new' ? 'Erro ao criar FAQ' : 'Erro ao atualizar FAQ');
    }
  };

  const handleCancelEdit = () => {
    if (id === 'new') {
      navigate('/faqs');
    } else {
      setEditMode(false);
      if (faq) {
        setEditForm({
          question: faq.question || '',
          answer: faq.answer || '',
          questionTextRefId: faq.questionTextRefId || 0,
          answerTextRefId: faq.answerTextRefId || 0
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      await faqsService.deleteFAQ(Number(id));
      toast.success('FAQ excluído com sucesso');
      navigate('/faqs');
    } catch (error) {
      toast.error('Falha ao excluir FAQ');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Carregando...</div>
      </div>
    );
  }

  if (!faq && id !== 'new') {
    return (
      <div className="text-center text-gray-400">
        FAQ não encontrado
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/faqs"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para FAQs
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {id === 'new' ? 'Novo FAQ' : 'Detalhes do FAQ'}
            </h1>
            <p className="text-gray-400">
              {id === 'new' ? 'Criar novo FAQ' : 'Gerenciar informações do FAQ'}
            </p>
          </div>
          <div className="flex gap-3">
            {!editMode && id !== 'new' ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                >
                  <FiEdit2 />
                  Editar FAQ
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Excluir FAQ
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiCheck />
                  {id === 'new' ? 'Criar FAQ' : 'Salvar Alterações'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FiX />
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {id === 'new' ? 'Informações do Novo FAQ' : 'Informações do FAQ'}
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="text-white text-sm mb-2 block">Pergunta</label>
            {editMode || id === 'new' ? (
              <LocalizedTextInput
                value={editForm.question}
                onChange={(value) => {
                  setEditForm(prev => ({ ...prev, question: value }));
                }}
                onBothChange={(value, referenceId) => {
                  setEditForm(prev => ({ ...prev, question: value, questionTextRefId: referenceId }));
                }}
                onReferenceIdChange={(referenceId) => {
                  setEditForm(prev => ({ ...prev, questionTextRefId: referenceId }));
                }}
                fieldName="Pergunta"
                placeholder="Digite a pergunta do FAQ"
                referenceId={editForm.questionTextRefId || faq?.questionTextRefId || 0}
              />
            ) : (
              <p className="text-white">{faq?.question}</p>
            )}
          </div>
          
          <div>
            <label className="text-white text-sm mb-2 block">Resposta</label>
            {editMode || id === 'new' ? (
              <LocalizedTextInput
                value={editForm.answer}
                onChange={(value) => {
                  setEditForm(prev => ({ ...prev, answer: value }));
                }}
                onBothChange={(value, referenceId) => {
                  setEditForm(prev => ({ ...prev, answer: value, answerTextRefId: referenceId }));
                }}
                onReferenceIdChange={(referenceId) => {
                  setEditForm(prev => ({ ...prev, answerTextRefId: referenceId }));
                }}
                fieldName="Resposta"
                placeholder="Digite a resposta do FAQ"
                referenceId={editForm.answerTextRefId || faq?.answerTextRefId || 0}
              />
            ) : (
              <p className="text-white whitespace-pre-wrap">{faq?.answer}</p>
            )}
          </div>
          
          {faq && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-700">
              <div>
                <label className="text-gray-400 text-sm">Data de Criação</label>
                <p className="text-white">{new Date(faq.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Última Atualização</label>
                <p className="text-white">{new Date(faq.updatedAt).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Confirmar Exclusão</h3>
            <p className="text-gray-400 mb-6">
              Tem certeza que deseja excluir este FAQ? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqDetailsPage;
