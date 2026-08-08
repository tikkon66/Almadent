import React, { useEffect, useState } from 'react';
import './BranchesPage.css';
import Confirm from '../CallBack/Confirm';
import { createBranch, deleteBranch, getBranches, updateBranch } from '../../service/branch';

interface BranchItem {
  id: number;
  address: string;
}
interface BranchId {
  id: number;
  is: boolean;
  address: string;
  index: number;
}

export const BranchesPage: React.FC = () => {
  // Локальный список филиалов (как на скриншоте)
  const [branches, setBranches] = useState<BranchItem[]>([]);

  const [branch, setBranch] = useState<BranchId>({
    id: 0, is: false, address: '',
    index: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');

  // изменение ф
  const handlePatchBranch = async () => {
    try {
      await updateBranch(branch.id, { address: newBranchName })
      let newbranches = branches
      newbranches[branch.index].address = newBranchName
      setBranches(newbranches)
      setBranch({
        id: 0, is: false, address: '',
        index: 0
      })
    }
    catch (err) {
      throw err
    }
  };

  // получение ф
  const handleGetBranch = async () => {
    try {
      const data = await getBranches()
      setBranches(data);
    }
    catch (err) {
      throw err
    }
  };
  useEffect(() => {
    handleGetBranch();
  }, []);

  // Удаление филиала
  const handleDeleteBranch = async (id: number) => {
    try {
      await deleteBranch(id)
      setBranches(branches.filter((b) => b.id !== id));
    }
    catch (err) {
      throw err
    }
  };

  // Добавление филиала
  const handleAddBranch = async () => {
    try {
      if (!newBranchName.trim()) throw new Error("Название филиала не должно быть пустым!");

      await createBranch({ address: newBranchName.trim() })
      setBranches([
        ...branches,
        { id: Date.now(), address: newBranchName.trim() },
      ]);
      setNewBranchName('');
      setIsModalOpen(false);
    }
    catch (err) {
      throw err
    }
  };

  return (
    <div className="branches-page">
      {/* Шапка с заглавием */}
      <div className="branches-header">
        <h1 className="branches-header__title">Филиалы</h1>
      </div>
{/* Stepper */}
      <div className="stepper">
        <div className="stepper__item  active">
          <span className="stepper__num">2</span>Филиалы
        </div>
        <div className="stepper__item">
          <span className="stepper__num">3</span>Сотрудники
        </div>
        <div className="stepper__item">
          <span className="stepper__num">4</span>Услуги
        </div>
      </div>
      {/* Список филиалов */}
      <div className="branches-content">
        <h2 className="branches-subtitle">Список филиалов:</h2>

        <ul className="branches-list">
          {branches.map((branch, index) => (
            <li key={branch.id} className="branches-list__item">
              <span className="status-dot"></span>

              <span className="branch-name">{branch.address}</span>

              <div className="branch-actions">
                <button className="btn btn--edit" title="Редактировать" onClick={() => { setBranch({ id: branch.id, is: true, address: branch.address, index }) }}>Изменить</button>
                <Confirm
                  text="Удалить клиента?"
                  successText="Клиент удален!"
                  action={() => handleDeleteBranch(branch.id)}
                >
                  <button
                    className="btn btn--red"
                    title="Удалить"
                  >
                    Удалить
                  </button>
                </Confirm>
              </div>
            </li>
          ))}
        </ul>

        {branch.is && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal__header">
                <h3>{branch.address}</h3>
                <button
                  className="modal__close"
                  onClick={() =>
                    setBranch({ id: 0, is: false, address: '', index: 0 })}
                >
                  ✕
                </button>
              </div>

              <form className="modal__form">
                <div className="form-group">
                  <label>Новое название *</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Филиал на Абая"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                  />
                </div>

                <div className="modal__footer">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Отмена
                  </button>
                  <Confirm
                    text="Удалить клиента?"
                    successText="Клиент удален!"
                    action={() => handlePatchBranch()}
                  >
                    <button type="button" className="btn btn--primary">
                      Сохранить
                    </button>
                  </Confirm>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Панель навигации/управления под списком */}
        <div className="branches-controls">
          <button
            className="btn btn--add"
            onClick={() => setIsModalOpen(true)}
          >
            + Добавить новый филиал
          </button>
        </div>
      </div>

      {/* Модальное окно добавления филиала */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__header">
              <h3>Новый филиал</h3>
              <button
                className="modal__close"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBranch} className="modal__form">
              <div className="">
                <label>Название филиала*</label>
                <input
                  type="text"
                  required
                  placeholder="Например: Филиал на Абая"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                />
              </div>

              <div className="modal__footer">
                <Confirm
                  text="Удалить клиента?"
                  successText="Клиент удален!"
                  action={() => handleAddBranch()}
                >
                  <button type="button" className="btn btn--primary">
                    Сохранить
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

export default BranchesPage;