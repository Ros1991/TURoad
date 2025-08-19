import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiTrash2, FiUser, FiMail, FiShield, FiToggleLeft, FiToggleRight, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import usersService, { User } from '../../services/users.service';
import UserPushSettingsCard from '../../components/common/UserPushSettingsCard';

const UserDetailsPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePictureUrl: '',
    isAdmin: false,
    enabled: true
  });

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      console.log('Loading user with ID:', id);
      const data = await usersService.getUserById(Number(id));
      console.log('User data received:', data);
      
      setUser(data);
      setFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        profilePictureUrl: data.profilePictureUrl || '',
        isAdmin: data.isAdmin || false,
        enabled: data.enabled !== false
      });
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Falha ao carregar usuário');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await usersService.deleteUser(Number(id));
      toast.success('Usuário excluído com sucesso');
      navigate('/users');
    } catch (error) {
      toast.error('Falha ao excluir usuário');
    }
  };

  const handleToggleAdmin = async () => {
    try {
      await usersService.updateUser(Number(id), { ...user!, isAdmin: !user!.isAdmin });
      toast.success('Admin status updated');
      loadUser();
    } catch (error) {
      toast.error('Failed to update admin status');
    }
  };

  const handleToggleEnabled = async () => {
    try {
      await usersService.updateUser(Number(id), { ...user!, enabled: !user!.enabled });
      toast.success('User status updated');
      loadUser();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleSaveEdit = async () => {
    if (!user) return;
    try {
      await usersService.updateUser(user.userId, formData);
      toast.success('User updated successfully');
      setEditMode(false);
      loadUser();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        profilePictureUrl: user.profilePictureUrl || '',
        isAdmin: user.isAdmin || false,
        enabled: user.enabled !== false
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-gray-400">
        User not found
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/users"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Voltar para Usuários
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Detalhes do Usuário</h1>
            <p className="text-gray-400">Gerencie informações e permissões do usuário</p>
          </div>
          <div className="flex gap-3">
            {!editMode ? (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Editar Usuário
                </button>
                <button
                  onClick={handleToggleAdmin}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    user.isAdmin 
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <FiShield />
                  {user.isAdmin ? 'Admin' : 'Not Admin'}
                </button>
                <button
                  onClick={handleToggleEnabled}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    user.enabled 
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                >
                  {user.enabled ? <FiToggleRight /> : <FiToggleLeft />}
                  {user.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                >
                  <FiTrash2 />
                  Excluir Usuário
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                >
                  <FiCheck />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <FiX />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* User Information */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Informações do Usuário</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Nome</label>
            {editMode ? (
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white flex items-center gap-2">
                <FiUser className="text-gray-400" />
                {user.firstName}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Sobrenome</label>
            {editMode ? (
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white">{user.lastName}</p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">Email</label>
            {editMode ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            ) : (
              <p className="text-white flex items-center gap-2">
                <FiMail className="text-gray-400" />
                {user.email}
              </p>
            )}
          </div>
          <div>
            <label className="text-gray-400 text-sm">URL da Foto de Perfil</label>
            {editMode ? (
              <input
                type="url"
                value={formData.profilePictureUrl}
                onChange={(e) => setFormData({ ...formData, profilePictureUrl: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="https://exemplo.com/foto.jpg"
              />
            ) : (
              <p className="text-white">
                {user.profilePictureUrl || 'Não informado'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4">Status da Conta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-400 text-sm">Função</label>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                user.isAdmin 
                  ? 'bg-yellow-500/20 text-yellow-400' 
                  : 'bg-gray-700 text-gray-300'
              }`}>
                <FiShield />
                {user.isAdmin ? 'Administrador' : 'Usuário Regular'}
              </span>
            </div>
          </div>
          <div>
            <label className="text-gray-400 text-sm">Status</label>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                user.enabled 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {user.enabled ? <FiCheck /> : <FiX />}
                {user.enabled ? 'Ativo' : 'Desabilitado'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Push Notification Settings */}
      <UserPushSettingsCard userId={user.userId} />

      {/* Delete User Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Confirmar Exclusão</h2>
            <p className="text-gray-300 mb-6">
              Tem certeza de que deseja excluir o usuário <strong>{user?.firstName} {user?.lastName}</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <FiTrash2 />
                Excluir Usuário
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetailsPage;
