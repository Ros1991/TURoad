import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../contexts/ThemeContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 light:from-slate-100 light:via-blue-50 light:to-indigo-100 flex items-center justify-center p-4">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 rounded-lg bg-gray-800/50 backdrop-blur-xl border border-gray-700 text-gray-400 hover:text-white dark:bg-gray-800/50 dark:border-gray-700 dark:text-gray-400 dark:hover:text-white light:bg-white/90 light:border-gray-300 light:text-gray-600 light:hover:text-gray-900 transition-all z-50"
      >
        {theme === 'dark' ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Content */}
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            TURoad Admin
          </h1>
          <p className="mt-2 text-gray-400 dark:text-gray-400 light:text-gray-600">Tourism Routes Administration System</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-800 dark:bg-gray-900/50 dark:border-gray-800 light:bg-white/90 light:border-gray-200 light:shadow-xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
