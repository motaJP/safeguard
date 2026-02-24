import React, { useState } from 'react';
import { Truck, Wrench, Gauge, MapPin, AlertOctagon, User, ShieldCheck, Activity, TrendingUp, AlertTriangle, Plus, X, Filter, Key, FileWarning, Clock, UploadCloud, MessageSquare, Check, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { VehicleStatus, FleetEventType, FleetEvent } from '../types';
import { useData } from '../contexts/DataContext';

const Fleet: React.FC = () => {
    const { vehicles, driverStats, employees, fleetEvents, addFleetEvent, updateDriverTelemetry, registerFleetFeedback } = useData();
    const [activeTab, setActiveTab] = useState<'VEHICLES' | 'DRIVERS' | 'EVENTS'>('DRIVERS');
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [eventFilter, setEventFilter] = useState<'ALL' | 'AUTH' | 'INFRACTION' | 'PENDING_FEEDBACK'>('ALL');

    // Event Modal State
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [newEvent, setNewEvent] = useState({
        employeeId: '',
        type: FleetEventType.NO_AUTH,
        description: '',
        pointsDeducted: 0
    });

    // Feedback Modal State
    const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<FleetEvent | null>(null);
    const [feedbackNotes, setFeedbackNotes] = useState('');

    // Telemetry Modal State
    const [isTelemetryModalOpen, setIsTelemetryModalOpen] = useState(false);
    const [telemetryForm, setTelemetryForm] = useState({
        employeeId: '',
        score: 100,
        distance: 0,
    });

    // Helpers
    const getDriverName = (id: string) => employees.find(e => e.id === id)?.name || 'Desconhecido';
    
    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-600 bg-emerald-50';
        if (score >= 70) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    const getAuthColor = (rate: number) => {
        if (rate >= 95) return 'text-emerald-600';
        if (rate >= 80) return 'text-amber-600';
        return 'text-red-600';
    };

    const handleRegisterEvent = (e: React.FormEvent) => {
        e.preventDefault();
        
        let points = 5; // Default penalty
        if (newEvent.type === FleetEventType.SPEEDING) points = 10;
        if (newEvent.type === FleetEventType.HARSH_BRAKING) points = 2;
        if (newEvent.type === FleetEventType.NO_AUTH) points = 0; // Handled separately in context

        addFleetEvent({
            ...newEvent,
            date: new Date().toISOString().split('T')[0],
            pointsDeducted: points
        });
        setIsEventModalOpen(false);
        setNewEvent({ employeeId: '', type: FleetEventType.NO_AUTH, description: '', pointsDeducted: 0 });
    };

    const handleUpdateTelemetry = (e: React.FormEvent) => {
        e.preventDefault();
        if (telemetryForm.employeeId) {
            updateDriverTelemetry(telemetryForm.employeeId, {
                score: Number(telemetryForm.score),
                distance: Number(telemetryForm.distance),
                // Auth rate removed from manual input
            });
            setIsTelemetryModalOpen(false);
            setTelemetryForm({ employeeId: '', score: 100, distance: 0 });
        }
    };

    const handleSaveFeedback = () => {
        if (selectedEventForFeedback && feedbackNotes) {
            registerFleetFeedback(selectedEventForFeedback.id, feedbackNotes);
            setSelectedEventForFeedback(null);
            setFeedbackNotes('');
        }
    };

    const filteredEvents = fleetEvents.filter(e => {
        if (eventFilter === 'ALL') return true;
        if (eventFilter === 'AUTH') return e.type === FleetEventType.NO_AUTH;
        if (eventFilter === 'INFRACTION') return e.type !== FleetEventType.NO_AUTH;
        if (eventFilter === 'PENDING_FEEDBACK') return !e.feedbackGiven;
        return true;
    });

    const pendingFeedbackCount = fleetEvents.filter(e => !e.feedbackGiven).length;

    const renderDriverDetails = () => {
        if (!selectedDriver) return null;
        const stats = driverStats.find(d => d.employeeId === selectedDriver);
        if (!stats) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                        <h3 className="font-bold text-gray-800 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-blue-600"/>
                            Histórico de Telemetria: {getDriverName(stats.employeeId)}
                        </h3>
                        <button onClick={() => setSelectedDriver(null)} className="text-gray-400 hover:text-gray-600">Fechar</button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="text-xs text-blue-600 font-medium">Score Atual</p>
                                <p className="text-2xl font-bold text-blue-800">{stats.telemetryScore}</p>
                            </div>
                            <div className="bg-emerald-50 p-4 rounded-lg">
                                <p className="text-xs text-emerald-600 font-medium">Taxa Autenticação</p>
                                <p className="text-2xl font-bold text-emerald-800">{stats.authenticationRate}%</p>
                            </div>
                             <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-xs text-gray-600 font-medium">KM no Mês</p>
                                <p className="text-2xl font-bold text-gray-800">{stats.distanceDriven}</p>
                            </div>
                        </div>
                        <div className="h-64">
                            <p className="text-sm font-medium text-gray-500 mb-2">Evolução do Score (Últimos Meses)</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.history} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" />
                                    <YAxis domain={[0, 100]} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="score" stroke="#2563eb" fillOpacity={1} fill="url(#colorScore)" name="Score" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Gestão de Frota e Condutores</h2>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
                    <button 
                        onClick={() => setActiveTab('DRIVERS')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'DRIVERS' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Motoristas & Telemetria
                    </button>
                    <button 
                        onClick={() => setActiveTab('EVENTS')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'EVENTS' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Eventos & Autenticação
                    </button>
                    <button 
                        onClick={() => setActiveTab('VEHICLES')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'VEHICLES' ? 'bg-slate-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        Veículos
                    </button>
                </div>
            </div>

            {activeTab === 'DRIVERS' && (
                <div className="space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                             <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                <Activity className="w-6 h-6" />
                             </div>
                             <div>
                                 <p className="text-sm text-gray-500">Média Score Geral</p>
                                 <h3 className="text-2xl font-bold text-gray-800">
                                    {Math.round(driverStats.reduce((acc, curr) => acc + curr.telemetryScore, 0) / (driverStats.length || 1))}
                                 </h3>
                             </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                             <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mr-4">
                                <ShieldCheck className="w-6 h-6" />
                             </div>
                             <div>
                                 <p className="text-sm text-gray-500">Identificação Correta</p>
                                 <h3 className="text-2xl font-bold text-gray-800">
                                     {Math.round(driverStats.reduce((acc, curr) => acc + curr.authenticationRate, 0) / (driverStats.length || 1))}%
                                 </h3>
                             </div>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center">
                             <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-4">
                                <AlertTriangle className="w-6 h-6" />
                             </div>
                             <div>
                                 <p className="text-sm text-gray-500">Condutores em Risco</p>
                                 <h3 className="text-2xl font-bold text-gray-800">
                                     {driverStats.filter(d => d.riskLevel === 'Alto').length}
                                 </h3>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <span className="font-semibold text-gray-800">Monitoramento de Condutores</span>
                            <button 
                                onClick={() => setIsTelemetryModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm transition-colors"
                            >
                                <UploadCloud className="w-4 h-4 mr-2" />
                                Lançar Dados Telemetria
                            </button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Motorista</th>
                                    <th className="px-6 py-3 font-medium">CNH / Categoria</th>
                                    <th className="px-6 py-3 font-medium text-center">Score Telemetria</th>
                                    <th className="px-6 py-3 font-medium text-center">Autenticação (%)</th>
                                    <th className="px-6 py-3 font-medium">Nível de Risco</th>
                                    <th className="px-6 py-3 font-medium text-right">Detalhes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {driverStats.map((stats) => (
                                    <tr key={stats.employeeId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold mr-3">
                                                    {getDriverName(stats.employeeId).charAt(0)}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{getDriverName(stats.employeeId)}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {stats.cnh} <span className="text-xs bg-gray-100 px-1 rounded ml-1 font-bold">{stats.cnhCategory}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreColor(stats.telemetryScore)}`}>
                                                {stats.telemetryScore}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center text-sm font-medium">
                                                <ShieldCheck className={`w-4 h-4 mr-1 ${getAuthColor(stats.authenticationRate)}`} />
                                                <span className={getAuthColor(stats.authenticationRate)}>{stats.authenticationRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                ${stats.riskLevel === 'Baixo' ? 'bg-green-100 text-green-800' : 
                                                  stats.riskLevel === 'Médio' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                {stats.riskLevel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedDriver(stats.employeeId)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center justify-end"
                                            >
                                                <TrendingUp className="w-4 h-4 mr-1"/> Ver Histórico
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'EVENTS' && (
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-4">
                                <span className="font-semibold text-gray-800">Registro de Eventos e Falhas de Autenticação</span>
                                <div className="flex bg-gray-200 rounded p-0.5">
                                    <button 
                                        onClick={() => setEventFilter('ALL')}
                                        className={`px-3 py-1 text-xs font-bold rounded ${eventFilter === 'ALL' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                                    >
                                        Todos
                                    </button>
                                    <button 
                                        onClick={() => setEventFilter('AUTH')}
                                        className={`px-3 py-1 text-xs font-bold rounded flex items-center ${eventFilter === 'AUTH' ? 'bg-white shadow text-red-600' : 'text-gray-500'}`}
                                    >
                                        <Key className="w-3 h-3 mr-1" />
                                        Autenticação
                                    </button>
                                    <button 
                                        onClick={() => setEventFilter('INFRACTION')}
                                        className={`px-3 py-1 text-xs font-bold rounded flex items-center ${eventFilter === 'INFRACTION' ? 'bg-white shadow text-amber-600' : 'text-gray-500'}`}
                                    >
                                        <FileWarning className="w-3 h-3 mr-1" />
                                        Infrações
                                    </button>
                                     <button 
                                        onClick={() => setEventFilter('PENDING_FEEDBACK')}
                                        className={`px-3 py-1 text-xs font-bold rounded flex items-center ${eventFilter === 'PENDING_FEEDBACK' ? 'bg-white shadow text-purple-600' : 'text-gray-500'}`}
                                    >
                                        <MessageSquare className="w-3 h-3 mr-1" />
                                        Pendentes ({pendingFeedbackCount})
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsEventModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 shadow-sm transition-colors"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Registrar Ocorrência
                            </button>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                            {filteredEvents.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <p>Nenhum evento encontrado para o filtro selecionado.</p>
                                </div>
                            ) : (
                                filteredEvents.map((event) => (
                                    <div key={event.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start">
                                            <div className={`p-3 rounded-lg mr-4 ${
                                                event.type === FleetEventType.NO_AUTH ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                            }`}>
                                                {event.type === FleetEventType.NO_AUTH ? <Key className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-bold text-gray-800">{event.type}</p>
                                                    {event.type === FleetEventType.NO_AUTH && (
                                                        <span className="text-[10px] bg-red-50 text-red-600 border border-red-100 px-1.5 rounded font-bold uppercase">
                                                            Falha Crítica
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-0.5">
                                                    <span className="font-medium text-gray-900">{event.employeeName}</span> - {event.description}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    {new Date(event.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                {event.type !== FleetEventType.NO_AUTH && (
                                                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded block mb-1">
                                                        -{event.pointsDeducted} pts no Score
                                                    </span>
                                                )}
                                                {event.type === FleetEventType.NO_AUTH && (
                                                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded block mb-1">
                                                        Impacta Autenticação
                                                    </span>
                                                )}
                                            </div>
                                            
                                            {/* Feedback Action */}
                                            {event.feedbackGiven ? (
                                                 <div className="flex flex-col items-center px-3 py-1 rounded bg-green-50 border border-green-100">
                                                    <div className="flex items-center text-xs font-bold text-green-700">
                                                        <CheckCircle2 className="w-3 h-3 mr-1"/>
                                                        Feedback OK
                                                    </div>
                                                    <span className="text-[10px] text-green-600">
                                                        {new Date(event.feedbackDate || '').toLocaleDateString()}
                                                    </span>
                                                 </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setSelectedEventForFeedback(event)}
                                                    className="flex items-center px-3 py-1.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors text-xs font-bold"
                                                >
                                                    <MessageSquare className="w-3 h-3 mr-1.5" />
                                                    Dar Feedback
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'VEHICLES' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {vehicles.map((vehicle) => (
                     <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                         <div className="p-5">
                             <div className="flex justify-between items-start">
                                 <div className="flex items-center justify-center w-12 h-12 bg-slate-100 rounded-lg text-slate-600">
                                     <Truck className="w-6 h-6"/>
                                 </div>
                                 <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                     vehicle.status === VehicleStatus.DISPONIVEL ? 'bg-green-100 text-green-700' :
                                     vehicle.status === VehicleStatus.MANUTENCAO ? 'bg-amber-100 text-amber-700' :
                                     vehicle.status === VehicleStatus.EM_USO ? 'bg-blue-100 text-blue-700' :
                                     'bg-red-100 text-red-700'
                                 }`}>
                                     {vehicle.status}
                                 </span>
                             </div>
                             <h3 className="mt-4 text-lg font-bold text-gray-800">{vehicle.model}</h3>
                             <p className="text-sm text-gray-500 font-mono tracking-wider">{vehicle.plate}</p>
 
                             <div className="mt-4 space-y-2">
                                 <div className="flex items-center text-sm text-gray-600">
                                     <Gauge className="w-4 h-4 mr-2 text-gray-400" />
                                     {vehicle.mileage.toLocaleString()} km
                                 </div>
                                 <div className="flex items-center text-sm text-gray-600">
                                     <Wrench className="w-4 h-4 mr-2 text-gray-400" />
                                     Manut: {new Date(vehicle.lastMaintenance).toLocaleDateString()}
                                 </div>
                                 {vehicle.status === VehicleStatus.EM_USO && (
                                      <div className="flex items-center text-sm text-blue-600">
                                         <MapPin className="w-4 h-4 mr-2" />
                                         Em rota - SP &gt; RJ
                                     </div>
                                 )}
                             </div>
                         </div>
                         {vehicle.status === VehicleStatus.MANUTENCAO && (
                             <div className="bg-amber-50 px-5 py-2 text-xs text-amber-700 border-t border-amber-100 flex items-center">
                                 <AlertOctagon className="w-3 h-3 mr-2"/>
                                 Oficina Central - Previsão 25/10
                             </div>
                         )}
                     </div>
                 ))}
             </div>
            )}

            {renderDriverDetails()}

             {/* Modal for Event Registration */}
             {isEventModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Registrar Infração / Ocorrência</h3>
                             <button onClick={() => setIsEventModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleRegisterEvent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Motorista</label>
                                <select 
                                    className="w-full border rounded-lg p-2"
                                    required
                                    value={newEvent.employeeId}
                                    onChange={e => setNewEvent({...newEvent, employeeId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {driverStats.map(d => (
                                        <option key={d.employeeId} value={d.employeeId}>{getDriverName(d.employeeId)}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de Evento</label>
                                <select 
                                    className="w-full border rounded-lg p-2"
                                    value={newEvent.type}
                                    onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                                >
                                    {Object.values(FleetEventType).map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Observações</label>
                                <textarea 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    rows={3}
                                    value={newEvent.description}
                                    onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                                    placeholder="Detalhes do ocorrido..."
                                />
                            </div>
                            <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800">
                                <p>Nota: O registro deste evento impactará automaticamente o histórico do motorista. Não esqueça de realizar o feedback posteriormente.</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Registrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Manual Telemetry Entry */}
            {isTelemetryModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Lançamento de Telemetria</h3>
                             <button onClick={() => setIsTelemetryModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateTelemetry} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Motorista</label>
                                <select 
                                    className="w-full border rounded-lg p-2"
                                    required
                                    value={telemetryForm.employeeId}
                                    onChange={e => setTelemetryForm({...telemetryForm, employeeId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Score (0-100)</label>
                                    <input 
                                        type="number" 
                                        className="w-full border rounded-lg p-2"
                                        required
                                        min="0"
                                        max="100"
                                        value={telemetryForm.score}
                                        onChange={e => setTelemetryForm({...telemetryForm, score: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">KM Rodados (Mês)</label>
                                    <input 
                                        type="number" 
                                        className="w-full border rounded-lg p-2"
                                        required
                                        min="0"
                                        value={telemetryForm.distance}
                                        onChange={e => setTelemetryForm({...telemetryForm, distance: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
                                <p>A Taxa de Autenticação é calculada automaticamente baseada nos eventos diários registrados na aba "Eventos".</p>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setIsTelemetryModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button type="submit" className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-800">Atualizar Dados</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal for Feedback */}
            {selectedEventForFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2 text-purple-600"/>
                                Registrar Feedback ao Condutor
                            </h3>
                             <button onClick={() => setSelectedEventForFeedback(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                             <p className="text-xs text-gray-500 uppercase font-bold mb-1">Evento</p>
                             <p className="text-sm text-gray-800 font-medium">{selectedEventForFeedback.type}</p>
                             <p className="text-xs text-gray-600 mt-1">{selectedEventForFeedback.description}</p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Notas do Feedback / Tratativa</label>
                                <textarea 
                                    className="w-full border rounded-lg p-2" 
                                    required
                                    rows={4}
                                    placeholder="Descreva o que foi conversado com o motorista e as ações acordadas..."
                                    value={feedbackNotes}
                                    onChange={e => setFeedbackNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setSelectedEventForFeedback(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                                <button 
                                    onClick={handleSaveFeedback} 
                                    disabled={!feedbackNotes}
                                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
                                >
                                    Confirmar Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fleet;