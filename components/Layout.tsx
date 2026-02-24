import React, { useState, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, 
  HardHat, 
  Users, 
  FileText, 
  Menu, 
  Bell, 
  Search, 
  AlertTriangle,
  ClipboardCheck,
  ShieldAlert,
  ListTodo,
  KanbanSquare,
  Truck,
  X,
  CheckCircle,
  Info,
  GraduationCap,
  Settings,
  Clock
} from 'lucide-react';
import { ModuleType, User, UserRole } from '../types';
import { useData } from '../contexts/DataContext';
import AIAssistant from './AIAssistant';

interface LayoutProps {
  children: React.ReactNode;
  activeModule: ModuleType;
  onNavigate: (module: ModuleType) => void;
  currentUser: User;
  onSwitchUser: (role: UserRole) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeModule, onNavigate, currentUser, onSwitchUser }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications, checkAccess, systemAlerts } = useData();
  const notificationRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleNavigate = (module: ModuleType) => {
    onNavigate(module);
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItemClass = (isActive: boolean) => 
    `flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 cursor-pointer ${
      isActive 
        ? 'bg-slate-800 text-white border-l-4 border-emerald-500' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;

  // Helper to check access for current user
  const canAccess = (module: ModuleType) => {
      return checkAccess(currentUser.role, module);
  };

  // Helper to check if any module in a group is accessible
  const canAccessAny = (modules: ModuleType[]) => {
      return modules.some(m => checkAccess(currentUser.role, m));
  };

  const sstModules = [
      ModuleType.ACTION_PLANS,
      ModuleType.SST_ACCIDENTS,
      ModuleType.SST_INSPECTIONS,
      ModuleType.SST_EPI,
      ModuleType.TRAININGS
  ];

  const corpModules = [
      ModuleType.FLEET,
      ModuleType.RH,
      ModuleType.DOCUMENTS
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      {/* Notifications Toast Container (Transient) */}
      <div className="absolute top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {notifications.map(note => (
            <div key={note.id} className={`flex items-center p-4 rounded-lg shadow-lg text-white transform transition-all duration-300 animate-slide-in pointer-events-auto
                ${note.type === 'success' ? 'bg-emerald-600' : note.type === 'error' ? 'bg-red-600' : 'bg-blue-600'}
            `}>
                {note.type === 'success' && <CheckCircle className="w-5 h-5 mr-3" />}
                {note.type === 'error' && <AlertTriangle className="w-5 h-5 mr-3" />}
                {note.type === 'info' && <Info className="w-5 h-5 mr-3" />}
                <span className="text-sm font-medium">{note.message}</span>
            </div>
        ))}
      </div>

      {/* AI Assistant - Global Integration */}
      <AIAssistant />

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:w-20 md:translate-x-0'} fixed md:relative h-full bg-slate-900 flex-shrink-0 transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-center bg-slate-950 border-b border-slate-800">
          {isSidebarOpen ? (
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-8 h-8 text-emerald-500" />
              <span className="text-xl font-bold text-white tracking-tight">SafeGuard</span>
            </div>
          ) : (
            <ShieldAlert className="w-8 h-8 text-emerald-500" />
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {/* Strategic Dashboard for Managers */}
          {canAccess(ModuleType.DASHBOARD) && (
            <div 
                onClick={() => handleNavigate(ModuleType.DASHBOARD)}
                className={navItemClass(activeModule === ModuleType.DASHBOARD)}
            >
                <LayoutDashboard className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Dashboard Geral</span>}
            </div>
          )}

          {/* Operational Dashboard for Assistants */}
          {canAccess(ModuleType.OPERATIONAL_DASHBOARD) && (
            <div 
                onClick={() => handleNavigate(ModuleType.OPERATIONAL_DASHBOARD)}
                className={navItemClass(activeModule === ModuleType.OPERATIONAL_DASHBOARD)}
            >
                <ListTodo className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Painel Operacional</span>}
            </div>
          )}

          {/* SST Group */}
          {canAccessAny(sstModules) && (
            <>
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isSidebarOpen && "Segurança do Trabalho"}
                </div>

                {canAccess(ModuleType.ACTION_PLANS) && (
                    <div 
                        onClick={() => handleNavigate(ModuleType.ACTION_PLANS)}
                        className={navItemClass(activeModule === ModuleType.ACTION_PLANS)}
                    >
                        <KanbanSquare className="w-5 h-5 mr-3" />
                        {isSidebarOpen && <span>Planos de Ação</span>}
                    </div>
                )}

                {canAccess(ModuleType.SST_ACCIDENTS) && (
                    <div 
                        onClick={() => handleNavigate(ModuleType.SST_ACCIDENTS)}
                        className={navItemClass(activeModule === ModuleType.SST_ACCIDENTS)}
                    >
                        <AlertTriangle className="w-5 h-5 mr-3" />
                        {isSidebarOpen && <span>Acidentes & Incidentes</span>}
                    </div>
                )}

                {canAccess(ModuleType.SST_INSPECTIONS) && (
                    <div 
                        onClick={() => handleNavigate(ModuleType.SST_INSPECTIONS)}
                        className={navItemClass(activeModule === ModuleType.SST_INSPECTIONS)}
                    >
                        <ClipboardCheck className="w-5 h-5 mr-3" />
                        {isSidebarOpen && <span>Inspeções</span>}
                    </div>
                )}

                {canAccess(ModuleType.SST_EPI) && (
                    <div 
                        onClick={() => handleNavigate(ModuleType.SST_EPI)}
                        className={navItemClass(activeModule === ModuleType.SST_EPI)}
                    >
                        <HardHat className="w-5 h-5 mr-3" />
                        {isSidebarOpen && <span>Gestão de EPIs</span>}
                    </div>
                )}
                
                {canAccess(ModuleType.TRAININGS) && (
                    <div 
                        onClick={() => handleNavigate(ModuleType.TRAININGS)}
                        className={navItemClass(activeModule === ModuleType.TRAININGS)}
                    >
                        <GraduationCap className="w-5 h-5 mr-3" />
                        {isSidebarOpen && <span>Treinamentos & NRs</span>}
                    </div>
                )}
            </>
          )}

           {/* Other Modules */}
           {canAccessAny(corpModules) && (
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isSidebarOpen && "Corporativo"}
                </div>
           )}

          {canAccess(ModuleType.FLEET) && (
            <div 
                onClick={() => handleNavigate(ModuleType.FLEET)}
                className={navItemClass(activeModule === ModuleType.FLEET)}
            >
                <Truck className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Frota & Motoristas</span>}
            </div>
          )}

          {canAccess(ModuleType.RH) && (
            <div 
                onClick={() => handleNavigate(ModuleType.RH)}
                className={navItemClass(activeModule === ModuleType.RH)}
            >
                <Users className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Recursos Humanos</span>}
            </div>
          )}

          {canAccess(ModuleType.DOCUMENTS) && (
            <div 
                onClick={() => handleNavigate(ModuleType.DOCUMENTS)}
                className={navItemClass(activeModule === ModuleType.DOCUMENTS)}
            >
                <FileText className="w-5 h-5 mr-3" />
                {isSidebarOpen && <span>Documentos</span>}
            </div>
          )}

          {/* Settings - Only for Super Admin */}
          {currentUser.role === UserRole.SUPER_ADMIN && (
              <>
                <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {isSidebarOpen && "Administração"}
                </div>
                <div 
                    onClick={() => handleNavigate(ModuleType.SETTINGS)}
                    className={navItemClass(activeModule === ModuleType.SETTINGS)}
                >
                    <Settings className="w-5 h-5 mr-3" />
                    {isSidebarOpen && <span>Configurações & Acesso</span>}
                </div>
              </>
          )}

        </nav>

        {/* User Profile / Switcher for Demo */}
        <div className="p-4 border-t border-slate-800 bg-slate-900">
            <div className={`flex items-center ${!isSidebarOpen && 'justify-center'}`}>
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                    {currentUser.name.charAt(0)}
                </div>
                {isSidebarOpen && (
                    <div className="ml-3 truncate">
                        <p className="text-sm font-medium text-white">{currentUser.name}</p>
                        <p className="text-xs text-slate-400 truncate">{currentUser.role.replace('_', ' ')}</p>
                    </div>
                )}
            </div>
            {isSidebarOpen && (
                <div className="mt-3">
                     <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Simular Perfil:</p>
                     <div className="grid grid-cols-2 gap-1">
                        <button onClick={() => { onSwitchUser(UserRole.SUPER_ADMIN); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className="text-[10px] bg-slate-800 text-slate-300 p-1 rounded hover:bg-slate-700">Admin</button>
                        <button onClick={() => { onSwitchUser(UserRole.TECNICO_SEGURANCA); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className="text-[10px] bg-slate-800 text-slate-300 p-1 rounded hover:bg-slate-700">Técnico</button>
                        <button onClick={() => { onSwitchUser(UserRole.ASSISTENTE_OP); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className="text-[10px] bg-slate-800 text-slate-300 p-1 rounded hover:bg-slate-700">Assistente</button>
                        <button onClick={() => { onSwitchUser(UserRole.RH); if(window.innerWidth < 768) setIsSidebarOpen(false); }} className="text-[10px] bg-slate-800 text-slate-300 p-1 rounded hover:bg-slate-700">RH</button>
                     </div>
                </div>
            )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 z-10 relative">
          <div className="flex items-center">
            <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="ml-4 text-xl font-semibold text-gray-800 capitalize">
                {activeModule.replace('SST_', '').replace('_', ' ').replace('OPERATIONAL_', '').replace('ACTION_', '').toLowerCase()}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar no sistema..." 
                className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full text-sm focus:ring-2 focus:ring-emerald-500 w-64"
              />
            </div>
            
            {/* Notification Center */}
            <div className="relative" ref={notificationRef}>
                <button 
                    onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none"
                >
                    <Bell className="w-5 h-5" />
                    {systemAlerts.length > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse"></span>
                    )}
                </button>

                {isNotificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-slide-up origin-top-right">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-700">Alertas do Sistema</h3>
                            <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{systemAlerts.length}</span>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {systemAlerts.length === 0 ? (
                                <div className="p-6 text-center">
                                    <CheckCircle className="w-8 h-8 text-emerald-100 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Tudo em dia! Sem alertas pendentes.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {systemAlerts.map(alert => (
                                        <div key={alert.id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start">
                                                <div className={`mt-1 p-1 rounded-full shrink-0 mr-3 ${alert.type === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                                    {alert.type === 'CRITICAL' ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                </div>
                                                <div>
                                                    <p className={`text-xs font-bold uppercase mb-0.5 ${alert.type === 'CRITICAL' ? 'text-red-600' : 'text-amber-600'}`}>
                                                        {alert.title}
                                                    </p>
                                                    <p className="text-sm text-gray-800 leading-snug mb-1">{alert.message}</p>
                                                    <p className="text-[10px] text-gray-400">Vencimento: {new Date(alert.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;