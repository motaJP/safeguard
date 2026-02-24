import React, { useState, useEffect, useRef } from 'react';
import { 
    Sparkles, X, MessageSquare, ChevronRight, AlertTriangle, 
    CheckCircle, ArrowRight, Activity, Loader2
} from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { IncidentStatus, ASOStatus, VehicleStatus, IncidentSeverity } from '../types';

interface Insight {
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    actionLabel?: string;
    module?: string;
}

const AIAssistant: React.FC = () => {
    const { 
        accidents, 
        epis, 
        employees, 
        inspections, 
        driverStats,
        vehicles,
        trainingRecords 
    } = useData();

    const [isOpen, setIsOpen] = useState(false);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([
        { role: 'ai', text: 'Olá! Sou seu assistente SafeGuard. Estou analisando os dados da empresa em tempo real para encontrar processos que precisam da sua atenção.' }
    ]);

    // O "Cérebro" do Assistente - Analisa os dados do contexto
    const analyzeSystem = () => {
        setIsThinking(true);
        const newInsights: Insight[] = [];

        // 1. Análise de Acidentes
        const openAccidents = accidents.filter(a => a.status === IncidentStatus.ABERTO);
        const noRootCause = accidents.filter(a => !a.rootCauseAnalysis && a.status !== IncidentStatus.ABERTO);
        
        if (openAccidents.length > 0) {
            newInsights.push({
                id: 'acc-1',
                type: 'critical',
                message: `${openAccidents.length} acidente(s) com status "Aberto" precisam de classificação imediata.`,
                module: 'Acidentes'
            });
        }
        if (noRootCause.length > 0) {
            newInsights.push({
                id: 'acc-2',
                type: 'warning',
                message: `${noRootCause.length} ocorrência(s) estão sem Análise de Causa Raiz preenchida.`,
                module: 'Acidentes'
            });
        }

        // 2. Análise de EPIs
        const lowStock = epis.filter(e => e.stock < e.minStock);
        if (lowStock.length > 0) {
            newInsights.push({
                id: 'epi-1',
                type: 'critical',
                message: `${lowStock.length} itens de EPI estão abaixo do estoque mínimo. Reposição urgente necessária.`,
                module: 'EPIs'
            });
        }

        // 3. Análise de RH (ASO e Status)
        const expiredASO = employees.filter(e => e.asoStatus === ASOStatus.VENCIDO && e.status === 'Ativo');
        const warningASO = employees.filter(e => e.asoStatus === ASOStatus.A_VENCER && e.status === 'Ativo');

        if (expiredASO.length > 0) {
            newInsights.push({
                id: 'rh-1',
                type: 'critical',
                message: `${expiredASO.length} colaborador(es) ativo(s) com ASO VENCIDO. Risco legal alto.`,
                module: 'RH'
            });
        }
        if (warningASO.length > 0) {
            newInsights.push({
                id: 'rh-2',
                type: 'info',
                message: `${warningASO.length} ASOs vencem em breve. Agende os exames periódicos.`,
                module: 'RH'
            });
        }

        // 4. Análise de Treinamentos (NOVO)
        const now = new Date();
        const expiredTrainings = trainingRecords.filter(r => r.expirationDate && new Date(r.expirationDate) < now);
        const nearExpiryTrainings = trainingRecords.filter(r => {
            if (!r.expirationDate) return false;
            const exp = new Date(r.expirationDate);
            const diffDays = (exp.getTime() - now.getTime()) / (1000 * 3600 * 24);
            return diffDays > 0 && diffDays < 30;
        });

        if (expiredTrainings.length > 0) {
            newInsights.push({
                id: 'train-1',
                type: 'critical',
                message: `${expiredTrainings.length} treinamento(s) obrigatório(s) estão vencidos. Reciclagem necessária.`,
                module: 'Treinamentos'
            });
        }
        if (nearExpiryTrainings.length > 0) {
            newInsights.push({
                id: 'train-2',
                type: 'warning',
                message: `${nearExpiryTrainings.length} treinamento(s) vencem nos próximos 30 dias.`,
                module: 'Treinamentos'
            });
        }

        // 5. Frota e Motoristas
        const riskyDrivers = driverStats.filter(d => d.riskLevel === 'Alto');
        if (riskyDrivers.length > 0) {
            newInsights.push({
                id: 'fleet-1',
                type: 'warning',
                message: `${riskyDrivers.length} motorista(s) classificado(s) com "Alto Risco" baseados na telemetria. Sugiro reciclagem.`,
                module: 'Frota'
            });
        }

        // 6. Inspeções
        const criticalInspections = inspections.filter(i => i.compliance < 70);
        if (criticalInspections.length > 0) {
            newInsights.push({
                id: 'ins-1',
                type: 'warning',
                message: `${criticalInspections.length} inspeção(ões) recente(s) tiveram conformidade crítica (<70%).`,
                module: 'Inspeções'
            });
        }

        setTimeout(() => {
            setInsights(newInsights);
            setIsThinking(false);
            if (newInsights.length > 0) {
                setMessages(prev => [...prev, { 
                    role: 'ai', 
                    text: `Concluí a varredura. Encontrei ${newInsights.length} pontos de atenção prioritários no sistema.` 
                }]);
            } else {
                setMessages(prev => [...prev, { 
                    role: 'ai', 
                    text: `Ótimas notícias! Não encontrei pendências críticas no momento. O sistema está saudável.` 
                }]);
            }
        }, 1500); // Simula processamento
    };

    useEffect(() => {
        if (isOpen && insights.length === 0) {
            analyzeSystem();
        }
    }, [isOpen]);

    const getInsightColor = (type: string) => {
        switch(type) {
            case 'critical': return 'border-red-200 bg-red-50 text-red-800';
            case 'warning': return 'border-amber-200 bg-amber-50 text-amber-800';
            default: return 'border-blue-200 bg-blue-50 text-blue-800';
        }
    };

    const getInsightIcon = (type: string) => {
        switch(type) {
            case 'critical': return <AlertTriangle className="w-5 h-5 text-red-600" />;
            case 'warning': return <Activity className="w-5 h-5 text-amber-600" />;
            default: return <Sparkles className="w-5 h-5 text-blue-600" />;
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center
                    ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-110'} text-white`}
            >
                {isOpen ? <X className="w-6 h-6" /> : <Sparkles className="w-6 h-6 animate-pulse" />}
            </button>

            {/* Assistant Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-40 w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-slate-900 p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="bg-indigo-500/20 p-2 rounded-lg">
                                <Sparkles className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">SafeGuard Intelligence</h3>
                                <p className="text-slate-400 text-xs flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                    Monitorando Sistema
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                    msg.role === 'ai' 
                                        ? 'bg-white text-gray-700 rounded-tl-none border border-gray-100 shadow-sm' 
                                        : 'bg-indigo-600 text-white rounded-tr-none'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}

                        {/* Analysis Loading */}
                        {isThinking && (
                            <div className="flex items-center space-x-2 text-xs text-gray-400 p-2">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Processando dados e identificando padrões...</span>
                            </div>
                        )}

                        {/* Insights List */}
                        {!isThinking && insights.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Processos Pendentes</p>
                                {insights.map((insight) => (
                                    <div 
                                        key={insight.id} 
                                        className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer hover:opacity-90 transition-opacity ${getInsightColor(insight.type)}`}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {getInsightIcon(insight.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-xs uppercase opacity-80">{insight.module}</span>
                                                {insight.type === 'critical' && <span className="bg-red-200 text-red-800 text-[10px] px-1.5 rounded font-bold">URGENTE</span>}
                                            </div>
                                            <p className="text-sm font-medium leading-tight">{insight.message}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-50 self-center" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 border-t border-gray-100 bg-white">
                        <button 
                            onClick={analyzeSystem}
                            className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center"
                        >
                            <Activity className="w-4 h-4 mr-2" />
                            Revisar Sistema Novamente
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIAssistant;