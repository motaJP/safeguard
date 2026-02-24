import React, { useState } from 'react';
import { ClipboardList, Plus, FileCheck, AlertCircle, Calendar, CheckSquare, XSquare, MinusSquare, Save, X } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { InspectionStatus, InspectionItem, Inspection } from '../types';

const Inspections: React.FC = () => {
    const { inspections, addInspection } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // New Inspection State
    const [formTitle, setFormTitle] = useState('');
    const [formSector, setFormSector] = useState('');
    const [checklistItems, setChecklistItems] = useState<InspectionItem[]>([
        { id: '1', text: 'Uso correto de EPIs', status: 'OK' },
        { id: '2', text: 'Sinalização de segurança visível', status: 'OK' },
        { id: '3', text: 'Extintores desobstruídos e na validade', status: 'OK' }
    ]);
    const [newItemText, setNewItemText] = useState('');

    const calculateCompliance = () => {
        const total = checklistItems.length;
        if (total === 0) return 0;
        const okCount = checklistItems.filter(i => i.status === 'OK').length;
        const naCount = checklistItems.filter(i => i.status === 'NA').length;
        const validTotal = total - naCount;
        if (validTotal === 0) return 100;
        return Math.round((okCount / validTotal) * 100);
    };

    const handleAddItem = () => {
        if (newItemText.trim()) {
            setChecklistItems([...checklistItems, { id: Date.now().toString(), text: newItemText, status: 'OK' }]);
            setNewItemText('');
        }
    };

    const toggleItemStatus = (id: string) => {
        setChecklistItems(items => items.map(item => {
            if (item.id === id) {
                const nextStatus = item.status === 'OK' ? 'NOK' : item.status === 'NOK' ? 'NA' : 'OK';
                return { ...item, status: nextStatus };
            }
            return item;
        }));
    };

    const handleSave = () => {
        if (!formTitle || !formSector) {
            alert('Preencha o título e setor');
            return;
        }
        
        const compliance = calculateCompliance();
        let status = InspectionStatus.CONCLUIDO;
        if (compliance < 70) status = InspectionStatus.CRITICO;
        else if (compliance < 90) status = InspectionStatus.PENDENTE; // Needs review if not perfect

        addInspection({
            title: formTitle,
            date: new Date().toISOString().split('T')[0],
            sector: formSector,
            responsible: 'Técnico Logado',
            compliance,
            status,
            items: checklistItems
        });

        setIsModalOpen(false);
        setFormTitle('');
        setFormSector('');
        setChecklistItems([
            { id: '1', text: 'Uso correto de EPIs', status: 'OK' },
            { id: '2', text: 'Sinalização de segurança visível', status: 'OK' },
            { id: '3', text: 'Extintores desobstruídos e na validade', status: 'OK' }
        ]);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Inspeções e Checklists</h2>
                    <p className="text-gray-500 text-sm">Gerencie as rotinas de verificação e auditoria.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Inspeção
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {/* Card Models */}
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                        <ClipboardList className="w-6 h-6"/>
                    </div>
                    <h3 className="font-bold text-gray-800">Checklist Veicular</h3>
                    <p className="text-sm text-gray-500 mt-1">Inspeção diária para frota leve e pesada.</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4">
                        <FileCheck className="w-6 h-6"/>
                    </div>
                    <h3 className="font-bold text-gray-800">Auditoria 5S</h3>
                    <p className="text-sm text-gray-500 mt-1">Verificação de organização e limpeza dos setores.</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4">
                        <AlertCircle className="w-6 h-6"/>
                    </div>
                    <h3 className="font-bold text-gray-800">Inspeção de EPI</h3>
                    <p className="text-sm text-gray-500 mt-1">Validação de uso e estado de conservação.</p>
                 </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-800">
                    Histórico Recente
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3 font-medium">Inspeção</th>
                            <th className="px-6 py-3 font-medium">Responsável</th>
                            <th className="px-6 py-3 font-medium">Setor</th>
                            <th className="px-6 py-3 font-medium">Data</th>
                            <th className="px-6 py-3 font-medium">Conformidade</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {inspections.map((ins) => (
                            <tr key={ins.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{ins.title}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{ins.responsible}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{ins.sector}</td>
                                <td className="px-6 py-4 text-sm text-gray-600 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                    {new Date(ins.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px]">
                                        <div 
                                            className={`h-2.5 rounded-full ${ins.compliance < 70 ? 'bg-red-500' : ins.compliance < 90 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                                            style={{ width: `${ins.compliance}%` }}>
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 block">{ins.compliance}% Aprovado</span>
                                </td>
                                <td className="px-6 py-4">
                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                        ${ins.status === InspectionStatus.CONCLUIDO ? 'bg-green-100 text-green-800' : 
                                          ins.status === InspectionStatus.CRITICO ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {ins.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Full Checklist Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[90vh] flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 flex items-center">
                                <ClipboardList className="w-5 h-5 mr-2 text-emerald-600"/>
                                Realizar Nova Inspeção
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="p-6 flex-1 overflow-y-auto space-y-6">
                            {/* Header Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Título da Inspeção</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Ex: Checklist Almoxarifado"
                                        value={formTitle}
                                        onChange={e => setFormTitle(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Setor / Área</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2"
                                        placeholder="Ex: Logística"
                                        value={formSector}
                                        onChange={e => setFormSector(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Checklist Items */}
                            <div>
                                <label className="block text-sm font-medium mb-3">Itens de Verificação</label>
                                <div className="space-y-3">
                                    {checklistItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="text-sm font-medium text-gray-700">{item.text}</span>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => toggleItemStatus(item.id)}
                                                    className={`px-3 py-1 rounded text-xs font-bold w-16 text-center transition-colors
                                                    ${item.status === 'OK' ? 'bg-green-100 text-green-700' : 
                                                      item.status === 'NOK' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'}`}
                                                >
                                                    {item.status}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-4 flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 border rounded-lg p-2 text-sm"
                                        placeholder="Adicionar novo item..."
                                        value={newItemText}
                                        onChange={e => setNewItemText(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleAddItem()}
                                    />
                                    <button onClick={handleAddItem} className="bg-gray-100 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-200">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div className="text-sm text-gray-500">
                                Conformidade estimada: <span className="font-bold text-gray-800">{calculateCompliance()}%</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm">Cancelar</button>
                                <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center">
                                    <Save className="w-4 h-4 mr-2" />
                                    Finalizar Inspeção
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inspections;