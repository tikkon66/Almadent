import React, { useEffect, useState } from 'react';
import './ServicesPage.css';
import Confirm from '../CallBack/Confirm';
import {
  getServices,
  getBranches,
  createService,
  updateService,
  deleteService,
} from '../../service/services';

interface BranchItem {
  id: number;
  address: string;
}

interface ServiceItem {
  id: number;
  branch_id: number;
  name: string;
  price: number;
  duration_minutes: number;
  description: string;
  branches: {
    id: number;
    address: string;
  };
}

export const ServicesPage: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [service, setService] = useState<ServiceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    branch_id: 0,
    name: '',
    price: '',
    duration_minutes: '',
    description: '',
  });

  const loadData = async () => {
    try {
      const [servicesData, branchesData] = await Promise.all([
        getServices(),
        getBranches(),
      ]);
      setServices(servicesData);
      setBranches(branchesData);
    } catch (err) {
      console.error('Ошибка загрузки данных:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const groupedServices = services.reduce(
    (acc: Record<string, ServiceItem[]>, item) => {
      const key = item.branches?.address || '';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {}
  );

  const resetForm = () => {
    setForm({
      branch_id: branches[0]?.id || 0,
      name: '',
      price: '',
      duration_minutes: '',
      description: '',
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setService(null);
    setIsModalOpen(true);
  };
  const handleAdd = async () => {
    try {
      await createService({
        branch_id: form.branch_id,
        name: form.name,
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes),
        description: form.description,
      });

      await loadData();
      resetForm(); // Закрываем только при успехе
    } catch (error) {
      console.error('Ошибка при создании:', error);
      // Окно останется открытым, чтобы пользователь мог исправить данные
    } finally {
      
      setService(null);
      setIsModalOpen(false);
    }
  };

  const handleUpdate = async () => {
    if (!service) return;

    try {
      await updateService(service.id, {
        branch_id: form.branch_id,
        name: form.name,
        price: Number(form.price),
        duration_minutes: Number(form.duration_minutes),
        description: form.description,
      });

      await loadData();
      setService(null);
      resetForm();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Ошибка при обновлении:', error);
    }
  };


  const handleDelete = async (id: number) => {
    await deleteService(id);
    setServices((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="services-container">
      <div className="services-header">
        <h2>Услуги</h2>
        <button className="btn btn--add" onClick={handleOpenAddModal}>
          + Добавить услугу
        </button>
      </div>

      <div className="branches-list">
        {Object.entries(groupedServices).map(([branchName, items]) => (
          <div key={branchName} className="branch-group">

            <div className="services-grid">
              {items.map((item) => (
                <div key={item.id} className="service-card">
                  <div className="service-info">
                    <b className="service-name">{item.name}</b>
                    {item.description && (
                      <p className="service-desc">{item.description}</p>
                    )}
                    <div className="service-details">
                      <span className="service-price">{item.price} ₸</span>
                      <span className="service-duration">
                        {item.duration_minutes} мин
                      </span>
                    </div>
                  </div>

                  <div className="service-actions">
                    <button
                      className="btn btn--edit"
                      onClick={() => {
                        setService(item);
                        setForm({
                          branch_id: item.branch_id,
                          name: item.name,
                          price: String(item.price),
                          duration_minutes: String(item.duration_minutes),
                          description: item.description ?? '',
                        });
                      }}
                    >
                      Изменить
                    </button>

                    <Confirm
                      text="Удалить услугу?"
                      successText="Услуга удалена"
                      action={() => handleDelete(item.id)}
                    >
                      <button className="btn btn--red" type="button">
                        Удалить
                      </button>
                    </Confirm>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {(isModalOpen || service) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{service ? 'Редактирование услуги' : 'Новая услуга'}</h3>

            <div className="form-group">
              <label>Филиал</label>
              <select
                className="form-input"
                value={form.branch_id}
                onChange={(e) =>
                  setForm({ ...form, branch_id: Number(e.target.value) })
                }
              >
                <option value={0} disabled>
                  Выберите филиал
                </option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.address}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Название услуги</label>
              <input
                className="form-input"
                placeholder="Введите название"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Цена (₸)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Длительность (мин)</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="30"
                  value={form.duration_minutes}
                  onChange={(e) =>
                    setForm({ ...form, duration_minutes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label>Описание</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Подробное описание услуги..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="modal-actions">
              <button
                className="btn btn--secondary"
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setService(null);
                }}
              >
                Отмена
              </button>

              <button
                className="btn btn--primary"
                type="button"
                onClick={service ? handleUpdate : handleAdd}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;