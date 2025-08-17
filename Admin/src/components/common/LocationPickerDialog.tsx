import React, { useState } from 'react';
import { FiX, FiMapPin, FiNavigation, FiExternalLink, FiSearch, FiLoader } from 'react-icons/fi';
import { createPortal } from 'react-dom';

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

interface LocationPickerDialogProps {
  latitude?: number;
  longitude?: number;
  onClose: () => void;
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationPickerDialog: React.FC<LocationPickerDialogProps> = ({
  latitude = -14.235,
  longitude = -51.9253,
  onClose,
  onLocationSelect
}) => {
  const [selectedLat, setSelectedLat] = useState(latitude);
  const [selectedLng, setSelectedLng] = useState(longitude);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, lat: 0, lng: 0 });
  const [zoom] = useState(15);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      lat: selectedLat,
      lng: selectedLng
    });
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Converter pixels para coordenadas geográficas - movimento mais suave
    const latPerPixel = 0.00001; // Reduzido para movimento mais preciso
    const lngPerPixel = 0.00001;
    
    const newLat = dragStart.lat - (deltaY * latPerPixel);
    const newLng = dragStart.lng - (deltaX * lngPerPixel);
    
    setSelectedLat(newLat);
    setSelectedLng(newLng);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const deltaX = clickX - centerX;
    const deltaY = clickY - centerY;
    
    const latPerPixel = 0.00001; // Mesmo valor do drag para consistência
    const lngPerPixel = 0.00001;
    
    const newLat = selectedLat - (deltaY * latPerPixel);
    const newLng = selectedLng + (deltaX * lngPerPixel);
    
    setSelectedLat(newLat);
    setSelectedLng(newLng);
  };

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setSelectedLat(lat);
          setSelectedLng(lng);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          setIsLoadingLocation(false);
        }
      );
    } else {
      console.error('Geolocalização não suportada');
      setIsLoadingLocation(false);
    }
  };


  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/@${selectedLat},${selectedLng},15z`;
    window.open(url, '_blank');
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);
    
    try {
      // Using Nominatim (OpenStreetMap) geocoding service - free, no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=br&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TURoad-Admin/1.0.0'
          }
        }
      );
      
      if (response.ok) {
        const results: LocationResult[] = await response.json();
        setSearchResults(results);
      } else {
        console.error('Erro na busca de localização');
      }
    } catch (error) {
      console.error('Erro ao buscar localização:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: LocationResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Apenas posiciona o mapa - não define como coordenada final
    setSelectedLat(lat);
    setSelectedLng(lng);
    setSelectedLocation(`Busca: ${result.display_name}`);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleConfirm = () => {
    // SEMPRE usar as coordenadas atuais do estado (do mapa)
    console.log('Salvando coordenadas:', selectedLat, selectedLng);
    onLocationSelect(selectedLat, selectedLng);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-white">Selecionar Localização</h3>
          <button 
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700" 
            onClick={onClose}
          >
            <FiX size={20} />
          </button>
        </div>


        {/* Busca de Localização */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Buscar Localização</h4>
          <div className="flex gap-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500"
              placeholder="Ex: Cristo Redentor, Rio de Janeiro"
              disabled={isSearching}
            />
            <button
              onClick={handleSearchLocation}
              disabled={isSearching}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
            >
              {isSearching ? (
                <FiLoader className="animate-spin" size={16} />
              ) : (
                <FiSearch size={16} />
              )}
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          
          {/* Resultados da Busca */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-gray-700 rounded-lg max-h-48 overflow-y-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-4 py-3 text-white hover:bg-gray-600 border-b border-gray-600 last:border-b-0 transition-colors"
                >
                  <div className="font-medium text-sm">{result.display_name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Lat: {parseFloat(result.lat).toFixed(4)}, Lng: {parseFloat(result.lon).toFixed(4)}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Localização Selecionada da Busca */}
          {selectedLocation && (
            <div className="mt-3 bg-green-900/30 border border-green-700 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-400">
                <FiMapPin size={16} />
                <span className="text-sm font-medium">Localização Selecionada:</span>
              </div>
              <div className="text-white text-sm mt-1">{selectedLocation}</div>
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Ações</h4>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {isLoadingLocation ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <FiNavigation size={16} />
              )}
              Minha Localização
            </button>
            
            <button
              onClick={handleOpenGoogleMaps}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
            >
              <FiExternalLink size={16} />
              Abrir Google Maps
            </button>
          </div>
        </div>

        {/* Preview da Localização com Mapa */}
        <div className="mb-6">
          <h4 className="text-white font-medium mb-3">Localização no Mapa</h4>
          <div className="bg-gray-700 rounded-lg p-4">
            
            {/* Mapa Interativo Arrastável */}
            <div 
              className="relative bg-gray-600 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing select-none"
              style={{ height: '300px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleMapClick}
            >
              {/* Simulação de mapa com tiles */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-150"
                style={{
                  backgroundImage: `url(https://tile.openstreetmap.org/${zoom}/${Math.floor((selectedLng + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(selectedLat * Math.PI / 180) + 1 / Math.cos(selectedLat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png)`,
                  backgroundSize: 'cover'
                }}
              />
              
              {/* Marcador fixo no centro */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  {/* Pin do marcador */}
                  <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  {/* Sombra do pin */}
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-4 h-2 bg-black/30 rounded-full blur-sm"></div>
                </div>
              </div>
              
              {/* Instruções */}
              <div className="absolute top-2 left-2 bg-black/80 text-white px-3 py-1 rounded text-xs">
                🎯 Clique ou arraste para ajustar posição
              </div>
              
              {/* Coordenadas atuais */}
              <div className="absolute bottom-2 left-2 bg-black/80 text-white px-2 py-1 rounded text-xs">
                {selectedLat.toFixed(4)}, {selectedLng.toFixed(4)}
              </div>
            </div>
            
            {/* Instruções de uso */}
            <div className="mt-4 flex flex-col items-center gap-3">
              <p className="text-gray-300 text-sm text-center">
                Clique ou arraste o mapa para ajustar a posição do marcador
              </p>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center gap-2"
          >
            <FiMapPin size={16} />
            Confirmar Localização
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LocationPickerDialog;
