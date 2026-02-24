import React, { useState, useEffect } from 'react';
import { Plus, Filter, Download, Eye, AlertTriangle, X, Trash2, Calendar, MapPin, User, FileText, Save } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IncidentSeverity, IncidentStatus, Accident } from '../types';

const Accidents: React.FC = () => {
  const { accidents, addAccident, updateAccident, deleteAccident } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccident, setSelectedAccident] = useState<Accident | null>(null);
  
  // Analysis State for Detail View
  const [analysisText, setAnalysisText] = useState('');

  // Form State
  const [newAccident, setNewAccident] = useState({
    date: '',
    description: '',
    location: '',
    severity: IncidentSeverity.LEVE,
    status: IncidentStatus.ABERTO,
    involvedEmployee: ''
  });

  // Update local analysis state when selected accident changes
  useEffect(() => {
      if (selectedAccident) {
          setAnalysisText(selectedAccident.rootCauseAnalysis || '');
      }
  }, [selectedAccident]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccident(newAccident);
    setIsModalOpen(false);
    // Reset form
    setNewAccident({
        date: '',
        description: '',
        location: '',
        severity: IncidentSeverity.LEVE,
        status: IncidentStatus.ABERTO,
        involvedEmployee: ''
    });
  };

  const handleSaveAnalysis = () => {
      if (selectedAccident) {
          updateAccident(selectedAccident.id, { 
              rootCauseAnalysis: analysisText,
              // If status is OPEN, move to ANALYSIS automatically when saving analysis
              status: selectedAccident.status === IncidentStatus.ABERTO ? IncidentStatus.EM_ANALISE : selectedAccident.status
          });
          // Update local selected object to reflect changes immediately in UI
          setSelectedAccident({ 
              ...selectedAccident, 
              rootCauseAnalysis: analysisText,
              status: selectedAccident.status === IncidentStatus.ABERTO ? IncidentStatus.EM_ANALISE : selectedAccident.status
          });
      }
  };

  const handleDelete = () => {
      if (selectedAccident && window.confirm('Tem certeza que deseja remover este registro?')) {
          deleteAccident(selectedAccident.id);
          setSelectedAccident(null);
      }
  };

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.LEVE: return 'bg-blue-100 text-blue-800';
      case IncidentSeverity.MODERADO: return 'bg-amber-100 text-amber-800';
      case IncidentSeverity.GRAVE: return 'bg-red-100 text-red-800';
      case IncidentSeverity.FATAL: return 'bg-black text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.ABERTO: return 'bg-red-50 text-red-600 border border-red-200';
      case IncidentStatus.EM_ANALISE: return 'bg-blue-50 text-blue-600 border border-blue-200';
      case IncidentStatus.PLANO_ACAO: return 'bg-purple-50 text-purple-600 border border-purple-200';
      case IncidentStatus.CONCLUIDO: return 'bg-green-50 text-green-600 border border-green-200';
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestão de Acidentes e Incidentes</h2>
          <p className="text-gray-500 text-sm">Registro, análise e acompanhamento de ocorrências.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium transition-colors shadow-sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Registro
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center text-gray-500 text-sm font-medium">
          <Filter className="w-4 h-4 mr-2" />
          Filtros:
        </div>
        <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2">
          <option>Todos os Status</option>
          <option>Aberto</option>
          <option>Em Análise</option>
        </select>
        <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2">
          <option>Todas as Gravidades</option>
          <option>Leve</option>
          <option>Grave</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição / Local</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Colaborador</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Gravidade</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {accidents.map((accident) => (
              <tr key={accident.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedAccident(accident)}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{accident.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(accident.date).toLocaleDateString('pt-BR')}</td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 font-medium">{accident.description}</div>
                  <div className="text-xs text-gray-500">{accident.location}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{accident.involvedEmployee}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityBadge(accident.severity)}`}>
                    {accident.severity}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadge(accident.status)}`}>
                    {accident.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={(e) => { e.stopPropagation(); setSelectedAccident(accident); }} className="text-gray-400 hover:text-emerald-600 transition-colors">
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {accidents.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500">
                <div className="bg-gray-100 p-4 rounded-full mb-3">
                    <AlertTriangle className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-medium">Nenhum acidente registrado.</p>
                <p className="text-sm">Clique em "Novo Registro" para começar.</p>
            </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedAccident && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
                    <h3 className="font-bold text-gray-800">Detalhes da Ocorrência {selectedAccident.id}</h3>
                    <button onClick={() => setSelectedAccident(null)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Status Bar */}
                    <div className="flex justify-between items-start">
                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getSeverityBadge(selectedAccident.severity)}`}>
                            {selectedAccident.severity}
                        </span>
                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(selectedAccident.status)}`}>
                            {selectedAccident.status}
                        </span>
                    </div>

                    {/* Basic Info */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-1">Ocorrido</h4>
                        <p className="text-gray-800 font-medium text-lg">{selectedAccident.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                                <p className="text-xs text-gray-500">Data</p>
                                <p className="text-sm font-medium text-gray-800">{new Date(selectedAccident.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                         <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                                <p className="text-xs text-gray-500">Local</p>
                                <p className="text-sm font-medium text-gray-800">{selectedAccident.location}</p>
                            </div>
                        </div>
                    </div>

                     <div className="flex items-center p-3 border border-gray-100 rounded-lg">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Colaborador Envolvido</p>
                            <p className="text-sm font-bold text-gray-800">{selectedAccident.involvedEmployee}</p>
                        </div>
                    </div>

                    {/* Root Cause Analysis Section */}
                    <div className="border-t border-gray-100 pt-4">
                        <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-emerald-600"/>
                            Análise de Causa Raiz
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">Descreva detalhadamente as causas e fatores contribuintes.</p>
                        <textarea 
                            className="w-full border rounded-lg p-3 text-sm focus:ring-emerald-500 focus:border-emerald-500 min-h-[120px]"
                            placeholder="Digite a análise da investigação aqui..."
                            value={analysisText}
                            onChange={(e) => setAnalysisText(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                             <button 
                                onClick={handleSaveAnalysis}
                                className="text-xs flex items-center bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-200 font-medium"
                             >
                                 <Save className="w-3 h-3 mr-1" />
                                 Salvar Análise
                             </button>
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-between shrink-0">
                    <button onClick={handleDelete} className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir Registro
                    </button>
                    <button onClick={() => setSelectedAccident(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300">
                        Fechar
                    </button>
                </div>
            </div>
          </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">Novo Registro de Ocorrência</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição do Ocorrido</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            value={newAccident.description}
                            onChange={(e) => setNewAccident({...newAccident, description: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input 
                                required
                                type="date" 
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                value={newAccident.date}
                                onChange={(e) => setNewAccident({...newAccident, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Local</label>
                            <input 
                                required
                                type="text" 
                                className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                                value={newAccident.location}
                                onChange={(e) => setNewAccident({...newAccident, location: e.target.value})}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Colaborador Envolvido</label>
                        <input 
                            required
                            type="text" 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            value={newAccident.involvedEmployee}
                            onChange={(e) => setNewAccident({...newAccident, involvedEmployee: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gravidade</label>
                        <select 
                            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                            value={newAccident.severity}
                            onChange={(e) => setNewAccident({...newAccident, severity: e.target.value as IncidentSeverity})}
                        >
                            {Object.values(IncidentSeverity).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                        >
                            Salvar Registro
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default Accidents;