import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { FiUser, FiMail, FiCalendar, FiEdit2, FiSave, FiX, FiCamera, FiPhone, FiFileText } from 'react-icons/fi';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    birthDate: user?.birthDate || '',
    gender: user?.gender || 'other',
    bio: user?.bio || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      birthDate: user?.birthDate || '',
      gender: user?.gender || 'other',
      bio: user?.bio || '',
      phoneNumber: user?.phoneNumber || '',
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Manage your personal information</p>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-8">
        {/* Profile Header */}
        <div className="flex items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full border border-gray-700 hover:bg-gray-700 transition-colors">
              <FiCamera size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="ml-6 flex-1">
            <h2 className="text-2xl font-semibold text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-gray-400">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <FiEdit2 size={18} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiUser className="inline mr-2" size={16} />
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiUser className="inline mr-2" size={16} />
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiMail className="inline mr-2" size={16} />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiPhone className="inline mr-2" size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiCalendar className="inline mr-2" size={16} />
                Birth Date
              </label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Bio */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FiFileText className="inline mr-2" size={16} />
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                placeholder="Tell us about yourself..."
                className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 resize-none"
              />
            </div>
          </div>

          {/* Form Actions */}
          {isEditing && (
            <div className="flex gap-4 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave size={18} />
                    Save Changes
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-800 text-gray-300 font-semibold rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <FiX size={18} />
                Cancel
              </button>
            </div>
          )}
        </form>

        {/* Account Actions */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              Change Password
            </button>
            <span className="mx-3 text-gray-600">•</span>
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              Two-Factor Authentication
            </button>
            <span className="mx-3 text-gray-600">•</span>
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              Download My Data
            </button>
            <span className="mx-3 text-gray-600">•</span>
            <button className="text-red-400 hover:text-red-300 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
