import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardSST from './pages/DashboardSST';
import OperationalDashboard from './pages/OperationalDashboard';
import Accidents from './pages/Accidents';
import EPIInventory from './pages/EPIInventory';
import Inspections from './pages/Inspections';
import RH from './pages/RH';
import Trainings from './pages/Trainings';
import Documents from './pages/Documents';
import ActionPlans from './pages/ActionPlans';
import Settings from './pages/Settings';
import Fleet from './pages/Fleet';
import { ModuleType, User, UserRole } from './types';

// Default User (Tech Safety)
const DEFAULT_USER: User = {
  id: 'u1',
  name: 'Ricardo Mendes',
  role: UserRole.TECNICO_SEGURANCA
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);

  // Helper to switch user for demo purposes
  const handleSwitchUser = (role: UserRole) => {
    let name = 'Usuário';
    switch(role) {
        case UserRole.SUPER_ADMIN: name = 'Admin Master'; break;
        case UserRole.GESTOR_GERAL: name = 'Roberto Director'; break;
        case UserRole.TECNICO_SEGURANCA: name = 'Ricardo Mendes'; break;
        case UserRole.ASSISTENTE_OP: name = 'Lucas Assistente'; break;
        case UserRole.RH: name = 'Mariana RH'; break;
        default: name = 'Usuário Visitante';
    }
    
    setCurrentUser({
        id: `u-${role}`,
        name,
        role
    });

    if (role === UserRole.ASSISTENTE_OP) {
        setActiveModule(ModuleType.OPERATIONAL_DASHBOARD);
    } else if (role === UserRole.SUPER_ADMIN) {
        setActiveModule(ModuleType.DASHBOARD);
    } else {
        setActiveModule(ModuleType.DASHBOARD);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case ModuleType.DASHBOARD:
        return <DashboardSST />;
      case ModuleType.OPERATIONAL_DASHBOARD:
        return <OperationalDashboard />;
      case ModuleType.ACTION_PLANS:
        return <ActionPlans />;
      case ModuleType.SST_ACCIDENTS:
        return <Accidents />;
      case ModuleType.SST_EPI:
        return <EPIInventory />;
      case ModuleType.SST_INSPECTIONS:
        return <Inspections />;
      case ModuleType.TRAININGS:
        return <Trainings />;
      case ModuleType.RH:
        return <RH />;
      case ModuleType.FLEET:
        return <Fleet />;
      case ModuleType.DOCUMENTS:
        return <Documents />;
      case ModuleType.SETTINGS:
        return <Settings />;
      default:
        return <DashboardSST />;
    }
  };

  return (
    <Layout 
      activeModule={activeModule} 
      onNavigate={setActiveModule}
      currentUser={currentUser}
      onSwitchUser={handleSwitchUser}
    >
      {renderModule()}
    </Layout>
  );
};

export default App;