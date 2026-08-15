import { useState } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import { AppointmentsPage } from '../AppointmentsPage/AppointmentsPage';
// import { AppointmentModal } from '../AppointmentsPage/AppointmentModal/AppointmentModal';
import './Dashboard.css';
import ClientsPage from '../ClientsPage/ClientsPage';
import StatisticsPage from '../StatisticsPage/StatisticsPage';
import BranchesPage from '../BranchesPage/BranchesPage';
import EmployeesPage from '../EmployeesPage/EmployeesPage';
import ServicesPage from '../ServicesPage/ServicesPage';


interface AuthModalProps {
    openAuth: () => void;
}
export function Dashboard({ openAuth }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<string>('appointments');
  const refreshTrigger = 0;


  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return (
          <AppointmentsPage
            refreshTrigger={refreshTrigger}
          />
        );

      case 'stats':
        return <StatisticsPage />;

      case 'clients':
        return <ClientsPage />;

      case 'branches':
        return <BranchesPage />;

      case 'employees':
        return <EmployeesPage />;

      case 'services':
        return <ServicesPage />;

      default:
        return (
          <AppointmentsPage
            refreshTrigger={refreshTrigger}
          />
        );
    }
  };

  return (
    <div className="dashboard">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAuth={openAuth}
      />

      <main className="dashboard-main">
        {renderContent()}
      </main>

    </div>
  );
};

export default Dashboard;