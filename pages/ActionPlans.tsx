import React, { useState } from 'react';
import { 
    KanbanSquare, CheckCircle, Clock, Plus, Calendar as CalendarIcon, List, 
    ChevronRight, MessageSquare, Send, CheckSquare, CalendarClock, User, AlertTriangle, X
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { ActionPlanStatus, ActionPlan, ActionPlanStep } from '../types';

const ActionPlans: React.FC = () => {
    const { 
        actionPlans, addActionPlan, updateActionPlan, 
        extendActionPlanDeadline, updateActionPlanSteps, addActionPlanLog 
    } = useData();
    
    const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
    
    // Creation Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newPlan, setNewPlan] = useState<Partial<ActionPlan>>({
        description: '',
        responsible: 'Eu (Técnico)',
        assignedTo: '',
        deadline: '',
        priority: 'Média',
        origin: 'Manual'
    });

    // Detail Modal State
    const [selectedPlan, setSelectedPlan] = useState<ActionPlan | null>(null);
    const [newStepText, setNewStepText] = useState('');
    const [newComment, setNewComment] = useState('');
    const [isExtending, setIsExtending] = useState(false);
    const [extensionDate, setExtensionDate] = useState('');
    const [extensionReason, setExtensionReason] = useState('');

    const getStatusColor = (status: ActionPlanStatus) => {
        switch(status) {
            case ActionPlanStatus.CONCLUIDO: return 'bg-green-100 text-green-800 border-green-200';
            case ActionPlanStatus.EM_ANDAMENTO: return 'bg-blue-100 text-blue-800 border-blue-200';
            case ActionPlanStatus.PENDENTE: return 'bg-gray-100 text-gray-800 border-gray-200';
            case ActionPlanStatus.ATRASADO: return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100';
        }
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPlan.description && newPlan.responsible) {
            addActionPlan({
                ...newPlan,
                status: ActionPlanStatus.PENDENTE,
                originId: 'MANUAL',
            } as any);
            setIsCreateModalOpen(false);
            setNewPlan({ description: '', responsible: 'Eu (Técnico)', assignedTo: '', deadline: '', priority: 'Média', origin: 'Manual' });
        }
    };

    // Sub-tasks Handlers
    const handleAddStep = () => {
        if (!selectedPlan || !newStepText) return;
        const newStep: ActionPlanStep = {
            id: `step-${Date.now()}`,
            description: newStepText,
            responsible: selectedPlan.responsible,
            deadline: selectedPlan.deadline,
            status: 'Pendente'
        };
        const updatedSteps = [...(selectedPlan.steps || []), newStep];
        updateActionPlanSteps(selectedPlan.id, updatedSteps);
        
        // Update local state to reflect immediately
        setSelectedPlan({ ...selectedPlan, steps: updatedSteps });
        setNewStepText('');
    };

    const toggleStep = (stepId: string) => {
        if (!selectedPlan) return;
        const updatedSteps = selectedPlan.steps.map(s => 
            s.id === stepId ? { ...s, status: s.status === 'Pendente' ? 'Concluído' : 'Pendente' } : s
        );
        updateActionPlanSteps(selectedPlan.id, updatedSteps as any);
        // Local update requires recalculating progress for UI sync
        const completed = updatedSteps.filter(s => s.status === 'Concluído').length;
        const progress = Math.round((completed / updatedSteps.length) * 100);
        setSelectedPlan({ ...selectedPlan, steps: updatedSteps as any, progress });
    };

    // Comment Handler
    const handleAddComment = () => {
        if (!selectedPlan || !newComment) return;
        addActionPlanLog(selectedPlan.id, newComment, 'COMMENT');
        // Manually update local log to show immediately
        const newLog = {
            id: `temp-${Date.now()}`,
            date: new Date().toISOString(),
            user: 'Eu',
            type: 'COMMENT',
            message: newComment
        };
        setSelectedPlan({ ...selectedPlan, logs: [newLog, ...(selectedPlan.logs || [])] as any });
        setNewComment('');
    };

    // Extension Handler
    const handleExtension = () => {
        if (!selectedPlan || !extensionDate || !extensionReason) return;
        extendActionPlanDeadline(selectedPlan.id, extensionDate, extensionReason);
        setSelectedPlan({ ...selectedPlan, deadline: extensionDate });
        setIsExtending(false);
        setExtensionDate('');
        setExtensionReason('');
    };

    // Calendar helpers
    const getDaysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const days = [];

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-32 bg-gray-50 border border-gray-100"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const plansForDay = actionPlans.filter(p => p.deadline === dateStr);
            
            days.push(
                <div key={i} className="h-32 border border-gray-100 p-2 overflow-y-auto bg-white hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-semibold text-gray-700 mb-1">{i}</div>
                    <div className="space-y-1">
                        {plansForDay.map(plan => {
                            const totalSteps = plan.steps ? plan.steps.length : 0;
                            const completedSteps = plan.steps ? plan.steps.filter(s => s.status === 'Concluído').length : 0;
                            const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                            return (
                                <div 
                                    key={plan.id} 
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`text-[10px] p-1.5 rounded border cursor-pointer hover:shadow-sm transition-all ${getStatusColor(plan.status)}`}
                                >
                                    <div className="font-bold truncate text-gray-800">{plan.description}</div>
                                    <div className="flex items-center gap-1 mt-1.5">
                                        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-emerald-500 rounded-full" 
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-1 text-gray-600">
                                         <span>{completedSteps}/{totalSteps} feitos</span>
                                         <span>{progress}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        return days;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Planos de Ação e Calendário</h2>
                    <p className="text-gray-500 text-sm">Controle de prazos, atribuição de tarefas e acompanhamento.</p>
                </div>
                <div className="flex gap-2">
                    <div className="bg-white rounded-lg p-1 border border-gray-200 shadow-sm flex">
                        <button 
                            onClick={() => setViewMode('LIST')} 
                            className={`p-2 rounded ${viewMode === 'LIST' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            title="Lista"
                        >
                            <List className="w-5 h-5"/>
                        </button>
                        <button 
                            onClick={() => setViewMode('CALENDAR')} 
                            className={`p-2 rounded ${viewMode === 'CALENDAR' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                            title="Calendário"
                        >
                            <CalendarIcon className="w-5 h-5"/>
                        </button>
                    </div>
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Plano
                    </button>
                </div>
            </div>

            {viewMode === 'LIST' && (
                <>
                <div className="flex gap-4 mb-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm flex-1 border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Pendentes</p>
                            <p className="text-2xl font-bold text-gray-800">{actionPlans.filter(p => p.status === ActionPlanStatus.PENDENTE).length}</p>
                        </div>
                        <Clock className="text-orange-400 w-8 h-8" />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm flex-1 border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Em Andamento</p>
                            <p className="text-2xl font-bold text-gray-800">{actionPlans.filter(p => p.status === ActionPlanStatus.EM_ANDAMENTO).length}</p>
                        </div>
                        <KanbanSquare className="text-blue-400 w-8 h-8" />
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm flex-1 border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Concluídos</p>
                            <p className="text-2xl font-bold text-gray-800">{actionPlans.filter(p => p.status === ActionPlanStatus.CONCLUIDO).length}</p>
                        </div>
                        <CheckCircle className="text-green-400 w-8 h-8" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Origem</th>
                                <th className="px-6 py-3 font-medium">Descrição</th>
                                <th className="px-6 py-3 font-medium">Atribuído a</th>
                                <th className="px-6 py-3 font-medium">Prazo</th>
                                <th className="px-6 py-3 font-medium">Progresso</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {actionPlans.map((plan) => (
                                <tr key={plan.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedPlan(plan)}>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            {plan.origin}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{plan.description}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{plan.assignedTo || plan.responsible}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(plan.deadline).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                                            <div 
                                                className="bg-emerald-500 h-1.5 rounded-full" 
                                                style={{ width: `${plan.progress || 0}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] text-gray-500">{plan.progress || 0}%</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(plan.status)}`}>
                                            {plan.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                </>
            )}

            {viewMode === 'CALENDAR' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between mb-4">
                        <h3 className="font-bold text-lg text-gray-800">
                            {new Date(currentYear, currentMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex gap-2">
                             <button onClick={() => setCurrentMonth(currentMonth - 1)} className="p-1 hover:bg-gray-100 rounded">Anterior</button>
                             <button onClick={() => setCurrentMonth(currentMonth + 1)} className="p-1 hover:bg-gray-100 rounded">Próximo</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-gray-200">
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                            <div key={d} className="bg-gray-50 p-2 text-center text-xs font-semibold text-gray-500 uppercase">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-px bg-gray-200">
                        {renderCalendar()}
                    </div>
                </div>
            )}

            {/* DETAIL MODAL (MAIN CHANGE) */}
            {selectedPlan && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-start shrink-0">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-semibold bg-gray-200 px-2 py-0.5 rounded text-gray-600 uppercase tracking-wide">
                                        {selectedPlan.origin} #{selectedPlan.id}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedPlan.status)}`}>
                                        {selectedPlan.status}
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">{selectedPlan.description}</h2>
                            </div>
                            <button onClick={() => setSelectedPlan(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                            {/* Left: Details & Checklist */}
                            <div className="flex-1 overflow-y-auto p-6 border-r border-gray-100">
                                {/* Info Cards */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 flex items-center mb-1"><User className="w-3 h-3 mr-1"/> Responsável</p>
                                        <p className="font-semibold text-sm">{selectedPlan.responsible}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 flex items-center mb-1"><Clock className="w-3 h-3 mr-1"/> Prazo</p>
                                        <p className="font-semibold text-sm">{new Date(selectedPlan.deadline).toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 flex items-center mb-1"><AlertTriangle className="w-3 h-3 mr-1"/> Prioridade</p>
                                        <p className={`font-semibold text-sm ${selectedPlan.priority === 'Alta' ? 'text-red-600' : 'text-gray-800'}`}>{selectedPlan.priority}</p>
                                    </div>
                                </div>

                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <h3 className="font-bold text-gray-700">Etapas do Plano</h3>
                                        <span className="text-sm font-semibold text-emerald-600">{selectedPlan.progress || 0}% Concluído</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${selectedPlan.progress || 0}%` }}></div>
                                    </div>
                                </div>

                                {/* Checklist */}
                                <div className="space-y-3 mb-6">
                                    {(selectedPlan.steps || []).map(step => (
                                        <div key={step.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                                            <button 
                                                onClick={() => toggleStep(step.id)}
                                                className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors ${
                                                    step.status === 'Concluído' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
                                                }`}
                                            >
                                                {step.status === 'Concluído' && <CheckSquare className="w-3.5 h-3.5" />}
                                            </button>
                                            <div className={`flex-1 ${step.status === 'Concluído' ? 'opacity-50 line-through' : ''}`}>
                                                <p className="text-sm font-medium text-gray-800">{step.description}</p>
                                                <p className="text-xs text-gray-500">Resp: {step.responsible}</p>
                                            </div>
                                            <span className="text-xs text-gray-400">{new Date(step.deadline).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                    {(!selectedPlan.steps || selectedPlan.steps.length === 0) && (
                                        <div className="text-center p-4 bg-gray-50 rounded border border-dashed border-gray-200">
                                            <p className="text-sm text-gray-500">Nenhuma etapa definida.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Add Step Input */}
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Adicionar nova etapa (Isso criará uma tarefa automática)..." 
                                        className="flex-1 border rounded-lg px-3 py-2 text-sm"
                                        value={newStepText}
                                        onChange={(e) => setNewStepText(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddStep()}
                                    />
                                    <button 
                                        onClick={handleAddStep}
                                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Right: Timeline & Actions */}
                            <div className="w-full lg:w-96 bg-gray-50 flex flex-col border-l border-gray-100">
                                {/* Action Buttons */}
                                <div className="p-4 border-b border-gray-200 bg-white">
                                    <div className="grid grid-cols-2 gap-2">
                                        <button 
                                            onClick={() => setIsExtending(!isExtending)}
                                            className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 flex items-center justify-center"
                                        >
                                            <CalendarClock className="w-4 h-4 mr-2" />
                                            Prorrogar Prazo
                                        </button>
                                        <button className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Concluir Plano
                                        </button>
                                    </div>

                                    {/* Extension Form */}
                                    {isExtending && (
                                        <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 animate-slide-in">
                                            <label className="text-xs font-bold text-amber-800 block mb-1">Nova Data</label>
                                            <input 
                                                type="date" 
                                                className="w-full border rounded p-1 text-sm mb-2"
                                                value={extensionDate}
                                                onChange={e => setExtensionDate(e.target.value)}
                                            />
                                            <label className="text-xs font-bold text-amber-800 block mb-1">Motivo / Justificativa</label>
                                            <textarea 
                                                className="w-full border rounded p-1 text-sm mb-2" 
                                                rows={2}
                                                value={extensionReason}
                                                onChange={e => setExtensionReason(e.target.value)}
                                            ></textarea>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setIsExtending(false)} className="text-xs text-gray-500 hover:underline">Cancelar</button>
                                                <button onClick={handleExtension} className="text-xs bg-amber-600 text-white px-2 py-1 rounded">Confirmar</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Timeline */}
                                <div className="flex-1 overflow-y-auto p-4">
                                    <h3 className="font-bold text-gray-700 mb-4 text-sm">Linha do Tempo</h3>
                                    <div className="space-y-6">
                                        {(selectedPlan.logs || []).map((log, idx) => (
                                            <div key={log.id || idx} className="relative pl-6 border-l-2 border-gray-200 last:border-0">
                                                <div className={`absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full ${
                                                    log.type === 'CREATION' ? 'bg-blue-400' :
                                                    log.type === 'STATUS_CHANGE' ? 'bg-emerald-400' :
                                                    log.type === 'EXTENSION' ? 'bg-amber-400' : 'bg-gray-400'
                                                }`}></div>
                                                <p className="text-xs text-gray-400 mb-0.5">{new Date(log.date).toLocaleString()}</p>
                                                <p className="text-xs font-bold text-gray-700">{log.user}</p>
                                                <p className="text-sm text-gray-600 mt-1 bg-white p-2 rounded shadow-sm border border-gray-100">
                                                    {log.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Add Comment */}
                                <div className="p-3 border-t border-gray-200 bg-white">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Adicionar comentário..." 
                                            className="w-full border rounded-full pl-4 pr-10 py-2 text-sm bg-gray-50 focus:bg-white transition-colors"
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                                        />
                                        <button 
                                            onClick={handleAddComment}
                                            className="absolute right-1 top-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700"
                                        >
                                            <Send className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Creation (Kept Simple) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Novo Plano de Ação</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">O que deve ser feito?</label>
                                <textarea 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newPlan.description}
                                    onChange={e => setNewPlan({...newPlan, description: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Responsável (Acomp.)</label>
                                    <input 
                                        type="text" 
                                        className="w-full border rounded-lg p-2" 
                                        required
                                        value={newPlan.responsible}
                                        onChange={e => setNewPlan({...newPlan, responsible: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Executante (Tarefa)</label>
                                    <select 
                                        className="w-full border rounded-lg p-2"
                                        value={newPlan.assignedTo}
                                        onChange={e => setNewPlan({...newPlan, assignedTo: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Assistente">Assistente Operacional</option>
                                        <option value="Manutenção">Manutenção</option>
                                        <option value="RH">RH</option>
                                    </select>
                                    <p className="text-[10px] text-gray-500 mt-1">*Se "Assistente", cria tarefa automática.</p>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Prazo Final</label>
                                <input 
                                    type="date" 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newPlan.deadline}
                                    onChange={e => setNewPlan({...newPlan, deadline: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Prioridade</label>
                                <select 
                                    className="w-full border rounded-lg p-2"
                                    value={newPlan.priority}
                                    onChange={e => setNewPlan({...newPlan, priority: e.target.value as any})}
                                >
                                    <option>Baixa</option>
                                    <option>Média</option>
                                    <option>Alta</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActionPlans;