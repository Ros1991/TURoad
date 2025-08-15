import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiCalendar, FiMapPin, FiChevronLeft, FiChevronRight, FiImage } from 'react-icons/fi';
import { toast } from 'react-toastify';
import eventsService, { Event } from '../../services/events.service';
import citiesService, { City } from '../../services/cities.service';

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; event: Event | null }>({ open: false, event: null });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; event: Event | null }>({ open: false, event: null });
  const [formData, setFormData] = useState({
    cityId: 0,
    nameTextRefId: 1,
    descriptionTextRefId: 1,
    eventDate: '',
    eventTime: '',
    imageUrl: ''
  });
  const pageSize = 10;

  useEffect(() => {
    loadEvents();
    loadCities();
  }, [currentPage, search, selectedCityId]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: search || undefined,
        cityId: selectedCityId || undefined,
        sortBy: 'eventDate',
        sortOrder: 'ASC' as const
      };
      
      const response = await eventsService.getEvents(params);
      setEvents(response.items);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.total);
    } catch (error) {
      toast.error('Erro ao carregar eventos');
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const response = await citiesService.getCities({ limit: 100, sortBy: 'nameTextRefId', sortOrder: 'ASC' });
      setCities(response.items);
    } catch (error) {
      toast.error('Erro ao carregar cidades');
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDelete = async () => {
    if (deleteModal.event) {
      try {
        await eventsService.deleteEvent(deleteModal.event.eventId!);
        toast.success('Evento excluído com sucesso');
        setDeleteModal({ open: false, event: null });
        loadEvents();
      } catch (error) {
        toast.error('Erro ao excluir evento');
      }
    }
  };

  const handleCreate = async () => {
    try {
      await eventsService.createEvent({
        cityId: formData.cityId,
        nameTextRefId: formData.nameTextRefId,
        descriptionTextRefId: formData.descriptionTextRefId || undefined,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        imageUrl: formData.imageUrl || undefined
      });
      toast.success('Evento criado com sucesso');
      setCreateModal(false);
      setFormData({
        cityId: 0,
        nameTextRefId: 1,
        descriptionTextRefId: 1,
        eventDate: '',
        eventTime: '',
        imageUrl: ''
      });
      loadEvents();
    } catch (error) {
      toast.error('Erro ao criar evento');
    }
  };

  const handleUpdate = async () => {
    if (editModal.event) {
      try {
        await eventsService.updateEvent(editModal.event.eventId!, {
          cityId: formData.cityId,
          nameTextRefId: formData.nameTextRefId,
          descriptionTextRefId: formData.descriptionTextRefId || undefined,
          eventDate: formData.eventDate,
          eventTime: formData.eventTime,
          imageUrl: formData.imageUrl || undefined
        });
        toast.success('Evento atualizado com sucesso');
        setEditModal({ open: false, event: null });
        loadEvents();
      } catch (error) {
        toast.error('Erro ao atualizar evento');
      }
    }
  };

  const openEditModal = (event: Event) => {
    setFormData({
      cityId: event.cityId,
      nameTextRefId: event.nameTextRefId,
      descriptionTextRefId: event.descriptionTextRefId || 1,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      imageUrl: event.imageUrl || ''
    });
    setEditModal({ open: true, event });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Eventos</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerenciar eventos e atividades</p>
        </div>
        <button
          onClick={() => setCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus />
          Adicionar Evento
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Pesquisar eventos..."
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value ? Number(e.target.value) : '')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Todas as Cidades</option>
            {cities.map(city => (
              <option key={city.cityId} value={city.cityId}>
                {city.state} - ID: {city.cityId}
              </option>
            ))}
          </select>
          <div></div>
          <div></div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Nenhum evento encontrado
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cidade</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {events.map((event) => (
                  <tr key={event.eventId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {event.eventId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      Evento ID: {event.nameTextRefId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-gray-400" size={14} />
                        {new Date(event.eventDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center gap-1">
                        <FiMapPin className="text-gray-400" size={14} />
                        {event.city?.state || `Cidade ID: ${event.cityId}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <Link
                          to={`/events/${event.eventId}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        <button
                          onClick={() => openEditModal(event)}
                          className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ open: true, event })}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalItems)} de {totalItems} resultados
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiChevronLeft />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 py-1 rounded ${
                  page === currentPage
                    ? 'bg-indigo-600 text-white'
                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Excluir Evento</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Tem certeza que deseja excluir o evento ID {deleteModal.event?.eventId}? Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ open: false, event: null })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {createModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create Event</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <select
                  value={formData.cityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, cityId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value={0}>Select a city</option>
                  {cities.map(city => (
                    <option key={city.cityId} value={city.cityId}>
                      {city.state} - ID: {city.cityId}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name Text Ref ID *
                </label>
                <input
                  type="number"
                  value={formData.nameTextRefId}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameTextRefId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description Text Ref ID
                </label>
                <input
                  type="number"
                  value={formData.descriptionTextRefId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionTextRefId: e.target.value ? Number(e.target.value) : 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Time *
                </label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setCreateModal(false);
                  setFormData({
                    cityId: 0,
                    nameTextRefId: 1,
                    descriptionTextRefId: 1,
                    eventDate: '',
                    eventTime: '',
                    imageUrl: ''
                  });
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Edit Event</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <select
                  value={formData.cityId}
                  onChange={(e) => setFormData(prev => ({ ...prev, cityId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value={0}>Select a city</option>
                  {cities.map(city => (
                    <option key={city.cityId} value={city.cityId}>
                      {city.state} - ID: {city.cityId}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name Text Ref ID *
                </label>
                <input
                  type="number"
                  value={formData.nameTextRefId}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameTextRefId: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description Text Ref ID
                </label>
                <input
                  type="number"
                  value={formData.descriptionTextRefId || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, descriptionTextRefId: e.target.value ? Number(e.target.value) : 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Event Time *
                </label>
                <input
                  type="time"
                  value={formData.eventTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setEditModal({ open: false, event: null })}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
