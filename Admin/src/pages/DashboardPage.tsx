import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  FiUsers, 
  FiGrid, 
  FiMap, 
  FiMapPin, 
  FiNavigation,
  FiTrendingUp,
  FiActivity,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';

interface DashboardStats {
  users: { total: number; active: number; change: number };
  categories: { total: number; active: number; change: number };
  cities: { total: number; active: number; change: number };
  routes: { total: number; featured: number; change: number };
  locations: { total: number; active: number; change: number };
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 150, active: 142, change: 5.2 },
    categories: { total: 12, active: 10, change: 0 },
    cities: { total: 25, active: 23, change: 8.3 },
    routes: { total: 87, featured: 15, change: 12.5 },
    locations: { total: 342, active: 320, change: -2.1 }
  });

  const statCards = [
    {
      title: 'Total Users',
      value: stats.users.total,
      subtitle: `${stats.users.active} active`,
      change: stats.users.change,
      icon: <FiUsers />,
      color: 'blue',
      link: '/users'
    },
    {
      title: 'Categories',
      value: stats.categories.total,
      subtitle: `${stats.categories.active} active`,
      change: stats.categories.change,
      icon: <FiGrid />,
      color: 'purple',
      link: '/categories'
    },
    {
      title: 'Cities',
      value: stats.cities.total,
      subtitle: `${stats.cities.active} active`,
      change: stats.cities.change,
      icon: <FiMap />,
      color: 'green',
      link: '/cities'
    },
    {
      title: 'Routes',
      value: stats.routes.total,
      subtitle: `${stats.routes.featured} featured`,
      change: stats.routes.change,
      icon: <FiNavigation />,
      color: 'yellow',
      link: '/routes'
    },
    {
      title: 'Locations',
      value: stats.locations.total,
      subtitle: `${stats.locations.active} active`,
      change: stats.locations.change,
      icon: <FiMapPin />,
      color: 'red',
      link: '/locations'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'from-blue-500 to-blue-600',
      purple: 'from-purple-500 to-purple-600',
      green: 'from-green-500 to-green-600',
      yellow: 'from-yellow-500 to-yellow-600',
      red: 'from-red-500 to-red-600'
    };
    return colors[color] || colors.blue;
  };

  const getIconBgClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500/20 text-blue-400',
      purple: 'bg-purple-500/20 text-purple-400',
      green: 'bg-green-500/20 text-green-400',
      yellow: 'bg-yellow-500/20 text-yellow-400',
      red: 'bg-red-500/20 text-red-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Painel de Controle</h1>
        <p className="text-gray-400">Bem-vindo de volta! Aqui está o que está acontecendo com suas rotas.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Link
            key={index}
            to={stat.link}
            className="group relative bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition-all hover:transform hover:scale-105"
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getColorClasses(stat.color)} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`} />
            
            <div className="relative">
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg ${getIconBgClasses(stat.color)} flex items-center justify-center mb-4`}>
                <span className="text-xl">{stat.icon}</span>
              </div>

              {/* Title */}
              <p className="text-sm text-gray-400 mb-1">{stat.title}</p>

              {/* Value */}
              <h3 className="text-lg font-medium text-white mb-1">{stat.value}</h3>

              {/* Subtitle & Change */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{stat.subtitle}</p>
                {stat.change !== 0 && (
                  <div className={`flex items-center text-xs ${stat.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {stat.change > 0 ? <FiArrowUp /> : <FiArrowDown />}
                    <span className="ml-1">{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white mb-4">Atividade Recente</h2>
            <FiActivity className="text-gray-400" />
          </div>
          
          <div className="space-y-3">
            {[
              { action: 'New user registered', user: 'John Doe', time: '2 minutes ago', type: 'user' },
              { action: 'Route updated', user: 'Admin', time: '15 minutes ago', type: 'route' },
              { action: 'New location added', user: 'Sarah Smith', time: '1 hour ago', type: 'location' },
              { action: 'Category created', user: 'Admin', time: '3 hours ago', type: 'category' },
              { action: 'City activated', user: 'Mike Johnson', time: '5 hours ago', type: 'city' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'user' ? 'bg-blue-400' :
                    activity.type === 'route' ? 'bg-yellow-400' :
                    activity.type === 'location' ? 'bg-red-400' :
                    activity.type === 'category' ? 'bg-purple-400' :
                    'bg-green-400'
                  }`} />
                  <div>
                    <p className="text-gray-400 text-center py-8">Nenhuma atividade recente para exibir</p>
                    <p className="text-xs text-gray-500">by {activity.user}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white mb-1">Total de Locais</h3>
            <FiTrendingUp className="text-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/users/new"
              className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group"
            >
              <FiUsers className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <p className="text-sm text-white">Add User</p>
            </Link>
            
            <Link
              to="/categories/new"
              className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group"
            >
              <FiGrid className="text-purple-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <p className="text-sm text-white">Add Category</p>
            </Link>
            
            <Link
              to="/routes/new"
              className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group"
            >
              <FiNavigation className="text-yellow-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <p className="text-sm text-white">Add Route</p>
            </Link>
            
            <Link
              to="/locations/new"
              className="p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-all group"
            >
              <FiMapPin className="text-red-400 mb-2 group-hover:scale-110 transition-transform" size={24} />
              <p className="text-sm text-white">Add Location</p>
            </Link>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
            <p className="text-sm text-gray-300 mb-2">System Health</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">All systems operational</span>
              </div>
              <Link to="/settings" className="text-xs text-blue-400 hover:text-blue-300">
                View details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
