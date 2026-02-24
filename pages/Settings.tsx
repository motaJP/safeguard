import React from 'react';
import { UserRole, ModuleType } from '../types';
import { useData } from '../contexts/DataContext';
import { Shield, Lock, Unlock, Save } from 'lucide-react';

const Settings: React.FC = () => {
    const { permissions, updatePermissions } = useData();

    // List of roles to configure (Exclude SUPER_ADMIN as they have full access)
    const rolesToConfigure = [
        UserRole.GESTOR_GERAL,
        UserRole.TECNICO_SEGURANCA,
        UserRole.ASSISTENTE_OP,
        UserRole.RH
    ];

    // Friendly names for modules
    const moduleNames: Record<ModuleType, string> = {
        [ModuleType.DASHBOARD]: 'Dashboard Estratégico',
        [ModuleType.OPERATIONAL_DASHBOARD]: 'Painel Operacional',
        [ModuleType.ACTION_PLANS]: 'Planos de Ação',
        [ModuleType.SST_ACCIDENTS]: 'Acidentes e Incidentes',
        [ModuleType.SST_INSPECTIONS]: 'Inspeções e Auditorias',
        [ModuleType.SST_EPI]: 'Gestão de EPIs',
        [ModuleType.TRAININGS]: 'Treinamentos e NRs',
        [ModuleType.RH]: 'Recursos Humanos',
        [ModuleType.FLEET]: 'Frota e Telemetria',
        [ModuleType.DOCUMENTS]: 'Documentos (GED)',
        [ModuleType.SETTINGS]: 'Configurações de Acesso'
    };

    const handleTogglePermission = (role: UserRole, module: ModuleType) => {
        const currentModules = permissions[role] || [];
        const hasAccess = currentModules.includes(module);
        
        let newModules;
        if (hasAccess) {
            newModules = currentModules.filter(m => m !== module);
        } else {
            newModules = [...currentModules, module];
        }
        
        updatePermissions(role, newModules);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Configurações de Acesso e Permissões</h2>
                    <p className="text-gray-500 text-sm">Defina quais módulos cada perfil de usuário pode visualizar e interagir.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900 text-white text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4 font-medium border-b border-slate-800 min-w-[200px]">Módulos do Sistema</th>
                                {rolesToConfigure.map(role => (
                                    <th key={role} className="px-6 py-4 font-medium border-b border-slate-800 text-center min-w-[120px]">
                                        {role.replace('_', ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {Object.values(ModuleType).filter(m => m !== ModuleType.SETTINGS).map((module) => (
                                <tr key={module} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-800 flex items-center">
                                        <Shield className="w-4 h-4 mr-2 text-indigo-500" />
                                        {moduleNames[module]}
                                    </td>
                                    {rolesToConfigure.map(role => {
                                        const hasAccess = permissions[role]?.includes(module);
                                        return (
                                            <td key={`${role}-${module}`} className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleTogglePermission(role, module)}
                                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none ${
                                                        hasAccess ? 'bg-emerald-500' : 'bg-gray-200'
                                                    }`}
                                                >
                                                    <div
                                                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                                            hasAccess ? 'translate-x-6' : 'translate-x-0'
                                                        }`}
                                                    />
                                                </button>
                                                <div className="text-[10px] text-gray-400 mt-1">
                                                    {hasAccess ? 'Permitido' : 'Bloqueado'}
                                                </div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="font-bold text-blue-800 text-sm">Nota de Segurança</h4>
                    <p className="text-xs text-blue-600 mt-1">
                        O perfil <strong>SUPER ADMIN</strong> possui acesso irrestrito a todos os módulos e não pode ser modificado nesta tela.
                        As alterações realizadas aqui entram em vigor imediatamente para todos os usuários logados.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Settings;