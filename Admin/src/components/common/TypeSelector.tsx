import React, { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import typesService from '../../services/types.service';

interface TypeWithName {
  typeId: number;
  nameTextRefId: number;
  name: string;
  translatedName?: string;
}

interface TypeSelectorProps {
  value: number | null;
  onChange: (typeId: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  isFilter?: boolean;
}

const TypeSelector: React.FC<TypeSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  placeholder = "Selecione um tipo",
  className = "",
  isFilter = false
}) => {
  const [types, setTypes] = useState<TypeWithName[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<TypeWithName[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<TypeWithName | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTypes();
  }, []);

  useEffect(() => {
    // Find selected type when value changes
    if (value && types.length > 0) {
      const type = types.find(t => t.typeId === value);
      setSelectedType(type || null);
    } else {
      setSelectedType(null);
    }
  }, [value, types]);

  useEffect(() => {
    // Filter types based on search term
    if (searchTerm) {
      const filtered = types.filter(type => 
        type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.typeId.toString().includes(searchTerm)
      );
      setFilteredTypes(filtered);
    } else {
      setFilteredTypes(types);
    }
  }, [searchTerm, types]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadTypes = async () => {
    setLoading(true);
    try {
      // Try to load active types first, fallback to paginated if needed
      let response;
      try {
        response = await typesService.getActiveTypes();
      } catch (error) {
        console.warn('getActiveTypes failed, trying paginated:', error);
        const paginatedResponse = await typesService.getTypes({ page: 1, limit: 1000 });
        response = paginatedResponse.items;
      }
      
      console.log('Types loaded:', response); // Debug log
      
      // Use the name field from backend (already localized) or fallback to type ID
      const typesWithNames = response.map(type => {
        // Backend already returns localized name field
        let displayName = type.name || `Tipo ${type.typeId}`;
        
        // If name is empty, try translations as fallback
        if (!type.name && type.nameTranslations && type.nameTranslations.length > 0) {
          const ptTranslation = type.nameTranslations.find(t => t.language === 'pt');
          if (ptTranslation && ptTranslation.text) {
            displayName = ptTranslation.text;
          }
        }
        
        return {
          ...type,
          name: displayName,
          translatedName: displayName
        };
      });
      
      setTypes(typesWithNames);
      setFilteredTypes(typesWithNames);
    } catch (error) {
      console.error('Failed to load types:', error);
      setTypes([]);
      setFilteredTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (type: TypeWithName | null) => {
    setSelectedType(type);
    onChange(type ? type.typeId : null);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`} style={{ zIndex: 100000 }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-left flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-500 focus:outline-none focus:border-blue-500'}`}
      >
        <span className={selectedType ? 'text-white' : 'text-gray-400'}>
          {selectedType ? selectedType.name : placeholder}
        </span>
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[99999] w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-80 overflow-hidden" style={{ position: 'absolute', zIndex: 100001 }}>
          {/* Search Input */}
          <div className="p-2 border-b border-gray-700">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tipo..."
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Types List */}
          <div className="max-h-60 overflow-y-auto">
            {/* Clear selection option - only show for filters */}
            {isFilter && (
              <button
                onClick={() => handleSelect(null)}
                className="w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors text-gray-400 border-b border-gray-700"
              >
                <span>Todos os tipos</span>
              </button>
            )}
            
            {loading ? (
              <div className="p-4 text-center text-gray-400">Carregando tipos...</div>
            ) : filteredTypes.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                {searchTerm ? 'Nenhum tipo encontrado' : 'Nenhum tipo disponível'}
              </div>
            ) : (
              filteredTypes.map(type => (
                <button
                  key={type.typeId}
                  onClick={() => handleSelect(type)}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors
                    ${type.typeId === value ? 'bg-gray-700 text-blue-400' : 'text-white'}`}
                >
                  <span>{type.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeSelector;
