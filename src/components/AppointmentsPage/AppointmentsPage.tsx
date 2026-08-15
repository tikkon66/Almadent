import React, { useEffect, useState, useMemo } from 'react';
import {
  getAppointments,
  getBranches,
  getEmployeesByBranch,
  getServicesByBranch,
  getServicesByEmployee,
  createAppointment,
  getOrCreateClient,
} from '../../service/appointments'; import type {
  Appointment,
  Branch,
  Employee,
  Service
} from '../../service/appointments';
import './AppointmentsPage.css';
import Confirm from '../CallBack/Confirm';
import AppointmentEdit from './AppointmenEdit/AppointmenEdit';

// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ==========================================
const formatYMD = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Функция округляет время до начала шага (09:15 -> 09:00, 09:45 -> 09:30)
const getMatchedSlot = (dateString: string) => {
  const appDate = new Date(dateString);
  const h = String(appDate.getHours()).padStart(2, '0');
  const m = appDate.getMinutes() >= 30 ? '30' : '00';
  return `${h}:${m}`;
};

// ==========================================
// КОМПОНЕНТ МОДАЛЬНОГО ОКНА
// ==========================================
interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultBranchId?: number | null;
  defaultDate?: string;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, onSuccess, defaultDate }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    branchId: 0,
    employeeId: 0,
    serviceId: 0,
    date: defaultDate || new Date().toISOString().slice(0, 16),
    status: 'booked',
    duration: 60,
    comment: '',
    clientNote: '',
  });

  useEffect(() => {
    if (isOpen) {
      getBranches().then((brs) => {
        setBranches(brs);
        const initialBranch = selectedBranch || (brs[0] ? brs[0].id : 0);
        setFormData((prev) => ({
          ...prev,
          branchId: initialBranch,
          date: defaultDate || prev.date,
        }));
      });
    }
  }, [isOpen, selectedBranch, defaultDate]);

  useEffect(() => {
    if (formData.branchId) {
      getEmployeesByBranch(formData.branchId).then(setEmployees);
      getServicesByBranch(formData.branchId).then(setServices);
    }
  }, [formData.branchId]);

  useEffect(() => {
    if (formData.employeeId) {
      getServicesByEmployee(formData.employeeId).then((empServices) => {
        if (empServices.length > 0) setServices(empServices);
      });
    }
  }, [formData.employeeId]);


  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (formData.fullName == "" && formData.phone == '') throw new Error("Не записали данные клиента!")
      if (selectedBranch == null) { throw new Error("Выберите филиал, сотрудника!") }
      // 1. Создаем или получаем существующего клиента
      const client = await getOrCreateClient({
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        note: formData.clientNote,
      });

      // 2. Создаем саму запись
      await createAppointment({
        client_id: client.id,
        branch_id: Number(formData.branchId),
        employee_id: Number(formData.employeeId),
        service_id: Number(formData.serviceId),
        appointment_date: new Date(formData.date).toISOString(),
        comment: formData.comment,
        status: formData.status,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      throw (err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (isOpen && (
    <div className="modal-overlay">
      <div className="modal-window">
        <div className="modal-header">
          <h2>Новая запись</h2>
          <button type="button" onClick={onClose} className="exit">✕</button>
        </div>

        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-grid">
            <div className="form-group">
              <label>ФИО клиента*</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Телефон*</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Филиал*</label>
              <select
                value={selectedBranch ?? ''}
                onChange={(e) => setSelectedBranch(Number(e.target.value))}
              >
                <option value="">Выберите филиал</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.address}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Сотрудник*</label>
              <select
                required
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: Number(e.target.value) })}
              >
                <option value="">Выберите сотрудник</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.full_name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Услуга*</label>
              <select
                required
                value={formData.serviceId}
                onChange={(e) => setFormData({ ...formData, serviceId: Number(e.target.value) })}
              >
                <option value="">Выберите услугу</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.price} ₸)</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">

              <label>Дата и время</label>
              <input
                type="datetime-local"
                required
                value={formData.date}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ ...formData, date: value });
                }}
              />

            </div>
            <div className="form-group">
              <label>Длительность (мин)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Статус</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="booked">🟡 Записан</option>
                <option value="in_progress">🔵 В процессе</option>
                <option value="completed">🟢 Завершен</option>
                <option value="cancelled">🔴 Отменен</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Комментарий</label>
            <textarea
              rows={3}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn" onClick={onClose} disabled={isSubmitting}>
              Отмена
            </button>
            <Confirm
              text="Создать запись?"
              successText="Запись создана!"
              action={() => handleSubmit()}
            >
              <button type="button" disabled={isSubmitting} className="btn btn--add">
                {isSubmitting ? 'Сохранение...' : 'Создать запись'}
              </button>
            </Confirm>
          </div>
        </form>
      </div>
    </div>
  ));
};

// ==========================================
// ГЛАВНАЯ СТРАНИЦА ЖУРНАЛА
// ==========================================
export interface AppointmentsPageProps {
  refreshTrigger?: number;
}

export const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ refreshTrigger }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEdit, setIsEdit] = useState(false)
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const loadData = async () => {
    const brs = await getBranches();
    setBranches(brs);
    if (brs.length > 0 && !selectedBranch) {
      setSelectedBranch(brs[0].id);
    }
  };

  const loadAppointments = async (branchId: number) => {
    const apps = await getAppointments(branchId);
    setAppointments(apps);
    const emps = await getEmployeesByBranch(branchId);
    setEmployees(emps);
  };

  useEffect(() => { loadData(); }, [refreshTrigger]);

  useEffect(() => {
    if (selectedBranch) loadAppointments(selectedBranch);
  }, [selectedBranch, refreshTrigger]);

  const handlePrev = () => setCurrentDate((prev) => addDays(prev, viewMode === 'day' ? -1 : -7));
  const handleNext = () => setCurrentDate((prev) => addDays(prev, viewMode === 'day' ? 1 : 7));
  const handleToday = () => setCurrentDate(new Date());


  const handleCard = (appointment: Appointment) => {

    setSelectedAppointment({
      id: appointment.id,

      client_id: appointment.client_id,

      clients: {
        id: appointment.client_id,
        full_name: appointment.clients?.full_name || "",
        phone: appointment.clients?.phone || "",
        email: appointment.clients?.email,
        note: appointment.clients?.email
      },

      branch_id: Number(appointment.branch_id),
      employee_id: appointment.employee_id,
      service_id: appointment.service_id,

      appointment_date: appointment.appointment_date,
      status: appointment.status,
      comment: appointment.comment || '',
    });
    console.log(appointment.appointment_date)

    setIsEdit(true);
  };

  const weekDays = useMemo(() => {
    if (viewMode === 'day') return [currentDate];
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [currentDate, viewMode]);

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00',
    '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '19:00', '20:00', '21:00', '22:00',
  ];

  const currentBranchName = branches.find((b) => b.id === selectedBranch)?.address || 'Филиал';

  // Карточка для рендера
  const renderAppointmentCard = (appointment: Appointment) => {
    const appDate = new Date(appointment.appointment_date);
    const exactTime = appDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });



    return (
      <div key={appointment.id} className="appointment-card" style={{ marginBottom: '8px' }} onClick={() => handleCard(appointment)}>
        <div className="app-time-header">
          Время записи: {exactTime} {appointment.services?.duration_minutes ? `(${appointment.services.duration_minutes} мин)` : ''}
        </div>
        <div className="app-body">
          <div className="app-client-row">
            <span className="app-status-dot"></span>
            <strong className="app-client-name">{appointment.clients?.full_name || 'Клиент'}</strong>
          </div>
          {viewMode === 'week' && (
            <div className="app-detail">Сотрудник: <b>{appointment.employees?.full_name}</b></div>
          )}
          <div className="app-detail">Услуга: {appointment.services?.name || '—'}</div>
          <div className="app-detail">Статус: {appointment.status || 'Записан'}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <header className="journal-header">
        <div className="journal-header__left">
          <h1 className="journal-title">Журнал записей</h1>
          <select
            value={selectedBranch ?? ''}
            onChange={(e) => setSelectedBranch(Number(e.target.value))}
          >
            <option value="">Выберите филиал</option>

            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.address}
              </option>
            ))}
          </select>
        </div>

        <div className="journal-header__controls">
          <div className="nav-buttons">
            <button className="btn-nav" onClick={handlePrev}>&lt;</button>
            <button className="btn-today" onClick={handleToday}>Сегодня</button>
            <button className="btn-nav" onClick={handleNext}>&gt;</button>
            <input type="date" className="date-picker-input" value={formatYMD(currentDate)} onChange={(e) => e.target.value && setCurrentDate(new Date(e.target.value))} />
          </div>
          <button className="btn btn--add" onClick={() => setIsModalOpen(true)}>+ Добавить запись</button>
          <div className="view-switch">
            <button className={`view-btn ${viewMode === 'day' ? 'active' : ''}`} onClick={() => setViewMode('day')}>День</button>
            <button className={`view-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Неделя</button>
          </div>
        </div>
      </header>

      <div className="journal-grid-wrapper">
        <div className="journal-grid">
          {/* ЗАГОЛОВКИ */}
          <div className="grid-header">
            <div className="time-col-header">Время</div>

            {viewMode === 'day' && employees.map((emp) => (
              <div key={emp.id} className="employee-card-header">
                <div className="emp-info">
                  <div className="emp-name">{emp.full_name}</div>
                  <div className="emp-sub">{currentBranchName}</div>
                </div>
              </div>
            ))}

            {viewMode === 'week' && weekDays.map((day) => (
              <div key={day.toISOString()} className="employee-card-header">
                <div className="emp-info" style={{ textAlign: 'center' }}>
                  <div className="emp-name">{day.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ТЕЛО СЕТКИ */}
          <div className="grid-body">
            {timeSlots.map((time) => (
              <div key={time} className="time-row">
                <div className="time-label">{time}</div>

                {/* РЕНДЕР: ДЕНЬ */}
                {viewMode === 'day' && employees.map((emp) => {
                  const empAppointments = appointments.filter((a) => {
                    const isSameDay = formatYMD(new Date(a.appointment_date)) === formatYMD(currentDate);
                    const slotMatches = getMatchedSlot(a.appointment_date) === time;
                    return a.employee_id === emp.id && isSameDay && slotMatches;
                  });

                  return (
                    <div key={emp.id} className="time-cell" >
                      {empAppointments.map(renderAppointmentCard)}
                    </div>
                  );
                })}

                {/* РЕНДЕР: НЕДЕЛЯ */}
                {viewMode === 'week' && weekDays.map((day) => {
                  const dayAppointments = appointments.filter((a) => {
                    const isSameDay = formatYMD(new Date(a.appointment_date)) === formatYMD(day);
                    const slotMatches = getMatchedSlot(a.appointment_date) === time;
                    return isSameDay && slotMatches;
                  });

                  return (
                    <div key={day.toISOString()} className="time-cell"
                    >
                      {dayAppointments.map(renderAppointmentCard)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => selectedBranch && loadAppointments(selectedBranch)}
        defaultBranchId={selectedBranch}
        defaultDate={`${formatYMD(currentDate)}T09:00`}
      />

      {selectedAppointment && (
        <AppointmentEdit
          isOpen={isEdit}
          onClose={() => {
            setIsEdit(false);
            setSelectedAppointment(null);
          }}
          onSuccess={() => selectedBranch && loadAppointments(selectedBranch)}
          editData={selectedAppointment}
        />
      )}
    </div>
  );
};

export default AppointmentsPage;