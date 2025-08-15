import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';

const RoutesPage: React.FC = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Rotas</h1>
        <p className="text-gray-400">Descubra e gerencie rotas turísticas</p>
      </div>
      
      <div className="flex justify-end mb-6">
        <Link
          to="/routes/new"
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-105 flex items-center gap-2"
        >
          <FiPlus size={18} />
          <span>Add Route</span>
        </Link>
      </div>

      <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
        <p className="text-gray-400">Routes page - To be implemented</p>
      </div>
    </div>
  );
};

export default RoutesPage;
