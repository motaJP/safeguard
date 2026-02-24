import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  UploadCloud, 
  AlertTriangle, 
  Clock, 
  CheckSquare, 
  UserMinus,
  Plus,
  KanbanSquare,
  ArrowRight,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { OperationalTask, TaskFrequency, UserRole } from '../types';

const OperationalDashboard: React.FC = () => {
  const { tasks, addTask, completeTask } = useData();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<OperationalTask>>({
    title: '', description: '', frequency: TaskFrequency.UNICA
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    addTask({
        ...newTask,
        assignedTo: UserRole.ASSISTENTE_OP,
        createdBy: 'Eu (Técnico)', // Assuming the user is Tech Safety or similar
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pendente',
        isSystemGenerated: false
    } as any);
    setIsTaskModalOpen(false);
    setNewTask({ title: '', description: '', frequency: TaskFrequency.UNICA });
  };

  // Helper to check if task is overdue
  const isOverdue = (dateString: string) => {
      const today = new Date().toISOString().split('T')[0];
      return dateString < today;
  };

  // 1. Filter all pending tasks
  const pendingTasks = tasks.filter(t => t.status === 'Pendente');

  // 2. Segment Tasks
  // A. Shutdown/Offboarding (System generated but NO linked action plan)
  const shutdownTasks = pendingTasks.filter(t => t.isSystemGenerated && !t.linkedActionPlanId);
  
  // B. Action Plan Tasks (Have a linked Action Plan ID)
  const actionPlanTasks = pendingTasks.filter(t => t.linkedActionPlanId);
  
  // C. Routine/Manual Tasks (Not system generated)
  const routineTasks = pendingTasks.filter(t => !t.isSystemGenerated);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-lg flex justify-between items-center">
        <div>
            <h2 className="text-3xl font-bold mb-2">Painel Operacional</h2>
            <p className="text-slate-300">
                Você tem <strong className="text-emerald-400">{pendingTasks.length} tarefas pendentes</strong>.
                {pendingTasks.some(t => isOverdue(t.dueDate)) && (
                    <span className="ml-2 text-red-400 bg-red-900/30 px-2 py-0.5 rounded text-sm border border-red-500/30">
                        Atenção: Itens atrasados!
                    </span>
                )}
            </p>
        </div>
        <button 
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center border border-white/20"
        >
            <Plus className="w-5 h-5 mr-2" />
            Nova Tarefa
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUNA ESQUERDA: Prioridades e Sistema */}
        <div className="space-y-6">
            
            {/* 1. SECTION: Offboarding / Desligamentos (Critical) */}
            <div className={`rounded-xl border shadow-sm overflow-hidden ${shutdownTasks.length > 0 ? 'bg-white border-red-100' : 'bg-gray-50 border-dashed border-gray-200 opacity-70'}`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center ${shutdownTasks.length > 0 ? 'bg-red-50 border-red-100' : 'bg-gray-100 border-gray-200'}`}>
                    <h3 className={`font-bold flex items-center ${shutdownTasks.length > 0 ? 'text-red-800' : 'text-gray-500'}`}>
                        <UserMinus className="w-5 h-5 mr-2" />
                        Ações de Desligamento / RH
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${shutdownTasks.length > 0 ? 'bg-red-200 text-red-800' : 'bg-gray-200 text-gray-500'}`}>
                        {shutdownTasks.length}
                    </span>
                </div>
                <div className="p-4 space-y-3">
                    {shutdownTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-2">Nenhum processo de desligamento pendente.</p>
                    ) : (
                        shutdownTasks.map(task => (
                            <div key={task.id} className="bg-white p-3 rounded-lg border border-red-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-800 text-sm">{task.title}</h4>
                                    {isOverdue(task.dueDate) && (
                                        <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">ATRASADO</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 mb-3">{task.description}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-red-400 flex items-center">
                                        <Clock className="w-3 h-3 mr-1" /> Vence: {new Date(task.dueDate).toLocaleDateString()}
                                    </span>
                                    <button 
                                        onClick={() => completeTask(task.id)}
                                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-red-700 transition-colors shadow-sm"
                                    >
                                        Confirmar Recolhimento
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* 2. SECTION: Action Plans (Strategic) */}
            <div className={`rounded-xl border shadow-sm overflow-hidden ${actionPlanTasks.length > 0 ? 'bg-white border-blue-100' : 'bg-gray-50 border-dashed border-gray-200 opacity-70'}`}>
                <div className={`px-4 py-3 border-b flex justify-between items-center ${actionPlanTasks.length > 0 ? 'bg-blue-50 border-blue-100' : 'bg-gray-100 border-gray-200'}`}>
                    <h3 className={`font-bold flex items-center ${actionPlanTasks.length > 0 ? 'text-blue-800' : 'text-gray-500'}`}>
                        <KanbanSquare className="w-5 h-5 mr-2" />
                        Execução de Planos de Ação
                    </h3>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${actionPlanTasks.length > 0 ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-500'}`}>
                        {actionPlanTasks.length}
                    </span>
                </div>
                <div className="p-4 space-y-3">
                    {actionPlanTasks.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-2">Nenhuma etapa de plano de ação atribuída.</p>
                    ) : (
                        actionPlanTasks.map(task => (
                            <div key={task.id} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase">
                                            PLANO #{task.linkedActionPlanId?.replace('AP-', '')}
                                        </span>
                                        {isOverdue(task.dueDate) && (
                                            <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-bold">ATRASADO</span>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm mb-1">{task.title.replace('Ação: ', '')}</h4>
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
                                
                                <button 
                                    onClick={() => completeTask(task.id)}
                                    className="w-full bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all flex justify-center items-center"
                                >
                                    <CheckSquare className="w-3 h-3 mr-2" />
                                    Concluir Etapa
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>

        {/* COLUNA DIREITA: Rotina Diária */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-emerald-500" />
                    Rotina Operacional
                </h3>
                <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
            </div>
            
            <div className="flex-1 p-0 overflow-y-auto max-h-[600px]">
                {routineTasks.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-gray-400">
                        <CheckCircle className="w-8 h-8 mb-2 opacity-20" />
                        <p className="text-sm">Tudo limpo! Nenhuma tarefa de rotina pendente.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {routineTasks.map((item) => {
                            const overdue = isOverdue(item.dueDate);
                            return (
                                <div key={item.id} className={`p-4 hover:bg-gray-50 transition-colors group border-l-4 ${overdue ? 'border-l-red-400 bg-red-50/30' : 'border-l-emerald-400'}`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h4 className={`font-medium text-sm ${overdue ? 'text-red-800' : 'text-gray-800'}`}>{item.title}</h4>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                                                    {item.frequency}
                                                </span>
                                                {overdue && (
                                                    <span className="text-[10px] uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded font-bold">
                                                        Venceu: {new Date(item.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                                {!overdue && (
                                                    <span className="text-[10px] text-gray-400 flex items-center">
                                                        Até {new Date(item.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => completeTask(item.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity bg-emerald-600 text-white p-2 rounded-full shadow-sm hover:bg-emerald-700"
                                            title="Concluir Tarefa"
                                        >
                                            <CheckSquare className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>

      </div>

       {/* Modal for New Task */}
       {isTaskModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-bold mb-4">Atribuir Nova Tarefa de Rotina</h3>
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Título</label>
                                <input 
                                    type="text" 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newTask.title}
                                    onChange={e => setNewTask({...newTask, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Descrição</label>
                                <textarea 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    value={newTask.description}
                                    onChange={e => setNewTask({...newTask, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Frequência</label>
                                <select 
                                    className="w-full border rounded-lg p-2"
                                    value={newTask.frequency}
                                    onChange={e => setNewTask({...newTask, frequency: e.target.value as any})}
                                >
                                    <option value={TaskFrequency.UNICA}>Única</option>
                                    <option value={TaskFrequency.DIARIA}>Diária</option>
                                    <option value={TaskFrequency.SEMANAL}>Semanal</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsTaskModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Criar Tarefa</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
    </div>
  );
};

export default OperationalDashboard;