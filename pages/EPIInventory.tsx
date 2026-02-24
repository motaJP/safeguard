import React, { useState, useEffect } from 'react';
import { Package, AlertCircle, CheckCircle, Search, UserCheck, Shield, AlertTriangle, XCircle, ChevronDown, ChevronUp, UserMinus, RotateCcw, History, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { UserRole, TaskFrequency } from '../types';

const EPIInventory: React.FC = () => {
  const { epis, epiAssignments, employees, jobRoles, assignEPI, returnEPI, addEPI, assignMultipleEPIs, addTask, showNotification } = useData();
  const [activeTab, setActiveTab] = useState<'ESTOQUE' | 'ENTREGAS' | 'MATRIZ'>('MATRIZ');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedEPI, setSelectedEPI] = useState('');
  const [suggestedEPIs, setSuggestedEPIs] = useState<string[]>([]);
  
  // New EPI Modal State
  const [isNewEPIModalOpen, setIsNewEPIModalOpen] = useState(false);
  const [newEPI, setNewEPI] = useState({
      name: '',
      ca: '',
      stock: 0,
      minStock: 0,
      validity: ''
  });

  // Matrix Expand State
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);
  
  // Full History Modal State
  const [historyModalEmployeeId, setHistoryModalEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedEmployee) {
      const emp = employees.find(e => e.id === selectedEmployee);
      if (emp) {
        const role = jobRoles.find(r => r.id === emp.roleId);
        if (role && role.requiredEpiIds) {
          // Find which required EPIs the employee doesn't currently have active
          const activeAssignments = epiAssignments.filter(a => a.employeeId === emp.id && a.status === 'Em Uso');
          const missingEPIs = role.requiredEpiIds.filter(reqId => 
            !activeAssignments.find(a => a.epiId === reqId)
          );
          setSuggestedEPIs(missingEPIs);
        } else {
          setSuggestedEPIs([]);
        }
      }
    } else {
      setSuggestedEPIs([]);
    }
  }, [selectedEmployee, employees, jobRoles, epiAssignments]);

  const handleAssign = () => {
    if (selectedEmployee && selectedEPI) {
        assignEPI(selectedEmployee, selectedEPI);
        setSelectedEPI('');
        // We don't clear the employee so they can assign multiple items easily
    }
  };

  const handleReturn = (assignmentId: string) => {
      if(window.confirm('Confirmar devolução deste EPI?')) {
          returnEPI(assignmentId);
      }
  };

  const toggleExpand = (id: string) => {
      setExpandedEmployeeId(expandedEmployeeId === id ? null : id);
  };

  const handleAddEPI = (e: React.FormEvent) => {
      e.preventDefault();
      addEPI({
          name: newEPI.name,
          ca: newEPI.ca,
          stock: Number(newEPI.stock),
          minStock: Number(newEPI.minStock),
          validity: newEPI.validity
      });
      setIsNewEPIModalOpen(false);
      setNewEPI({ name: '', ca: '', stock: 0, minStock: 0, validity: '' });
  };

  const handleRequestExchange = (assign: any) => {
      if(window.confirm(`Solicitar troca do EPI: ${assign.epiName}?`)) {
          addTask({
              title: `Troca de EPI: ${assign.epiName}`,
              description: `Solicitação de troca para o colaborador ${assign.employeeName}. Motivo: Vencimento/Próximo do vencimento.`,
              assignedTo: UserRole.ASSISTENTE_OP,
              createdBy: 'Sistema RH',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              frequency: TaskFrequency.UNICA,
              status: 'Pendente',
              isSystemGenerated: true
          });
          showNotification('success', 'Solicitação de troca enviada para a equipe de segurança.');
      }
  };

  const renderMatriz = () => {
      return (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="font-semibold text-gray-800">Ficha de EPI por Colaborador (Matriz)</span>
                <span className="text-xs text-gray-500">Clique na linha para ver o histórico completo</span>
             </div>
             <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-100 text-gray-500 text-xs uppercase">
                     <tr>
                         <th className="px-6 py-3 font-medium">Colaborador</th>
                         <th className="px-6 py-3 font-medium">Cargo</th>
                         <th className="px-6 py-3 font-medium">Situação Funcional</th>
                         <th className="px-6 py-3 font-medium text-center">Status EPIs</th>
                         <th className="px-6 py-3 font-medium text-right"></th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                     {employees.map(emp => {
                         const role = jobRoles.find(r => r.id === emp.roleId);
                         
                         // Determine EPI Status
                         const requiredEpiIds = role?.requiredEpiIds || [];
                         const employeeAssignments = epiAssignments.filter(a => a.employeeId === emp.id);
                         const activeAssignments = employeeAssignments.filter(a => a.status === 'Em Uso');
                         const inactiveAssignments = employeeAssignments.filter(a => a.status !== 'Em Uso');
                         
                         let statusIcon = <CheckCircle className="w-5 h-5 text-emerald-500"/>;
                         let statusText = "Em dia";
                         let statusColor = "bg-emerald-100 text-emerald-700";

                         // Check if inactive with pending items
                         if (emp.status === 'Inativo' && activeAssignments.length > 0) {
                             statusIcon = <UserMinus className="w-5 h-5 text-red-600"/>;
                             statusText = "Devolução Pendente";
                             statusColor = "bg-red-100 text-red-700 font-bold animate-pulse";
                         } else {
                             // Check for missing items (Active only)
                             if (emp.status === 'Ativo') {
                                 const missing = requiredEpiIds.filter(reqId => 
                                     !activeAssignments.find(a => a.epiId === reqId)
                                 );
                                 if (missing.length > 0) {
                                     statusIcon = <AlertTriangle className="w-5 h-5 text-orange-500"/>;
                                     statusText = `Faltam ${missing.length}`;
                                     statusColor = "bg-orange-100 text-orange-700";
                                 } else {
                                     // Check expired
                                     const hasExpired = activeAssignments.some(a => new Date(a.expirationDate) < new Date());
                                     const hasExpiringSoon = activeAssignments.some(a => {
                                         const expDate = new Date(a.expirationDate);
                                         const today = new Date();
                                         const diffTime = Math.abs(expDate.getTime() - today.getTime());
                                         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                         return expDate >= today && diffDays <= 30;
                                     });

                                     if(hasExpired) {
                                         statusIcon = <RotateCcw className="w-5 h-5 text-red-500"/>;
                                         statusText = "Vencidos";
                                         statusColor = "bg-red-100 text-red-700";
                                     } else if (hasExpiringSoon) {
                                         statusIcon = <AlertTriangle className="w-5 h-5 text-amber-500"/>;
                                         statusText = "Vence em breve";
                                         statusColor = "bg-amber-100 text-amber-700";
                                     }
                                 }
                             } else {
                                 // Inactive and no items
                                 statusIcon = <CheckCircle className="w-5 h-5 text-gray-400"/>;
                                 statusText = "Ok (Desligado)";
                                 statusColor = "bg-gray-100 text-gray-500";
                             }
                         }

                         return (
                             <React.Fragment key={emp.id}>
                                 <tr 
                                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${expandedEmployeeId === emp.id ? 'bg-blue-50' : ''}`}
                                    onClick={() => toggleExpand(emp.id)}
                                 >
                                     <td className="px-6 py-4 font-medium text-gray-800">{emp.name}</td>
                                     <td className="px-6 py-4 text-sm text-gray-600">{emp.roleName}</td>
                                     <td className="px-6 py-4">
                                         <span className={`text-xs px-2 py-1 rounded-full ${emp.status === 'Ativo' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                                             {emp.status}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 flex justify-center">
                                         <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs ${statusColor}`}>
                                             {statusIcon}
                                             {statusText}
                                         </span>
                                     </td>
                                     <td className="px-6 py-4 text-right text-gray-400">
                                         {expandedEmployeeId === emp.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                     </td>
                                 </tr>
                                 {expandedEmployeeId === emp.id && (
                                     <tr>
                                         <td colSpan={5} className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                                             <div className="ml-4">
                                                 <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                                                    <Shield className="w-4 h-4 mr-2 text-blue-600"/>
                                                    Ficha de EPI
                                                 </h4>
                                                 
                                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                     {/* Active / Pending Items */}
                                                     <div>
                                                         <p className="text-xs font-bold text-blue-600 uppercase mb-3 border-b border-blue-100 pb-1">Itens em Posse (Ativos)</p>
                                                         {activeAssignments.length > 0 ? (
                                                             <div className="space-y-2">
                                                                {activeAssignments.map(assign => {
                                                                    const expDate = new Date(assign.expirationDate);
                                                                    const today = new Date();
                                                                    const isExpired = expDate < today;
                                                                    const diffTime = expDate.getTime() - today.getTime();
                                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                                                    const isExpiringSoon = !isExpired && diffDays <= 30;

                                                                    return (
                                                                        <div key={assign.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={`p-2 rounded-full ${isExpired ? 'bg-red-50' : isExpiringSoon ? 'bg-amber-50' : 'bg-blue-50'}`}>
                                                                                    <Shield className={`w-4 h-4 ${isExpired ? 'text-red-500' : isExpiringSoon ? 'text-amber-500' : 'text-blue-500'}`}/>
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-bold text-gray-800">{assign.epiName}</p>
                                                                                    <div className="flex gap-2 text-xs text-gray-500">
                                                                                        <span>Entregue: {new Date(assign.deliveryDate).toLocaleDateString()}</span>
                                                                                        <span>•</span>
                                                                                        <span className={isExpired ? 'text-red-600 font-bold' : isExpiringSoon ? 'text-amber-600 font-bold' : ''}>Validade: {new Date(assign.expirationDate).toLocaleDateString()}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex flex-col items-end gap-1">
                                                                                {isExpired && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">VENCIDO</span>}
                                                                                {isExpiringSoon && <span className="text-[10px] bg-amber-100 text-amber-600 px-2 py-0.5 rounded font-bold">VENCE EM {diffDays} DIAS</span>}
                                                                                <button 
                                                                                    onClick={(e) => { e.stopPropagation(); handleReturn(assign.id); }}
                                                                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded flex items-center transition-colors"
                                                                                >
                                                                                    <RotateCcw className="w-3 h-3 mr-1"/>
                                                                                    Devolver
                                                                                </button>
                                                                                {(isExpired || isExpiringSoon) && (
                                                                                    <button 
                                                                                        onClick={(e) => { e.stopPropagation(); handleRequestExchange(assign); }}
                                                                                        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded flex items-center transition-colors mt-1"
                                                                                    >
                                                                                        <RefreshCw className="w-3 h-3 mr-1"/>
                                                                                        Solicitar Troca
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                             </div>
                                                         ) : (
                                                             <p className="text-sm text-gray-500 italic p-2">Nenhum item em posse atualmente.</p>
                                                         )}

                                                         {/* Missing Requirements (Active Only) */}
                                                         {emp.status === 'Ativo' && role && (
                                                             <div className="mt-4">
                                                                 {role.requiredEpiIds.filter(reqId => !activeAssignments.find(a => a.epiId === reqId)).map(missingId => {
                                                                     const epi = epis.find(e => e.id === missingId);
                                                                     return epi ? (
                                                                        <div key={missingId} className="flex items-center gap-2 p-2 text-sm text-orange-600 bg-orange-50 rounded mb-1 border border-orange-100">
                                                                            <AlertCircle className="w-4 h-4"/>
                                                                            Necessário entregar: <strong>{epi.name}</strong>
                                                                        </div>
                                                                     ) : null;
                                                                 })}
                                                             </div>
                                                         )}
                                                     </div>

                                                     {/* History */}
                                                     <div>
                                                         <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-1">
                                                             <p className="text-xs font-bold text-gray-500 uppercase flex items-center">
                                                                <History className="w-3 h-3 mr-1"/>
                                                                Histórico (Devolvidos / Baixados)
                                                             </p>
                                                             <button 
                                                                onClick={(e) => { e.stopPropagation(); setHistoryModalEmployeeId(emp.id); }}
                                                                className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center"
                                                             >
                                                                 Ver Histórico Completo
                                                             </button>
                                                         </div>
                                                         {inactiveAssignments.length > 0 ? (
                                                             <div className="space-y-2">
                                                                {inactiveAssignments.map(assign => (
                                                                    <div key={assign.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 opacity-80">
                                                                        <div className="flex items-center gap-3">
                                                                            <Package className="w-4 h-4 text-gray-400"/>
                                                                            <div>
                                                                                <p className="text-sm font-medium text-gray-600 line-through">{assign.epiName}</p>
                                                                                <div className="flex gap-2 text-xs text-gray-400">
                                                                                    <span>Entregue: {new Date(assign.deliveryDate).toLocaleDateString()}</span>
                                                                                    {assign.returnDate && (
                                                                                        <>
                                                                                            <span>•</span>
                                                                                            <span>Devolvido: {new Date(assign.returnDate).toLocaleDateString()}</span>
                                                                                        </>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-medium uppercase">{assign.status}</span>
                                                                    </div>
                                                                ))}
                                                             </div>
                                                         ) : (
                                                             <p className="text-sm text-gray-400 italic p-2">Nenhum histórico de devoluções.</p>
                                                         )}
                                                     </div>
                                                 </div>
                                             </div>
                                         </td>
                                     </tr>
                                 )}
                             </React.Fragment>
                         );
                     })}
                 </tbody>
             </table>
          </div>
      );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestão de EPIs</h2>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button 
                onClick={() => setActiveTab('MATRIZ')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'MATRIZ' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Matriz & Colaboradores
            </button>
            <button 
                onClick={() => setActiveTab('ESTOQUE')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'ESTOQUE' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Estoque
            </button>
            <button 
                onClick={() => setActiveTab('ENTREGAS')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'ENTREGAS' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
                Nova Entrega & Registro
            </button>
        </div>
      </div>

      {activeTab === 'ESTOQUE' && (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button 
                    onClick={() => setIsNewEPIModalOpen(true)}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Novo EPI
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {epis.map((item) => {
                    const isLowStock = item.stock < item.minStock;
                    const inUseCount = epiAssignments.filter(a => a.epiId === item.id && a.status === 'Em Uso').length;
                    return (
                        <div key={item.id} className={`bg-white p-5 rounded-xl border-l-4 shadow-sm ${isLowStock ? 'border-red-500' : 'border-emerald-500'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <Package className={`w-6 h-6 ${isLowStock ? 'text-red-500' : 'text-emerald-500'}`} />
                                <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-600">CA: {item.ca}</span>
                            </div>
                            <h3 className="font-bold text-gray-800 text-sm line-clamp-2 h-10">{item.name}</h3>
                            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <p className="text-gray-500">Em Estoque</p>
                                    <p className={`text-xl font-bold ${isLowStock ? 'text-red-600' : 'text-gray-800'}`}>{item.stock}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500">Em Uso (Ativos)</p>
                                    <p className="text-xl font-bold text-blue-600">{inUseCount}</p>
                                </div>
                            </div>
                            {isLowStock && (
                                <div className="mt-3 flex items-center text-xs text-red-600 font-medium bg-red-50 p-2 rounded">
                                    <AlertCircle className="w-3 h-3 mr-1" />
                                    Repor Estoque (Mín: {item.minStock})
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
      )}

      {activeTab === 'ENTREGAS' && (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4">
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador</label>
                        <select 
                            className="w-full border rounded-lg p-2 text-sm"
                            value={selectedEmployee}
                            onChange={e => setSelectedEmployee(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {employees.filter(e => e.status === 'Ativo').map(e => (
                                <option key={e.id} value={e.id}>{e.name} - {e.roleName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">EPI</label>
                        <select 
                            className="w-full border rounded-lg p-2 text-sm"
                            value={selectedEPI}
                            onChange={e => setSelectedEPI(e.target.value)}
                        >
                            <option value="">Selecione...</option>
                            {epis.filter(e => e.stock > 0).map(e => (
                                <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                        </select>
                    </div>
                    <button 
                        onClick={handleAssign}
                        disabled={!selectedEmployee || !selectedEPI}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed h-[38px]"
                    >
                        Registrar Entrega
                    </button>
                </div>
                
                {/* Sugestões de EPIs */}
                {selectedEmployee && suggestedEPIs.length > 0 && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mt-2">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center text-blue-800 font-medium text-sm">
                                <Sparkles className="w-4 h-4 mr-2 text-blue-600" />
                                EPIs obrigatórios pendentes para este cargo:
                            </div>
                            <button
                                onClick={() => {
                                    const availableEPIs = suggestedEPIs.filter(epiId => {
                                        const epi = epis.find(e => e.id === epiId);
                                        return epi && epi.stock > 0;
                                    });
                                    if (availableEPIs.length > 0) {
                                        assignMultipleEPIs(selectedEmployee, availableEPIs);
                                    }
                                }}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
                            >
                                Entregar Todos Disponíveis
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {suggestedEPIs.map(epiId => {
                                const epi = epis.find(e => e.id === epiId);
                                if (!epi) return null;
                                const isOutOfStock = epi.stock <= 0;
                                return (
                                    <button
                                        key={epiId}
                                        onClick={() => {
                                            if (!isOutOfStock) {
                                                assignEPI(selectedEmployee, epiId);
                                            }
                                        }}
                                        disabled={isOutOfStock}
                                        className={`text-xs px-3 py-1.5 rounded-full border flex items-center transition-colors ${
                                            isOutOfStock 
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                            : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                                        }`}
                                        title={isOutOfStock ? "Sem estoque" : "Clique para entregar este EPI"}
                                    >
                                        <Package className="w-3 h-3 mr-1.5" />
                                        {epi.name}
                                        {isOutOfStock && <span className="ml-1 text-[10px] text-red-500 font-bold">(Sem estoque)</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                {selectedEmployee && suggestedEPIs.length === 0 && (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-2 flex items-center text-emerald-700 text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Este colaborador já possui todos os EPIs obrigatórios para o seu cargo.
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3 font-medium">Colaborador</th>
                            <th className="px-6 py-3 font-medium">EPI</th>
                            <th className="px-6 py-3 font-medium">Data Entrega</th>
                            <th className="px-6 py-3 font-medium">Validade</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {epiAssignments.map(assign => {
                            const isExpired = new Date(assign.expirationDate) < new Date();
                            return (
                                <tr key={assign.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{assign.employeeName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{assign.epiName}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(assign.deliveryDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {new Date(assign.expirationDate).toLocaleDateString()}
                                        {isExpired && assign.status === 'Em Uso' && (
                                            <span className="ml-2 text-xs text-red-600 font-bold">(Vencido)</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${assign.status === 'Em Uso' ? (isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800') : 'bg-gray-100 text-gray-600'}`}>
                                            {assign.status === 'Em Uso' && isExpired ? 'Troca Necessária' : assign.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'MATRIZ' && renderMatriz()}

      {/* New EPI Modal */}
      {isNewEPIModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center">
                        <Package className="w-5 h-5 mr-2 text-emerald-600" />
                        Cadastrar Novo EPI
                    </h3>
                    <button onClick={() => setIsNewEPIModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleAddEPI} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do EPI</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={newEPI.name}
                            onChange={e => setNewEPI({...newEPI, name: e.target.value})}
                            placeholder="Ex: Luva de Vaqueta"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CA (Certificado de Aprovação)</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={newEPI.ca}
                            onChange={e => setNewEPI({...newEPI, ca: e.target.value})}
                            placeholder="Ex: 12345"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Inicial</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                value={newEPI.stock}
                                onChange={e => setNewEPI({...newEPI, stock: Number(e.target.value)})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                value={newEPI.minStock}
                                onChange={e => setNewEPI({...newEPI, minStock: Number(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade (CA)</label>
                        <input 
                            type="date" 
                            required
                            className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            value={newEPI.validity}
                            onChange={e => setNewEPI({...newEPI, validity: e.target.value})}
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button"
                            onClick={() => setIsNewEPIModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                            Cadastrar EPI
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
      {/* Full History Modal */}
      {historyModalEmployeeId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 flex items-center">
                        <History className="w-5 h-5 mr-2 text-blue-600" />
                        Histórico Completo de EPIs - {employees.find(e => e.id === historyModalEmployeeId)?.name}
                    </h3>
                    <button onClick={() => setHistoryModalEmployeeId(null)} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 font-medium">EPI</th>
                                <th className="px-6 py-3 font-medium">CA</th>
                                <th className="px-6 py-3 font-medium">Data Entrega</th>
                                <th className="px-6 py-3 font-medium">Validade</th>
                                <th className="px-6 py-3 font-medium">Data Devolução</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {epiAssignments
                                .filter(a => a.employeeId === historyModalEmployeeId)
                                .sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime())
                                .map(assign => {
                                    const epi = epis.find(e => e.id === assign.epiId);
                                    const isExpired = new Date(assign.expirationDate) < new Date();
                                    return (
                                        <tr key={assign.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{assign.epiName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{epi?.ca || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">{new Date(assign.deliveryDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(assign.expirationDate).toLocaleDateString()}
                                                {isExpired && assign.status === 'Em Uso' && (
                                                    <span className="ml-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-bold">VENCIDO</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {assign.returnDate ? new Date(assign.returnDate).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                                    ${assign.status === 'Em Uso' ? (isExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800') : 'bg-gray-100 text-gray-600'}`}>
                                                    {assign.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            {epiAssignments.filter(a => a.employeeId === historyModalEmployeeId).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        Nenhum registro de EPI encontrado para este colaborador.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button 
                        onClick={() => setHistoryModalEmployeeId(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default EPIInventory;