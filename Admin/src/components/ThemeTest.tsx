import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeTest: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-red-500 text-white rounded z-50">
      <div>Tema atual: {theme}</div>
      <button onClick={toggleTheme} className="mt-2 px-2 py-1 bg-blue-500 rounded">
        Alternar Tema
      </button>
    </div>
  );
};

export default ThemeTest;
