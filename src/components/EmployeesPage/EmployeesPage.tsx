import React, { useEffect, useState } from 'react';
import './EmployeesPage.css';
import Confirm from '../CallBack/Confirm';
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../service/employees';
import { getBranches } from '../../service/branch';

interface Employee {
  id: number;
  full_name: string;
  position: string;
  branch_id: number;
  work_time: string;
  branches: {
    id: number;
    address: string;
  };
}

interface Branch {
  id: number;
  address: string;
}

export const EmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [editingEmployee, setEditingEmployee] =
    useState<Employee | null>(null);

  const [form, setForm] = useState({
    full_name: '',
    position: '',
    branch_id: 0,
    work_time: '09:00-18:00',
  });

  const loadEmployees = async () => {
    const data = await getEmployees();
    setEmployees(data);
  };

  const loadBranches = async () => {
    const data = await getBranches();
    setBranches(data);
  };

  useEffect(() => {
    loadEmployees();
    loadBranches();
  }, []);

  const handleCreate = async () => {
    await createEmployee(form);

    setForm({
      full_name: '',
      position: '',
      branch_id: 0,
      work_time: '09:00-18:00',
    });

    setIsModalOpen(false);

    await loadEmployees();
  };

  const handleUpdate = async () => {
    if (!editingEmployee) return;

    await updateEmployee(editingEmployee.id, form);

    setEditingEmployee(null);

    await loadEmployees();
  };

  const handleDelete = async (id: number) => {
    await deleteEmployee(id);

    setEmployees(
      employees.filter((employee) => employee.id !== id)
    );
  };

  const groupedEmployees = employees.reduce(
    (acc: Record<string, Employee[]>, employee) => {
      const branch = employee.branches?.address || 'Без филиала';

      if (!acc[branch]) {
        acc[branch] = [];
      }

      acc[branch].push(employee);

      return acc;
    },
    {}
  );

  return (
    <div className="employees-page">
      <div className='between'>

        <h1 style={{ marginBottom: "15px" }}>Сотрудники</h1>

        <button className="btn btn--add"
          onClick={() => setIsModalOpen(true)}>
          + Добавить сотрудника
        </button>
      </div>
      {Object.entries(groupedEmployees).map(
        ([branchName, employees]) => (
          <div key={branchName} className="branch-group">
            <h2>{branchName}</h2>

            {employees.map((employee) => (
              <div
                key={employee.id}
                className="employee-card"
              >
                <div>
                  <strong>{employee.full_name}</strong>
                  <p>{employee.position}</p>
                  <p>{employee.work_time}</p>
                </div>

                <div className="actions">
                  <button className='btn btn--edit '
                    onClick={() => {
                      setEditingEmployee(employee);

                      setForm({
                        full_name: employee.full_name,
                        position: employee.position,
                        branch_id: employee.branch_id,
                        work_time: employee.work_time,
                      });
                    }}
                  >
                    Изменить
                  </button>

                  <Confirm
                    text="Удалить сотрудника?"
                    successText="Сотрудник удален"
                    action={() =>
                      handleDelete(employee.id)
                    }
                  >
                    <button className='btn btn--red'>
                      Удалить
                    </button>
                  </Confirm>
                </div>
              </div>
            ))}
          </div>
        )
      )}


      {(isModalOpen || editingEmployee) && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {editingEmployee
                ? 'Редактирование'
                : 'Новый сотрудник'}
            </h3>

            <input
              placeholder="ФИО"
              value={form.full_name}
              onChange={(e) =>
                setForm({
                  ...form,
                  full_name: e.target.value,
                })
              }
            />

            <input
              placeholder="Должность"
              value={form.position}
              onChange={(e) =>
                setForm({
                  ...form,
                  position: e.target.value,
                })
              }
            />
            <select
              value={form.branch_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  branch_id: Number(e.target.value),
                })
              }
            >
              <option value={0}>
                Выберите филиал
              </option>

              {branches.map((branch) => (
                <option
                  key={branch.id}
                  value={branch.id}
                >
                  {branch.address}
                </option>
              ))}
            </select>


            <div>
              <p style={{ margin: '0 0 5px 15px' }}> Время работы;</p>
              <input
                placeholder="09:00-18:00"
                value={form.work_time}
                onChange={(e) =>
                  setForm({
                    ...form,
                    work_time: e.target.value,
                  })
                }
              />

            </div>

            <div className="modal-actions">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingEmployee(null);
                }}
              >
                Отмена
              </button>

              <button
                onClick={
                  editingEmployee
                    ? handleUpdate
                    : handleCreate
                }
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

export default EmployeesPage;