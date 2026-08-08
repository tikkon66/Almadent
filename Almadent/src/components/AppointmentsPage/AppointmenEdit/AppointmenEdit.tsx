import React, { useEffect, useState } from 'react';
import {
    getBranches,
    getEmployeesByBranch,
    getServicesByBranch,
    updateAppointment,
    deleteAppointment,
} from '../../../service/appointments';

import type {
    Appointment,
    Branch,
    Employee,
    Service,
} from '../../../service/appointments';

import './AppointmenEdit.css';
import Confirm from '../../CallBack/Confirm';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editData: Appointment | null;
}

const AppointmentEdit: React.FC<Props> = ({
    isOpen,
    onClose,
    onSuccess,
    editData,
}) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    const [form, setForm] = useState({
        branch_id: 0,
        employee_id: 0,
        service_id: 0,
        appointment_date: '',
        status: '',
        comment: '',
    });

    useEffect(() => {
        if (!editData) return;

        setForm({
            branch_id: editData.branch_id,
            employee_id: editData.employee_id,
            service_id: editData.service_id,
            appointment_date: editData.appointment_date.slice(0, 16),
            status: editData.status,
            comment: editData.comment || '',
        });
    }, [editData]);
    
    useEffect(() => {
        getBranches().then(setBranches);
    }, []);

    useEffect(() => {
        if (!form.branch_id) return;

        getEmployeesByBranch(form.branch_id).then(setEmployees);
        getServicesByBranch(form.branch_id).then(setServices);
    }, [form.branch_id]);

    if (!isOpen || !editData) return null;

    const save = async () => {
        await updateAppointment(editData.id, {
            branch_id: form.branch_id,
            employee_id: form.employee_id,
            service_id: form.service_id,
            appointment_date: new Date(form.appointment_date).toISOString(),
            status: form.status,
            comment: form.comment,
        });

        onSuccess();
        onClose();
    };

    const remove = async () => {
        await deleteAppointment(editData.id);

        onSuccess();
        onClose();
    };

    return (
        <div className="appointment-overlay">
            <div className="appointment-modal">

                <div className="appointment-header">
                    <h2>Запись #{editData.id}</h2>

                    <div className='exir' onClick={onClose}>✕</div>
                </div>

                <div className="appointment-body">

                    <div className="readonly-grid">

                        <div>
                            <label>Клиент:</label> <br />
                            <i>{editData.clients?.full_name}</i>
                        </div>

                        <div>
                            <label>Телефон:</label><br /><i>{editData.clients?.phone}</i>
                        </div>

                        <div>
                            <label>Email:</label><br /><i>{editData.clients?.email || ";"}</i>
                        </div>

                    </div>

                    <div className="form-grid">

                        <div>
                            <label>Филиал</label>

                            <select
                                disabled={!isEditing}
                                value={form.branch_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        branch_id: Number(e.target.value),
                                    })
                                }
                            >
                                {branches.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.address}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Сотрудник</label>

                            <select
                                disabled={!isEditing}
                                value={form.employee_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        employee_id: Number(e.target.value),
                                    })
                                }
                            >
                                {employees.map((e) => (
                                    <option key={e.id} value={e.id}>
                                        {e.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label>Услуга</label>

                            <select
                                disabled={!isEditing}
                                value={form.service_id}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        service_id: Number(e.target.value),
                                    })
                                }
                            >
                                {services.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                    </div>

                    <div className="form-grid">

                        <div>
                            <label>Дата</label>

                            <input
                                type="datetime-local"
                                disabled={!isEditing}
                                value={form.appointment_date}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        appointment_date: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label>Статус</label>

                            <select
                                disabled={!isEditing}
                                value={form.status}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option value="booked">Записан</option>
                                <option value="completed">Завершен</option>
                                <option value="cancelled">Отменен</option>
                            </select>
                        </div>

                    </div>

                    <div>
                        <label>Комментарий</label>

                        <textarea
                            disabled={!isEditing}
                            value={form.comment}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    comment: e.target.value,
                                })
                            }
                        />
                    </div>

                </div>

                <div className="appointment-footer">

                    <button
                        className="btn-secondary"
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? 'Отмена' : 'Редактировать'}
                    </button>

                    {isEditing ? (
                        <Confirm
                            text="Сохранить изменения?"
                            successText="Сохранено"
                            action={save}
                        >
                            <button className="btn-primary">
                                Сохранить
                            </button>
                        </Confirm>
                    ) : (
                        <Confirm
                            text="Удалить запись?"
                            successText="Запись удалена"
                            action={remove}
                        >
                            <button className="btn-danger">
                                Удалить
                            </button>
                        </Confirm>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AppointmentEdit;