import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import eventsService, { Event, EventFilters } from '../../services/events.service';
import CitySelector from '../../components/common/CitySelector';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    isActive: undefined,
    page: 1,
    limit: 10
  });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Making API call with filters:', filters);
      const response = await eventsService.getEvents(filters);
      console.log('Raw API Response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', Object.keys(response || {}));
      
      // Handle both possible response structures
      let items, total;
      if ((response as any)?.data) {
        // Full backend response structure
        items = (response as any).data.items || [];
        total = (response as any).data.pagination?.total || 0;
        console.log('Using full response structure');
      } else {
        // Extracted data structure
        items = response?.items || [];
        total = response?.pagination?.total || 0;
        console.log('Using extracted data structure');
      }
      
      console.log('Setting events:', items);
      console.log('Setting total:', total);
      setEvents(items);
      setTotal(total);
    } catch (error) {
      toast.error('Failed to load events');
      console.error('Error loading events:', error);
      setEvents([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSearch = (value: string) => {
    setFilters((prev: EventFilters) => ({ ...prev, search: value, page: 1 }));
  };

  const handleCityFilter = (cityId: number | null) => {
    setFilters((prev: EventFilters) => ({ ...prev, cityId: cityId || undefined, page: 1 }));
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    
    try {
      await eventsService.deleteEvent(selectedEvent.eventId);
      toast.success('Event deleted successfully');
      setShowDeleteModal(false);
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const getLocalizedName = (event: Event): string => {
    if (event.nameTranslations && event.nameTranslations.length > 0) {
      const ptTranslation = event.nameTranslations.find(t => t.language === 'pt');
      return ptTranslation?.text || event.nameTranslations[0].text || 'Sem nome';
    }
    return event.name || 'Sem nome';
  };

  const getLocalizedLocation = (event: Event): string => {
    if (event.locationTranslations && event.locationTranslations.length > 0) {
      const ptTranslation = event.locationTranslations.find(t => t.language === 'pt');
      return ptTranslation?.text || event.locationTranslations[0].text || 'Sem nome';
    }
    return event.location || 'Sem nome';
  };

  const getCityName = (event: Event): string => {
    if (event.city?.name) {
      return event.city.name;
    }
    return event.cityId ? `Cidade ${event.cityId}` : 'Não informado';
  };

  const formatEventDate = (eventDate?: string, eventTime?: string): string => {
    if (!eventDate) return 'Não informado';
    
    const date = new Date(eventDate);
    const dateStr = date.toLocaleDateString('pt-BR');
    
    if (eventTime) {
      return `${dateStr} às ${eventTime}`;
    }
    
    return dateStr;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Eventos</h1>
          <p className="text-gray-400">Gerencie eventos e suas informações</p>
        </div>
        <Link
          to="/events/new"
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <FiPlus size={20} />
          Adicionar Evento
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-4 mb-6" style={{ position: 'relative', zIndex: 10000 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ position: 'relative', zIndex: 10000 }}>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Pesquisar eventos..."
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <CitySelector
              value={filters.cityId || null}
              onChange={(cityId) => handleCityFilter(cityId)}
              placeholder="Filtrar por cidade..."
              className="w-full"
              isFilter={true}
            />
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl overflow-hidden" style={{ position: 'relative', zIndex: 0 }}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center">
            <FiCalendar size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-center py-8">Nenhum evento encontrado</p>
            <p className="text-gray-500 text-sm mt-2">Tente ajustar a busca ou adicionar um novo evento</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data/Hora</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Localização</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {events.map((event) => (
                  <tr key={event.eventId}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-white">
                        {getLocalizedName(event)}
                      </span>
                    </td>
                    
                    {/* Cidade */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-300">
                        {getCityName(event)}
                      </span>
                    </td>
                    
                    {/* Data/Hora */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatEventDate(event.eventDate, event.eventTime)}
                      </div>
                    </td>

                    {/* Localização */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {getLocalizedLocation(event)}
                      </div>
                    </td>
                    
                    {/* Ações */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          to={`/events/${event.eventId}`}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                          title="Ver detalhes"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir evento"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && events.length > 0 && (
          <div className="px-6 py-4 bg-gray-900/30 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((filters.page! - 1) * filters.limit!) + 1} to {Math.min(filters.page! * filters.limit!, total)} of {total} events
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((prev: EventFilters) => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                disabled={filters.page === 1}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters((prev: EventFilters) => ({ ...prev, page: prev.page! + 1 }))}
                disabled={filters.page! * filters.limit! >= total}
                className="px-3 py-1 bg-gray-700/50 border border-gray-600 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600/50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete "{getLocalizedName(selectedEvent)}"? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedEvent(null);
                }}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
