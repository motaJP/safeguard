import React, { useState } from 'react';
import { User, FileText, UserMinus, UserPlus, Briefcase, Plus, CheckSquare } from 'lucide-react';
import { ASOStatus, Employee, JobRole } from '../types';
import { useData } from '../contexts/DataContext';

const RH: React.FC = () => {
    const { employees, jobRoles, epis, addEmployee, addJobRole, terminateEmployee } = useData();
    const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'ROLES'>('EMPLOYEES');
    
    // Employee Modal State
    const [isAddEmpOpen, setIsAddEmpOpen] = useState(false);
    const [newEmp, setNewEmp] = useState<Partial<Employee>>({ name: '', roleId: '', status: 'Ativo' });

    // Role Modal State
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
    const [newRole, setNewRole] = useState<Partial<JobRole>>({ title: '', sector: '', requiredEpiIds: [] });

    const handleTerminate = (id: string, name: string) => {
        if (window.confirm(`Tem certeza que deseja desligar ${name}? Isso gerará uma tarefa de recolhimento de EPIs.`)) {
            terminateEmployee(id);
        }
    };

    const handleSaveEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedRole = jobRoles.find(r => r.id === newEmp.roleId);
        
        if (newEmp.name && selectedRole) {
            addEmployee({
                ...newEmp,
                roleName: selectedRole.title,
                sector: selectedRole.sector,
                asoStatus: ASOStatus.VALIDO,
                asoExpiration: new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0],
                trainingsValues: 0,
                status: 'Ativo',
                admissionDate: new Date().toISOString().split('T')[0]
            } as any);
            setIsAddEmpOpen(false);
            setNewEmp({ name: '', roleId: '', status: 'Ativo' });
        }
    };

    const handleSaveRole = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRole.title && newRole.sector) {
            addJobRole(newRole as any);
            setIsAddRoleOpen(false);
            setNewRole({ title: '', sector: '', requiredEpiIds: [] });
        }
    };

    const toggleEpiForRole = (epiId: string) => {
        const current = newRole.requiredEpiIds || [];
        if (current.includes(epiId)) {
            setNewRole({ ...newRole, requiredEpiIds: current.filter(id => id !== epiId) });
        } else {
            setNewRole({ ...newRole, requiredEpiIds: [...current, epiId] });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestão de Pessoas e Cargos</h2>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('EMPLOYEES')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'EMPLOYEES' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Colaboradores
                    </button>
                    <button 
                        onClick={() => setActiveTab('ROLES')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'ROLES' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Cargos & Funções
                    </button>
                </div>
            </div>

            {activeTab === 'EMPLOYEES' && (
                <>
                <div className="flex justify-end">
                     <button 
                        onClick={() => setIsAddEmpOpen(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center shadow-sm"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Novo Colaborador
                    </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Colaborador</th>
                                <th className="px-6 py-3 font-medium">Cargo / Setor</th>
                                <th className="px-6 py-3 font-medium">Admissão</th>
                                <th className="px-6 py-3 font-medium">Status ASO</th>
                                <th className="px-6 py-3 font-medium">Situação</th>
                                <th className="px-6 py-3 font-medium text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {employees.map((emp) => (
                                <tr key={emp.id} className={`hover:bg-gray-50 ${emp.status === 'Inativo' ? 'opacity-60 bg-gray-50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mr-3 ${emp.status === 'Ativo' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div className="text-sm font-medium text-gray-900">{emp.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-800">{emp.roleName}</div>
                                        <div className="text-xs text-gray-500">{emp.sector}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(emp.admissionDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${emp.asoStatus === ASOStatus.VALIDO ? 'bg-green-100 text-green-800' : 
                                            emp.asoStatus === ASOStatus.VENCIDO ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {emp.asoStatus}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                            ${emp.status === 'Ativo' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2 justify-end">
                                        {emp.status === 'Ativo' && (
                                            <button 
                                                onClick={() => handleTerminate(emp.id, emp.name)}
                                                className="text-red-400 hover:text-red-600 p-1" 
                                                title="Desligar Colaborador"
                                            >
                                                <UserMinus className="w-4 h-4"/>
                                            </button>
                                        )}
                                        <button className="text-gray-400 hover:text-indigo-600 p-1" title="Prontuário">
                                            <FileText className="w-4 h-4"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            {activeTab === 'ROLES' && (
                <>
                <div className="flex justify-end">
                    <button 
                        onClick={() => setIsAddRoleOpen(true)}
                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium flex items-center shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Função
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobRoles.map(role => (
                        <div key={role.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mr-3">
                                        <Briefcase className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{role.title}</h3>
                                        <p className="text-xs text-gray-500">{role.sector}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 pt-3">
                                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">EPIs Obrigatórios</p>
                                <ul className="space-y-1">
                                    {role.requiredEpiIds.map(epiId => {
                                        const epi = epis.find(e => e.id === epiId);
                                        return epi ? (
                                            <li key={epiId} className="text-xs text-gray-600 flex items-center">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                                                {epi.name}
                                            </li>
                                        ) : null;
                                    })}
                                    {role.requiredEpiIds.length === 0 && <li className="text-xs text-gray-400 italic">Nenhum EPI definido</li>}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                </>
            )}

            {/* Modal Add Employee */}
            {isAddEmpOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Cadastrar Colaborador</h3>
                        <form onSubmit={handleSaveEmployee} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nome Completo</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newEmp.name}
                                    onChange={e => setNewEmp({...newEmp, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Cargo / Função</label>
                                <select 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newEmp.roleId}
                                    onChange={e => setNewEmp({...newEmp, roleId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {jobRoles.map(r => (
                                        <option key={r.id} value={r.id}>{r.title} - {r.sector}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsAddEmpOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Add Role */}
            {isAddRoleOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
                        <h3 className="text-lg font-bold mb-4">Nova Função / Cargo</h3>
                        <form onSubmit={handleSaveRole} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nome do Cargo</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2" 
                                        required
                                        value={newRole.title}
                                        onChange={e => setNewRole({...newRole, title: e.target.value})}
                                        placeholder="Ex: Soldador"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Setor</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2" 
                                        required
                                        value={newRole.sector}
                                        onChange={e => setNewRole({...newRole, sector: e.target.value})}
                                        placeholder="Ex: Manutenção"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Selecione os EPIs Obrigatórios</label>
                                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
                                    {epis.map(epi => (
                                        <div key={epi.id} className="flex items-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleEpiForRole(epi.id)}
                                                className={`w-5 h-5 rounded border mr-2 flex items-center justify-center ${newRole.requiredEpiIds?.includes(epi.id) ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300'}`}
                                            >
                                                {newRole.requiredEpiIds?.includes(epi.id) && <CheckSquare className="w-3 h-3"/>}
                                            </button>
                                            <span className="text-sm text-gray-700">{epi.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsAddRoleOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800">Criar Cargo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RH;