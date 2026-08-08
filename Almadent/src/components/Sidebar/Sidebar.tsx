import React from 'react';
import './Sidebar.css';
import Confirm from '../CallBack/Confirm';

// SVG-иконки
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const ChartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const MapPinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
const UserCheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><polyline points="17 11 19 13 23 9" /></svg>
);
const BriefcaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
);
const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

// Интерфейсы для корректной типизации
interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType;
  badge?: string; // Необязательное поле
}

interface MenuGroup {
  title?: string;
  items: MenuItem[];
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  openAuth: () => void;
}
export function Sidebar({ activeTab, setActiveTab, openAuth }: SidebarProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);

  // Обязательно указываем тип MenuGroup[]
  const menuGroups: MenuGroup[] = [
    {
      title: 'Управление компанией',
      items: [
        { id: 'appointments', label: 'Журнал записей', icon: CalendarIcon },
        { id: 'clients', label: 'Клиенты', icon: UsersIcon },
        { id: 'stats', label: 'Статистика', icon: ChartIcon },
      ],
    },
    {
      title: 'Настройки компании',
      items: [
        { id: 'branches', label: 'Филиалы', icon: MapPinIcon, },
        { id: 'employees', label: 'Сотрудники', icon: UserCheckIcon, },
        { id: 'services', label: 'Услуги', icon: BriefcaseIcon },
      ],
    },
  ];
  const handleExit = () => {
    localStorage.setItem('auth', 'true'); // Записываем 'false', так как пользователь выходит
    openAuth(); // Вызываем смену состояния в App (setIsAuth(false))
  };

  return (
    <>
      <button className="mobile-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <CloseIcon /> : <MenuIcon />}
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo-container">
          <div className="sidebar__logo-text">
            ALMADENT<span className="sidebar__logo-dot">.</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="sidebar__group">
              {group.title && <div className="sidebar__group-title">{group.title}</div>}
              <ul className="sidebar__list">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id} className="sidebar__item">
                      <button
                        className={`sidebar__button ${isActive ? 'sidebar__button--active' : ''}`}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsOpen(false);
                        }}
                      >
                        <span className="sidebar__icon"><Icon /></span>
                        <span className="sidebar__label">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="date">
          <button className="btn btn-exit" onClick={handleExit} >Выход из аккаунта</button>
          <div className="date-text"><span style={{ fontSize: '15px', color: '#404451' }}>Дата следующей оплаты: 09.09.26</span>
          </div>
        </div>
      </aside>
    </>
  );
};