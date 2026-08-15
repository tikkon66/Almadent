import React, { useEffect, useState } from 'react';
import './ClientsPage.css';
import { createClient, deleteClient, getClientHistory, getClients, getClientsCount, updateClient } from '../../service/clients';
import Confirm from '../CallBack/Confirm';

interface ClientItem {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  note: string;
  created_at: string;
  is_blacklisted: boolean;
  alwaysPrepay?: boolean;
  discount?: number;
  appointmentsCount?: number;
  totalSum?: number;
}


interface ClientCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientItem | null;
  loadClients: () => void,
}
interface ClientCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientItem | null;
  onClientUpdated: (client: ClientItem) => void;
  clients: ClientItem[]
  onClientsDeleted: (clients: ClientItem[]) => void;
}
// Вынесенный компонент карточки клиента
const ClientCardModal: React.FC<ClientCardModalProps> = ({
  isOpen,
  onClose,
  client,
  onClientUpdated,
  clients,
  onClientsDeleted,
}: ClientCardModalProps) => {

  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'finance'>('info');

  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    note: '',
    is_blacklisted: false,
  });
  const [history, setHistory] = useState<any[]>([]);


  useEffect(() => {
    if (!client?.id) return;

    getClientHistory(client.id)
      .then(setHistory)
      .catch(console.error);
  }, [client?.id]);
  const totalSpent = history.reduce(
    (sum, item) => sum + Number(item.services?.price || 0),
    0
  );

  useEffect(() => {
    if (client) {
      setForm({
        full_name: client.full_name,
        phone: client.phone,
        email: client.email ?? '',
        note: client.note ?? '',
        is_blacklisted: client.is_blacklisted,
      });
    }
  }, [client]);


  if (!isOpen || !client) return null;
  const handleSave = async () => {
    if (!form.full_name.trim() || !form.phone.trim()) {
      throw new Error("Заполните обязательные поля: ФИО и Телефон!");
    }


    try {
      await updateClient(client.id, form);

      const updatedClient = {
        ...client,
        ...form,
      };

      onClientUpdated(updatedClient);

      setIsEditing(false);
      onClose()

    } catch (error) {
      throw error;
    }
  };

  const handleDelete = async () => {

    try {
      await deleteClient(client.id);

      const updatedClient = clients.filter((e) => e.id != client.id)

      onClientsDeleted(updatedClient);

      setIsEditing(false);
      onClose()

    } catch (error) {
      throw error;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        e.target instanceof HTMLInputElement &&
          e.target.type === 'checkbox'
          ? e.target.checked
          : value,
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="client-modal" onClick={(e) => e.stopPropagation()}>
        {/* Шапка модального окна */}
        <div className="client-modal__header">
          <div className="client-modal__title-group">
            <h3>Карточка клиента #{client.id}</h3>
            <span className="client-name">{client.full_name}</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Навигационные вкладки */}
        <div className="client-modal__tabs">
          <button
            className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            👤 Данные клиента
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📅 История визитов (#)
          </button>
          <button
            className={`tab-btn ${activeTab === 'finance' ? 'active' : ''}`}
            onClick={() => setActiveTab('finance')}
          >
            💳 Финансы (# ₽)
          </button>
        </div>

        {/* Контент вкладок */}
        <div className="client-modal__body">
          {activeTab === 'info' && (
            <div className="tab-content">
              <div className="info-grid">
                <div className="info-field">
                  <label>ФИО Клиента:</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleChange} />
                  ) : (
                    <span>{client.full_name}</span>
                  )}
                </div>

                <div className="info-field">
                  <label>Номер телефона:</label>
                  {isEditing ? (
                    <input type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange} />
                  ) : (
                    <span className="phone-link">{client.phone}</span>
                  )}
                </div>

                <div className="info-field">
                  <label>Email:</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange} />
                  ) : (
                    <span>{client.email || '—'}</span>
                  )}
                </div>

                <div className="info-field">

                  <label>В черном списке</label>
                  {isEditing ? (
                    <div >
                      <input
                      style={{width: '30px'}}
                        type="checkbox"
                        name="is_blacklisted"
                        checked={form.is_blacklisted}
                        onChange={handleChange}
                      />
                    </div>
                  ) : (
                    <span>{client.is_blacklisted ? ' да' : 'нет'}</span>
                  )}
                </div>

                <div className="info-field full-width">
                  <label>Комментарий / Примечания:</label>
                  {isEditing ? (
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleChange} rows={3} />
                  ) : (
                    <p className="client-comment">
                      {client.note || 'Комментарии отсутствуют'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}{activeTab === 'history' && (
            <div className="tab-content">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Услуга</th>
                    <th>Сотрудник</th>
                    <th>Статус</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>
                        {new Date(item.appointment_date).toLocaleString('ru-RU')}
                      </td>

                      <td>{item.services?.name}</td>

                      <td>{item.employees?.full_name}</td>

                      <td>
                        <span
                          className={`badge ${item.status === 'completed'
                              ? 'badge--success'
                              : 'badge--warning'
                            }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {history.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        История посещений отсутствует
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="tab-content">
              <div className="finance-summary">
                <div className="finance-card">
                  <span>Всего потрачено</span>
                  <strong>{totalSpent.toLocaleString()} ₸</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Футер с кнопками */}
        <div className="client-modal__footer">
          {activeTab === 'info' && (
            <button
              className="btn btn--secondary"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Отмена' : '✏️ Редактировать'}
            </button>
          )}

          {isEditing ? (<Confirm
            text="Сохранить изменения?"
            successText="Изменения сохранены!"
            action={() => handleSave()}
          >
            <button
              className="btn btn--primary"
            >
              Сохранить изменения
            </button>
          </Confirm>
          ) : (<Confirm
            text="Удалить клиента?"
            successText="Клиент удален!"
            action={() => handleDelete()}
          >
            <button className="btn btn--red">
              Удалить
            </button>
          </Confirm>
          )}
        </div>
      </div>
    </div>
  );
};

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [clientsCount, setClientsCount] = useState(0)
  const [hasMore, setHasMore] = useState(true);

  // Состояния карточки клиента
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // Состояния фильтров
  const [filterId, setFilterId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterPhone, setFilterPhone] = useState('');
  const [filterNote, setFilterNote] = useState('');



  async function loadClients(pageNumber: number) {
    setLoading(true);

    try {
      console.log(pageNumber, clients)
      const count = await getClientsCount()
      setClientsCount(count)
      const { clients: fetchedClients } = await getClients({
        id: filterId,
        fullName: filterName,
        email: filterEmail,
        phone: filterPhone,
        note: filterNote,
        page: pageNumber,
      });

      console.log(fetchedClients, pageNumber, clients)
      if(pageNumber == 1)  setClients(fetchedClients)
      else setClients((prev) => ([...prev, ...fetchedClients]))

      if (count < clients.length) {
        setHasMore(false);
      };
    } catch (error) {
      console.error(error);
    } finally {
      setPage((val) => val + 1);
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClients(page);
  }, []);

  const handleShowMore = async () => {
    await loadClients(page);
  };

  const handleFilter = async () => {
    setPage(0);
    setHasMore(true);
    await loadClients(1);
  };

  // Состояние модального окна добавления
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Форма добавления нового клиента
  const [newClient, setNewClient] = useState({
    fullName: '',
    phone: '',
    email: '',
    note: '',
  });
  const handleAddClient = async (): Promise<void> => {
    try {
      // Проверяем, что ХОТЯ БЫ одно из полей пустое
      if (!newClient.fullName.trim() || !newClient.phone.trim()) {
        throw new Error("Заполните обязательные поля: ФИО и Телефон!");
      }

      await createClient({
        fullName: newClient.fullName,
        phone: newClient.phone,
        email: newClient.email,
        note: newClient.note,
      });

      setIsModalOpen(false);
      setNewClient({
        fullName: '',
        phone: '',
        email: '',
        note: '',
      });

    } catch (err) {
      // Важно: перевыбрасываем ошибку, чтобы handleConfirm мог перехватить её в своем try/catch
      throw err;
    }
  };

  // Открытие карточки конкретного клиента
  const handleOpenCard = (client: ClientItem) => {
    setSelectedClient({
      id: client.id,
      full_name: client.full_name,
      phone: client.phone,
      email: client.email,
      note: client.note,
      created_at: client.created_at,
      is_blacklisted: client.is_blacklisted,
    });
    setIsCardModalOpen(true);
  };
  const handleClientUpdated = (updatedClient: ClientItem) => {
    setClients(prev =>
      prev.map(client =>
        client.id === updatedClient.id
          ? updatedClient
          : client
      )
    );
  }; const handleClientDeleted = (updatedClients: ClientItem[]) => {
    setClients(updatedClients);
  };

  return (
    <div className="clients-page">
      {/* Шапка страницы */}
      <div className="clients-page__header">
        <h1 className="clients-page__title">Клиенты</h1>
        <label>Общее количество клиентов {clientsCount}</label>
      </div>

      {/* Панель фильтров и действий */}
      <div className="clients-filters">
        <div className="clients-filters__inputs">
          <div className="clients-filters__group">
            <label>ID клиента</label>
            <input
              type="text"
              placeholder="ID клиента"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
            />
          </div>
          <div className="clients-filters__group">
            <label>ФИО</label>
            <input
              type="text"
              placeholder="ФИО"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
            />
          </div>
          <div className="clients-filters__group">
            <label>Email</label>
            <input
              type="text"
              placeholder="Email"
              value={filterEmail}
              onChange={(e) => setFilterEmail(e.target.value)}
            />
          </div>
          <div className="clients-filters__group">
            <label>Телефон</label>
            <input
              type="text"
              placeholder="Телефон"
              value={filterPhone}
              onChange={(e) => setFilterPhone(e.target.value)}
            />
          </div>
          <div className="clients-filters__group">
            <label>Заметка</label>
            <input
              type="text"
              placeholder="Заметка"
              value={filterNote}
              onChange={(e) => setFilterNote(e.target.value)}
            />
          </div>
        </div>

        <div className="clients-filters__actions">
          <button className="btn btn--filter" onClick={handleFilter}>
            Фильтровать
          </button>
          <button className="btn btn--add" onClick={() => setIsModalOpen(true)}>
            + Добавить клиента
          </button>
        </div>
      </div>

      <div className="clients-table-wrapper">
        <table className="clients-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>В черном списке</th>
              <th>Дата создания</th>
              <th>Дополнительно</th>
            </tr>
          </thead>

          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td colSpan={6}>Нет данных для отображения</td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.id}</td>
                  <td>{client.full_name}</td>
                  <td>{client.phone}</td>
                  <td>{client.is_blacklisted ? 'Да' : 'Нет'}</td>
                  <td>
                    {new Date(client.created_at)
                      .toLocaleString('ru-RU', {
                        timeZone: 'Asia/Almaty',
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      .replace(',', '')}
                  </td>
                  <td>
                    <button
                      className="btn btn--add"
                      onClick={() => handleOpenCard(client)}
                    >
                      Дополнительно
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <button onClick={handleShowMore} className="btn">
          {loading ? 'Загрузка...' : 'Показать ещё'}
        </button>
      )}

      {/* Модальное окно просмотра/редактирования карточки */}
      <ClientCardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        client={selectedClient} loadClients={() => loadClients(page)}
        onClientUpdated={handleClientUpdated}
        clients={clients}
        onClientsDeleted={handleClientDeleted}
      />

      {/* Модальное окно добавления клиента */}
      {isModalOpen && (
        <div className="clients-modal-overlay">
          <div className="clients-modal">
            <div className="clients-modal__header">
              <h2>Новый клиент</h2>
              <button
                className="clients-modal__close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form className="clients-modal__form">
              <div className="form-row">
                <div className="form-group">
                  <label>ФИО клиента*</label>
                  <input
                    type="text"
                    required
                    placeholder="Иванов Иван Иванович"
                    value={newClient.fullName}
                    onChange={(e) =>
                      setNewClient({ ...newClient, fullName: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Телефон*</label>
                  <input
                    type="text"
                    required
                    placeholder="+7 700 000 00 00"
                    value={newClient.phone}
                    onChange={(e) =>
                      setNewClient({ ...newClient, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={newClient.email}
                    onChange={(e) =>
                      setNewClient({ ...newClient, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Заметка в карточке о клиенте</label>
                <textarea
                  rows={3}
                  placeholder="Введите заметку..."
                  value={newClient.note}
                  onChange={(e) =>
                    setNewClient({ ...newClient, note: e.target.value })
                  }
                />
              </div>

              <div className="clients-modal__footer">
                <button
                  type="button"
                  className="btn btn--outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Отмена
                </button>
                <Confirm
                  text="Удалить клиента?"
                  successText="Клиент удален!"
                  action={() => handleAddClient()}
                >
                  <button type="button" className="btn btn--add">
                    Сохранить клиента
                  </button>
                </Confirm>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;