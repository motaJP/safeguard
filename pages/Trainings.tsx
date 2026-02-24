import React, { useState } from 'react';
import { Plus, CheckSquare, GraduationCap, CalendarClock, Award, Search, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Training, TrainingRecord, Employee } from '../types';
import { useData } from '../contexts/DataContext';

const Trainings: React.FC = () => {
    const { employees, trainings, trainingRecords, addTraining, addTrainingRecord } = useData();
    
    // Training Modal State
    const [isAddTrainingOpen, setIsAddTrainingOpen] = useState(false);
    const [newTraining, setNewTraining] = useState<Partial<Training>>({ title: '', description: '', validityMonths: 12, mandatory: true });

    // Training Record Modal
    const [isRecordOpen, setIsRecordOpen] = useState(false);
    const [newRecord, setNewRecord] = useState({ employeeId: '', trainingId: '', completionDate: '' });

    const handleSaveTraining = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTraining.title) {
            addTraining(newTraining as any);
            setIsAddTrainingOpen(false);
            setNewTraining({ title: '', description: '', validityMonths: 12, mandatory: true });
        }
    };

    const handleSaveRecord = (e: React.FormEvent) => {
        e.preventDefault();
        if (newRecord.employeeId && newRecord.trainingId && newRecord.completionDate) {
            addTrainingRecord(newRecord);
            setIsRecordOpen(false);
            setNewRecord({ employeeId: '', trainingId: '', completionDate: '' });
        }
    };

    const getStatusColor = (expiry: string | null) => {
        if (!expiry) return 'bg-green-100 text-green-800';
        const now = new Date();
        const exp = new Date(expiry);
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'bg-red-100 text-red-800';
        if (diffDays < 30) return 'bg-amber-100 text-amber-800';
        return 'bg-green-100 text-green-800';
    };

    const getStatusText = (expiry: string | null) => {
         if (!expiry) return 'Permanente';
         const now = new Date();
         const exp = new Date(expiry);
         const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

         if (diffDays < 0) return 'Vencido';
         if (diffDays < 30) return 'A Vencer';
         return 'Válido';
    };

    // Calculate Dashboard Stats
    const totalMandatory = trainings.filter(t => t.mandatory).length;
    const expiredRecords = trainingRecords.filter(r => r.expirationDate && new Date(r.expirationDate) < new Date()).length;
    const expiringSoon = trainingRecords.filter(r => {
        if (!r.expirationDate) return false;
        const diff = new Date(r.expirationDate).getTime() - new Date().getTime();
        return diff > 0 && diff < (30 * 24 * 60 * 60 * 1000);
    }).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Treinamentos e Normas Regulamentadoras</h2>
                    <p className="text-gray-500 text-sm">Controle de capacitação, validade de NRs e listas de presença.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsRecordOpen(true)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium flex items-center shadow-sm"
                    >
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Registrar Realização
                    </button>
                    <button 
                        onClick={() => setIsAddTrainingOpen(true)}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium flex items-center shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Curso
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                     <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mr-3">
                         <GraduationCap className="w-5 h-5"/>
                     </div>
                     <div>
                         <p className="text-xs text-gray-500">Total de Cursos</p>
                         <p className="text-xl font-bold text-gray-800">{trainings.length}</p>
                     </div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                     <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 mr-3">
                         <AlertTriangle className="w-5 h-5"/>
                     </div>
                     <div>
                         <p className="text-xs text-gray-500">Vencidos (Ação Imediata)</p>
                         <p className="text-xl font-bold text-gray-800">{expiredRecords}</p>
                     </div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                     <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mr-3">
                         <Clock className="w-5 h-5"/>
                     </div>
                     <div>
                         <p className="text-xs text-gray-500">A Vencer (30 dias)</p>
                         <p className="text-xl font-bold text-gray-800">{expiringSoon}</p>
                     </div>
                 </div>
                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center">
                     <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-3">
                         <CheckCircle className="w-5 h-5"/>
                     </div>
                     <div>
                         <p className="text-xs text-gray-500">Registros Totais</p>
                         <p className="text-xl font-bold text-gray-800">{trainingRecords.length}</p>
                     </div>
                 </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Catalog */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-indigo-500"/>
                        Catálogo de Cursos (NRs)
                    </h3>
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                        <input type="text" placeholder="Buscar treinamento..." className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg bg-gray-50"/>
                    </div>
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px]">
                        {trainings.map(t => (
                            <div key={t.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-gray-800 text-sm">{t.title}</h4>
                                    {t.mandatory && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">OBRIGATÓRIO</span>}
                                </div>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{t.description}</p>
                                <div className="flex items-center mt-2 text-xs text-gray-400">
                                    <CalendarClock className="w-3 h-3 mr-1"/>
                                    Validade: {t.validityMonths > 0 ? `${t.validityMonths} meses` : 'Indeterminado'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Matrix / Records */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
                     <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-emerald-500"/>
                            Matriz de Realização
                        </h3>
                     </div>
                     <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0 z-10">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Colaborador</th>
                                    <th className="px-6 py-3 font-medium">Treinamento</th>
                                    <th className="px-6 py-3 font-medium">Data Realização</th>
                                    <th className="px-6 py-3 font-medium">Validade</th>
                                    <th className="px-6 py-3 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {trainingRecords.map(rec => (
                                    <tr key={rec.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{rec.employeeName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{rec.trainingTitle}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(rec.completionDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{rec.expirationDate ? new Date(rec.expirationDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(rec.expirationDate)}`}>
                                                {getStatusText(rec.expirationDate)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {trainingRecords.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                            Nenhum registro de treinamento encontrado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                     </div>
                </div>
            </div>

            {/* Modal Add Training */}
            {isAddTrainingOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Novo Curso / Treinamento</h3>
                        <form onSubmit={handleSaveTraining} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título do Treinamento</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newTraining.title}
                                    onChange={e => setNewTraining({...newTraining, title: e.target.value})}
                                    placeholder="Ex: NR-35 Trabalho em Altura"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2" 
                                    value={newTraining.description}
                                    onChange={e => setNewTraining({...newTraining, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Validade (meses)</label>
                                    <input 
                                        type="number" 
                                        className="w-full border rounded-lg p-2" 
                                        value={newTraining.validityMonths}
                                        onChange={e => setNewTraining({...newTraining, validityMonths: parseInt(e.target.value)})}
                                    />
                                    <span className="text-[10px] text-gray-400">0 para indeterminado</span>
                                </div>
                                <div className="flex items-center pt-6">
                                    <input 
                                        type="checkbox" 
                                        id="mandatory"
                                        className="mr-2"
                                        checked={newTraining.mandatory}
                                        onChange={e => setNewTraining({...newTraining, mandatory: e.target.checked})}
                                    />
                                    <label htmlFor="mandatory" className="text-sm">Obrigatório</label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsAddTrainingOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Salvar Curso</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

             {/* Modal Record Training */}
             {isRecordOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Lista de Presença Digital</h3>
                        <form onSubmit={handleSaveRecord} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Colaborador</label>
                                <select 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newRecord.employeeId}
                                    onChange={e => setNewRecord({...newRecord, employeeId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {employees.filter(e => e.status === 'Ativo').map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Treinamento Realizado</label>
                                <select 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newRecord.trainingId}
                                    onChange={e => setNewRecord({...newRecord, trainingId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {trainings.map(t => (
                                        <option key={t.id} value={t.id}>{t.title}</option>
                                    ))}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium mb-1">Data da Conclusão</label>
                                <input 
                                    type="date" 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newRecord.completionDate}
                                    onChange={e => setNewRecord({...newRecord, completionDate: e.target.value})}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsRecordOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Registrar Presença</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Trainings;